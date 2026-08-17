import { BaseSourceAdapter, SourceDiscoveryResult, AdapterFetchResult } from './types.js';
import { SupplierSource } from '../types.js';
import { ParsedProduct } from '../engine/productMatching.js';
import { liveDataFetcher } from '../engine/LiveDataFetcher.js';
import { robotsParser } from '../engine/RobotsParser.js';

export class MayoreoTotalAdapter implements BaseSourceAdapter {
  public sourceId = 'source-mayoreo-total';
  public supplierId = 'supp-mayoreo-total';
  public supplierName = 'Mayoreo Total México';

  private endpoint = 'https://www.mayoreototal.mx/collections/abarrotes/products.json?limit=50';

  public async discover(source: SupplierSource): Promise<SourceDiscoveryResult> {
    const t0 = Date.now();
    await robotsParser.fetchAndParse('https://www.mayoreototal.mx');
    
    if (!robotsParser.isAllowed('https://www.mayoreototal.mx/products.json')) {
      return {
        sourceId: this.sourceId,
        sourceUrl: source.sourceUrl,
        httpStatus: 403,
        latencyMs: Date.now() - t0,
        robotsStatus: 'RESTRICTED',
        sitemapStatus: 'NOT_FOUND',
        pagesDiscovered: [],
      };
    }

    const res = await liveDataFetcher.fetch('https://www.mayoreototal.mx/products.json?limit=1');
    const latencyMs = Date.now() - t0;

    return {
      sourceId: this.sourceId,
      sourceUrl: source.sourceUrl,
      httpStatus: res.httpStatus,
      latencyMs,
      robotsStatus: 'ALLOWED',
      sitemapStatus: 'FOUND',
      pagesDiscovered: [this.endpoint],
    };
  }

  public async fetch(source: SupplierSource, options?: { maxPages?: number }): Promise<AdapterFetchResult> {
    const logs: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const rawProducts: ParsedProduct[] = [];

    logs.push(`[MayoreoTotalAdapter] Conectando al endpoint de catálogo: ${this.endpoint}`);

    try {
      await robotsParser.fetchAndParse('https://www.mayoreototal.mx');
      
      if (!robotsParser.isAllowed(this.endpoint)) {
        warnings.push(`URL blocked by robots.txt: ${this.endpoint}`);
        return {
            sourceId: this.sourceId,
            supplierId: this.supplierId,
            supplierName: this.supplierName,
            pagesVisited: 0,
            rawProducts: [],
            logs,
            errors,
            warnings,
        };
      }

      const t0 = Date.now();
      const res = await liveDataFetcher.fetch(this.endpoint, {
        headers: { 'Accept': 'application/json' },
      });

      if (res.httpStatus !== 200) {
        errors.push(`Mayoreo Total HTTP Status ${res.httpStatus}`);
        return {
          sourceId: this.sourceId,
          supplierId: this.supplierId,
          supplierName: this.supplierName,
          pagesVisited: 1,
          rawProducts: [],
          logs,
          errors,
          warnings,
        };
      }

      const json = JSON.parse(res.body);
      const dt = Date.now() - t0;
      const products = json.products || [];

      logs.push(`[MayoreoTotalAdapter] Recibidos ${products.length} productos JSON en ${dt}ms.`);

      for (const p of products) {
        const variant = p.variants?.[0];
        const rawPrice = variant ? parseFloat(variant.price) || 0 : 0;
        const rawSku = variant?.sku || '';
        const rawBarcode = variant?.barcode || (rawSku.length >= 10 ? rawSku.replace(/\D/g, '') : undefined);
        const productUrl = `https://www.mayoreototal.mx/products/${p.handle}`;

        if (p.title && rawPrice > 0) {
          rawProducts.push({
            rawName: p.title,
            rawBrand: p.vendor || 'Genérico',
            rawSku,
            rawBarcode,
            rawPrice,
            rawUnit: 'caja/paquete',
            rawCategory: p.product_type || 'Abarrotes Mayoreo',
            rawAvailability: 'En Stock',
            sourceUrl: productUrl,
            rawPayload: {
              shopifyId: p.id,
              handle: p.handle,
              tags: p.tags,
              variantsCount: p.variants?.length,
            },
          });
        }
      }

      logs.push(`[MayoreoTotalAdapter] Procesados ${rawProducts.length} productos con precio válido.`);
    } catch (err: any) {
      errors.push(`Error en fetch Mayoreo Total: ${err.message}`);
      logs.push(`[MayoreoTotalAdapter ERROR] ${err.message}`);
    }

    return {
      sourceId: this.sourceId,
      supplierId: this.supplierId,
      supplierName: this.supplierName,
      pagesVisited: 1,
      rawProducts,
      logs,
      errors,
      warnings,
    };
  }
}
