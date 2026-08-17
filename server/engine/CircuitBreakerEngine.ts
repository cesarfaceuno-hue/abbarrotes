import { db } from '../db/database.js';
import { sourceHealthService } from './SourceHealthService.js';
import { ErrorClass } from './RetryPolicyEngine.js';
import { CircuitState, SupplierSource } from '../types.js';

export interface CircuitBreakerPolicy {
  failureThreshold: number;
  cooldownMs: number;
  halfOpenMaxProbes: number;
  successThreshold: number;
  criticalErrorsOpenImmediately: ErrorClass[];
}

export interface CircuitBreakerCheckResult {
  allowRequest: boolean;
  circuitState: CircuitState;
  reason: string;
  isHalfOpenProbe: boolean;
}

export const DEFAULT_CIRCUIT_POLICY: CircuitBreakerPolicy = {
  failureThreshold: 3,
  cooldownMs: 30000, // 30 seconds default cooldown for testability
  halfOpenMaxProbes: 1,
  successThreshold: 2,
  criticalErrorsOpenImmediately: ['WAF_BLOCKED_403', 'SCHEMA_DRIFT', 'CORRUPTION_INTEGRITY'],
};

export class CircuitBreakerEngine {
  private policies: Map<string, CircuitBreakerPolicy> = new Map();
  // Concurrency lock for half-open probe: sourceId -> timestamp when locked
  private halfOpenLocks: Map<string, number> = new Map();

  public setPolicy(sourceId: string, policy: CircuitBreakerPolicy): void {
    this.policies.set(sourceId, policy);
  }

  public getPolicy(sourceId: string): CircuitBreakerPolicy {
    return this.policies.get(sourceId) || DEFAULT_CIRCUIT_POLICY;
  }

  /**
   * Comprueba si se permite ejecutar un request en la fuente según su estado de Circuit Breaker.
   * Maneja transiciones de OPEN -> HALF_OPEN (con cooldown y lock de concurrencia).
   */
  public checkCircuit(sourceId: string): CircuitBreakerCheckResult {
    const source = db.getSourceById(sourceId);
    if (!source) {
      return {
        allowRequest: true,
        circuitState: 'CLOSED',
        reason: 'Source not found, defaulting to CLOSED.',
        isHalfOpenProbe: false,
      };
    }

    let circuitState: CircuitState = source.circuitState || 'CLOSED';
    const now = Date.now();

    // Si está OPEN, verificar si ya se cumplió el cooldown para transicionar a HALF_OPEN
    if (circuitState === 'OPEN') {
      const cooldownUntil = source.cooldownUntil ? new Date(source.cooldownUntil).getTime() : 0;
      if (cooldownUntil && now >= cooldownUntil) {
        // Transición a HALF_OPEN
        circuitState = 'HALF_OPEN';
        db.updateSource(sourceId, {
          circuitState: 'HALF_OPEN',
          consecutiveSuccesses: 0,
        });
      } else {
        return {
          allowRequest: false,
          circuitState: 'OPEN',
          reason: `Circuit is OPEN. Cooldown active until ${source.cooldownUntil || 'unknown'}. Request blocked to prevent cascade failures.`,
          isHalfOpenProbe: false,
        };
      }
    }

    // Si está HALF_OPEN, verificar protección contra concurrencia (un solo probe permitido)
    if (circuitState === 'HALF_OPEN') {
      const activeLockTime = this.halfOpenLocks.get(sourceId);
      const lockExpirationWindow = 10000; // 10 segundos de expiración de lock por seguridad

      if (activeLockTime && now - activeLockTime < lockExpirationWindow) {
        return {
          allowRequest: false,
          circuitState: 'HALF_OPEN',
          reason: 'Circuit is HALF_OPEN, but another worker holds the single probe lock. Request blocked for concurrency protection.',
          isHalfOpenProbe: false,
        };
      }

      // Adquirir lock para este probe
      this.halfOpenLocks.set(sourceId, now);
      return {
        allowRequest: true,
        circuitState: 'HALF_OPEN',
        reason: 'Circuit is HALF_OPEN. Single probe granted under concurrency lock.',
        isHalfOpenProbe: true,
      };
    }

    // CLOSED
    return {
      allowRequest: true,
      circuitState: 'CLOSED',
      reason: 'Circuit is CLOSED. Normal request flow allowed.',
      isHalfOpenProbe: false,
    };
  }

  /**
   * Registra el resultado de un request (éxito o fallo) y evalúa la apertura/cierre del circuito.
   */
  public recordResult(
    sourceId: string,
    success: boolean,
    errorClass?: ErrorClass,
    errorMessage?: string
  ): { circuitState: CircuitState; transitioned: boolean; reason: string } {
    const source = db.getSourceById(sourceId);
    if (!source) {
      return { circuitState: 'CLOSED', transitioned: false, reason: 'Source not found.' };
    }

    const policy = this.getPolicy(sourceId);
    const currentState: CircuitState = source.circuitState || 'CLOSED';
    let newState: CircuitState = currentState;
    let reason = '';
    let transitioned = false;

    // Liberar lock de half-open si existía
    this.halfOpenLocks.delete(sourceId);

    if (success) {
      if (currentState === 'HALF_OPEN') {
        const successes = (source.consecutiveSuccesses || 0) + 1;
        if (successes >= policy.successThreshold) {
          newState = 'CLOSED';
          transitioned = true;
          reason = `Probe successful in HALF_OPEN. Success threshold (${policy.successThreshold}) met. Circuit CLOSED.`;
          sourceHealthService.recordRecoverySuccess(sourceId, reason);
        } else {
          db.updateSource(sourceId, { consecutiveSuccesses: successes });
          reason = `Probe successful in HALF_OPEN (${successes}/${policy.successThreshold}). Waiting for success threshold.`;
        }
      } else if (currentState === 'CLOSED') {
        // Reset or reduce consecutive failures on success
        db.updateSource(sourceId, {
          consecutiveFailures: 0,
          consecutiveSuccesses: (source.consecutiveSuccesses || 0) + 1,
        });
        reason = 'Request successful. Failure counter reset.';
      }
    } else {
      // Fallo registrado
      const failCount = (source.consecutiveFailures || 0) + 1;
      const isCritical = errorClass && policy.criticalErrorsOpenImmediately.includes(errorClass);

      if (currentState === 'HALF_OPEN') {
        // Fallo en HALF_OPEN abre inmediatamente el circuito
        newState = 'OPEN';
        transitioned = true;
        const cooldownUntil = new Date(Date.now() + policy.cooldownMs).toISOString();
        reason = `Probe failed in HALF_OPEN. Circuit re-opened immediately for ${policy.cooldownMs}ms cooldown.`;
        db.updateSource(sourceId, {
          circuitState: 'OPEN',
          consecutiveFailures: failCount,
          consecutiveSuccesses: 0,
          cooldownUntil,
        });
        sourceHealthService.recordHealthEvent(sourceId, {
          type: errorClass === 'WAF_BLOCKED_403' ? 'WAF_BLOCK' : errorClass === 'SCHEMA_DRIFT' ? 'SCHEMA_DRIFT' : 'FAILURE',
          reason,
          isolateSource: true,
          escalateToCircuitBreaker: true,
        });
      } else if (currentState === 'CLOSED') {
        if (isCritical || failCount >= policy.failureThreshold) {
          newState = 'OPEN';
          transitioned = true;
          const cooldownUntil = new Date(Date.now() + policy.cooldownMs).toISOString();
          reason = isCritical
            ? `Critical error (${errorClass}) triggered immediate CIRCUIT OPEN.`
            : `Failure threshold (${policy.failureThreshold}) exceeded (consecutive failures: ${failCount}). Circuit OPEN.`;
          
          db.updateSource(sourceId, {
            circuitState: 'OPEN',
            consecutiveFailures: failCount,
            cooldownUntil,
          });

          sourceHealthService.recordHealthEvent(sourceId, {
            type: errorClass === 'WAF_BLOCKED_403' ? 'WAF_BLOCK' : errorClass === 'SCHEMA_DRIFT' ? 'SCHEMA_DRIFT' : 'FAILURE',
            reason,
            isolateSource: isCritical,
            escalateToCircuitBreaker: true,
          });
        } else {
          db.updateSource(sourceId, { consecutiveFailures: failCount });
          reason = `Request failed (${failCount}/${policy.failureThreshold} failures before circuit open).`;
          sourceHealthService.recordHealthEvent(sourceId, {
            type: 'FAILURE',
            reason: errorMessage || 'Request failure',
            escalateToCircuitBreaker: false,
          });
        }
      }
    }

    return { circuitState: newState, transitioned, reason };
  }
}

export const circuitBreakerEngine = new CircuitBreakerEngine();
