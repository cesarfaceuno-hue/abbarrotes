import { db as jsonDb } from './database.js';
import { getFirebaseAdmin } from './firebase.js';
import { Telemetry } from '../services/telemetry.js';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'firebase-applet-config.json');

export interface MigrationReport {
  success: boolean;
  timestamp: string;
  counts: {
    suppliers: { source: number; target: number };
    products: { source: number; target: number };
    inventory: { source: number; target: number };
    sales: { source: number; target: number };
    auditLogs: { source: number; target: number };
  };
  mismatches: string[];
  totalBatchesProcessed: number;
}

/**
 * Executes a fully validated transform & migration from local JSON database to Firestore.
 * Implements tenant isolation and maps entities hierarchically.
 */
export async function executeDatabaseMigration(): Promise<MigrationReport> {
  const report: MigrationReport = {
    success: false,
    timestamp: new Date().toISOString(),
    counts: {
      suppliers: { source: 0, target: 0 },
      products: { source: 0, target: 0 },
      inventory: { source: 0, target: 0 },
      sales: { source: 0, target: 0 },
      auditLogs: { source: 0, target: 0 },
    },
    mismatches: [],
    totalBatchesProcessed: 0
  };

  try {
    let projectId = 'gen-lang-client-0101148954';
    let databaseId = 'ai-studio-remixabarrotesia-0ec72b82-5b2a-41dc-9f50-e8a10c5f84b3';

    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (config.projectId) projectId = config.projectId;
      if (config.firestoreDatabaseId) databaseId = config.firestoreDatabaseId;
    }

    console.log(`[Migration Engine] Starting transform and migrate to Firestore. Target DB: ${databaseId}`);
    const admin = getFirebaseAdmin({ projectId, databaseId });
    const firestore = admin.db;

    // --- 1. Migrate Suppliers (global_suppliers) ---
    const localSuppliers = jsonDb.getSources() || [];
    report.counts.suppliers.source = localSuppliers.length;
    
    let supplierBatch = firestore.batch();
    for (const supplier of localSuppliers) {
      const ref = firestore.collection('global_suppliers').doc(supplier.id);
      supplierBatch.set(ref, {
        ...supplier,
        _migratedAt: report.timestamp
      }, { merge: true });
    }
    await supplierBatch.commit();
    report.totalBatchesProcessed++;
    
    // Verify Suppliers count
    const suppliersSnapshot = await firestore.collection('global_suppliers').get();
    report.counts.suppliers.target = suppliersSnapshot.size;
    if (report.counts.suppliers.source !== report.counts.suppliers.target) {
      report.mismatches.push(`Suppliers count mismatch: Local ${report.counts.suppliers.source} vs Firestore ${report.counts.suppliers.target}`);
    }

    // --- 2. Migrate Master Products (global_products) ---
    const localProducts = jsonDb.getMasterProducts() || [];
    report.counts.products.source = localProducts.length;

    // Batch write master products (max 500 per batch)
    let productBatch = firestore.batch();
    let productCounter = 0;
    
    for (const product of localProducts) {
      const ref = firestore.collection('global_products').doc(product.id);
      productBatch.set(ref, {
        ...product,
        _migratedAt: report.timestamp
      }, { merge: true });
      
      productCounter++;
      if (productCounter >= 500) {
        await productBatch.commit();
        report.totalBatchesProcessed++;
        productBatch = firestore.batch();
        productCounter = 0;
      }
    }
    if (productCounter > 0) {
      await productBatch.commit();
      report.totalBatchesProcessed++;
    }

    // Verify Master Products count
    const productsSnapshot = await firestore.collection('global_products').get();
    report.counts.products.target = productsSnapshot.size;
    if (report.counts.products.source !== report.counts.products.target) {
      report.mismatches.push(`Products count mismatch: Local ${report.counts.products.source} vs Firestore ${report.counts.products.target}`);
    }

    // --- 3. Migrate Inventory items under tenant structure ---
    const localInventory = jsonDb.getInventory() || [];
    report.counts.inventory.source = localInventory.length;

    let inventoryBatch = firestore.batch();
    let inventoryCounter = 0;

    for (const item of localInventory) {
      const tenantId = item.tenantId || 'tenant-cdmx-01';
      const storeId = item.storeId || 'store-cdmx-centro';
      const productId = item.masterProductId;

      const ref = firestore
        .collection('organizations')
        .doc(tenantId)
        .collection('stores')
        .doc(storeId)
        .collection('inventory')
        .doc(productId);

      inventoryBatch.set(ref, {
        ...item,
        _migratedAt: report.timestamp
      }, { merge: true });

      inventoryCounter++;
      if (inventoryCounter >= 500) {
        await inventoryBatch.commit();
        report.totalBatchesProcessed++;
        inventoryBatch = firestore.batch();
        inventoryCounter = 0;
      }
    }
    if (inventoryCounter > 0) {
      await inventoryBatch.commit();
      report.totalBatchesProcessed++;
    }

    // Verify Inventory count
    const inventorySnapshot = await firestore.collectionGroup('inventory').get();
    report.counts.inventory.target = inventorySnapshot.size;
    if (report.counts.inventory.source !== report.counts.inventory.target) {
      report.mismatches.push(`Inventory count mismatch: Local ${report.counts.inventory.source} vs Firestore ${report.counts.inventory.target}`);
    }

    // --- 4. Migrate Sales Records under tenant structure ---
    const localSales = jsonDb.getSales() || [];
    report.counts.sales.source = localSales.length;

    let salesBatch = firestore.batch();
    let salesCounter = 0;

    for (const sale of localSales) {
      const tenantId = sale.tenantId || 'tenant-cdmx-01';
      const storeId = sale.storeId || 'store-cdmx-centro';
      const saleId = sale.id || Math.random().toString(36).substring(7);

      const ref = firestore
        .collection('organizations')
        .doc(tenantId)
        .collection('stores')
        .doc(storeId)
        .collection('sales')
        .doc(saleId);

      salesBatch.set(ref, {
        ...sale,
        _migratedAt: report.timestamp
      }, { merge: true });

      salesCounter++;
      if (salesCounter >= 500) {
        await salesBatch.commit();
        report.totalBatchesProcessed++;
        salesBatch = firestore.batch();
        salesCounter = 0;
      }
    }
    if (salesCounter > 0) {
      await salesBatch.commit();
      report.totalBatchesProcessed++;
    }

    // Verify Sales count
    const salesSnapshot = await firestore.collectionGroup('sales').get();
    report.counts.sales.target = salesSnapshot.size;
    if (report.counts.sales.source !== report.counts.sales.target) {
      report.mismatches.push(`Sales count mismatch: Local ${report.counts.sales.source} vs Firestore ${report.counts.sales.target}`);
    }

    // --- 5. Migrate Audit Logs under tenant structure ---
    const localAuditLogs = jsonDb.getAuditLogs() || [];
    report.counts.auditLogs.source = localAuditLogs.length;

    let auditBatch = firestore.batch();
    let auditCounter = 0;

    for (const log of localAuditLogs) {
      const tenantId = log.tenantId || 'tenant-cdmx-01';
      const logId = log.id || Math.random().toString(36).substring(7);

      const ref = firestore
        .collection('organizations')
        .doc(tenantId)
        .collection('audit_logs')
        .doc(logId);

      auditBatch.set(ref, {
        ...log,
        _migratedAt: report.timestamp
      }, { merge: true });

      auditCounter++;
      if (auditCounter >= 500) {
        await auditBatch.commit();
        report.totalBatchesProcessed++;
        auditBatch = firestore.batch();
        auditCounter = 0;
      }
    }
    if (auditCounter > 0) {
      await auditBatch.commit();
      report.totalBatchesProcessed++;
    }

    // Verify Audit Logs count
    const auditLogsSnapshot = await firestore.collectionGroup('audit_logs').get();
    report.counts.auditLogs.target = auditLogsSnapshot.size;
    if (report.counts.auditLogs.source !== report.counts.auditLogs.target) {
      report.mismatches.push(`Audit Logs count mismatch: Local ${report.counts.auditLogs.source} vs Firestore ${report.counts.auditLogs.target}`);
    }

    report.success = report.mismatches.length === 0;
    
    Telemetry.track('system-db-migration', 'database_migration_complete', {
      success: report.success,
      batchCount: report.totalBatchesProcessed,
      mismatchCount: report.mismatches.length
    });

    console.log(`[Migration Engine] Migration completed. Success: ${report.success}. Total batches: ${report.totalBatchesProcessed}`);
    
  } catch (error: any) {
    console.error('[Migration Engine] Critical error executing migration:', error);
    report.success = false;
    report.mismatches.push(`Critical Migration Error: ${error.message}`);
    
    Telemetry.track('system-db-migration', 'database_migration_complete', {
      success: false,
      error: error.message
    });
  }

  return report;
}
