import { db } from '../server/db/database.js';
import { pipelineOrchestrator } from '../server/engine/PipelineOrchestrator.js';
import { RawProductObservation } from '../server/types.js';

async function runE2ERealTest() {
  console.log('============================================================');
  console.log('ABARROTES IA — HILO 20.9.6 E2E REAL SPREADSHEET TEST');
  console.log('============================================================\n');

  const source = db.getSources()[0];
  const spreadsheetId = '1hHgZxURsUk_n6oAPh7IJYEqFre_AM0rGKtMXVnzdTxE';
  const sheetName = 'MI_ABARROTERO_UNIVERSAL_CATALOG';

  // 1. RUN #1: 100 productos (APPEND)
  const products: RawProductObservation[] = Array.from({ length: 100 }, (_, i) => ({
    id: `obs-${i}`,
    sourceId: source.id,
    sourceName: source.name,
    supplierId: source.supplierId,
    scraperRunId: 'run-1',
    sourceRecordId: `prod-${i}`,
    observedAt: new Date().toISOString(),
    productNameRaw: `Prod ${i}`,
    priceRaw: 10.0,
    currencyRaw: 'MXN',
    availabilityRaw: 'IN_STOCK',
    httpStatus: 200,
    extractionStatus: 'SUCCESS',
    parserVersion: '1.0',
    dataQualityStatus: 'VALID',
    processingStatus: 'PROCESSED'
  }));

  console.log('Ejecutando RUN #1...');
  await pipelineOrchestrator.runPipeline(source.id, products, spreadsheetId, sheetName);

  // 2. RUN #2: Mismos 100 productos (NO_OP / IDEMPOTENTE)
  console.log('Ejecutando RUN #2 (Idempotencia)...');
  await pipelineOrchestrator.runPipeline(source.id, products, spreadsheetId, sheetName);

  // 3. RUN #3: 100 productos (10 cambios de precio)
  const changedProducts = [...products];
  for(let i=0; i<10; i++) {
    changedProducts[i] = { ...changedProducts[i], priceRaw: 20.0 };
  }
  console.log('Ejecutando RUN #3 (Updates)...');
  await pipelineOrchestrator.runPipeline(source.id, changedProducts, spreadsheetId, sheetName);
  
  console.log('\nTodas las operaciones ejecutadas. Revisar AuditLog en consola.');
}

runE2ERealTest().catch(console.error);
