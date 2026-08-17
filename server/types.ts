export type SourceStatus = 'active' | 'degraded' | 'blocked' | 'maintenance' | 'disabled';
export type CrawlFrequency = 'DAILY' | 'TWICE_DAILY' | 'WEEKLY' | 'ON_DEMAND';
export type QualityStatus = 'VALID' | 'ANOMALY' | 'REVIEW' | 'REJECTED';
export type PriceType = 'PIECE' | 'CASE' | 'BULK' | 'WHOLESALE_TIER';
export type RunStatus = 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'CANCELLED';
export type MatchStatus = 'AUTO_MATCH' | 'HIGH_CONFIDENCE' | 'REVIEW' | 'UNMATCHED';
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
export type RecoveryState = 'ACTIVE' | 'DEGRADED' | 'BLOCKED' | 'RECOVERY_PENDING' | 'RECOVERING';

export interface SupplierSource {
  id: string;
  supplierId: string;
  name: string;
  officialDomain: string;
  sourceUrl: string;
  canonicalUrl: string;
  sourceType: 'ECOMMERCE' | 'WHOLESALE_CATALOG' | 'VTEX_API' | 'SHOPIFY_API' | 'OCR_FOLLETO';
  country: string;
  state: string;
  city: string;
  marketRegion: 'CDMX_METRO' | 'CENTRAL_ABASTOS' | 'ORIENTE' | 'PONIENTE' | 'NACIONAL';
  geographicCoverage: 'CDMX_ONLY' | 'CDMX_METRO' | 'NATIONAL';
  catalogAvailability: boolean;
  priceAvailability: boolean;
  enabled: boolean;
  priority: number;
  adapter: string;
  crawlFrequency: CrawlFrequency;
  robotsStatus: 'ALLOWED' | 'RESTRICTED' | 'DISALLOW_ALL';
  sitemapStatus: 'FOUND' | 'NOT_FOUND';
  lastSuccessfulRun?: string;
  lastFailedRun?: string;
  lastVerifiedAt: string;
  healthScore: number; // 0 - 100
  termsStatus: 'PUBLIC_ACCESSIBLE';
  accessStatus: 'ACTIVE' | 'DEGRADED' | 'BLOCKED' | 'MAINTENANCE';
  recoveryState: RecoveryState; // Added RecoveryState for 20.9.4
  circuitState?: CircuitState;
  consecutiveSuccesses?: number;
  consecutiveFailures?: number;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  lastErrorReason?: string;
  responseTimeMs?: number;
  extractedProductsRatio?: number;
  validPricesRatio?: number;
  cooldownUntil?: string;
  nextRetryAt?: string;
  retryCount?: number;
  recoveryAttempts?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryAttempt {
  id: string;
  sourceId: string;
  attemptNumber: number;
  startedAt: string;
  finishedAt: string;
  previousHealth: number;
  previousState: string;
  errorCode: string;
  strategy: string;
  result: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  responseStatus?: number;
  durationMs: number;
  productsFound: number;
  pricesFound: number;
  nextRetryAt?: string;
  notes?: string;
}

export interface SupplierBranch {
  id: string;
  supplierId: string;
  branchId: string;
  name: string;
  street: string;
  number?: string;
  neighborhood: string;
  municipality: string; // Alcaldía
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  sourceUrl: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  coverageArea: string[];
  lastVerifiedAt: string;
  status: 'ACTIVE' | 'TEMPORARILY_CLOSED';
}

export interface DiscoveredUrl {
  id: string;
  sourceId: string;
  url: string;
  urlType: 'PRODUCT' | 'CATEGORY' | 'SITEMAP' | 'OTHER';
  discoveredAt: string;
  lastFetchedAt?: string;
  status: 'PENDING' | 'FETCHED' | 'FAILED' | 'BLOCKED_BY_ROBOTS';
  contentHash?: string;
}

export interface SupplierOffer {
  id: string;
  masterProductId: string;
  supplierId: string;
  supplierName: string;
  branchId?: string;
  price: number;
  currency: string;
  priceType: PriceType;
  packSize: number;
  observedAt: string;
  sourceUrl: string;
  availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN';
}

export type ProcessingStatus = 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'REJECTED' | 'REVIEW_REQUIRED' | 'FAILED';

export interface RawProductObservation {
  id: string;
  sourceRecordId: string; // Key principal para Idempotencia
  sourceId: string;
  sourceName: string;
  supplierId: string;
  scraperRunId: string;
  observedAt: string;

  productNameRaw: string;
  brandRaw?: string;
  categoryRaw?: string;
  descriptionRaw?: string;
  presentationRaw?: string;

  eanRaw?: string;
  gtinRaw?: string;
  skuRaw?: string;
  supplierSkuRaw?: string;

  priceRaw: number;
  currencyRaw: string;
  availabilityRaw: string;
  promotionRaw?: string;

  productUrl?: string;
  imageUrl?: string;

  httpStatus: number;
  extractionStatus: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  parserVersion: string;

  dataQualityStatus: 'OBSERVED' | 'STALE' | 'VALID' | 'REVIEW' | 'REJECTED';
  processingStatus: ProcessingStatus;
  processedAt?: string;
  metadata?: Record<string, any>;
}

export interface RawObservationZapierPayload {
  sourceRecordId: string;
  sourceId: string;
  supplierId: string;
  scraperRunId: string;
  observedAt: string;

  productNameRaw: string;
  brandRaw?: string;
  categoryRaw?: string;
  presentationRaw?: string;

  eanRaw?: string;
  gtinRaw?: string;
  skuRaw?: string;

  priceRaw: number;
  currencyRaw: string;
  availabilityRaw: string;
  promotionRaw?: string;

  productUrl?: string;
  imageUrl?: string;

  httpStatus: number;
  extractionStatus: string;
  parserVersion: string;
}

export interface RawIngestionResult {
  sourceRecordId: string;
  action: 'NEW' | 'ALREADY_PROCESSED' | 'RETRY' | 'REVIEW_REQUIRED' | 'REJECTED';
  processingStatus: ProcessingStatus;
  rawProductObservation: RawProductObservation;
  zapierPayload?: RawObservationZapierPayload;
  message: string;
}

export interface RawObservation {
  id: string;
  tenantId: string;
  organizationId: string;
  supplierId: string;
  sourceId: string;
  sourceUrl: string;
  canonicalUrl: string;
  retrievedAt: string;
  httpStatus: number;
  rawName: string;
  rawBrand?: string;
  rawSku?: string;
  rawBarcode?: string;
  rawPrice: string;
  rawUnit?: string;
  rawCategory?: string;
  rawPayload: Record<string, any>;
  contentHash: string;
  observationHash: string;
  parserVersion: string;
  acquisitionRunId: string;
  dataQualityStatus: QualityStatus;
}

export interface MasterProduct {
  id: string;
  canonicalName: string;
  brand: string;
  category: string;
  subcategory?: string;
  barcode?: string;
  sku?: string;
  presentation: string;
  unit: string;
  packSize: number;
  avgRetailPriceCdmx: number;
  cheapestWholesaleCost: number;
  cheapestSupplierId: string;
  active: boolean;
  lastUpdated: string;
}

export interface PriceRecord {
  id: string;
  tenantId: string;
  organizationId: string;
  supplierId: string;
  supplierName: string;
  sourceId: string;
  masterProductId: string;
  productName: string;
  rawObservationId: string;
  price: number;
  previousPrice?: number;
  changePercent?: number;
  currency: 'MXN';
  unit: string;
  presentation: string;
  packSize: number;
  priceType: PriceType;
  availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LIMITED';
  sourceUrl: string;
  observedAt: string;
  validFrom: string;
  validTo?: string;
  confidence: number;
  status: 'ACTIVE' | 'SUPERSEDED' | 'REJECTED' | 'REVIEW';
  provenance: {
    sourceUrl: string;
    adapter: string;
    runId: string;
    capturedAt: string;
  };
}

export interface PriceHistoryPoint {
  id: string;
  masterProductId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  price: number;
  observedAt: string;
  sourceUrl: string;
  runId: string;
}

export interface ScraperRun {
  id: string;
  supplierId: string;
  sourceId: string;
  sourceName: string;
  startedAt: string;
  completedAt?: string;
  status: RunStatus;
  pagesVisited: number;
  productsDiscovered: number;
  productsParsed: number;
  productsAccepted: number;
  productsRejected: number;
  productsMatched: number;
  productsUnmatched: number;
  priceChanges: number;
  errors: string[];
  warnings: string[];
  durationMs: number;
  workerVersion: string;
  logs: string[];
}

export interface ArbitrageOpportunity {
  id: string;
  masterProductId: string;
  productName: string;
  barcode?: string;
  category: string;
  presentation: string;
  currentSupplierCost: number;
  currentSupplierName: string;
  bestSupplierPrice: number;
  bestSupplierName: string;
  bestSupplierSourceUrl: string;
  potentialSavingPerUnit: number;
  potentialSavingPercent: number;
  suggestedPurchaseUnits: number;
  totalPotentialSaving: number;
  confidence: number;
  cdmxCoverageVerified: boolean;
  actionRequired: string;
  detectedAt: string;
}

export type MovementType = 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN' | 'TRANSFER' | 'DAMAGE' | 'LOSS' | 'INITIAL_STOCK';

export interface LedgerMovement {
  id: string;
  tenantId: string;
  storeId: string;
  productId: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  resultingStock: number;
  referenceId: string; // Idempotency/Transaction ref
  requestId: string; // Idempotency key
  actorId: string;
  reason: string;
  createdAt: string; // Firestore Timestamp
}

export interface InventoryItem {
  id: string; // productId
  tenantId: string;
  storeId: string;
  masterProductId: string;
  stock: number;
  quantity?: number; // For compatibility with existing codebase
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  unitCost: number;
  retailPrice: number;
  targetMargin: number;
  supplierLeadTimeDays: number;
  averageDailySales: number;
  lastUpdated: string;
  createdAt?: string;
}

export interface SalesRecord {
  id: string;
  tenantId: string;
  storeId: string;
  masterProductId: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  total: number;
  timestamp: string;
}

export interface DecisionEvidence {
  type: 'PRICE_OBSERVATION' | 'INVENTORY_LEVEL' | 'SALES_VELOCITY' | 'SUPPLIER_OFFER' | 'COST_CHANGE';
  value: any;
  label: string;
  source?: string;
  sourceUrl?: string;
  timestamp: string;
}

export interface DecisionRecord {
  id: string;
  tenantId: string;
  organizationId: string;
  storeId: string;
  type: 'STOCKOUT_RISK' | 'MARGIN_SQUEEZE' | 'DEAD_STOCK' | 'SUPPLIER_ARBITRAGE' | 'VOLUME_OPPORTUNITY' | 'COST_VARIANCE' | 'PRICE_OPPORTUNITY';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'IGNORED' | 'SUPERSEDED';
  what: string;
  why: string;
  rootCause: string;
  evidence: DecisionEvidence[];
  dataQuality: 'VALID' | 'REVIEW' | 'STALE';
  financialImpact: number; // Positive = savings/revenue, Negative = loss/risk
  estimatedSavings: number;
  estimatedLostRevenue: number;
  estimatedMarginImpact: number;
  confidence: number;
  createdAt: string;
  expiresAt: string;
  consequenceIfIgnored: string;
  recommendedAction: string;
  actionType: 'CREATE_PURCHASE_ORDER' | 'UPDATE_PRICE' | 'CREATE_PROMOTION' | 'REVIEW_INVENTORY' | 'CHANGE_SUPPLIER';
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  executedAt?: string;
  result?: string;
  resultFinancialImpact?: number;
  auditId?: string;
  relatedMasterProductId?: string;
}

export interface SharedObservation {
  observationId: string;
  tenantId: string;
  storeId: string;
  productId?: string;
  observationType: 'PRICE' | 'INVENTORY' | 'SALES_VELOCITY' | 'MARGIN' | 'SUPPLIER' | 'AVAILABILITY' | 'DEMAND' | 'PRODUCT' | 'TREND' | 'ANOMALY' | 'RISK';
  source: string;
  sourceReference: string;
  observedAt: string;
  freshness: string | number;
  confidence: number;
  evidenceId: string;
  agentId: string;
  createdAt: string;
}

export interface AgentFinding {
  findingId: string;
  agentId: string;
  tenantId: string;
  storeId: string;
  findingType: string;
  finding: string;
  evidenceReferences: string[];
  confidence: number;
  freshness: string | number;
  financialImpact: number;
  createdAt: string;
}

export interface Opportunity {
  opportunityId: string;
  tenantId: string;
  storeId: string;
  productId?: string;
  type: string;
  title: string;
  description: string;
  financialImpact: number;
  confidence: number;
  urgency: number;
  freshness: string;
  evidenceReferences: string[];
  recommendedAction: string;
  status: 'PROPOSED' | 'REVIEW' | 'APPROVED' | 'REJECTED' | 'SNOOZED' | 'EXECUTED' | 'COMPLETED' | 'EXPIRED';
  createdAt: string;
  score: number;
}

export interface AgentMemory {
  id: string;
  agentId: string;
  tenantId: string;
  storeId: string;
  context: string;
  recommendation: string;
  decision: string;
  outcome: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'NOT_ENOUGH_DATA' | 'PENDING';
  outcomeValue?: number;
  createdAt: string;
}

export interface AgentPerformance {
  agentId: string;
  tenantId: string;
  storeId: string;
  executionCount: number;
  successCount: number;
  errorCount: number;
  recommendationCount: number;
  approvedCount: number;
  rejectedCount: number;
  expiredCount: number;
  averageConfidence: number;
  accuracyRate: number | 'NOT_ENOUGH_DATA';
  financialImpact: number;
  lastExecutionAt: string;
}

export interface AgentExecutionEvidence {
  executionId: string;
  agentId: string;
  tenantId: string;
  startedAt: string;
  completedAt: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  inputReferences: string[];
  outputReferences: string[];
  evidenceId: string;
  error?: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  action: string;
  actor: string;
  timestamp: string;
  before: any;
  after: any;
  reason: string;
  decisionId?: string;
  sourceEvidence?: any;
}

export interface WorkflowStage {
  id: string;
  name: string;
  agentId: string;
  agentName: string;
  order: number;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'degraded';
  isCritical?: boolean;
  error?: string;
  durationMs?: number;
  outputSummary?: string;
  evidenceId?: string;
  startedAt?: string;
  finishedAt?: string;
  completedAt?: string;
  executionMode?: 'PRIMARY' | 'FALLBACK' | 'DEGRADED';
}

export interface WorkflowDefinition {
  id: string;
  code: string;
  name: string;
  category: 'OPERATIONS' | 'PROCUREMENT' | 'PRICING' | 'DATA_QUALITY' | 'INTELLIGENCE';
  description?: string;
  triggerType: 'SCHEDULED' | 'MANUAL' | 'EVENT_DRIVEN' | 'CRITICAL_CONDITION';
  cronSchedule?: string;
  estimatedDuration?: string;
  estimatedSavingsPotential?: string;
  targetTenants?: string;
  status: 'READY' | 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'DEGRADED';
  lastRunAt?: string;
  lastSuccessAt?: string;
  stages: WorkflowStage[];
  requiredPermissions?: string[];
  autoApprovalThreshold?: number;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

export interface FinancialImpactItem {
  sourceType: 'AGENT_FINDING' | 'OPPORTUNITY' | 'ARBITRAGE' | 'STOCKOUT_PREVENTION';
  sourceId: string;
  agentId: string;
  agentName: string;
  description: string;
  financialImpact: number;
  confidence?: number;
  timestamp: string;
}

export interface WorkflowExecutionRun {
  runId: string;
  executionId?: string;
  workflowId: string;
  workflowName: string;
  startedAt: string;
  lastHeartbeatAt?: string;
  finishedAt?: string;
  completedAt?: string;
  durationMs: number;
  timeoutMs?: number;
  recoveryReason?: string;
  status: 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'DEGRADED';
  triggeredBy: string;
  stages: WorkflowStage[];
  currentStage?: number;
  summary: {
    stagesTotal: number;
    stagesCompleted: number;
    stagesFailed?: number;
    stagesSkipped?: number;
    stagesDegraded?: number;
    observationsGenerated: number;
    findingsGenerated: number;
    opportunitiesCreated: number;
    financialImpact: number;
  };
  financialBreakdown?: FinancialImpactItem[];
  errors?: string[];
  warnings?: string[];
  financialImpact?: number;
  evidence?: string[];
  evidenceId?: string;
  executiveBrief?: string;
  logs: string[];
  error?: string;
  metadata?: Record<string, any>;
}

// ----------------------------------------------------
// CRM & CUSTOMER / BUSINESS RELATION ENTITIES
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
  // Business Intelligence Fields
  monthlySales: number;
  avgTicket: number;
  purchaseFrequencyDays: number;
  monitoredSkus: number;
  grossMarginPercent: number;
  churnRiskScore: number; // 0 - 100
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
  probability: number; // 0 - 100
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
  reliabilityScore: number; // 0 - 100
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

