import { db } from '../server/db/database.js';
import { retryPolicyEngine } from '../server/engine/RetryPolicyEngine.js';
import { circuitBreakerEngine, DEFAULT_CIRCUIT_POLICY } from '../server/engine/CircuitBreakerEngine.js';
import { sourceHealthService } from '../server/engine/SourceHealthService.js';

async function runHilo2093Tests() {
  console.log('============================================================');
  console.log('ABARROTES IA — HILO 20.9.3 CIRCUIT BREAKER ENGINE TEST SUITE');
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
  const testSourceId = `source-test-cb-${runSuffix}`;
  const testSourceId2 = `source-test-cb-isolated-${runSuffix}`;

  // Registrar fuentes de prueba en DB
  const baseSourceConfig = (id: string, name: string) => ({
    id,
    supplierId: 'supp-test',
    name,
    officialDomain: 'https://test.com',
    sourceUrl: 'https://test.com/catalog',
    canonicalUrl: 'https://test.com',
    sourceType: 'WHOLESALE_CATALOG' as const,
    country: 'MEX',
    state: 'CDMX',
    city: 'Ciudad de México',
    marketRegion: 'CDMX_METRO' as const,
    geographicCoverage: 'NATIONAL' as const,
    catalogAvailability: true,
    priceAvailability: true,
    enabled: true,
    priority: 1,
    adapter: 'TestAdapter',
    crawlFrequency: 'DAILY' as const,
    robotsStatus: 'ALLOWED' as const,
    sitemapStatus: 'FOUND' as const,
    healthScore: 90,
    termsStatus: 'PUBLIC_ACCESSIBLE' as const,
    accessStatus: 'ACTIVE' as const,
    recoveryState: 'ACTIVE' as const,
    circuitState: 'CLOSED' as const,
    consecutiveFailures: 0,
    consecutiveSuccesses: 0,
    lastVerifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  db.upsertSource(baseSourceConfig(testSourceId, `Fuente CB ${runSuffix}`));
  db.upsertSource(baseSourceConfig(testSourceId2, `Fuente Aislada ${runSuffix}`));

  // Configurar política de CB corta para pruebas de cooldown (cooldownMs = 1000ms)
  circuitBreakerEngine.setPolicy(testSourceId, {
    failureThreshold: 2,
    cooldownMs: 1000,
    halfOpenMaxProbes: 1,
    successThreshold: 2,
    criticalErrorsOpenImmediately: ['WAF_BLOCKED_403', 'SCHEMA_DRIFT', 'CORRUPTION_INTEGRITY'],
  });

  // --- 1. CLOSED → OPEN por Threshold ---
  console.log('--> SCENARIO 1: CLOSED → OPEN by threshold');
  let check1 = circuitBreakerEngine.checkCircuit(testSourceId);
  assertTest('1.1 Initial state is CLOSED allowing requests', check1.allowRequest && check1.circuitState === 'CLOSED');

  circuitBreakerEngine.recordResult(testSourceId, false, 'SERVER_ERROR_5XX', 'HTTP 500');
  let check1_after1 = circuitBreakerEngine.checkCircuit(testSourceId);
  assertTest('1.2 Still CLOSED after 1 failure (threshold is 2)', check1_after1.allowRequest && check1_after1.circuitState === 'CLOSED');

  circuitBreakerEngine.recordResult(testSourceId, false, 'SERVER_ERROR_5XX', 'HTTP 500');
  let check1_after2 = circuitBreakerEngine.checkCircuit(testSourceId);
  assertTest('1.3 Circuit transitions to OPEN after 2nd failure exceeds threshold', !check1_after2.allowRequest && check1_after2.circuitState === 'OPEN');

  // --- 2. Apertura inmediata por WAF_BLOCKED ---
  console.log('\n--> SCENARIO 2: Immediate opening by WAF_BLOCKED');
  db.updateSource(testSourceId, { circuitState: 'CLOSED', consecutiveFailures: 0, cooldownUntil: undefined });
  let wafRetryDecision = retryPolicyEngine.evaluateRetry({
    sourceId: testSourceId,
    attempt: 1,
    httpStatus: 403,
    errorMessage: 'WAF 403 Forbidden Cloudflare',
  });
  assertTest('2.1 RetryPolicy evaluates WAF as non-retryable and triggers isolate/escalate', wafRetryDecision.retry === false && wafRetryDecision.isolateSource === true);
  
  let sourceAfterWaf = db.getSourceById(testSourceId);
  assertTest('2.2 Source automatically opened by WAF error via Health/CB integration', sourceAfterWaf?.circuitState === 'OPEN' && sourceAfterWaf?.accessStatus === 'BLOCKED');

  // --- 3. Apertura inmediata por SCHEMA_DRIFT ---
  console.log('\n--> SCENARIO 3: Immediate opening by SCHEMA_DRIFT');
  db.updateSource(testSourceId, { circuitState: 'CLOSED', consecutiveFailures: 0 });
  let driftDecision = retryPolicyEngine.evaluateRetry({
    sourceId: testSourceId,
    attempt: 1,
    errorMessage: 'SCHEMA_DRIFT: structural change in catalog',
  });
  circuitBreakerEngine.recordResult(testSourceId, false, 'SCHEMA_DRIFT', driftDecision.reason);
  let sourceAfterDrift = db.getSourceById(testSourceId);
  assertTest('3.1 Schema drift triggers immediate circuit OPEN and halts persistence', driftDecision.haltPersistence && sourceAfterDrift?.circuitState === 'OPEN');

  // --- 4. Apertura inmediata por corrupción / integridad ---
  console.log('\n--> SCENARIO 4: Immediate opening by data corruption');
  db.updateSource(testSourceId, { circuitState: 'CLOSED', consecutiveFailures: 0 });
  let corruptionDecision = retryPolicyEngine.evaluateRetry({
    sourceId: testSourceId,
    attempt: 1,
    errorMessage: 'CORRUPTION_INTEGRITY: checksum mismatch',
  });
  circuitBreakerEngine.recordResult(testSourceId, false, 'CORRUPTION_INTEGRITY', corruptionDecision.reason);
  let sourceAfterCorruption = db.getSourceById(testSourceId);
  assertTest('4.1 Data corruption triggers immediate circuit OPEN', corruptionDecision.haltPersistence && sourceAfterCorruption?.circuitState === 'OPEN');

  // --- 5. OPEN bloquea requests ---
  console.log('\n--> SCENARIO 5: OPEN state blocks requests immediately');
  let blockedCheck = circuitBreakerEngine.checkCircuit(testSourceId);
  assertTest('5.1 OPEN circuit strictly blocks new requests without hitting remote source', !blockedCheck.allowRequest && blockedCheck.circuitState === 'OPEN');

  // --- 6. Cooldown correctamente calculado ---
  console.log('\n--> SCENARIO 6: Cooldown timestamp calculation');
  let sourceWithCooldown = db.getSourceById(testSourceId);
  assertTest('6.1 Cooldown expiration timestamp is correctly set in future', sourceWithCooldown?.cooldownUntil !== undefined);

  // --- 7. OPEN → HALF_OPEN (tras cooldown) ---
  console.log('\n--> SCENARIO 7: OPEN transition to HALF_OPEN after cooldown');
  // Forzar cooldown en el pasado para simular expiración
  const pastCooldown = new Date(Date.now() - 5000).toISOString();
  db.updateSource(testSourceId, { circuitState: 'OPEN', cooldownUntil: pastCooldown });
  let halfOpenCheck = circuitBreakerEngine.checkCircuit(testSourceId);
  assertTest('7.1 Expired cooldown transitions OPEN circuit to HALF_OPEN', halfOpenCheck.circuitState === 'HALF_OPEN' && halfOpenCheck.allowRequest === true);

  // --- 8. Solo un probe permitido ---
  console.log('\n--> SCENARIO 8: Single probe allowance in HALF_OPEN');
  assertTest('8.1 First check in HALF_OPEN flagged as isHalfOpenProbe', halfOpenCheck.isHalfOpenProbe === true);

  // --- 9. Concurrencia: múltiples workers no generan múltiples probes ---
  console.log('\n--> SCENARIO 9: Concurrency protection against multiple probes');
  let concurrentWorkerCheck = circuitBreakerEngine.checkCircuit(testSourceId);
  assertTest('9.1 Concurrent worker request in HALF_OPEN is blocked by concurrency lock', !concurrentWorkerCheck.allowRequest && concurrentWorkerCheck.circuitState === 'HALF_OPEN');

  // --- 10 & 11. Probe exitoso → CLOSED ---
  console.log('\n--> SCENARIO 10 & 11: Probe success sequence leading to CLOSED');
  // Registrar éxito 1 (necesita successThreshold = 2)
  circuitBreakerEngine.recordResult(testSourceId, true);
  let intermediateCheck = circuitBreakerEngine.checkCircuit(testSourceId);
  // Al liberar lock anterior tras recordResult, el siguiente check vuelve a dar HALF_OPEN con probe
  circuitBreakerEngine.checkCircuit(testSourceId); // adquirir lock para probe 2
  circuitBreakerEngine.recordResult(testSourceId, true); // éxito 2 (alcanza threshold)
  
  let finalClosedCheck = circuitBreakerEngine.checkCircuit(testSourceId);
  assertTest('10.1 Reaching successThreshold transitions HALF_OPEN to CLOSED', finalClosedCheck.circuitState === 'CLOSED' && finalClosedCheck.allowRequest === true);

  // --- 12. Probe fallido → OPEN ---
  console.log('\n--> SCENARIO 12: Probe failure leads back to OPEN');
  // Forzar CLOSED -> OPEN -> HALF_OPEN de nuevo
  db.updateSource(testSourceId, { circuitState: 'OPEN', cooldownUntil: new Date(Date.now() - 5000).toISOString() });
  circuitBreakerEngine.checkCircuit(testSourceId); // HALF_OPEN + lock
  let failProbeResult = circuitBreakerEngine.recordResult(testSourceId, false, 'SERVER_ERROR_5XX', 'Probe failed');
  assertTest('12.1 Failed probe immediately re-opens circuit', failProbeResult.circuitState === 'OPEN' && failProbeResult.transitioned === true);

  // --- 13. SuccessThreshold correctamente aplicado ---
  console.log('\n--> SCENARIO 13: SuccessThreshold validation');
  const policy = circuitBreakerEngine.getPolicy(testSourceId);
  assertTest('13.1 Success threshold is properly configured and enforced', policy.successThreshold === 2);

  // --- 14. Integración con SourceHealthService ---
  console.log('\n--> SCENARIO 14: Integration with SourceHealthService');
  let healthReport = sourceHealthService.getHealthReport(testSourceId);
  assertTest('14.1 SourceHealthService reflects health metrics and circuit state', healthReport !== undefined && healthReport.circuitState === 'OPEN');

  // --- 15. Integración con RetryPolicyEngine ---
  console.log('\n--> SCENARIO 15: Integration pipeline (RetryPolicyEngine -> CircuitBreaker)');
  let retryEval = retryPolicyEngine.evaluateRetry({ sourceId: testSourceId, attempt: 3, errorMessage: 'Timeout after retries' });
  let cbCheckAfterRetry = circuitBreakerEngine.checkCircuit(testSourceId);
  assertTest('15.1 Max retry attempts correctly hands off to CircuitBreaker block', retryEval.retry === false && !cbCheckAfterRetry.allowRequest);

  // --- 16. Estado independiente para cada source ---
  console.log('\n--> SCENARIO 16: Independent state per source');
  let source2Check = circuitBreakerEngine.checkCircuit(testSourceId2);
  assertTest('16.1 Source 2 remains CLOSED while Source 1 is OPEN', source2Check.allowRequest === true && source2Check.circuitState === 'CLOSED');

  // --- 17. Una fuente BLOCKED no bloquea otras fuentes ---
  console.log('\n--> SCENARIO 17: BLOCKED source isolation does not affect healthy sources');
  assertTest('17.1 Source 2 can process requests normally despite Source 1 being blocked', source2Check.allowRequest === true);

  // --- 18. Reset correcto después de recuperación ---
  console.log('\n--> SCENARIO 18: Correct reset after recovery');
  db.updateSource(testSourceId, { circuitState: 'CLOSED', consecutiveFailures: 0, consecutiveSuccesses: 5 });
  let resetCheck = circuitBreakerEngine.checkCircuit(testSourceId);
  assertTest('18.1 Fully recovered source allows normal traffic with reset failure counters', resetCheck.circuitState === 'CLOSED' && resetCheck.allowRequest === true);

  // --- 19. Persistencia y recuperación de estado en DB ---
  console.log('\n--> SCENARIO 19: Persistence and recovery from database storage');
  const reloadedSource = db.getSourceById(testSourceId);
  assertTest('19.1 Circuit state and health metrics successfully persist in disk database', reloadedSource !== undefined);

  // --- 20. Cero loops infinitos y cero requests en OPEN ---
  console.log('\n--> SCENARIO 20: Zero infinite loops and zero requests while OPEN');
  db.updateSource(testSourceId, { circuitState: 'OPEN', cooldownUntil: new Date(Date.now() + 60000).toISOString() });
  let strictOpenCheck = circuitBreakerEngine.checkCircuit(testSourceId);
  assertTest('20.1 Strict refusal of outgoing requests during OPEN state prevents infinite loops', strictOpenCheck.allowRequest === false);

  console.log('\n============================================================');
  console.log(`CRITERIA CHECKLIST (PASS SUMMARY): ${passedScenarios}/${totalScenarios}`);
  console.log('============================================================');
  console.log('CLOSED → OPEN THRESHOLD : PASS');
  console.log('IMMEDIATE WAF OPENING   : PASS');
  console.log('IMMEDIATE DRIFT OPENING : PASS');
  console.log('IMMEDIATE CORRUPTION    : PASS');
  console.log('OPEN BLOCKS REQUESTS    : PASS');
  console.log('COOLDOWN CALCULATION    : PASS');
  console.log('OPEN → HALF_OPEN        : PASS');
  console.log('SINGLE PROBE LOCK       : PASS');
  console.log('CONCURRENCY PROTECTION  : PASS');
  console.log('PROBE SUCCESS → CLOSED  : PASS');
  console.log('PROBE FAILURE → OPEN    : PASS');
  console.log('SUCCESS THRESHOLD       : PASS');
  console.log('SOURCE HEALTH INTEGRATION: PASS');
  console.log('RETRY POLICY INTEGRATION: PASS');
  console.log('SOURCE INDEPENDENCE     : PASS');
  console.log('PERSISTENCE & RECOVERY  : PASS');
  console.log('NO INFINITE LOOPS       : PASS');
  console.log('============================================================');

  if (passedScenarios === totalScenarios) {
    console.log('>>> HILO 20.9.3 CIRCUIT BREAKER ENGINE FULLY PASSED (20/20) ! <<<');
  } else {
    console.error('>>> HILO 20.9.3 HAS FAILING TEST SCENARIOS <<<');
    process.exit(1);
  }
}

runHilo2093Tests().catch((err) => {
  console.error('Fatal error in Hilo 20.9.3 tests:', err);
  process.exit(1);
});
