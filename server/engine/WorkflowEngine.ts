import { db } from '../db/database.js';
import { agentOrchestrator } from './AgentOrchestrator.js';
import { googleSheetsIntelligenceAgent } from './GoogleSheetsIntelligenceAgent.js';
import { Telemetry } from '../services/telemetry.js';
import { WorkflowDefinition, WorkflowExecutionRun, WorkflowStage, FinancialImpactItem } from '../types.js';

export type { WorkflowStage, WorkflowDefinition, WorkflowExecutionRun, FinancialImpactItem };

export class WorkflowEngine {
  private activeWorkflowLocks: Set<string> = new Set();
  public readonly DEFAULT_TIMEOUT_MS = 120_000; // 120 seconds default timeout (P1-2)

  constructor() {
    // P1-2: Safe recovery of stale RUNNING executions upon engine startup
    this.recoverStaleRuns();
  }

  /**
   * P1-2: Detects and closes any orphaned/stale RUNNING executions safely.
   */
  public recoverStaleRuns(maxAgeMs: number = this.DEFAULT_TIMEOUT_MS): number {
    let recoveredCount = 0;
    try {
      const allRuns = db.getExecutionRuns(200);
      const now = Date.now();
      const nowIso = new Date().toISOString();

      for (const run of allRuns) {
        if (run.status === 'RUNNING') {
          const startTime = new Date(run.startedAt).getTime();
          const elapsed = isNaN(startTime) ? maxAgeMs + 1000 : (now - startTime);
          const limit = run.timeoutMs || maxAgeMs;

          if (elapsed >= limit || isNaN(startTime)) {
            const recoveryReason = 'STALE_RUNNING_RECOVERED_TIMEOUT_OR_RESTART';
            const errorMsg = `Ejecución interrumpida de forma segura tras ${Math.round(elapsed / 1000)}s (Timeout o reinicio del servidor).`;

            // Mark unfinished stages as failed
            const updatedStages = run.stages.map(s => {
              if (s.status === 'running' || s.status === 'pending') {
                return {
                  ...s,
                  status: 'failed' as const,
                  error: 'Etapa interrumpida por expiración de tiempo o reinicio de servidor.',
                  finishedAt: nowIso,
                  completedAt: nowIso,
                  durationMs: s.durationMs || 0,
                };
              }
              return s;
            });

            const updatedSummary = {
              ...run.summary,
              stagesFailed: updatedStages.filter(s => s.status === 'failed').length,
            };

            const updatedLogs = [
              ...(run.logs || []),
              `[RECOVERY] ${recoveryReason}: Ejecución marcada como FAILED automáticamente.`,
            ];

            const updatedErrors = [
              ...(run.errors || []),
              errorMsg,
            ];

            db.updateExecutionRun(run.runId, {
              status: 'FAILED',
              stages: updatedStages,
              summary: updatedSummary,
              logs: updatedLogs,
              errors: updatedErrors,
              error: errorMsg,
              finishedAt: nowIso,
              completedAt: nowIso,
              durationMs: elapsed,
              recoveryReason,
            });

            // Reconcile associated workflow status
            const wf = db.getWorkflow(run.workflowId);
            if (wf && wf.status === 'RUNNING') {
              db.updateWorkflow(wf.id, {
                status: 'FAILED',
                updatedAt: nowIso,
              });
            }

            recoveredCount++;
            console.log(`[WorkflowEngine] 🛡️ Stale execution recovered: ${run.runId} (${run.workflowName}) -> FAILED`);
          }
        }
      }
    } catch (e) {
      console.error('[WorkflowEngine] Error during recoverStaleRuns:', e);
    }
    return recoveredCount;
  }

  // --- WORKFLOW CRUD METHODS (P0-2) ---
  public listWorkflows(): WorkflowDefinition[] {
    return db.listWorkflows();
  }

  public getWorkflows(): WorkflowDefinition[] {
    return db.getWorkflows();
  }

  public getWorkflow(id: string): WorkflowDefinition | undefined {
    return db.getWorkflow(id);
  }

  public getWorkflowById(id: string): WorkflowDefinition | undefined {
    return db.getWorkflowById(id);
  }

  public createWorkflow(wf: Partial<WorkflowDefinition> & { name: string; stages: WorkflowStage[] }): WorkflowDefinition {
    const id = wf.id || `wf-custom-${Date.now()}`;
    const now = new Date().toISOString();
    const newWf: WorkflowDefinition = {
      id,
      code: wf.code || `WF-C${Date.now().toString().slice(-3)}`,
      name: wf.name,
      category: wf.category || 'OPERATIONS',
      description: wf.description || 'Flujo de trabajo personalizado.',
      triggerType: wf.triggerType || 'MANUAL',
      cronSchedule: wf.cronSchedule || 'Bajo Demanda',
      estimatedDuration: wf.estimatedDuration || '30s',
      estimatedSavingsPotential: wf.estimatedSavingsPotential || 'Variable',
      targetTenants: wf.targetTenants || 'Tienda Actual',
      status: 'READY',
      stages: wf.stages || [],
      requiredPermissions: wf.requiredPermissions || ['INVENTORY_READ'],
      autoApprovalThreshold: wf.autoApprovalThreshold || 5000,
      createdAt: wf.createdAt || now,
      updatedAt: now,
      metadata: wf.metadata || {},
    };

    return db.createWorkflow(newWf);
  }

  public updateWorkflow(id: string, updates: Partial<WorkflowDefinition>): WorkflowDefinition | undefined {
    return db.updateWorkflow(id, updates);
  }

  public deleteWorkflow(id: string): boolean {
    return db.deleteWorkflow(id);
  }

  // --- EXECUTION RUN METHODS (P0-2) ---
  public listExecutionRuns(limit = 30): WorkflowExecutionRun[] {
    return db.listExecutionRuns(limit);
  }

  public getRuns(limit = 30): WorkflowExecutionRun[] {
    return db.getExecutionRuns(limit);
  }

  public getExecutionRun(runId: string): WorkflowExecutionRun | undefined {
    return db.getExecutionRun(runId);
  }

  public getRunById(runId: string): WorkflowExecutionRun | undefined {
    return db.getExecutionRunById(runId);
  }

  public createExecutionRun(run: WorkflowExecutionRun): WorkflowExecutionRun {
    return db.createExecutionRun(run);
  }

  public updateExecutionRun(runId: string, updates: Partial<WorkflowExecutionRun>): WorkflowExecutionRun | undefined {
    return db.updateExecutionRun(runId, updates);
  }

  // --- EXECUTE WORKFLOW ENGINE (P0-2, P0-3, P1-1, P1-2) ---
  public async executeWorkflow(
    workflowId: string, 
    triggeredBy = 'Usuario God Mode (CTO)',
    customTimeoutMs?: number
  ): Promise<WorkflowExecutionRun> {
    // P1-2: Concurrency lock check
    if (this.activeWorkflowLocks.has(workflowId)) {
      throw new Error(`El flujo "${workflowId}" ya se encuentra en ejecución activa en este momento.`);
    }

    const workflow = db.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Flujo de trabajo no encontrado: ${workflowId}`);
    }

    // P1-2: Check if currently RUNNING in DB and not stale
    if (workflow.status === 'RUNNING') {
      const activeRuns = db.getExecutionRuns(10).filter(r => r.workflowId === workflowId && r.status === 'RUNNING');
      if (activeRuns.length > 0) {
        const latest = activeRuns[0];
        const elapsed = Date.now() - new Date(latest.startedAt).getTime();
        const limit = latest.timeoutMs || this.DEFAULT_TIMEOUT_MS;
        if (elapsed < limit) {
          throw new Error(`El flujo "${workflow.name}" ya se encuentra en ejecución.`);
        } else {
          this.recoverStaleRuns();
        }
      }
    }

    // Acquire lock
    this.activeWorkflowLocks.add(workflowId);

    const runId = `wfrun-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const startedAt = new Date().toISOString();
    const t0 = Date.now();
    const timeoutMs = customTimeoutMs || this.DEFAULT_TIMEOUT_MS;

    // Prepare fresh stages
    const executionStages: WorkflowStage[] = workflow.stages.map(s => ({
      ...s,
      status: 'pending',
      error: undefined,
      outputSummary: undefined,
      durationMs: 0,
      evidenceId: undefined,
      startedAt: undefined,
      finishedAt: undefined,
      completedAt: undefined,
      isCritical: s.isCritical !== undefined ? s.isCritical : (s.order === 1 || s.order === 2),
    }));

    const runRecord: WorkflowExecutionRun = {
      runId,
      executionId: runId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      startedAt,
      lastHeartbeatAt: startedAt,
      durationMs: 0,
      timeoutMs,
      status: 'RUNNING',
      triggeredBy,
      stages: executionStages,
      currentStage: 1,
      summary: {
        stagesTotal: executionStages.length,
        stagesCompleted: 0,
        stagesFailed: 0,
        stagesSkipped: 0,
        stagesDegraded: 0,
        observationsGenerated: 0,
        findingsGenerated: 0,
        opportunitiesCreated: 0,
        financialImpact: 0,
      },
      financialBreakdown: [],
      errors: [],
      warnings: [],
      evidence: [],
      logs: [`[WORKFLOW] Iniciando "${workflow.name}" (${workflow.code}) por ${triggeredBy}`],
    };

    // 1. Persist initial execution run & update workflow state in database
    db.createExecutionRun(runRecord);
    db.updateWorkflow(workflow.id, { status: 'RUNNING', lastRunAt: startedAt });

    let hasCriticalFailure = false;
    let hasFailedStages = false;
    let hasDegradedStages = false;

    Telemetry.track('workflow-engine', 'workflow_started', {
      runId,
      workflowId: workflow.id,
      stagesCount: executionStages.length
    });

    try {
      for (const stage of executionStages) {
        // P1-2: Timeout check before beginning stage
        const elapsedSinceStart = Date.now() - t0;
        if (elapsedSinceStart >= timeoutMs) {
          const timeoutErrorMsg = `Tiempo límite de ejecución excedido (${timeoutMs}ms). Pipeline abortado.`;
          const nowIso = new Date().toISOString();
          stage.status = 'failed';
          stage.error = timeoutErrorMsg;
          stage.completedAt = nowIso;
          stage.finishedAt = nowIso;
          hasFailedStages = true;
          if (stage.isCritical) hasCriticalFailure = true;
          runRecord.summary.stagesFailed = (runRecord.summary.stagesFailed || 0) + 1;
          runRecord.errors = runRecord.errors || [];
          runRecord.errors.push(timeoutErrorMsg);
          runRecord.logs.push(`[TIMEOUT ERROR] ${timeoutErrorMsg}`);

          // Mark remaining pending stages as failed due to timeout
          const currentIndex = executionStages.findIndex(s => (s.id && s.id === stage.id) || s.order === stage.order);
          for (let i = currentIndex + 1; i < executionStages.length; i++) {
            executionStages[i].status = 'failed';
            executionStages[i].error = `Cancelado por tiempo límite excedido en etapa previa (${stage.name}).`;
            executionStages[i].completedAt = nowIso;
            executionStages[i].finishedAt = nowIso;
            runRecord.summary.stagesFailed = (runRecord.summary.stagesFailed || 0) + 1;
          }
          break;
        }

        stage.status = 'running';
        stage.startedAt = new Date().toISOString();
        stage.error = undefined;
        runRecord.currentStage = stage.order;
        runRecord.lastHeartbeatAt = stage.startedAt;
        const stageT0 = Date.now();
        runRecord.logs.push(`[ETAPA ${stage.order}/${executionStages.length}] Ejecutando: ${stage.name} (${stage.agentName})...`);

        // Real-time stage update persisted to disk
        db.updateExecutionRun(runId, {
          stages: executionStages,
          currentStage: stage.order,
          lastHeartbeatAt: runRecord.lastHeartbeatAt,
          logs: runRecord.logs,
        });

        try {
          // Execute the agent via AgentOrchestrator safely
          const agentRunResult = await agentOrchestrator.executeAgent(stage.agentId, 'SCHEDULED');
          
          const stageDuration = Date.now() - stageT0;
          const stageCompletedAt = new Date().toISOString();
          stage.durationMs = stageDuration;
          stage.finishedAt = stageCompletedAt;
          stage.completedAt = stageCompletedAt;
          runRecord.lastHeartbeatAt = stageCompletedAt;

          if (!agentRunResult || agentRunResult.status === 'FAILED') {
            const errorMsg = agentRunResult?.error || `El agente "${stage.agentName}" devolvió estado FAILED sin excepción.`;
            stage.status = 'failed';
            stage.error = errorMsg;
            stage.outputSummary = `Falló (${stageDuration}ms): ${errorMsg}`;
            if (agentRunResult?.agentRunId) {
              stage.evidenceId = agentRunResult.agentRunId;
              runRecord.evidence?.push(agentRunResult.agentRunId);
            }

            hasFailedStages = true;
            if (stage.isCritical) {
              hasCriticalFailure = true;
            }

            runRecord.summary.stagesFailed = (runRecord.summary.stagesFailed || 0) + 1;
            runRecord.errors = runRecord.errors || [];
            runRecord.errors.push(`[Etapa ${stage.order} - ${stage.name}] ${errorMsg}`);
            runRecord.logs.push(`[ETAPA ${stage.order} ERROR] ${stage.name} FALLÓ: ${errorMsg}`);

          } else if (agentRunResult.status === 'DEGRADED') {
            stage.status = 'degraded';
            stage.executionMode = 'DEGRADED';
            stage.evidenceId = agentRunResult.agentRunId;
            stage.outputSummary = `Ejecución degradada (${stageDuration}ms).`;
            if (agentRunResult.agentRunId) {
              runRecord.evidence?.push(agentRunResult.agentRunId);
            }

            hasDegradedStages = true;
            runRecord.summary.stagesDegraded = (runRecord.summary.stagesDegraded || 0) + 1;
            runRecord.summary.stagesCompleted++;
            runRecord.warnings = runRecord.warnings || [];
            runRecord.warnings.push(`[Etapa ${stage.order} - ${stage.name}] Ejecución degradada.`);
            runRecord.logs.push(`[ETAPA ${stage.order} DEGRADED] ${stage.name} finalizó en modo degradado.`);
          } else {
            // SUCCESS
            stage.status = 'completed';
            stage.executionMode = 'PRIMARY';
            stage.evidenceId = agentRunResult.agentRunId;
            stage.outputSummary = `Completado en ${stageDuration}ms. Hash: ${agentRunResult.outputHash?.substring(0, 10) || 'OK'}`;
            if (agentRunResult.agentRunId) {
              runRecord.evidence?.push(agentRunResult.agentRunId);
            }

            runRecord.summary.stagesCompleted++;
            runRecord.logs.push(`[ETAPA ${stage.order} OK] ${stage.name} finalizado con éxito en ${stageDuration}ms.`);
          }
        } catch (stageErr: any) {
          const stageDuration = Date.now() - stageT0;
          const stageCompletedAt = new Date().toISOString();
          stage.durationMs = stageDuration;
          stage.finishedAt = stageCompletedAt;
          stage.completedAt = stageCompletedAt;
          runRecord.lastHeartbeatAt = stageCompletedAt;

          const errorMsg = stageErr?.message || 'Excepción no controlada durante la ejecución del agente.';
          stage.status = 'failed';
          stage.error = errorMsg;
          stage.outputSummary = `Excepción en etapa (${stageDuration}ms): ${errorMsg}`;

          hasFailedStages = true;
          if (stage.isCritical) {
            hasCriticalFailure = true;
          }

          runRecord.summary.stagesFailed = (runRecord.summary.stagesFailed || 0) + 1;
          runRecord.errors = runRecord.errors || [];
          runRecord.errors.push(`[Etapa ${stage.order} - ${stage.name}] ${errorMsg}`);
          runRecord.logs.push(`[ETAPA ${stage.order} EXCEPTION] ${stage.name} lanzó error: ${errorMsg}`);
        }

        // Persist stage progress immediately
        db.updateExecutionRun(runId, {
          stages: executionStages,
          currentStage: stage.order,
          lastHeartbeatAt: runRecord.lastHeartbeatAt,
          summary: runRecord.summary,
          logs: runRecord.logs,
          warnings: runRecord.warnings,
          errors: runRecord.errors,
          evidence: runRecord.evidence,
        });
      }

      // If it's a workflow involving Google Sheets, ensure mini cloud export is fresh
      if (workflowId === 'wf-morning-intelligence' || workflowId === 'wf-sheets-mini-cloud-sync') {
        try {
          googleSheetsIntelligenceAgent.exportMiniCloudDatabaseFile();
          runRecord.logs.push('[WORKFLOW] Base interna Mini Nube (CSV) actualizada y sincronizada.');
        } catch (e) {
          console.error('[MINI CLOUD SYNC WARN]', e);
        }
      }

      // ----------------------------------------------------------------------------------
      // P1-1: CÁLCULO ESTRICTO DE IMPACTO FINANCIERO Y OPORTUNIDADES BASADO EN EVIDENCIA REAL
      // ----------------------------------------------------------------------------------
      const executionAgents = new Set(executionStages.map(s => s.agentId));
      
      // 1. Filtrar observaciones creadas ESTRICTAMENTE en esta ejecución por los agentes del workflow
      const allObservations = db.getSharedObservations();
      const currentRunObservations = allObservations.filter(obs => 
        obs.createdAt >= startedAt && 
        executionAgents.has(obs.agentId)
      );

      // 2. Filtrar hallazgos creados ESTRICTAMENTE en esta ejecución por los agentes del workflow
      const allFindings = db.getAgentFindings();
      const currentRunFindings = allFindings.filter(f => 
        f.createdAt >= startedAt && 
        executionAgents.has(f.agentId)
      );

      // 3. Filtrar oportunidades creadas ESTRICTAMENTE en esta ejecución
      const allOpportunities = db.getOpportunities();
      const currentRunOpps = allOpportunities.filter(opp => 
        opp.createdAt >= startedAt
      );

      // 4. Construir desglose financiero auditable sin duplicados ni números hardcodeados
      const financialBreakdown: FinancialImpactItem[] = [];
      const seenSources = new Set<string>();

      // Sumar impacto de oportunidades únicas de este run
      for (const opp of currentRunOpps) {
        const oppId = opp.opportunityId;
        if (!seenSources.has(`opp-${oppId}`)) {
          seenSources.add(`opp-${oppId}`);
          const impact = typeof opp.financialImpact === 'number' && !isNaN(opp.financialImpact) && opp.financialImpact > 0
            ? opp.financialImpact
            : 0;

          if (impact > 0) {
            financialBreakdown.push({
              sourceType: 'OPPORTUNITY',
              sourceId: oppId,
              agentId: 'opportunity-agent',
              agentName: 'Opportunity Agent',
              description: opp.title || opp.description || `Oportunidad de abasto optimizado (${opp.type || 'ARBITRAGE'})`,
              financialImpact: impact,
              confidence: typeof opp.confidence === 'number' ? opp.confidence : 90,
              timestamp: opp.createdAt
            });
          }
        }
      }

      // Sumar impacto de hallazgos con valor financiero positivo de este run no cubiertos previamente
      for (const f of currentRunFindings) {
        if (!seenSources.has(`finding-${f.findingId}`)) {
          seenSources.add(`finding-${f.findingId}`);
          const impact = typeof f.financialImpact === 'number' && !isNaN(f.financialImpact) && f.financialImpact > 0
            ? f.financialImpact
            : 0;

          if (impact > 0) {
            const stage = executionStages.find(s => s.agentId === f.agentId);
            financialBreakdown.push({
              sourceType: 'AGENT_FINDING',
              sourceId: f.findingId,
              agentId: f.agentId,
              agentName: stage?.agentName || f.agentId,
              description: f.finding,
              financialImpact: impact,
              confidence: f.confidence || 90,
              timestamp: f.createdAt
            });
          }
        }
      }

      // Cálculo total riguroso: 0 si no hay evidencia real (NUNCA valores hardcodeados como 1485.50 o 450)
      const realFinancialImpact = financialBreakdown.reduce((sum, item) => sum + item.financialImpact, 0);
      const realOpportunitiesCount = currentRunOpps.length;

      // Determine final workflow status strictly
      let finalStatus: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'DEGRADED' = 'SUCCESS';
      if (hasCriticalFailure) {
        finalStatus = 'FAILED';
      } else if (hasFailedStages) {
        if (runRecord.summary.stagesCompleted > 0) {
          finalStatus = 'PARTIAL';
        } else {
          finalStatus = 'FAILED';
        }
      } else if (hasDegradedStages) {
        finalStatus = 'DEGRADED';
      } else {
        finalStatus = 'SUCCESS';
      }

      // Calculate totals
      const totalDuration = Date.now() - t0;
      runRecord.durationMs = totalDuration;
      runRecord.finishedAt = new Date().toISOString();
      runRecord.completedAt = runRecord.finishedAt;
      runRecord.lastHeartbeatAt = runRecord.finishedAt;
      runRecord.status = finalStatus;
      runRecord.summary.observationsGenerated = currentRunObservations.length;
      runRecord.summary.findingsGenerated = currentRunFindings.length;
      runRecord.summary.opportunitiesCreated = realOpportunitiesCount;
      runRecord.summary.financialImpact = realFinancialImpact;
      runRecord.financialImpact = realFinancialImpact;
      runRecord.financialBreakdown = financialBreakdown;

      // Executive brief synthesis
      if (finalStatus === 'SUCCESS') {
        runRecord.executiveBrief = `Flujo de trabajo "${workflow.name}" completado satisfactoriamente. Se procesaron ${runRecord.summary.stagesCompleted}/${executionStages.length} etapas con ${currentRunObservations.length} observaciones generadas y un impacto económico auditado de $${realFinancialImpact.toFixed(2)} MXN en oportunidades/ahorros.`;
        runRecord.logs.push(`[WORKFLOW SUCCESS] Flujo completado en ${(totalDuration / 1000).toFixed(1)}s. Impacto financiero real: $${realFinancialImpact.toFixed(2)} MXN.`);
      } else if (finalStatus === 'PARTIAL') {
        runRecord.executiveBrief = `Flujo "${workflow.name}" completado PARCIALMENTE. ${runRecord.summary.stagesCompleted}/${executionStages.length} etapas completadas, ${runRecord.summary.stagesFailed} etapa(s) con fallas no críticas atendidas.`;
        runRecord.logs.push(`[WORKFLOW PARTIAL] Flujo finalizado parcialmente en ${(totalDuration / 1000).toFixed(1)}s con advertencias.`);
      } else if (finalStatus === 'DEGRADED') {
        runRecord.executiveBrief = `Flujo "${workflow.name}" completado en modo DEGRADADO. Las etapas críticas operaron mediante respaldo heurístico.`;
        runRecord.logs.push(`[WORKFLOW DEGRADED] Flujo finalizado con respaldo en ${(totalDuration / 1000).toFixed(1)}s.`);
      } else {
        runRecord.executiveBrief = `Flujo de trabajo "${workflow.name}" FALLÓ. Se detuvo o reportó error en etapa crítica. Revise los registros de auditoría.`;
        runRecord.logs.push(`[WORKFLOW FAILED] Flujo terminado con estado FAILED.`);
      }

      // Audit Log in DB
      db.addAuditLog({
        id: `audit-wf-${Date.now()}`,
        tenantId: 'tenant-cdmx-01',
        action: `EXECUTE_WORKFLOW_${workflow.code}`,
        actor: triggeredBy,
        timestamp: runRecord.finishedAt,
        before: { status: 'READY' },
        after: { status: finalStatus, runId, financialImpact: realFinancialImpact },
        reason: `Ejecución de pipeline empresarial ${workflow.name} con resultado ${finalStatus}`,
      });

      Telemetry.track('workflow-engine', 'workflow_completed', {
        runId,
        workflowId: workflow.id,
        durationMs: totalDuration,
        status: runRecord.status
      });

    } catch (fatalErr: any) {
      console.error(`[WORKFLOW FATAL] ${fatalErr.message}`);
      const totalDuration = Date.now() - t0;
      runRecord.durationMs = totalDuration;
      runRecord.finishedAt = new Date().toISOString();
      runRecord.completedAt = runRecord.finishedAt;
      runRecord.lastHeartbeatAt = runRecord.finishedAt;
      runRecord.status = 'FAILED';
      runRecord.error = fatalErr.message;
      runRecord.errors = runRecord.errors || [];
      runRecord.errors.push(fatalErr.message);
      runRecord.logs.push(`[WORKFLOW ERROR] Falló la ejecución fatal: ${fatalErr.message}`);
    } finally {
      // P1-2: Guaranteed concurrency lock cleanup and persistence
      this.activeWorkflowLocks.delete(workflowId);
      db.updateExecutionRun(runId, runRecord);
      db.updateWorkflow(workflow.id, {
        status: runRecord.status === 'RUNNING' ? 'FAILED' : runRecord.status,
        lastRunAt: runRecord.startedAt,
        lastSuccessAt: runRecord.status === 'SUCCESS' ? runRecord.finishedAt : workflow.lastSuccessAt,
      });
    }

    return runRecord;
  }
}

export const workflowEngine = new WorkflowEngine();
