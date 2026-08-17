import crypto from 'crypto';
import { db } from '../db/database.js';
import { adapterRegistry } from '../adapters/AdapterRegistry.js';
import { ProductMatchingEngine, ParsedProduct } from './productMatching.js';
import { recoveryEngine } from './RecoveryEngine.js';
import { agentOrchestrator } from './AgentOrchestrator.js';
import { googleSheetsIntelligenceAgent } from './GoogleSheetsIntelligenceAgent.js';
import { Telemetry } from '../services/telemetry.js';
import {
  ScraperRun,
  RawObservation,
  PriceRecord,
  ArbitrageOpportunity,
  MasterProduct,
  SupplierOffer,
} from '../types.js';

export class AcquisitionScheduler {
  private isRunning = false;
  private initialTimeout: any = null;
  private cronInterval: any = null;

  public async runSource(sourceId: string, triggerType: 'MANUAL' | 'SCHEDULED' = 'MANUAL'): Promise<ScraperRun> {
    const source = db.getSourceById(sourceId);
    if (!source) {
      throw new Error(`Fuente no encontrada: ${sourceId}`);
    }

    const adapter = adapterRegistry.getAdapter(source.id);
    if (!adapter) {
      throw new Error(`Adapter no registrado para fuente ${source.id}`);
    }

    const runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const startedAt = new Date().toISOString();

    const scraperRun: ScraperRun = {
      id: runId,
      supplierId: source.supplierId,
      sourceId: source.id,
      sourceName: source.name,
      startedAt,
      status: 'RUNNING',
      pagesVisited: 0,
      productsDiscovered: 0,
      productsParsed: 0,
      productsAccepted: 0,
      productsRejected: 0,
      productsMatched: 0,
      productsUnmatched: 0,
      priceChanges: 0,
      errors: [],
      warnings: [],
      durationMs: 0,
      workerVersion: '4.1.0',
      logs: [`[SCHEDULER] Iniciando adquisición para ${source.name} (Trigger: ${triggerType})`],
    };

    db.addScraperRun(scraperRun);

    const t0 = Date.now();

    // 0. CIRCUIT BREAKER CHECK
    const circuitCheck = recoveryEngine.canRunSource(source);
    if (!circuitCheck.allowed) {
      scraperRun.status = 'FAILED';
      scraperRun.durationMs = Date.now() - t0;
      scraperRun.completedAt = new Date().toISOString();
      scraperRun.errors.push(`[CIRCUIT_BREAKER] ${circuitCheck.reason}`);
      scraperRun.logs.push(`[CIRCUIT_BREAKER] Exec skipped: ${circuitCheck.reason}`);
      db.updateScraperRun(runId, scraperRun);
      return scraperRun;
    }

    try {
      // 1. DISCOVERY & FETCH
      const fetchResult = await adapter.fetch(source);
      scraperRun.pagesVisited = fetchResult.pagesVisited;
      scraperRun.productsDiscovered = fetchResult.rawProducts.length;
      scraperRun.productsParsed = fetchResult.rawProducts.length;
      scraperRun.logs.push(...fetchResult.logs);
      scraperRun.errors.push(...fetchResult.errors);
      scraperRun.warnings.push(...fetchResult.warnings);

      // SCHEMA DRIFT DETECTION
      if (fetchResult.rawContentLength && recoveryEngine.detectSchemaDrift(fetchResult.rawContentLength, fetchResult.rawProducts.length)) {
        scraperRun.warnings.push('[SCHEMA_DRIFT] Se recibió contenido HTML/JSON pero 0 productos fueron extraídos.');
      }

      const masterCatalog = db.getMasterProducts();

      // 2. PARSE, INTEGRITY GUARD, NORMALIZE, MATCH, PERSIST
      for (const raw of fetchResult.rawProducts) {
        // INTEGRITY GUARD
        const integrity = recoveryEngine.validateObservedProduct({
          productName: raw.rawName,
          brand: raw.rawBrand,
          barcode: raw.rawBarcode,
          sku: raw.rawSku,
          regularPrice: raw.rawPrice,
        });

        if (!integrity.valid) {
          scraperRun.productsRejected++;
          scraperRun.warnings.push(`[INTEGRITY_GUARD] Producto rechazado (${raw.rawName}): ${integrity.reason}`);
          continue;
        }
        const observationHash = crypto
          .createHash('sha256')
          .update(`${source.id}-${raw.rawSku || raw.rawName}-${raw.rawPrice}-${new Date().toISOString().slice(0, 10)}`)
          .digest('hex');

        const contentHash = crypto
          .createHash('sha256')
          .update(JSON.stringify(raw.rawPayload || raw))
          .digest('hex');

        const rawObs: RawObservation = {
          id: `obs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          tenantId: 'tenant-cdmx-01',
          organizationId: 'org-abarrotes-cdmx',
          supplierId: source.supplierId,
          sourceId: source.id,
          sourceUrl: raw.sourceUrl,
          canonicalUrl: source.canonicalUrl,
          retrievedAt: new Date().toISOString(),
          httpStatus: 200,
          rawName: raw.rawName,
          rawBrand: raw.rawBrand,
          rawSku: raw.rawSku,
          rawBarcode: raw.rawBarcode,
          rawPrice: raw.rawPrice.toString(),
          rawUnit: raw.rawUnit,
          rawCategory: raw.rawCategory,
          rawPayload: raw.rawPayload,
          contentHash,
          observationHash,
          parserVersion: '4.1.0',
          acquisitionRunId: runId,
          dataQualityStatus: 'VALID',
        };

        // Normalization
        const normalized = ProductMatchingEngine.normalizeProduct(raw);

        // Quality check
        const qualityResult = ProductMatchingEngine.validateQuality(normalized);
        rawObs.dataQualityStatus = qualityResult.qualityStatus;

        db.addRawObservation(rawObs);

        if (!qualityResult.isValid) {
          scraperRun.productsRejected++;
          scraperRun.warnings.push(`Rechazado producto ${raw.rawName}: ${qualityResult.flags.join(', ')}`);
          continue;
        }

        scraperRun.productsAccepted++;

        // Product Matching
        const matchResult = ProductMatchingEngine.matchProduct(normalized, masterCatalog);

        let targetMasterProduct = matchResult.masterProduct;

        if (matchResult.masterProduct) {
          scraperRun.productsMatched++;
          scraperRun.logs.push(`[MATCH] "${normalized.normalizedName}" -> "${matchResult.masterProduct.canonicalName}" (${matchResult.matchReason}, Conf: ${matchResult.confidence})`);
        } else {
          scraperRun.productsUnmatched++;

          // Create dynamic master product if high quality but not previously indexed
          const newMasterId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const newMaster: MasterProduct = {
            id: newMasterId,
            canonicalName: `${normalized.normalizedBrand} ${normalized.normalizedName}`,
            brand: normalized.normalizedBrand,
            category: normalized.normalizedCategory,
            subcategory: 'General',
            barcode: normalized.rawBarcode,
            sku: normalized.rawSku,
            presentation: normalized.presentation,
            unit: normalized.unit,
            packSize: normalized.packSize,
            avgRetailPriceCdmx: Number((normalized.unitPrice * 1.35).toFixed(2)),
            cheapestWholesaleCost: normalized.unitPrice,
            cheapestSupplierId: source.supplierId,
            active: true,
            lastUpdated: new Date().toISOString(),
          };

          db.upsertMasterProduct(newMaster);
          targetMasterProduct = newMaster;
          scraperRun.logs.push(`[AUTO-CATALOG] Creado nuevo producto maestro: "${newMaster.canonicalName}"`);
        }

        if (targetMasterProduct) {
          const priceRecord: PriceRecord = {
            id: `pr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            tenantId: 'tenant-cdmx-01',
            organizationId: 'org-abarrotes-cdmx',
            supplierId: source.supplierId,
            supplierName: source.name,
            sourceId: source.id,
            masterProductId: targetMasterProduct.id,
            productName: targetMasterProduct.canonicalName,
            rawObservationId: rawObs.id,
            price: normalized.unitPrice,
            currency: 'MXN',
            unit: normalized.unit,
            presentation: normalized.presentation,
            packSize: normalized.packSize,
            priceType: normalized.packSize > 1 ? 'CASE' : 'PIECE',
            availability: 'IN_STOCK',
            sourceUrl: raw.sourceUrl,
            observedAt: new Date().toISOString(),
            validFrom: new Date().toISOString(),
            confidence: matchResult.confidence || 0.9,
            status: 'ACTIVE',
            provenance: {
              sourceUrl: raw.sourceUrl,
              adapter: adapter.constructor.name,
              runId,
              capturedAt: new Date().toISOString(),
            },
          };

          const { isPriceChanged } = db.addPriceRecord(priceRecord);
          if (isPriceChanged) {
            scraperRun.priceChanges++;
          }

          // Supplier Offer logic
          const supplierOffer: SupplierOffer = {
            id: `so-${source.supplierId}-${targetMasterProduct.id}`,
            masterProductId: targetMasterProduct.id,
            supplierId: source.supplierId,
            supplierName: source.name,
            price: normalized.unitPrice,
            currency: 'MXN',
            priceType: normalized.packSize > 1 ? 'CASE' : 'PIECE',
            packSize: normalized.packSize,
            observedAt: new Date().toISOString(),
            sourceUrl: raw.sourceUrl,
            availability: 'IN_STOCK',
          };
          db.upsertSupplierOffer(supplierOffer);
        }
      }

      // 3. RECALCULATE STORE BRAIN ARBITRAGE
      this.recalculateArbitrageOpportunities();

      const durationMs = Date.now() - t0;
      scraperRun.durationMs = durationMs;
      scraperRun.completedAt = new Date().toISOString();
      scraperRun.status = scraperRun.errors.length > 0 && scraperRun.productsAccepted === 0 ? 'FAILED' : scraperRun.errors.length > 0 ? 'PARTIAL' : 'SUCCESS';

      if (scraperRun.status === 'FAILED') {
        const errorMsg = scraperRun.errors.join(' | ');
        recoveryEngine.processFailure(source, scraperRun, errorMsg);
      } else {
        scraperRun.logs.push(`[SCHEDULER] Run finalizado en ${durationMs}ms con estado ${scraperRun.status}`);
        recoveryEngine.processSuccess(source, scraperRun);
      }

      db.updateScraperRun(runId, scraperRun);
      
      Telemetry.track('system-scheduler', 'scraper_run_completed', {
        sourceId: source.id,
        sourceName: source.name,
        status: scraperRun.status,
        productsDiscovered: scraperRun.productsDiscovered,
        productsMatched: scraperRun.productsMatched,
        durationMs: scraperRun.durationMs
      }, true);

      return scraperRun;
    } catch (err: any) {
      scraperRun.durationMs = Date.now() - t0;
      scraperRun.completedAt = new Date().toISOString();
      recoveryEngine.processFailure(source, scraperRun, err.message);
      db.updateScraperRun(runId, scraperRun);

      Telemetry.track('system-scheduler', 'scraper_run_failed', {
        sourceId: source.id,
        sourceName: source.name,
        error: err.message
      }, true);

      return scraperRun;
    }
  }

  public async runAllEnabledSources(): Promise<ScraperRun[]> {
    if (this.isRunning) {
      console.log('[SCHEDULER] Ya existe una adquisición en progreso.');
      return [];
    }

    this.isRunning = true;
    const runs: ScraperRun[] = [];
    const sources = db.getSources().filter((s) => s.enabled);

    console.log(`[SCHEDULER] Iniciando corrida global para ${sources.length} fuentes activas...`);

    for (const source of sources) {
      try {
        const run = await this.runSource(source.id, 'SCHEDULED');
        runs.push(run);
      } catch (err: any) {
        console.error(`[SCHEDULER ERROR] Falló fuente ${source.name}: ${err.message}`);
      }
    }

    this.isRunning = false;
    return runs;
  }

  public recalculateArbitrageOpportunities(): ArbitrageOpportunity[] {
    const masterProducts = db.getMasterProducts();
    const priceRecords = db.getPriceRecords();
    const opportunities: ArbitrageOpportunity[] = [];

    for (const master of masterProducts) {
      // Find all observed prices for this master product
      const productPrices = priceRecords.filter((p) => p.masterProductId === master.id && p.price > 0);
      if (productPrices.length < 2) continue;

      // Sort ascending by price
      productPrices.sort((a, b) => a.price - b.price);

      const cheapest = productPrices[0];
      const highest = productPrices[productPrices.length - 1];

      // If price difference is at least $1.50 MXN or 5%
      const savingPerUnit = Number((highest.price - cheapest.price).toFixed(2));
      const savingPercent = Number(((savingPerUnit / highest.price) * 100).toFixed(1));

      if (savingPerUnit >= 1.0 && savingPercent >= 3.0) {
        const suggestedPurchaseUnits = master.packSize || 12;
        const totalPotentialSaving = Number((savingPerUnit * suggestedPurchaseUnits).toFixed(2));

        opportunities.push({
          id: `arb-${master.id}-${cheapest.supplierId}`,
          masterProductId: master.id,
          productName: master.canonicalName,
          barcode: master.barcode,
          category: master.category,
          presentation: master.presentation,
          currentSupplierCost: highest.price,
          currentSupplierName: highest.supplierName,
          bestSupplierPrice: cheapest.price,
          bestSupplierName: cheapest.supplierName,
          bestSupplierSourceUrl: cheapest.sourceUrl,
          potentialSavingPerUnit: savingPerUnit,
          potentialSavingPercent: savingPercent,
          suggestedPurchaseUnits,
          totalPotentialSaving,
          confidence: cheapest.confidence,
          cdmxCoverageVerified: true,
          actionRequired: `Comprar ${suggestedPurchaseUnits} unidades en ${cheapest.supplierName} en lugar de ${highest.supplierName} para ahorrar $${totalPotentialSaving} MXN`,
          detectedAt: new Date().toISOString(),
        });
      }
    }

    db.setArbitrageOpportunities(opportunities);
    return opportunities;
  }

  public startCron() {
    console.log('[SCHEDULER] 24/7 Continuous Autonomous Acquisition & AI Agent Engine Initialized.');

    const executeContinuousRound = async () => {
      if (this.isRunning) return;
      console.log(`[SCHEDULER 24/7] Running autonomous scraping cycle & 11 AI Agents across enabled sources at ${new Date().toISOString()}...`);
      try {
        await this.runAllEnabledSources();
        this.recalculateArbitrageOpportunities();
        
        console.log('[SCHEDULER 24/7] Running 11 AI Agents (Discovery, Matching, Price, Inventory, Reorder, Opportunity)...');
        await agentOrchestrator.executeFullPipeline();
        
        console.log('[SCHEDULER 24/7] Syncing mini cloud database file to Google Sheets layer...');
        googleSheetsIntelligenceAgent.syncFromDatabase();
        googleSheetsIntelligenceAgent.exportMiniCloudDatabaseFile();
      } catch (err: any) {
        console.error('[SCHEDULER 24/7 ERROR]', err.message);
      }
    };

    // Execute initial round 10 seconds after boot
    this.initialTimeout = setTimeout(() => {
      executeContinuousRound();
    }, 10000);

    // Continuous 24/7 interval every 60 minutes to preserve Gemini Quota
    this.cronInterval = setInterval(() => {
      executeContinuousRound();
    }, 60 * 60 * 1000);
  }

  public stopCron() {
    if (this.initialTimeout) {
      clearTimeout(this.initialTimeout);
      this.initialTimeout = null;
    }
    if (this.cronInterval) {
      clearInterval(this.cronInterval);
      this.cronInterval = null;
    }
    console.log('[SCHEDULER] 24/7 Continuous Autonomous Acquisition & AI Agent Engine Stopped.');
  }
}

export const scheduler = new AcquisitionScheduler();
