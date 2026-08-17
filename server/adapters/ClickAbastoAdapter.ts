import { BaseSourceAdapter, SourceDiscoveryResult, AdapterFetchResult } from './types.js';
import { SupplierSource } from '../types.js';
import { ParsedProduct } from '../engine/productMatching.js';
import { liveDataFetcher } from '../engine/LiveDataFetcher.js';
import { robotsParser } from '../engine/RobotsParser.js';

export class ClickAbastoAdapter implements BaseSourceAdapter {
  public sourceId = 'source-click-abasto';
  public supplierId = 'supp-click-abasto';
  public supplierName = 'Click Abasto CDMX';

  private endpoint = 'https://clickabasto.com/products.json?limit=50';

  public async discover(source: SupplierSource): Promise<SourceDiscoveryResult> {
    const t0 = Date.now();
    await robotsParser.fetchAndParse('https://clickabasto.com');
    
    if (!robotsParser.isAllowed('/products.json')) {
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

    const res = await liveDataFetcher.fetch('https://clickabasto.com/products.json?limit=1');
    return {
      sourceId: this.sourceId,
      sourceUrl: source.sourceUrl,
      httpStatus: res.httpStatus,
      latencyMs: Date.now() - t0,
      robotsStatus: 'ALLOWED',
      sitemapStatus: 'FOUND',
      pagesDiscovered: [this.endpoint],
    };
  }

  public async fetch(source: SupplierSource): Promise<AdapterFetchResult> {
    const logs: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const rawProducts: ParsedProduct[] = [];

    logs.push(`[ClickAbastoAdapter] Consultando productos: ${this.endpoint}`);

    try {
      await robotsParser.fetchAndParse('https://clickabasto.com');
      
      const t0 = Date.now();
      const res = await liveDataFetcher.fetch(this.endpoint, {
        headers: { 'Accept': 'application/json' },
      });

      if (res.httpStatus !== 200) {
        errors.push(`ClickAbasto HTTP status ${res.httpStatus}`);
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

      const data = JSON.parse(res.body);
      const items = data.products || [];
      logs.push(`[ClickAbastoAdapter] Recibidos ${items.length} productos en ${Date.now() - t0}ms.`);

      for (const item of items) {
        const variant = item.variants?.[0];
        const price = variant ? parseFloat(variant.price) : 0;
        const sku = variant?.sku || '';
        const barcode = variant?.barcode || undefined;
        const productUrl = `https://clickabasto.com/products/${item.handle}`;

        if (item.title && price > 0) {
          rawProducts.push({
            rawName: item.title,
            rawBrand: item.vendor || 'Central de Abasto CDMX',
            rawSku: sku,
            rawBarcode: barcode,
            rawPrice: price,
            rawUnit: 'pieza',
            rawCategory: item.product_type || 'Abarrotes',
            rawAvailability: variant?.available ? 'En Stock' : 'Agotado',
            sourceUrl: productUrl,
            rawPayload: {
              id: item.id,
              tags: item.tags,
              images: item.images?.map((img: any) => img.src),
            },
          });
        }
      }

      logs.push(`[ClickAbastoAdapter] Extraídos ${rawProducts.length} productos procesados.`);
    } catch (err: any) {
      errors.push(`Error en fetch ClickAbasto: ${err.message}`);
      logs.push(`[ClickAbastoAdapter ERROR] ${err.message}`);
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
