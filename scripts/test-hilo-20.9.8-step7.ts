import express from 'express';
import { Server } from 'http';
import { inventoryRouter } from '../server/routes/inventoryRoutes.js';
import { ledgerRouter } from '../server/routes/ledgerRoutes.js';
import { globalProductRouter } from '../server/routes/globalProductRoutes.js';
import { localDB } from '../server/db/LocalDB.js';

// Setup ephemeral express app for testing
const app = express();
app.use(express.json());
app.use('/api/inventory', inventoryRouter);
app.use('/api/ledger', ledgerRouter);
app.use('/api/products/global', globalProductRouter);

const PORT = 3999;
const BASE_URL = `http://localhost:${PORT}`;

function printSeparator() {
  console.log('='.repeat(80));
}

async function runTests() {
  console.log('\n🚀 STARTING HILO 20.9.8 - PASO 7 AUTOMATED INTEGRATION TEST SUITE\n');
  printSeparator();

  let server: Server;
  try {
    server = await new Promise<Server>((resolve) => {
      const s = app.listen(PORT, '127.0.0.1', () => {
        resolve(s);
      });
    });
  } catch (err) {
    console.error('Failed to start test server:', err);
    process.exit(1);
  }

  // Clear states before testing
  const tState = localDB.getStoreState('tenant-cdmx-01', 'store-cdmx-centro');
  tState.inventory = {};
  tState.ledger = [];
  localDB.globalProducts = {};

  let testsPassed = 0;
  const totalTests = 11;

  async function assertResponse(
    name: string,
    url: string,
    options: RequestInit,
    expectedStatus: number,
    checkFn?: (body: any) => boolean
  ): Promise<boolean> {
    try {
      console.log(`[RUNNING] ${name}...`);
      const res = await fetch(`${BASE_URL}${url}`, options);
      const body = await res.json();

      if (res.status !== expectedStatus) {
        console.error(`❌ [FAILED] ${name}`);
        console.error(`   Expected status: ${expectedStatus}, got: ${res.status}`);
        console.error(`   Response body:`, JSON.stringify(body, null, 2));
        return false;
      }

      if (checkFn && !checkFn(body)) {
        console.error(`❌ [FAILED] ${name} (Assertion check failed)`);
        console.error(`   Response body:`, JSON.stringify(body, null, 2));
        return false;
      }

      console.log(`✅ [PASS] ${name}`);
      testsPassed++;
      return true;
    } catch (err: any) {
      console.error(`❌ [FAILED] ${name} with error:`, err.message);
      return false;
    }
  }

  // --- TEST 1 ---
  await assertResponse(
    'TEST 1: Inserción exitosa de un item en inventario vía API (POST /api/inventory)',
    '/api/inventory',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'tenant-cdmx-01',
        'x-store-id': 'store-cdmx-centro',
      },
      body: JSON.stringify({
        masterProductId: 'prod-tst-1',
        stock: 10,
        minStock: 2,
        maxStock: 20,
        unitCost: 15.0,
        retailPrice: 20.0,
      }),
    },
    201,
    (body) => body.success === true && body.item.masterProductId === 'prod-tst-1' && body.item.stock === 10
  );

  // --- TEST 2 ---
  await assertResponse(
    'TEST 2: Validación de datos obligatorios en creación de inventario. Retornar 422 si falta masterProductId',
    '/api/inventory',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'tenant-cdmx-01',
        'x-store-id': 'store-cdmx-centro',
      },
      body: JSON.stringify({
        stock: 10,
        minStock: 2,
        maxStock: 20,
        unitCost: 15.0,
        retailPrice: 20.0,
      }),
    },
    422,
    (body) => body.success === false && body.error.includes('masterProductId')
  );

  // --- TEST 3 ---
  await assertResponse(
    'TEST 3: Validación de valores numéricos en creación de inventario (valores negativos). Retornar 400',
    '/api/inventory',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'tenant-cdmx-01',
        'x-store-id': 'store-cdmx-centro',
      },
      body: JSON.stringify({
        masterProductId: 'prod-tst-2',
        stock: -5,
        minStock: 2,
        maxStock: 20,
        unitCost: 15.0,
        retailPrice: 20.0,
      }),
    },
    400,
    (body) => body.success === false && body.error.includes('stock')
  );

  // --- TEST 4 ---
  await assertResponse(
    'TEST 4: Intentar duplicar un item ya existente en el inventario para el mismo store. Retornar 409 Conflict',
    '/api/inventory',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'tenant-cdmx-01',
        'x-store-id': 'store-cdmx-centro',
      },
      body: JSON.stringify({
        masterProductId: 'prod-tst-1',
        stock: 15,
        minStock: 2,
        maxStock: 20,
        unitCost: 15.0,
        retailPrice: 20.0,
      }),
    },
    409,
    (body) => body.success === false && body.error.includes('exists')
  );

  // --- TEST 5 ---
  await assertResponse(
    'TEST 5: Aislamiento: Tenant B NO puede leer inventario de Tenant A. Retornar 403 Forbidden',
    '/api/inventory',
    {
      method: 'GET',
      headers: {
        'x-tenant-id': 'tenant-cdmx-01',
        'x-user-tenant-id': 'tenant-cdmx-02', // User claims to belong to Tenant B
      },
    },
    403,
    (body) => body.success === false && body.error.includes('isolation')
  );

  // --- TEST 6 ---
  await assertResponse(
    'TEST 6: Aislamiento: Tenant B NO puede modificar inventario de Tenant A. Retornar 403 Forbidden',
    '/api/inventory',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'tenant-cdmx-01',
        'x-user-tenant-id': 'tenant-cdmx-02', // User claims to belong to Tenant B
      },
      body: JSON.stringify({
        masterProductId: 'prod-tst-3',
        stock: 10,
        minStock: 2,
        maxStock: 20,
        unitCost: 15.0,
        retailPrice: 20.0,
      }),
    },
    403,
    (body) => body.success === false && body.error.includes('isolation')
  );

  // --- TEST 7 ---
  await assertResponse(
    'TEST 7: Movimiento de Inventario exitoso vía API (POST /api/inventory/movement)',
    '/api/inventory/movement',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'tenant-cdmx-01',
        'x-store-id': 'store-cdmx-centro',
      },
      body: JSON.stringify({
        productId: 'prod-tst-1',
        quantity: 5,
        type: 'PURCHASE',
        reason: 'Compra de reabastecimiento',
        referenceId: 'ref-test-7',
        requestId: 'req-test-7',
        actorId: 'actor-test-7',
      }),
    },
    200,
    (body) => body.success === true && body.item.stock === 15 // 10 initial + 5 adjustment
  );

  // --- TEST 8 ---
  await assertResponse(
    'TEST 8: Error controlado por stock insuficiente (ajustar stock negativo mayor al disponible). Retornar 400',
    '/api/inventory/movement',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'tenant-cdmx-01',
        'x-store-id': 'store-cdmx-centro',
      },
      body: JSON.stringify({
        productId: 'prod-tst-1',
        quantity: -20, // Only 15 available
        type: 'SALE',
        reason: 'Venta mayor a stock',
      }),
    },
    400,
    (body) => body.success === false && body.error.includes('Insufficient stock')
  );

  // --- TEST 9 ---
  await assertResponse(
    'TEST 9: Validación de campos obligatorios en el movimiento (retornar 422 si falta productId)',
    '/api/inventory/movement',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'tenant-cdmx-01',
        'x-store-id': 'store-cdmx-centro',
      },
      body: JSON.stringify({
        quantity: 5,
        type: 'PURCHASE',
        reason: 'Falta id',
      }),
    },
    422,
    (body) => body.success === false && body.error.includes('productId')
  );

  // --- TEST 10 ---
  await assertResponse(
    'TEST 10: Auditoría: Verificar que el movimiento se haya guardado con provenance correcto en Ledger',
    '/api/ledger',
    {
      method: 'GET',
      headers: {
        'x-tenant-id': 'tenant-cdmx-01',
        'x-store-id': 'store-cdmx-centro',
      },
    },
    200,
    (body) => {
      const movement = body.movements.find((m: any) => m.referenceId === 'ref-test-7');
      return (
        movement &&
        movement.requestId === 'req-test-7' &&
        movement.actorId === 'actor-test-7' &&
        movement.reason === 'Compra de reabastecimiento'
      );
    }
  );

  // --- TEST 11 ---
  // First insert a global product
  await fetch(`${BASE_URL}/api/products/global`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      canonicalName: 'Aceite de Oliva Extra Virgen 1L',
      brand: 'Gallo',
      category: 'Aceites',
      barcode: '7501012345678',
      sku: 'Gallo-Olive-1L',
      presentation: 'Botella 1L',
      unit: 'litro',
    }),
  });

  await assertResponse(
    'TEST 11: GET global products catálogo vía API mapeado desde LocalDB',
    '/api/products/global',
    {
      method: 'GET',
    },
    200,
    (body) => {
      const prod = body.products.find((p: any) => p.barcode === '7501012345678');
      return prod && prod.canonicalName === 'Aceite de Oliva Extra Virgen 1L';
    }
  );

  printSeparator();
  console.log(`\n📊 INTEGRATION TEST SUITE SUMMARY:`);
  console.log(`   Passed: ${testsPassed} / ${totalTests}`);

  server.close();

  if (testsPassed === totalTests) {
    console.log('\n🌟 ALL PASO 7 TESTS PASSED SUCCESSFULLY! (PASS)\n');
    process.exit(0);
  } else {
    console.error('\n❌ SOME PASO 7 TESTS FAILED! (FAIL)\n');
    process.exit(1);
  }
}

runTests();
