import {
  StoreProfile,
  InventoryItem,
  SaleTransaction,
  SupplierEntity,
  DailyOpportunity,
  SmartAlert,
  AuditLogEntry,
  StoreBrainSnapshot,
  BrainDecisionNode,
  PurchaseQueueItem,
  ReceivingCostVariance,
  CashReconciliationRecord,
  MorningBrief,
  DailyOperatingPhase,
  DecisionType,
  DecisionSeverity,
  DecisionDomain,
  DataQualityTag,
} from '../types';
import { roundCurrency } from './transactionEngine';
import { analyzeProductDemand, calculateDailySalesBrief } from './demandEngine';

/**
 * STORE BRAIN ENGINE — HILO 6.1
 * Unified Decision Engine & Daily Operating System Orchestrator.
 * Adheres strictly to the architectural directive:
 * DETECTAR → EXPLICAR → PRIORIZAR → RECOMENDAR → APROBAR → EJECUTAR → AUDITAR → MEDIR → APRENDER
 */

/**
 * Builds the complete, real-time StoreBrainSnapshot by orchestrating
 * Hilo 4 (Intelligence Core) and Hilo 5 (Sales & Demand Engine).
 */
export function buildStoreBrainSnapshot(params: {
  storeProfile: StoreProfile;
  inventory: InventoryItem[];
  sales: SaleTransaction[];
  suppliers: SupplierEntity[];
  opportunities: DailyOpportunity[];
  alerts: SmartAlert[];
  auditLogs: AuditLogEntry[];
  costVariances: ReceivingCostVariance[];
  purchaseQueue: PurchaseQueueItem[];
  reconciliationHistory: CashReconciliationRecord[];
  currentPhase: DailyOperatingPhase;
  synthesis?: string;
}): StoreBrainSnapshot {
  const {
    storeProfile,
    inventory = [],
    sales = [],
    suppliers = [],
    opportunities = [],
    costVariances = [],
    purchaseQueue,
    reconciliationHistory,
    currentPhase,
    synthesis,
  } = params;

  const storeId = storeProfile.id || 'store-1';
  const tenantId = storeProfile.organizationId || 'org-lupita-group';
  const orgId = storeProfile.organizationId || 'org-lupita-group';

  // 1. Compute Demand Analyses & Sales Brief from Hilo 5 Engines
  const demandAnalyses = analyzeProductDemand(inventory, sales);
  const salesBrief = calculateDailySalesBrief(sales, demandAnalyses);

  // 2. Generate Unified Decision Nodes
  const decisions: BrainDecisionNode[] = [];

  // A. Stockout Risk Decisions (Stockout Engine)
  inventory.forEach((prod) => {
    const analysis = demandAnalyses.find((a) => a.productId === prod.id);
    const supplier = suppliers.find(
      (s) => s.name === prod.supplierDefault || s.name === prod.bestSupplier
    ) || suppliers[0];

    const leadTime = supplier?.deliveryLeadDays ?? 1;
    const avgSales = prod.avgDailySales || 1.0;
    const daysOfStock = prod.daysOfStock;

    // Rule: Stock coverage less than lead time + safety buffer, especially on STAR / CASH_COW
    const isStarOrCow =
      analysis?.performanceClass === 'STAR' ||
      analysis?.performanceClass === 'CASH_COW' ||
      prod.rotation === 'Alta';

    if (daysOfStock <= Math.max(1.5, leadTime + 0.5) || prod.currentStock <= prod.minStockAlert) {
      const daysUntilStockout = Math.max(0, roundCurrency(prod.currentStock / Math.max(0.1, avgSales)));
      const estimatedLostUnits = Math.round(Math.max(1, avgSales * Math.max(1, leadTime)));
      const estimatedLostRevenue = roundCurrency(estimatedLostUnits * prod.salePrice);
      const suggestedQty = Math.max(
        prod.minStockAlert * 2,
        Math.ceil(avgSales * Math.max(2, leadTime * 2))
      );

      const severity: DecisionSeverity =
        prod.currentStock <= 2 || daysOfStock < 1 ? 'CRITICAL' : 'HIGH';
      const priority = isStarOrCow ? 1 : 3;

      decisions.push({
        id: `DEC-STK-${prod.id}`,
        tenantId,
        organizationId: orgId,
        storeId,
        type: 'STOCKOUT_RISK',
        domain: 'INVENTORY',
        severity,
        priority,
        productId: prod.id,
        productName: prod.name,
        category: prod.category,
        what: `Riesgo de quiebre de stock inminente (${prod.currentStock} unidades restantes).`,
        why: `La demanda observada es de ${avgSales} pzas/día y el inventario actual solo cubre ${daysOfStock} días frente a un tiempo de entrega de ${leadTime} días de ${supplier.name}.`,
        rootCause: `Incremento de rotación reciente sin reorden preventiva programada ante el lead time del repartidor de ${supplier.name}.`,
        evidence: [
          { label: 'Stock Actual', value: `${prod.currentStock} pzas`, tag: 'OBSERVED' },
          { label: 'Venta Diaria Promedio', value: `${avgSales} pzas/día`, tag: 'OBSERVED' },
          { label: 'Cobertura de Días', value: `${daysOfStock} días`, tag: 'MODELLED' },
          { label: 'Tiempo de Entrega', value: `${leadTime} días`, tag: 'OBSERVED' },
        ],
        financialImpact: -estimatedLostRevenue,
        confidence: prod.avgDailySales > 3 ? 92 : 78,
        confidenceTag: 'ESTIMATED',
        risk: {
          headline: `Pérdida proyectada de $${estimatedLostRevenue} MXN por desabasto en mostrador`,
          financialImpact: -estimatedLostRevenue,
          urgencyLabel: daysUntilStockout < 1 ? 'URGENTE — Menos de 12 hrs' : 'Hoy antes de ruta',
          daysUntilImpact: daysUntilStockout,
          consequenceIfIgnored: `Se agotará en aproximadamente ${daysUntilStockout} días, perdiendo ${estimatedLostUnits} ventas a clientes y margen de mostrador.`,
        },
        opportunity: {
          headline: `Asegurar $${roundCurrency(suggestedQty * prod.salePrice)} de venta capturada`,
          financialGain: roundCurrency(suggestedQty * (prod.salePrice - prod.lastCostPaid)),
          marginImpactPercent: prod.marginPercent,
          roiOrSavingsDescription: `Resurtir ${suggestedQty} pzas garantiza ${roundCurrency(suggestedQty / avgSales)} días de venta sin faltantes.`,
        },
        action: {
          actionType: 'RESTOCK',
          label: `Pedir ${suggestedQty} pzas a ${supplier.name}`,
          buttonText: '1-Click Pedido a Proveedor',
          explanation: `Generar orden de compra matutina por ${suggestedQty} pzas a $${prod.lastCostPaid} c/u ($${roundCurrency(suggestedQty * prod.lastCostPaid)} total).`,
          payload: {
            suggestedQuantity: suggestedQty,
            supplierId: supplier.id,
            supplierName: supplier.name,
            unitCost: prod.lastCostPaid,
          },
          executionState: 'PENDING',
          requiresApproval: true,
        },
        groupKey: `reorder-route-${supplier.id}`,
        createdAt: 'Hoy 07:30 AM',
      });
    }
  });

  // B. Margin Squeeze Decisions (Cost Increase + Retail Price Unchanged)
  inventory.forEach((prod) => {
    const currentMarginPct = prod.salePrice > 0 
      ? roundCurrency(((prod.salePrice - prod.lastCostPaid) / prod.salePrice) * 100) 
      : 0;
    const targetMargin = 22.0;

    // Detect margin erosion: Margin is compressed below target or last cost is close to sale price
    if (currentMarginPct < targetMargin && prod.lastCostPaid > 0) {
      const suggestedPrice = Math.ceil(roundCurrency(prod.lastCostPaid / (1 - targetMargin / 100)));
      const marginGap = roundCurrency(targetMargin - currentMarginPct);
      const monthlyVolume = Math.round(prod.avgDailySales * 30);
      const monthlyLoss = roundCurrency((suggestedPrice - prod.salePrice) * monthlyVolume);

      decisions.push({
        id: `DEC-MRG-${prod.id}`,
        tenantId,
        organizationId: orgId,
        storeId,
        type: 'MARGIN_SQUEEZE',
        domain: 'PRICING',
        severity: currentMarginPct < 15 ? 'CRITICAL' : 'MEDIUM',
        priority: 2,
        productId: prod.id,
        productName: prod.name,
        category: prod.category,
        what: `Erosión de margen: Margen actual de ${currentMarginPct}% (debajo del ${targetMargin}% objetivo).`,
        why: `El costo de adquisición es de $${prod.lastCostPaid} frente a un precio de mostrador de $${prod.salePrice}, dejando una brecha de ${marginGap} puntos porcentuales.`,
        rootCause: `Incremento de costo mayorista no trasladado al precio de mostrador de la tienda.`,
        evidence: [
          { label: 'Último Costo Pagado', value: `$${prod.lastCostPaid}`, tag: 'OBSERVED' },
          { label: 'Precio Actual Mostrador', value: `$${prod.salePrice}`, tag: 'OBSERVED' },
          { label: 'Margen Bruto Actual', value: `${currentMarginPct}%`, tag: 'MODELLED' },
          { label: 'Margen Objetivo', value: `${targetMargin}%`, tag: 'OBSERVED' },
        ],
        financialImpact: -monthlyLoss,
        confidence: 95,
        confidenceTag: 'OBSERVED',
        risk: {
          headline: `Pérdida silenciosa de $${monthlyLoss} MXN al mes por margen comprimido`,
          financialImpact: -monthlyLoss,
          urgencyLabel: 'Antes de abrir cortina',
          consequenceIfIgnored: `Cada venta de ${prod.name} deja $${roundCurrency(suggestedPrice - prod.salePrice)} menos de ganancia por unidad.`,
        },
        opportunity: {
          headline: `Recuperar +$${monthlyLoss} MXN mensuales ajustando precio a $${suggestedPrice}`,
          financialGain: monthlyLoss,
          marginImpactPercent: targetMargin,
          roiOrSavingsDescription: `Actualizar a $${suggestedPrice} restaura el margen al ${targetMargin}% sin distorsión de mercado.`,
        },
        action: {
          actionType: 'PRICE_UPDATE',
          label: `Ajustar precio de mostrador a $${suggestedPrice}.00`,
          buttonText: '1-Click Actualizar Precio',
          explanation: `Sincronizar el nuevo precio de $${suggestedPrice} con el punto de venta y el lector de código de barras.`,
          payload: {
            suggestedPrice,
            targetMargin,
            unitCost: prod.lastCostPaid,
          },
          executionState: 'PENDING',
          requiresApproval: true,
        },
        groupKey: 'pricing-margin-adjustment',
        createdAt: 'Hoy 07:45 AM',
      });
    }
  });

  // C. Capital Trap / Dead Stock Decisions
  inventory.forEach((prod) => {
    if (prod.avgDailySales < 0.2 && prod.daysOfStock > 25 && prod.currentStock > 0) {
      const trappedCapital = roundCurrency(prod.currentStock * prod.lastCostPaid);
      const liquidationPrice = Math.floor(prod.salePrice * 0.85);
      const recoveredCapital = roundCurrency(prod.currentStock * liquidationPrice);

      decisions.push({
        id: `DEC-TRAP-${prod.id}`,
        tenantId,
        organizationId: orgId,
        storeId,
        type: 'CAPITAL_TRAP',
        domain: 'CASH_FLOW',
        severity: 'MEDIUM',
        priority: 4,
        productId: prod.id,
        productName: prod.name,
        category: prod.category,
        what: `Capital congelado en anaquel ($${trappedCapital} MXN inmovilizados).`,
        why: `Rotación nula (${prod.avgDailySales} ventas/día) y cobertura de ${prod.daysOfStock} días de inventario estancado.`,
        rootCause: `Producto con baja demanda local o sobrecompra pasada ocupando espacio y restando liquidez.`,
        evidence: [
          { label: 'Unidades Inmovilizadas', value: `${prod.currentStock} pzas`, tag: 'OBSERVED' },
          { label: 'Costo Unitario', value: `$${prod.lastCostPaid}`, tag: 'OBSERVED' },
          { label: 'Capital Atrapado', value: `$${trappedCapital}`, tag: 'MODELLED' },
          { label: 'Días sin Rotar', value: `${prod.daysOfStock} días`, tag: 'OBSERVED' },
        ],
        financialImpact: -trappedCapital,
        confidence: 88,
        confidenceTag: 'OBSERVED',
        risk: {
          headline: `Riesgo de merma o vencimiento con $${trappedCapital} MXN en anaquel`,
          financialImpact: -trappedCapital,
          urgencyLabel: 'Plan semanal',
          consequenceIfIgnored: `El producto continuará deteriorándose o expirando sin generar flujo de caja.`,
        },
        opportunity: {
          headline: `Liberar $${recoveredCapital} MXN de liquidez inmediata con remate de salida`,
          financialGain: recoveredCapital,
          roiOrSavingsDescription: `Oferta promocional a $${liquidationPrice} o combo para reinvertir en productos de alta rotación.`,
        },
        action: {
          actionType: 'CLEARANCE',
          label: `Activar precio de remate / combo a $${liquidationPrice}.00`,
          buttonText: '1-Click Activar Oferta',
          explanation: `Establecer etiqueta de oferta y sugerir combo en mostrador para acelerar la salida de las ${prod.currentStock} pzas.`,
          payload: {
            suggestedPrice: liquidationPrice,
            unitCost: prod.lastCostPaid,
          },
          executionState: 'PENDING',
          requiresApproval: true,
        },
        groupKey: 'capital-liquidation',
        createdAt: 'Hoy 08:00 AM',
      });
    }
  });

  // D. Supplier Arbitrage & Opportunity Integration
  opportunities.forEach((opp) => {
    const prod = inventory.find((p) => p.name === opp.productName || p.id === opp.productId);
    if (prod && (opp.categoryType === 'ahorros' || opp.categoryType === 'compras')) {
      const bestSupplierName = prod.bestSupplier || 'Mayorista Óptimo';
      const bestPrice = prod.bestAvailablePrice || opp.todayPrice;
      const currentCost = prod.lastCostPaid || opp.lastPrice;
      const savingsPerUnit = roundCurrency(Math.max(0, currentCost - bestPrice));
      const estimatedSavings = opp.estimatedSavings || roundCurrency(savingsPerUnit * (opp.suggestedPurchaseUnits || 12));
      const unitsToBuy = opp.suggestedPurchaseUnits || 12;

      decisions.push({
        id: `DEC-ARB-${opp.id}`,
        tenantId,
        organizationId: orgId,
        storeId,
        type: 'SUPPLIER_ARBITRAGE',
        domain: 'PROCUREMENT',
        severity: 'INFO',
        priority: 3,
        productId: prod.id,
        productName: prod.name,
        category: prod.category,
        what: `Arbitraje de proveedor: Ahorro de $${savingsPerUnit} por unidad disponible.`,
        why: `${bestSupplierName} ofrece el producto a $${bestPrice} vs $${currentCost} de tu proveedor habitual.`,
        rootCause: `Dispersión de precios en el mercado mayorista regional detectada por el comparador.`,
        evidence: [
          { label: 'Proveedor Habitual', value: `${prod.supplierDefault || 'Preventa'} ($${currentCost})`, tag: 'OBSERVED' },
          { label: 'Proveedor Óptimo', value: `${bestSupplierName} ($${bestPrice})`, tag: 'OBSERVED' },
          { label: 'Ahorro por Pieza', value: `$${savingsPerUnit}`, tag: 'OBSERVED' },
          { label: 'Ahorro Estimado Lote', value: `$${estimatedSavings}`, tag: 'ESTIMATED' },
        ],
        financialImpact: estimatedSavings,
        confidence: 96,
        confidenceTag: 'OBSERVED',
        risk: {
          headline: `Sobreprecio acumulado de $${estimatedSavings} si compras al proveedor habitual`,
          financialImpact: -estimatedSavings,
          urgencyLabel: 'Próximo surtido',
          consequenceIfIgnored: `Seguirás pagando un sobrecosto evitable de $${savingsPerUnit} por cada pieza surtida.`,
        },
        opportunity: {
          headline: `Ahorro neto de $${estimatedSavings} MXN en el próximo pedido`,
          financialGain: estimatedSavings,
          roiOrSavingsDescription: `Comprar el lote sugerido a ${bestSupplierName} captura $${estimatedSavings} directos a caja.`,
        },
        action: {
          actionType: 'SUPPLIER_SWITCH',
          label: `Comprar lote a ${bestSupplierName}`,
          buttonText: '1-Click Pedido Mayorista',
          explanation: `Emitir orden de compra para ${bestSupplierName} con entrega garantizada.`,
          payload: {
            suggestedQuantity: unitsToBuy,
            supplierName: bestSupplierName,
            unitCost: bestPrice,
          },
          executionState: 'PENDING',
          requiresApproval: true,
        },
        groupKey: 'supplier-arbitrage-deals',
        createdAt: 'Hoy 08:15 AM',
      });
    }
  });

  // E. Cost Variance Decisions (Receiving Validation)
  costVariances.forEach((variance) => {
    if (variance.status === 'PENDING_REVIEW') {
      decisions.push({
        id: `DEC-VAR-${variance.id}`,
        tenantId,
        organizationId: orgId,
        storeId,
        type: 'COST_VARIANCE',
        domain: 'QUALITY',
        severity: 'CRITICAL',
        priority: 1,
        productId: variance.productId,
        productName: variance.productName,
        what: `Discrepancia en factura de ${variance.supplierName}: +$${variance.varianceAmount} por unidad.`,
        why: `El costo pactado era de $${variance.pactedCost} pero la remisión llegó facturada a $${variance.invoiceCost} (${variance.variancePercent}% más alto).`,
        rootCause: `Cambio no notificado por el proveedor o error de facturación del repartidor.`,
        evidence: [
          { label: 'Costo Pactado', value: `$${variance.pactedCost}`, tag: 'OBSERVED' },
          { label: 'Costo Facturado', value: `$${variance.invoiceCost}`, tag: 'OBSERVED' },
          { label: 'Variación Unitaria', value: `+$${variance.varianceAmount}`, tag: 'OBSERVED' },
          { label: 'Impacto Total Factura', value: `$${variance.totalImpact}`, tag: 'MODELLED' },
        ],
        financialImpact: -variance.totalImpact,
        confidence: 100,
        confidenceTag: 'OBSERVED',
        risk: {
          headline: `Sobrecosto directo de $${variance.totalImpact} MXN en remisión ${variance.invoiceReference}`,
          financialImpact: -variance.totalImpact,
          urgencyLabel: 'En recepción',
          consequenceIfIgnored: `Si se acepta sin aclaración, el sobrecosto reduce directamente el margen de la tienda.`,
        },
        opportunity: {
          headline: `Aclarar o rechazar factura para proteger $${variance.totalImpact} MXN`,
          financialGain: variance.totalImpact,
          roiOrSavingsDescription: `Solicitar ajuste de nota de crédito o respetar el costo pactado de $${variance.pactedCost}.`,
        },
        action: {
          actionType: 'COST_VARIANCE_REVIEW',
          label: `Revisar remisión con repartidor de ${variance.supplierName}`,
          buttonText: 'Aclarar Discrepancia',
          explanation: `Contactar al proveedor para aplicar nota de crédito de $${variance.totalImpact} o renegociar.`,
          payload: {
            varianceAmount: variance.varianceAmount,
            invoiceCost: variance.invoiceCost,
            pactedCost: variance.pactedCost,
            supplierName: variance.supplierName,
          },
          executionState: 'PENDING',
          requiresApproval: true,
        },
        groupKey: 'receiving-variances',
        createdAt: 'Hoy 08:30 AM',
      });
    }
  });

  // 3. Sort Decisions by Priority & Severity
  decisions.sort((a, b) => a.priority - b.priority);

  // 4. Group Decisions by Root Cause
  const groupMap: Record<string, BrainDecisionNode[]> = {};
  decisions.forEach((d) => {
    const key = d.groupKey || 'general';
    if (!groupMap[key]) groupMap[key] = [];
    groupMap[key].push(d);
  });

  const groupedDecisions = Object.entries(groupMap).map(([groupKey, list]) => {
    let title = 'Decisiones Operativas';
    if (groupKey.startsWith('reorder-route')) {
      title = `Reabastecimiento por Ruta de Proveedor (${list[0]?.action.payload.supplierName || 'Preventa'})`;
    } else if (groupKey === 'pricing-margin-adjustment') {
      title = `Ajustes de Precio para Protección de Margen (${list.length} productos)`;
    } else if (groupKey === 'capital-liquidation') {
      title = `Liberación de Capital Congelado (${list.length} productos)`;
    } else if (groupKey === 'supplier-arbitrage-deals') {
      title = `Oportunidades de Arbitraje Mayorista (${list.length} ofertas)`;
    } else if (groupKey === 'receiving-variances') {
      title = `Discrepancias en Recepción de Facturas (${list.length} notas)`;
    }
    return {
      groupKey,
      title,
      count: list.length,
      decisions: list,
    };
  });

  // 5. Build Morning Brief (Fase 1: Apertura)
  const criticalRisks = decisions.filter((d) => d.severity === 'CRITICAL');
  const highRisks = decisions.filter((d) => d.severity === 'HIGH');
  const opportunitiesList = decisions.filter(
    (d) => d.type === 'SUPPLIER_ARBITRAGE' || d.type === 'VOLUME_DISCOUNT' || d.type === 'DEMAND_OPPORTUNITY'
  );
  const recommendedActions = decisions.filter(
    (d) => d.action.executionState === 'PENDING'
  );

  const urgentSupplierVisits = suppliers
    .filter((s) => s.visitSchedule.toLowerCase().includes('diario') || s.visitSchedule.toLowerCase().includes('hoy') || s.visitSchedule.toLowerCase().includes('lunes'))
    .slice(0, 3)
    .map((s) => ({
      supplierName: s.name,
      visitTime: s.visitSchedule,
      pendingOrderAmount: 850.0,
      contactPhone: s.phone,
    }));

  const morningBrief: MorningBrief = {
    storeStatus: criticalRisks.length > 0 ? 'CRITICAL_RISKS' : highRisks.length > 0 ? 'ATTENTION_NEEDED' : 'OPTIMAL',
    yesterdaySales: 8420.0,
    yesterdayMargin: 24.7,
    openingCash: 3850.0,
    dailyGoal: 6500.0,
    topDecisions: decisions.slice(0, 3),
    urgentSupplierVisits,
    priceAlertsCount: decisions.filter((d) => d.type === 'MARGIN_SQUEEZE').length,
    stockoutRisksCount: decisions.filter((d) => d.type === 'STOCKOUT_RISK').length,
    synthesis,
  };

  // 6. Build Tomorrow Plan (Fase 3: Cierre & Feedback Loop)
  const totalForecastDemand = demandAnalyses.reduce((acc, curr) => acc + curr.forecastNext7Days / 7, 0);
  const tomorrowPlan = {
    expectedDemandUnits: Math.round(totalForecastDemand),
    expectedSalesAmount: roundCurrency(totalForecastDemand * 32.5),
    criticalReorderItems: criticalRisks.slice(0, 4).map((r) => ({
      productId: r.productId || 'prod-x',
      name: r.productName || 'Producto',
      qty: r.action.payload.suggestedQuantity || 12,
      supplier: r.action.payload.supplierName || 'Preventa',
    })),
    expectedSupplierDeliveries: suppliers.slice(0, 2).map((s) => s.name),
  };

  // 7. Calculate Store Health Score (0 to 100)
  let healthScore = 100;
  healthScore -= criticalRisks.length * 12;
  healthScore -= highRisks.length * 5;
  healthScore -= costVariances.filter((v) => v.status === 'PENDING_REVIEW').length * 8;
  healthScore = Math.max(20, Math.min(100, healthScore));

  let storeHealthStatus: 'EXCELENTE' | 'ESTABLE' | 'ATENCION' | 'CRITICO' = 'EXCELENTE';
  if (healthScore < 50) storeHealthStatus = 'CRITICO';
  else if (healthScore < 75) storeHealthStatus = 'ATENCION';
  else if (healthScore < 90) storeHealthStatus = 'ESTABLE';

  const potentialSavingsAvailable = opportunities.reduce(
    (acc, opp) => acc + (opp.estimatedSavings || 0),
    0
  );
  const estimatedLostRevenue = decisions
    .filter((d) => d.type === 'STOCKOUT_RISK')
    .reduce((acc, d) => acc + Math.abs(d.financialImpact), 0);

  return {
    storeId,
    storeHealthScore: healthScore,
    storeHealthStatus,
    currentPhase,
    morningBrief,
    decisions,
    groupedDecisions,
    criticalRisks,
    highRisks,
    opportunities: opportunitiesList,
    recommendedActions,
    purchaseQueue,
    costVariances,
    reconciliationHistory,
    financialSummary: {
      todaySales: salesBrief.todaySales,
      todayGrossProfit: salesBrief.grossMargin,
      todayMarginPercent: salesBrief.marginPercent,
      estimatedLostRevenue: roundCurrency(estimatedLostRevenue),
      potentialSavingsAvailable: roundCurrency(potentialSavingsAvailable),
    },
    tomorrowPlan,
    generatedAt: 'Hoy ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Executes a Store Brain decision action and atomically updates the relevant domain state.
 */
export function executeBrainDecisionAction(params: {
  snapshot: StoreBrainSnapshot;
  decisionId: string;
  user: string;
  inventory: InventoryItem[];
  purchaseQueue: PurchaseQueueItem[];
  auditLogs: AuditLogEntry[];
  costVariances: ReceivingCostVariance[];
}): {
  updatedSnapshot: StoreBrainSnapshot;
  updatedInventory: InventoryItem[];
  updatedPurchaseQueue: PurchaseQueueItem[];
  updatedAuditLogs: AuditLogEntry[];
  updatedCostVariances: ReceivingCostVariance[];
  resultMessage: string;
} {
  const {
    snapshot,
    decisionId,
    user,
    inventory,
    purchaseQueue,
    auditLogs,
    costVariances,
  } = params;

  const decision = snapshot.decisions.find((d) => d.id === decisionId);
  if (!decision) {
    return {
      updatedSnapshot: snapshot,
      updatedInventory: inventory,
      updatedPurchaseQueue: purchaseQueue,
      updatedAuditLogs: auditLogs,
      updatedCostVariances: costVariances,
      resultMessage: 'Decisión no encontrada',
    };
  }

  let updatedInventory = [...inventory];
  let updatedPurchaseQueue = [...purchaseQueue];
  let updatedCostVariances = [...costVariances];
  let resultMessage = '';

  const timestamp = 'Hoy ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  // 1. Handle RESTOCK -> Enqueue to Purchase Queue
  if (decision.action.actionType === 'RESTOCK' || decision.action.actionType === 'SUPPLIER_SWITCH') {
    const qty = decision.action.payload.suggestedQuantity || 12;
    const unitCost = decision.action.payload.unitCost || 15.0;
    const prod = inventory.find((p) => p.id === decision.productId);

    const newQueueItem: PurchaseQueueItem = {
      id: `queue-${Date.now()}`,
      productId: decision.productId || 'prod-x',
      productName: decision.productName || 'Producto',
      barcode: prod?.barcode || '7501055301088',
      category: decision.category || 'Abarrotes',
      currentStock: prod?.currentStock || 0,
      suggestedQuantity: qty,
      supplierId: decision.action.payload.supplierId || 'supp-1',
      supplierName: decision.action.payload.supplierName || 'Preventa General',
      estimatedUnitCost: unitCost,
      estimatedTotalCost: roundCurrency(qty * unitCost),
      urgency: decision.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      source: 'DECISION_ENGINE',
      addedAt: timestamp,
      status: 'QUEUED',
    };

    updatedPurchaseQueue = [newQueueItem, ...updatedPurchaseQueue];
    resultMessage = `Pedido por ${qty} unidades de "${decision.productName}" agregado a la cola de compras para ${decision.action.payload.supplierName}.`;
  }

  // 2. Handle PRICE_UPDATE -> Update Inventory Item Sale Price
  else if (decision.action.actionType === 'PRICE_UPDATE' || decision.action.actionType === 'CLEARANCE') {
    const newPrice = decision.action.payload.suggestedPrice || 20.0;
    updatedInventory = updatedInventory.map((item) => {
      if (item.id === decision.productId) {
        const newMargin = roundCurrency(((newPrice - item.lastCostPaid) / newPrice) * 100);
        return {
          ...item,
          salePrice: newPrice,
          marginPercent: newMargin,
          lastUpdated: timestamp,
        };
      }
      return item;
    });
    resultMessage = `Precio de "${decision.productName}" actualizado a $${newPrice}.00 en mostrador y escáner.`;
  }

  // 3. Handle COST_VARIANCE_REVIEW -> Update Variance Status
  else if (decision.action.actionType === 'COST_VARIANCE_REVIEW') {
    updatedCostVariances = updatedCostVariances.map((v) => {
      if (v.productId === decision.productId) {
        return {
          ...v,
          status: 'ACCEPTED' as const,
          reviewedBy: user,
        };
      }
      return v;
    });
    resultMessage = `Discrepancia de costo revisada y registrada para auditoría con ${decision.action.payload.supplierName}.`;
  }

  // Update Decision Execution State
  const updatedDecisions = snapshot.decisions.map((d) => {
    if (d.id === decisionId) {
      return {
        ...d,
        action: {
          ...d.action,
          executionState: 'EXECUTED' as const,
          executedAt: timestamp,
          executedBy: user,
          executionResultDetail: resultMessage,
        },
      };
    }
    return d;
  });

  // Create Audit Log Entry
  const auditEntry: AuditLogEntry = {
    id: `aud-dec-${Date.now()}`,
    timestamp,
    who: user,
    actor: user,
    role: 'dueño_administrador',
    action: `decision_executed: ${decision.type}`,
    what: `Ejecución de acción de Store Brain: ${decision.action.label}`,
    target: decision.productName || decision.id,
    beforeValue: 'PENDING',
    afterValue: 'EXECUTED',
    motive: resultMessage,
    storeId: snapshot.storeId,
  };

  const updatedSnapshot: StoreBrainSnapshot = {
    ...snapshot,
    decisions: updatedDecisions,
    recommendedActions: updatedDecisions.filter((d) => d.action.executionState === 'PENDING'),
  };

  return {
    updatedSnapshot,
    updatedInventory,
    updatedPurchaseQueue,
    updatedAuditLogs: [auditEntry, ...auditLogs],
    updatedCostVariances,
    resultMessage,
  };
}

/**
 * Silent Operational Hook: Enqueues an out-of-stock signal directly from POS
 * into the Purchase Queue without interrupting or lagging cashier flow.
 */
export function enqueueScannerStockoutSignal(
  purchaseQueue: PurchaseQueueItem[],
  item: InventoryItem,
  source: 'SCANNER_OUT_OF_STOCK' | 'MANUAL' = 'SCANNER_OUT_OF_STOCK'
): PurchaseQueueItem[] {
  // Check if item is already queued
  const exists = purchaseQueue.some(
    (q) => q.productId === item.id && q.status === 'QUEUED'
  );
  if (exists) return purchaseQueue;

  const suggestedQty = Math.max(12, item.minStockAlert * 2);
  const queueItem: PurchaseQueueItem = {
    id: `queue-${Date.now()}-${item.id}`,
    productId: item.id,
    productName: item.name,
    barcode: item.barcode,
    category: item.category,
    currentStock: item.currentStock,
    suggestedQuantity: suggestedQty,
    supplierId: 'supp-default',
    supplierName: item.supplierDefault || item.bestSupplier || 'Repartidor Principal',
    estimatedUnitCost: item.lastCostPaid,
    estimatedTotalCost: roundCurrency(suggestedQty * item.lastCostPaid),
    urgency: 'CRITICAL',
    source,
    addedAt: 'Hoy ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    status: 'QUEUED',
  };

  return [queueItem, ...purchaseQueue];
}

/**
 * Reconciles the register for Closing (Fase 3: Cierre), checking Expected vs Actual cash,
 * computing daily gross profit, and returning the audit record.
 */
export function reconcileCashRegister(params: {
  sales: SaleTransaction[];
  actualCash: number;
  actualCard: number;
  actualSpei: number;
  cashierUser: string;
  notes?: string;
  storeId: string;
}): {
  reconciliationRecord: CashReconciliationRecord;
  auditLog: AuditLogEntry;
} {
  const {
    sales,
    actualCash,
    actualCard,
    actualSpei,
    cashierUser,
    notes,
    storeId,
  } = params;

  let expectedCash = 0;
  let expectedCard = 0;
  let expectedSpei = 0;
  let totalSales = 0;
  let totalCogs = 0;

  sales
    .filter((s) => s.status === 'COMPLETED')
    .forEach((s) => {
      totalSales = roundCurrency(totalSales + s.total);
      totalCogs = roundCurrency(totalCogs + s.totalCost);

      if (s.payment.method === 'efectivo') {
        expectedCash = roundCurrency(expectedCash + s.total);
      } else if (s.payment.method === 'tarjeta') {
        expectedCard = roundCurrency(expectedCard + s.total);
      } else if (s.payment.method === 'transferencia') {
        expectedSpei = roundCurrency(expectedSpei + s.total);
      }
    });

  const cashDiff = roundCurrency(actualCash - expectedCash);
  const cardDiff = roundCurrency(actualCard - expectedCard);
  const speiDiff = roundCurrency(actualSpei - expectedSpei);
  const totalDiff = Math.abs(cashDiff) + Math.abs(cardDiff) + Math.abs(speiDiff);

  const status: 'BALANCED' | 'DISCREPANCY_DETECTED' =
    totalDiff === 0 ? 'BALANCED' : 'DISCREPANCY_DETECTED';

  const grossProfit = roundCurrency(totalSales - totalCogs);
  const marginPercent = totalSales > 0 ? roundCurrency((grossProfit / totalSales) * 100) : 0;

  const timestamp = 'Hoy ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  const reconciliationRecord: CashReconciliationRecord = {
    date: '15 Feb 2026',
    expectedCash,
    actualCash,
    cashDifference: cashDiff,
    expectedCard,
    actualCard,
    cardDifference: cardDiff,
    expectedSpei,
    actualSpei,
    speiDifference: speiDiff,
    totalSales,
    totalCogs,
    grossProfit,
    marginPercent,
    status,
    notes,
    closedAt: timestamp,
    closedBy: cashierUser,
  };

  const auditLog: AuditLogEntry = {
    id: `aud-rec-${Date.now()}`,
    timestamp,
    who: cashierUser,
    actor: cashierUser,
    role: 'cajero_mostrador',
    action: `cash_reconciliation: ${status}`,
    what: `Arqueo de caja y cierre diario: ${status}`,
    target: 'CASH_REGISTER',
    beforeValue: 'OPEN',
    afterValue: 'CLOSED',
    motive: status === 'BALANCED' ? 'Arqueo de caja cuadrado sin diferencias' : `Diferencia de caja detectada: Efectivo $${cashDiff}, Tarjeta $${cardDiff}, SPEI $${speiDiff}`,
    storeId,
  };

  return {
    reconciliationRecord,
    auditLog,
  };
}
