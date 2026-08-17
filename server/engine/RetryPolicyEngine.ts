import { sourceHealthService } from './SourceHealthService.js';
import { recoveryEngine } from './RecoveryEngine.js';
import { db } from '../db/database.js';

export type ErrorClass =
  | 'PARTIAL_RESPONSE_206'
  | 'ASYNC_RESPONSE_202'
  | 'WAF_BLOCKED_403'
  | 'PRECONDITION_412'
  | 'RATE_LIMIT_429'
  | 'SERVER_ERROR_5XX'
  | 'TIMEOUT'
  | 'EMPTY_DATA'
  | 'PARSE_ERROR'
  | 'SCHEMA_DRIFT'
  | 'CORRUPTION_INTEGRITY'
  | 'UNKNOWN_ERROR';

export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterRatio: number;
  respectRetryAfter: boolean;
}

export interface RetryDecision {
  retry: boolean;
  attempt: number;
  delayMs: number;
  reason: string;
  errorClass: ErrorClass;
  escalateToCircuitBreaker: boolean;
  haltPersistence: boolean;
  isolateSource: boolean;
  openRecoveryState: boolean;
}

export interface EvaluateRetryInput {
  sourceId: string;
  attempt: number;
  errorMessage?: string;
  httpStatus?: number;
  retryAfterSeconds?: number;
  observedDataCount?: number;
  expectedFields?: string[];
  actualFields?: string[];
  customPolicy?: Partial<RetryPolicy>;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitterRatio: 0.2,
  respectRetryAfter: true,
};

export class RetryPolicyEngine {
  private defaultPolicy: RetryPolicy;

  constructor(policy: RetryPolicy = DEFAULT_RETRY_POLICY) {
    this.defaultPolicy = policy;
  }

  /**
   * Clasifica el error según la matriz obligatoria de Hilo 20.9.2
   */
  public classifyError(input: EvaluateRetryInput): ErrorClass {
    const msg = (input.errorMessage || '').toLowerCase();
    const status = input.httpStatus;

    // 1. SCHEMA_DRIFT (Máxima prioridad de aislamiento)
    if (
      msg.includes('schema_drift') ||
      msg.includes('schema drift') ||
      msg.includes('structure changed') ||
      msg.includes('missing mandatory field')
    ) {
      return 'SCHEMA_DRIFT';
    }

    if (input.expectedFields && input.actualFields) {
      const requiredFields = ['name', 'price', 'sku', 'availability'];
      const missingRequired = requiredFields.filter(
        (f) => input.expectedFields?.includes(f) && !input.actualFields?.includes(f)
      );
      if (missingRequired.length > 0) {
        return 'SCHEMA_DRIFT';
      }
    }

    // 2. CORRUPTION_INTEGRITY
    if (
      msg.includes('corrupt') ||
      msg.includes('checksum mismatch') ||
      msg.includes('hash mismatch') ||
      msg.includes('integrity failure')
    ) {
      return 'CORRUPTION_INTEGRITY';
    }

    // 3. WAF_BLOCKED_403
    if (
      status === 403 ||
      msg.includes('403') ||
      msg.includes('waf') ||
      msg.includes('cloudflare') ||
      msg.includes('forbidden') ||
      msg.includes('access denied') ||
      msg.includes('blocked')
    ) {
      return 'WAF_BLOCKED_403';
    }

    // 4. PARSE_ERROR
    if (msg.includes('parse_error') || msg.includes('json parse') || msg.includes('syntaxerror') || msg.includes('parsing failed')) {
      return 'PARSE_ERROR';
    }

    // 5. RATE_LIMIT_429
    if (status === 429 || msg.includes('429') || msg.includes('rate limit') || msg.includes('too many requests')) {
      return 'RATE_LIMIT_429';
    }

    // 6. PARTIAL_RESPONSE_206
    if (status === 206 || msg.includes('206') || msg.includes('partial')) {
      return 'PARTIAL_RESPONSE_206';
    }

    // 7. ASYNC_RESPONSE_202
    if (status === 202 || msg.includes('202') || msg.includes('accepted') || msg.includes('async')) {
      return 'ASYNC_RESPONSE_202';
    }

    // 8. PRECONDITION_412
    if (status === 412 || msg.includes('412') || msg.includes('precondition')) {
      return 'PRECONDITION_412';
    }

    // 9. SERVER_ERROR_5XX
    if ((status && status >= 500 && status <= 599) || msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('504') || msg.includes('server error')) {
      return 'SERVER_ERROR_5XX';
    }

    // 10. TIMEOUT
    if (msg.includes('timeout') || msg.includes('econnreset') || msg.includes('etimedout') || msg.includes('socket hang up')) {
      return 'TIMEOUT';
    }

    // 11. EMPTY_DATA
    if (input.observedDataCount === 0 || msg.includes('zero_data') || msg.includes('empty_data') || msg.includes('no products found')) {
      return 'EMPTY_DATA';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Calcula el delay de backoff exponencial con Jitter
   */
  public calculateBackoffDelay(attempt: number, policy: RetryPolicy): number {
    const exponent = Math.max(0, attempt - 1);
    const rawBackoff = Math.min(policy.baseDelayMs * Math.pow(2, exponent), policy.maxDelayMs);
    const jitter = rawBackoff * policy.jitterRatio * Math.random();
    return Math.round(rawBackoff + jitter);
  }

  /**
   * Evalúa la decisión completa de Reintento según Hilo 20.9.2
   */
  public evaluateRetry(input: EvaluateRetryInput): RetryDecision {
    const policy: RetryPolicy = {
      ...this.defaultPolicy,
      ...(input.customPolicy || {}),
    };

    const attempt = Math.max(1, input.attempt);
    const errorClass = this.classifyError(input);
    const isWithinMaxAttempts = attempt < policy.maxAttempts;

    let retry = false;
    let delayMs = 0;
    let escalateToCircuitBreaker = false;
    let haltPersistence = false;
    let isolateSource = false;
    let openRecoveryState = false;
    let reason = '';

    const backoffDelay = this.calculateBackoffDelay(attempt, policy);

    switch (errorClass) {
      case 'SCHEMA_DRIFT':
        retry = false;
        delayMs = 0;
        escalateToCircuitBreaker = true;
        haltPersistence = true;
        isolateSource = true;
        openRecoveryState = true;
        reason = 'SCHEMA_DRIFT — Scraper schema structural change detected. Halting persistence and isolating source.';
        break;

      case 'CORRUPTION_INTEGRITY':
        retry = false;
        delayMs = 0;
        escalateToCircuitBreaker = true;
        haltPersistence = true;
        isolateSource = false;
        openRecoveryState = true;
        reason = 'CORRUPTION_INTEGRITY — Payload integrity corruption detected. Halting persistence.';
        break;

      case 'WAF_BLOCKED_403':
        retry = false; // NO retry agresivo en 403
        delayMs = 0;
        escalateToCircuitBreaker = true;
        haltPersistence = false;
        isolateSource = true;
        openRecoveryState = true;
        reason = 'WAF_BLOCKED_403 — Access blocked by WAF/Cloudflare. Escalating to CircuitBreaker & Recovery.';
        break;

      case 'PARSE_ERROR':
        // No repetir indefinidamente
        retry = attempt < 2; // Máximo 1 reintento
        delayMs = retry ? backoffDelay : 0;
        escalateToCircuitBreaker = !retry;
        openRecoveryState = !retry;
        reason = retry
          ? 'PARSE_ERROR — Syntax parse error encountered. Scheduling single controlled retry.'
          : 'PARSE_ERROR — Parsing failed repeatedly. Escalating to CircuitBreaker.';
        break;

      case 'RATE_LIMIT_429':
        retry = isWithinMaxAttempts;
        if (policy.respectRetryAfter && typeof input.retryAfterSeconds === 'number' && input.retryAfterSeconds > 0) {
          delayMs = Math.max(input.retryAfterSeconds * 1000, backoffDelay);
        } else {
          delayMs = backoffDelay;
        }
        escalateToCircuitBreaker = !retry;
        openRecoveryState = !retry;
        reason = retry
          ? `RATE_LIMIT_429 — Rate limit hit. Waiting ${delayMs}ms before retry.`
          : 'RATE_LIMIT_429 — Rate limit max attempts exceeded. Escalating to CircuitBreaker.';
        break;

      case 'PARTIAL_RESPONSE_206':
        retry = isWithinMaxAttempts;
        delayMs = Math.round(policy.baseDelayMs * 1.5 + policy.baseDelayMs * policy.jitterRatio * Math.random());
        escalateToCircuitBreaker = !retry;
        reason = retry
          ? 'PARTIAL_RESPONSE_206 — Partial HTTP response received. Controlled retry scheduled.'
          : 'PARTIAL_RESPONSE_206 — Max attempts exceeded for partial response.';
        break;

      case 'ASYNC_RESPONSE_202':
        retry = isWithinMaxAttempts;
        delayMs = Math.max(policy.baseDelayMs * 2, 3000);
        escalateToCircuitBreaker = !retry;
        reason = retry
          ? 'ASYNC_RESPONSE_202 — Async HTTP 202 accepted. Polling retry scheduled.'
          : 'ASYNC_RESPONSE_202 — Polling max attempts exceeded.';
        break;

      case 'PRECONDITION_412':
        retry = isWithinMaxAttempts;
        delayMs = backoffDelay;
        escalateToCircuitBreaker = !retry;
        reason = retry
          ? 'PRECONDITION_412 — Precondition header check failed. Conditioned retry scheduled.'
          : 'PRECONDITION_412 — Max attempts exceeded for precondition check.';
        break;

      case 'SERVER_ERROR_5XX':
      case 'TIMEOUT':
      case 'EMPTY_DATA':
      case 'UNKNOWN_ERROR':
      default:
        retry = isWithinMaxAttempts;
        delayMs = backoffDelay;
        escalateToCircuitBreaker = !retry;
        openRecoveryState = !retry;
        reason = retry
          ? `${errorClass} — Scheduling attempt ${attempt + 1} with ${delayMs}ms exponential backoff.`
          : `${errorClass} — Max attempts (${policy.maxAttempts}) reached. Escalating to CircuitBreaker.`;
        break;
    }

    const decision: RetryDecision = {
      retry,
      attempt,
      delayMs,
      reason,
      errorClass,
      escalateToCircuitBreaker,
      haltPersistence,
      isolateSource,
      openRecoveryState,
    };

    // INTEGRACIÓN OBLIGATORIA: Notificar a SourceHealthService sin duplicar estado
    if (input.sourceId) {
      sourceHealthService.recordHealthEvent(input.sourceId, {
        type:
          errorClass === 'WAF_BLOCKED_403'
            ? 'WAF_BLOCK'
            : errorClass === 'SCHEMA_DRIFT'
            ? 'SCHEMA_DRIFT'
            : errorClass === 'RATE_LIMIT_429'
            ? 'RATE_LIMIT'
            : errorClass === 'CORRUPTION_INTEGRITY'
            ? 'CORRUPTION'
            : 'FAILURE',
        reason,
        healthPenalty: errorClass === 'SCHEMA_DRIFT' || errorClass === 'WAF_BLOCKED_403' ? 35 : 15,
        isolateSource,
        escalateToCircuitBreaker,
        httpStatus: input.httpStatus,
      });
    }

    return decision;
  }
}

export const retryPolicyEngine = new RetryPolicyEngine();
