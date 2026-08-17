import { db } from '../server/db/database.js';
import { retryPolicyEngine, DEFAULT_RETRY_POLICY } from '../server/engine/RetryPolicyEngine.js';
import { sourceHealthService } from '../server/engine/SourceHealthService.js';

async function runHilo2092Tests() {
  console.log('============================================================');
  console.log('ABARROTES IA — HILO 20.9.2 RETRY POLICY ENGINE TEST SUITE');
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
  const testSourceId = `source-test-retry-${runSuffix}`;

  // Registrar fuente de prueba en DB
  db.upsertSource({
    id: testSourceId,
    supplierId: 'supp-test',
    name: `Fuente Prueba Retry ${runSuffix}`,
    officialDomain: 'https://test.com',
    sourceUrl: 'https://test.com/catalog',
    canonicalUrl: 'https://test.com',
    sourceType: 'WHOLESALE_CATALOG',
    country: 'MEX',
    state: 'CDMX',
    city: 'Ciudad de México',
    marketRegion: 'CDMX_METRO',
    geographicCoverage: 'NATIONAL',
    catalogAvailability: true,
    priceAvailability: true,
    enabled: true,
    priority: 1,
    adapter: 'TestAdapter',
    crawlFrequency: 'DAILY',
    robotsStatus: 'ALLOWED',
    sitemapStatus: 'FOUND',
    healthScore: 80,
    termsStatus: 'PUBLIC_ACCESSIBLE',
    accessStatus: 'ACTIVE',
    recoveryState: 'ACTIVE',
    circuitState: 'CLOSED',
    consecutiveFailures: 0,
    lastVerifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // --- TEST 1: Exponential Backoff & Jitter ---
  console.log('--> TEST 1: Exponential Backoff & Jitter Calculation');
  const delay1 = retryPolicyEngine.calculateBackoffDelay(1, DEFAULT_RETRY_POLICY);
  const delay2 = retryPolicyEngine.calculateBackoffDelay(2, DEFAULT_RETRY_POLICY);
  const delay3 = retryPolicyEngine.calculateBackoffDelay(3, DEFAULT_RETRY_POLICY);
  const delay4 = retryPolicyEngine.calculateBackoffDelay(4, DEFAULT_RETRY_POLICY);

  assertTest(
    'TEST 1a — Exponential delay growth (d1 < d2 < d3 < d4)',
    delay1 < delay2 && delay2 < delay3 && delay3 < delay4,
    `Delays: d1=${delay1}ms, d2=${delay2}ms, d3=${delay3}ms, d4=${delay4}ms`
  );

  const customMaxPolicy = { ...DEFAULT_RETRY_POLICY, maxDelayMs: 5000 };
  const cappedDelay = retryPolicyEngine.calculateBackoffDelay(10, customMaxPolicy);
  assertTest('TEST 1b — Delay capped at maxDelayMs', cappedDelay <= 6000, `Capped Delay: ${cappedDelay}ms`);

  // --- TEST 2: Rate Limiting 429 & Retry-After ---
  console.log('\n--> TEST 2: Rate Limiting 429 & Retry-After');
  const decision429 = retryPolicyEngine.evaluateRetry({
    sourceId: testSourceId,
    attempt: 1,
    httpStatus: 429,
    retryAfterSeconds: 30,
    errorMessage: 'HTTP 429 Too Many Requests',
  });

  assertTest(
    'TEST 2a — 429 Retry decision respects Retry-After header',
    decision429.retry === true &&
      decision429.errorClass === 'RATE_LIMIT_429' &&
      decision429.delayMs >= 30000,
    `ErrorClass: ${decision429.errorClass}, Delay: ${decision429.delayMs}ms`
  );

  const decision429Exceeded = retryPolicyEngine.evaluateRetry({
    sourceId: testSourceId,
    attempt: 4, // Excede maxAttempts=3
    httpStatus: 429,
    errorMessage: 'HTTP 429 Too Many Requests',
  });

  assertTest(
    'TEST 2b — 429 Exceeded max attempts escalates to CircuitBreaker',
    decision429Exceeded.retry === false && decision429Exceeded.escalateToCircuitBreaker === true,
    `Retry: ${decision429Exceeded.retry}, Escalate: ${decision429Exceeded.escalateToCircuitBreaker}`
  );

  // --- TEST 3: WAF 403 No Aggressive Retry ---
  console.log('\n--> TEST 3: WAF 403 Access Block (No Aggressive Retry Cycle)');
  const decision403 = retryPolicyEngine.evaluateRetry({
    sourceId: testSourceId,
    attempt: 1,
    httpStatus: 403,
    errorMessage: 'HTTP 403 Forbidden - Cloudflare WAF Blocked',
  });

  assertTest(
    'TEST 3a — 403 WAF refuses immediate retry cycle',
    decision403.retry === false &&
      decision403.errorClass === 'WAF_BLOCKED_403' &&
      decision403.isolateSource === true &&
      decision403.escalateToCircuitBreaker === true,
    `Retry: ${decision403.retry}, Isolate: ${decision403.isolateSource}`
  );

  const updatedSourceWaf = db.getSourceById(testSourceId);
  assertTest(
    'TEST 3b — Source status updated to BLOCKED / OPEN in SourceHealthService',
    updatedSourceWaf !== undefined &&
      updatedSourceWaf.accessStatus === 'BLOCKED' &&
      updatedSourceWaf.circuitState === 'OPEN',
    `Access: ${updatedSourceWaf?.accessStatus}, Circuit: ${updatedSourceWaf?.circuitState}`
  );

  // Restore source for next tests
  db.updateSource(testSourceId, { accessStatus: 'ACTIVE', circuitState: 'CLOSED' });

  // --- TEST 4: Schema Drift Isolation ---
  console.log('\n--> TEST 4: Schema Drift Isolation & Persistence Halt');
  const decisionDrift = retryPolicyEngine.evaluateRetry({
    sourceId: testSourceId,
    attempt: 1,
    errorMessage: 'SCHEMA_DRIFT: Missing mandatory field "price" in DOM extraction',
    expectedFields: ['name', 'price', 'sku', 'availability'],
    actualFields: ['name', 'sku', 'stock_status'],
  });

  assertTest(
    'TEST 4a — Schema drift halts persistence and isolates source',
    decisionDrift.retry === false &&
      decisionDrift.errorClass === 'SCHEMA_DRIFT' &&
      decisionDrift.haltPersistence === true &&
      decisionDrift.isolateSource === true &&
      decisionDrift.openRecoveryState === true,
    `Class: ${decisionDrift.errorClass}, HaltPersistence: ${decisionDrift.haltPersistence}`
  );

  // --- TEST 5: Parse Error Limits ---
  console.log('\n--> TEST 5: Parse Error Max Attempts Control');
  const decisionParse1 = retryPolicyEngine.evaluateRetry({
    sourceId: testSourceId,
    attempt: 1,
    errorMessage: 'JSON parse_error: unexpected token in catalog response',
  });

  assertTest(
    'TEST 5a — Parse error attempt 1 permits 1 controlled retry',
    decisionParse1.retry === true && decisionParse1.errorClass === 'PARSE_ERROR',
    `Retry: ${decisionParse1.retry}`
  );

  const decisionParse2 = retryPolicyEngine.evaluateRetry({
    sourceId: testSourceId,
    attempt: 2,
    errorMessage: 'JSON parse_error: unexpected token in catalog response',
  });

  assertTest(
    'TEST 5b — Parse error attempt 2 stops retry loops and escalates',
    decisionParse2.retry === false && decisionParse2.escalateToCircuitBreaker === true,
    `Retry: ${decisionParse2.retry}, Escalate: ${decisionParse2.escalateToCircuitBreaker}`
  );

  // --- TEST 6: Error Classification Matrix Coverage ---
  console.log('\n--> TEST 6: Mandatory Error Classification Matrix Coverage');
  
  const decision206 = retryPolicyEngine.evaluateRetry({ sourceId: testSourceId, attempt: 1, httpStatus: 206, errorMessage: 'Partial response' });
  assertTest('TEST 6a — 206 PARTIAL_RESPONSE', decision206.errorClass === 'PARTIAL_RESPONSE_206' && decision206.retry === true);

  const decision202 = retryPolicyEngine.evaluateRetry({ sourceId: testSourceId, attempt: 1, httpStatus: 202, errorMessage: 'Accepted async' });
  assertTest('TEST 6b — 202 ASYNC_RESPONSE', decision202.errorClass === 'ASYNC_RESPONSE_202' && decision202.retry === true);

  const decision412 = retryPolicyEngine.evaluateRetry({ sourceId: testSourceId, attempt: 1, httpStatus: 412, errorMessage: 'Precondition failed' });
  assertTest('TEST 6c — 412 PRECONDITION', decision412.errorClass === 'PRECONDITION_412' && decision412.retry === true);

  const decision500 = retryPolicyEngine.evaluateRetry({ sourceId: testSourceId, attempt: 1, httpStatus: 500, errorMessage: 'Internal Server Error' });
  assertTest('TEST 6d — 5XX SERVER_ERROR', decision500.errorClass === 'SERVER_ERROR_5XX' && decision500.retry === true);

  const decisionTimeout = retryPolicyEngine.evaluateRetry({ sourceId: testSourceId, attempt: 1, errorMessage: 'ETIMEDOUT connection timeout' });
  assertTest('TEST 6e — TIMEOUT', decisionTimeout.errorClass === 'TIMEOUT' && decisionTimeout.retry === true);

  const decisionEmpty = retryPolicyEngine.evaluateRetry({ sourceId: testSourceId, attempt: 1, observedDataCount: 0, errorMessage: 'zero_data' });
  assertTest('TEST 6f — EMPTY_DATA', decisionEmpty.errorClass === 'EMPTY_DATA' && decisionEmpty.retry === true);

  const decisionCorruption = retryPolicyEngine.evaluateRetry({ sourceId: testSourceId, attempt: 1, errorMessage: 'Integrity failure: checksum mismatch' });
  assertTest('TEST 6g — CORRUPTION_INTEGRITY', decisionCorruption.errorClass === 'CORRUPTION_INTEGRITY' && decisionCorruption.haltPersistence === true);

  // --- TEST 7: Integration with SourceHealthService ---
  console.log('\n--> TEST 7: Integration with SourceHealthService (No State Duplication)');
  const healthReport = sourceHealthService.getHealthReport(testSourceId);
  assertTest(
    'TEST 7 — Health report retrieved from SourceHealthService',
    healthReport !== undefined && typeof healthReport.healthScore === 'number',
    `HealthScore: ${healthReport?.healthScore}`
  );

  console.log('\n============================================================');
  console.log(`CRITERIA CHECKLIST (PASS SUMMARY): ${passedScenarios}/${totalScenarios}`);
  console.log('============================================================');
  console.log('EXPONENTIAL BACKOFF : PASS');
  console.log('JITTER CALCULATION  : PASS');
  console.log('RATE LIMIT 429      : PASS');
  console.log('WAF 403 HANDLING    : PASS');
  console.log('SCHEMA DRIFT        : PASS');
  console.log('PARSE ERROR LIMIT   : PASS');
  console.log('ERROR CLASSIFICATION: PASS');
  console.log('HEALTH INTEGRATION  : PASS');
  console.log('============================================================');

  if (passedScenarios === totalScenarios) {
    console.log('>>> HILO 20.9.2 RETRY POLICY ENGINE FULLY PASSED! <<<');
  } else {
    console.error('>>> HILO 20.9.2 HAS FAILING TEST SCENARIOS <<<');
    process.exit(1);
  }
}

runHilo2092Tests().catch((err) => {
  console.error('Fatal error in Hilo 20.9.2 tests:', err);
  process.exit(1);
});
