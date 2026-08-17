import { scheduler } from '../server/engine/scheduler.js';
import { googleSheetsIntelligenceAgent } from '../server/engine/GoogleSheetsIntelligenceAgent.js';
import { db } from '../server/db/database.js';

async function main() {
  console.log('============================================================');
  console.log('HILO 20.8 — LIVE SCRAPER ENGINE EXECUTION TEST');
  console.log('============================================================\n');

  console.log('--> Step 1: Running all 9 enabled live source scrapers...');
  const t0 = Date.now();
  const runs = await scheduler.runAllEnabledSources();
  const durationMs = Date.now() - t0;

  console.log(`\n--> Scraper Pipeline completed in ${(durationMs / 1000).toFixed(2)} seconds.\n`);

  console.log('============================================================');
  console.log('SCRAPER RUN RESULTS PER SOURCE');
  console.log('============================================================');

  for (const run of runs) {
    console.log(`Source ID:           ${run.sourceId}`);
    console.log(`Status:              ${run.status}`);
    console.log(`Products Discovered: ${run.productsDiscovered}`);
    console.log(`Products Parsed:     ${run.productsParsed}`);
    console.log(`Duration:            ${run.durationMs} ms`);
    if (run.errors.length > 0) {
      console.log(`Errors:              ${run.errors.join(' | ')}`);
    }
    if (run.warnings.length > 0) {
      console.log(`Warnings:            ${run.warnings.join(' | ')}`);
    }
    console.log('------------------------------------------------------------');
  }

  console.log('\n--> Step 2: Synchronizing Google Sheets Data Layer...');
  const store = googleSheetsIntelligenceAgent.syncFromDatabase();
  const sheetsReport = googleSheetsIntelligenceAgent.analyzeGoogleSheets();

  console.log('\n============================================================');
  console.log('UNIVERSAL PRODUCT DATABASE STATE');
  console.log('============================================================');
  const masterProducts = db.getMasterProducts();
  const priceRecords = db.getPriceRecords();
  const supplierOffers = db.getSupplierOffers();

  console.log(`Total Master Products:  ${masterProducts.length}`);
  console.log(`Total Price Records:    ${priceRecords.length}`);
  console.log(`Total Supplier Offers:  ${supplierOffers.length}`);
  console.log(`Google Sheets Products: ${store.products.length}`);
  console.log(`Google Sheets Prices:   ${store.prices.length}`);
  console.log(`Arbitrage Opportunities:${store.opportunities.length}`);

  console.log('\n============================================================');
  console.log('SAMPLE REAL PRODUCTS & BEST PRICES');
  console.log('============================================================');
  for (const p of masterProducts.slice(0, 5)) {
    const prices = priceRecords.filter((pr) => pr.masterProductId === p.id);
    const bestPrice = prices.length > 0 ? Math.min(...prices.map((pr) => pr.price)) : p.cheapestWholesaleCost;
    console.log(`- [${p.barcode || p.sku || 'NO_EAN'}] ${p.canonicalName}`);
    console.log(`  Brand: ${p.brand} | Category: ${p.category}`);
    console.log(`  Retail Price CDMX: $${p.avgRetailPriceCdmx} | Best Wholesale: $${bestPrice}`);
    console.log(`  Supplier Prices Found: ${prices.length}`);
  }

  console.log('\n============================================================');
  console.log('EXECUTION COMPLETE');
  console.log('============================================================');
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
