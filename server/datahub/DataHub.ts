import { db } from '../db/database.js';
import { MasterProduct, PriceRecord, RawProductObservation } from '../types.js';

export class ScraperDataHub {
  private static instance: ScraperDataHub;

  private constructor() {}

  public static getInstance(): ScraperDataHub {
    if (!ScraperDataHub.instance) {
      ScraperDataHub.instance = new ScraperDataHub();
    }
    return ScraperDataHub.instance;
  }

  public getProduct(id: string): MasterProduct | undefined {
    return db.getMasterProductById(id);
  }

  public findProductBySKU(sku: string): MasterProduct | undefined {
    return db.getMasterProductBySku(sku);
  }

  public findProductBySourceSKU(sourceId: string, sku: string): MasterProduct | undefined {
    const products = db.getMasterProducts();
    return products.find(p => p.sku === sku && p.cheapestSupplierId === sourceId);
  }

  public findCanonicalProduct(name: string, brand: string): MasterProduct | undefined {
    const products = db.getMasterProducts();
    return products.find(
      p => p.canonicalName.toLowerCase() === name.toLowerCase() && p.brand.toLowerCase() === brand.toLowerCase()
    );
  }

  public createProduct(product: MasterProduct): MasterProduct {
    db.upsertMasterProduct(product);
    return product;
  }

  public updateProduct(id: string, updates: Partial<MasterProduct>): MasterProduct | undefined {
    const existing = db.getMasterProductById(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, lastUpdated: new Date().toISOString() };
    db.upsertMasterProduct(updated);
    return updated;
  }

  public upsertProduct(product: MasterProduct): MasterProduct {
    db.upsertMasterProduct(product);
    return product;
  }

  public recordPriceObservation(productId: string, sourceId: string, sku: string, oldPrice: number, newPrice: number, currency: string, timestamp: string, productName: string) {
    if (oldPrice !== newPrice) {
      const recordId = `price-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const priceRecord: PriceRecord = {
        id: recordId,
        tenantId: 'tenant-cdmx-01',
        organizationId: 'org-cdmx-01',
        supplierId: sourceId,
        supplierName: sourceId.toUpperCase(),
        sourceId: sourceId,
        masterProductId: productId,
        productName: productName,
        rawObservationId: '',
        price: newPrice,
        previousPrice: oldPrice > 0 ? oldPrice : undefined,
        changePercent: oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0,
        currency: 'MXN',
        unit: 'pieza',
        presentation: 'PZA',
        packSize: 1,
        priceType: 'PIECE',
        availability: 'IN_STOCK',
        sourceUrl: '',
        observedAt: timestamp,
        validFrom: timestamp,
        confidence: 100,
        status: 'ACTIVE',
        provenance: {
          sourceUrl: "",
          adapter: "DataHub",
          runId: "auto",
          capturedAt: timestamp
        }
      };
      db.addPriceRecord(priceRecord);
    }
  }

  public recordAvailability(productId: string, sourceId: string, availability: string, timestamp: string) {
  }

  public recordScraperObservation(obs: any) {
    const { product_id, source_id, sku, name, brand, category, price, currency, unit, availability, product_url, image_url, scraped_at } = obs;

    let existingProduct = this.getProduct(product_id);
    if (!existingProduct && sku) existingProduct = this.findProductBySKU(sku);
    if (!existingProduct && name && brand) existingProduct = this.findCanonicalProduct(name, brand);

    let finalProduct: MasterProduct;
    let oldPrice = 0;
    let priceChanged = false;

    if (existingProduct) {
      oldPrice = existingProduct.avgRetailPriceCdmx || 0;
      finalProduct = {
        ...existingProduct,
        canonicalName: name || existingProduct.canonicalName,
        brand: brand || existingProduct.brand,
        category: category || existingProduct.category,
        sku: sku || existingProduct.sku,
        avgRetailPriceCdmx: price !== undefined ? Number(price) : existingProduct.avgRetailPriceCdmx,
        cheapestWholesaleCost: price !== undefined ? Number(price) : existingProduct.cheapestWholesaleCost,
        cheapestSupplierId: source_id || existingProduct.cheapestSupplierId,
        active: availability !== 'out_of_stock',
        lastUpdated: scraped_at || new Date().toISOString()
      };
      if (price !== undefined && oldPrice !== Number(price)) {
        priceChanged = true;
      }
      this.updateProduct(existingProduct.id, finalProduct);
    } else {
      const assignedId = product_id || (sku ? `prod-${sku}` : `prod-ingest-${Date.now()}`);
      finalProduct = {
        id: assignedId,
        canonicalName: name || '',
        brand: brand || '',
        category: category || '',
        subcategory: 'General',
        sku: sku || '',
        presentation: 'PZA',
        unit: unit || 'pieza',
        packSize: 1,
        avgRetailPriceCdmx: price !== undefined ? Number(price) : 0,
        cheapestWholesaleCost: price !== undefined ? Number(price) : 0,
        cheapestSupplierId: source_id || '',
        active: availability !== 'out_of_stock',
        lastUpdated: scraped_at || new Date().toISOString()
      };
      this.createProduct(finalProduct);
      priceChanged = true;
    }

    if (priceChanged) {
      this.recordPriceObservation(finalProduct.id, source_id || 'unknown', sku || '', oldPrice, Number(price), currency || 'MXN', scraped_at || new Date().toISOString(), finalProduct.canonicalName);
      
      import('../engine/AgentEventSystem.js').then(({ agentEventSystem }) => {
        agentEventSystem.emit('PRICE_CHANGED', { productId: finalProduct.id, oldPrice, newPrice: Number(price) });
      }).catch(() => {});
    }

    const rawObsId = `obs-${source_id}-${sku || Date.now()}`;
    const rawObs: RawProductObservation = {
      id: rawObsId,
      sourceRecordId: rawObsId,
      sourceId: source_id || 'unknown',
      sourceName: source_id || 'unknown',
      supplierId: source_id || 'unknown',
      scraperRunId: 'auto',
      observedAt: scraped_at || new Date().toISOString(),
      productNameRaw: name || '',
      brandRaw: brand,
      categoryRaw: category,
      skuRaw: sku,
      priceRaw: price !== undefined ? Number(price) : 0,
      currencyRaw: (currency as any) || 'MXN',
      productUrl: product_url,
      imageUrl: image_url,
      availabilityRaw: availability,
      httpStatus: 200,
      extractionStatus: 'SUCCESS',
      parserVersion: '1.0',
      dataQualityStatus: 'VALID',
      processingStatus: 'PROCESSED'
    };
    db.upsertRawProductObservation(rawObs);

    return { product: finalProduct, isNew: !existingProduct, priceChanged };
  }

  public markStale(id: string) {
    const p = this.getProduct(id);
    if (p) {
      p.lastUpdated = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      this.updateProduct(id, p);
    }
  }

  public getSourceProducts(sourceId: string): MasterProduct[] {
    return db.getMasterProducts().filter(p => p.cheapestSupplierId === sourceId);
  }

  public getProductHistory(productId: string): PriceRecord[] {
    return db.getPriceRecords().filter(r => r.masterProductId === productId);
  }

}

export const dataHub = ScraperDataHub.getInstance();
