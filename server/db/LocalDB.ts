type DBState = {
  inventory: Record<string, any>; // productId -> item
  ledger: any[];
};

class LocalDB {
  private static instance: LocalDB;
  // tenantId -> storeId -> State
  private data: Record<string, Record<string, DBState>> = {};
  public globalProducts: Record<string, any> = {};

  public static getInstance(): LocalDB {
    if (!LocalDB.instance) LocalDB.instance = new LocalDB();
    return LocalDB.instance;
  }

  public getStoreState(tenantId: string, storeId: string): DBState {
    if (!this.data[tenantId]) this.data[tenantId] = {};
    if (!this.data[tenantId][storeId]) {
      this.data[tenantId][storeId] = { inventory: {}, ledger: [] };
    }
    return this.data[tenantId][storeId];
  }
}

export const localDB = LocalDB.getInstance();
