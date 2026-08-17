import { BaseSourceAdapter, SourceDiscoveryResult, AdapterFetchResult } from './types.js';
import { SupplierSource } from '../types.js';
import { ParsedProduct } from '../engine/productMatching.js';
import { liveDataFetcher } from '../engine/LiveDataFetcher.js';
import { robotsParser } from '../engine/RobotsParser.js';

export class MercadoLibreAdapter implements BaseSourceAdapter {
  public sourceId = 'source-mercado-libre';
  public supplierId = 'supp-mercado-libre';
  public supplierName = 'Mercado Libre Supermercado CDMX';

  private endpoint = 'https://api.mercadolibre.com/sites/MLM/search?q=abarrotes%20mayoreo&limit=50';

  public async discover(source: SupplierSource): Promise<SourceDiscoveryResult> {
    const t0 = Date.now();
    await robotsParser.fetchAndParse('https://www.mercadolibre.com.mx');

    const res = await liveDataFetcher.fetch(this.endpoint);
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

    logs.push(`[MercadoLibreAdapter] Consultando API Mercado Libre Supermercado: ${this.endpoint}`);

    try {
      const t0 = Date.now();
      const res = await liveDataFetcher.fetch(this.endpoint, {
        headers: { 'Accept': 'application/json' },
      });

      if (res.httpStatus !== 200) {
        errors.push(`Mercado Libre API status ${res.httpStatus}`);
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
      const items = data.results || [];
      logs.push(`[MercadoLibreAdapter] Recibidos ${items.length} artículos en ${Date.now() - t0}ms.`);

      for (const item of items) {
        const rawPrice = item.price || 0;
        const rawSku = item.id;
        const productUrl = item.permalink || `https://articulo.mercadolibre.com.mx/${item.id}`;

        if (item.title && rawPrice > 0) {
          rawProducts.push({
            rawName: item.title,
            rawBrand: item.attributes?.find((a: any) => a.id === 'BRAND')?.value_name || 'Varios / Mercado Libre',
            rawSku,
            rawBarcode: item.attributes?.find((a: any) => a.id === 'GTIN')?.value_name || undefined,
            rawPrice,
            rawUnit: 'pieza',
            rawCategory: 'Abarrotes / Supermercado',
            rawAvailability: item.available_quantity > 0 ? 'En Stock' : 'Agotado',
            sourceUrl: productUrl,
            rawPayload: {
              id: item.id,
              seller: item.seller?.nickname,
              shipping: item.shipping?.free_shipping,
              thumbnail: item.thumbnail,
            },
          });
        }
      }

      logs.push(`[MercadoLibreAdapter] Extraídos ${rawProducts.length} productos procesados.`);
    } catch (err: any) {
      errors.push(`Error en fetch Mercado Libre: ${err.message}`);
      logs.push(`[MercadoLibreAdapter ERROR] ${err.message}`);
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
