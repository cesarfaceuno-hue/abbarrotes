import { db } from '../db/database.js';
import { SupplierSource, RecoveryAttempt, CircuitState } from '../types.js';

export interface SourceHealthReport {
  sourceId: string;
  sourceName: string;
  healthScore: number;
  accessStatus: 'ACTIVE' | 'DEGRADED' | 'BLOCKED' | 'MAINTENANCE';
  circuitState: CircuitState;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastErrorReason?: string;
  lastVerifiedAt: string;
}

export class SourceHealthServiceEngine {
  /**
   * Obtiene el reporte de salud consolidado para una fuente
   */
  public getHealthReport(sourceId: string): SourceHealthReport | undefined {
    const source = db.getSourceById(sourceId);
    if (!source) return undefined;

    return {
      sourceId: source.id,
      sourceName: source.name,
      healthScore: source.healthScore || 50,
      accessStatus: source.accessStatus || 'ACTIVE',
      circuitState: source.circuitState || 'CLOSED',
      consecutiveFailures: source.consecutiveFailures || 0,
      consecutiveSuccesses: source.consecutiveSuccesses || 0,
      lastErrorReason: source.lastErrorReason,
      lastVerifiedAt: source.lastVerifiedAt || new Date().toISOString(),
    };
  }

  /**
   * Actualiza el estado de salud de una fuente tras un fallo o evento de retry
   */
  public recordHealthEvent(
    sourceId: string,
    event: {
      type: 'FAILURE' | 'SUCCESS' | 'WAF_BLOCK' | 'SCHEMA_DRIFT' | 'RATE_LIMIT' | 'CORRUPTION';
      reason: string;
      healthPenalty?: number;
      isolateSource?: boolean;
      escalateToCircuitBreaker?: boolean;
      httpStatus?: number;
    }
  ): SupplierSource | undefined {
    const source = db.getSourceById(sourceId);
    if (!source) return undefined;

    const currentScore = source.healthScore || 50;
    const penalty = event.healthPenalty ?? 15;
    const newHealthScore = Math.max(0, currentScore - penalty);

    const consecutiveFailures = (source.consecutiveFailures || 0) + 1;
    let newAccessStatus: 'ACTIVE' | 'DEGRADED' | 'BLOCKED' | 'MAINTENANCE' = source.accessStatus || 'ACTIVE';
    let newCircuitState: CircuitState = source.circuitState || 'CLOSED';

    if (event.isolateSource || event.type === 'WAF_BLOCK' || event.type === 'SCHEMA_DRIFT') {
      newAccessStatus = 'BLOCKED';
      newCircuitState = 'OPEN';
    } else if (event.type === 'RATE_LIMIT' || event.type === 'CORRUPTION' || consecutiveFailures >= 3) {
      newAccessStatus = 'DEGRADED';
      if (event.escalateToCircuitBreaker) {
        newCircuitState = 'OPEN';
      }
    }

    const cooldownUntil =
      newCircuitState === 'OPEN' ? new Date(Date.now() + 60 * 60 * 1000).toISOString() : source.cooldownUntil;

    const updatedSource = db.updateSource(sourceId, {
      healthScore: newHealthScore,
      accessStatus: newAccessStatus,
      circuitState: newCircuitState,
      consecutiveFailures,
      consecutiveSuccesses: 0,
      lastFailedRun: new Date().toISOString(),
      lastFailureAt: new Date().toISOString(),
      lastErrorReason: event.reason,
      cooldownUntil,
      lastVerifiedAt: new Date().toISOString(),
    });

    // Registrar en auditoría
    db.addAuditLog({
      id: `audit-health-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenantId: 'tenant-cdmx-default',
      action: 'SOURCE_HEALTH_UPDATED',
      actor: 'SourceHealthService',
      timestamp: new Date().toISOString(),
      before: { healthScore: currentScore, accessStatus: source.accessStatus, circuitState: source.circuitState },
      after: { healthScore: newHealthScore, accessStatus: newAccessStatus, circuitState: newCircuitState },
      reason: event.reason,
    });

    return updatedSource;
  }

  /**
   * Registra recuperación exitosa
   */
  public recordRecoverySuccess(sourceId: string, notes?: string): SupplierSource | undefined {
    const source = db.getSourceById(sourceId);
    if (!source) return undefined;

    const newScore = Math.min(100, (source.healthScore || 50) + 20);

    return db.updateSource(sourceId, {
      healthScore: newScore,
      accessStatus: 'ACTIVE',
      circuitState: 'CLOSED',
      consecutiveFailures: 0,
      consecutiveSuccesses: (source.consecutiveSuccesses || 0) + 1,
      lastSuccessAt: new Date().toISOString(),
      lastErrorReason: undefined,
      cooldownUntil: undefined,
      lastVerifiedAt: new Date().toISOString(),
    });
  }
}

export const sourceHealthService = new SourceHealthServiceEngine();
