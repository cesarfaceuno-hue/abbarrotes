import { execSync } from 'child_process';

console.log('\n========================================================================');
console.log('🏛️ ABARROTES IA — AUDITORÍA Y CERTIFICACIÓN COMPLETA DE ARQUITECTURA (P0 - P1)');
console.log('========================================================================\n');

const testSuites = [
  { name: 'P0: Máquina de Estados, Integridad y Propagación Formal', file: 'server/tests/workflow_state_machine.test.ts' },
  { name: 'P1-1: Eliminación de Hardcoded & Impacto Financiero Auditado', file: 'server/tests/workflow_p1_financial.test.ts' },
  { name: 'P1-2: Recuperación Segura de RUNNING & Control de Concurrencia', file: 'server/tests/workflow_p1_recovery.test.ts' },
];

let allPassed = true;

for (const suite of testSuites) {
  console.log(`\n------------------------------------------------------------------------`);
  console.log(`📦 EJECUTANDO SUITE: ${suite.name}`);
  console.log(`------------------------------------------------------------------------`);
  try {
    const output = execSync(`npx tsx ${suite.file}`, { stdio: 'inherit' });
    console.log(`✨ Suite "${suite.name}" finalizada exitosamente.`);
  } catch (err) {
    console.error(`💥 Error crítico en suite "${suite.name}"`);
    allPassed = false;
    break;
  }
}

console.log('\n========================================================================');
if (allPassed) {
  console.log('🏆 CERTIFICACIÓN TOTAL APROBADA: TODAS LAS SUITES (P0-1, P0-2, P0-3, P1-1, P1-2) ESTÁN AL 100%');
} else {
  console.error('❌ CERTIFICACIÓN FALLIDA: Se detectaron fallos en las pruebas.');
  process.exit(1);
}
console.log('========================================================================\n');
