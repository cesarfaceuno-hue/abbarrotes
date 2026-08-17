import { localDB } from '../LocalDB.js';
import { BaseRepository } from './BaseRepository.js';
import { InventoryItem, LedgerMovement, MovementType } from '../../types.js';

export class InventoryRepository extends BaseRepository {
  constructor() {
    super();
  }

  async getByProductId(tenantId: string, storeId: string, productId: string): Promise<InventoryItem | null> {
    this.validateContext(tenantId, storeId);
    const state = localDB.getStoreState(tenantId, storeId);
    return (state.inventory[productId] as InventoryItem) || null;
  }

  async getAll(tenantId: string, storeId: string): Promise<InventoryItem[]> {
    this.validateContext(tenantId, storeId);
    const state = localDB.getStoreState(tenantId, storeId);
    return Object.values(state.inventory) as InventoryItem[];
  }

  async create(item: Omit<InventoryItem, 'id' | 'createdAt' | 'lastUpdated'>): Promise<string> {
    this.validateContext(item.tenantId, item.storeId);
    const state = localDB.getStoreState(item.tenantId, item.storeId);
    const productId = item.masterProductId;
    
    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      ...item,
      id: productId,
      createdAt: now,
      lastUpdated: now
    };
    
    state.inventory[productId] = newItem;
    return productId;
  }

  async update(
    tenantId: string,
    storeId: string,
    productId: string,
    updates: Partial<Omit<InventoryItem, 'id' | 'tenantId' | 'storeId' | 'masterProductId' | 'createdAt' | 'lastUpdated'>>
  ): Promise<void> {
    this.validateContext(tenantId, storeId);
    const state = localDB.getStoreState(tenantId, storeId);
    const item = state.inventory[productId] as InventoryItem;
    if (!item) {
      throw new Error('INVENTORY_NOT_FOUND');
    }
    
    state.inventory[productId] = {
      ...item,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
  }

  async adjustStock(
    tenantId: string,
    storeId: string,
    productId: string,
    adjustment: number,
    type: MovementType,
    referenceId: string,
    requestId: string,
    actorId: string,
    reason: string
  ): Promise<void> {
    this.validateContext(tenantId, storeId);
    
    const state = localDB.getStoreState(tenantId, storeId);
    const invData = state.inventory[productId] as InventoryItem;

    if (!invData) throw new Error('INVENTORY_NOT_FOUND');

    const previousStock = invData.stock;
    const resultingStock = previousStock + adjustment;

    if (resultingStock < 0) throw new Error('INSUFFICIENT_STOCK');

    // Update Inventory
    state.inventory[productId] = {
      ...invData,
      stock: resultingStock,
      lastUpdated: new Date().toISOString()
    };

    // Create Ledger Entry
    const movement: LedgerMovement = {
      id: Math.random().toString(36).substring(7),
      tenantId,
      storeId,
      productId,
      type,
      quantity: adjustment,
      previousStock,
      resultingStock,
      referenceId,
      requestId,
      actorId,
      reason,
      createdAt: new Date().toISOString()
    };
    state.ledger.push(movement);
  }
}
