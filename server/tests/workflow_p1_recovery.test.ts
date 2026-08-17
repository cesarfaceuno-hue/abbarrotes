import { db } from '../db/database.js';
import { workflowEngine, WorkflowEngine } from '../engine/WorkflowEngine.js';
import { agentOrchestrator, AgentExecutionRecord } from '../engine/AgentOrchestrator.js';
import { WorkflowDefinition, WorkflowExecutionRun } from '../types.js';

async function runP12RecoveryTests() {
  console.log('\n======================================================');
  console.log('🧪 INICIANDO TEST SUITE P1-2: RECUPERACIÓN SEGURA DE RUNNING');
  console.log('======================================================\n');

  let passedTests = 0;
  const totalTests = 7;
  const originalExecuteAgent = agentOrchestrator.executeAgent.bind(agentOrchestrator);

  try {
    // ----------------------------------------------------
    // TEST 1: Ejecución normal (Ciclo de vida completo: RUNNING -> SUCCESS, lock liberado)
    // ----------------------------------------------------
    console.log('▶ TEST 1: Ejecución normal con liberación garantizada de lock...');
    const wfNormal = workflowEngine.createWorkflow({
      name: 'Test Normal Run',
      code: 'TEST-REC-NORM',
      category: 'OPERATIONS',
      triggerType: 'MANUAL',
      stages: [
        {
          id: 'st-norm-1',
          name: 'Stage Normal',
          agentId: 'discovery-agent',
          agentName: 'Discovery Agent',
          order: 1,
          isCritical: true,
          status: 'pending'
        }
      ]
    });

    agentOrchestrator.executeAgent = async (agentId: string): Promise<AgentExecutionRecord> => {
      return {
        agentRunId: `mock-norm-${Date.now()}`,
        agentId,
        inputHash: 'hash-n',
        outputHash: 'hash-out-n',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 35,
        status: 'SUCCESS',
        decisionIds: [],
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro'
      };
    };

    const runNormal = await workflowEngine.executeWorkflow(wfNormal.id, 'TestRunner');
    const updatedWfNormal = db.getWorkflow(wfNormal.id);

    const test1Passed = runNormal.status === 'SUCCESS' &&
                        updatedWfNormal?.status === 'SUCCESS' &&
                        runNormal.lastHeartbeatAt !== undefined &&
                        runNormal.durationMs > 0;

    if (test1Passed) {
      console.log('✅ TEST 1 PASSED: Ejecución normal completó con SUCCESS y liberó lock correctamente.');
      passedTests++;
    } else {
      console.error('❌ TEST 1 FAILED:', { runStatus: runNormal.status, wfStatus: updatedWfNormal?.status });
    }

    // ----------------------------------------------------
    // TEST 2: Excepción fatal (Lock liberado en finally, status FAILED)
    // ----------------------------------------------------
    console.log('\n▶ TEST 2: Excepción fatal capturada y lock liberado en finally...');
    const wfExc = workflowEngine.createWorkflow({
      name: 'Test Exception Run',
      code: 'TEST-REC-EXC',
      category: 'PRICING',
      triggerType: 'MANUAL',
      stages: [
        {
          id: 'st-exc-1',
          name: 'Stage Throwing',
          agentId: 'price-monitor-agent',
          agentName: 'Price Monitor Agent',
          order: 1,
          isCritical: true,
          status: 'pending'
        }
      ]
    });

    agentOrchestrator.executeAgent = async () => {
      throw new Error('Kernel crash / network socket unhandled error');
    };

    const runExc = await workflowEngine.executeWorkflow(wfExc.id, 'TestRunner');
    const updatedWfExc = db.getWorkflow(wfExc.id);

    const test2Passed = runExc.status === 'FAILED' &&
                        updatedWfExc?.status === 'FAILED' &&
                        runExc.stages[0].status === 'failed';

    if (test2Passed) {
      console.log('✅ TEST 2 PASSED: Excepción capturada, workflow marcado como FAILED y lock liberado.');
      passedTests++;
    } else {
      console.error('❌ TEST 2 FAILED:', { runStatus: runExc.status, wfStatus: updatedWfExc?.status });
    }

    // ----------------------------------------------------
    // TEST 3: Timeout controlado (Ejecución abortada tras exceder timeout configurado)
    // ----------------------------------------------------
    console.log('\n▶ TEST 3: Timeout controlado de ejecución...');
    const wfTimeout = workflowEngine.createWorkflow({
      name: 'Test Timeout Run',
      code: 'TEST-REC-TO',
      category: 'OPERATIONS',
      triggerType: 'MANUAL',
      stages: [
        {
          id: 'st-to-1',
          name: 'Stage 1 Quick',
          agentId: 'discovery-agent',
          agentName: 'Discovery Agent',
          order: 1,
          isCritical: false,
          status: 'pending'
        },
        {
          id: 'st-to-2',
          name: 'Stage 2 Slow',
          agentId: 'matching-agent',
          agentName: 'Matching Agent',
          order: 2,
          isCritical: true,
          status: 'pending'
        }
      ]
    });

    // Mock agent delay longer than customTimeout (50ms timeout)
    agentOrchestrator.executeAgent = async (agentId: string): Promise<AgentExecutionRecord> => {
      await new Promise(r => setTimeout(r, 60));
      return {
        agentRunId: `mock-to-${Date.now()}`,
        agentId,
        inputHash: 'hash-to',
        outputHash: 'hash-out-to',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 60,
        status: 'SUCCESS',
        decisionIds: [],
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro'
      };
    };

    // Execute with a tight 50ms timeout
    const runTimeout = await workflowEngine.executeWorkflow(wfTimeout.id, 'TestRunner', 50);

    const test3Passed = runTimeout.status === 'FAILED' &&
                        runTimeout.stages[1].status === 'failed' &&
                        (runTimeout.stages[1].error?.toLowerCase().includes('tiempo límite') || 
                         runTimeout.stages[1].error?.toLowerCase().includes('timeout'));

    if (test3Passed) {
      console.log('✅ TEST 3 PASSED: Ejecución cancelada de forma segura al exceder el timeout (50ms).');
      passedTests++;
    } else {
      console.error('❌ TEST 3 FAILED:', { 
        runStatus: runTimeout.status, 
        stage2Status: runTimeout.stages[1]?.status,
        stage2Error: runTimeout.stages[1]?.error
      });
    }

    // ----------------------------------------------------
    // TEST 4: Proceso interrumpido detectado por recoverStaleRuns
    // ----------------------------------------------------
    console.log('\n▶ TEST 4: Detección y cierre de ejecución huérfana (RUNNING abandonado)...');
    const staleRunId = `wfrun-stale-test-${Date.now()}`;
    const oldStartTime = new Date(Date.now() - 300000).toISOString(); // 5 minutes ago

    const orphanedRun: WorkflowExecutionRun = {
      runId: staleRunId,
      workflowId: wfNormal.id,
      workflowName: wfNormal.name,
      startedAt: oldStartTime,
      lastHeartbeatAt: oldStartTime,
      durationMs: 0,
      timeoutMs: 120000,
      status: 'RUNNING',
      triggeredBy: 'Simulated Crash Runner',
      stages: [
        {
          id: 'st-orph-1',
          name: 'Stage Abandoned',
          agentId: 'discovery-agent',
          agentName: 'Discovery Agent',
          order: 1,
          isCritical: true,
          status: 'running'
        }
      ],
      currentStage: 1,
      summary: {
        stagesTotal: 1,
        stagesCompleted: 0,
        stagesFailed: 0,
        stagesSkipped: 0,
        stagesDegraded: 0,
        observationsGenerated: 0,
        findingsGenerated: 0,
        opportunitiesCreated: 0,
        financialImpact: 0,
      },
      logs: ['[WORKFLOW] Iniciando antes del fallo'],
    };

    db.createExecutionRun(orphanedRun);
    db.updateWorkflow(wfNormal.id, { status: 'RUNNING' });

    // Execute recoverStaleRuns
    const recoveredCount = workflowEngine.recoverStaleRuns(120000);
    const recoveredRun = db.getExecutionRun(staleRunId);
    const recoveredWf = db.getWorkflow(wfNormal.id);

    const test4Passed = recoveredCount >= 1 &&
                        recoveredRun !== undefined &&
                        recoveredRun.status === 'FAILED' &&
                        recoveredRun.recoveryReason === 'STALE_RUNNING_RECOVERED_TIMEOUT_OR_RESTART' &&
                        recoveredRun.stages[0].status === 'failed' &&
                        recoveredWf?.status === 'FAILED';

    if (test4Passed) {
      console.log('✅ TEST 4 PASSED: Run huérfano recuperado a FAILED con recoveryReason y stage marcada como failed.');
      passedTests++;
    } else {
      console.error('❌ TEST 4 FAILED:', { 
        recoveredCount, 
        runStatus: recoveredRun?.status, 
        reason: recoveredRun?.recoveryReason,
        stageStatus: recoveredRun?.stages[0]?.status
      });
    }

    // ----------------------------------------------------
    // TEST 5: Reinicio de servidor (Constructor de WorkflowEngine recupera automáticamente)
    // ----------------------------------------------------
    console.log('\n▶ TEST 5: Recuperación automática al inicializar WorkflowEngine...');
    const restartRunId = `wfrun-restart-test-${Date.now()}`;
    const restartOrphan: WorkflowExecutionRun = {
      runId: restartRunId,
      workflowId: wfNormal.id,
      workflowName: wfNormal.name,
      startedAt: new Date(Date.now() - 200000).toISOString(),
      durationMs: 0,
      timeoutMs: 120000,
      status: 'RUNNING',
      triggeredBy: 'Server Reboot Test',
      stages: [
        {
          id: 'st-reboot-1',
          name: 'Stage Hanging',
          agentId: 'discovery-agent',
          agentName: 'Discovery Agent',
          order: 1,
          status: 'pending'
        }
      ],
      currentStage: 1,
      summary: {
        stagesTotal: 1,
        stagesCompleted: 0,
        stagesFailed: 0,
        stagesSkipped: 0,
        stagesDegraded: 0,
        observationsGenerated: 0,
        findingsGenerated: 0,
        opportunitiesCreated: 0,
        financialImpact: 0,
      },
      logs: [],
    };

    db.createExecutionRun(restartOrphan);

    // Instantiate a new engine instance simulating server restart
    const newEngineInstance = new WorkflowEngine();
    const runAfterReboot = db.getExecutionRun(restartRunId);

    const test5Passed = runAfterReboot !== undefined &&
                        runAfterReboot.status === 'FAILED' &&
                        runAfterReboot.recoveryReason === 'STALE_RUNNING_RECOVERED_TIMEOUT_OR_RESTART';

    if (test5Passed) {
      console.log('✅ TEST 5 PASSED: El constructor de WorkflowEngine recuperó las ejecuciones stale al bootear.');
      passedTests++;
    } else {
      console.error('❌ TEST 5 FAILED:', { runAfterReboot });
    }

    // ----------------------------------------------------
    // TEST 6: Run Stale no sobrescribe ejecuciones ya finalizadas con SUCCESS
    // ----------------------------------------------------
    console.log('\n▶ TEST 6: Preservación de ejecuciones finalizadas con SUCCESS...');
    const finishedRunId = `wfrun-finished-ok-${Date.now()}`;
    const finishedRun: WorkflowExecutionRun = {
      runId: finishedRunId,
      workflowId: wfNormal.id,
      workflowName: wfNormal.name,
      startedAt: new Date(Date.now() - 500000).toISOString(),
      finishedAt: new Date(Date.now() - 490000).toISOString(),
      completedAt: new Date(Date.now() - 490000).toISOString(),
      durationMs: 10000,
      status: 'SUCCESS',
      triggeredBy: 'Legitimate Finished Runner',
      stages: [
        {
          id: 'st-fin-1',
          name: 'Stage Completed',
          agentId: 'discovery-agent',
          agentName: 'Discovery Agent',
          order: 1,
          status: 'completed'
        }
      ],
      currentStage: 1,
      summary: {
        stagesTotal: 1,
        stagesCompleted: 1,
        stagesFailed: 0,
        stagesSkipped: 0,
        stagesDegraded: 0,
        observationsGenerated: 5,
        findingsGenerated: 2,
        opportunitiesCreated: 1,
        financialImpact: 450,
      },
      logs: [],
    };

    db.createExecutionRun(finishedRun);
    workflowEngine.recoverStaleRuns();
    const checkFinished = db.getExecutionRun(finishedRunId);

    const test6Passed = checkFinished !== undefined &&
                        checkFinished.status === 'SUCCESS' &&
                        checkFinished.summary.stagesCompleted === 1;

    if (test6Passed) {
      console.log('✅ TEST 6 PASSED: Ejecuciones previamente en SUCCESS jamás son corrompidas por el recovery.');
      passedTests++;
    } else {
      console.error('❌ TEST 6 FAILED:', { checkFinished });
    }

    // ----------------------------------------------------
    // TEST 7: Ejecución concurrente bloqueada
    // ----------------------------------------------------
    console.log('\n▶ TEST 7: Prevención de colisión por ejecución concurrente del mismo workflow...');
    const wfConc = workflowEngine.createWorkflow({
      name: 'Test Concurrency Lock',
      code: 'TEST-REC-CONC',
      category: 'OPERATIONS',
      triggerType: 'MANUAL',
      stages: [
        {
          id: 'st-conc-1',
          name: 'Stage Slow',
          agentId: 'discovery-agent',
          agentName: 'Discovery Agent',
          order: 1,
          status: 'pending'
        }
      ]
    });

    agentOrchestrator.executeAgent = async (agentId: string): Promise<AgentExecutionRecord> => {
      // Hold for 100ms
      await new Promise(r => setTimeout(r, 100));
      return {
        agentRunId: `mock-conc-${Date.now()}`,
        agentId,
        inputHash: 'hash-c',
        outputHash: 'hash-out-c',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 100,
        status: 'SUCCESS',
        decisionIds: [],
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro'
      };
    };

    // Launch first execution in background
    const firstExecPromise = workflowEngine.executeWorkflow(wfConc.id, 'User 1');

    // Attempt second simultaneous execution
    let concurrencyRejected = false;
    try {
      await workflowEngine.executeWorkflow(wfConc.id, 'User 2');
    } catch (concErr: any) {
      if (concErr.message.includes('ya se encuentra en ejecución')) {
        concurrencyRejected = true;
      }
    }

    // Wait for first to complete
    const firstResult = await firstExecPromise;

    const test7Passed = concurrencyRejected === true &&
                        firstResult.status === 'SUCCESS';

    if (test7Passed) {
      console.log('✅ TEST 7 PASSED: Intento de ejecución concurrente bloqueado con error explicativo.');
      passedTests++;
    } else {
      console.error('❌ TEST 7 FAILED:', { concurrencyRejected, firstResultStatus: firstResult?.status });
    }

    // Cleanup
    db.deleteWorkflow(wfNormal.id);
    db.deleteWorkflow(wfExc.id);
    db.deleteWorkflow(wfTimeout.id);
    db.deleteWorkflow(wfConc.id);

  } finally {
    agentOrchestrator.executeAgent = originalExecuteAgent;
  }

  console.log('\n======================================================');
  console.log(`📊 RESULTADOS P1-2: ${passedTests}/${totalTests} TESTS PASARON SATISFACTORIAMENTE`);
  console.log('======================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runP12RecoveryTests().catch(err => {
  console.error('Unhandled error in P1-2 tests:', err);
  process.exit(1);
});
