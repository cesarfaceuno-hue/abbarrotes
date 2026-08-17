import { db } from '../db/database.js';
import { workflowEngine } from '../engine/WorkflowEngine.js';
import { agentOrchestrator, AgentExecutionRecord } from '../engine/AgentOrchestrator.js';
import { WorkflowDefinition, Opportunity, AgentFinding } from '../types.js';

async function runP11FinancialTests() {
  console.log('\n======================================================');
  console.log('🧪 INICIANDO TEST SUITE P1-1: IMPACTO FINANCIERO DINÁMICO');
  console.log('======================================================\n');

  let passedTests = 0;
  const totalTests = 7;
  const originalExecuteAgent = agentOrchestrator.executeAgent.bind(agentOrchestrator);

  try {
    // ----------------------------------------------------
    // TEST 1: Cero oportunidades generadas
    // ----------------------------------------------------
    console.log('▶ TEST 1: Workflow sin oportunidades ni hallazgos financieros...');
    const wfZero = workflowEngine.createWorkflow({
      name: 'Test Zero Financial',
      code: 'TEST-P1-ZERO',
      category: 'DATA_QUALITY',
      triggerType: 'MANUAL',
      stages: [
        {
          id: 'st-z-1',
          name: 'Data Quality Sanitization',
          agentId: 'data-quality-agent',
          agentName: 'Data Quality Agent',
          order: 1,
          isCritical: true,
          status: 'pending'
        }
      ]
    });

    agentOrchestrator.executeAgent = async (agentId: string): Promise<AgentExecutionRecord> => {
      return {
        agentRunId: `mock-zero-${Date.now()}`,
        agentId,
        inputHash: 'hash-zero',
        outputHash: 'hash-out-zero',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 50,
        status: 'SUCCESS',
        decisionIds: [],
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro'
      };
    };

    const runZero = await workflowEngine.executeWorkflow(wfZero.id, 'TestRunner');

    const test1Passed = runZero.summary.financialImpact === 0 &&
                        runZero.financialImpact === 0 &&
                        runZero.summary.opportunitiesCreated === 0 &&
                        (runZero.summary.financialImpact as number) !== 1485.50 &&
                        runZero.financialBreakdown?.length === 0;

    if (test1Passed) {
      console.log('✅ TEST 1 PASSED: financialImpact === 0, opportunitiesCreated === 0 (Cero hardcoded 1485.50).');
      passedTests++;
    } else {
      console.error('❌ TEST 1 FAILED:', { 
        financialImpact: runZero.summary.financialImpact, 
        opps: runZero.summary.opportunitiesCreated,
        breakdown: runZero.financialBreakdown 
      });
    }

    // ----------------------------------------------------
    // TEST 2: Exactamente una oportunidad generada
    // ----------------------------------------------------
    console.log('\n▶ TEST 2: Exactamente una oportunidad generada durante el run...');
    const wfSingle = workflowEngine.createWorkflow({
      name: 'Test Single Opportunity',
      code: 'TEST-P1-SINGLE',
      category: 'PROCUREMENT',
      triggerType: 'MANUAL',
      stages: [
        {
          id: 'st-s-1',
          name: 'Arbitrage Opportunity Stage',
          agentId: 'opportunity-agent',
          agentName: 'Opportunity Agent',
          order: 1,
          isCritical: true,
          status: 'pending'
        }
      ]
    });

    agentOrchestrator.executeAgent = async (agentId: string): Promise<AgentExecutionRecord> => {
      const nowIso = new Date().toISOString();
      const testOpp: Opportunity = {
        opportunityId: `opp-test-single-${Date.now()}`,
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro',
        type: 'SUPPLIER_ARBITRAGE',
        title: 'Ahorro Único en Mayoreo',
        description: 'Compra consolidada con Scorpion',
        financialImpact: 820.50,
        confidence: 96,
        urgency: 4,
        freshness: '100%',
        evidenceReferences: ['ev-test-1'],
        recommendedAction: 'Comprar 10 bultos',
        status: 'PROPOSED',
        createdAt: nowIso,
        score: 95
      };
      db.upsertOpportunity(testOpp);

      return {
        agentRunId: `mock-single-${Date.now()}`,
        agentId,
        inputHash: 'hash-single',
        outputHash: 'hash-out-single',
        startedAt: nowIso,
        finishedAt: nowIso,
        durationMs: 65,
        status: 'SUCCESS',
        decisionIds: [],
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro'
      };
    };

    const runSingle = await workflowEngine.executeWorkflow(wfSingle.id, 'TestRunner');

    const test2Passed = runSingle.summary.financialImpact === 820.50 &&
                        runSingle.summary.opportunitiesCreated === 1 &&
                        runSingle.financialBreakdown?.length === 1 &&
                        runSingle.financialBreakdown[0].financialImpact === 820.50 &&
                        runSingle.financialBreakdown[0].sourceId.startsWith('opp-test-single');

    if (test2Passed) {
      console.log('✅ TEST 2 PASSED: financialImpact === 820.50, opportunitiesCreated === 1, breakdown completo.');
      passedTests++;
    } else {
      console.error('❌ TEST 2 FAILED:', { 
        financialImpact: runSingle.summary.financialImpact, 
        opps: runSingle.summary.opportunitiesCreated,
        breakdown: runSingle.financialBreakdown 
      });
    }

    // ----------------------------------------------------
    // TEST 3: Múltiples oportunidades generadas
    // ----------------------------------------------------
    console.log('\n▶ TEST 3: Múltiples oportunidades generadas durante el run...');
    const wfMulti = workflowEngine.createWorkflow({
      name: 'Test Multi Opportunities',
      code: 'TEST-P1-MULTI',
      category: 'PRICING',
      triggerType: 'MANUAL',
      stages: [
        {
          id: 'st-m-1',
          name: 'Multi Opportunity Stage',
          agentId: 'opportunity-agent',
          agentName: 'Opportunity Agent',
          order: 1,
          isCritical: true,
          status: 'pending'
        }
      ]
    });

    agentOrchestrator.executeAgent = async (agentId: string): Promise<AgentExecutionRecord> => {
      const nowIso = new Date().toISOString();
      const opp1: Opportunity = {
        opportunityId: `opp-multi-1-${Date.now()}`,
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro',
        type: 'PRICE_DROP',
        title: 'Oportunidad 1',
        description: 'Aceite 1L',
        financialImpact: 500.00,
        confidence: 94,
        urgency: 3,
        freshness: '100%',
        evidenceReferences: ['ev-1'],
        recommendedAction: 'Alinear precios',
        status: 'PROPOSED',
        createdAt: nowIso,
        score: 90
      };
      const opp2: Opportunity = {
        opportunityId: `opp-multi-2-${Date.now()}`,
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro',
        type: 'STOCKOUT_ARBITRAGE',
        title: 'Oportunidad 2',
        description: 'Arroz 1kg',
        financialImpact: 350.75,
        confidence: 91,
        urgency: 4,
        freshness: '100%',
        evidenceReferences: ['ev-2'],
        recommendedAction: 'Reabastecer',
        status: 'PROPOSED',
        createdAt: nowIso,
        score: 92
      };
      db.upsertOpportunity(opp1);
      db.upsertOpportunity(opp2);

      return {
        agentRunId: `mock-multi-${Date.now()}`,
        agentId,
        inputHash: 'hash-multi',
        outputHash: 'hash-out-multi',
        startedAt: nowIso,
        finishedAt: nowIso,
        durationMs: 70,
        status: 'SUCCESS',
        decisionIds: [],
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro'
      };
    };

    const runMulti = await workflowEngine.executeWorkflow(wfMulti.id, 'TestRunner');

    const expectedSum = 500.00 + 350.75;
    const test3Passed = Math.abs(runMulti.summary.financialImpact - expectedSum) < 0.01 &&
                        runMulti.summary.opportunitiesCreated === 2 &&
                        runMulti.financialBreakdown?.length === 2;

    if (test3Passed) {
      console.log(`✅ TEST 3 PASSED: Suma exacta $${expectedSum.toFixed(2)} y 2 oportunidades detectadas.`);
      passedTests++;
    } else {
      console.error('❌ TEST 3 FAILED:', { 
        financialImpact: runMulti.summary.financialImpact, 
        expected: expectedSum,
        breakdown: runMulti.financialBreakdown 
      });
    }

    // ----------------------------------------------------
    // TEST 4: Oportunidad duplicada (mismo ID no se suma dos veces)
    // ----------------------------------------------------
    console.log('\n▶ TEST 4: Prevención de doble conteo para oportunidades con mismo ID...');
    const wfDup = workflowEngine.createWorkflow({
      name: 'Test Duplicate Opportunity',
      code: 'TEST-P1-DUP',
      category: 'OPERATIONS',
      triggerType: 'MANUAL',
      stages: [
        {
          id: 'st-d-1',
          name: 'Stage 1',
          agentId: 'opportunity-agent',
          agentName: 'Opportunity Agent',
          order: 1,
          isCritical: true,
          status: 'pending'
        },
        {
          id: 'st-d-2',
          name: 'Stage 2',
          agentId: 'opportunity-agent',
          agentName: 'Opportunity Agent',
          order: 2,
          isCritical: false,
          status: 'pending'
        }
      ]
    });

    const duplicateOppId = `opp-dup-fixed-${Date.now()}`;
    agentOrchestrator.executeAgent = async (agentId: string): Promise<AgentExecutionRecord> => {
      const nowIso = new Date().toISOString();
      // Add the exact same opportunity in both stages
      const dupOpp: Opportunity = {
        opportunityId: duplicateOppId,
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro',
        type: 'PRICE_ADVANTAGE',
        title: 'Oportunidad Reincidente',
        description: 'Mismo ID de oportunidad',
        financialImpact: 600.00,
        confidence: 90,
        urgency: 2,
        freshness: '100%',
        evidenceReferences: [],
        recommendedAction: 'Acción',
        status: 'PROPOSED',
        createdAt: nowIso,
        score: 88
      };
      db.upsertOpportunity(dupOpp);

      return {
        agentRunId: `mock-dup-${Date.now()}`,
        agentId,
        inputHash: 'hash-dup',
        outputHash: 'hash-out-dup',
        startedAt: nowIso,
        finishedAt: nowIso,
        durationMs: 40,
        status: 'SUCCESS',
        decisionIds: [],
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro'
      };
    };

    const runDup = await workflowEngine.executeWorkflow(wfDup.id, 'TestRunner');

    // Must be 600.00, NOT 1200.00
    const test4Passed = runDup.summary.financialImpact === 600.00 &&
                        runDup.financialBreakdown?.length === 1;

    if (test4Passed) {
      console.log('✅ TEST 4 PASSED: Oportunidad duplicada contada exactamente UNA sola vez ($600.00).');
      passedTests++;
    } else {
      console.error('❌ TEST 4 FAILED:', { 
        financialImpact: runDup.summary.financialImpact, 
        breakdown: runDup.financialBreakdown 
      });
    }

    // ----------------------------------------------------
    // TEST 5: Oportunidad histórica antigua no se incluye en el cálculo del run
    // ----------------------------------------------------
    console.log('\n▶ TEST 5: Oportunidad histórica creada antes del run NO se incluye...');
    // Seed an old opportunity with past timestamp
    const oldPastTimestamp = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
    const oldOpp: Opportunity = {
      opportunityId: `opp-past-old-${Date.now()}`,
      tenantId: 'tenant-cdmx-01',
      storeId: 'store-cdmx-centro',
      type: 'OLD_ARBITRAGE',
      title: 'Oportunidad de Hace 1 Hora',
      description: 'No pertenece a esta ejecución',
      financialImpact: 9999.00,
      confidence: 80,
      urgency: 1,
      freshness: '50%',
      evidenceReferences: [],
      recommendedAction: 'Ignorar en este run',
      status: 'PROPOSED',
      createdAt: oldPastTimestamp,
      score: 70
    };
    db.upsertOpportunity(oldOpp);

    const wfHist = workflowEngine.createWorkflow({
      name: 'Test Historic Isolation',
      code: 'TEST-P1-HIST',
      category: 'OPERATIONS',
      triggerType: 'MANUAL',
      stages: [
        {
          id: 'st-h-1',
          name: 'Stage Clean',
          agentId: 'data-quality-agent',
          agentName: 'Data Quality Agent',
          order: 1,
          isCritical: true,
          status: 'pending'
        }
      ]
    });

    agentOrchestrator.executeAgent = async (agentId: string): Promise<AgentExecutionRecord> => {
      return {
        agentRunId: `mock-hist-${Date.now()}`,
        agentId,
        inputHash: 'hash-h',
        outputHash: 'hash-out-h',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 30,
        status: 'SUCCESS',
        decisionIds: [],
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro'
      };
    };

    const runHist = await workflowEngine.executeWorkflow(wfHist.id, 'TestRunner');

    const test5Passed = runHist.summary.financialImpact === 0 &&
                        !runHist.financialBreakdown?.some(b => b.sourceId.includes('opp-past-old'));

    if (test5Passed) {
      console.log('✅ TEST 5 PASSED: Oportunidades históricas aisladas de forma segura (financialImpact === 0).');
      passedTests++;
    } else {
      console.error('❌ TEST 5 FAILED:', { 
        financialImpact: runHist.summary.financialImpact,
        breakdown: runHist.financialBreakdown
      });
    }

    // ----------------------------------------------------
    // TEST 6: Agente en Fallback/Degradado
    // ----------------------------------------------------
    console.log('\n▶ TEST 6: Agente en Fallback genera hallazgo con valor real...');
    const wfFallback = workflowEngine.createWorkflow({
      name: 'Test Fallback Financial',
      code: 'TEST-P1-FB',
      category: 'INTELLIGENCE',
      triggerType: 'MANUAL',
      stages: [
        {
          id: 'st-fb-1',
          name: 'Fallback Stage',
          agentId: 'reorder-agent',
          agentName: 'Reorder Agent',
          order: 1,
          isCritical: false,
          status: 'pending'
        }
      ]
    });

    agentOrchestrator.executeAgent = async (agentId: string): Promise<AgentExecutionRecord> => {
      const nowIso = new Date().toISOString();
      const fbFinding: AgentFinding = {
        findingId: `find-fb-${Date.now()}`,
        agentId,
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro',
        findingType: 'STOCKOUT_RISK',
        finding: 'Reorden optimizado por fallback',
        evidenceReferences: [],
        confidence: 85,
        freshness: 1,
        financialImpact: 450.25,
        createdAt: nowIso
      };
      db.addAgentFinding(fbFinding);

      return {
        agentRunId: `mock-fb-${Date.now()}`,
        agentId,
        inputHash: 'hash-fb',
        outputHash: 'hash-out-fb',
        startedAt: nowIso,
        finishedAt: nowIso,
        durationMs: 45,
        status: 'DEGRADED',
        decisionIds: [],
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro'
      };
    };

    const runFallback = await workflowEngine.executeWorkflow(wfFallback.id, 'TestRunner');

    const test6Passed = runFallback.status === 'DEGRADED' &&
                        runFallback.summary.financialImpact === 450.25 &&
                        runFallback.financialBreakdown?.length === 1 &&
                        runFallback.financialBreakdown[0].financialImpact === 450.25;

    if (test6Passed) {
      console.log('✅ TEST 6 PASSED: Fallback reporta status DEGRADED e impacto financiero auditado ($450.25).');
      passedTests++;
    } else {
      console.error('❌ TEST 6 FAILED:', { 
        status: runFallback.status,
        financialImpact: runFallback.summary.financialImpact,
        breakdown: runFallback.financialBreakdown
      });
    }

    // ----------------------------------------------------
    // TEST 7: Workflow parcialmente fallido
    // ----------------------------------------------------
    console.log('\n▶ TEST 7: Workflow parcialmente fallido (suma hallazgos de etapa exitosa)...');
    const wfPartial = workflowEngine.createWorkflow({
      name: 'Test Partial Fail Financial',
      code: 'TEST-P1-PARTIAL',
      category: 'OPERATIONS',
      triggerType: 'MANUAL',
      stages: [
        {
          id: 'st-p-1',
          name: 'Stage 1 Success with Finding',
          agentId: 'reorder-agent',
          agentName: 'Reorder Agent',
          order: 1,
          isCritical: false,
          status: 'pending'
        },
        {
          id: 'st-p-2',
          name: 'Stage 2 Failed Non-Critical',
          agentId: 'store-manager-agent',
          agentName: 'Store Manager Agent',
          order: 2,
          isCritical: false,
          status: 'pending'
        }
      ]
    });

    agentOrchestrator.executeAgent = async (agentId: string): Promise<AgentExecutionRecord> => {
      const nowIso = new Date().toISOString();
      if (agentId === 'reorder-agent') {
        const finding: AgentFinding = {
          findingId: `find-part-${Date.now()}`,
          agentId,
          tenantId: 'tenant-cdmx-01',
          storeId: 'store-cdmx-centro',
          findingType: 'STOCKOUT_RISK',
          finding: 'Ahorro en reorden',
          evidenceReferences: [],
          confidence: 90,
          freshness: 1,
          financialImpact: 320.00,
          createdAt: nowIso
        };
        db.addAgentFinding(finding);

        return {
          agentRunId: `mock-part-ok-${Date.now()}`,
          agentId,
          inputHash: 'hash-p1',
          outputHash: 'hash-out-p1',
          startedAt: nowIso,
          finishedAt: nowIso,
          durationMs: 40,
          status: 'SUCCESS',
          decisionIds: [],
          tenantId: 'tenant-cdmx-01',
          storeId: 'store-cdmx-centro'
        };
      } else {
        return {
          agentRunId: `mock-part-fail-${Date.now()}`,
          agentId,
          inputHash: 'hash-p2',
          outputHash: 'hash-err-p2',
          startedAt: nowIso,
          finishedAt: nowIso,
          durationMs: 30,
          status: 'FAILED',
          error: 'Error en síntesis no crítica',
          decisionIds: [],
          tenantId: 'tenant-cdmx-01',
          storeId: 'store-cdmx-centro'
        };
      }
    };

    const runPartial = await workflowEngine.executeWorkflow(wfPartial.id, 'TestRunner');

    const test7Passed = runPartial.status === 'PARTIAL' &&
                        runPartial.summary.financialImpact === 320.00 &&
                        runPartial.summary.stagesCompleted === 1 &&
                        runPartial.summary.stagesFailed === 1;

    if (test7Passed) {
      console.log('✅ TEST 7 PASSED: Workflow PARTIAL sumó el hallazgo válido de la etapa 1 ($320.00).');
      passedTests++;
    } else {
      console.error('❌ TEST 7 FAILED:', { 
        status: runPartial.status,
        financialImpact: runPartial.summary.financialImpact,
        stages: runPartial.stages.map(s => s.status)
      });
    }

    // Cleanup test workflows
    db.deleteWorkflow(wfZero.id);
    db.deleteWorkflow(wfSingle.id);
    db.deleteWorkflow(wfMulti.id);
    db.deleteWorkflow(wfDup.id);
    db.deleteWorkflow(wfHist.id);
    db.deleteWorkflow(wfFallback.id);
    db.deleteWorkflow(wfPartial.id);

  } finally {
    agentOrchestrator.executeAgent = originalExecuteAgent;
  }

  console.log('\n======================================================');
  console.log(`📊 RESULTADOS P1-1: ${passedTests}/${totalTests} TESTS PASARON SATISFACTORIAMENTE`);
  console.log('======================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runP11FinancialTests().catch(err => {
  console.error('Unhandled error in P1-1 tests:', err);
  process.exit(1);
});
