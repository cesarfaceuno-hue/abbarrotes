import { BaseSourceAdapter, SourceDiscoveryResult, AdapterFetchResult } from './types.js';
import { SupplierSource } from '../types.js';
import { ParsedProduct } from '../engine/productMatching.js';
import { liveDataFetcher } from '../engine/LiveDataFetcher.js';
import { robotsParser } from '../engine/RobotsParser.js';

export class ZorroAdapter implements BaseSourceAdapter {
  public sourceId = 'source-zorro';
  public supplierId = 'supp-zorro';
  public supplierName = 'Grupo Zorro Abarrotero';

  public async discover(source: SupplierSource): Promise<SourceDiscoveryResult> {
    const t0 = Date.now();
    await robotsParser.fetchAndParse('https://zorroabarrotero.com.mx');
    
    if (!robotsParser.isAllowed('https://zorroabarrotero.com.mx/sucursales/')) {
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

    const res = await liveDataFetcher.fetch('https://zorroabarrotero.com.mx/sucursales/');
    const latencyMs = Date.now() - t0;

    return {
      sourceId: this.sourceId,
      sourceUrl: source.sourceUrl,
      httpStatus: res.httpStatus,
      latencyMs,
      robotsStatus: 'ALLOWED',
      sitemapStatus: 'FOUND',
      pagesDiscovered: ['https://zorroabarrotero.com.mx/promociones/', 'https://zorroabarrotero.com.mx/sucursales/'],
    };
  }

  public async fetch(source: SupplierSource): Promise<AdapterFetchResult> {
    const logs: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const rawProducts: ParsedProduct[] = [];

    logs.push('[ZorroAdapter] Analizando catálogo y sucursales en CDMX.');

    try {
      await robotsParser.fetchAndParse('https://zorroabarrotero.com.mx');
      const url = 'https://zorroabarrotero.com.mx/promociones/';
      
      if (!robotsParser.isAllowed(url)) {
        warnings.push(`URL blocked by robots.txt: ${url}`);
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

      const res = await liveDataFetcher.fetch(url);

      if (res.httpStatus !== 200) {
        warnings.push(`Zorro promociones HTTP ${res.httpStatus}`);
      } else {
        logs.push('[ZorroAdapter] Conexión exitosa a portal de promociones.');
      }

      // No structured price exists, it requires OCR on folletos
      // Returning 0 products to indicate PARTIAL/No struct data instead of faking it.
      logs.push('[ZorroAdapter] No se detectó catálogo estructurado, se requiere OCR de folleto. Retornando 0 productos estructurados.');
      warnings.push('acquisitionStatus = PARTIAL (Precios estructurados no encontrados, solo imágenes/PDF)');

    } catch (err: any) {
      errors.push(`Error en fetch Zorro: ${err.message}`);
      logs.push(`[ZorroAdapter ERROR] ${err.message}`);
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
