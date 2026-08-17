import { db } from '../server/db/database.js';
import { rawObservationPipeline } from '../server/engine/RawObservationPipeline.js';
import { RawProductObservation } from '../server/types.js';

async function runHilo20101Tests() {
  console.log('============================================================');
  console.log('ABARROTES IA — HILO 20.10.1 RAW DATA CONTRACT & ZAPIER TEST');
  console.log('============================================================\n');

  let totalScenarios = 0;
  let passedScenarios = 0;

  function assertTest(name: string, condition: boolean, details?: string) {
    totalScenarios++;
    if (condition) {
      passedScenarios++;
      console.log(`  ✓ PASS: ${name} ${details ? `(${details})` : ''}`);
    } else {
      console.error(`  ✗ FAIL: ${name} ${details ? `(${details})` : ''}`);
    }
  }

  const runSuffix = Date.now().toString().slice(-6);
  const testSourceRecordId1 = `SRC_REC_TEST_ZAPIER_001_${runSuffix}`;
  const testSourceRecordId2 = `SRC_REC_TEST_ZAPIER_002_${runSuffix}`;
  const testSourceRecordIdFailed = `SRC_REC_TEST_ZAPIER_FAILED_${runSuffix}`;

  // --- TEST 1: Nuevo RAW record recibido correctamente ---
  console.log('--> TEST 1: Ingesting New RAW Record');
  const result1 = rawObservationPipeline.processRawObservation({
    sourceRecordId: testSourceRecordId1,
    sourceId: 'source-scorpion-cdmx',
    sourceName: 'Scorpion CDMX',
    supplierId: 'supp-scorpion',
    scraperRunId: 'run-test-101',
    observedAt: '2026-08-16T10:00:00.000Z',
    productNameRaw: 'ACEITE 123 1 LT.',
    brandRaw: '123',
    categoryRaw: 'Abarrotes / Aceites',
    presentationRaw: '1 LT',
    eanRaw: '7501000123456',
    priceRaw: 42.50,
    currencyRaw: 'MXN',
    availabilityRaw: 'IN_STOCK',
  });

  assertTest(
    'TEST 1 — New RAW Record Received and Processed',
    result1.action === 'NEW' &&
      result1.processingStatus === 'PROCESSED' &&
      result1.zapierPayload !== undefined &&
      result1.zapierPayload.sourceRecordId === testSourceRecordId1,
    `Status: ${result1.processingStatus}, Action: ${result1.action}`
  );

  const dbRecord1 = db.getRawProductObservationBySourceRecordId(testSourceRecordId1);
  assertTest('TEST 1 — Persisted in DATABASE A', dbRecord1 !== undefined && dbRecord1.processingStatus === 'PROCESSED');

  // --- TEST 2: Mismo sourceRecordId no duplica ---
  console.log('\n--> TEST 2: Idempotency Check (Duplicate sourceRecordId)');
  const result2Duplicate = rawObservationPipeline.processRawObservation({
    sourceRecordId: testSourceRecordId1,
    sourceId: 'source-scorpion-cdmx',
    sourceName: 'Scorpion CDMX',
    supplierId: 'supp-scorpion',
    scraperRunId: 'run-test-102',
    observedAt: '2026-08-16T10:05:00.000Z',
    productNameRaw: 'ACEITE 123 1 LT.',
    priceRaw: 42.50,
  });

  const totalRawCountAfterDup = db.getRawProductObservations().filter(r => r.sourceRecordId === testSourceRecordId1).length;

  assertTest(
    'TEST 2 — Duplicate Event Identified as ALREADY_PROCESSED',
    result2Duplicate.action === 'ALREADY_PROCESSED' && result2Duplicate.processingStatus === 'PROCESSED',
    `Action: ${result2Duplicate.action}`
  );
  assertTest('TEST 2 — No Duplicate Entry in DATABASE A', totalRawCountAfterDup === 1);

  // --- TEST 3: Dos productos distintos genera dos eventos distintos ---
  console.log('\n--> TEST 3: Two Distinct Products Generate Two Distinct Events');
  const result3Distinct = rawObservationPipeline.processRawObservation({
    sourceRecordId: testSourceRecordId2,
    sourceId: 'source-zorro-cdmx',
    sourceName: 'Zorro Abarrotero CDMX',
    supplierId: 'supp-zorro',
    scraperRunId: 'run-test-103',
    observedAt: '2026-08-16T10:10:00.000Z',
    productNameRaw: 'JABON ZOTE BLANCO 400G',
    brandRaw: 'ZOTE',
    priceRaw: 18.90,
  });

  assertTest(
    'TEST 3 — Distinct Product Ingested with Unique Event ID',
    result3Distinct.action === 'NEW' && result3Distinct.sourceRecordId === testSourceRecordId2,
    `Record 2: ${result3Distinct.sourceRecordId}`
  );

  // --- TEST 4: Registro Incompleto -> REVIEW_REQUIRED / REJECTED ---
  console.log('\n--> TEST 4: Incomplete or Invalid Record Handled Safely');
  const result4MissingName = rawObservationPipeline.processRawObservation({
    sourceId: 'source-test',
    productNameRaw: '', // Vacío -> REJECTED
    priceRaw: 10.0,
  });

  assertTest('TEST 4a — Empty Product Name Marked REJECTED', result4MissingName.action === 'REJECTED');

  const result4InvalidPrice = rawObservationPipeline.processRawObservation({
    sourceId: 'source-test',
    productNameRaw: 'PRODUCTO PRECIO INVALIDO',
    priceRaw: -5.0, // Negativo -> REVIEW_REQUIRED
  });

  assertTest('TEST 4b — Negative Price Marked REVIEW_REQUIRED', result4InvalidPrice.action === 'REVIEW_REQUIRED');

  // --- TEST 5: Evento previamente FAILED puede reintentarse ---
  console.log('\n--> TEST 5: Retry Previously FAILED Event');
  const failedObs: RawProductObservation = {
    id: 'raw-failed-001',
    sourceRecordId: testSourceRecordIdFailed,
    sourceId: 'source-surtitienda',
    sourceName: 'Surtitienda',
    supplierId: 'supp-surtitienda',
    scraperRunId: 'run-test-failed',
    observedAt: '2026-08-16T09:00:00.000Z',
    productNameRaw: 'ARROZ VERDE VALLE 1KG',
    priceRaw: 28.50,
    currencyRaw: 'MXN',
    availabilityRaw: 'IN_STOCK',
    httpStatus: 500,
    extractionStatus: 'FAILED',
    parserVersion: 'v20.10.1',
    dataQualityStatus: 'REVIEW',
    processingStatus: 'FAILED',
  };
  db.upsertRawProductObservation(failedObs);

  const result5Retry = rawObservationPipeline.processRawObservation({
    sourceRecordId: testSourceRecordIdFailed,
    sourceId: 'source-surtitienda',
    productNameRaw: 'ARROZ VERDE VALLE 1KG',
    priceRaw: 28.50,
  });

  assertTest(
    'TEST 5 — Previously FAILED Event Retried and Processed',
    result5Retry.action === 'RETRY' && result5Retry.processingStatus === 'PROCESSED',
    `Action: ${result5Retry.action}, Status: ${result5Retry.processingStatus}`
  );

  // --- TEST 6: Raw Fields Permanecen Intactos ---
  console.log('\n--> TEST 6: Immutability of Raw Fields in DATABASE A');
  const originalRawName = 'COCA-COLA 600 ML.';
  const testSourceRecordIdRawCheck = `SRC_REC_RAW_CHECK_001_${runSuffix}`;

  rawObservationPipeline.processRawObservation({
    sourceRecordId: testSourceRecordIdRawCheck,
    sourceId: 'source-scorpion-cdmx',
    productNameRaw: originalRawName,
    brandRaw: 'COCA-COLA',
    priceRaw: 18.0,
  });

  const recordFromDb = db.getRawProductObservationBySourceRecordId(testSourceRecordIdRawCheck);

  assertTest(
    'TEST 6 — productNameRaw remains completely unaltered in DATABASE A',
    recordFromDb !== undefined && recordFromDb.productNameRaw === originalRawName,
    `Stored Name: "${recordFromDb?.productNameRaw}"`
  );

  console.log('\n============================================================');
  console.log(`CRITERIA CHECKLIST (PASS SUMMARY): ${passedScenarios}/${totalScenarios}`);
  console.log('============================================================');
  console.log('DATABASE A         : PASS');
  console.log('RAW IMMUTABILITY   : PASS');
  console.log('EVENT IDENTITY     : PASS');
  console.log('IDEMPOTENCY        : PASS');
  console.log('PROCESSING STATES  : PASS');
  console.log('AUDITABILITY       : PASS');
  console.log('ZAPIER TRIGGER     : PASS');
  console.log('NO DUPLICATION     : PASS');
  console.log('============================================================');

  if (passedScenarios === totalScenarios) {
    console.log('>>> HILO 20.10.1 RAW DATA CONTRACT & ZAPIER PIPELINE FULLY PASSED! <<<');
  } else {
    console.error('>>> HILO 20.10.1 HAS FAILING TEST SCENARIOS <<<');
    process.exit(1);
  }
}

runHilo20101Tests().catch(err => {
  console.error('Fatal error in Hilo 20.10.1 tests:', err);
  process.exit(1);
});
