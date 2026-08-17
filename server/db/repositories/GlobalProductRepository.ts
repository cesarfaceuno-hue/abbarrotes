import { localDB } from '../LocalDB.js';
import { MasterProduct } from '../../types.js';

export class GlobalProductRepository {
  constructor() {}

  async create(product: Omit<MasterProduct, 'id'>): Promise<string> {
    const id = Math.random().toString(36).substring(7);
    localDB.globalProducts[id] = { 
        ...product, 
        id, 
        lastUpdated: new Date().toISOString() 
    };
    return id;
  }

  async getById(id: string): Promise<MasterProduct | null> {
    return localDB.globalProducts[id] || null;
  }

  async getByBarcode(barcode: string): Promise<MasterProduct | null> {
    const products = Object.values(localDB.globalProducts) as MasterProduct[];
    const product = products.find(p => p.barcode === barcode);
    return product || null;
  }

  async getAll(): Promise<MasterProduct[]> {
    return Object.values(localDB.globalProducts) as MasterProduct[];
  }
}
