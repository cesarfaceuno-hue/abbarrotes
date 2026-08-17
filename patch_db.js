const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'server/db/database.ts');
let content = fs.readFileSync(dbPath, 'utf8');

// Add imports
const newImports = `
  InventoryItem,
  SalesRecord,
  DecisionRecord,
  AuditLog,
`;
content = content.replace(/SupplierOffer,?\n} from '\.\.\/types\.js';/g, `SupplierOffer,\n${newImports}} from '../types.js';`);

// Update DatabaseSchema
const newSchemaFields = `  supplierOffers: SupplierOffer[];
  inventory: InventoryItem[];
  sales: SalesRecord[];
  decisions: DecisionRecord[];
  auditLogs: AuditLog[];`;
content = content.replace(/supplierOffers: SupplierOffer\[\];/g, newSchemaFields);

// Initialize them in loadFromDisk fallback
const newInitialState = `      supplierOffers: [],
      inventory: [],
      sales: [],
      decisions: [],
      auditLogs: [],`;
content = content.replace(/supplierOffers: \[\],/g, newInitialState);

// Add getters and setters
const newMethods = `
  // --- INVENTORY ---
  public getInventory(): InventoryItem[] {
    return this.data.inventory || [];
  }
  public getInventoryByMasterProductId(id: string): InventoryItem | undefined {
    return (this.data.inventory || []).find(i => i.masterProductId === id);
  }
  public upsertInventory(item: InventoryItem) {
    if (!this.data.inventory) this.data.inventory = [];
    const idx = this.data.inventory.findIndex(i => i.masterProductId === item.masterProductId && i.storeId === item.storeId);
    if (idx !== -1) {
      this.data.inventory[idx] = item;
    } else {
      this.data.inventory.push(item);
    }
    this.saveToDiskSync();
  }

  // --- SALES ---
  public getSales(): SalesRecord[] {
    return this.data.sales || [];
  }
  public addSalesRecord(sale: SalesRecord) {
    if (!this.data.sales) this.data.sales = [];
    this.data.sales.push(sale);
    this.saveToDiskSync();
  }

  // --- DECISIONS ---
  public getDecisions(): DecisionRecord[] {
    return this.data.decisions || [];
  }
  public getDecisionById(id: string): DecisionRecord | undefined {
    return (this.data.decisions || []).find(d => d.id === id);
  }
  public upsertDecision(decision: DecisionRecord) {
    if (!this.data.decisions) this.data.decisions = [];
    const idx = this.data.decisions.findIndex(d => d.id === decision.id);
    if (idx !== -1) {
      this.data.decisions[idx] = decision;
    } else {
      this.data.decisions.push(decision);
    }
    this.saveToDiskSync();
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs || [];
  }
  public addAuditLog(log: AuditLog) {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    this.data.auditLogs.push(log);
    this.saveToDiskSync();
  }
`;

content = content.replace(/export const db = new MarketDatabase\(\);/, `${newMethods}\nexport const db = new MarketDatabase();`);

fs.writeFileSync(dbPath, content);
console.log('Patched database.ts');
