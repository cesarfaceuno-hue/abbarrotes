import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  SupplierSource,
  SupplierBranch,
  RawObservation,
  MasterProduct,
  PriceRecord,
  PriceHistoryPoint,
  ScraperRun,
  ArbitrageOpportunity,
  DiscoveredUrl,
  SupplierOffer,
  InventoryItem,
  SalesRecord,
  DecisionRecord,
  AuditLog,
  RawProductObservation,
  SharedObservation,
  AgentFinding,
  Opportunity,
  AgentMemory,
  AgentPerformance,
  AgentExecutionEvidence,
  RecoveryAttempt,
  WorkflowDefinition,
  WorkflowExecutionRun,
  WorkflowStage,
  CrmCustomer,
  CrmContact,
  CrmDealOpportunity,
  CrmActivity,
  CrmTask,
  CrmSupplierPartner,
  CrmAiInsight,
  Customer360View,
} from '../types.js';
import {
  DEFAULT_CRM_CUSTOMERS,
  DEFAULT_CRM_CONTACTS,
  DEFAULT_CRM_OPPORTUNITIES,
  DEFAULT_CRM_ACTIVITIES,
  DEFAULT_CRM_TASKS,
  DEFAULT_CRM_SUPPLIERS,
  DEFAULT_CRM_AI_INSIGHTS,
} from './crmSeedData.js';

export interface DatabaseSchema {
  version: string;
  lastPersisted: string;
  sources: SupplierSource[];
  branches: SupplierBranch[];
  masterProducts: MasterProduct[];
  rawObservations: RawObservation[];
  priceRecords: PriceRecord[];
  priceHistory: PriceHistoryPoint[];
  scraperRuns: ScraperRun[];
  arbitrageOpportunities: ArbitrageOpportunity[];
  discoveredUrls: DiscoveredUrl[];
  supplierOffers: SupplierOffer[];
  inventory: InventoryItem[];
  sales: SalesRecord[];
  decisions: DecisionRecord[];
  auditLogs: AuditLog[];
  sharedObservations: SharedObservation[];
  agentFindings: AgentFinding[];
  opportunities: Opportunity[];
  agentMemories: AgentMemory[];
  agentPerformances: AgentPerformance[];
  executionEvidence: AgentExecutionEvidence[];
  recoveryAttempts?: RecoveryAttempt[];
  rawProductObservations?: RawProductObservation[];
  workflows?: WorkflowDefinition[];
  workflowExecutionRuns?: WorkflowExecutionRun[];
  crmCustomers?: CrmCustomer[];
  crmContacts?: CrmContact[];
  crmOpportunities?: CrmDealOpportunity[];
  crmActivities?: CrmActivity[];
  crmTasks?: CrmTask[];
  crmSuppliers?: CrmSupplierPartner[];
  crmAiInsights?: CrmAiInsight[];
}

export const CANONICAL_DEFAULT_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'wf-morning-intelligence',
    code: 'WF-01',
    name: 'Flujo Operativo Matutino y Síntesis de Inteligencia',
    category: 'INTELLIGENCE',
    description: 'Pipeline completo de 10 etapas: barrido de fuentes mayoristas, saneamiento de catálogo, auditoría de precios, evaluación de inventario, detección de arbitraje y emisión del Reporte Ejecutivo del Tendero.',
    triggerType: 'SCHEDULED',
    cronSchedule: '05:30 AM Diariamente',
    estimatedDuration: '45s',
    estimatedSavingsPotential: '$1,200 - $3,500 MXN/semana',
    targetTenants: 'Todos los Comercios CDMX',
    status: 'READY',
    requiredPermissions: ['SCRAPER_RUN', 'DATA_MATCH', 'PRICE_AUDIT', 'INVENTORY_READ', 'OPPORTUNITY_GENERATE'],
    autoApprovalThreshold: 15000,
    createdAt: '2026-08-17T00:00:00.000Z',
    updatedAt: '2026-08-17T00:00:00.000Z',
    stages: [
      {
        id: 'stage-1',
        name: 'Barrido de Fuentes y URLs Mayoristas',
        agentId: 'discovery-agent',
        agentName: 'Discovery Agent',
        order: 1,
        description: 'Escanear sitemaps y páginas de Scorpion, Zorro, Mayoreo Total y Surtitienda.',
        isCritical: true,
        status: 'pending'
      },
      {
        id: 'stage-2',
        name: 'Auditoría de Calidad y Sanitización',
        agentId: 'data-quality-agent',
        agentName: 'Data Quality Agent',
        order: 2,
        description: 'Validar restricciones de sanidad, precios atípicos y poner registros inválidos en cuarentena.',
        isCritical: false,
        status: 'pending'
      },
      {
        id: 'stage-3',
        name: 'Matching EAN y Normalización de Catálogo',
        agentId: 'matching-agent',
        agentName: 'Matching Agent',
        order: 3,
        description: 'Vincular código de barras con productos canónicos maestros y atributos de presentación.',
        isCritical: true,
        status: 'pending'
      },
      {
        id: 'stage-4',
        name: 'Monitoreo de Precios y Variaciones',
        agentId: 'price-monitor-agent',
        agentName: 'Price Monitor Agent',
        order: 4,
        description: 'Comparar cotizaciones históricas y registrar señales de alzas o caídas mayoristas.',
        isCritical: false,
        status: 'pending'
      },
      {
        id: 'stage-5',
        name: 'Evaluación de Proveedores y Cobertura CDMX',
        agentId: 'supplier-monitor-agent',
        agentName: 'Supplier Monitor Agent',
        order: 5,
        description: 'Auditar confiabilidad de entrega, lead times y disponibilidad por CEDIS.',
        isCritical: false,
        status: 'pending'
      },
      {
        id: 'stage-6',
        name: 'Sincronización Mini Nube y Tablas CSV',
        agentId: 'google-sheets-intelligence-agent',
        agentName: 'Google Sheets Intelligence Agent',
        order: 6,
        description: 'Actualizar la base de datos interna local y preparar dump CSV para Google Sheets.',
        isCritical: false,
        status: 'pending'
      },
      {
        id: 'stage-7',
        name: 'Diagnóstico de Riesgo de Quiebre de Stock',
        agentId: 'inventory-analyst-agent',
        agentName: 'Inventory Analyst Agent',
        order: 7,
        description: 'Cruzar inventario físico con velocidad de venta para proyectar días de stock restantes.',
        isCritical: true,
        status: 'pending'
      },
      {
        id: 'stage-8',
        name: 'Auditoría de Margen Bruto y Presión de Costo',
        agentId: 'margin-analyst-agent',
        agentName: 'Margin Analyst Agent',
        order: 8,
        description: 'Detectar compresión de ganancia y calcular márgenes saludables por categoría.',
        isCritical: false,
        status: 'pending'
      },
      {
        id: 'stage-9',
        name: 'Recomendaciones de Compra y Reabastecimiento',
        agentId: 'reorder-agent',
        agentName: 'Reorder Agent',
        order: 9,
        description: 'Construir orden de abasto optimizada considerando restricciones de capital del comercio.',
        isCritical: false,
        status: 'pending'
      },
      {
        id: 'stage-10',
        name: 'Detección de Arbitraje y Resumen Matutino',
        agentId: 'store-manager-agent',
        agentName: 'Store Manager Agent',
        order: 10,
        description: 'Consolidar oportunidades de ahorro y redactar el reporte ejecutivo para el propietario.',
        isCritical: false,
        status: 'pending'
      }
    ]
  },
  {
    id: 'wf-urgent-refill',
    code: 'WF-02',
    name: 'Flujo de Reabastecimiento Urgente Anti-Quiebre',
    category: 'PROCUREMENT',
    description: 'Proceso acelerado enfocado en productos con menos de 2.5 días de stock. Revisa disponibilidad inmediata en mayoristas y emite órdenes listas para aprobación.',
    triggerType: 'CRITICAL_CONDITION',
    cronSchedule: 'Por evento de stock crítico',
    estimatedDuration: '15s',
    estimatedSavingsPotential: '$450 - $1,200 MXN',
    targetTenants: 'Tienda Seleccionada',
    status: 'READY',
    requiredPermissions: ['INVENTORY_READ', 'SUPPLIER_READ', 'REORDER_GENERATE'],
    autoApprovalThreshold: 8000,
    createdAt: '2026-08-17T00:00:00.000Z',
    updatedAt: '2026-08-17T00:00:00.000Z',
    stages: [
      {
        id: 'stage-ur-1',
        name: 'Detección de Productos Críticos en Mostrador',
        agentId: 'inventory-analyst-agent',
        agentName: 'Inventory Analyst Agent',
        order: 1,
        description: 'Identificar SKUs con cobertura inferior a 48 horas de venta.',
        isCritical: true,
        status: 'pending'
      },
      {
        id: 'stage-ur-2',
        name: 'Comprobación de Existencias y Proveedores',
        agentId: 'supplier-monitor-agent',
        agentName: 'Supplier Monitor Agent',
        order: 2,
        description: 'Filtrar proveedores con entrega en el mismo día o recolección inmediata.',
        isCritical: false,
        status: 'pending'
      },
      {
        id: 'stage-ur-3',
        name: 'Cálculo de Paquete y Sugerencia de Compra',
        agentId: 'reorder-agent',
        agentName: 'Reorder Agent',
        order: 3,
        description: 'Generar orden de compra con desglose de inversión y ROI estimado.',
        isCritical: false,
        status: 'pending'
      }
    ]
  },
  {
    id: 'wf-wholesale-arbitrage',
    code: 'WF-03',
    name: 'Flujo de Arbitraje Mayorista y Captura de Ahorro',
    category: 'PRICING',
    description: 'Compara activamente los precios de lista y promociones de volumen entre Scorpion, Zorro y Mayoreo Total para detectar brechas de costo mayores al 5%.',
    triggerType: 'MANUAL',
    cronSchedule: 'Bajo Demanda o 12:00 PM',
    estimatedDuration: '20s',
    estimatedSavingsPotential: '$800 - $2,100 MXN/pedido',
    targetTenants: 'Red Mayorista CDMX',
    status: 'READY',
    requiredPermissions: ['PRICE_AUDIT', 'MATCHING_READ', 'OPPORTUNITY_GENERATE'],
    autoApprovalThreshold: 10000,
    createdAt: '2026-08-17T00:00:00.000Z',
    updatedAt: '2026-08-17T00:00:00.000Z',
    stages: [
      {
        id: 'stage-wa-1',
        name: 'Extracción de Cotizaciones en Vivo',
        agentId: 'discovery-agent',
        agentName: 'Discovery Agent',
        order: 1,
        description: 'Obtener precios actualizados de proveedores mayoristas autorizados.',
        isCritical: true,
        status: 'pending'
      },
      {
        id: 'stage-wa-2',
        name: 'Cálculo de Diferenciales y Arbitraje',
        agentId: 'opportunity-agent',
        agentName: 'Opportunity Agent',
        order: 2,
        description: 'Determinar ahorro neto descontando costos logísticos y empaques mínimos.',
        isCritical: false,
        status: 'pending'
      },
      {
        id: 'stage-wa-3',
        name: 'Generación de Nodos en Store Brain',
        agentId: 'store-manager-agent',
        agentName: 'Store Manager Agent',
        order: 3,
        description: 'Publicar las oportunidades en el Centro de Oportunidades del comerciante.',
        isCritical: false,
        status: 'pending'
      }
    ]
  },
  {
    id: 'wf-sheets-mini-cloud-sync',
    code: 'WF-04',
    name: 'Flujo de Sincronización Mini Nube y Hojas de Cálculo',
    category: 'OPERATIONS',
    description: 'Exporta todas las tablas maestras a una base de datos local y genera el archivo CSV multi-tabla compatible con Google Sheets y Microsoft Excel.',
    triggerType: 'SCHEDULED',
    cronSchedule: 'Cada 2 Horas',
    estimatedDuration: '10s',
    estimatedSavingsPotential: 'Respaldo 100% Autónomo',
    targetTenants: 'Sistema Global',
    status: 'READY',
    requiredPermissions: ['EXPORT_CSV', 'DATAHUB_SYNC', 'INTEGRATIONS_WRITE'],
    autoApprovalThreshold: 0,
    createdAt: '2026-08-17T00:00:00.000Z',
    updatedAt: '2026-08-17T00:00:00.000Z',
    stages: [
      {
        id: 'stage-sc-1',
        name: 'Extracción de Tablas Relacionales Internas',
        agentId: 'data-quality-agent',
        agentName: 'Data Quality Agent',
        order: 1,
        description: 'Verificar consistencia de esquemas de Catálogo, Precios, Inventarios y Hallazgos.',
        isCritical: true,
        status: 'pending'
      },
      {
        id: 'stage-sc-2',
        name: 'Compilación y Exportación CSV Multi-Tabla',
        agentId: 'google-sheets-intelligence-agent',
        agentName: 'Google Sheets Intelligence Agent',
        order: 2,
        description: 'Generar el archivo CSV estandarizado en /data/exports para descarga y sincronización en la nube.',
        isCritical: false,
        status: 'pending'
      }
    ]
  },
  {
    id: 'wf-data-quality-quarantine',
    code: 'WF-05',
    name: 'Flujo de Auditoría de Datos, Normalización y Cuarentena',
    category: 'DATA_QUALITY',
    description: 'Auditoría continua de sanidad de datos: detecta códigos de barra inválidos, duplicados, discrepancias de gramaje y valores atípicos, aislándolos en cuarentena.',
    triggerType: 'EVENT_DRIVEN',
    cronSchedule: 'Continuo tras cada ingesta',
    estimatedDuration: '12s',
    estimatedSavingsPotential: 'Cero Errores de Catálogo',
    targetTenants: 'Catálogo Maestro Global',
    status: 'READY',
    requiredPermissions: ['DATA_QUALITY_AUDIT', 'QUARANTINE_MUTATE'],
    autoApprovalThreshold: 0,
    createdAt: '2026-08-17T00:00:00.000Z',
    updatedAt: '2026-08-17T00:00:00.000Z',
    stages: [
      {
        id: 'stage-dq-1',
        name: 'Validación de EAN y Restricciones Físicas',
        agentId: 'data-quality-agent',
        agentName: 'Data Quality Agent',
        order: 1,
        description: 'Comprobar formato numérico GTIN/EAN-13 y consistencia de unidad de medida.',
        isCritical: true,
        status: 'pending'
      },
      {
        id: 'stage-dq-2',
        name: 'Aislamiento de Registros Atípicos',
        agentId: 'matching-agent',
        agentName: 'Matching Agent',
        order: 2,
        description: 'Mandar a revisión manual aquellos productos con coincidencia difusa inferior al 80%.',
        isCritical: false,
        status: 'pending'
      }
    ]
  }
];

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'abarrotes_market_db.json');

export class MarketDatabase {
  private data: DatabaseSchema;
  private isDirty = false;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadFromDisk();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadFromDisk(): DatabaseSchema {
    const BAK_FILE = `${DB_FILE}.bak`;
    
    // Attempt loading primary file
    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        console.log(`[DB] Successfully loaded persistent database from ${DB_FILE} with ${parsed.priceRecords?.length || 0} price records and ${parsed.masterProducts?.length || 0} master products.`);
        return this.migrateAndCheckSeed(parsed);
      } catch (err: any) {
        console.error(`[DB ERROR] Failed reading database file, attempting recovery from backup. Error: ${err.message}`);
        
        // Attempt recovery from backup
        if (fs.existsSync(BAK_FILE)) {
          try {
            console.log(`[DB RECOVERY] Attempting to restore database from backup file: ${BAK_FILE}`);
            const content = fs.readFileSync(BAK_FILE, 'utf-8');
            const parsed = JSON.parse(content);
            console.log(`[DB RECOVERY] Successfully loaded database from backup with ${parsed.priceRecords?.length || 0} price records.`);
            
            // Restore backup to primary location to self-heal
            try {
              fs.writeFileSync(DB_FILE, content, 'utf-8');
              console.log(`[DB RECOVERY] Successfully self-healed primary database file.`);
            } catch (writeErr: any) {
              console.error(`[DB RECOVERY] Warning: failed to write healed database to primary path: ${writeErr.message}`);
            }
            
            return this.migrateAndCheckSeed(parsed);
          } catch (bakErr: any) {
            console.error(`[DB ERROR] Backup file recovery failed as well: ${bakErr.message}`);
          }
        }
      }
    } else if (fs.existsSync(BAK_FILE)) {
      // If primary file is missing but backup exists
      try {
        console.log(`[DB RECOVERY] Primary database missing, attempting to restore from backup: ${BAK_FILE}`);
        const content = fs.readFileSync(BAK_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        fs.writeFileSync(DB_FILE, content, 'utf-8');
        return this.migrateAndCheckSeed(parsed);
      } catch (bakErr: any) {
        console.error(`[DB ERROR] Failed reading backup file: ${bakErr.message}`);
      }
    }

    const defaultSeed = this.createDefaultSeed();
    this.saveToDiskSync(defaultSeed);
    return defaultSeed;
  }

  private migrateAndCheckSeed(parsed: any): DatabaseSchema {
    // Migrate old formats & missing sources
    if (!parsed.discoveredUrls) parsed.discoveredUrls = [];
    if (!parsed.supplierOffers) parsed.supplierOffers = [];
    if (!parsed.sharedObservations) parsed.sharedObservations = [];
    if (!parsed.agentFindings) parsed.agentFindings = [];
    if (!parsed.opportunities) parsed.opportunities = [];
    if (!parsed.agentMemories) parsed.agentMemories = [];
    if (!parsed.agentPerformances) parsed.agentPerformances = [];
    if (!parsed.executionEvidence) parsed.executionEvidence = [];
    if (!parsed.recoveryAttempts) parsed.recoveryAttempts = [];
    if (!parsed.rawProductObservations) parsed.rawProductObservations = [];
    if (!parsed.workflows) parsed.workflows = [];
    if (!parsed.workflowExecutionRuns) parsed.workflowExecutionRuns = [];
    if (!parsed.crmCustomers || parsed.crmCustomers.length === 0) parsed.crmCustomers = [...DEFAULT_CRM_CUSTOMERS];
    if (!parsed.crmContacts || parsed.crmContacts.length === 0) parsed.crmContacts = [...DEFAULT_CRM_CONTACTS];
    if (!parsed.crmOpportunities || parsed.crmOpportunities.length === 0) parsed.crmOpportunities = [...DEFAULT_CRM_OPPORTUNITIES];
    if (!parsed.crmActivities || parsed.crmActivities.length === 0) parsed.crmActivities = [...DEFAULT_CRM_ACTIVITIES];
    if (!parsed.crmTasks || parsed.crmTasks.length === 0) parsed.crmTasks = [...DEFAULT_CRM_TASKS];
    if (!parsed.crmSuppliers || parsed.crmSuppliers.length === 0) parsed.crmSuppliers = [...DEFAULT_CRM_SUPPLIERS];
    if (!parsed.crmAiInsights || parsed.crmAiInsights.length === 0) parsed.crmAiInsights = [...DEFAULT_CRM_AI_INSIGHTS];

    // Ensure default canonical workflows exist in persistent storage
    for (const defWf of CANONICAL_DEFAULT_WORKFLOWS) {
      if (!parsed.workflows.some((w: any) => w.id === defWf.id)) {
        parsed.workflows.push(defWf);
      }
    }

    const defaultSeed = this.createDefaultSeed();
    for (const seedSource of defaultSeed.sources) {
      if (!parsed.sources.some((s: any) => s.id === seedSource.id)) {
        parsed.sources.push(seedSource);
      }
    }

    const nowStr = new Date().toISOString();
    if (!parsed.inventory || parsed.inventory.length === 0) {
      parsed.inventory = [
        {
          id: 'inv-aceite-123-1l',
          masterProductId: 'prod-aceite-123-1l',
          tenantId: 'tenant-cdmx-01',
          storeId: 'store-cdmx-centro',
          quantity: 5,
          stock: 5,
          unitCost: 37.5,
          retailPrice: 48.0,
          averageDailySales: 1.5,
          supplierLeadTimeDays: 5,
          targetMargin: 25.0,
          lastUpdated: nowStr
        },
        {
          id: 'inv-maruchan-64g',
          masterProductId: 'prod-maruchan-camaron-64g',
          tenantId: 'tenant-cdmx-01',
          storeId: 'store-cdmx-centro',
          quantity: 42,
          stock: 42,
          unitCost: 18.25,
          retailPrice: 22.0,
          averageDailySales: 0.1,
          supplierLeadTimeDays: 2,
          targetMargin: 15.0,
          lastUpdated: nowStr
        },
        {
          id: 'inv-azucar-1kg',
          masterProductId: 'prod-azucar-zulka-1kg',
          tenantId: 'tenant-cdmx-01',
          storeId: 'store-cdmx-centro',
          quantity: 15,
          stock: 15,
          unitCost: 35.0,
          retailPrice: 42.0,
          averageDailySales: 2.0,
          supplierLeadTimeDays: 3,
          targetMargin: 20.0,
          lastUpdated: nowStr
        }
      ];
    }

    // Migration: Ensure sales records have a total field
    if (parsed.sales && Array.isArray(parsed.sales)) {
      parsed.sales = parsed.sales.map((s: any) => {
        if (s.total === undefined || s.total === null) {
          return { ...s, total: parseFloat((s.quantity * s.unitPrice).toFixed(2)) };
        }
        return s;
      });
    }

    // Migration: Ensure inventory items have a stock field matching quantity for reconciliation
    if (parsed.inventory && Array.isArray(parsed.inventory)) {
      parsed.inventory = parsed.inventory.map((item: any) => {
        if (item.stock === undefined || item.stock === null) {
          return { ...item, stock: item.quantity };
        }
        return item;
      });
    }

    if (!parsed.supplierOffers || parsed.supplierOffers.length === 0) {
      parsed.supplierOffers = [
        {
          id: 'so-supp-scorpion-prod-azucar-zulka-1kg',
          masterProductId: 'prod-azucar-zulka-1kg',
          supplierId: 'supp-scorpion',
          supplierName: 'Comercializadora Scorpion',
          price: 29.5,
          currency: 'MXN',
          priceType: 'PIECE',
          packSize: 10,
          availability: 'IN_STOCK',
          sourceUrl: 'https://www.scorpion.com.mx/',
          observedAt: nowStr
        }
      ];
    }
    
    return parsed as DatabaseSchema;
  }

  public saveToDiskSync(dataToSave?: DatabaseSchema) {
    this.ensureDataDirectory();
    const data = dataToSave || this.data;
    data.lastPersisted = new Date().toISOString();
    
    // Create backup of current state first (if it exists and is parseable)
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.copyFileSync(DB_FILE, `${DB_FILE}.bak`);
      } catch (bakErr: any) {
        console.error(`[DB SAVE] Warning: Failed to create database backup: ${bakErr.message}`);
      }
    }
    
    // Save to temp file with a highly unique name to prevent any write overlap collision
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const tempFile = `${DB_FILE}.tmp.${randomSuffix}.${Date.now()}`;
    
    try {
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
      this.isDirty = false;
    } catch (writeErr: any) {
      console.error(`[DB SAVE ERROR] Failed to write database to disk: ${writeErr.message}`);
      // Clean up temp file if it was created
      if (fs.existsSync(tempFile)) {
        try { fs.unlinkSync(tempFile); } catch (e) {}
      }
      throw writeErr;
    }
  }

  public async saveToDisk() {
    this.saveToDiskSync();
  }

  private createDefaultSeed(): DatabaseSchema {
    const now = new Date().toISOString();

    const sources: SupplierSource[] = [
      {
        id: 'source-scorpion',
        supplierId: 'supp-scorpion',
        name: 'Comercializadora Scorpion',
        officialDomain: 'https://www.scorpion.com.mx/',
        sourceUrl: 'https://www.scorpion.com.mx/tienda/',
        canonicalUrl: 'https://www.scorpion.com.mx/tienda/',
        sourceType: 'ECOMMERCE',
        country: 'MEX',
        state: 'CDMX',
        city: 'Ciudad de México',
        marketRegion: 'CDMX_METRO',
        geographicCoverage: 'CDMX_METRO',
        catalogAvailability: true,
        priceAvailability: true,
        enabled: true,
        priority: 1,
        adapter: 'ScorpionAdapter',
        crawlFrequency: 'DAILY',
        robotsStatus: 'ALLOWED',
        sitemapStatus: 'FOUND',
        healthScore: 98,
        termsStatus: 'PUBLIC_ACCESSIBLE',
        accessStatus: 'ACTIVE',
        recoveryState: 'ACTIVE',
        lastVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'source-mayoreo-total',
        supplierId: 'supp-mayoreo-total',
        name: 'Mayoreo Total México',
        officialDomain: 'https://www.mayoreototal.mx/',
        sourceUrl: 'https://www.mayoreototal.mx/collections/abarrotes/products.json',
        canonicalUrl: 'https://www.mayoreototal.mx/',
        sourceType: 'SHOPIFY_API',
        country: 'MEX',
        state: 'CDMX',
        city: 'Ciudad de México',
        marketRegion: 'CDMX_METRO',
        geographicCoverage: 'NATIONAL',
        catalogAvailability: true,
        priceAvailability: true,
        enabled: true,
        priority: 2,
        adapter: 'MayoreoTotalAdapter',
        crawlFrequency: 'DAILY',
        robotsStatus: 'ALLOWED',
        sitemapStatus: 'FOUND',
        healthScore: 96,
        termsStatus: 'PUBLIC_ACCESSIBLE',
        accessStatus: 'ACTIVE',
        recoveryState: 'ACTIVE',
        lastVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'source-surtitienda',
        supplierId: 'supp-surtitienda',
        name: 'Surti-Tienda Abarrotes',
        officialDomain: 'https://www.surtitienda.mx/',
        sourceUrl: 'https://www.surtitienda.mx/api/catalog_system/pub/products/search',
        canonicalUrl: 'https://www.surtitienda.mx/',
        sourceType: 'VTEX_API',
        country: 'MEX',
        state: 'CDMX',
        city: 'Ciudad de México',
        marketRegion: 'CDMX_METRO',
        geographicCoverage: 'CDMX_METRO',
        catalogAvailability: true,
        priceAvailability: true,
        enabled: true,
        priority: 3,
        adapter: 'SurtitiendaAdapter',
        crawlFrequency: 'DAILY',
        robotsStatus: 'ALLOWED',
        sitemapStatus: 'FOUND',
        healthScore: 94,
        termsStatus: 'PUBLIC_ACCESSIBLE',
        accessStatus: 'ACTIVE',
        recoveryState: 'ACTIVE',
        lastVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'source-zorro',
        supplierId: 'supp-zorro',
        name: 'Grupo Zorro Abarrotero',
        officialDomain: 'https://zorroabarrotero.com.mx/',
        sourceUrl: 'https://zorroabarrotero.com.mx/sucursales/',
        canonicalUrl: 'https://zorroabarrotero.com.mx/',
        sourceType: 'OCR_FOLLETO',
        country: 'MEX',
        state: 'CDMX',
        city: 'Ciudad de México',
        marketRegion: 'CDMX_METRO',
        geographicCoverage: 'CDMX_METRO',
        catalogAvailability: true,
        priceAvailability: true,
        enabled: true,
        priority: 4,
        adapter: 'ZorroAdapter',
        crawlFrequency: 'TWICE_DAILY',
        robotsStatus: 'ALLOWED',
        sitemapStatus: 'FOUND',
        healthScore: 91,
        termsStatus: 'PUBLIC_ACCESSIBLE',
        accessStatus: 'ACTIVE',
        recoveryState: 'ACTIVE',
        lastVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'source-abarrotero',
        supplierId: 'supp-abarrotero',
        name: 'El Abarrotero Mayorista',
        officialDomain: 'https://abarrotero.com/',
        sourceUrl: 'https://abarrotero.com/products.json',
        canonicalUrl: 'https://abarrotero.com/',
        sourceType: 'SHOPIFY_API',
        country: 'MEX',
        state: 'CDMX',
        city: 'Ciudad de México',
        marketRegion: 'CDMX_METRO',
        geographicCoverage: 'NATIONAL',
        catalogAvailability: true,
        priceAvailability: true,
        enabled: true,
        priority: 5,
        adapter: 'AbarroteroAdapter',
        crawlFrequency: 'DAILY',
        robotsStatus: 'ALLOWED',
        sitemapStatus: 'FOUND',
        healthScore: 93,
        termsStatus: 'PUBLIC_ACCESSIBLE',
        accessStatus: 'ACTIVE',
        recoveryState: 'ACTIVE',
        lastVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'source-click-abasto',
        supplierId: 'supp-click-abasto',
        name: 'Click Abasto CDMX',
        officialDomain: 'https://clickabasto.com/',
        sourceUrl: 'https://clickabasto.com/products.json',
        canonicalUrl: 'https://clickabasto.com/',
        sourceType: 'SHOPIFY_API',
        country: 'MEX',
        state: 'CDMX',
        city: 'Ciudad de México',
        marketRegion: 'CENTRAL_ABASTOS',
        geographicCoverage: 'CDMX_METRO',
        catalogAvailability: true,
        priceAvailability: true,
        enabled: true,
        priority: 6,
        adapter: 'ClickAbastoAdapter',
        crawlFrequency: 'DAILY',
        robotsStatus: 'ALLOWED',
        sitemapStatus: 'FOUND',
        healthScore: 95,
        termsStatus: 'PUBLIC_ACCESSIBLE',
        accessStatus: 'ACTIVE',
        recoveryState: 'ACTIVE',
        lastVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'source-costco',
        supplierId: 'supp-costco',
        name: 'Costco México Wholesale',
        officialDomain: 'https://www.costco.com.mx/',
        sourceUrl: 'https://www.costco.com.mx/c/abarrotes-y-comida',
        canonicalUrl: 'https://www.costco.com.mx/',
        sourceType: 'ECOMMERCE',
        country: 'MEX',
        state: 'CDMX',
        city: 'Ciudad de México',
        marketRegion: 'CDMX_METRO',
        geographicCoverage: 'NATIONAL',
        catalogAvailability: true,
        priceAvailability: true,
        enabled: true,
        priority: 7,
        adapter: 'CostcoAdapter',
        crawlFrequency: 'DAILY',
        robotsStatus: 'ALLOWED',
        sitemapStatus: 'FOUND',
        healthScore: 88,
        termsStatus: 'PUBLIC_ACCESSIBLE',
        accessStatus: 'ACTIVE',
        recoveryState: 'ACTIVE',
        lastVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'source-bodega-aurrera',
        supplierId: 'supp-bodega-aurrera',
        name: 'Bodega Aurrera / Walmart CDMX',
        officialDomain: 'https://www.bodegaaurrera.com.mx/',
        sourceUrl: 'https://www.bodegaaurrera.com.mx/browse/abarrotes',
        canonicalUrl: 'https://www.bodegaaurrera.com.mx/',
        sourceType: 'ECOMMERCE',
        country: 'MEX',
        state: 'CDMX',
        city: 'Ciudad de México',
        marketRegion: 'CDMX_METRO',
        geographicCoverage: 'NATIONAL',
        catalogAvailability: true,
        priceAvailability: true,
        enabled: true,
        priority: 8,
        adapter: 'BodegaAurreraAdapter',
        crawlFrequency: 'DAILY',
        robotsStatus: 'ALLOWED',
        sitemapStatus: 'FOUND',
        healthScore: 89,
        termsStatus: 'PUBLIC_ACCESSIBLE',
        accessStatus: 'ACTIVE',
        recoveryState: 'ACTIVE',
        lastVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'source-mercado-libre',
        supplierId: 'supp-mercado-libre',
        name: 'Mercado Libre Supermercado CDMX',
        officialDomain: 'https://www.mercadolibre.com.mx/',
        sourceUrl: 'https://api.mercadolibre.com/sites/MLM/search?q=abarrotes%20mayoreo',
        canonicalUrl: 'https://www.mercadolibre.com.mx/',
        sourceType: 'ECOMMERCE',
        country: 'MEX',
        state: 'CDMX',
        city: 'Ciudad de México',
        marketRegion: 'CDMX_METRO',
        geographicCoverage: 'NATIONAL',
        catalogAvailability: true,
        priceAvailability: true,
        enabled: true,
        priority: 9,
        adapter: 'MercadoLibreAdapter',
        crawlFrequency: 'DAILY',
        robotsStatus: 'ALLOWED',
        sitemapStatus: 'FOUND',
        healthScore: 97,
        termsStatus: 'PUBLIC_ACCESSIBLE',
        accessStatus: 'ACTIVE',
        recoveryState: 'ACTIVE',
        lastVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const branches: SupplierBranch[] = [
      {
        id: 'branch-scorp-izt',
        supplierId: 'supp-scorpion',
        branchId: '013',
        name: 'Scorpion Sucursal Iztapalapa Central',
        street: 'Eje 6 Sur Trabajadores Sociales',
        number: '1410',
        neighborhood: 'San José Aculco',
        municipality: 'Iztapalapa',
        city: 'Ciudad de México',
        state: 'CDMX',
        country: 'MEX',
        postalCode: '09410',
        phone: '55 5634 1100',
        latitude: 19.3721,
        longitude: -99.0945,
        openingHours: 'Lunes a Sábado 07:00 - 18:00 hrs',
        sourceUrl: 'https://www.scorpion.com.mx/sucursales',
        pickupAvailable: true,
        deliveryAvailable: true,
        coverageArea: ['Iztapalapa', 'Iztacalco', 'Benito Juárez', 'Coyoacán'],
        lastVerifiedAt: now,
        status: 'ACTIVE',
      },
      {
        id: 'branch-zorro-aeropuerto',
        supplierId: 'supp-zorro',
        branchId: 'Z-04',
        name: 'Zorro Abarrotero Aeropuerto',
        street: 'Norte 33',
        number: '124',
        neighborhood: 'Moctezuma 2da Sección',
        municipality: 'Venustiano Carranza',
        city: 'Ciudad de México',
        state: 'CDMX',
        country: 'MEX',
        postalCode: '15530',
        phone: '55 5784 9020',
        latitude: 19.4312,
        longitude: -99.0894,
        openingHours: 'Lunes a Domingo 07:00 - 20:00 hrs',
        sourceUrl: 'https://zorroabarrotero.com.mx/sucursales/',
        pickupAvailable: true,
        deliveryAvailable: false,
        coverageArea: ['Venustiano Carranza', 'Gustavo A. Madero', 'Cuauhtémoc'],
        lastVerifiedAt: now,
        status: 'ACTIVE',
      },
      {
        id: 'branch-zorro-roldan',
        supplierId: 'supp-zorro',
        branchId: 'Z-01',
        name: 'Zorro Abarrotero Roldán (Centro Histórico)',
        street: 'Calle Roldán',
        number: '13',
        neighborhood: 'Centro Histórico',
        municipality: 'Cuauhtémoc',
        city: 'Ciudad de México',
        state: 'CDMX',
        country: 'MEX',
        postalCode: '06090',
        phone: '55 5522 1450',
        latitude: 19.4295,
        longitude: -99.1258,
        openingHours: 'Lunes a Domingo 07:00 - 19:30 hrs',
        sourceUrl: 'https://zorroabarrotero.com.mx/sucursales/',
        pickupAvailable: true,
        deliveryAvailable: false,
        coverageArea: ['Cuauhtémoc', 'Venustiano Carranza'],
        lastVerifiedAt: now,
        status: 'ACTIVE',
      },
      {
        id: 'branch-mayoreo-total-cedis',
        supplierId: 'supp-mayoreo-total',
        branchId: 'MT-CDMX',
        name: 'Mayoreo Total CEDIS Vallejo',
        street: 'Calz. Vallejo',
        number: '1020',
        neighborhood: 'Industrial Vallejo',
        municipality: 'Azcapotzalco',
        city: 'Ciudad de México',
        state: 'CDMX',
        country: 'MEX',
        postalCode: '02300',
        phone: '55 8421 9000',
        latitude: 19.4891,
        longitude: -99.1623,
        openingHours: 'Lunes a Viernes 08:00 - 18:00 hrs',
        sourceUrl: 'https://www.mayoreototal.mx/',
        pickupAvailable: true,
        deliveryAvailable: true,
        coverageArea: ['Toda la CDMX y Área Metropolitana'],
        lastVerifiedAt: now,
        status: 'ACTIVE',
      }
    ];

    const masterProducts: MasterProduct[] = [
      {
        id: 'prod-coca-600',
        canonicalName: 'Coca-Cola Original 600 ml',
        brand: 'Coca-Cola',
        category: 'Bebidas',
        subcategory: 'Refrescos',
        barcode: '7501055301088',
        sku: 'CC-600-PET',
        presentation: '600 ml Botella PET',
        unit: 'pieza',
        packSize: 24,
        avgRetailPriceCdmx: 20.0,
        cheapestWholesaleCost: 15.2,
        cheapestSupplierId: 'supp-cda',
        active: true,
        lastUpdated: now,
      },
      {
        id: 'prod-leche-alpura-1l',
        canonicalName: 'Leche Alpura Clásica Entera 1L',
        brand: 'Alpura',
        category: 'Lácteos y Huevo',
        subcategory: 'Leche',
        barcode: '7501055900039',
        sku: 'ALP-LECHE-1L',
        presentation: '1 Litro Tetrapak',
        unit: 'pieza',
        packSize: 12,
        avgRetailPriceCdmx: 32.0,
        cheapestWholesaleCost: 27.9,
        cheapestSupplierId: 'supp-scorpion',
        active: true,
        lastUpdated: now,
      },
      {
        id: 'prod-huevo-san-juan-1kg',
        canonicalName: 'Huevo Blanco San Juan 1kg',
        brand: 'San Juan',
        category: 'Lácteos y Huevo',
        subcategory: 'Huevo',
        barcode: '7501020565042',
        sku: 'HSJ-1KG',
        presentation: '1 kg A granel / Cono',
        unit: 'kilo',
        packSize: 1,
        avgRetailPriceCdmx: 48.0,
        cheapestWholesaleCost: 34.5,
        cheapestSupplierId: 'supp-scorpion',
        active: true,
        lastUpdated: now,
      },
      {
        id: 'prod-roma-1kg',
        canonicalName: 'Detergente en Polvo Roma 1kg',
        brand: 'La Corona',
        category: 'Limpieza del Hogar',
        subcategory: 'Detergentes',
        barcode: '7501026004605',
        sku: 'ROMA-1KG',
        presentation: 'Bolsa 1 kg',
        unit: 'pieza',
        packSize: 10,
        avgRetailPriceCdmx: 46.0,
        cheapestWholesaleCost: 38.5,
        cheapestSupplierId: 'supp-mayoreo-total',
        active: true,
        lastUpdated: now,
      },
      {
        id: 'prod-aceite-123-1l',
        canonicalName: 'Aceite Vegetal Comestible 1-2-3 1L',
        brand: '1-2-3',
        category: 'Abarrotes',
        subcategory: 'Aceites',
        barcode: '7501032900012',
        sku: 'AC-123-1L',
        presentation: 'Botella 1 Litro',
        unit: 'pieza',
        packSize: 12,
        avgRetailPriceCdmx: 48.0,
        cheapestWholesaleCost: 37.5,
        cheapestSupplierId: 'supp-scorpion',
        active: true,
        lastUpdated: now,
      },
      {
        id: 'prod-maruchan-camaron-64g',
        canonicalName: 'Sopa Instantánea Maruchan Vaso Sabor Camarón 64g',
        brand: 'Maruchan',
        category: 'Abarrotes',
        subcategory: 'Sopas Instantáneas',
        barcode: '0041789001956',
        sku: 'MAR-CAM-64G',
        presentation: 'Vaso 64 gr',
        unit: 'pieza',
        packSize: 12,
        avgRetailPriceCdmx: 22.0,
        cheapestWholesaleCost: 18.25,
        cheapestSupplierId: 'supp-mayoreo-total',
        active: true,
        lastUpdated: now,
      },
      {
        id: 'prod-azucar-zulka-1kg',
        canonicalName: 'Azúcar Estándar Zulka 1kg',
        brand: 'Zulka',
        category: 'Abarrotes',
        subcategory: 'Azúcar',
        barcode: '0661440000014',
        sku: 'ZULKA-1KG',
        presentation: 'Bolsa 1 kg',
        unit: 'pieza',
        packSize: 10,
        avgRetailPriceCdmx: 42.0,
        cheapestWholesaleCost: 34.9,
        cheapestSupplierId: 'supp-mayoreo-total',
        active: true,
        lastUpdated: now,
      }
    ];

    const initialInventory: InventoryItem[] = [
      {
        id: 'inv-aceite-123-1l',
        masterProductId: 'prod-aceite-123-1l',
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro',
        quantity: 5,
        stock: 5,
        unitCost: 37.5,
        retailPrice: 48.0,
        averageDailySales: 1.5,
        supplierLeadTimeDays: 5,
        targetMargin: 25.0,
        lastUpdated: now
      },
      {
        id: 'inv-maruchan-64g',
        masterProductId: 'prod-maruchan-camaron-64g',
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro',
        quantity: 42,
        stock: 42,
        unitCost: 18.25,
        retailPrice: 22.0,
        averageDailySales: 0.1,
        supplierLeadTimeDays: 2,
        targetMargin: 15.0,
        lastUpdated: now
      },
      {
        id: 'inv-azucar-1kg',
        masterProductId: 'prod-azucar-zulka-1kg',
        tenantId: 'tenant-cdmx-01',
        storeId: 'store-cdmx-centro',
        quantity: 15,
        stock: 15,
        unitCost: 35.0,
        retailPrice: 42.0,
        averageDailySales: 2.0,
        supplierLeadTimeDays: 3,
        targetMargin: 20.0,
        lastUpdated: now
      }
    ];

    const initialSupplierOffers: SupplierOffer[] = [
      {
        id: 'so-supp-scorpion-prod-azucar-zulka-1kg',
        masterProductId: 'prod-azucar-zulka-1kg',
        supplierId: 'supp-scorpion',
        supplierName: 'Comercializadora Scorpion',
        price: 29.5,
        currency: 'MXN',
        priceType: 'PIECE',
        packSize: 10,
        availability: 'IN_STOCK',
        sourceUrl: 'https://www.scorpion.com.mx/',
        observedAt: now
      }
    ];

    return {
      version: '4.1.0',
      lastPersisted: now,
      sources,
      branches,
      masterProducts,
      rawObservations: [],
      priceRecords: [],
      priceHistory: [],
      scraperRuns: [],
      arbitrageOpportunities: [],
      discoveredUrls: [],
      supplierOffers: initialSupplierOffers,
      inventory: initialInventory,
      sales: [],
      decisions: [],
      auditLogs: [],
      sharedObservations: [],
      agentFindings: [],
      opportunities: [],
      agentMemories: [],
      agentPerformances: [],
      executionEvidence: [],
      workflows: [...CANONICAL_DEFAULT_WORKFLOWS],
      workflowExecutionRuns: [],
      crmCustomers: [...DEFAULT_CRM_CUSTOMERS],
      crmContacts: [...DEFAULT_CRM_CONTACTS],
      crmOpportunities: [...DEFAULT_CRM_OPPORTUNITIES],
      crmActivities: [...DEFAULT_CRM_ACTIVITIES],
      crmTasks: [...DEFAULT_CRM_TASKS],
      crmSuppliers: [...DEFAULT_CRM_SUPPLIERS],
      crmAiInsights: [...DEFAULT_CRM_AI_INSIGHTS],
    };
  }

  // --- SOURCE METHODS ---
  public getSources(): SupplierSource[] {
    return this.data.sources;
  }

  public getSourceById(id: string): SupplierSource | undefined {
    return this.data.sources.find((s) => s.id === id);
  }

  public updateSource(id: string, updates: Partial<SupplierSource>): SupplierSource | undefined {
    const idx = this.data.sources.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.data.sources[idx] = {
        ...this.data.sources[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveToDiskSync();
      return this.data.sources[idx];
    }
    return undefined;
  }

  public upsertSource(source: SupplierSource) {
    const idx = this.data.sources.findIndex((s) => s.id === source.id);
    if (idx !== -1) {
      this.data.sources[idx] = {
        ...this.data.sources[idx],
        ...source,
        updatedAt: new Date().toISOString(),
      };
    } else {
      this.data.sources.push(source);
    }
    this.saveToDiskSync();
  }

  // --- BRANCH METHODS ---
  public getBranches(): SupplierBranch[] {
    return this.data.branches;
  }

  public getBranchesBySupplier(supplierId: string): SupplierBranch[] {
    return this.data.branches.filter((b) => b.supplierId === supplierId);
  }

  // --- MASTER PRODUCT METHODS ---
  public getMasterProducts(): MasterProduct[] {
    return this.data.masterProducts;
  }

  public getMasterProductById(id: string): MasterProduct | undefined {
    return this.data.masterProducts.find((p) => p.id === id);
  }

  public getMasterProductByBarcode(barcode: string): MasterProduct | undefined {
    if (!barcode) return undefined;
    return this.data.masterProducts.find((p) => p.barcode === barcode);
  }

  public getMasterProductBySku(sku: string): MasterProduct | undefined {
    if (!sku) return undefined;
    return this.data.masterProducts.find((p) => p.sku === sku);
  }

  public upsertMasterProduct(prod: MasterProduct) {
    const idx = this.data.masterProducts.findIndex((p) => p.id === prod.id);
    if (idx !== -1) {
      this.data.masterProducts[idx] = prod;
    } else {
      this.data.masterProducts.push(prod);
    }
    this.saveToDiskSync();
  }

  // --- RAW OBSERVATIONS ---
  public getRawObservations(limit = 100): RawObservation[] {
    return this.data.rawObservations.slice(-limit).reverse();
  }

  public addRawObservation(obs: RawObservation) {
    // Idempotency: check if identical observationHash exists for the same run
    const exists = this.data.rawObservations.some((o) => o.observationHash === obs.observationHash);
    if (!exists) {
      this.data.rawObservations.push(obs);
      this.saveToDiskSync();
    }
  }

  // --- PRICE RECORDS & HISTORY ---
  public getPriceRecords(): PriceRecord[] {
    return this.data.priceRecords;
  }

  public getPriceHistory(masterProductId?: string): PriceHistoryPoint[] {
    if (!masterProductId) {
      return this.data.priceHistory.slice(-200).reverse();
    }
    return this.data.priceHistory.filter((h) => h.masterProductId === masterProductId);
  }

  public addPriceRecord(record: PriceRecord): { isNew: boolean; isPriceChanged: boolean } {
    const existingIndex = this.data.priceRecords.findIndex(
      (r) => r.masterProductId === record.masterProductId && r.supplierId === record.supplierId
    );

    let isPriceChanged = false;

    if (existingIndex !== -1) {
      const prev = this.data.priceRecords[existingIndex];
      if (prev.price !== record.price) {
        isPriceChanged = true;
        record.previousPrice = prev.price;
        record.changePercent = Number((((record.price - prev.price) / prev.price) * 100).toFixed(2));
      }
      this.data.priceRecords[existingIndex] = record;
    } else {
      this.data.priceRecords.push(record);
    }

    // Always append to immutable price history
    const historyPoint: PriceHistoryPoint = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      masterProductId: record.masterProductId,
      productName: record.productName,
      supplierId: record.supplierId,
      supplierName: record.supplierName,
      price: record.price,
      observedAt: record.observedAt,
      sourceUrl: record.sourceUrl,
      runId: record.provenance.runId,
    };
    this.data.priceHistory.push(historyPoint);

    this.saveToDiskSync();
    return { isNew: existingIndex === -1, isPriceChanged };
  }

  // --- SCRAPER RUNS ---
  public getScraperRuns(limit = 50): ScraperRun[] {
    return this.data.scraperRuns.slice(-limit).reverse();
  }

  public getScraperRunById(id: string): ScraperRun | undefined {
    return this.data.scraperRuns.find((r) => r.id === id);
  }

  public addScraperRun(run: ScraperRun) {
    this.data.scraperRuns.push(run);
    this.saveToDiskSync();
  }

  public updateScraperRun(id: string, updates: Partial<ScraperRun>) {
    const idx = this.data.scraperRuns.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.data.scraperRuns[idx] = {
        ...this.data.scraperRuns[idx],
        ...updates,
      };
      this.saveToDiskSync();
    }
  }

  // --- DISCOVERED URLS ---
  public getDiscoveredUrls(sourceId: string): DiscoveredUrl[] {
    return this.data.discoveredUrls.filter((u) => u.sourceId === sourceId);
  }

  public upsertDiscoveredUrl(urlObj: DiscoveredUrl) {
    const idx = this.data.discoveredUrls.findIndex((u) => u.url === urlObj.url && u.sourceId === urlObj.sourceId);
    if (idx !== -1) {
      this.data.discoveredUrls[idx] = urlObj;
    } else {
      this.data.discoveredUrls.push(urlObj);
    }
    this.saveToDiskSync();
  }

  // --- SUPPLIER OFFERS ---
  public getSupplierOffers(): SupplierOffer[] {
    return this.data.supplierOffers;
  }

  public upsertSupplierOffer(offer: SupplierOffer) {
    const idx = this.data.supplierOffers.findIndex(
      (o) => o.masterProductId === offer.masterProductId && o.supplierId === offer.supplierId
    );
    if (idx !== -1) {
      this.data.supplierOffers[idx] = offer;
    } else {
      this.data.supplierOffers.push(offer);
    }
    this.saveToDiskSync();
  }

  // --- ARBITRAGE OPPORTUNITIES ---
  public getArbitrageOpportunities(): ArbitrageOpportunity[] {
    return this.data.arbitrageOpportunities;
  }

  public setArbitrageOpportunities(opps: ArbitrageOpportunity[]) {
    this.data.arbitrageOpportunities = opps;
    this.saveToDiskSync();
  }

  // --- INVENTORY ---
  public getInventory(): InventoryItem[] {
    return this.data.inventory || [];
  }
  public getInventoryByMasterProductId(id: string): InventoryItem | undefined {
    return (this.data.inventory || []).find(i => i.masterProductId === id);
  }
  public upsertInventory(item: InventoryItem) {
    if (!this.data.inventory) this.data.inventory = [];
    const idx = this.data.inventory.findIndex(i => i.masterProductId === item.masterProductId && i.storeId === item.storeId);
    if (idx !== -1) {
      this.data.inventory[idx] = item;
    } else {
      this.data.inventory.push(item);
    }
    this.saveToDiskSync();
  }

  // --- SALES ---
  public getSales(): SalesRecord[] {
    return this.data.sales || [];
  }
  public addSalesRecord(sale: SalesRecord) {
    if (!this.data.sales) this.data.sales = [];
    this.data.sales.push(sale);
    this.saveToDiskSync();
  }
  public addSale(sale: SalesRecord) {
    this.addSalesRecord(sale);
  }

  // --- DECISIONS ---
  public getDecisions(): DecisionRecord[] {
    return this.data.decisions || [];
  }
  public getDecisionById(id: string): DecisionRecord | undefined {
    return (this.data.decisions || []).find(d => d.id === id);
  }
  public upsertDecision(decision: DecisionRecord) {
    if (!this.data.decisions) this.data.decisions = [];
    const idx = this.data.decisions.findIndex(d => d.id === decision.id);
    if (idx !== -1) {
      this.data.decisions[idx] = decision;
    } else {
      this.data.decisions.push(decision);
    }
    this.saveToDiskSync();
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs || [];
  }
  public addAuditLog(log: AuditLog) {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    this.data.auditLogs.push(log);
    this.saveToDiskSync();
  }

  // --- SHARED OBSERVATIONS ---
  public getSharedObservations(): SharedObservation[] {
    return this.data.sharedObservations || [];
  }
  public addSharedObservation(obs: SharedObservation) {
    if (!this.data.sharedObservations) this.data.sharedObservations = [];
    this.data.sharedObservations.push(obs);
    this.saveToDiskSync();
  }

  // --- AGENT FINDINGS ---
  public getAgentFindings(): AgentFinding[] {
    return this.data.agentFindings || [];
  }
  public addAgentFinding(finding: AgentFinding) {
    if (!this.data.agentFindings) this.data.agentFindings = [];
    this.data.agentFindings.push(finding);
    this.saveToDiskSync();
  }

  // --- OPPORTUNITIES ---
  public getOpportunities(): Opportunity[] {
    return this.data.opportunities || [];
  }
  public getOpportunityById(id: string): Opportunity | undefined {
    return (this.data.opportunities || []).find(o => o.opportunityId === id);
  }
  public upsertOpportunity(opp: Opportunity) {
    if (!this.data.opportunities) this.data.opportunities = [];
    const idx = this.data.opportunities.findIndex(o => o.opportunityId === opp.opportunityId);
    if (idx !== -1) {
      this.data.opportunities[idx] = opp;
    } else {
      this.data.opportunities.push(opp);
    }
    this.saveToDiskSync();
  }

  // --- AGENT MEMORIES ---
  public getAgentMemories(): AgentMemory[] {
    return this.data.agentMemories || [];
  }
  public addAgentMemory(memory: AgentMemory) {
    if (!this.data.agentMemories) this.data.agentMemories = [];
    this.data.agentMemories.push(memory);
    this.saveToDiskSync();
  }

  // --- AGENT PERFORMANCES ---
  public getAgentPerformances(): AgentPerformance[] {
    return this.data.agentPerformances || [];
  }
  public upsertAgentPerformance(perf: AgentPerformance) {
    if (!this.data.agentPerformances) this.data.agentPerformances = [];
    const idx = this.data.agentPerformances.findIndex(p => p.agentId === perf.agentId);
    if (idx !== -1) {
      this.data.agentPerformances[idx] = perf;
    } else {
      this.data.agentPerformances.push(perf);
    }
    this.saveToDiskSync();
  }

  // --- EXECUTION EVIDENCE (LEDGER) ---
  public getExecutionEvidence(): AgentExecutionEvidence[] {
    return this.data.executionEvidence || [];
  }
  public addExecutionEvidence(ev: AgentExecutionEvidence) {
    if (!this.data.executionEvidence) this.data.executionEvidence = [];
    this.data.executionEvidence.push(ev);
    this.saveToDiskSync();
  }

  // --- RECOVERY AUDIT TRAIL ---
  public getRecoveryAttempts(sourceId?: string): RecoveryAttempt[] {
    const list = this.data.recoveryAttempts || [];
    if (sourceId) {
      return list.filter((r) => r.sourceId === sourceId);
    }
    return list;
  }
  public addRecoveryAttempt(attempt: RecoveryAttempt) {
    if (!this.data.recoveryAttempts) this.data.recoveryAttempts = [];
    this.data.recoveryAttempts.push(attempt);
    this.saveToDiskSync();
  }

  // --- RAW PRODUCT OBSERVATIONS (DATABASE A) ---
  public getRawProductObservations(): RawProductObservation[] {
    return this.data.rawProductObservations || [];
  }

  public getRawProductObservationBySourceRecordId(sourceRecordId: string): RawProductObservation | undefined {
    return (this.data.rawProductObservations || []).find((r) => r.sourceRecordId === sourceRecordId);
  }

  public upsertRawProductObservation(obs: RawProductObservation) {
    if (!this.data.rawProductObservations) this.data.rawProductObservations = [];
    const idx = this.data.rawProductObservations.findIndex((r) => r.sourceRecordId === obs.sourceRecordId);
    if (idx !== -1) {
      this.data.rawProductObservations[idx] = {
        ...this.data.rawProductObservations[idx],
        ...obs,
      };
    } else {
      this.data.rawProductObservations.push(obs);
    }
    this.saveToDiskSync();
  }

  // --- WORKFLOWS PERSISTENCE (P0-2) ---
  public listWorkflows(): WorkflowDefinition[] {
    return this.data.workflows || [];
  }

  public getWorkflows(): WorkflowDefinition[] {
    return this.listWorkflows();
  }

  public getWorkflow(id: string): WorkflowDefinition | undefined {
    return (this.data.workflows || []).find((w) => w.id === id);
  }

  public getWorkflowById(id: string): WorkflowDefinition | undefined {
    return this.getWorkflow(id);
  }

  public createWorkflow(wf: WorkflowDefinition): WorkflowDefinition {
    if (!this.data.workflows) this.data.workflows = [];
    const now = new Date().toISOString();
    const preparedWf: WorkflowDefinition = {
      ...wf,
      createdAt: wf.createdAt || now,
      updatedAt: now,
      status: wf.status || 'READY',
    };
    const idx = this.data.workflows.findIndex((w) => w.id === preparedWf.id);
    if (idx !== -1) {
      this.data.workflows[idx] = preparedWf;
    } else {
      this.data.workflows.push(preparedWf);
    }
    this.saveToDiskSync();
    return preparedWf;
  }

  public updateWorkflow(id: string, updates: Partial<WorkflowDefinition>): WorkflowDefinition | undefined {
    if (!this.data.workflows) this.data.workflows = [];
    const idx = this.data.workflows.findIndex((w) => w.id === id);
    if (idx !== -1) {
      this.data.workflows[idx] = {
        ...this.data.workflows[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveToDiskSync();
      return this.data.workflows[idx];
    }
    return undefined;
  }

  public deleteWorkflow(id: string): boolean {
    if (!this.data.workflows) return false;
    const initialLen = this.data.workflows.length;
    this.data.workflows = this.data.workflows.filter((w) => w.id !== id);
    if (this.data.workflows.length !== initialLen) {
      this.saveToDiskSync();
      return true;
    }
    return false;
  }

  // --- WORKFLOW EXECUTION RUNS PERSISTENCE (P0-2) ---
  public listExecutionRuns(limit = 50): WorkflowExecutionRun[] {
    const list = this.data.workflowExecutionRuns || [];
    return list.slice(-limit).reverse();
  }

  public getExecutionRuns(limit = 50): WorkflowExecutionRun[] {
    return this.listExecutionRuns(limit);
  }

  public getExecutionRun(runId: string): WorkflowExecutionRun | undefined {
    return (this.data.workflowExecutionRuns || []).find((r) => r.runId === runId || r.executionId === runId);
  }

  public getExecutionRunById(runId: string): WorkflowExecutionRun | undefined {
    return this.getExecutionRun(runId);
  }

  public createExecutionRun(run: WorkflowExecutionRun): WorkflowExecutionRun {
    if (!this.data.workflowExecutionRuns) this.data.workflowExecutionRuns = [];
    const runId = run.runId || run.executionId || `wfrun-${Date.now()}`;
    const preparedRun: WorkflowExecutionRun = {
      ...run,
      runId,
      executionId: run.executionId || runId,
      startedAt: run.startedAt || new Date().toISOString(),
      completedAt: run.completedAt || run.finishedAt,
      finishedAt: run.finishedAt || run.completedAt,
    };
    const idx = this.data.workflowExecutionRuns.findIndex((r) => r.runId === runId || r.executionId === runId);
    if (idx !== -1) {
      this.data.workflowExecutionRuns[idx] = preparedRun;
    } else {
      this.data.workflowExecutionRuns.push(preparedRun);
    }
    this.saveToDiskSync();
    return preparedRun;
  }

  public updateExecutionRun(runId: string, updates: Partial<WorkflowExecutionRun>): WorkflowExecutionRun | undefined {
    if (!this.data.workflowExecutionRuns) this.data.workflowExecutionRuns = [];
    const idx = this.data.workflowExecutionRuns.findIndex((r) => r.runId === runId || r.executionId === runId);
    if (idx !== -1) {
      const existing = this.data.workflowExecutionRuns[idx];
      const finishedAt = updates.finishedAt || updates.completedAt || existing.finishedAt || existing.completedAt;
      const completedAt = updates.completedAt || updates.finishedAt || existing.completedAt || existing.finishedAt;
      this.data.workflowExecutionRuns[idx] = {
        ...existing,
        ...updates,
        finishedAt,
        completedAt,
      };
      this.saveToDiskSync();
      return this.data.workflowExecutionRuns[idx];
    }
    return undefined;
  }

  // ====================================================
  // CRM & CUSTOMER 360 PERSISTENCE & QUERY METHODS
  // ====================================================

  public listCustomers(filters?: {
    search?: string;
    status?: string;
    segment?: string;
    zone?: string;
    tenantId?: string;
  }): CrmCustomer[] {
    let list = this.data.crmCustomers || [];
    if (!filters) return list;

    if (filters.tenantId) {
      list = list.filter((c) => c.tenantId === filters.tenantId);
    }
    if (filters.status && filters.status !== 'ALL') {
      list = list.filter((c) => c.status === filters.status);
    }
    if (filters.segment && filters.segment !== 'ALL') {
      list = list.filter((c) => c.segment === filters.segment);
    }
    if (filters.zone && filters.zone !== 'ALL') {
      list = list.filter((c) => c.zone === filters.zone);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.businessName.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return list;
  }

  public getCustomer(id: string): CrmCustomer | undefined {
    return (this.data.crmCustomers || []).find((c) => c.id === id || c.tenantId === id);
  }

  public createCustomer(data: Partial<CrmCustomer>): CrmCustomer {
    if (!this.data.crmCustomers) this.data.crmCustomers = [];
    const now = new Date().toISOString();
    const customerId = data.id || `cust-${Date.now()}`;
    const newCustomer: CrmCustomer = {
      id: customerId,
      tenantId: data.tenantId || `tenant-${customerId}`,
      name: data.name || 'Nueva Tienda',
      businessName: data.businessName || data.name || 'Razón Social Pendiente',
      type: data.type || 'TIENDA_ABARROTES',
      status: data.status || 'PROSPECTO',
      segment: data.segment || 'TIER_C',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      city: data.city || 'Ciudad de México',
      zone: data.zone || 'CENTRO',
      assignedTo: data.assignedTo || 'Equipo de Operaciones',
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
      monthlySales: data.monthlySales || 0,
      avgTicket: data.avgTicket || 0,
      purchaseFrequencyDays: data.purchaseFrequencyDays || 7,
      monitoredSkus: data.monitoredSkus || 0,
      grossMarginPercent: data.grossMarginPercent || 20.0,
      churnRiskScore: data.churnRiskScore || 15,
      lastPurchaseDate: data.lastPurchaseDate || now,
      daysSinceLastPurchase: data.daysSinceLastPurchase || 0,
      estimatedLTV: data.estimatedLTV || (data.monthlySales ? data.monthlySales * 12 : 100000),
      notes: data.notes || '',
      tags: data.tags || ['NUEVO']
    };

    this.data.crmCustomers.unshift(newCustomer);

    // If initial primary contact provided
    if (data.phone || data.email) {
      this.createContact({
        customerId: newCustomer.id,
        tenantId: newCustomer.tenantId,
        name: newCustomer.name + ' (Contacto Principal)',
        role: 'PROPIETARIO',
        phone: newCustomer.phone,
        email: newCustomer.email,
        isPrimary: true,
        status: 'ACTIVO'
      });
    }

    this.saveToDiskSync();
    return newCustomer;
  }

  public updateCustomer(id: string, updates: Partial<CrmCustomer>): CrmCustomer | undefined {
    if (!this.data.crmCustomers) this.data.crmCustomers = [];
    const idx = this.data.crmCustomers.findIndex((c) => c.id === id || c.tenantId === id);
    if (idx !== -1) {
      this.data.crmCustomers[idx] = {
        ...this.data.crmCustomers[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveToDiskSync();
      return this.data.crmCustomers[idx];
    }
    return undefined;
  }

  public deleteCustomer(id: string): boolean {
    if (!this.data.crmCustomers) return false;
    const initialLen = this.data.crmCustomers.length;
    this.data.crmCustomers = this.data.crmCustomers.filter((c) => c.id !== id && c.tenantId !== id);
    if (this.data.crmCustomers.length !== initialLen) {
      this.saveToDiskSync();
      return true;
    }
    return false;
  }

  // --- CONTACTS ---
  public listContacts(customerId?: string): CrmContact[] {
    const list = this.data.crmContacts || [];
    if (customerId) {
      return list.filter((c) => c.customerId === customerId || c.tenantId === customerId);
    }
    return list;
  }

  public getContact(id: string): CrmContact | undefined {
    return (this.data.crmContacts || []).find((c) => c.id === id);
  }

  public createContact(data: Partial<CrmContact>): CrmContact {
    if (!this.data.crmContacts) this.data.crmContacts = [];
    const now = new Date().toISOString();
    const newContact: CrmContact = {
      id: data.id || `cnt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      customerId: data.customerId || '',
      tenantId: data.tenantId || '',
      name: data.name || 'Nuevo Contacto',
      role: data.role || 'PROPIETARIO',
      phone: data.phone || '',
      email: data.email || '',
      isPrimary: data.isPrimary ?? false,
      status: data.status || 'ACTIVO',
      preferences: data.preferences || 'Contacto vía WhatsApp',
      lastInteractionAt: now,
      assignedTo: data.assignedTo || 'Equipo Comercial',
      notes: data.notes || '',
      createdAt: now
    };
    this.data.crmContacts.push(newContact);
    this.saveToDiskSync();
    return newContact;
  }

  public updateContact(id: string, updates: Partial<CrmContact>): CrmContact | undefined {
    if (!this.data.crmContacts) this.data.crmContacts = [];
    const idx = this.data.crmContacts.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.data.crmContacts[idx] = {
        ...this.data.crmContacts[idx],
        ...updates
      };
      this.saveToDiskSync();
      return this.data.crmContacts[idx];
    }
    return undefined;
  }

  public deleteContact(id: string): boolean {
    if (!this.data.crmContacts) return false;
    const initialLen = this.data.crmContacts.length;
    this.data.crmContacts = this.data.crmContacts.filter((c) => c.id !== id);
    if (this.data.crmContacts.length !== initialLen) {
      this.saveToDiskSync();
      return true;
    }
    return false;
  }

  // --- DEAL OPPORTUNITIES ---
  public listDealOpportunities(filters?: { customerId?: string; stage?: string }): CrmDealOpportunity[] {
    let list = this.data.crmOpportunities || [];
    if (filters?.customerId) {
      list = list.filter((o) => o.customerId === filters.customerId || o.tenantId === filters.customerId);
    }
    if (filters?.stage && filters.stage !== 'ALL') {
      list = list.filter((o) => o.stage === filters.stage);
    }
    return list;
  }

  public getDealOpportunity(id: string): CrmDealOpportunity | undefined {
    return (this.data.crmOpportunities || []).find((o) => o.id === id);
  }

  public createDealOpportunity(data: Partial<CrmDealOpportunity>): CrmDealOpportunity {
    if (!this.data.crmOpportunities) this.data.crmOpportunities = [];
    const now = new Date().toISOString();
    const customer = data.customerId ? this.getCustomer(data.customerId) : undefined;
    const newDeal: CrmDealOpportunity = {
      id: data.id || `crm-opp-${Date.now()}`,
      customerId: data.customerId || '',
      tenantId: data.tenantId || customer?.tenantId || 'tenant-cdmx-01',
      customerName: data.customerName || customer?.name || 'Cliente Comercial',
      title: data.title || 'Nueva Oportunidad de Ahorro / Venta',
      stage: data.stage || 'NUEVO',
      value: data.value || 0,
      estimatedSavings: data.estimatedSavings || 0,
      probability: data.probability ?? 50,
      expectedCloseDate: data.expectedCloseDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      source: data.source || 'MANUAL_OPERATOR',
      assignedTo: data.assignedTo || 'Equipo Comercial',
      notes: data.notes || '',
      nextAction: data.nextAction || 'Seguimiento inicial',
      nextActionDate: data.nextActionDate || new Date(Date.now() + 86400000).toISOString(),
      createdAt: now,
      updatedAt: now
    };
    this.data.crmOpportunities.unshift(newDeal);
    this.saveToDiskSync();
    return newDeal;
  }

  public updateDealOpportunity(id: string, updates: Partial<CrmDealOpportunity>): CrmDealOpportunity | undefined {
    if (!this.data.crmOpportunities) this.data.crmOpportunities = [];
    const idx = this.data.crmOpportunities.findIndex((o) => o.id === id);
    if (idx !== -1) {
      this.data.crmOpportunities[idx] = {
        ...this.data.crmOpportunities[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveToDiskSync();
      return this.data.crmOpportunities[idx];
    }
    return undefined;
  }

  public deleteDealOpportunity(id: string): boolean {
    if (!this.data.crmOpportunities) return false;
    const initialLen = this.data.crmOpportunities.length;
    this.data.crmOpportunities = this.data.crmOpportunities.filter((o) => o.id !== id);
    if (this.data.crmOpportunities.length !== initialLen) {
      this.saveToDiskSync();
      return true;
    }
    return false;
  }

  // --- ACTIVITIES ---
  public listActivities(filters?: { customerId?: string; type?: string }): CrmActivity[] {
    let list = this.data.crmActivities || [];
    if (filters?.customerId) {
      list = list.filter((a) => a.customerId === filters.customerId || a.tenantId === filters.customerId);
    }
    if (filters?.type && filters.type !== 'ALL') {
      list = list.filter((a) => a.type === filters.type);
    }
    return list.slice().reverse();
  }

  public createActivity(data: Partial<CrmActivity>): CrmActivity {
    if (!this.data.crmActivities) this.data.crmActivities = [];
    const now = new Date().toISOString();
    const newActivity: CrmActivity = {
      id: data.id || `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      customerId: data.customerId || '',
      tenantId: data.tenantId || '',
      opportunityId: data.opportunityId,
      type: data.type || 'NOTA',
      title: data.title || 'Nueva actividad registrada',
      description: data.description || '',
      performedBy: data.performedBy || 'Operador Back Office',
      outcome: data.outcome,
      scheduledAt: data.scheduledAt,
      completedAt: data.completedAt || now,
      createdAt: now
    };
    this.data.crmActivities.push(newActivity);

    // Update customer lastActivityAt
    if (newActivity.customerId) {
      this.updateCustomer(newActivity.customerId, { lastActivityAt: now });
    }

    this.saveToDiskSync();
    return newActivity;
  }

  // --- TASKS ---
  public listTasks(filters?: {
    customerId?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
  }): CrmTask[] {
    let list = this.data.crmTasks || [];
    if (filters?.customerId) {
      list = list.filter((t) => t.customerId === filters.customerId || t.tenantId === filters.customerId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((t) => t.status === filters.status);
    }
    if (filters?.priority && filters.priority !== 'ALL') {
      list = list.filter((t) => t.priority === filters.priority);
    }
    if (filters?.assignedTo) {
      list = list.filter((t) => t.assignedTo.toLowerCase().includes(filters.assignedTo!.toLowerCase()));
    }
    return list;
  }

  public getTask(id: string): CrmTask | undefined {
    return (this.data.crmTasks || []).find((t) => t.id === id);
  }

  public createTask(data: Partial<CrmTask>): CrmTask {
    if (!this.data.crmTasks) this.data.crmTasks = [];
    const now = new Date().toISOString();
    const customer = data.customerId ? this.getCustomer(data.customerId) : undefined;
    const newTask: CrmTask = {
      id: data.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      customerId: data.customerId || '',
      tenantId: data.tenantId || customer?.tenantId || '',
      customerName: data.customerName || customer?.name || 'Cliente General',
      opportunityId: data.opportunityId,
      title: data.title || 'Nueva tarea operativa',
      description: data.description || '',
      assignedTo: data.assignedTo || 'Equipo Comercial',
      priority: data.priority || 'MEDIA',
      status: data.status || 'PENDIENTE',
      dueDate: data.dueDate || new Date(Date.now() + 86400000).toISOString(),
      source: data.source || 'MANUAL_OPERATOR',
      completedAt: data.status === 'COMPLETADA' ? now : undefined,
      createdAt: now
    };
    this.data.crmTasks.unshift(newTask);
    this.saveToDiskSync();
    return newTask;
  }

  public updateTask(id: string, updates: Partial<CrmTask>): CrmTask | undefined {
    if (!this.data.crmTasks) this.data.crmTasks = [];
    const idx = this.data.crmTasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      const now = new Date().toISOString();
      const isCompletedNow = updates.status === 'COMPLETADA' && this.data.crmTasks[idx].status !== 'COMPLETADA';
      this.data.crmTasks[idx] = {
        ...this.data.crmTasks[idx],
        ...updates,
        completedAt: isCompletedNow ? now : updates.completedAt || this.data.crmTasks[idx].completedAt
      };
      this.saveToDiskSync();
      return this.data.crmTasks[idx];
    }
    return undefined;
  }

  public deleteTask(id: string): boolean {
    if (!this.data.crmTasks) return false;
    const initialLen = this.data.crmTasks.length;
    this.data.crmTasks = this.data.crmTasks.filter((t) => t.id !== id);
    if (this.data.crmTasks.length !== initialLen) {
      this.saveToDiskSync();
      return true;
    }
    return false;
  }

  // --- SUPPLIERS / PARTNERS ---
  public listSupplierPartners(): CrmSupplierPartner[] {
    return this.data.crmSuppliers || [];
  }

  public createSupplierPartner(data: Partial<CrmSupplierPartner>): CrmSupplierPartner {
    if (!this.data.crmSuppliers) this.data.crmSuppliers = [];
    const newSupp: CrmSupplierPartner = {
      id: data.id || `supp-crm-${Date.now()}`,
      name: data.name || 'Nuevo Proveedor Mayorista',
      contactPerson: data.contactPerson || 'Representante Comercial',
      phone: data.phone || '',
      email: data.email || '',
      categories: data.categories || ['Abarrotes'],
      coverage: data.coverage || 'CDMX',
      commercialTerms: data.commercialTerms || 'Contado comercial',
      leadTimeDays: data.leadTimeDays || 1,
      minOrderAmount: data.minOrderAmount || 1000,
      creditDays: data.creditDays || 0,
      reliabilityScore: data.reliabilityScore || 90,
      lastQuoteAt: new Date().toISOString(),
      score: data.score || 9.0,
      activePromosCount: data.activePromosCount || 0
    };
    this.data.crmSuppliers.push(newSupp);
    this.saveToDiskSync();
    return newSupp;
  }

  // --- AI INSIGHTS ---
  public listAiInsights(customerId?: string): CrmAiInsight[] {
    const list = (this.data.crmAiInsights || []).filter((i) => !i.dismissed);
    if (customerId) {
      return list.filter((i) => i.customerId === customerId || i.tenantId === customerId);
    }
    return list;
  }

  public createAiInsight(data: Partial<CrmAiInsight>): CrmAiInsight {
    if (!this.data.crmAiInsights) this.data.crmAiInsights = [];
    const customer = data.customerId ? this.getCustomer(data.customerId) : undefined;
    const newInsight: CrmAiInsight = {
      id: data.id || `insight-${Date.now()}`,
      customerId: data.customerId || '',
      tenantId: data.tenantId || customer?.tenantId || '',
      customerName: data.customerName || customer?.name || 'Cliente',
      type: data.type || 'CHURN_RISK',
      severity: data.severity || 'ALERTA',
      title: data.title || 'Recomendación de Inteligencia Comercial',
      description: data.description || '',
      estimatedImpact: data.estimatedImpact || 0,
      suggestedAction: data.suggestedAction || '',
      confidence: data.confidence || 0.9,
      generatedAt: new Date().toISOString(),
      dismissed: false
    };
    this.data.crmAiInsights.unshift(newInsight);
    this.saveToDiskSync();
    return newInsight;
  }

  public dismissAiInsight(id: string): boolean {
    if (!this.data.crmAiInsights) return false;
    const idx = this.data.crmAiInsights.findIndex((i) => i.id === id);
    if (idx !== -1) {
      this.data.crmAiInsights[idx].dismissed = true;
      this.saveToDiskSync();
      return true;
    }
    return false;
  }

  // --- CUSTOMER 360 UNIFIED VIEW ---
  public getCustomer360(customerId: string): Customer360View | null {
    const customer = this.getCustomer(customerId);
    if (!customer) return null;

    const contacts = this.listContacts(customer.id);
    const opportunities = this.listDealOpportunities({ customerId: customer.id });
    const activities = this.listActivities({ customerId: customer.id });
    const tasks = this.listTasks({ customerId: customer.id });
    const aiInsights = this.listAiInsights(customer.id);

    // Compute real inventory health for this tenant
    const inv = this.getInventory().filter((i) => i.tenantId === customer.tenantId);
    const criticalSkus = inv.filter((i) => (i.quantity / (i.averageDailySales || 1)) < 2.5).length;
    const stockValue = inv.reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);
    const totalDailyVelocity = inv.reduce((acc, i) => acc + (i.averageDailySales || 0), 0);
    const totalStock = inv.reduce((acc, i) => acc + (i.quantity || 0), 0);
    const daysOfInventory = totalDailyVelocity > 0 ? Number((totalStock / totalDailyVelocity).toFixed(1)) : 14.5;

    const recentPurchases = this.getSales().filter((s) => (s as any).tenantId === customer.tenantId).slice(-10).reverse();
    const auditLogs = (this.data.auditLogs || []).filter((l) => l.tenantId === customer.tenantId).slice(-15).reverse();

    return {
      customer,
      contacts,
      opportunities,
      activities,
      tasks,
      aiInsights,
      recentPurchases,
      inventoryHealth: {
        totalSkus: inv.length || customer.monitoredSkus || 248,
        criticalSkus,
        stockValue: stockValue || (customer.monthlySales * 0.4),
        daysOfInventory
      },
      auditLogs
    };
  }

  // --- CRM OVERVIEW METRICS ---
  public getCrmOverview() {
    const customers = this.data.crmCustomers || [];
    const active = customers.filter((c) => c.status === 'ACTIVO').length;
    const atRisk = customers.filter((c) => c.status === 'EN_RIESGO').length;
    const prospects = customers.filter((c) => c.status === 'PROSPECTO').length;

    const opportunities = this.data.crmOpportunities || [];
    const pipelineValue = opportunities
      .filter((o) => o.stage !== 'PERDIDO')
      .reduce((acc, o) => acc + o.value, 0);
    const totalEstimatedSavings = opportunities
      .filter((o) => o.stage !== 'PERDIDO')
      .reduce((acc, o) => acc + o.estimatedSavings, 0);

    const tasks = this.data.crmTasks || [];
    const pendingTasks = tasks.filter((t) => t.status === 'PENDIENTE' || t.status === 'HOY').length;
    const todayTasks = tasks.filter((t) => t.status === 'HOY').length;

    const aiInsights = (this.data.crmAiInsights || []).filter((i) => !i.dismissed);
    const criticalInsights = aiInsights.filter((i) => i.severity === 'CRITICO').length;

    const suppliers = this.data.crmSuppliers || [];

    return {
      totalCustomers: customers.length,
      activeCustomers: active,
      atRiskCustomers: atRisk,
      prospectCustomers: prospects,
      pipelineValue,
      totalEstimatedSavings,
      opportunitiesCount: opportunities.length,
      pendingTasks,
      todayTasks,
      aiInsightsCount: aiInsights.length,
      criticalInsightsCount: criticalInsights,
      activeSuppliersCount: suppliers.length,
      avgCustomerSales: customers.length > 0 ? Math.round(customers.reduce((acc, c) => acc + c.monthlySales, 0) / customers.length) : 0,
      avgGrossMargin: customers.length > 0 ? Number((customers.reduce((acc, c) => acc + c.grossMarginPercent, 0) / customers.length).toFixed(1)) : 25.0
    };
  }
}

export const db = new MarketDatabase();
