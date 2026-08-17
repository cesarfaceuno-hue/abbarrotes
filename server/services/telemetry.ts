import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

// Telemetry State and Metrics
let lastSuccess: string | null = null;
let lastFailure: string | null = null;
let lastErrorCode: string | null = null;
let isConfigValid = false;
let isTelemetryEnabled = false;
let isHostValid = false;
let isKeyPresent = false;
let hasSentHealthcheck = false;
let pendingEventsCount = 0;

/**
 * Validates the PostHog environment configuration.
 * - POSTHOG_HOST must be a valid absolute HTTPS URL.
 * - POSTHOG_API_KEY must be present and well-formed.
 */
export function validatePostHogConfig(): boolean {
  const host = process.env.POSTHOG_HOST;
  const apiKey = process.env.POSTHOG_API_KEY;

  // 1. Check Key Presence
  if (!apiKey || apiKey.trim() === '') {
    isKeyPresent = false;
    isConfigValid = false;
    isTelemetryEnabled = false;
    return false;
  }
  isKeyPresent = true;

  // 2. Validate Host Format
  if (!host || host.trim() === '') {
    isHostValid = false;
    isConfigValid = false;
    isTelemetryEnabled = false;
    return false;
  }

  const isValidHttpsUrl = (urlStr: string) => {
    try {
      const u = new URL(urlStr);
      return u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  if (!isValidHttpsUrl(host)) {
    isHostValid = false;
    isConfigValid = false;
    isTelemetryEnabled = false;

    const errorMsg = `Invalid POSTHOG_HOST configured in environment: "${host}". Absolute HTTPS URL is required.`;
    console.warn(`⚠️ WARNING: ${errorMsg} Telemetry is disabled.`);
    return false;
  }
  isHostValid = true;

  // 3. Validate Key Format (Basic Sanity Check)
  const isKeyMalformed = !/^[a-zA-Z0-9_\-]+$/.test(apiKey) || apiKey.length < 8;
  if (isKeyMalformed) {
    isConfigValid = false;
    isTelemetryEnabled = false;

    const errorMsg = `POSTHOG_API_KEY is malformed. Only alphanumeric characters, hyphens, and underscores are allowed.`;
    console.warn(`⚠️ WARNING: ${errorMsg} Telemetry is disabled.`);
    return false;
  }

  isConfigValid = true;
  isTelemetryEnabled = true;
  return true;
}

/**
 * Lazy-loads and returns the PostHog client singleton.
 * Employs safe event listening for async client-level errors.
 */
function getPostHog(): PostHog | null {
  if (!isConfigValid) {
    validatePostHogConfig();
  }

  if (!posthogClient && isTelemetryEnabled && process.env.POSTHOG_API_KEY) {
    const host = process.env.POSTHOG_HOST;
    const apiKey = process.env.POSTHOG_API_KEY;

    try {
      posthogClient = new PostHog(apiKey, {
        host: host,
      });

      // Handle async PostHog exceptions gracefully to prevent crashes
      posthogClient.on('error', (err: any) => {
        lastFailure = new Date().toISOString();
        lastErrorCode = err?.code || err?.message || 'UNKNOWN_POSTHOG_ERROR';
        console.error('[Telemetry Client Error Handled]', err?.message || err);
      });
    } catch (err: any) {
      lastFailure = new Date().toISOString();
      lastErrorCode = err?.code || err?.message || 'INIT_ERROR';
      console.error(`[Telemetry Error] Failed to instantiate PostHog client: ${err.message}`);
      posthogClient = null;
    }
  }
  return posthogClient;
}

/**
 * Returns the sanitized health metrics of the telemetry service.
 */
export function getTelemetryHealth() {
  const host = process.env.POSTHOG_HOST;
  const apiKey = process.env.POSTHOG_API_KEY;

  const isValidHttpsUrl = (urlStr: string) => {
    try {
      const u = new URL(urlStr);
      return u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const keyPresent = !!(apiKey && apiKey.trim() !== '');
  const hostValid = !!(host && isValidHttpsUrl(host));

  let keyStatus: 'PRESENT' | 'MISSING' | 'INVALID' = 'MISSING';
  if (keyPresent) {
    const isMalformed = !/^[a-zA-Z0-9_\-]+$/.test(apiKey) || apiKey.length < 8;
    if (isMalformed || lastErrorCode === 'authentication_failed' || lastErrorCode === '401') {
      keyStatus = 'INVALID';
    } else {
      keyStatus = 'PRESENT';
    }
  }

  return {
    configured: isConfigValid,
    enabled: isTelemetryEnabled && keyPresent && hostValid,
    hostValid,
    keyPresent,
    keyStatus,
    lastSuccess,
    lastFailure,
    pending: pendingEventsCount,
    lastErrorCode,
  };
}

/**
 * Dispatches the safe telemetry healthcheck event exactly once.
 */
export function sendHealthcheckEvent() {
  if (isTelemetryEnabled && !hasSentHealthcheck) {
    console.log('[Telemetry] Dispatching posthog_ingestion_healthcheck event...');
    Telemetry.track('system-health-check', 'posthog_ingestion_healthcheck', {
      service: 'Abarrotes IA Telemetry Service',
      timestamp: new Date().toISOString(),
      test: true,
    });
    hasSentHealthcheck = true;

    // Force flush to test ingestion route immediately
    flushTelemetry().catch((err: any) => {
      console.error('[Telemetry Error] Initial healthcheck flush failed:', err.message || err);
    });
  }
}

/**
 * Flushes all pending buffered events to the PostHog server.
 */
export async function flushTelemetry(): Promise<void> {
  if (posthogClient) {
    try {
      if (typeof posthogClient.flush === 'function') {
        await posthogClient.flush();
      }
      lastSuccess = new Date().toISOString();
      pendingEventsCount = 0;
    } catch (err: any) {
      lastFailure = new Date().toISOString();
      lastErrorCode = err?.code || err?.message || 'FLUSH_ERROR';
      console.error('[Telemetry Error] Failed to flush telemetry:', err.message || err);
    }
  }
}

/**
 * Shuts down the telemetry client singleton and stops pollers cleanly.
 */
export async function shutdownTelemetry(): Promise<void> {
  if (posthogClient) {
    try {
      if (typeof (posthogClient as any)._shutdown === 'function') {
        await (posthogClient as any)._shutdown();
      } else if (typeof (posthogClient as any).shutdown === 'function') {
        await (posthogClient as any).shutdown();
      }
    } catch (err: any) {
      console.error('[Telemetry Error] Failed to shutdown telemetry:', err.message || err);
    } finally {
      posthogClient = null;
    }
  }
}

export const Telemetry = {
  /**
   * Tracks a custom system event with standardized properties.
   */
  track(distinctId: string, event: string, properties: any = {}, isAgent: boolean = false) {
    const ph = getPostHog();
    if (ph && isTelemetryEnabled) {
      try {
        pendingEventsCount++;
        ph.capture({
          distinctId,
          event,
          properties: {
            ...properties,
            environment: process.env.NODE_ENV || 'development',
            system: 'Abarrotes IA - Master Architecture',
            isAgent,
          },
        });
      } catch (err: any) {
        lastFailure = new Date().toISOString();
        lastErrorCode = err?.code || err?.message || 'CAPTURE_ERROR';
        console.error('[Telemetry Error] Failed to capture event:', err.message || err);
      }
    } else {
      // Production must report unavailability without mocking success silently
      if (process.env.NODE_ENV === 'production') {
        console.log(`[Telemetry-Local] ${event}: telemetry unavailable`);
      } else {
        console.log(`[Telemetry-Mock] ${event} (isAgent:${isAgent}):`, properties);
      }
    }
  },

  /**
   * Tracks an autonomous agent action.
   */
  trackAgentAction(agentName: string, action: string, metadata: any = {}) {
    this.track('system-agent-orchestrator', `agent_${action}`, {
      agent: agentName,
      ...metadata,
    }, true);
  },

  /**
   * Tracks a security audit event.
   */
  trackSecurityEvent(event: string, metadata: any = {}) {
    this.track('system-security-monitor', `security_${event}`, {
      ...metadata,
      severity: 'critical',
    });
  }
};
