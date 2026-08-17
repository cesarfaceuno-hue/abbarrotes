import { localDB } from '../LocalDB.js';
import { BaseRepository } from './BaseRepository.js';
import { LedgerMovement } from '../../types.js';

export class LedgerRepository extends BaseRepository {
  constructor() {
    super();
  }

  async getMovements(tenantId: string, storeId: string): Promise<LedgerMovement[]> {
    this.validateContext(tenantId, storeId);
    const state = localDB.getStoreState(tenantId, storeId);
    return state.ledger;
  }

  async createMovement(movement: Omit<LedgerMovement, 'id' | 'createdAt'>): Promise<string> {
    this.validateContext(movement.tenantId, movement.storeId);
    
    const state = localDB.getStoreState(movement.tenantId, movement.storeId);
    const id = Math.random().toString(36).substring(7);
    const newMovement: LedgerMovement = {
      ...movement,
      id,
      createdAt: new Date().toISOString()
    };
    
    state.ledger.push(newMovement);
    return id;
  }
}
