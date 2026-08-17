export interface PriceOption {
  supplier: string;
  pricePerUnit: number;
  condition?: string;
  isBest?: boolean;
  notes?: string;
  minUnits?: number;
  deliveryTime?: string;
}

export interface ProductComparisonDemo {
  id: string;
  name: string;
  presentation: string;
  category: string;
  regularPrice: number;
  options: PriceOption[];
  bestPrice: number;
  potentialSavingsPerUnit: number;
  rotation: 'Alta' | 'Media' | 'Baja';
  currentStock: number;
  dailySales: number;
  recommendation: 'Comprar' | 'Comprar ahora' | 'Comprar menos' | 'Esperar' | 'Comparar proveedor' | 'Comprar con moderación';
  whyReason: string;
  actionSummary: string;
  recoveryDaysEstimate: number;
  estimatedMargin: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  badge?: string;
}

export interface TrialRegistrationData {
  ownerName: string;
  storeName: string;
  phone: string;
  postalCode: string;
  hasPos: string;
  currentPosName?: string;
}

export interface TenantStore {
  id: string;
  name: string;
  owner: string;
  zone: string;
  address: string;
  categories: string[];
}

export interface StoreProfile {
  id?: string;
  organizationId?: string;
  storeName: string;
  ownerName: string;
  name?: string;
  owner?: string;
  phone: string;
  zone: string;
  address?: string;
  posType?: 'pulpos' | 'otro_pos' | 'excel' | 'notas' | 'ninguno';
  posName?: string;
  posIntegrated?: boolean;
  hasBarcodeScanner?: boolean;
  onboardingCompleted?: boolean;
  activeSince?: string;
}

export type StockStatusType = 'CRÍTICO' | 'BAJO' | 'NORMAL' | 'SOBRESTOCK' | 'SIN MOVIMIENTO' | 'alerta_desabasto' | 'optimo' | 'sobrestock' | 'agotado';

export interface ProductMaster {
  id: string;
  barcode: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  presentation: string;
  unit: string;
  content: string;
  suggestedSalePrice: number;
  canonicalInfo: string;
  createdSource: 'manual' | 'scanner' | 'supplier' | 'scraper' | 'agent';
}

export interface InventoryItem {
  id: string;
  barcode: string;
  sku?: string;
  name: string;
  brand: string;
  presentation: string;
  category: 'Bebidas' | 'Lácteos' | 'Botanas' | 'Limpieza' | 'Abarrotes' | 'Panadería' | 'Higiene' | 'Dulcería';
  subcategory?: string;
  unit?: string;
  content?: string;
  currentStock: number;
  minStockAlert: number;
  maxStock?: number;
  reorderPoint?: number;
  lastCostPaid: number;
  bestAvailablePrice: number;
  bestSupplier: string;
  avgDailySales: number;
  rotation: 'Alta' | 'Media' | 'Baja';
  daysOfStock: number;
  stockStatus: StockStatusType;
  salePrice: number;
  marginPercent: number;
  options: PriceOption[];
  lastUpdated: string;
  lastPurchaseDate?: string;
  supplierDefault?: string;
}

export type MovementType = 'entrada' | 'venta' | 'ajuste' | 'merma' | 'devolucion' | 'transferencia' | 'correccion' | 'compra';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  type: MovementType;
  typeLabel: string;
  unitCost?: number;
  user: string;
  storeId: string;
  reference: string;
  motive: string;
  timestamp: string;
  date: string;
}

export interface SupplierEntity {
  id: string;
  name: string;
  category: string;
  contactName: string;
  phone: string;
  zone: string;
  visitSchedule: string;
  deliveryLeadDays: number;
  minOrderAmount: number;
  rating: number; // 1 to 5
  paymentTerms: string;
  reliabilityScore: number; // percentage
  catalogCount: number;
  notes?: string;
}

export interface PriceRecord {
  id: string;
  productId: string;
  productName: string;
  source: string;
  supplier: string;
  price: number;
  unit: string;
  presentation: string;
  availability: 'En stock' | 'Agotado' | 'Bajo pedido';
  confidenceScore: number;
  timestamp: string;
  deltaVsPrevious: number; // e.g. +1.5 or -0.8
  isAlert: boolean;
}

export interface ScraperJob {
  id: string;
  source: string;
  name: string;
  status: 'active' | 'running' | 'paused' | 'error';
  lastRun: string;
  nextRun: string;
  itemsFound: number;
  itemsProcessed: number;
  itemsRejected: number;
  durationSec: number;
  lastError?: string;
}

export interface ProductMatchItem {
  id: string;
  sourceText: string;
  matchedProductId: string;
  candidateName: string;
  candidateBrand: string;
  candidatePresentation: string;
  confidenceScore: number; // 0 - 100
  status: 'pending' | 'approved' | 'rejected';
  signals: string[];
  detectedVolume: string;
  detectedBrand: string;
  sourceOrigin: string;
}

export interface AIAgentContract {
  id: string;
  code: string;
  name: string;
  roleTitle: string;
  purpose: string;
  trigger: string;
  inputs: string[];
  tools: string[];
  permissions: string[];
  rules: string[];
  status: 'active' | 'running' | 'idle';
  lastExecuted: string;
  confidenceLevel: string;
  recentActions: {
    timestamp: string;
    action: string;
    result: string;
    impact: string;
  }[];
}

export interface DailyOpportunity {
  id: string;
  productId: string;
  productName: string;
  presentation: string;
  categoryType: 'ahorros' | 'compras' | 'margen' | 'riesgos' | 'inventario';
  badge: string;
  badgeType: 'urgent' | 'positive' | 'warning' | 'info';
  rotation: string;
  stockAlert: string;
  lastPrice: number;
  todayPrice: number;
  salesVelocity: string;
  stockCoverage: string;
  suggestedPurchaseUnits: number;
  suggestedPackage: string;
  estimatedSavings: number;
  what: string;
  whyBreakdown: {
    found: string;
    context: string;
    recommendation: string;
  };
  recommendationAction: 'Comprar' | 'Esperar' | 'Comprar menos' | 'Comparar proveedor' | 'Ajustar precio';
  status: 'pending' | 'applied' | 'dismissed';
}

export interface DecisionRecord {
  id: string;
  date: string;
  productName: string;
  action: string;
  supplier: string;
  units: number;
  savingsGenerated: number;
  timestamp: string;
}

export interface PromoCalculationResult {
  promoType: string;
  rawInputSummary: string;
  totalCostToPay: number;
  unitsReceived: number;
  realCostPerUnit: number;
  alternativeSupplierCost: number;
  differencePerUnit: number;
  totalSavingsOrLoss: number;
  verdict: 'excelente' | 'trampa' | 'evaluar_rotacion' | 'regular';
  verdictTitle: string;
  explanation: string;
  rotationWarning?: string;
}

export interface SmartPurchaseItem {
  productId: string;
  productName: string;
  presentation: string;
  category: string;
  currentStock: number;
  avgDailySales: number;
  daysRemaining: number;
  suggestedUnits: number;
  suggestedPackage: string;
  bestSupplier: string;
  unitPrice: number;
  totalInvestment: number;
  potentialSavings: number;
  priority: 'CRÍTICA' | 'SUGERIDA' | 'OPCIONAL';
  reason: string;
  selected: boolean;
}

export type AlertLevel = 'CRÍTICO' | 'ALTO' | 'MEDIO' | 'INFORMATIVO';
export type AlertPriorityLevel = AlertLevel;

export interface SmartAlert {
  id: string;
  level: AlertLevel;
  category: 'stock' | 'precio' | 'margen' | 'proveedor' | 'calidad' | 'oportunidad';
  title: string;
  message: string;
  productId?: string;
  productName?: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'dismissed';
  actionLabel?: string;
  actionTargetTab?: string;
}

export interface AuditLogEntry {
  id: string;
  actor?: string;
  action?: string;
  detail?: string;
  result?: string;
  date?: string;
  who?: string;
  role?: string;
  what?: string;
  target?: string;
  beforeValue?: string;
  afterValue?: string;
  motive?: string;
  timestamp: string;
  storeId: string;
}

export interface DataQualityReport {
  id: string;
  type: 'barcode_invalido' | 'precio_atipico' | 'margen_negativo' | 'sin_costo' | 'duplicado_potencial';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedItem: string;
  suggestedFix: string;
  status: 'pending' | 'resolved';
}

// ─────────────────────────────────────────────────────────────
// HILO 5: SALES ENGINE, POS & DEMAND INTELLIGENCE TYPES
// ─────────────────────────────────────────────────────────────

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';

export interface PaymentRecord {
  method: PaymentMethod;
  amount: number;
  cashReceived?: number;
  change?: number;
  reference?: string; // Terminal approval or SPEI tracking code
  status: 'completed' | 'pending' | 'failed';
}

export type SaleStatus = 'DRAFT' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface SaleItem {
  productId: string;
  barcode: string;
  productName: string;
  presentation: string;
  category: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discount: number;
  discountMotive?: string;
  subtotal: number;
  total: number;
  grossMargin: number;
  marginPercent: number;
}

export interface SaleTransaction {
  id: string; // e.g. "VTA-2026-0815-0042"
  idempotencyKey: string;
  ticketNumber: number;
  storeId: string;
  cashierName: string;
  timestamp: string;
  date: string;
  items: SaleItem[];
  itemCount: number;
  totalUnits: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
  totalCost: number;
  totalGrossMargin: number;
  marginPercent: number;
  payment: PaymentRecord;
  status: SaleStatus;
  cancellationMotive?: string;
  refundAmount?: number;
  refundTimestamp?: string;
  refundReason?: string;
  customerNote?: string;
}

export type ProductPerformanceBadge = 
  | 'STAR' 
  | 'CASH_COW' 
  | 'LOW_MARGIN' 
  | 'SLOW_MOVING' 
  | 'DEAD_STOCK' 
  | 'OPPORTUNITY';

export interface ProductDemandAnalysis {
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  avgDailySales: number;
  weeklySales: number;
  monthlySales: number;
  observedSales: number;
  estimatedLostSales: number; // units lost due to out of stock
  estimatedLostRevenue: number; // $ lost
  performanceClass: ProductPerformanceBadge;
  performanceClassTitle: string;
  demandTrend: 'creciente' | 'decreciente' | 'estable' | 'volatil';
  trendPercentage: number; // e.g. +18.5%
  forecastNext7Days: number; // predicted units
  forecastConfidence: number; // e.g. 84%
  currentMarginPercent: number;
  targetMarginPercent: number;
  suggestedSalePrice?: number;
  priceRecommendationReason?: string;
  daysOutOfStockLast30Days: number;
}

export interface DailySalesBrief {
  todaySales: number;
  todayTickets: number;
  avgTicket: number;
  todayUnits: number;
  grossMargin: number;
  marginPercent: number;
  topStarProduct: string;
  riskProduct: string;
  demandOpportunity: string;
  hourlySales: { hour: string; amount: number; tickets: number }[];
}

export interface HeldCart {
  id: string;
  timestamp: string;
  customerLabel: string;
  items: SaleItem[];
  subtotal: number;
  total: number;
}

// ─────────────────────────────────────────────────────────────
// HILO 6.1: STORE BRAIN & DAILY OPERATING SYSTEM TYPES
// ─────────────────────────────────────────────────────────────

export type DataQualityTag = 'OBSERVED' | 'MODELLED' | 'ESTIMATED' | 'INSUFFICIENT DATA' | 'UNKNOWN';

export type DecisionDomain = 'INVENTORY' | 'PRICING' | 'PROCUREMENT' | 'CASH_FLOW' | 'QUALITY';

export type DecisionSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';

export type DecisionType = 
  | 'STOCKOUT_RISK' 
  | 'MARGIN_SQUEEZE' 
  | 'CAPITAL_TRAP' 
  | 'SUPPLIER_ARBITRAGE' 
  | 'COST_VARIANCE' 
  | 'VOLUME_DISCOUNT' 
  | 'DEMAND_OPPORTUNITY';

export type DecisionActionType = 
  | 'RESTOCK' 
  | 'PRICE_UPDATE' 
  | 'CLEARANCE' 
  | 'BUNDLE' 
  | 'RETURN_TO_SUPPLIER' 
  | 'SUPPLIER_SWITCH' 
  | 'COST_VARIANCE_REVIEW';

export type DecisionActionExecutionState = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'DISMISSED';

export interface DecisionEvidence {
  label: string;
  value: string | number;
  tag: DataQualityTag;
}

export interface BrainDecisionNode {
  id: string;
  tenantId: string;
  organizationId: string;
  storeId: string;
  type: DecisionType;
  domain: DecisionDomain;
  severity: DecisionSeverity;
  priority: number; // 1 (highest) to 10
  productId?: string;
  productName?: string;
  category?: string;
  what: string; // Symptom
  why: string; // Direct Explanation
  rootCause: string; // Underlying root cause
  evidence: DecisionEvidence[];
  financialImpact: number; // $ MXN (+ gain / - loss)
  confidence: number; // 0 to 100%
  confidenceTag: DataQualityTag;
  
  // 1. Proyección: RIESGO ("Evita perder")
  risk: {
    headline: string;
    financialImpact: number;
    urgencyLabel: string;
    daysUntilImpact?: number;
    consequenceIfIgnored: string;
  };

  // 2. Proyección: OPORTUNIDAD ("Ahorra / Gana")
  opportunity: {
    headline: string;
    financialGain: number;
    marginImpactPercent?: number;
    roiOrSavingsDescription: string;
  };

  // 3. Proyección: ACCIÓN ("Haz esto")
  action: {
    actionType: DecisionActionType;
    label: string;
    buttonText: string;
    explanation: string;
    payload: {
      suggestedQuantity?: number;
      suggestedPrice?: number;
      supplierId?: string;
      supplierName?: string;
      unitCost?: number;
      varianceAmount?: number;
      invoiceCost?: number;
      pactedCost?: number;
      targetMargin?: number;
    };
    executionState: DecisionActionExecutionState;
    executedAt?: string;
    executedBy?: string;
    executionResultDetail?: string;
    requiresApproval: boolean;
  };

  groupKey?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface PurchaseQueueItem {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  category: string;
  currentStock: number;
  suggestedQuantity: number;
  supplierId: string;
  supplierName: string;
  estimatedUnitCost: number;
  estimatedTotalCost: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  source: 'SCANNER_OUT_OF_STOCK' | 'DECISION_ENGINE' | 'MANUAL' | 'FORECAST';
  addedAt: string;
  status: 'QUEUED' | 'ORDERED' | 'DISMISSED';
}

export interface ReceivingCostVariance {
  id: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  pactedCost: number;
  invoiceCost: number;
  varianceAmount: number;
  variancePercent: number;
  quantity: number;
  totalImpact: number;
  status: 'PENDING_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'PRICE_ADJUSTED';
  invoiceReference: string;
  receivedDate: string;
  reviewedBy?: string;
}

export type DailyOperatingPhase = 'APERTURA' | 'OPERACION' | 'CIERRE';

export interface CashReconciliationRecord {
  date: string;
  expectedCash: number;
  actualCash: number;
  cashDifference: number;
  expectedCard: number;
  actualCard: number;
  cardDifference: number;
  expectedSpei: number;
  actualSpei: number;
  speiDifference: number;
  totalSales: number;
  totalCogs: number;
  grossProfit: number;
  marginPercent: number;
  status: 'BALANCED' | 'DISCREPANCY_DETECTED';
  notes?: string;
  closedAt: string;
  closedBy: string;
}

export interface MorningBrief {
  storeStatus: 'OPTIMAL' | 'ATTENTION_NEEDED' | 'CRITICAL_RISKS';
  yesterdaySales: number;
  yesterdayMargin: number;
  openingCash: number;
  dailyGoal: number;
  topDecisions: BrainDecisionNode[];
  urgentSupplierVisits: {
    supplierName: string;
    visitTime: string;
    pendingOrderAmount: number;
    contactPhone: string;
  }[];
  priceAlertsCount: number;
  stockoutRisksCount: number;
  synthesis?: string;
}

export interface StoreBrainSnapshot {
  storeId: string;
  storeHealthScore: number;
  storeHealthStatus: 'EXCELENTE' | 'ESTABLE' | 'ATENCION' | 'CRITICO';
  currentPhase: DailyOperatingPhase;
  morningBrief: MorningBrief;
  decisions: BrainDecisionNode[];
  groupedDecisions: {
    groupKey: string;
    title: string;
    count: number;
    decisions: BrainDecisionNode[];
  }[];
  criticalRisks: BrainDecisionNode[];
  highRisks: BrainDecisionNode[];
  opportunities: BrainDecisionNode[];
  recommendedActions: BrainDecisionNode[];
  purchaseQueue: PurchaseQueueItem[];
  costVariances: ReceivingCostVariance[];
  reconciliationHistory: CashReconciliationRecord[];
  financialSummary: {
    todaySales: number;
    todayGrossProfit: number;
    todayMarginPercent: number;
    estimatedLostRevenue: number;
    potentialSavingsAvailable: number;
  };
  tomorrowPlan: {
    expectedDemandUnits: number;
    expectedSalesAmount: number;
    criticalReorderItems: {
      productId: string;
      name: string;
      qty: number;
      supplier: string;
    }[];
    expectedSupplierDeliveries: string[];
  };
  generatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// WORKFLOWS & MULTI-AGENT ORCHESTRATION TYPES
// ─────────────────────────────────────────────────────────────

export interface WorkflowStageItem {
  id: string;
  name: string;
  agentId: string;
  agentName: string;
  order: number;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  durationMs?: number;
  outputSummary?: string;
  evidenceId?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface WorkflowItem {
  id: string;
  code: string;
  name: string;
  category: 'OPERATIONS' | 'PROCUREMENT' | 'PRICING' | 'DATA_QUALITY' | 'INTELLIGENCE';
  description: string;
  triggerType: 'SCHEDULED' | 'MANUAL' | 'EVENT_DRIVEN' | 'CRITICAL_CONDITION';
  cronSchedule?: string;
  estimatedDuration: string;
  estimatedSavingsPotential: string;
  targetTenants: string;
  status: 'READY' | 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';
  lastRunAt?: string;
  lastSuccessAt?: string;
  stages: WorkflowStageItem[];
  requiredPermissions: string[];
  autoApprovalThreshold: number;
}

export interface WorkflowExecutionRunItem {
  runId: string;
  workflowId: string;
  workflowName: string;
  startedAt: string;
  finishedAt?: string;
  durationMs: number;
  status: 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';
  triggeredBy: string;
  stages: WorkflowStageItem[];
  summary: {
    stagesTotal: number;
    stagesCompleted: number;
    observationsGenerated: number;
    findingsGenerated: number;
    opportunitiesCreated: number;
    financialImpact: number;
  };
  executiveBrief?: string;
  logs: string[];
  error?: string;
}

// ----------------------------------------------------
// CRM & CUSTOMER / BUSINESS RELATION ENTITIES (FRONTEND)
// ----------------------------------------------------
export type CustomerType = 'TIENDA_ABARROTES' | 'MINISUPER' | 'RESTAURANTE' | 'MAYORISTA' | 'DISTRIBUIDOR' | 'FRUTERIA';
export type CustomerStatus = 'ACTIVO' | 'EN_RIESGO' | 'INACTIVO' | 'PROSPECTO';
export type CustomerSegment = 'TIER_A' | 'TIER_B' | 'TIER_C' | 'ENTERPRISE';

export interface CrmCustomer {
  id: string;
  tenantId: string;
  name: string;
  businessName: string;
  type: CustomerType;
  status: CustomerStatus;
  segment: CustomerSegment;
  phone: string;
  email: string;
  address: string;
  city: string;
  zone: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  monthlySales: number;
  avgTicket: number;
  purchaseFrequencyDays: number;
  monitoredSkus: number;
  grossMarginPercent: number;
  churnRiskScore: number;
  lastPurchaseDate: string;
  daysSinceLastPurchase: number;
  estimatedLTV: number;
  notes?: string;
  tags?: string[];
}

export type ContactRole = 'PROPIETARIO' | 'ADMINISTRADOR' | 'ENCARGADO_COMPRAS' | 'CAJERO_LIDER' | 'CONTADOR' | 'OPERADOR';

export interface CrmContact {
  id: string;
  customerId: string;
  tenantId: string;
  name: string;
  role: ContactRole;
  phone: string;
  email: string;
  isPrimary: boolean;
  status: 'ACTIVO' | 'INACTIVO';
  preferences?: string;
  lastInteractionAt: string;
  assignedTo: string;
  notes?: string;
  createdAt: string;
}

export type OpportunityStage = 'NUEVO' | 'CONTACTADO' | 'CALIFICADO' | 'PROPUESTA' | 'NEGOCIACION' | 'GANADO' | 'PERDIDO';
export type OpportunitySource = 'AI_INVENTORY_AGENT' | 'AI_PRICE_MONITOR' | 'MANUAL_OPERATOR' | 'REORDER_SIGNAL' | 'STORE_BRAIN';

export interface CrmDealOpportunity {
  id: string;
  customerId: string;
  tenantId: string;
  customerName: string;
  title: string;
  stage: OpportunityStage;
  value: number;
  estimatedSavings: number;
  probability: number;
  expectedCloseDate: string;
  source: OpportunitySource;
  assignedTo: string;
  notes?: string;
  nextAction?: string;
  nextActionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'LLAMADA' | 'EMAIL' | 'WHATSAPP' | 'VISITA' | 'REUNION' | 'SEGUIMIENTO' | 'TAREA' | 'NOTA' | 'INCIDENTE' | 'AI_EVENT';

export interface CrmActivity {
  id: string;
  customerId: string;
  tenantId: string;
  opportunityId?: string;
  type: ActivityType;
  title: string;
  description: string;
  performedBy: string;
  outcome?: string;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
}

export type TaskPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type TaskStatus = 'PENDIENTE' | 'HOY' | 'COMPLETADA' | 'CANCELADA';

export interface CrmTask {
  id: string;
  customerId: string;
  tenantId: string;
  customerName: string;
  opportunityId?: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  source: 'AI_AUTONOMOUS' | 'MANUAL_OPERATOR';
  completedAt?: string;
  createdAt: string;
}

export interface CrmSupplierPartner {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  categories: string[];
  coverage: string;
  commercialTerms: string;
  leadTimeDays: number;
  minOrderAmount: number;
  creditDays: number;
  reliabilityScore: number;
  lastQuoteAt: string;
  score: number;
  activePromosCount: number;
}

export interface CrmAiInsight {
  id: string;
  customerId: string;
  tenantId: string;
  customerName: string;
  type: 'CHURN_RISK' | 'REORDER_ALERT' | 'MARGIN_LEAKAGE' | 'SUPPLIER_SWITCH' | 'UNNOTICED_PRICE_HIKE';
  severity: 'CRITICO' | 'ALERTA' | 'OPORTUNIDAD' | 'INFO';
  title: string;
  description: string;
  estimatedImpact: number;
  suggestedAction: string;
  confidence: number;
  generatedAt: string;
  dismissed: boolean;
}

export interface Customer360View {
  customer: CrmCustomer;
  contacts: CrmContact[];
  opportunities: CrmDealOpportunity[];
  activities: CrmActivity[];
  tasks: CrmTask[];
  aiInsights: CrmAiInsight[];
  recentPurchases: any[];
  inventoryHealth: {
    totalSkus: number;
    criticalSkus: number;
    stockValue: number;
    daysOfInventory: number;
  };
  auditLogs: any[];
}



