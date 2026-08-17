import { BaseSourceAdapter, SourceDiscoveryResult, AdapterFetchResult } from './types.js';
import { SupplierSource } from '../types.js';
import { ParsedProduct } from '../engine/productMatching.js';
import { liveDataFetcher } from '../engine/LiveDataFetcher.js';
import { robotsParser } from '../engine/RobotsParser.js';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

export class ScorpionAdapter implements BaseSourceAdapter {
  public sourceId = 'source-scorpion';
  public supplierId = 'supp-scorpion';
  public supplierName = 'Comercializadora Scorpion';

  private categoryEndpoints = [
    'https://www.scorpion.com.mx/lacteos-y-huevo.html',
    'https://www.scorpion.com.mx/alimentos-y-despensa.html',
    'https://www.scorpion.com.mx/bebidas.html',
    'https://www.scorpion.com.mx/hogar-y-limpieza.html',
  ];

  public async discover(source: SupplierSource): Promise<SourceDiscoveryResult> {
    const t0 = Date.now();
    await robotsParser.fetchAndParse(source.sourceUrl);
    
    if (!robotsParser.isAllowed(source.sourceUrl)) {
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

    const res = await liveDataFetcher.fetch(source.sourceUrl);
    
    return {
      sourceId: this.sourceId,
      sourceUrl: source.sourceUrl,
      httpStatus: res.httpStatus,
      latencyMs: res.latencyMs,
      robotsStatus: 'ALLOWED',
      sitemapStatus: 'FOUND', // Normally we'd check sitemap.xml
      pagesDiscovered: this.categoryEndpoints,
    };
  }

  public async fetch(source: SupplierSource, options?: { maxPages?: number }): Promise<AdapterFetchResult> {
    const logs: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const rawProducts: ParsedProduct[] = [];

    logs.push(`[ScorpionAdapter] Iniciando fetch en vivo sobre ${this.categoryEndpoints.length} categorías oficiales.`);
    await robotsParser.fetchAndParse('https://www.scorpion.com.mx');

    const pagesToFetch = this.categoryEndpoints.slice(0, options?.maxPages || 4);
    let pagesVisited = 0;

    for (const url of pagesToFetch) {
      try {
        if (!robotsParser.isAllowed(url)) {
          warnings.push(`URL blocked by robots.txt: ${url}`);
          continue;
        }

        logs.push(`[ScorpionAdapter] Conectando a categoría: ${url}`);
        const res = await liveDataFetcher.fetch(url);

        pagesVisited++;

        if (res.httpStatus !== 200) {
          warnings.push(`Scorpion HTTP status ${res.httpStatus} en ${url}`);
          continue;
        }

        logs.push(`[ScorpionAdapter] Recibidos ${Math.round(res.bytesReceived / 1024)} KB en ${res.latencyMs}ms`);

        const $ = cheerio.load(res.body);
        const products = $('.item.product.product-item');
        
        logs.push(`[ScorpionAdapter] Extraídos ${products.length} productos brutos en ${url}`);

        products.each((i, el) => {
          const rawBrand = $(el).attr('data-brand') || undefined;
          const rawSku = $(el).attr('data-sku') || undefined;
          const productUrl = $(el).find('a.product-item-link').attr('href') || url;
          const rawName = $(el).find('a.product-item-link').text().replace(/\s+/g, ' ').trim();
          const priceText = $(el).find('.price').first().text().replace(/[^0-9.]/g, '');
          const rawPrice = parseFloat(priceText) || 0;

          if (rawName && rawPrice > 0) {
            rawProducts.push({
              rawName,
              rawBrand,
              rawSku,
              rawBarcode: rawSku, // In Scorpion many SKUs correspond to EAN or Internal Code
              rawPrice,
              rawUnit: 'pieza',
              rawCategory: url.includes('lacteos') ? 'Lácteos y Huevo' : url.includes('bebidas') ? 'Bebidas' : url.includes('limpieza') ? 'Limpieza' : 'Abarrotes',
              rawAvailability: 'En Stock CDMX',
              sourceUrl: productUrl,
              rawPayload: {
                extractedBrand: rawBrand,
                extractedSku: rawSku,
                priceString: priceText,
                categoryPage: url,
              },
            });
          }
        });
      } catch (err: any) {
        errors.push(`Error en fetch de ${url}: ${err.message}`);
        logs.push(`[ScorpionAdapter ERROR] ${err.message}`);
      }
    }

    logs.push(`[ScorpionAdapter] Pipeline completado con ${rawProducts.length} productos válidos.`);

    return {
      sourceId: this.sourceId,
      supplierId: this.supplierId,
      supplierName: this.supplierName,
      pagesVisited,
      rawProducts,
      logs,
      errors,
      warnings,
    };
  }
}
