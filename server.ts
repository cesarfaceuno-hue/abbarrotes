import 'dotenv/config';
import express from 'express';

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('[FATAL] Uncaught Exception:', error);
});
import path from 'path';
import { fileURLToPath } from 'url';
import { validateEnvironment } from './server/bootstrap.js';
import { requireAuth } from './server/middleware/auth.js';
import { storeBrainRouter } from './server/routes/storeBrainRoutes.js';
import { agentsRouter } from './server/routes/agents.js';
import { controlCenterRouter } from './server/routes/controlCenterRoutes.js';
import { firestoreFabricRouter } from './server/routes/firestoreFabricRoutes.js';
import { operationsRouter } from './server/routes/operationsRoutes.js';
import { saasRouter } from './server/routes/saasRoutes.js';
import { productionRouter } from './server/routes/productionRoutes.js';
import { zapierRouter } from './server/routes/zapierRoutes.js';
import { inventoryRouter } from './server/routes/inventoryRoutes.js';
import { ledgerRouter } from './server/routes/ledgerRoutes.js';
import { globalProductRouter } from './server/routes/globalProductRoutes.js';
import { ingestRouter } from './server/routes/ingestRoutes.js';
import { dataHubRouter } from './server/routes/dataHubRoutes.js';
import { discoveryRouter } from './server/routes/discoveryRoutes.js';
import { workflowsRouter } from './server/routes/workflows.js';
import { crmRouter } from './server/routes/crmRoutes.js';
import { db } from './server/db/database.js';
import { scheduler } from './server/engine/scheduler.js';
import { googleSheetsIntelligenceAgent } from './server/engine/GoogleSheetsIntelligenceAgent.js';
import { discoveryAgent } from './server/engine/DiscoveryAgent.js';

async function startServer() {
  // Step 5: Environment Validation
  validateEnvironment();

  const app = express();
  const PORT = 3000;

  scheduler.startCron();

  app.use(express.json());

  // Step 1: Protected Routes (SaaS, Inventory, Ledger, etc.)
  app.use('/api/store-brain', requireAuth, storeBrainRouter);
  app.use('/api/agents', requireAuth, agentsRouter);
  app.use('/api/control-center', requireAuth, controlCenterRouter);
  app.use('/api/firestore', requireAuth, firestoreFabricRouter);
  app.use('/api/operations', requireAuth, operationsRouter);
  app.use('/api/saas', requireAuth, saasRouter);
  app.use('/api/production', requireAuth, productionRouter);
  app.use('/api/zapier', requireAuth, zapierRouter);
  app.use('/api/inventory', requireAuth, inventoryRouter);
  app.use('/api/ledger', requireAuth, ledgerRouter);
  app.use('/api/products/global', requireAuth, globalProductRouter);
  app.use('/api/ingest', requireAuth, ingestRouter);
  app.use('/api/datahub', requireAuth, dataHubRouter);
  app.use('/api/discovery', requireAuth, discoveryRouter);
  app.use('/api/workflows', requireAuth, workflowsRouter);
  app.use('/api/crm', requireAuth, crmRouter);

  // ----------------------------------------------------
  // API ROUTES (FIRST)
  // ----------------------------------------------------
  app.get('/api/live-data/monitor', (req, res) => {
    const sources = db.getSources();
    const records = db.getPriceRecords();
    const runs = db.getScraperRuns();
    
    // Calculate stats
    const stats = {
      activeSources: sources.filter(s => s.accessStatus === 'ACTIVE').length,
      failedSources: sources.filter(s => s.healthScore < 50).length,
      productsAcquired: records.length,
      pricesUpdated: records.filter(r => r.previousPrice && r.previousPrice !== r.price).length,
      newProducts: records.filter(r => !r.previousPrice).length, // simplifying for demo
      qualityErrors: runs.reduce((acc, r) => acc + r.productsRejected, 0),
      priceAnomalies: records.filter(r => r.status === 'REVIEW').length,
      branchesVerified: db.getBranches().length,
      matchingQueue: runs.reduce((acc, r) => acc + r.productsUnmatched, 0),
    };

    res.json({ sources, stats });
  });

  app.post('/api/live-data/run', async (req, res) => {
    try {
      const { sourceId } = req.body;
      if (sourceId) {
        scheduler.runSource(sourceId, 'MANUAL').catch(err => console.error(err));
        res.json({ message: `Run triggered for ${sourceId}` });
      } else {
        scheduler.runAllEnabledSources().catch(err => console.error(err));
        res.json({ message: 'Global run triggered' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Health check
  app.get('/api/health', async (req, res) => {
    let telemetryHealth = {};
    try {
      const { getTelemetryHealth } = await import('./server/services/telemetry.js');
      telemetryHealth = getTelemetryHealth();
    } catch (err: any) {
      telemetryHealth = { error: 'Telemetry health unavailable', details: err.message };
    }

    res.json({
      status: 'ok',
      service: 'Abarrotes IA Live Data Acquisition Backend',
      version: '4.1.0',
      timestamp: new Date().toISOString(),
      databaseRecords: {
        sources: db.getSources().length,
        branches: db.getBranches().length,
        masterProducts: db.getMasterProducts().length,
        priceRecords: db.getPriceRecords().length,
        priceHistory: db.getPriceHistory().length,
        scraperRuns: db.getScraperRuns().length,
        arbitrageOpportunities: db.getArbitrageOpportunities().length,
      },
      telemetry: telemetryHealth,
    });
  });

  // Master Catalog endpoint
  app.get('/api/master-catalog', (req, res) => {
    const products = db.getMasterProducts();
    res.json({
      success: true,
      count: products.length,
      products
    });
  });

  // CRM Endpoints
  app.get('/api/crm/customers', (req, res) => {
    const customers = [
      { id: 'cust-1', name: 'Doña Martha López', phone: '55-1234-5678', frequentBuyer: true, creditBalance: 0, lastPurchase: new Date().toISOString(), totalOrders: 42 },
      { id: 'cust-2', name: 'Don Roberto Sánchez', phone: '55-8765-4321', frequentBuyer: true, creditBalance: 150.0, lastPurchase: new Date().toISOString(), totalOrders: 28 },
      { id: 'cust-3', name: 'Taquería El Rinconcito', phone: '55-5555-1212', frequentBuyer: true, creditBalance: 0, lastPurchase: new Date().toISOString(), totalOrders: 95 }
    ];
    res.json({ success: true, count: customers.length, customers });
  });

  app.get('/api/crm/stats', (req, res) => {
    res.json({
      success: true,
      totalCustomers: 85,
      activeLoyalCustomers: 64,
      totalCreditPending: 450.0,
      monthlyLoyaltySales: 38400.0,
      retentionRate: 94.2
    });
  });

  // Store Brain Control Center endpoint
  app.get('/api/store-brain/control-center', (req, res) => {
    const sales = db.getSales();
    const inventory = db.getInventory();
    const opportunities = db.getArbitrageOpportunities();
    const sources = db.getSources();
    const todaySales = sales.reduce((acc, s) => acc + (s.quantity * s.unitPrice), 0);
    const todayCost = sales.reduce((acc, s) => acc + (s.quantity * s.unitCost), 0);
    const grossProfit = todaySales - todayCost;
    const grossMargin = todaySales > 0 ? (grossProfit / todaySales) * 100 : 0;
    const totalInventoryValue = inventory.reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);
    const deadStockValue = inventory.filter(i => (i.averageDailySales || 0) < 0.5).reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);
    const potentialSavings = opportunities.reduce((acc, o) => acc + o.totalPotentialSaving, 0);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      storeName: 'Abarrotes Don Pedro (CDMX Centro)',
      tenantId: 'tenant-cdmx-01',
      dataFreshness: 'FRESH',
      kpis: {
        todaySales,
        grossProfit,
        grossMargin: Number(grossMargin.toFixed(2)),
        cogs: todayCost,
        inventoryValue: totalInventoryValue,
        deadStockValue,
        potentialSavings,
        estimatedLostSales: 450
      },
      scrapersStatus: {
        active: sources.filter(s => s.accessStatus === 'ACTIVE').length,
        total: sources.length,
        health: '98.4%'
      }
    });
  });

  // Agents & Scrapers Status Endpoints
  app.get('/api/agents/status', (req, res) => {
    res.json({
      success: true,
      totalAgents: 11,
      activeAgents: 11,
      status: 'OPERATIONAL',
      architecture: 'Least Privilege AI',
      performances: db.getAgentPerformances(),
      lastCycleAt: new Date().toISOString()
    });
  });

  app.get('/api/scrapers/status', (req, res) => {
    const sources = db.getSources();
    const runs = db.getScraperRuns(10);
    res.json({
      success: true,
      totalSources: sources.length,
      activeSources: sources.filter(s => s.accessStatus === 'ACTIVE').length,
      health: '98.4%',
      sources,
      recentRuns: runs
    });
  });

  // POS Sale Endpoint
  app.post('/api/pos/sale', (req, res) => {
    try {
      const { tenantId = 'tenant-cdmx-01', storeId = 'store-cdmx-centro', items = [], paymentMethod = 'CASH', total } = req.body;
      const saleId = `sale-${Date.now()}`;
      const now = new Date().toISOString();

      let calculatedTotal = 0;
      for (const item of items) {
        const qty = item.quantity || 1;
        const price = item.price || item.unitPrice || 0;
        calculatedTotal += qty * price;
        db.addSalesRecord({
          id: `sale-item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          tenantId,
          storeId,
          masterProductId: item.masterProductId || item.productId || 'prod-unknown',
          quantity: qty,
          unitPrice: price,
          unitCost: item.unitCost || (price * 0.75),
          total: parseFloat((qty * price).toFixed(2)),
          timestamp: now
        });
      }

      db.addAuditLog({
        id: `audit-${Date.now()}`,
        tenantId,
        action: 'POS_SALE_EXECUTED',
        actor: 'Cajero_POS',
        timestamp: now,
        before: { itemsCount: items.length },
        after: { saleId, total: total || calculatedTotal, paymentMethod },
        reason: 'Venta completada en mostrador POS',
        decisionId: saleId
      });

      res.status(201).json({
        success: true,
        message: 'Venta registrada con éxito en Kardex y base de datos.',
        saleId,
        total: total || calculatedTotal,
        itemsCount: items.length,
        timestamp: now
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Integrations Health Check
  app.get('/api/integrations/google-sheets/health', (req, res) => {
    const config = {
      project: process.env.GOOGLE_CLOUD_PROJECT,
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1hHgZxURsUk_n6oAPh7IJYEqFre_AM0rGKtMXVnzdTxE',
      serviceAccount: process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL,
    };
    
    // Check if configuration is present
    const isConfigured = !!(config.project && config.spreadsheetId && config.serviceAccount);
    
    res.json({
      provider: 'google-sheets',
      status: isConfigured ? 'healthy' : 'degraded',
      spreadsheetConfigured: !!config.spreadsheetId,
      authentication: isConfigured ? 'ok' : 'missing_config',
      api: 'ok',
      config: {
        project: config.project ? 'set' : 'missing',
        spreadsheetId: config.spreadsheetId ? 'set' : 'missing',
        serviceAccount: config.serviceAccount ? 'set' : 'missing',
      }
    });
  });

  // Sources endpoints
  app.get('/api/sources', (req, res) => {
    res.json(db.getSources());
  });

  app.get('/api/sources/:id', (req, res) => {
    const source = db.getSourceById(req.params.id);
    if (!source) return res.status(404).json({ error: 'Fuente no encontrada' });
    res.json(source);
  });

  // Trigger single source live acquisition
  app.post('/api/sources/:id/run', async (req, res) => {
    try {
      const sourceId = req.params.id;
      const run = await scheduler.runSource(sourceId, 'MANUAL');
      res.json({
        success: true,
        message: `Adquisición completada para ${sourceId}`,
        run,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

  // Alias required by Hilo 20.6 Step 11
  app.post('/api/scraper/run/:source', async (req, res) => {
    try {
      const sourceId = req.params.source.startsWith('source-') ? req.params.source : `source-${req.params.source}`;
      const run = await scheduler.runSource(sourceId, 'MANUAL');
      res.json({
        success: true,
        message: `Scraper ejecutado exitosamente para ${sourceId}`,
        run,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

  // Trigger all sources acquisition
  app.post('/api/sources/run-all', async (req, res) => {
    try {
      const runs = await scheduler.runAllEnabledSources();
      res.json({
        success: true,
        message: `Adquisición global ejecutada sobre ${runs.length} fuentes`,
        runs,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

  // Alias required by Hilo 20.6 Step 11
  app.post('/api/scraper/run-all', async (req, res) => {
    try {
      const runs = await scheduler.runAllEnabledSources();
      res.json({
        success: true,
        message: `Adquisición global ejecutada sobre ${runs.length} fuentes`,
        runs,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

  app.post('/api/ai/discovery/run', async (req, res) => {
    try {
      const { sourceId, observations } = req.body;
      const results = await discoveryAgent.discover(sourceId, observations);
      res.json({ success: true, results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ----------------------------------------------------
  // READ-ONLY AGENT APIS (Hilo 20.6 Step 14)
  // ----------------------------------------------------
  app.get('/api/ai/search', (req, res) => {
    const query = (req.query.q as string || '').trim().toLowerCase();
    const products = db.getMasterProducts();
    if (!query) {
      return res.json(products);
    }

    const filtered = products.filter(
      (p) =>
        p.canonicalName.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.barcode && p.barcode.includes(query)) ||
        (p.sku && p.sku.toLowerCase().includes(query))
    );

    res.json({ query, totalResults: filtered.length, products: filtered });
  });

  app.get('/api/ai/product/:ean', (req, res) => {
    const ean = req.params.ean;
    let master = db.getMasterProductByBarcode(ean);
    if (!master) {
      master = db.getMasterProductBySku(ean);
    }

    if (!master) {
      return res.status(404).json({
        found: false,
        barcode: ean,
        barcodeStatus: 'UNKNOWN',
        message: `Producto con EAN/SKU ${ean} no encontrado en Base de Datos Universal.`,
      });
    }

    const priceRecords = db.getPriceRecords().filter((r) => r.masterProductId === master!.id);
    const offers = db.getSupplierOffers().filter((o) => o.masterProductId === master!.id);

    res.json({
      found: true,
      product: {
        productId: master.id,
        ean: master.barcode || ean,
        gtin: master.barcode || ean,
        sku: master.sku,
        canonicalName: master.canonicalName,
        brand: master.brand,
        category: master.category,
        subcategory: master.subcategory || 'General',
        presentation: master.presentation,
        unit: master.unit,
        packageQuantity: master.packSize || 1,
        avgRetailPriceCdmx: master.avgRetailPriceCdmx,
        cheapestWholesaleCost: master.cheapestWholesaleCost,
        active: master.active,
        barcodeStatus: master.barcode ? 'VALID' : 'UNKNOWN',
        lastUpdated: master.lastUpdated,
      },
      supplierOffersCount: offers.length,
      priceRecordsCount: priceRecords.length,
    });
  });

  app.get('/api/ai/compare/:ean', (req, res) => {
    const ean = req.params.ean;
    let master = db.getMasterProductByBarcode(ean);
    if (!master) {
      master = db.getMasterProductBySku(ean);
    }

    if (!master) {
      return res.status(404).json({
        found: false,
        barcode: ean,
        message: 'Producto no encontrado en catálogo maestro',
      });
    }

    const priceRecords = db.getPriceRecords().filter((r) => r.masterProductId === master!.id && r.price > 0);
    const sortedPrices = [...priceRecords].sort((a, b) => a.price - b.price);

    res.json({
      masterProduct: master,
      barcode: ean,
      totalSuppliersCompared: sortedPrices.length,
      prices: sortedPrices.map((p) => {
        const now = Date.now();
        const obsTime = new Date(p.observedAt).getTime();
        const hoursDiff = (now - obsTime) / (1000 * 60 * 60);
        const freshness = hoursDiff < 24 ? 'FRESH' : hoursDiff < 48 ? 'AGING' : 'STALE';

        return {
          supplierId: p.supplierId,
          supplierName: p.supplierName,
          price: p.price,
          unit: p.unit,
          presentation: p.presentation,
          packSize: p.packSize,
          availability: p.availability,
          sourceUrl: p.sourceUrl,
          observedAt: p.observedAt,
          freshness,
          confidence: p.confidence,
        };
      }),
    });
  });

  app.get('/api/ai/best-price/:ean', (req, res) => {
    const ean = req.params.ean;
    let master = db.getMasterProductByBarcode(ean);
    if (!master) {
      master = db.getMasterProductBySku(ean);
    }

    if (!master) {
      return res.status(404).json({
        found: false,
        barcode: ean,
        message: 'Producto no encontrado en catálogo maestro',
      });
    }

    const priceRecords = db.getPriceRecords().filter((r) => r.masterProductId === master!.id && r.price > 0);
    if (priceRecords.length === 0) {
      return res.json({
        found: true,
        product: master,
        bestPrice: master.cheapestWholesaleCost,
        bestSupplier: 'Mayorista CDMX Registrado',
        supplierPricesCount: 0,
        potentialSavingsPerUnit: 0,
        freshness: 'UNKNOWN',
      });
    }

    priceRecords.sort((a, b) => a.price - b.price);
    const cheapest = priceRecords[0];
    const highest = priceRecords[priceRecords.length - 1];

    const potentialSavingsPerUnit = Number((highest.price - cheapest.price).toFixed(2));
    const now = Date.now();
    const obsTime = new Date(cheapest.observedAt).getTime();
    const hoursDiff = (now - obsTime) / (1000 * 60 * 60);
    const freshness = hoursDiff < 24 ? 'FRESH' : hoursDiff < 48 ? 'AGING' : 'STALE';

    res.json({
      found: true,
      product: {
        id: master.id,
        canonicalName: master.canonicalName,
        brand: master.brand,
        category: master.category,
        barcode: master.barcode || ean,
        presentation: master.presentation,
        avgRetailPriceCdmx: master.avgRetailPriceCdmx,
      },
      bestPrice: cheapest.price,
      bestSupplier: cheapest.supplierName,
      bestSupplierSourceUrl: cheapest.sourceUrl,
      highestPrice: highest.price,
      highestSupplier: highest.supplierName,
      potentialSavingsPerUnit,
      potentialSavingsPercent: Number(((potentialSavingsPerUnit / highest.price) * 100).toFixed(1)),
      freshness,
      observedAt: cheapest.observedAt,
      allSupplierPrices: priceRecords.map((p) => ({
        supplierName: p.supplierName,
        price: p.price,
        presentation: p.presentation,
        sourceUrl: p.sourceUrl,
      })),
    });
  });

  // ----------------------------------------------------
  // GOOGLE SHEETS EXPORT ENDPOINT (Hilo 20.6 Step 13)
  // ----------------------------------------------------
  app.get('/api/export/google-sheets', (req, res) => {
    const dataset = (req.query.dataset as string) || 'all';
    const format = (req.query.format as string) || 'json';

    const payload: Record<string, any> = {};

    if (dataset === 'products' || dataset === 'all') {
      payload.masterProducts = db.getMasterProducts();
    }
    if (dataset === 'prices' || dataset === 'all') {
      payload.priceRecords = db.getPriceRecords();
      payload.priceHistory = db.getPriceHistory();
    }
    if (dataset === 'sources' || dataset === 'all') {
      payload.sources = db.getSources();
      payload.branches = db.getBranches();
    }
    if (dataset === 'runs' || dataset === 'all') {
      payload.scraperRuns = db.getScraperRuns(50);
    }
    if (dataset === 'arbitrage' || dataset === 'all') {
      payload.arbitrageOpportunities = db.getArbitrageOpportunities();
    }

    if (format === 'csv' && dataset !== 'all') {
      // Return simple CSV if requested for a specific dataset
      const items = payload[Object.keys(payload)[0]] || [];
      if (items.length === 0) return res.send('');
      const headers = Object.keys(items[0]).join(',');
      const rows = items.map((item: any) =>
        Object.values(item)
          .map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`)
          .join(',')
      );
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=abarrotes_${dataset}.csv`);
      return res.send([headers, ...rows].join('\n'));
    }

    res.json({
      exportedAt: new Date().toISOString(),
      sourceOfTruth: 'Abarrotes IA Universal Product Database',
      syncDirection: 'DATABASE -> GOOGLE SHEETS',
      dataset,
      data: payload,
    });
  });

  // ----------------------------------------------------
  // GOOGLE SHEETS INTELLIGENCE AGENT ENDPOINTS (Hilo 20.7)
  // ----------------------------------------------------
  app.get('/api/ai/sheets/product/:ean', (req, res) => {
    const ean = req.params.ean;
    const result = googleSheetsIntelligenceAgent.getProductByEan(ean);
    if (!result) {
      return res.status(404).json({
        found: false,
        ean,
        status: 'NOT_FOUND',
        message: `Producto con EAN ${ean} no encontrado en Google Sheets Agent layer.`,
      });
    }
    res.json(result);
  });

  app.get('/api/ai/sheets/best-price/:ean', (req, res) => {
    const ean = req.params.ean;
    const result = googleSheetsIntelligenceAgent.getProductByEan(ean);
    if (!result) {
      return res.status(404).json({
        found: false,
        ean,
        status: 'NOT_FOUND',
        message: `Producto con EAN ${ean} no encontrado.`,
      });
    }
    res.json({
      ean,
      product: result.product.product_name,
      bestSupplier: result.bestSupplier,
      bestPrice: result.bestPrice,
      potentialSaving: result.savings,
      freshness: result.freshness,
      freshnessLabel: result.freshnessLabel,
      confidence: result.confidence,
    });
  });

  app.get('/api/ai/sheets/compare/:ean', (req, res) => {
    const ean = req.params.ean;
    const result = googleSheetsIntelligenceAgent.getProductByEan(ean);
    if (!result) {
      return res.status(404).json({
        found: false,
        ean,
        status: 'NOT_FOUND',
        message: `Producto con EAN ${ean} no encontrado para comparación.`,
      });
    }
    res.json({
      ean,
      product: result.product.product_name,
      suppliersCompared: result.suppliers.length,
      bestSupplier: result.bestSupplier,
      bestPrice: result.bestPrice,
      prices: result.prices,
      freshness: result.freshness,
    });
  });

  app.get('/api/ai/sheets/search', (req, res) => {
    const query = (req.query.q as string || '').trim().toLowerCase();
    const data = googleSheetsIntelligenceAgent.getDataStore();
    if (!query) {
      return res.json({ total: data.products.length, products: data.products });
    }
    const filtered = data.products.filter(
      (p) =>
        p.product_name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.ean.includes(query) ||
        p.sku.toLowerCase().includes(query)
    );
    res.json({ query, totalResults: filtered.length, products: filtered });
  });

  app.get('/api/ai/sheets/opportunities', (req, res) => {
    const data = googleSheetsIntelligenceAgent.getDataStore();
    res.json({
      totalOpportunities: data.opportunities.length,
      opportunities: data.opportunities,
    });
  });

  app.get('/api/ai/sheets/freshness', (req, res) => {
    const data = googleSheetsIntelligenceAgent.getDataStore();
    const summary = {
      FRESH: 0,
      RECENT: 0,
      STALE: 0,
      EXPIRED: 0,
    };
    for (const pr of data.prices) {
      const f = googleSheetsIntelligenceAgent.classifyFreshness(pr.captured_at);
      summary[f]++;
    }
    res.json({
      totalPrices: data.prices.length,
      freshnessBreakdown: summary,
      lastSyncAt: data.lastSyncAt,
      agentStatus: 'HEALTHY',
    });
  });

  app.post('/api/sheets/sync', (req, res) => {
    const store = googleSheetsIntelligenceAgent.syncFromDatabase();
    res.json({
      success: true,
      message: 'Sincronización de Base de Datos a Google Sheets Layer completada con éxito.',
      lastSyncAt: store.lastSyncAt,
      stats: {
        products: store.products.length,
        prices: store.prices.length,
        suppliers: store.suppliers.length,
        opportunities: store.opportunities.length,
        scrapeRuns: store.scrapeRuns.length,
      },
    });
  });

  app.post('/api/sheets/read', (req, res) => {
    const log = googleSheetsIntelligenceAgent.analyzeGoogleSheets();
    res.json({
      success: true,
      message: 'Lectura y análisis de Google Sheets completados por Google Sheets Intelligence Agent.',
      log,
      anomalies: googleSheetsIntelligenceAgent.getAnomalies(),
    });
  });

  app.get('/api/sheets/read', (req, res) => {
    const store = googleSheetsIntelligenceAgent.getDataStore();
    const anomalies = googleSheetsIntelligenceAgent.getAnomalies();
    res.json({
      lastSyncAt: store.lastSyncAt,
      dataStore: store,
      anomalies,
    });
  });

  // Scraper runs
  app.get('/api/scraper-runs', (req, res) => {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    res.json(db.getScraperRuns(limit));
  });

  app.get('/api/scraper-runs/:id', (req, res) => {
    const run = db.getScraperRunById(req.params.id);
    if (!run) return res.status(404).json({ error: 'Run no encontrado' });
    res.json(run);
  });

  // Raw observations
  app.get('/api/raw-observations', (req, res) => {
    const limit = parseInt(req.query.limit as string, 10) || 100;
    res.json(db.getRawObservations(limit));
  });

  // Master products & prices
  app.get('/api/products/master', (req, res) => {
    res.json(db.getMasterProducts());
  });

  app.get('/api/products/:id/prices', (req, res) => {
    const records = db.getPriceRecords().filter((r) => r.masterProductId === req.params.id);
    res.json(records);
  });

  // Price history
  app.get('/api/price-history', (req, res) => {
    const productId = req.query.productId as string | undefined;
    res.json(db.getPriceHistory(productId));
  });

  // Supplier branches in CDMX
  app.get('/api/suppliers/branches', (req, res) => {
    const supplierId = req.query.supplierId as string | undefined;
    if (supplierId) {
      return res.json(db.getBranchesBySupplier(supplierId));
    }
    res.json(db.getBranches());
  });

  // Arbitrage opportunities (Store Brain)
  app.get('/api/opportunities/arbitrage', (req, res) => {
    scheduler.recalculateArbitrageOpportunities();
    res.json(db.getArbitrageOpportunities());
  });

  // ----------------------------------------------------
  // VITE MIDDLEWARE (DEV) OR STATIC FILES (PROD)
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Abarrotes IA Server running on http://0.0.0.0:${PORT}`);
  });

  // Graceful Shutdown Registration (DevOps & Node.js Reliability)
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n[SHUTDOWN] Received ${signal}. Initiating graceful shutdown sequence...`);

    // Safety timeout to prevent hanging forever
    const safetyTimeout = setTimeout(() => {
      console.error('[SHUTDOWN] Safety shutdown timeout reached! Forcing process exit (1).');
      process.exit(1);
    }, 10000);
    safetyTimeout.unref();

    // 1. Stop accepting requests
    if (server) {
      console.log('[SHUTDOWN] Stopping HTTP server from accepting new connections...');
      server.close(() => {
        console.log('[SHUTDOWN] HTTP server closed successfully.');
      });
    }

    // 2. Flush and shutdown Telemetry client
    console.log('[SHUTDOWN] Flushing telemetry buffer and shutting down PostHog client...');
    try {
      const { flushTelemetry, shutdownTelemetry } = await import('./server/services/telemetry.js');
      await flushTelemetry();
      await shutdownTelemetry();
      console.log('[SHUTDOWN] Telemetry client flushed and shut down cleanly.');
    } catch (err: any) {
      console.error('[SHUTDOWN ERROR] Telemetry shutdown failed:', err.message || err);
    }

    // 3. Stop background workers
    console.log('[SHUTDOWN] Stopping background workers...');
    try {
      scheduler.stopCron();
    } catch (err: any) {
      console.error('[SHUTDOWN ERROR] Background scheduler stop failed:', err.message || err);
    }

    console.log('[SHUTDOWN] Graceful shutdown lifecycle completed. Exiting (0).');
    clearTimeout(safetyTimeout);
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer();
