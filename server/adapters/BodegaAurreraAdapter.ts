import { BaseSourceAdapter, SourceDiscoveryResult, AdapterFetchResult } from './types.js';
import { SupplierSource } from '../types.js';
import { ParsedProduct } from '../engine/productMatching.js';
import { liveDataFetcher } from '../engine/LiveDataFetcher.js';
import { robotsParser } from '../engine/RobotsParser.js';

export class BodegaAurreraAdapter implements BaseSourceAdapter {
  public sourceId = 'source-bodega-aurrera';
  public supplierId = 'supp-bodega-aurrera';
  public supplierName = 'Bodega Aurrera / Walmart CDMX';

  private endpoint = 'https://www.bodegaaurrera.com.mx/browse/abarrotes';

  public async discover(source: SupplierSource): Promise<SourceDiscoveryResult> {
    const t0 = Date.now();
    await robotsParser.fetchAndParse('https://www.bodegaaurrera.com.mx');

    const res = await liveDataFetcher.fetch(this.endpoint);
    return {
      sourceId: this.sourceId,
      sourceUrl: source.sourceUrl,
      httpStatus: res.httpStatus,
      latencyMs: Date.now() - t0,
      robotsStatus: robotsParser.isAllowed('/browse/abarrotes') ? 'ALLOWED' : 'RESTRICTED',
      sitemapStatus: 'FOUND',
      pagesDiscovered: [this.endpoint],
    };
  }

  public async fetch(source: SupplierSource): Promise<AdapterFetchResult> {
    const logs: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const rawProducts: ParsedProduct[] = [];

    logs.push(`[BodegaAurreraAdapter] Consultando catálogo Bodega Aurrera: ${this.endpoint}`);

    try {
      const res = await liveDataFetcher.fetch(this.endpoint);

      if (res.httpStatus !== 200) {
        if (res.httpStatus === 403 || res.httpStatus === 429) {
          warnings.push(`Bodega Aurrera restringió acceso (HTTP ${res.httpStatus}). Registrado estado BLOCKED.`);
        } else {
          errors.push(`Bodega Aurrera HTTP status ${res.httpStatus}`);
        }
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

      // Parse JSON-LD or Next.js / React hydration scripts
      const jsonLdMatches = res.body.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
      if (jsonLdMatches) {
        for (const m of jsonLdMatches) {
          try {
            const cleanJson = m.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
            const parsed = JSON.parse(cleanJson);
            if (parsed['@type'] === 'Product' || parsed.name) {
              const rawPrice = parseFloat(parsed.offers?.price || parsed.offers?.[0]?.price || 0);
              if (parsed.name && rawPrice > 0) {
                rawProducts.push({
                  rawName: parsed.name,
                  rawBrand: parsed.brand?.name || 'Great Value / Aurrera',
                  rawSku: parsed.sku,
                  rawBarcode: parsed.gtin13 || parsed.gtin8,
                  rawPrice,
                  rawUnit: 'pieza',
                  rawCategory: 'Abarrotes',
                  rawAvailability: 'En Stock',
                  sourceUrl: parsed.url || this.endpoint,
                  rawPayload: parsed,
                });
              }
            }
          } catch {
            // ignore
          }
        }
      }

      logs.push(`[BodegaAurreraAdapter] Extraídos ${rawProducts.length} productos procesados.`);
    } catch (err: any) {
      errors.push(`Error en fetch Bodega Aurrera: ${err.message}`);
      logs.push(`[BodegaAurreraAdapter ERROR] ${err.message}`);
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
