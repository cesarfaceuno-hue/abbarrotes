import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;
let dailyQuotaExhausted = false;
let lastQuotaCheckTime = 0;

/**
 * Returns an initialized GoogleGenAI client.
 */
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

/**
 * Checks if Gemini is configured.
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Resets the daily quota exhaustion flag.
 */
export function resetGeminiQuota(): void {
  dailyQuotaExhausted = false;
  lastQuotaCheckTime = 0;
}

/**
 * Diagnostic status for Gemini configuration.
 */
export function getGeminiStatus() {
  const key = process.env.GEMINI_API_KEY;
  return {
    configured: Boolean(key),
    model: 'gemini-2.0-flash',
    quotaExhausted: dailyQuotaExhausted,
  };
}

/**
 * Utility to wait for a specific duration.
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates content with exponential backoff retry logic for transient errors (503, 429).
 * Respects suggested retryDelay from the API if present.
 */
export async function generateContentWithRetry(
  params: GenerateContentParameters,
  maxRetries: number = 2,
  initialDelayMs: number = 500,
  overrideClient?: any
): Promise<GenerateContentResponse> {
  const client = overrideClient || getGeminiClient();
  if (!client) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  // Fast-fail if we already know the daily quota is exhausted (concurrency protection)
  const now = Date.now();
  if (dailyQuotaExhausted && (now - lastQuotaCheckTime < 3600000)) {
    throw new Error("Límite diario de IA alcanzado. Por favor, intenta de nuevo mañana.");
  }

  let lastError: any;
  let currentDelay = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await client.models.generateContent(params);
      // Success: clear exhaustion flag if it was set (safety)
      dailyQuotaExhausted = false;
      return result;
    } catch (error: any) {
      lastError = error;
      
      const status = error.status || (error.message?.includes('503') ? 503 : error.message?.includes('429') ? 429 : 500);
      const message = error.message || "";
      
      // 1. Dynamic Daily Quota Detection (Source of truth: Server message)
      const isDailyQuota = message.includes("GenerateRequestsPerDay") || 
                           message.includes("generate_content_free_tier_requests") ||
                           (message.includes("Quota exceeded") && !message.includes("per minute"));
      
      if (isDailyQuota) {
        dailyQuotaExhausted = true;
        lastQuotaCheckTime = Date.now();
        console.error(`[GEMINI-QUOTA] Daily limit reached. Stopping further attempts.`);
        throw new Error("Límite diario de IA alcanzado. Por favor, intenta de nuevo mañana.");
      }
      
      // 2. Check for transient errors: 503 (Service Unavailable / High Demand) or 429 (Rate Limit)
      const isRateLimit = status === 429 || message.includes("429") || message.includes("high demand");
      const isServiceUnavailable = status === 503 || message.includes("503") || message.includes("UNAVAILABLE") || message.includes("high demand");
      
      const isTransient = (isRateLimit || isServiceUnavailable);

      if (isTransient && attempt < maxRetries) {
        let suggestedDelayMs = 0;
        try {
          const details = error.details || [];
          const retryInfo = details.find((d: any) => d['@type']?.includes('RetryInfo') || d.retryDelay);
          if (retryInfo && retryInfo.retryDelay) {
            const seconds = parseInt(retryInfo.retryDelay.replace('s', ''));
            if (!isNaN(seconds)) suggestedDelayMs = (seconds + 1) * 1000;
          }
        } catch (e) {}

        const waitTime = Math.max(currentDelay, suggestedDelayMs);
        
        console.log(`[GEMINI-RETRY] status:${status} | attempt:${attempt + 1}/${maxRetries} | delay:${waitTime}ms | reason:${isRateLimit ? 'RATE_LIMIT' : 'SERVICE_UNAVAILABLE'}`);
        
        await sleep(waitTime);
        if (suggestedDelayMs === 0) currentDelay *= 2; 
        continue;
      }

      // Terminal error for this call
      console.warn(`[GEMINI-UNAVAILABLE] status:${status} | fallback heuristic active. message:${message.substring(0, 100)}`);
      throw error;
    }
  }

  throw lastError;
}
