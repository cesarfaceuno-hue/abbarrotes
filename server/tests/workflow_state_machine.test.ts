import { db } from '../db/database.js';
import { workflowEngine } from '../engine/WorkflowEngine.js';
import { agentOrchestrator, AgentExecutionRecord } from '../engine/AgentOrchestrator.js';
import { WorkflowDefinition } from '../types.js';

async function runP03Tests() {
  console.log('\n======================================================');
  console.log('🧪 INICIANDO TEST SUITE P0-3: MÁQUINA DE ESTADOS FORMAL');
  console.log('======================================================\n');

  let passedTests = 0;
  let totalTests = 6;

  // Save original executeAgent method to restore later
  const originalExecuteAgent = agentOrchestrator.executeAgent.bind(agentOrchestrator);

  try {
    // ----------------------------------------------------
    // TEST 1: Agente devuelve {status: 'FAILED'} sin lanzar excepción.
    // ----------------------------------------------------
    console.log('▶ TEST 1: Agente devuelve {status: "FAILED"} sin lanzar excepción...');
    const testWf1: WorkflowDefinition = workflowEngine.createWorkflow({
      name: 'Test Workflow 1 (Agent returns FAILED)',
      code: 'TEST-WF-01',
      category: 'OPERATIONS',
      triggerType: 'MANUAL',
      stages: [
        {
          id: 'st-t1-1',
          name: 'Etapa con Falla Controlada',
          agentId: 'discovery-agent',
          agentName: 'Discovery Agent',
          order: 1,
          description: 'Prueba de retorno FAILED sin excepción',
          isCritical: false,
          status: 'pending'
        }
      ]
    });

    // Mock agent returning FAILED without throwing
    agentOrchestrator.executeAgent = async (agentId: string): Promise<AgentExecutionRecord> => {
      return {
        agentRunId: `mock-fail-${Date.now()}`,
        agentId,
        inputHash: 'hash-test-1',
        outputHash: 'error-hash-1',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 120,
        status: 'FAILED',
        error: 'Error simulado 503 Service Unavailable sin excepción',
        decisionIds: [],
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro'
      };
    };

    const runResult1 = await workflowEngine.executeWorkflow(testWf1.id, 'TestRunner');
    const stage1 = runResult1.stages[0];

    const test1Passed = stage1.status === 'failed' && 
                        stage1.error === 'Error simulado 503 Service Unavailable sin excepción' &&
                        runResult1.status !== 'SUCCESS' &&
                        stage1.completedAt !== undefined &&
                        runResult1.summary.stagesCompleted === 0 &&
                        runResult1.summary.stagesFailed === 1;

    if (test1Passed) {
      console.log('✅ TEST 1 PASSED: stage.status === "failed", workflow.status === "FAILED", error capturado, stagesCompleted === 0.');
      passedTests++;
    } else {
      console.error('❌ TEST 1 FAILED:', { stageStatus: stage1.status, wfStatus: runResult1.status, error: stage1.error });
    }

    // ----------------------------------------------------
    // TEST 2: Agente lanza excepción directa.
    // ----------------------------------------------------
    console.log('\n▶ TEST 2: Agente lanza excepción directa...');
    const testWf2: WorkflowDefinition = workflowEngine.createWorkflow({
      name: 'Test Workflow 2 (Agent throws Exception)',
      code: 'TEST-WF-02',
      category: 'OPERATIONS',
      triggerType: 'MANUAL',
      stages: [
        {
          id: 'st-t2-1',
          name: 'Etapa con Excepción Crítica',
          agentId: 'matching-agent',
          agentName: 'Matching Agent',
          order: 1,
          description: 'Prueba de lanzamiento de excepción',
          isCritical: true,
          status: 'pending'
        }
      ]
    });

    agentOrchestrator.executeAgent = async () => {
      throw new Error('Fatal socket timeout connection lost to upstream catalog');
    };

    const runResult2 = await workflowEngine.executeWorkflow(testWf2.id, 'TestRunner');
    const stage2 = runResult2.stages[0];

    const test2Passed = stage2.status === 'failed' && 
                        stage2.error?.includes('Fatal socket timeout') &&
                        runResult2.status === 'FAILED';

    if (test2Passed) {
      console.log('✅ TEST 2 PASSED: stage.status === "failed" al capturar excepción y workflow.status === "FAILED".');
      passedTests++;
    } else {
      console.error('❌ TEST 2 FAILED:', { stageStatus: stage2.status, error: stage2.error, wfStatus: runResult2.status });
    }

    // ----------------------------------------------------
    // TEST 3: Agente entra en modo DEGRADED / Fallback con resultado válido.
    // ----------------------------------------------------
    console.log('\n▶ TEST 3: Agente entra en modo DEGRADED...');
    const testWf3: WorkflowDefinition = workflowEngine.createWorkflow({
      name: 'Test Workflow 3 (Agent Degraded)',
      code: 'TEST-WF-03',
      category: 'INTELLIGENCE',
      triggerType: 'MANUAL',
      stages: [
        {
          id: 'st-t3-1',
          name: 'Etapa con Respaldo Degradado',
          agentId: 'store-manager-agent',
          agentName: 'Store Manager Agent',
          order: 1,
          description: 'Prueba de fallback degradado',
          isCritical: false,
          status: 'pending'
        }
      ]
    });

    agentOrchestrator.executeAgent = async (agentId: string): Promise<AgentExecutionRecord> => {
      return {
        agentRunId: `mock-deg-${Date.now()}`,
        agentId,
        inputHash: 'hash-test-3',
        outputHash: 'hash-deg-3',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 85,
        status: 'DEGRADED',
        decisionIds: ['dec-1'],
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro'
      };
    };

    const runResult3 = await workflowEngine.executeWorkflow(testWf3.id, 'TestRunner');
    const stage3 = runResult3.stages[0];

    const test3Passed = stage3.status === 'degraded' && 
                        runResult3.status === 'DEGRADED' &&
                        runResult3.summary.stagesDegraded === 1;

    if (test3Passed) {
      console.log('✅ TEST 3 PASSED: stage.status === "degraded", workflow.status === "DEGRADED".');
      passedTests++;
    } else {
      console.error('❌ TEST 3 FAILED:', { stageStatus: stage3.status, wfStatus: runResult3.status });
    }

    // ----------------------------------------------------
    // TEST 4: Todas las etapas completan con éxito.
    // ----------------------------------------------------
    console.log('\n▶ TEST 4: Todas las etapas completan con éxito...');
    const testWf4: WorkflowDefinition = workflowEngine.createWorkflow({
      name: 'Test Workflow 4 (All Success)',
      code: 'TEST-WF-04',
      category: 'OPERATIONS',
      triggerType: 'MANUAL',
      stages: [
        {
          id: 'st-t4-1',
          name: 'Etapa 1 Exitosa',
          agentId: 'discovery-agent',
          agentName: 'Discovery Agent',
          order: 1,
          description: 'Discovery exitoso',
          isCritical: true,
          status: 'pending'
        },
        {
          id: 'st-t4-2',
          name: 'Etapa 2 Exitosa',
          agentId: 'matching-agent',
          agentName: 'Matching Agent',
          order: 2,
          description: 'Matching exitoso',
          isCritical: false,
          status: 'pending'
        }
      ]
    });

    agentOrchestrator.executeAgent = async (agentId: string): Promise<AgentExecutionRecord> => {
      return {
        agentRunId: `mock-ok-${Date.now()}`,
        agentId,
        inputHash: 'hash-test-4',
        outputHash: 'hash-ok-4',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 95,
        status: 'SUCCESS',
        decisionIds: ['dec-ok'],
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro'
      };
    };

    const runResult4 = await workflowEngine.executeWorkflow(testWf4.id, 'TestRunner');

    const test4Passed = runResult4.status === 'SUCCESS' && 
                        runResult4.summary.stagesCompleted === 2 &&
                        runResult4.summary.stagesFailed === 0 &&
                        runResult4.stages.every(s => s.status === 'completed');

    if (test4Passed) {
      console.log('✅ TEST 4 PASSED: Todas las etapas completaron y workflow.status === "SUCCESS".');
      passedTests++;
    } else {
      console.error('❌ TEST 4 FAILED:', { wfStatus: runResult4.status, stages: runResult4.stages.map(s => s.status) });
    }

    // ----------------------------------------------------
    // TEST 5: Una etapa crítica falla vs etapa no crítica.
    // ----------------------------------------------------
    console.log('\n▶ TEST 5: Una etapa crítica falla vs no crítica...');
    const testWf5: WorkflowDefinition = workflowEngine.createWorkflow({
      name: 'Test Workflow 5 (Critical Stage Fails)',
      code: 'TEST-WF-05',
      category: 'PRICING',
      triggerType: 'MANUAL',
      stages: [
        {
          id: 'st-t5-1',
          name: 'Etapa Crítica',
          agentId: 'inventory-analyst-agent',
          agentName: 'Inventory Analyst Agent',
          order: 1,
          description: 'Etapa indispensable',
          isCritical: true,
          status: 'pending'
        },
        {
          id: 'st-t5-2',
          name: 'Etapa Secundaria',
          agentId: 'google-sheets-intelligence-agent',
          agentName: 'Google Sheets Intelligence Agent',
          order: 2,
          description: 'Etapa accesoria',
          isCritical: false,
          status: 'pending'
        }
      ]
    });

    // Stage 1 (Critical) fails, Stage 2 succeeds
    agentOrchestrator.executeAgent = async (agentId: string): Promise<AgentExecutionRecord> => {
      if (agentId === 'inventory-analyst-agent') {
        return {
          agentRunId: `mock-fail-crit-${Date.now()}`,
          agentId,
          inputHash: 'hash-test-5-crit',
          outputHash: 'hash-err-5',
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          durationMs: 110,
          status: 'FAILED',
          error: 'Falla crítica de lectura de base de datos de inventarios',
          decisionIds: [],
          tenantId: 'tenant-cdmx-01',
          storeId: 'store-cdmx-centro'
        };
      } else {
        return {
          agentRunId: `mock-ok-${Date.now()}`,
          agentId,
          inputHash: 'hash-test-5-ok',
          outputHash: 'hash-ok-5',
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          durationMs: 70,
          status: 'SUCCESS',
          decisionIds: [],
          tenantId: 'tenant-cdmx-01',
          storeId: 'store-cdmx-centro'
        };
      }
    };

    const runResult5 = await workflowEngine.executeWorkflow(testWf5.id, 'TestRunner');

    const test5Passed = runResult5.status === 'FAILED' && 
                        runResult5.stages[0].status === 'failed' &&
                        runResult5.stages[0].isCritical === true;

    if (test5Passed) {
      console.log('✅ TEST 5 PASSED: Etapa crítica falló y provocó workflow.status === "FAILED" (sin falsos PARTIAL o SUCCESS).');
      passedTests++;
    } else {
      console.error('❌ TEST 5 FAILED:', { wfStatus: runResult5.status, stage1: runResult5.stages[0].status });
    }

    // ----------------------------------------------------
    // TEST 6: El error de una etapa no se pierde tras persistir executionRun.
    // ----------------------------------------------------
    console.log('\n▶ TEST 6: Persistencia y recuperación del error de etapa en DB...');
    const persistedRun = db.getExecutionRun(runResult1.runId);

    const test6Passed = persistedRun !== undefined &&
                        persistedRun.stages[0].status === 'failed' &&
                        persistedRun.stages[0].error === 'Error simulado 503 Service Unavailable sin excepción' &&
                        persistedRun.stages[0].completedAt !== undefined &&
                        persistedRun.errors?.length! > 0;

    if (test6Passed) {
      console.log('✅ TEST 6 PASSED: El error y completedAt de la etapa persisten fielmente en disco.');
      passedTests++;
    } else {
      console.error('❌ TEST 6 FAILED:', { persistedRun });
    }

    // Clean up test workflows from DB
    db.deleteWorkflow(testWf1.id);
    db.deleteWorkflow(testWf2.id);
    db.deleteWorkflow(testWf3.id);
    db.deleteWorkflow(testWf4.id);
    db.deleteWorkflow(testWf5.id);

  } finally {
    // Restore original executeAgent
    agentOrchestrator.executeAgent = originalExecuteAgent;
  }

  console.log('\n======================================================');
  console.log(`📊 RESULTADOS: ${passedTests}/${totalTests} TESTS PASARON SATISFACTORIAMENTE`);
  console.log('======================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

// Execute tests
runP03Tests().catch(err => {
  console.error('Unhandled error running P0-3 tests:', err);
  process.exit(1);
});
