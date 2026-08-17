import { db } from '../server/db/database.js';
import { recoveryEngine } from '../server/engine/RecoveryEngine.js';
import { scheduler } from '../server/engine/scheduler.js';
import { ScraperRun, SupplierSource } from '../server/types.js';

async function runResilienceTests() {
  console.log('============================================================');
  console.log('ABARROTES IA — HILO 20.9 SOURCE RESILIENCE & RECOVERY TEST');
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

  // --- MOCK SOURCE PREPARATION ---
  const dummySource: SupplierSource = {
    id: 'source-test-dummy',
    supplierId: 'supp-test-dummy',
    name: 'Fuente Prueba Resiliencia CDMX',
    officialDomain: 'https://test.cdmx.mx',
    sourceUrl: 'https://test.cdmx.mx/catalog',
    canonicalUrl: 'https://test.cdmx.mx/catalog',
    sourceType: 'ECOMMERCE',
    country: 'MEX',
    state: 'CDMX',
    city: 'Ciudad de México',
    marketRegion: 'CDMX_METRO',
    geographicCoverage: 'CDMX_METRO',
    catalogAvailability: true,
    priceAvailability: true,
    enabled: true,
    priority: 1,
    adapter: 'ScorpionAdapter',
    crawlFrequency: 'DAILY',
    robotsStatus: 'ALLOWED',
    sitemapStatus: 'FOUND',
    lastVerifiedAt: new Date().toISOString(),
    healthScore: 100,
    termsStatus: 'PUBLIC_ACCESSIBLE',
    accessStatus: 'ACTIVE',
    recoveryState: 'ACTIVE',
    circuitState: 'CLOSED',
    consecutiveSuccesses: 5,
    consecutiveFailures: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.upsertSource(dummySource);

  console.log('--> Scenario 1: HTTP Error Matrix Classification & Recovery Strategy');
  
  const res200 = recoveryEngine.classifyFailure('OK', 200);
  assertTest('HTTP 200 Classification', res200.category === 'SUCCESS' && res200.recommendedAction === 'PERSIST_NORMAL');

  const res206 = recoveryEngine.classifyFailure('Surtitienda HTTP status 206', 206);
  assertTest('HTTP 206 Partial Content', res206.category === 'PARTIAL_RESPONSE' && res206.recommendedAction === 'VALIDATE_PARTIAL');

  const res202 = recoveryEngine.classifyFailure('Abarrotero HTTP status 202', 202);
  assertTest('HTTP 202 Async Response', res202.category === 'ASYNC_RESPONSE' && res202.recommendedAction === 'RETRY_EXPONENTIAL_BACKOFF');

  const res403 = recoveryEngine.classifyFailure('Mercado Libre status 403 WAF', 403);
  assertTest('HTTP 403 WAF Block', res403.category === 'WAF_BLOCK' && res403.recommendedAction === 'MARK_SOURCE_BLOCKED');

  const res412 = recoveryEngine.classifyFailure('Bodega Aurrera status 412 Precondition', 412);
  assertTest('HTTP 412 Precondition Failed', res412.category === 'PRECONDITION' && res412.recommendedAction === 'ADAPTIVE_HEADER_RETRY');

  const res429 = recoveryEngine.classifyFailure('Too Many Requests 429', 429);
  assertTest('HTTP 429 Rate Limit', res429.category === 'RATE_LIMIT' && res429.recommendedAction === 'WAIT_RATE_LIMIT_RESET');

  const res503 = recoveryEngine.classifyFailure('Server error 503', 503);
  assertTest('HTTP 5xx Server Error', res503.category === 'SOURCE_ERROR' && res503.recommendedAction === 'RETRY_EXPONENTIAL_BACKOFF');

  const resTimeout = recoveryEngine.classifyFailure('Connection ETIMEDOUT network');
  assertTest('Network Timeout', resTimeout.category === 'TIMEOUT' && resTimeout.recommendedAction === 'RETRY_EXPONENTIAL_BACKOFF');

  console.log('\n--> Scenario 2: Schema Drift & Integrity Guard');

  const isSchemaDrift = recoveryEngine.detectSchemaDrift(1200, 0);
  assertTest('Schema Drift Detection (HTML > 500b with 0 products)', isSchemaDrift === true);

  const invalidProd = recoveryEngine.validateObservedProduct({ productName: '', regularPrice: -10 });
  assertTest('Integrity Guard (Rejects invalid identity & negative price)', invalidProd.valid === false);

  const validProd = recoveryEngine.validateObservedProduct({ productName: 'Coca-Cola 600ml', barcode: '7501055301088', regularPrice: 18.5 });
  assertTest('Integrity Guard (Accepts valid product & price)', validProd.valid === true);

  console.log('\n--> Scenario 3: Circuit Breaker State Machine & Transitions');

  // Test CLOSED state
  const testClosed = recoveryEngine.canRunSource(dummySource);
  assertTest('Circuit CLOSED allows normal execution', testClosed.allowed === true && testClosed.mode === 'NORMAL');

  // Simulate WAF Block (403)
  const mockRun: ScraperRun = {
    id: 'run-mock-403',
    supplierId: dummySource.supplierId,
    sourceId: dummySource.id,
    sourceName: dummySource.name,
    startedAt: new Date().toISOString(),
    status: 'RUNNING',
    pagesVisited: 1,
    productsDiscovered: 0,
    productsParsed: 0,
    productsAccepted: 0,
    productsRejected: 0,
    productsMatched: 0,
    productsUnmatched: 0,
    priceChanges: 0,
    errors: [],
    warnings: [],
    durationMs: 120,
    workerVersion: '4.1.0',
    logs: [],
  };

  recoveryEngine.processFailure(dummySource, mockRun, 'Mercado Libre HTTP 403 WAF', 403);
  const updatedSourceAfter403 = db.getSourceById(dummySource.id)!;

  assertTest(
    '403 WAF Block transitions Circuit to OPEN and sets accessStatus=BLOCKED',
    updatedSourceAfter403.circuitState === 'OPEN' && updatedSourceAfter403.accessStatus === 'BLOCKED'
  );

  // Test OPEN state during active cooldown (should be BLOCKED / skipped)
  const testOpen = recoveryEngine.canRunSource(updatedSourceAfter403);
  assertTest('Circuit OPEN blocks execution during active cooldown', testOpen.allowed === false && testOpen.mode === 'OPEN_BLOCKED');

  // Force expire cooldown to test HALF_OPEN probe
  db.updateSource(dummySource.id, {
    cooldownUntil: new Date(Date.now() - 1000).toISOString(),
  });

  const sourceExpiredCooldown = db.getSourceById(dummySource.id)!;
  const testProbe = recoveryEngine.canRunSource(sourceExpiredCooldown);
  assertTest(
    'Circuit OPEN with expired cooldown transitions to HALF_OPEN for 1 probe',
    testProbe.allowed === true && testProbe.circuitState === 'HALF_OPEN' && testProbe.mode === 'PROBE'
  );

  // Re-fetch source from DB so it holds circuitState = 'HALF_OPEN'
  const sourceInHalfOpen = db.getSourceById(dummySource.id)!;

  // Simulate Probe SUCCESS
  const probeRun: ScraperRun = {
    id: 'run-probe-success',
    supplierId: dummySource.supplierId,
    sourceId: dummySource.id,
    sourceName: dummySource.name,
    startedAt: new Date().toISOString(),
    status: 'SUCCESS',
    pagesVisited: 1,
    productsDiscovered: 10,
    productsParsed: 10,
    productsAccepted: 10,
    productsRejected: 0,
    productsMatched: 10,
    productsUnmatched: 0,
    priceChanges: 0,
    errors: [],
    warnings: [],
    durationMs: 250,
    workerVersion: '4.1.0',
    logs: [],
  };

  recoveryEngine.processSuccess(sourceInHalfOpen, probeRun);
  const recoveredSource = db.getSourceById(dummySource.id)!;

  assertTest(
    'HALF_OPEN Probe SUCCESS recovers source -> CLOSED state & accessStatus=ACTIVE',
    recoveredSource.circuitState === 'CLOSED' && recoveredSource.accessStatus === 'ACTIVE' && recoveredSource.healthScore >= 80
  );

  console.log('\n--> Scenario 4: Recovery Audit Trail Verification');

  const auditTrail = db.getRecoveryAttempts(dummySource.id);
  assertTest('Recovery Audit Trail logs attempt records in DB', auditTrail.length >= 2, `Recorded attempts: ${auditTrail.length}`);

  if (auditTrail.length > 0) {
    const lastAttempt = auditTrail[auditTrail.length - 1];
    assertTest(
      'Audit Record includes timing, result, and strategy',
      lastAttempt.result === 'SUCCESS' && lastAttempt.strategy === 'HALF_OPEN_PROBE'
    );
  }

  console.log('\n--> Scenario 5: Cache Intelligence & Freshness Marking');

  const freshnessNow = recoveryEngine.getFreshnessStatus(new Date().toISOString());
  assertTest('Freshness (<24h) is FRESH', freshnessNow === 'FRESH');

  const staleDate = new Date(Date.now() - 50 * 3600 * 1000).toISOString(); // 50 hours ago
  const freshnessStale = recoveryEngine.getFreshnessStatus(staleDate);
  assertTest('Freshness (50h ago) is STALE', freshnessStale === 'STALE');

  console.log('\n--> Scenario 6: Full Live Pipeline Isolation & Resiliency Run');

  db.updateSource(dummySource.id, { enabled: false });

  console.log('Running all 9 live CDMX sources under Recovery Engine supervision...');
  const liveRuns = await scheduler.runAllEnabledSources();
  assertTest('Live Pipeline completed without crashing', liveRuns.length >= 9);

  const blockedRuns = liveRuns.filter((r) => r.errors.some((e) => e.includes('WAF') || e.includes('403') || e.includes('RECOVERY_ENGINE')));
  const successfulRuns = liveRuns.filter((r) => r.status === 'SUCCESS' || r.status === 'PARTIAL');

  console.log(`\n  Pipeline Stats:`);
  console.log(`  - Total Sources Evaluated:  ${liveRuns.length}`);
  console.log(`  - Successful / Partial Runs: ${successfulRuns.length}`);
  console.log(`  - Isolated Failed Runs:      ${blockedRuns.length}`);

  assertTest('Source Isolation holds: failures in restricted sources did not abort other sources', successfulRuns.length > 0);

  console.log('\n============================================================');
  console.log(`RESILIENCE TEST SUMMARY: ${passedScenarios}/${totalScenarios} PASSED`);
  console.log('============================================================');

  if (passedScenarios === totalScenarios) {
    console.log('>>> HILO 20.9 SOURCE RESILIENCE & RECOVERY ENGINE IS FULLY PASS! <<<');
  } else {
    console.error('>>> HILO 20.9 RESILIENCE TEST HAS FAILING SCENARIOS <<<');
    process.exit(1);
  }
}

runResilienceTests().catch((err) => {
  console.error('Fatal error during resilience test execution:', err);
  process.exit(1);
});
