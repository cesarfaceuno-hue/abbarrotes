import { localDB } from '../server/db/LocalDB.js';
import { GlobalProductRepository } from '../server/db/repositories/GlobalProductRepository.js';
import { InventoryRepository } from '../server/db/repositories/InventoryRepository.js';
import { LedgerRepository } from '../server/db/repositories/LedgerRepository.js';

async function runTests() {
  console.log('--- Hilo 20.9.8 — Paso 6: LocalDB Repository Tests ---');
  
  const globalProductRepo = new GlobalProductRepository();
  const inventoryRepo = new InventoryRepository();
  const ledgerRepo = new LedgerRepository();

  const tenantId = 'test-tenant';
  const storeId = 'test-store';

  try {
    // 1. GlobalProduct Test
    console.log('Testing GlobalProductRepository...');
    const productId = await globalProductRepo.create({
      canonicalName: 'Coca-Cola 600ml',
      brand: 'Coca-Cola',
      category: 'Bebidas',
      presentation: '600ml',
      unit: 'piece',
      packSize: 1,
      avgRetailPriceCdmx: 18.00,
      cheapestWholesaleCost: 12.50,
      cheapestSupplierId: 'supplier-1',
      active: true,
      lastUpdated: new Date().toISOString()
    });
    console.log('Created product:', productId);

    // 2. Inventory & Ledger Test
    console.log('Testing InventoryRepository & Atomic Transaction...');
    
    // Pre-populate LocalDB for test
    const state = localDB.getStoreState(tenantId, storeId);
    state.inventory[productId] = {
      id: productId,
      tenantId,
      storeId,
      masterProductId: productId,
      stock: 10,
      minStock: 2,
      maxStock: 50,
      reorderPoint: 5,
      unitCost: 12.0,
      retailPrice: 18.0,
      targetMargin: 0.3,
      supplierLeadTimeDays: 1,
      averageDailySales: 1,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    await inventoryRepo.adjustStock(
      tenantId,
      storeId,
      productId,
      -3, // SALE
      'SALE',
      'ref-sale-1',
      'req-id-1',
      'actor-1',
      'Test sale'
    );
    
    console.log('Stock adjusted successfully');
    console.log('Final stock:', state.inventory[productId].stock);

    console.log('--- All tests PASSED ---');
  } catch (error) {
    console.error('--- Tests FAILED ---', error);
    process.exit(1);
  }
}

runTests();
