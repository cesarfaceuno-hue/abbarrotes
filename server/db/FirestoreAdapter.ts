import { getFirebaseAdmin } from './firebase.js';
import { db as jsonDb } from './database.js';
import { Telemetry } from '../services/telemetry.js';
import { shadowQueueManager } from './shadowQueue.js';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'firebase-applet-config.json');

export class FirestoreAdapter {
  private firestore: any = null;
  private isConnected = false;
  private config: { projectId: string; databaseId: string } = {
    projectId: 'gen-lang-client-0101148954',
    databaseId: 'ai-studio-remixabarrotesia-0ec72b82-5b2a-41dc-9f50-e8a10c5f84b3'
  };

  constructor() {
    this.initialize();
  }

  /**
   * Safe lazy initialization of Firebase Firestore database
   */
  private initialize() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const fileContent = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        this.config = {
          projectId: fileContent.projectId || this.config.projectId,
          databaseId: fileContent.firestoreDatabaseId || this.config.databaseId
        };
      }
      
      const admin = getFirebaseAdmin({
        projectId: this.config.projectId,
        databaseId: this.config.databaseId
      });
      this.firestore = admin.db;
      this.isConnected = true;
      console.log(`[FirestoreAdapter] Successfully connected to database ID: ${this.config.databaseId}`);
    } catch (err: any) {
      console.warn(`[FirestoreAdapter] Firestore offline/unreachable: ${err.message}. Running JSON-only mode with local failover.`);
      this.isConnected = false;
    }
  }

  public getStatus() {
    return {
      connected: this.isConnected,
      projectId: this.config.projectId,
      databaseId: this.config.databaseId,
      mode: 'FIRESTORE_PRIMARY_JSON_ROLLBACK',
    };
  }

  /**
   * Helper: Runs shadow write asynchronously to prevent blocking main thread
   */
  private async shadowWrite(collection: string, docId: string, data: any) {
    // Delegate to disk-backed persistent queue for PENDING_SYNC -> RETRY -> SYNCED lifecycle
    shadowQueueManager.enqueue(collection, docId, data);
  }

  /**
   * Helper: Compare results from JSON vs Firestore and log differences
   */
  private compareResults(methodName: string, jsonResult: any, firestoreResult: any) {
    try {
      const jsonStr = JSON.stringify(jsonResult);
      const fireStr = JSON.stringify(firestoreResult);
      
      if (jsonStr !== fireStr) {
        const jsonLen = Array.isArray(jsonResult) ? jsonResult.length : 1;
        const fireLen = Array.isArray(firestoreResult) ? firestoreResult.length : (firestoreResult ? 1 : 0);
        
        console.warn(`[Dual-Read Mismatch] ${methodName} - count mismatch. JSON: ${jsonLen}, Firestore: ${fireLen}`);
        Telemetry.track('system-db-sync', 'database_sync_mismatch', {
          methodName,
          jsonCount: jsonLen,
          firestoreCount: fireLen,
          message: 'Data lengths or values do not match canonical state'
        });
      }
    } catch (err) {
      // Keep comparisons completely silent if they fail
    }
  }

  // ==========================================
  // DUAL IMPLEMENTATIONS (FIRESTORE PRIMARY, JSON BACKUP / ROLLBACK)
  // ==========================================

  // --- SOURCES ---
  public async getSources() {
    if (this.isConnected && this.firestore) {
      try {
        const snapshot = await this.firestore.collection('global_suppliers').get();
        const firestoreResult = snapshot.docs.map((doc: any) => doc.data());
        // Run comparison in background
        const jsonResult = jsonDb.getSources();
        this.compareResults('getSources', jsonResult, firestoreResult);
        return firestoreResult;
      } catch (err: any) {
        console.warn(`[Firestore-Primary-Failover] getSources failed, falling back to JSON backup. Error: ${err.message}`);
      }
    }
    return jsonDb.getSources();
  }

  public async getSourceById(id: string) {
    if (this.isConnected && this.firestore) {
      try {
        const doc = await this.firestore.collection('global_suppliers').doc(id).get();
        if (doc.exists) {
          const firestoreResult = doc.data();
          const jsonResult = jsonDb.getSourceById(id);
          this.compareResults(`getSourceById:${id}`, jsonResult, firestoreResult);
          return firestoreResult;
        }
      } catch (err: any) {
        console.warn(`[Firestore-Primary-Failover] getSourceById:${id} failed, falling back to JSON backup. Error: ${err.message}`);
      }
    }
    return jsonDb.getSourceById(id);
  }

  public async updateSource(id: string, updates: any) {
    const jsonResult = jsonDb.updateSource(id, updates);
    // Write-Through to shadow
    await this.shadowWrite('global_suppliers', id, jsonResult);
    return jsonResult;
  }

  // --- INVENTORY ---
  public async getInventory() {
    if (this.isConnected && this.firestore) {
      try {
        const snapshot = await this.firestore.collectionGroup('inventory').get();
        const firestoreResult = snapshot.docs.map((doc: any) => doc.data());
        const jsonResult = jsonDb.getInventory();
        this.compareResults('getInventory', jsonResult, firestoreResult);
        return firestoreResult;
      } catch (err: any) {
        console.warn(`[Firestore-Primary-Failover] getInventory failed, falling back to JSON backup. Error: ${err.message}`);
      }
    }
    return jsonDb.getInventory();
  }

  public async getInventoryItem(tenantId: string, storeId: string, productId: string) {
    if (this.isConnected && this.firestore) {
      try {
        const doc = await this.firestore
          .collection('organizations')
          .doc(tenantId)
          .collection('stores')
          .doc(storeId)
          .collection('inventory')
          .doc(productId)
          .get();
        if (doc.exists) {
          const firestoreResult = doc.data();
          const inventoryList = jsonDb.getInventory();
          const jsonResult = inventoryList.find(i => i.tenantId === tenantId && i.storeId === storeId && i.masterProductId === productId);
          this.compareResults(`getInventoryItem:${tenantId}:${storeId}:${productId}`, jsonResult, firestoreResult);
          return firestoreResult;
        }
      } catch (err: any) {
        console.warn(`[Firestore-Primary-Failover] getInventoryItem failed, falling back to JSON backup. Error: ${err.message}`);
      }
    }
    const inventoryList = jsonDb.getInventory();
    return inventoryList.find(i => i.tenantId === tenantId && i.storeId === storeId && i.masterProductId === productId);
  }

  public async upsertInventoryItem(item: any) {
    // Write locally
    if (!jsonDb.getInventory().some(i => i.masterProductId === item.masterProductId && i.storeId === item.storeId)) {
      jsonDb.getInventory().push(item);
    } else {
      const idx = jsonDb.getInventory().findIndex(i => i.masterProductId === item.masterProductId && i.storeId === item.storeId);
      jsonDb.getInventory()[idx] = item;
    }
    jsonDb.saveToDiskSync();

    // Shadow Write to Tenant isolated path
    const tenantId = item.tenantId || 'tenant-cdmx-01';
    const storeId = item.storeId || 'store-cdmx-centro';
    const productId = item.masterProductId;
    
    await this.shadowWrite(
      `organizations/${tenantId}/stores/${storeId}/inventory`,
      productId,
      item
    );
  }

  // --- MASTER PRODUCTS ---
  public async getMasterProducts() {
    if (this.isConnected && this.firestore) {
      try {
        const snapshot = await this.firestore.collection('global_products').get();
        const firestoreResult = snapshot.docs.map((doc: any) => doc.data());
        const jsonResult = jsonDb.getMasterProducts();
        this.compareResults('getMasterProducts', jsonResult, firestoreResult);
        return firestoreResult;
      } catch (err: any) {
        console.warn(`[Firestore-Primary-Failover] getMasterProducts failed, falling back to JSON backup. Error: ${err.message}`);
      }
    }
    return jsonDb.getMasterProducts();
  }

  public async upsertMasterProduct(product: any) {
    jsonDb.upsertMasterProduct(product);
    await this.shadowWrite('global_products', product.id, product);
  }

  // --- SALES & LEDGER ---
  public async getSales() {
    if (this.isConnected && this.firestore) {
      try {
        const snapshot = await this.firestore.collectionGroup('sales').get();
        const firestoreResult = snapshot.docs.map((doc: any) => doc.data());
        const jsonResult = jsonDb.getSales();
        this.compareResults('getSales', jsonResult, firestoreResult);
        return firestoreResult;
      } catch (err: any) {
        console.warn(`[Firestore-Primary-Failover] getSales failed, falling back to JSON backup. Error: ${err.message}`);
      }
    }
    return jsonDb.getSales();
  }

  public async addSale(sale: any) {
    if (!jsonDb.getSales()) {
      (jsonDb as any).data.sales = [];
    }
    jsonDb.getSales().push(sale);
    jsonDb.saveToDiskSync();

    const tenantId = sale.tenantId || 'tenant-cdmx-01';
    const storeId = sale.storeId || 'store-cdmx-centro';
    const saleId = sale.id || Math.random().toString(36).substring(7);
    
    await this.shadowWrite(
      `organizations/${tenantId}/stores/${storeId}/sales`,
      saleId,
      sale
    );
  }

  // --- DECISIONS & AUDIT LOGS ---
  public async getAuditLogs() {
    if (this.isConnected && this.firestore) {
      try {
        const snapshot = await this.firestore.collectionGroup('audit_logs').get();
        const firestoreResult = snapshot.docs.map((doc: any) => doc.data());
        const jsonResult = jsonDb.getAuditLogs();
        this.compareResults('getAuditLogs', jsonResult, firestoreResult);
        return firestoreResult;
      } catch (err: any) {
        console.warn(`[Firestore-Primary-Failover] getAuditLogs failed, falling back to JSON backup. Error: ${err.message}`);
      }
    }
    return jsonDb.getAuditLogs();
  }

  public async addAuditLog(log: any) {
    jsonDb.addAuditLog(log);
    const tenantId = log.tenantId || 'tenant-cdmx-01';
    const logId = log.id || Math.random().toString(36).substring(7);
    
    await this.shadowWrite(
      `organizations/${tenantId}/audit_logs`,
      logId,
      log
    );
  }
}

export const firestoreAdapter = new FirestoreAdapter();
