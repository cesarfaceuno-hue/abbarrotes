import { db } from '../db/database.js';
import { Opportunity, AgentFinding, SharedObservation, DecisionRecord } from '../types.js';
import { agentEventSystem } from './AgentEventSystem.js';

export interface ScoreFactors {
  financialImpact: number;
  confidence: number;
  urgency: number; // 1-5
  evidenceQuality: number; // 1-10
  freshnessHours: number;
  actionability: number; // 1-10
}

export class OpportunityEngine {
  private static instance: OpportunityEngine;

  private constructor() {}

  public static getInstance(): OpportunityEngine {
    if (!OpportunityEngine.instance) {
      OpportunityEngine.instance = new OpportunityEngine();
    }
    return OpportunityEngine.instance;
  }

  /**
   * Task 7: Calculate Opportunity Score (0-100) from actual metrics
   */
  public calculateOpportunityScore(factors: ScoreFactors): number {
    const weights = {
      financial: 0.35,      // Financial weight
      confidence: 0.25,     // Match & evidence confidence weight
      urgency: 0.15,        // Timeliness weight
      evidence: 0.10,       // Evidence quality weight
      freshness: 0.08,      // Freshness index weight
      actionability: 0.07   // Ease of execution weight
    };

    // Normalize financial impact: map $0-$1000 MXN linearly onto 0-100 scale, cap at 100
    const normFinancial = Math.min(100, (Math.abs(factors.financialImpact) / 1000) * 100);
    
    // Normalize freshness: younger than 24 hours = 100 points, subtract 1.5 points per hour exceeding 24, floor at 0
    const normFreshness = Math.max(0, 100 - Math.max(0, factors.freshnessHours - 24) * 1.5);
    
    const confidencePoints = factors.confidence; // 0-100
    const urgencyPoints = factors.urgency * 20;  // 1-5 maps to 20-100
    const evidencePoints = factors.evidenceQuality * 10; // 1-10 maps to 10-100
    const actionabilityPoints = factors.actionability * 10; // 1-10 maps to 10-100

    const score = (
      normFinancial * weights.financial +
      confidencePoints * weights.confidence +
      urgencyPoints * weights.urgency +
      evidencePoints * weights.evidence +
      normFreshness * weights.freshness +
      actionabilityPoints * weights.actionability
    );

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Task 8: Confidence calculation from real criteria
   */
  public calculateConfidence(inputs: {
    eanMatch: boolean;
    sourceReliability: number; // 0-100
    freshnessHours: number;
    independentSourcesCount: number;
    historicalConsistency: number; // 0-100
    salesHistoryExists: boolean;
    dataQualityStatus: 'VALID' | 'REVIEW' | 'STALE';
  }): { score: number; reasons: string[] } {
    let score = 50; // default base level
    const reasons: string[] = [];

    if (inputs.eanMatch) {
      score += 20;
      reasons.push("Exact barcode/EAN match verified in CDMX product database.");
    } else {
      score -= 10;
      reasons.push("Fuzzy matching logic applied (no exact EAN).");
    }

    if (inputs.sourceReliability >= 90) {
      score += 15;
      reasons.push(`High source reliability from trusted supplier (${inputs.sourceReliability}%).`);
    }

    if (inputs.freshnessHours < 24) {
      score += 15;
      reasons.push(`Ultra-fresh data captured within ${inputs.freshnessHours.toFixed(1)} hours.`);
    } else if (inputs.freshnessHours > 72) {
      score -= 15;
      reasons.push("Information is stale (captured > 72 hours ago).");
    }

    if (inputs.independentSourcesCount >= 2) {
      score += 10;
      reasons.push(`Confirmed independently by ${inputs.independentSourcesCount} matching sources.`);
    }

    if (inputs.salesHistoryExists) {
      score += 10;
      reasons.push("Matching sales history exists (determines accurate consumer demand).");
    }

    if (inputs.dataQualityStatus === 'VALID') {
      score += 10;
      reasons.push("Passed comprehensive data quality and sanity validations.");
    } else {
      score -= 20;
      reasons.push("Data has pending quality review warnings.");
    }

    const finalScore = Math.round(Math.max(0, Math.min(100, score)));
    return { score: finalScore, reasons };
  }

  /**
   * Core Engine execution: Consolidate specialist findings and generate opportunities.
   */
  public async generateOpportunitiesFromFindings(tenantId = 'tenant-cdmx-01', storeId = 'store-cdmx-main'): Promise<Opportunity[]> {
    const findings = db.getAgentFindings();
    const existingOpps = db.getOpportunities();
    const newlyCreatedOpps: Opportunity[] = [];

    // Filter pending/unconsolidated findings
    for (const finding of findings) {
      const oppId = `opp-${finding.findingId}`;
      const alreadyConverted = existingOpps.some(o => o.opportunityId === oppId);
      if (alreadyConverted) continue;

      // Map finding to opportunity
      const isArbitrage = finding.findingType === 'SUPPLIER_ARBITRAGE';
      const isStockout = finding.findingType === 'STOCKOUT_RISK';
      const isMarginSqueeze = finding.findingType === 'MARGIN_SQUEEZE';

      let type = 'GENERAL_OPTIMIZATION';
      let title = `Optimización: ${finding.finding}`;
      let recommendedAction = 'Revisar la señal generada por el agente.';
      let urgency = 3; // default medium

      if (isArbitrage) {
        type = 'SUPPLIER_ARBITRAGE';
        title = `Arbitraje Mayorista: ${finding.finding}`;
        recommendedAction = 'Cambiar de proveedor y autorizar orden de compra con Scorpion.';
        urgency = 4;
      } else if (isStockout) {
        type = 'STOCKOUT_RISK';
        title = `Desabasto Crítico: ${finding.finding}`;
        recommendedAction = 'Comprar stock de abasto sugerido inmediatamente.';
        urgency = 5;
      } else if (isMarginSqueeze) {
        type = 'MARGIN_SQUEEZE';
        title = `Presión de Margen: ${finding.finding}`;
        recommendedAction = 'Ajustar precio público en POS para recuperar el margen.';
        urgency = 4;
      }

      // Calculate Opportunity Score (0-100) dynamically
      const score = this.calculateOpportunityScore({
        financialImpact: finding.financialImpact,
        confidence: finding.confidence,
        urgency,
        evidenceQuality: 9, // High verified
        freshnessHours: typeof finding.freshness === 'number' ? finding.freshness : 6,
        actionability: 8 // standard operational ease
      });

      const newOpp: Opportunity = {
        opportunityId: oppId,
        tenantId,
        storeId,
        type,
        title,
        description: `El agente ${finding.agentId} detectó la siguiente situación: ${finding.finding}. Impacto potencial estimado: $${finding.financialImpact.toFixed(2)} MXN.`,
        financialImpact: finding.financialImpact,
        confidence: finding.confidence,
        urgency,
        freshness: `${finding.freshness}h`,
        evidenceReferences: finding.evidenceReferences,
        recommendedAction,
        status: 'PROPOSED',
        createdAt: new Date().toISOString(),
        score
      };

      db.upsertOpportunity(newOpp);
      newlyCreatedOpps.push(newOpp);

      // Trigger event
      await agentEventSystem.emit('OPPORTUNITY_CREATED', { opportunityId: newOpp.opportunityId });

      // Synchronize with Decision Record inside DecisionEngine/db to enable human review
      const existingDecision = db.getDecisionById(`dec-${newOpp.opportunityId}`);
      if (!existingDecision) {
        const decisionRecord: DecisionRecord = {
          id: `dec-${newOpp.opportunityId}`,
          tenantId,
          organizationId: 'org-abarrotes-cdmx',
          storeId,
          type: newOpp.type as any,
          severity: urgency >= 4 ? 'CRITICAL' : 'HIGH',
          status: 'PENDING',
          what: newOpp.title,
          why: newOpp.description,
          rootCause: `Detectado por análisis inteligente de agente.`,
          evidence: [],
          dataQuality: 'VALID',
          financialImpact: newOpp.financialImpact,
          estimatedSavings: isArbitrage ? newOpp.financialImpact : 0,
          estimatedLostRevenue: isStockout ? Math.abs(newOpp.financialImpact) : 0,
          estimatedMarginImpact: isMarginSqueeze ? Math.abs(newOpp.financialImpact) : 0,
          confidence: newOpp.confidence,
          createdAt: newOpp.createdAt,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          consequenceIfIgnored: `Fuga de capital u oportunidad perdida de $${Math.abs(newOpp.financialImpact).toFixed(2)} MXN.`,
          recommendedAction: newOpp.recommendedAction,
          actionType: isArbitrage ? 'CHANGE_SUPPLIER' : isStockout ? 'CREATE_PURCHASE_ORDER' : 'UPDATE_PRICE',
          requiresApproval: true
        };
        db.upsertDecision(decisionRecord);
      }
    }

    return newlyCreatedOpps;
  }

  /**
   * Task 10: Human approval gate logic.
   */
  public approveOpportunity(oppId: string, actor: string, userTenantId = 'tenant-cdmx-01'): { success: boolean; opportunity?: Opportunity } {
    const opp = db.getOpportunityById(oppId);
    if (!opp) {
      throw new Error(`Oportunidad ${oppId} no encontrada.`);
    }

    // Task 17: Tenant Isolation check
    if (opp.tenantId !== userTenantId) {
      const err = new Error(`403 Forbidden: Tenant Isolation Bypass Blocked.`);
      console.error(err.message);
      throw err;
    }

    opp.status = 'APPROVED';
    db.upsertOpportunity(opp);

    // Sync corresponding Decision Record
    const dec = db.getDecisionById(`dec-${oppId}`);
    if (dec) {
      dec.status = 'APPROVED';
      dec.approvedBy = actor;
      dec.approvedAt = new Date().toISOString();
      db.upsertDecision(dec);
    }

    // Dispatch event
    agentEventSystem.emit('DECISION_APPROVED', { opportunityId: oppId, actor });

    return { success: true, opportunity: opp };
  }

  /**
   * Task 10: Human approval bypass protection.
   */
  public executeOpportunityAction(oppId: string, actor: string, userTenantId = 'tenant-cdmx-01'): { success: boolean; result: string } {
    const opp = db.getOpportunityById(oppId);
    if (!opp) {
      throw new Error(`Oportunidad ${oppId} no encontrada.`);
    }

    // Tenant Isolation check
    if (opp.tenantId !== userTenantId) {
      throw new Error(`403 Forbidden: Tenant Isolation Bypass Blocked.`);
    }

    // CRITICAL: Check status to prevent bypass
    if (opp.status !== 'APPROVED') {
      const err = new Error(`403 Forbidden: Action execution bypass detected. Opportunity ${oppId} is in state ${opp.status} and has NOT been approved by a human.`);
      console.error(err.message);
      throw err;
    }

    // Execute
    opp.status = 'EXECUTED';
    db.upsertOpportunity(opp);

    const dec = db.getDecisionById(`dec-${oppId}`);
    if (dec) {
      dec.status = 'EXECUTED';
      dec.executedAt = new Date().toISOString();
      dec.result = `Acción ejecutada exitosamente por el operador ${actor}.`;
      dec.resultFinancialImpact = opp.financialImpact;
      db.upsertDecision(dec);
    }

    // Dispatch event
    agentEventSystem.emit('ACTION_EXECUTED', { opportunityId: oppId, actor });

    return {
      success: true,
      result: `Acción ejecutada con éxito. Impacto real financiero: $${opp.financialImpact.toFixed(2)} MXN capturado.`
    };
  }
}

export const opportunityEngine = OpportunityEngine.getInstance();
