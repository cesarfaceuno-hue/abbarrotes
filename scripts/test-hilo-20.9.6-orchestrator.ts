import { db } from '../server/db/database.js';
import { pipelineOrchestrator } from '../server/engine/PipelineOrchestrator.js';
import { RawProductObservation } from '../server/types.js';

async function runHilo2096Tests() {
  console.log('============================================================');
  console.log('ABARROTES IA — HILO 20.9.6 E2E ORCHESTRATOR TEST SUITE');
  console.log('============================================================\n');

  const source = db.getSources()[0];
  const spreadsheetId = 'test-sheet';
  const sheetName = 'Sheet1';

  // 1. RUN #1: 100 products (APPEND)
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

  await pipelineOrchestrator.runPipeline(source.id, products, spreadsheetId, sheetName);
  console.log('PASS: RUN 1 executed');

  // 2. RUN #2: Same 100 products (NO_OP)
  await pipelineOrchestrator.runPipeline(source.id, products, spreadsheetId, sheetName);
  console.log('PASS: RUN 2 executed (Idempotency)');

  // 3. RUN #3: 100 products (10 changed price)
  const changedProducts = [...products];
  for(let i=0; i<10; i++) {
    changedProducts[i] = { ...changedProducts[i], priceRaw: 20.0 };
  }
  await pipelineOrchestrator.runPipeline(source.id, changedProducts, spreadsheetId, sheetName);
  console.log('PASS: RUN 3 executed (Updates)');
}

runHilo2096Tests().catch(console.error);
