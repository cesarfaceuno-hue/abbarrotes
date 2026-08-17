import { ParsedProduct } from '../engine/productMatching.js';
import { SupplierSource } from '../types.js';

export interface SourceDiscoveryResult {
  sourceId: string;
  sourceUrl: string;
  httpStatus: number;
  latencyMs: number;
  robotsStatus: 'ALLOWED' | 'RESTRICTED' | 'DISALLOW_ALL';
  sitemapStatus: 'FOUND' | 'NOT_FOUND';
  pagesDiscovered: string[];
}

export interface AdapterFetchResult {
  sourceId: string;
  supplierId: string;
  supplierName: string;
  pagesVisited: number;
  rawProducts: ParsedProduct[];
  rawContentLength?: number;
  logs: string[];
  errors: string[];
  warnings: string[];
}

export interface BaseSourceAdapter {
  sourceId: string;
  supplierId: string;
  supplierName: string;
  discover(source: SupplierSource): Promise<SourceDiscoveryResult>;
  fetch(source: SupplierSource, options?: { maxPages?: number; categoryLimit?: number }): Promise<AdapterFetchResult>;
}
