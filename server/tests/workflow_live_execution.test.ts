import { db } from '../db/database.js';
import { workflowEngine } from '../engine/WorkflowEngine.js';
import { agentOrchestrator } from '../engine/AgentOrchestrator.js';

async function runLiveExecutionTests() {
  console.log('\n======================================================');
  console.log('🚀 INICIANDO PRUEBAS DE EJECUCIÓN REAL: WF-01 Y CASO FORZADO');
  console.log('======================================================\n');

  // 1. Ejecución real de WF-01 (Pipeline Matutino)
  console.log('▶ [1/2] Ejecución real completa de WF-01 (10 Etapas)...');
  const wf01 = db.getWorkflow('wf-morning-intelligence');
  if (!wf01) {
    throw new Error('WF-01 no encontrado en la base de datos');
  }

  const runWF01 = await workflowEngine.executeWorkflow('wf-morning-intelligence', 'Auditor de Sistemas (Live Test)');
  console.log(`\nResultado de WF-01:
  - Run ID: ${runWF01.runId}
  - Status: ${runWF01.status}
  - Duración: ${runWF01.durationMs}ms
  - Etapas Completadas: ${runWF01.summary.stagesCompleted}/${runWF01.stages.length}
  - Etapas Fallidas: ${runWF01.summary.stagesFailed || 0}
  - Impacto Financiero: $${runWF01.summary.financialImpact.toFixed(2)} MXN
  - Brief: ${runWF01.executiveBrief}
  `);

  if (runWF01.status !== 'SUCCESS' && runWF01.status !== 'PARTIAL') {
    throw new Error(`WF-01 no completó en estado esperado: ${runWF01.status}`);
  }

  // 2. Ejecución con un agente forzado a devolver FAILED en etapa crítica
  console.log('\n▶ [2/2] Ejecución con agente forzado a devolver FAILED en etapa crítica...');
  
  // Create a test workflow with 3 stages (Stage 1 is Critical)
  const forcedWf = workflowEngine.createWorkflow({
    name: 'Workflow con Agente Forzado a Fallar',
    code: 'WF-FORCED-FAIL',
    category: 'PROCUREMENT',
    triggerType: 'MANUAL',
    stages: [
      {
        id: 'st-force-1',
        name: 'Etapa 1 - Extracción Crítica',
        agentId: 'discovery-agent',
        agentName: 'Discovery Agent',
        order: 1,
        description: 'Etapa que será forzada a fallar',
        isCritical: true,
        status: 'pending'
      },
      {
        id: 'st-force-2',
        name: 'Etapa 2 - Normalización',
        agentId: 'matching-agent',
        agentName: 'Matching Agent',
        order: 2,
        description: 'Etapa subsecuente',
        isCritical: false,
        status: 'pending'
      }
    ]
  });

  // Mock discovery-agent to return { status: 'FAILED', error: 'HTTP 503 Backend Overloaded' }
  const origExecute = agentOrchestrator.executeAgent.bind(agentOrchestrator);
  agentOrchestrator.executeAgent = async (agentId: string, trigger?: any) => {
    if (agentId === 'discovery-agent') {
      return {
        agentRunId: `forced-run-${Date.now()}`,
        agentId,
        inputHash: 'input-hash-forced',
        outputHash: 'output-hash-forced',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 45,
        status: 'FAILED',
        error: 'HTTP 503 Backend Overloaded: Simulación de fallo en upstream',
        decisionIds: [],
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro'
      };
    }
    return origExecute(agentId, trigger);
  };

  try {
    const forcedRun = await workflowEngine.executeWorkflow(forcedWf.id, 'Auditor de Sistemas (Forced Test)');
    console.log(`\nResultado de Workflow Forzado:
  - Run ID: ${forcedRun.runId}
  - Status: ${forcedRun.status}
  - Stage 1 Status: ${forcedRun.stages[0].status}
  - Stage 1 Error: "${forcedRun.stages[0].error}"
  - Stage 1 CompletedAt: ${forcedRun.stages[0].completedAt}
  - Summary Failed Stages: ${forcedRun.summary.stagesFailed}
  - Summary Completed Stages: ${forcedRun.summary.stagesCompleted}
  - Workflow Final Status: ${forcedRun.status}
    `);

    // Strict validation: Must NEVER be SUCCESS
    if (forcedRun.status === 'SUCCESS') {
      throw new Error('FATAL: El workflow reportó un falso SUCCESS a pesar de que la etapa crítica falló.');
    }

    if (forcedRun.status !== 'FAILED') {
      throw new Error(`FATAL: Se esperaba estado FAILED por falla en etapa crítica, pero se obtuvo "${forcedRun.status}".`);
    }

    if (forcedRun.stages[0].status !== 'failed') {
      throw new Error(`FATAL: La etapa no fue marcada como "failed": ${forcedRun.stages[0].status}`);
    }

    console.log('✅ VALIDACIÓN EXITOSA: Jamás apareció un falso SUCCESS. El estado es rigurosamente FAILED.');

    // Verify persistence from DB
    const persisted = db.getExecutionRun(forcedRun.runId);
    if (!persisted || persisted.status !== 'FAILED' || persisted.stages[0].status !== 'failed') {
      throw new Error('FATAL: La persistencia en disco no reflejó el estado FAILED de la ejecución.');
    }
    console.log('✅ VALIDACIÓN DE PERSISTENCIA EXITOSA: El registro persistido en disco contiene status: "FAILED" y stage error intacto.');

  } finally {
    agentOrchestrator.executeAgent = origExecute;
    db.deleteWorkflow(forcedWf.id);
  }

  console.log('\n======================================================');
  console.log('🎉 TODAS LAS PRUEBAS EN VIVO COMPLETADAS EXITOSAMENTE');
  console.log('======================================================\n');
}

runLiveExecutionTests().catch(err => {
  console.error('Error en pruebas en vivo:', err);
  process.exit(1);
});
