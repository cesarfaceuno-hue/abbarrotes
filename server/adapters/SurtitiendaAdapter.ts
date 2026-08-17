import { BaseSourceAdapter, SourceDiscoveryResult, AdapterFetchResult } from './types.js';
import { SupplierSource } from '../types.js';
import { ParsedProduct } from '../engine/productMatching.js';
import { liveDataFetcher } from '../engine/LiveDataFetcher.js';
import { robotsParser } from '../engine/RobotsParser.js';

export class SurtitiendaAdapter implements BaseSourceAdapter {
  public sourceId = 'source-surtitienda';
  public supplierId = 'supp-surtitienda';
  public supplierName = 'Surti-Tienda Abarrotes';

  private endpoint = 'https://www.surtitienda.mx/api/catalog_system/pub/products/search?_from=0&_to=40';

  public async discover(source: SupplierSource): Promise<SourceDiscoveryResult> {
    const t0 = Date.now();
    await robotsParser.fetchAndParse('https://www.surtitienda.mx');
    
    if (!robotsParser.isAllowed('/api/catalog_system/pub/products/search')) {
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

    const res = await liveDataFetcher.fetch('https://www.surtitienda.mx/api/catalog_system/pub/products/search?_from=0&_to=1');
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

  public async fetch(source: SupplierSource): Promise<AdapterFetchResult> {
    const logs: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const rawProducts: ParsedProduct[] = [];

    logs.push(`[SurtitiendaAdapter] Consultando VTEX Catalog API: ${this.endpoint}`);

    try {
      await robotsParser.fetchAndParse('https://www.surtitienda.mx');
      
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
        errors.push(`Surtitienda HTTP status ${res.httpStatus}`);
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

      const items = JSON.parse(res.body);
      const dt = Date.now() - t0;
      logs.push(`[SurtitiendaAdapter] Recibidos ${items.length} artículos en ${dt}ms.`);

      for (const item of items) {
        const defaultItem = item.items?.[0];
        const seller = defaultItem?.sellers?.[0];
        const rawPrice = seller?.commertialOffer?.Price || 0;
        const rawSku = defaultItem?.itemId || '';
        const rawBarcode = defaultItem?.ean || undefined;
        const productUrl = item.link || `https://www.surtitienda.mx/${item.linkText}/p`;

        if (item.productName && rawPrice > 0) {
          rawProducts.push({
            rawName: item.productName,
            rawBrand: item.brand || 'Genérico',
            rawSku,
            rawBarcode,
            rawPrice,
            rawUnit: 'pieza',
            rawCategory: item.categories?.[0] ? item.categories[0].replace(/\//g, ' ').trim() : 'Abarrotes',
            rawAvailability: seller?.commertialOffer?.AvailableQuantity > 0 ? 'En Stock' : 'Agotado',
            sourceUrl: productUrl,
            rawPayload: {
              productId: item.productId,
              brandId: item.brandId,
              sellers: item.items?.[0]?.sellers?.map((s: any) => ({ name: s.sellerName, price: s.commertialOffer?.Price })),
            },
          });
        }
      }

      logs.push(`[SurtitiendaAdapter] Extraídos ${rawProducts.length} productos con precio comercial.`);
    } catch (err: any) {
      errors.push(`Error en fetch Surtitienda: ${err.message}`);
      logs.push(`[SurtitiendaAdapter ERROR] ${err.message}`);
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
