import { db } from '../db/database.js';
import { RawProductObservation, SupplierSource } from '../types.js';
import { ProductMatchingEngine, NormalizedProduct } from './productMatching.js';

/**
 * DiscoveryAgent
 * Purpose: Extract, Normalize, and Match raw supplier data into Master Products.
 */
export class DiscoveryAgent {
  public agentId = 'discovery-agent';
  public name = 'Product Discovery Agent';

  public async discover(sourceId: string, observations: RawProductObservation[]): Promise<any> {
    const results = [];
    const masterCatalog = db.getMasterProducts();

    for (const obs of observations) {
      // 1. Normalize
      const normalized = ProductMatchingEngine.normalizeProduct({
        rawName: obs.productNameRaw,
        rawBrand: obs.brandRaw,
        rawSku: obs.skuRaw,
        rawBarcode: obs.eanRaw,
        rawPrice: obs.priceRaw,
        rawCategory: obs.categoryRaw,
        sourceUrl: obs.productUrl || '',
        rawPayload: obs.metadata || {}
      });

      // 2. Validate
      const quality = ProductMatchingEngine.validateQuality(normalized);
      if (!quality.isValid) {
        results.push({ obs, status: 'REJECTED', reason: quality.flags.join(', ') });
        continue;
      }

      // 3. Match
      const match = ProductMatchingEngine.matchProduct(normalized, masterCatalog);

      // 4. Act
      if (match.masterProduct) {
        // Update Price Record
        db.addPriceRecord({
          id: `price-${Date.now()}-${Math.random()}`,
          tenantId: 'tenant-cdmx-01',
          organizationId: 'org-cdmx',
          supplierId: sourceId,
          supplierName: obs.sourceName,
          sourceId: sourceId,
          masterProductId: match.masterProduct.id,
          productName: match.masterProduct.canonicalName,
          rawObservationId: obs.id,
          price: normalized.rawPrice,
          currency: 'MXN',
          unit: normalized.unit,
          presentation: normalized.presentation,
          packSize: normalized.packSize,
          priceType: 'PIECE',
          availability: 'IN_STOCK',
          sourceUrl: normalized.sourceUrl,
          observedAt: new Date().toISOString(),
          validFrom: new Date().toISOString(),
          confidence: match.confidence,
          status: 'ACTIVE',
          provenance: {
            sourceUrl: normalized.sourceUrl,
            adapter: 'Default',
            runId: obs.scraperRunId,
            capturedAt: obs.observedAt
          }
        });
        results.push({ obs, status: 'MATCHED', masterId: match.masterProduct.id, confidence: match.confidence });
      } else {
        // Create new Master Product
        if (match.confidence < 0.70) {
            results.push({ obs, status: 'REVIEW', reason: 'Low confidence match' });
        } else {
            const newId = `prod-${Date.now()}-${Math.random()}`;
            db.upsertMasterProduct({
                id: newId,
                canonicalName: normalized.normalizedName,
                brand: normalized.normalizedBrand,
                category: normalized.normalizedCategory,
                presentation: normalized.presentation,
                unit: normalized.unit,
                packSize: normalized.packSize,
                avgRetailPriceCdmx: normalized.rawPrice,
                cheapestWholesaleCost: normalized.rawPrice,
                cheapestSupplierId: sourceId,
                active: true,
                lastUpdated: new Date().toISOString()
            });
            results.push({ obs, status: 'CREATED', newId });
        }
      }
    }
    return results;
  }
}

export const discoveryAgent = new DiscoveryAgent();
