import { db } from '../db/database.js';
import { ScraperRun, SupplierSource, CircuitState, RecoveryAttempt, RecoveryState } from '../types.js';

export type FailureCategory =
  | 'SUCCESS'
  | 'PARTIAL_RESPONSE'
  | 'ASYNC_RESPONSE'
  | 'WAF_BLOCK'
  | 'PRECONDITION'
  | 'RATE_LIMIT'
  | 'SOURCE_ERROR'
  | 'TIMEOUT'
  | 'EMPTY_DATA'
  | 'PARSE_ERROR'
  | 'SCHEMA_DRIFT'
  | 'UNKNOWN_ERROR';

export type RecoveryAction =
  | 'PERSIST_NORMAL'
  | 'VALIDATE_PARTIAL'
  | 'RETRY_EXPONENTIAL_BACKOFF'
  | 'FALLBACK_TO_CACHED_OBSERVATION'
  | 'WAIT_RATE_LIMIT_RESET'
  | 'MARK_SOURCE_BLOCKED'
  | 'MARK_SOURCE_DEGRADED'
  | 'ADAPTIVE_HEADER_RETRY';

export interface FailureAnalysis {
  category: FailureCategory;
  recommendedAction: RecoveryAction;
  backoffMs: number;
  reason: string;
  httpStatus?: number;
}

export interface CircuitCheckResult {
  allowed: boolean;
  circuitState: CircuitState;
  mode: 'NORMAL' | 'PROBE' | 'OPEN_BLOCKED';
  reason: string;
}

export class RecoveryEngine {
  /**
   * 20.9.5 — HTTP & Event Error Classification Matrix
   */
  public classifyFailure(errorMessage: string, httpStatus?: number): FailureAnalysis {
    const msg = (errorMessage || '').toLowerCase();

    if (httpStatus === 200) {
      return {
        category: 'SUCCESS',
        recommendedAction: 'PERSIST_NORMAL',
        backoffMs: 0,
        reason: 'Extracción completada con éxito (HTTP 200).',
        httpStatus: 200,
      };
    }

    if (httpStatus === 206 || msg.includes('206') || msg.includes('partial')) {
      return {
        category: 'PARTIAL_RESPONSE',
        recommendedAction: 'VALIDATE_PARTIAL',
        backoffMs: 0,
        reason: 'Respuesta parcial de contenido recibida (HTTP 206). Se procesarán las observaciones disponibles.',
        httpStatus: 206,
      };
    }

    if (httpStatus === 202 || msg.includes('202') || msg.includes('accepted') || msg.includes('async')) {
      return {
        category: 'ASYNC_RESPONSE',
        recommendedAction: 'RETRY_EXPONENTIAL_BACKOFF',
        backoffMs: 300000, // 5 min
        reason: 'Petición aceptada para procesamiento asíncrono (HTTP 202). Reintento diferido activo.',
        httpStatus: 202,
      };
    }

    if (httpStatus === 403 || msg.includes('403') || msg.includes('waf') || msg.includes('forbidden') || msg.includes('cloudflare')) {
      return {
        category: 'WAF_BLOCK',
        recommendedAction: 'MARK_SOURCE_BLOCKED',
        backoffMs: 86400000, // 24 hours backoff for WAF blocks
        reason: 'Bloqueo por WAF / Control de acceso (HTTP 403). Circuit Breaker -> OPEN.',
        httpStatus: 403,
      };
    }

    if (httpStatus === 412 || msg.includes('412') || msg.includes('precondition')) {
      return {
        category: 'PRECONDITION',
        recommendedAction: 'ADAPTIVE_HEADER_RETRY',
        backoffMs: 43200000, // 12 hours
        reason: 'Fallo de precondición o encabezados de cliente (HTTP 412). Recuperación adaptativa activada.',
        httpStatus: 412,
      };
    }

    if (httpStatus === 429 || msg.includes('429') || msg.includes('rate limit') || msg.includes('too many requests')) {
      return {
        category: 'RATE_LIMIT',
        recommendedAction: 'WAIT_RATE_LIMIT_RESET',
        backoffMs: 3600000, // 1 hour
        reason: 'Límite de peticiones alcanzado (HTTP 429). Cooldown por 60 minutos.',
        httpStatus: 429,
      };
    }

    if ((httpStatus && httpStatus >= 500) || msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('server error')) {
      return {
        category: 'SOURCE_ERROR',
        recommendedAction: 'RETRY_EXPONENTIAL_BACKOFF',
        backoffMs: 300000, // 5 min
        reason: 'Error en servidor remoto (HTTP 5xx). Reintento programado con backoff exponencial.',
        httpStatus: httpStatus || 500,
      };
    }

    if (msg.includes('timeout') || msg.includes('econnreset') || msg.includes('etimedout') || msg.includes('network')) {
      return {
        category: 'TIMEOUT',
        recommendedAction: 'RETRY_EXPONENTIAL_BACKOFF',
        backoffMs: 60000, // 1 min
        reason: 'Tiempo de espera de red agotado o interrupción. Reintento inmediato activo.',
      };
    }

    if (msg.includes('schema') || msg.includes('drift') || msg.includes('expected field missing')) {
      return {
        category: 'SCHEMA_DRIFT',
        recommendedAction: 'MARK_SOURCE_DEGRADED',
        backoffMs: 14400000, // 4 hours
        reason: 'Deriva de esquema detectada (HTML/JSON sin campos esperados). Fuente marcada como degradada.',
      };
    }

    if (msg.includes('parse') || msg.includes('syntax')) {
      return {
        category: 'PARSE_ERROR',
        recommendedAction: 'FALLBACK_TO_CACHED_OBSERVATION',
        backoffMs: 14400000,
        reason: 'Error sintáctico de parsing. Fallback a última observación inmutable cacheada.',
      };
    }

    if (msg.includes('zero products') || msg.includes('empty response')) {
      return {
        category: 'EMPTY_DATA',
        recommendedAction: 'FALLBACK_TO_CACHED_OBSERVATION',
        backoffMs: 14400000,
        reason: 'Respuesta vacía o 0 productos extraídos. Fallback a observaciones cacheadas.',
      };
    }

    return {
      category: 'UNKNOWN_ERROR',
      recommendedAction: 'FALLBACK_TO_CACHED_OBSERVATION',
      backoffMs: 3600000, // 1 hour
      reason: `Error no clasificado: ${errorMessage}`,
      httpStatus,
    };
  }

  /**
   * 20.9.3 & 20.9.4 — Circuit Breaker & Recovery State Machine
   */
  public canRunSource(source: SupplierSource): CircuitCheckResult {
    if (!source.enabled) {
      return {
        allowed: false,
        circuitState: source.circuitState || 'CLOSED',
        mode: 'OPEN_BLOCKED',
        reason: 'Fuente deshabilitada administrativamente',
      };
    }

    const currentState = source.circuitState || 'CLOSED';
    const now = Date.now();

    if (currentState === 'CLOSED') {
      return {
        allowed: true,
        circuitState: 'CLOSED',
        mode: 'NORMAL',
        reason: 'Fuente en estado saludable (CLOSED)',
      };
    }

    if (currentState === 'OPEN') {
      const cooldownMs = source.cooldownUntil ? new Date(source.cooldownUntil).getTime() : 0;
      if (now < cooldownMs) {
        return {
          allowed: false,
          circuitState: 'OPEN',
          mode: 'OPEN_BLOCKED',
          reason: `Circuit Breaker en estado OPEN. Cooldown activo hasta ${source.cooldownUntil}. Omite ejecución para evitar bloqueo`,
        };
      }

      // Cooldown expired! Transition OPEN -> HALF_OPEN for 1 probe attempt
      db.updateSource(source.id, {
        circuitState: 'HALF_OPEN',
        lastVerifiedAt: new Date().toISOString(),
      });

      return {
        allowed: true,
        circuitState: 'HALF_OPEN',
        mode: 'PROBE',
        reason: 'Cooldown expirado. Transición OPEN -> HALF_OPEN. Ejecutando 1 probe de prueba.',
      };
    }

    if (currentState === 'HALF_OPEN') {
      return {
        allowed: true,
        circuitState: 'HALF_OPEN',
        mode: 'PROBE',
        reason: 'Circuit Breaker en HALF_OPEN. Prueba de verificación activa.',
      };
    }

    return {
      allowed: true,
      circuitState: 'CLOSED',
      mode: 'NORMAL',
      reason: 'Estado por defecto',
    };
  }

  /**
   * 20.9.2 — Calculate Exponential Backoff with Jitter
   */
  public calculateBackoff(consecutiveFailures: number, baseMs: number = 5000, maxMs: number = 86400000): number {
    const exp = Math.min(baseMs * Math.pow(2, Math.max(0, consecutiveFailures - 1)), maxMs);
    const jitter = Math.floor(Math.random() * 1000);
    return Math.min(exp + jitter, maxMs);
  }

  /**
   * Process Successful Scrape Execution
   */
  public processSuccess(source: SupplierSource, scraperRun: ScraperRun): void {
    const wasInProbe = source.circuitState === 'HALF_OPEN';
    const consecutiveSuccesses = (source.consecutiveSuccesses || 0) + 1;
    const healthScore = Math.min(100, Math.max(80, (source.healthScore || 50) + 15));

    db.updateSource(source.id, {
      circuitState: 'CLOSED',
      accessStatus: 'ACTIVE',
      consecutiveSuccesses,
      consecutiveFailures: 0,
      healthScore,
      lastSuccessfulRun: new Date().toISOString(),
      lastSuccessAt: new Date().toISOString(),
      cooldownUntil: undefined,
      nextRetryAt: undefined,
      lastVerifiedAt: new Date().toISOString(),
    });

    if (wasInProbe) {
      scraperRun.logs.push(`[CIRCUIT_BREAKER] Probe exitoso en HALF_OPEN. Transición HALF_OPEN -> CLOSED. Fuente RECUPERADA`);

      // Audit trail
      const attempt: RecoveryAttempt = {
        id: `rec-att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sourceId: source.id,
        attemptNumber: (source.recoveryAttempts || 0) + 1,
        startedAt: scraperRun.startedAt || new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        previousHealth: source.healthScore || 10,
        previousState: 'HALF_OPEN',
        errorCode: 'NONE',
        strategy: 'HALF_OPEN_PROBE',
        result: 'SUCCESS',
        responseStatus: 200,
        durationMs: scraperRun.durationMs || 0,
        productsFound: scraperRun.productsDiscovered || 0,
        pricesFound: scraperRun.productsParsed || 0,
        notes: 'Fuente recuperada exitosamente durante probe HALF_OPEN',
      };
      db.addRecoveryAttempt(attempt);
    }
  }

  /**
   * Process Failed Scrape Execution
   */
  public processFailure(
    source: SupplierSource,
    scraperRun: ScraperRun,
    errorMessage: string,
    httpStatus?: number
  ): FailureAnalysis {
    const analysis = this.classifyFailure(errorMessage, httpStatus);

    scraperRun.status = 'FAILED';
    scraperRun.errors.push(`[RECOVERY_ENGINE] ${analysis.reason}`);

    const consecutiveFailures = (source.consecutiveFailures || 0) + 1;
    const backoffMs = this.calculateBackoff(consecutiveFailures, analysis.backoffMs);
    const cooldownUntil = new Date(Date.now() + backoffMs).toISOString();

    let newCircuitState: CircuitState = 'CLOSED';
    let accessStatus: 'ACTIVE' | 'DEGRADED' | 'BLOCKED' = 'ACTIVE';
    let healthPenalty = 15;

    switch (analysis.recommendedAction) {
      case 'MARK_SOURCE_BLOCKED':
        newCircuitState = 'OPEN';
        accessStatus = 'BLOCKED';
        healthPenalty = 35;
        break;
      case 'MARK_SOURCE_DEGRADED':
        newCircuitState = 'CLOSED';
        accessStatus = 'DEGRADED';
        healthPenalty = 25;
        break;
      case 'ADAPTIVE_HEADER_RETRY':
      case 'WAIT_RATE_LIMIT_RESET':
        newCircuitState = source.circuitState === 'HALF_OPEN' ? 'OPEN' : 'CLOSED';
        accessStatus = 'DEGRADED';
        healthPenalty = 20;
        break;
      case 'RETRY_EXPONENTIAL_BACKOFF':
      case 'FALLBACK_TO_CACHED_OBSERVATION':
      default:
        newCircuitState = source.circuitState === 'HALF_OPEN' ? 'OPEN' : (source.circuitState || 'CLOSED');
        healthPenalty = 15;
        break;
    }

    const newHealthScore = Math.max(0, (source.healthScore || 50) - healthPenalty);

    scraperRun.logs.push(`[RECOVERY_ENGINE] Clasificación: ${analysis.category} | Acción: ${analysis.recommendedAction} | Backoff: ${backoffMs}ms`);

    db.updateSource(source.id, {
      circuitState: newCircuitState,
      accessStatus,
      consecutiveFailures,
      consecutiveSuccesses: 0,
      healthScore: newHealthScore,
      lastFailedRun: new Date().toISOString(),
      lastFailureAt: new Date().toISOString(),
      cooldownUntil: newCircuitState === 'OPEN' ? cooldownUntil : undefined,
      nextRetryAt: cooldownUntil,
      retryCount: (source.retryCount || 0) + 1,
      recoveryAttempts: (source.recoveryAttempts || 0) + 1,
      lastVerifiedAt: new Date().toISOString(),
    });

    // 20.9.7 — Recovery Audit Trail
    const attempt: RecoveryAttempt = {
      id: `rec-att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sourceId: source.id,
      attemptNumber: (source.recoveryAttempts || 0) + 1,
      startedAt: scraperRun.startedAt || new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      previousHealth: source.healthScore || 50,
      previousState: source.circuitState || 'CLOSED',
      errorCode: analysis.category,
      strategy: analysis.recommendedAction,
      result: 'FAILED',
      responseStatus: httpStatus,
      durationMs: scraperRun.durationMs || 0,
      productsFound: scraperRun.productsDiscovered || 0,
      pricesFound: scraperRun.productsParsed || 0,
      nextRetryAt: cooldownUntil,
      notes: analysis.reason,
    };
    db.addRecoveryAttempt(attempt);

    return analysis;
  }

  /**
   * 20.9.8 — Schema Drift Detection
   */
  public detectSchemaDrift(rawContentLength: number, parsedProductsCount: number): boolean {
    return rawContentLength > 500 && parsedProductsCount === 0;
  }

  // Concurrency lock for recovery probe: sourceId -> timestamp
  private recoveryLocks: Map<string, number> = new Map();

  /**
   * 20.9.4 — Recovery State Machine transitions
   */
  public updateRecoveryState(source: SupplierSource, event: 'FAILURE' | 'SUCCESS' | 'COOLDOWN_EXPIRED' | 'INITIATE_PROBE'): RecoveryState {
    let newState = source.recoveryState;
    const now = Date.now();

    switch (newState) {
      case 'ACTIVE':
        if (event === 'FAILURE') newState = 'DEGRADED';
        break;
      case 'DEGRADED':
        if (event === 'FAILURE') newState = 'BLOCKED';
        else if (event === 'SUCCESS') newState = 'ACTIVE';
        break;
      case 'BLOCKED':
        if (event === 'COOLDOWN_EXPIRED') newState = 'RECOVERY_PENDING';
        break;
      case 'RECOVERY_PENDING':
        // Transition to RECOVERING when a probe is initiated (check lock first)
        if (event === 'INITIATE_PROBE') {
          const lockExpirationWindow = 30000; // 30s lock for probe
          const activeLockTime = this.recoveryLocks.get(source.id);
          if (activeLockTime && now - activeLockTime < lockExpirationWindow) {
            // Lock held, ignore
            return newState;
          }
          this.recoveryLocks.set(source.id, now);
          newState = 'RECOVERING';
        }
        break;
      case 'RECOVERING':
        if (event === 'SUCCESS') {
          this.recoveryLocks.delete(source.id);
          newState = 'ACTIVE';
        } else if (event === 'FAILURE') {
          this.recoveryLocks.delete(source.id);
          newState = 'BLOCKED';
        }
        break;
    }

    if (newState !== source.recoveryState) {
      db.updateSource(source.id, { recoveryState: newState });
    }
    return newState;
  }

  /**
   * 20.9.9 — Integrity Guard
   */
  public validateObservedProduct(product: {
    productName?: string;
    brand?: string;
    barcode?: string;
    sku?: string;
    regularPrice?: number;
  }): { valid: boolean; reason?: string } {
    if (!product.productName && !product.barcode && !product.sku) {
      return { valid: false, reason: 'Missing identity: no name, barcode, or SKU' };
    }
    if (product.regularPrice !== undefined) {
      if (isNaN(product.regularPrice) || product.regularPrice <= 0 || product.regularPrice > 200000) {
        return { valid: false, reason: `Invalid price value: ${product.regularPrice}` };
      }
    }
    return { valid: true };
  }

  /**
   * 20.9.6 — Cache Freshness Policy
   */
  public getFreshnessStatus(capturedAtStr?: string): 'FRESH' | 'RECENT' | 'STALE' | 'EXPIRED' {
    if (!capturedAtStr) return 'EXPIRED';
    const ageMs = Date.now() - new Date(capturedAtStr).getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    if (ageHours < 24) return 'FRESH';
    if (ageHours < 48) return 'RECENT';
    if (ageHours < 72) return 'STALE';
    return 'EXPIRED';
  }
}

export const recoveryEngine = new RecoveryEngine();
