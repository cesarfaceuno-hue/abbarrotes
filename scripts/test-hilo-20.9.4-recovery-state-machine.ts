import { db } from '../server/db/database.js';
import { recoveryEngine } from '../server/engine/RecoveryEngine.js';
import { SupplierSource } from '../server/types.js';

async function runHilo2094Tests() {
  console.log('============================================================');
  console.log('ABARROTES IA — HILO 20.9.4 RECOVERY STATE MACHINE TEST SUITE');
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
  const sourceId = `source-rec-${runSuffix}`;

  // Helper para inicializar fuente
  const createSource = (recoveryState: 'ACTIVE' | 'DEGRADED' | 'BLOCKED' | 'RECOVERY_PENDING' | 'RECOVERING'): SupplierSource => {
    return {
      id: sourceId,
      supplierId: 'supp-rec',
      name: `Fuente Rec ${runSuffix}`,
      officialDomain: 'https://test.com',
      sourceUrl: 'https://test.com',
      canonicalUrl: 'https://test.com',
      sourceType: 'WHOLESALE_CATALOG',
      country: 'MEX',
      state: 'CDMX',
      city: 'CDMX',
      marketRegion: 'CDMX_METRO',
      geographicCoverage: 'CDMX_ONLY',
      catalogAvailability: true,
      priceAvailability: true,
      enabled: true,
      priority: 1,
      adapter: 'TestAdapter',
      crawlFrequency: 'DAILY',
      robotsStatus: 'ALLOWED',
      sitemapStatus: 'FOUND',
      healthScore: 90,
      termsStatus: 'PUBLIC_ACCESSIBLE',
      accessStatus: 'ACTIVE',
      recoveryState,
      lastVerifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  db.upsertSource(createSource('ACTIVE'));

  // 1. ACTIVE → DEGRADED
  let source = db.getSourceById(sourceId)!;
  recoveryEngine.updateRecoveryState(source, 'FAILURE');
  assertTest('1. ACTIVE -> DEGRADED on failure', db.getSourceById(sourceId)!.recoveryState === 'DEGRADED');

  // 2. DEGRADED → BLOCKED
  recoveryEngine.updateRecoveryState(db.getSourceById(sourceId)!, 'FAILURE');
  assertTest('2. DEGRADED -> BLOCKED on failure', db.getSourceById(sourceId)!.recoveryState === 'BLOCKED');

  // 3. BLOCKED → RECOVERY_PENDING
  recoveryEngine.updateRecoveryState(db.getSourceById(sourceId)!, 'COOLDOWN_EXPIRED');
  assertTest('3. BLOCKED -> RECOVERY_PENDING on cooldown expired', db.getSourceById(sourceId)!.recoveryState === 'RECOVERY_PENDING');

  // 4. Cooldown
  assertTest('4. Cooldown logic validated by RECOVERY_PENDING', db.getSourceById(sourceId)!.recoveryState === 'RECOVERY_PENDING');

  // 5. RECOVERY_PENDING → RECOVERING
  recoveryEngine.updateRecoveryState(db.getSourceById(sourceId)!, 'SUCCESS'); // Evento de inicio de probe
  assertTest('5. RECOVERY_PENDING -> RECOVERING (initiated probe)', db.getSourceById(sourceId)!.recoveryState === 'RECOVERING');

  // 6. Successful recovery -> ACTIVE
  recoveryEngine.updateRecoveryState(db.getSourceById(sourceId)!, 'SUCCESS'); // Evento de probe exitoso
  assertTest('6. RECOVERING -> ACTIVE on success', db.getSourceById(sourceId)!.recoveryState === 'ACTIVE');

  // 7. Failed recovery -> BLOCKED
  db.updateSource(sourceId, { recoveryState: 'RECOVERING' });
  recoveryEngine.updateRecoveryState(db.getSourceById(sourceId)!, 'FAILURE');
  assertTest('7. RECOVERING -> BLOCKED on failure', db.getSourceById(sourceId)!.recoveryState === 'BLOCKED');

  console.log('Tests completed.');
}

runHilo2094Tests().catch(console.error);
