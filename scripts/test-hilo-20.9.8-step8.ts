import express from 'express';
import { Server } from 'http';
import { discoveryRouter } from '../server/routes/discoveryRoutes.js';
import { globalProductRouter } from '../server/routes/globalProductRoutes.js';
import { localDB } from '../server/db/LocalDB.js';
import { NormalizationEngine, MATCH_THRESHOLDS } from '../server/engine/DiscoveryAndMatchingEngine.js';

const app = express();
app.use(express.json());
app.use('/api/discovery', discoveryRouter);
app.use('/api/products/global', globalProductRouter);

const PORT = 3998;
const BASE_URL = `http://localhost:${PORT}`;

function printSeparator() {
  console.log('='.repeat(80));
}

async function runTests() {
  console.log('\n🚀 STARTING HILO 20.9.8 - PASO 8 DETAILED INTEGRATION TEST SUITE\n');
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

  // Inicializar LocalDB con un set de productos globales controlados para las pruebas
  localDB.globalProducts = {
    'prod-01': {
      id: 'prod-01',
      canonicalName: 'Refresco Coca Cola Original 600ml',
      brand: 'Coca-Cola',
      category: 'Bebidas',
      barcode: '7501055300075',
      sku: 'COCA-600',
      presentation: 'Botella 600ml',
      unit: 'pieza',
      packSize: 1,
      avgRetailPriceCdmx: 18.0,
      cheapestWholesaleCost: 14.5,
      cheapestSupplierId: 'scorpion',
      active: true,
      lastUpdated: new Date().toISOString(),
    },
    'prod-02': {
      id: 'prod-02',
      canonicalName: 'Leche Entera Alpura 1 Litro',
      brand: 'Alpura',
      category: 'Lácteos',
      barcode: '7501055900039',
      sku: 'ALPURA-1L',
      presentation: 'Tetrapak 1L',
      unit: 'litro',
      packSize: 1,
      avgRetailPriceCdmx: 26.0,
      cheapestWholesaleCost: 22.0,
      cheapestSupplierId: 'zorro',
      active: true,
      lastUpdated: new Date().toISOString(),
    },
    'prod-03': {
      id: 'prod-03',
      canonicalName: 'Leche Deslactosada Alpura 1 Litro',
      brand: 'Alpura',
      category: 'Lácteos',
      barcode: '7501055900040',
      sku: 'ALPURA-DES-1L',
      presentation: 'Tetrapak 1L',
      unit: 'litro',
      packSize: 1,
      avgRetailPriceCdmx: 28.0,
      cheapestWholesaleCost: 23.5,
      cheapestSupplierId: 'zorro',
      active: true,
      lastUpdated: new Date().toISOString(),
    },
    'prod-04': {
      id: 'prod-04',
      canonicalName: 'Aceite de Oliva Extra Virgen Gallo 500ml',
      brand: 'Gallo',
      category: 'Abarrotes',
      barcode: '7501012300000',
      sku: 'GALLO-500ML',
      presentation: 'Botella 500ml',
      unit: 'pieza',
      packSize: 1,
      avgRetailPriceCdmx: 110.0,
      cheapestWholesaleCost: 92.0,
      cheapestSupplierId: 'mayoreototal',
      active: true,
      lastUpdated: new Date().toISOString(),
    }
  };

  let testsPassed = 0;
  const totalTests = 13;

  async function assertPost(
    name: string,
    url: string,
    bodyData: any,
    expectedStatus: number,
    headers: Record<string, string> = {},
    checkFn?: (body: any) => boolean
  ): Promise<boolean> {
    try {
      console.log(`[RUNNING] ${name}...`);
      const res = await fetch(`${BASE_URL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'tenant-cdmx-01',
          'x-store-id': 'store-cdmx-centro',
          ...headers,
        },
        body: JSON.stringify(bodyData),
      });
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

  // --- TEST 1: Exact match ---
  await assertPost(
    'TEST 1: Exact match (nombre idéntico exacto al catálogo)',
    '/api/discovery/match',
    {
      query: 'Refresco Coca Cola Original 600ml',
      brand: 'Coca-Cola',
    },
    200,
    {},
    (body) => {
      const topResult = body.matchResults[0];
      return (
        topResult &&
        topResult.candidate.id === 'prod-01' &&
        topResult.score >= 0.95 &&
        topResult.confidence === 'HIGH' &&
        topResult.decision === 'MATCH'
      );
    }
  );

  // --- TEST 2: Normalized name match ---
  await assertPost(
    'TEST 2: Normalized name match (remoción de acentos, minúsculas, espacios múltiples, abreviaciones "pza" / "pieza")',
    '/api/discovery/match',
    {
      query: '  réfresco   coca   cola   original   600ML  pza  ',
      brand: 'coca-cola',
    },
    200,
    {},
    (body) => {
      const topResult = body.matchResults[0];
      // Debe mapear el nombre normalizado y hacer match con el ID prod-01
      return (
        topResult &&
        topResult.candidate.id === 'prod-01' &&
        topResult.score >= 0.65 &&
        (topResult.decision === 'REVIEW' || topResult.decision === 'MATCH')
      );
    }
  );

  // --- TEST 3: Brand + name match ---
  await assertPost(
    'TEST 3: Brand + name match (marca exacta y palabras clave del nombre)',
    '/api/discovery/match',
    {
      query: 'Refresco Coca Cola Original',
      brand: 'Coca-Cola',
    },
    200,
    {},
    (body) => {
      const topResult = body.matchResults[0];
      return (
        topResult &&
        topResult.candidate.id === 'prod-01' &&
        topResult.reasons.some((r: string) => r.toLowerCase().includes('marca') || r.toLowerCase().includes('fuzzy')) &&
        topResult.score >= MATCH_THRESHOLDS.MEDIUM
      );
    }
  );

  // --- TEST 4: Presentation match ---
  await assertPost(
    'TEST 4: Presentation match (validación de match de presentación en score)',
    '/api/discovery/match',
    {
      query: 'Refresco Coca Cola Original 600ml',
      brand: 'Coca-Cola',
      presentation: 'Botella 600ml',
    },
    200,
    {},
    (body) => {
      const topResult = body.matchResults[0];
      return (
        topResult &&
        topResult.reasons.some((r: string) => r.toLowerCase().includes('presentación'))
      );
    }
  );

  // --- TEST 5: Barcode exact match ---
  await assertPost(
    'TEST 5: Barcode exact match (coincidencia perfecta por código de barras)',
    '/api/discovery/match',
    {
      query: 'Coca Cola Diferente Texto',
      brand: 'Coca-Cola',
      barcode: '7501055300075',
    },
    200,
    {},
    (body) => {
      const topResult = body.matchResults[0];
      return (
        topResult &&
        topResult.candidate.id === 'prod-01' &&
        topResult.score === 1.0 &&
        topResult.confidence === 'HIGH' &&
        topResult.decision === 'MATCH' &&
        topResult.reasons.some((r: string) => r.toLowerCase().includes('código de barras'))
      );
    }
  );

  // --- TEST 6: No match ---
  await assertPost(
    'TEST 6: No match (producto completamente inexistente en el catálogo)',
    '/api/discovery/match',
    {
      query: 'Jabón Zote de Limón Gigante Inexistente',
      brand: 'La Corona',
    },
    200,
    {},
    (body) => {
      return body.discoveryCount === 0 && body.matchResults.length === 0;
    }
  );

  // --- TEST 7: Low confidence ---
  await assertPost(
    'TEST 7: Low confidence (pocas coincidencias de tokens o de marca)',
    '/api/discovery/match',
    {
      query: 'Aceite Gallo', // Gallo es brand. "Aceite de Oliva Extra Virgen Gallo 500ml" tiene muchos más tokens.
      brand: 'Gallo',
    },
    200,
    {},
    (body) => {
      const topResult = body.matchResults[0];
      return (
        topResult &&
        topResult.score < MATCH_THRESHOLDS.HIGH &&
        topResult.confidence !== 'HIGH'
      );
    }
  );

  // --- TEST 8: High confidence ---
  await assertPost(
    'TEST 8: High confidence (coincidencia de casi todos los elementos principales)',
    '/api/discovery/match',
    {
      query: 'Leche Entera Alpura 1 Litro',
      brand: 'Alpura',
      presentation: 'Tetrapak 1L',
    },
    200,
    {},
    (body) => {
      const topResult = body.matchResults[0];
      return (
        topResult &&
        topResult.candidate.id === 'prod-02' &&
        topResult.score >= MATCH_THRESHOLDS.HIGH &&
        topResult.confidence === 'HIGH'
      );
    }
  );

  // --- TEST 9: Ambiguous candidates ---
  await assertPost(
    'TEST 9: Ambiguous candidates (dos leches de Alpura con mismo volumen que compiten con score muy cercano)',
    '/api/discovery/match',
    {
      query: 'Leche Alpura 1 Litro', // No especifica si es Entera (prod-02) o Deslactosada (prod-03)
      brand: 'Alpura',
    },
    200,
    {},
    (body) => {
      const topResult = body.matchResults[0];
      const secondResult = body.matchResults[1];
      // Ambos deben tener score alto y la decisión sobre el topResult debe marcarse como AMBIGUOUS
      return (
        topResult &&
        secondResult &&
        topResult.decision === 'AMBIGUOUS' &&
        topResult.reasons.some((r: string) => r.toLowerCase().includes('ambigüedad'))
      );
    }
  );

  // --- TEST 10: Multiple candidates correctamente ordenados por score ---
  await assertPost(
    'TEST 10: Multiple candidates correctamente ordenados descendentemente por score',
    '/api/discovery/match',
    {
      query: 'Leche Alpura',
      brand: 'Alpura',
    },
    200,
    {},
    (body) => {
      const results = body.matchResults;
      if (results.length < 2) return false;
      let isSorted = true;
      for (let i = 0; i < results.length - 1; i++) {
        if (results[i].score < results[i + 1].score) {
          isSorted = false;
        }
      }
      return isSorted;
    }
  );

  // --- TEST 11: Tenant isolation ---
  // Probamos que el middleware de aislamiento levante un error 403 Forbidden si hay inconsistencia en el tenant del usuario
  await assertPost(
    'TEST 11: Tenant isolation (un usuario de Tenant B intentando acceder a Tenant A)',
    '/api/discovery/match',
    {
      query: 'Refresco Coca Cola Original 600ml',
      brand: 'Coca-Cola',
      tenantId: 'tenant-cdmx-01',
    },
    403,
    {
      'x-user-tenant-id': 'tenant-cdmx-02', // El usuario dice pertenecer a tenant-cdmx-02
    },
    (body) => {
      return body.success === false && body.error.toLowerCase().includes('tenant isolation');
    }
  );

  // --- TEST 12: Determinismo ---
  console.log('[RUNNING] TEST 12: Determinismo (correr la misma consulta 3 veces seguidas y verificar igualdad total)...');
  const payload12 = {
    query: 'Leche Entera Alpura 1 Litro',
    brand: 'Alpura',
  };
  const res1 = await fetch(`${BASE_URL}/api/discovery/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload12),
  });
  const r1 = await res1.json();

  const res2 = await fetch(`${BASE_URL}/api/discovery/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload12),
  });
  const r2 = await res2.json();

  const res3 = await fetch(`${BASE_URL}/api/discovery/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload12),
  });
  const r3 = await res3.json();

  const isDeterministic =
    JSON.stringify(r1.matchResults) === JSON.stringify(r2.matchResults) &&
    JSON.stringify(r2.matchResults) === JSON.stringify(r3.matchResults);

  if (isDeterministic) {
    console.log('✅ [PASS] TEST 12: Determinismo');
    testsPassed++;
  } else {
    console.error('❌ [FAILED] TEST 12: Determinismo (los resultados difieren entre corridas)');
  }

  // --- TEST 13: No modificación de los datos originales durante normalización ---
  console.log('[RUNNING] TEST 13: No modificación de los datos originales durante normalización...');
  const inputName = '  Coca   Cola  ';
  const inputBrand = 'Coca-Cola';
  
  const normalized = NormalizationEngine.normalizeDetails(inputName, inputBrand);
  
  const originalIntact = 
    normalized.name.originalValue === inputName && 
    normalized.brand.originalValue === inputBrand;
    
  if (originalIntact) {
    console.log('✅ [PASS] TEST 13: No modificación de los datos originales durante normalización');
    testsPassed++;
  } else {
    console.error('❌ [FAILED] TEST 13: No modificación de los datos originales (los valores originales mutaron)');
  }

  printSeparator();
  console.log(`\n📊 INTEGRATION TEST SUITE PASO 8 SUMMARY:`);
  console.log(`   Passed: ${testsPassed} / ${totalTests}`);

  server.close();

  if (testsPassed === totalTests) {
    console.log('\n🌟 ALL PASO 8 TESTS PASSED SUCCESSFULLY! (PASS)\n');
    process.exit(0);
  } else {
    console.error('\n❌ SOME PASO 8 TESTS FAILED! (FAIL)\n');
    process.exit(1);
  }
}

runTests();
