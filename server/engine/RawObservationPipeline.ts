import crypto from 'crypto';
import { db } from '../db/database.js';
import {
  RawProductObservation,
  RawObservationZapierPayload,
  RawIngestionResult,
  ProcessingStatus,
} from '../types.js';

export class RawObservationPipelineEngine {
  /**
   * Procesa e ingiere una observación RAW asegurando Idempotencia estricta vía sourceRecordId
   */
  public processRawObservation(
    input: Partial<RawProductObservation>,
    options?: { forceRetry?: boolean }
  ): RawIngestionResult {
    const observedAt = input.observedAt || new Date().toISOString();
    const sourceId = input.sourceId || 'source-unknown';
    const rawName = input.productNameRaw || '';
    const rawPrice = typeof input.priceRaw === 'number' ? input.priceRaw : parseFloat(String(input.priceRaw || 0));

    // Generar o usar sourceRecordId único determinista
    const sourceRecordId =
      input.sourceRecordId ||
      this.generateSourceRecordId(sourceId, input.skuRaw || input.eanRaw || rawName, rawPrice, observedAt);

    // 1. REVISAR IDEMPOTENCIA EN DATABASE A
    const existing = db.getRawProductObservationBySourceRecordId(sourceRecordId);

    if (existing) {
      // SCENARIO 1: Ya procesado anteriormente
      if (existing.processingStatus === 'PROCESSED') {
        db.addAuditLog({
          id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          tenantId: 'tenant-cdmx-default',
          action: 'ZAPIER_IDEMPOTENCY_IGNORE',
          actor: 'system-zapier-pipeline',
          timestamp: new Date().toISOString(),
          before: { sourceRecordId, status: existing.processingStatus },
          after: { sourceRecordId, status: existing.processingStatus, action: 'IGNORED' },
          reason: `DUPLICATE EVENT IGNORED — sourceRecordId ${sourceRecordId} already PROCESSED.`,
        });

        return {
          sourceRecordId,
          action: 'ALREADY_PROCESSED',
          processingStatus: 'PROCESSED',
          rawProductObservation: existing,
          message: `DUPLICATE EVENT — Record ${sourceRecordId} already processed. Ignored.`,
        };
      }

      // SCENARIO 2: En estado REVIEW_REQUIRED
      if (existing.processingStatus === 'REVIEW_REQUIRED') {
        return {
          sourceRecordId,
          action: 'REVIEW_REQUIRED',
          processingStatus: 'REVIEW_REQUIRED',
          rawProductObservation: existing,
          message: `REVIEW_REQUIRED — Event ${sourceRecordId} requires manual review. NO_AUTOMATIC_MERGE.`,
        };
      }

      // SCENARIO 3: En estado FAILED (Permite Reintento)
      if (existing.processingStatus === 'FAILED' || options?.forceRetry) {
        const retriedRecord: RawProductObservation = {
          ...existing,
          processingStatus: 'PROCESSING',
          processedAt: new Date().toISOString(),
        };

        // Transición PROCESSING -> PROCESSED
        retriedRecord.processingStatus = 'PROCESSED';
        db.upsertRawProductObservation(retriedRecord);

        return {
          sourceRecordId,
          action: 'RETRY',
          processingStatus: 'PROCESSED',
          rawProductObservation: retriedRecord,
          zapierPayload: this.formatZapierPayload(retriedRecord),
          message: `RETRY SUCCESSFUL — Re-processed previously failed event ${sourceRecordId}.`,
        };
      }
    }

    // 2. NUEVO REGISTRO: VALIDACIÓN DE INTEGRIDAD Y ESTADOS
    const newRecordId = input.id || `raw-obs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Regla de Integridad Incompleta / Invalida
    let initialStatus: ProcessingStatus = 'RECEIVED';
    let dataQualityStatus: 'OBSERVED' | 'STALE' | 'VALID' | 'REVIEW' | 'REJECTED' = 'OBSERVED';

    if (!rawName || rawName.trim().length === 0) {
      initialStatus = 'REJECTED';
      dataQualityStatus = 'REJECTED';
    } else if (isNaN(rawPrice) || rawPrice <= 0) {
      initialStatus = 'REVIEW_REQUIRED';
      dataQualityStatus = 'REVIEW';
    }

    // Construcción con Inmutabilidad de campos RAW
    const rawObservation: RawProductObservation = {
      id: newRecordId,
      sourceRecordId,
      sourceId,
      sourceName: input.sourceName || 'Fuente CDMX',
      supplierId: input.supplierId || 'supp-cdmx',
      scraperRunId: input.scraperRunId || `run-${Date.now()}`,
      observedAt,

      productNameRaw: rawName, // INMUTABLE
      brandRaw: input.brandRaw, // INMUTABLE
      categoryRaw: input.categoryRaw, // INMUTABLE
      descriptionRaw: input.descriptionRaw, // INMUTABLE
      presentationRaw: input.presentationRaw, // INMUTABLE

      eanRaw: input.eanRaw, // INMUTABLE
      gtinRaw: input.gtinRaw, // INMUTABLE
      skuRaw: input.skuRaw, // INMUTABLE
      supplierSkuRaw: input.supplierSkuRaw, // INMUTABLE

      priceRaw: rawPrice, // INMUTABLE
      currencyRaw: input.currencyRaw || 'MXN', // INMUTABLE
      availabilityRaw: input.availabilityRaw || 'IN_STOCK', // INMUTABLE
      promotionRaw: input.promotionRaw, // INMUTABLE

      productUrl: input.productUrl,
      imageUrl: input.imageUrl,

      httpStatus: input.httpStatus || 200,
      extractionStatus: input.extractionStatus || 'SUCCESS',
      parserVersion: input.parserVersion || 'v20.10.1',

      dataQualityStatus,
      processingStatus: initialStatus,
      processedAt: initialStatus === 'RECEIVED' ? new Date().toISOString() : undefined,
      metadata: input.metadata || {},
    };

    // Si el registro pasó como RECEIVED, avanzamos a PROCESSING -> PROCESSED
    if (rawObservation.processingStatus === 'RECEIVED') {
      rawObservation.processingStatus = 'PROCESSING';
      // Simular pase por pipeline -> PROCESSED
      rawObservation.processingStatus = 'PROCESSED';
      rawObservation.processedAt = new Date().toISOString();
      rawObservation.dataQualityStatus = 'VALID';
    }

    // Guardar en DATABASE A
    db.upsertRawProductObservation(rawObservation);

    const isRejectedOrReview =
      rawObservation.processingStatus === 'REJECTED' || rawObservation.processingStatus === 'REVIEW_REQUIRED';

    const action = isRejectedOrReview
      ? rawObservation.processingStatus === 'REJECTED'
        ? 'REJECTED'
        : 'REVIEW_REQUIRED'
      : 'NEW';

    return {
      sourceRecordId,
      action,
      processingStatus: rawObservation.processingStatus,
      rawProductObservation: rawObservation,
      zapierPayload: isRejectedOrReview ? undefined : this.formatZapierPayload(rawObservation),
      message: isRejectedOrReview
        ? `RECORD ${rawObservation.processingStatus} — Incomplete or invalid raw parameters.`
        : `NEW EVENT PROCESSED — Successfully ingested ${sourceRecordId}.`,
    };
  }

  /**
   * Formatea la observación RAW al contrato estricto emitido hacia Zapier / Webhooks
   */
  public formatZapierPayload(obs: RawProductObservation): RawObservationZapierPayload {
    return {
      sourceRecordId: obs.sourceRecordId,
      sourceId: obs.sourceId,
      supplierId: obs.supplierId,
      scraperRunId: obs.scraperRunId,
      observedAt: obs.observedAt,

      productNameRaw: obs.productNameRaw,
      brandRaw: obs.brandRaw,
      categoryRaw: obs.categoryRaw,
      presentationRaw: obs.presentationRaw,

      eanRaw: obs.eanRaw,
      gtinRaw: obs.gtinRaw,
      skuRaw: obs.skuRaw,

      priceRaw: obs.priceRaw,
      currencyRaw: obs.currencyRaw,
      availabilityRaw: obs.availabilityRaw,
      promotionRaw: obs.promotionRaw,

      productUrl: obs.productUrl,
      imageUrl: obs.imageUrl,

      httpStatus: obs.httpStatus,
      extractionStatus: obs.extractionStatus,
      parserVersion: obs.parserVersion,
    };
  }

  /**
   * Genera una clave determinista única de idempotencia sourceRecordId
   */
  public generateSourceRecordId(sourceId: string, itemKey: string, price: number, observedAt: string): string {
    const dayKey = observedAt.slice(0, 10);
    const hash = crypto
      .createHash('sha256')
      .update(`${sourceId}-${itemKey.toLowerCase().trim()}-${price}-${dayKey}`)
      .digest('hex')
      .slice(0, 12);
    return `SRC_REC_${sourceId.toUpperCase()}_${hash}`;
  }
}

export const rawObservationPipeline = new RawObservationPipelineEngine();
