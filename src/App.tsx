import React, { useState, useEffect } from 'react';

// Landing Page Components (Hilo 3 - Congelada)
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { UrbanNetworkVisual } from './components/UrbanNetworkVisual';
import { ProblemSection } from './components/ProblemSection';
import { PromotionsSection } from './components/PromotionsSection';
import { ScanSection } from './components/ScanSection';
import { IntelligenceDecisionSection } from './components/IntelligenceDecisionSection';
import { DailyOpportunitiesSection } from './components/DailyOpportunitiesSection';
import { PosPhilosophySection } from './components/PosPhilosophySection';
import { PosIntegrationSection } from './components/PosIntegrationSection';
import { EconomicValueSection } from './components/EconomicValueSection';
import { PosCapabilitiesSection } from './components/PosCapabilitiesSection';
import { FutureVisionSection } from './components/FutureVisionSection';
import { TrialSection } from './components/TrialSection';
import { PricingSection } from './components/PricingSection';
import { FaqSection } from './components/FaqSection';
import { FinalCtaSection } from './components/FinalCtaSection';
import { AiAdvisorSection } from './components/AiAdvisorSection';
import { FeaturesGridSection } from './components/FeaturesGridSection';
import { ProductShowcase3DSection } from './components/3d/ProductShowcase3D';
import { Footer } from './components/Footer';
import { TrialModal } from './components/TrialModal';

// Product UX Components for Hilo 4, Hilo 5 & Hilo 6 (13 Views)
import { AppHeader } from './components/product/AppHeader';
import { AppNavigationSubBar } from './components/product/AppNavigationSubBar';
import { NavigationBottomBar, ProductTab } from './components/product/NavigationBottomBar';
import { StoreBrainOperatingSystemView } from './components/product/StoreBrainOperatingSystemView';
import { TodayDashboardView } from './components/product/TodayDashboardView';
import { PosRegisterView } from './components/product/PosRegisterView';
import { SalesDemandAnalyticsView } from './components/product/SalesDemandAnalyticsView';
import { InventoryRotationView } from './components/product/InventoryRotationView';
import { BarcodeScannerView } from './components/product/BarcodeScannerView';
import { PurchasesSuppliersView } from './components/product/PurchasesSuppliersView';
import { PriceIntelligenceView } from './components/product/PriceIntelligenceView';
import { ProductMatchingView } from './components/product/ProductMatchingView';
import { OpportunitiesCenterView } from './components/product/OpportunitiesCenterView';
import { AIAgentsDashboardView } from './components/product/AIAgentsDashboardView';
import { PromoCalculatorView } from './components/product/PromoCalculatorView';
import { AlertsAuditView } from './components/product/AlertsAuditView';
import { StoreSettingsView } from './components/product/StoreSettingsView';
import { OnboardingModal } from './components/product/OnboardingModal';
import { LiveDataAcquisitionMonitor } from './components/product/LiveDataAcquisitionMonitor';
import { ControlCenterView } from './components/product/ControlCenterView';
import { ProductionHealth } from './components/product/ProductionHealth';
import { BenchmarkView } from './components/product/BenchmarkView';
import { SheetsIntelligenceView } from './components/product/SheetsIntelligenceView';
import { IntegrationsHubView } from './components/product/IntegrationsHubView';
import { SystemConfigView } from './components/product/SystemConfigView';
import { SecurityAccessView } from './components/product/SecurityAccessView';
import { CrmModuleView } from './components/product/crm/CrmModuleView';
import { 
  Sparkles, 
  RefreshCw, 
  DollarSign, 
  ClipboardList, 
  Calculator, 
  Package, 
  ScanBarcode, 
  Handshake, 
  Compass, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  History, 
  Settings,
  ArrowRight,
  TrendingDown,
  Activity,
  Plus,
  Minus,
  Briefcase
} from 'lucide-react';

// Data & Initial Domain States
import { 
  DEFAULT_STORE_PROFILE, 
  INITIAL_INVENTORY_ITEMS, 
  INITIAL_SUPPLIERS,
  INITIAL_INVENTORY_MOVEMENTS,
  INITIAL_PRICE_RECORDS,
  INITIAL_SCRAPER_JOBS,
  INITIAL_PRODUCT_MATCH_ITEMS,
  INITIAL_AI_AGENTS,
  INITIAL_DAILY_OPPORTUNITIES, 
  INITIAL_SMART_ALERTS,
  INITIAL_DECISION_HISTORY,
  INITIAL_DATA_QUALITY_ISSUES,
  INITIAL_SALES_HISTORY,
  INITIAL_COST_VARIANCES,
  INITIAL_PURCHASE_QUEUE,
  INITIAL_CASH_RECONCILIATIONS,
  MULTI_TENANT_STORES
} from './data/productData';
import { 
  StoreProfile, 
  TenantStore,
  InventoryItem, 
  InventoryMovement,
  SupplierEntity,
  PriceRecord,
  ScraperJob,
  ProductMatchItem,
  AIAgentContract,
  DailyOpportunity, 
  SmartAlert,
  AuditLogEntry,
  DataQualityReport,
  SaleTransaction,
  SaleItem,
  PaymentRecord,
  PurchaseQueueItem,
  ReceivingCostVariance,
  CashReconciliationRecord
} from './types';
import { 
  executeSaleTransaction, 
  executeRefundTransaction, 
  executeCancelTransaction 
} from './services/transactionEngine';

export default function App() {
  // Mode switch: 'app' (Mi Tienda) or 'landing' (Landing Oficial Congelada)
  const [viewMode, setViewMode] = useState<'app' | 'landing'>('landing');
  
  // Morning Brief Synthesis (from Store Manager Agent)
  const [synthesis, setSynthesis] = useState<string>('');

  useEffect(() => {
    fetch('/api/store-brain/morning-brief')
      .then(async r => {
        const contentType = r.headers.get("content-type");
        if (r.ok && contentType && contentType.includes("application/json")) {
          return r.json();
        }
        return {
          synthesis: "¡Buenos días! El sistema de Inteligencia Artificial está procesando una alta demanda o se encuentra en modo de ahorro de energía. Sin embargo, tus módulos locales de control de inventario y punto de venta están operando al 100%."
        };
      })
      .then(data => {
        if (data && data.synthesis) {
          setSynthesis(data.synthesis);
        }
      })
      .catch(() => {
        setSynthesis("¡Buenos días! El sistema de Inteligencia Artificial está procesando una alta demanda o se encuentra en modo de ahorro de energía. Sin embargo, tus módulos locales de control de inventario y punto de venta están operando al 100%.");
      });
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  
  // Active product tab inside the app (Customer tabs vs Back Office)
  const [activeTab, setActiveTab] = useState<ProductTab>('pos');

  // Sub-tabs states for Customer & Back Office views
  const [cajaSubTab, setCajaSubTab] = useState<'cobrar' | 'historial' | 'promos'>('cobrar');
  const [productosSubTab, setProductosSubTab] = useState<'lector' | 'matching'>('lector');
  const [comprasSubTab, setComprasSubTab] = useState<'oportunidades' | 'ordenes' | 'precios' | 'excedentes'>('oportunidades');
  const [backOfficeSubTab, setBackOfficeSubTab] = useState<
    | 'control'
    | 'crm'
    | 'agents'
    | 'scrapers'
    | 'data'
    | 'sheets'
    | 'integrations'
    | 'health'
    | 'benchmark'
    | 'alerts'
    | 'audit'
    | 'testing'
    | 'config'
    | 'security'
    | 'analytics'
    | 'incidents'
  >('control');

  // Interactive peer-to-peer store marketplace CDMX state (Hilo 21)
  const [tradingItems, setTradingItems] = useState([
    { id: 't1', storeName: 'Abarrotes La Lupita', distance: '1.2 km', name: 'Coca-Cola 600ml', brand: 'Coca-Cola', barcode: '7501055301088', qty: 24, offerPrice: 13.50, standardPrice: 15.80, savings: 55.20, applied: false },
    { id: 't2', storeName: 'Miscelánea El Sol', distance: '2.8 km', name: 'Leche Lala Entera 1L', brand: 'Lala', barcode: '7501020512344', qty: 12, offerPrice: 19.00, standardPrice: 22.50, savings: 42.00, applied: false },
    { id: 't3', storeName: 'Súper Exprés CDMX', distance: '3.1 km', name: 'Jabón Roma 1kg', brand: 'Roma', barcode: '7501007200114', qty: 15, offerPrice: 29.50, standardPrice: 34.00, savings: 67.50, applied: false }
  ]);
  
  // Modals
  const [isTrialModalOpen, setIsTrialModalOpen] = useState<boolean>(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);
  
  // App Domain State
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(DEFAULT_STORE_PROFILE);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY_ITEMS);
  const [movements, setMovements] = useState<InventoryMovement[]>(INITIAL_INVENTORY_MOVEMENTS);
  const [suppliers, setSuppliers] = useState<SupplierEntity[]>(INITIAL_SUPPLIERS);
  const [priceRecords, setPriceRecords] = useState<PriceRecord[]>(INITIAL_PRICE_RECORDS);
  const [scraperJobs, setScraperJobs] = useState<ScraperJob[]>(INITIAL_SCRAPER_JOBS);
  const [matchQueue, setMatchQueue] = useState<ProductMatchItem[]>(INITIAL_PRODUCT_MATCH_ITEMS);
  const [qualityReports, setQualityReports] = useState<DataQualityReport[]>(INITIAL_DATA_QUALITY_ISSUES);
  const [aiAgents, setAiAgents] = useState<AIAgentContract[]>(INITIAL_AI_AGENTS);
  const [opportunities, setOpportunities] = useState<DailyOpportunity[]>(INITIAL_DAILY_OPPORTUNITIES);
  const [alerts, setAlerts] = useState<SmartAlert[]>(INITIAL_SMART_ALERTS);
  const [sales, setSales] = useState<SaleTransaction[]>(INITIAL_SALES_HISTORY);
  const [costVariances, setCostVariances] = useState<ReceivingCostVariance[]>(INITIAL_COST_VARIANCES);
  const [purchaseQueue, setPurchaseQueue] = useState<PurchaseQueueItem[]>(INITIAL_PURCHASE_QUEUE);
  const [reconciliationHistory, setReconciliationHistory] = useState<CashReconciliationRecord[]>(INITIAL_CASH_RECONCILIATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-1',
      date: '15 Feb 2026',
      timestamp: '06:30 AM',
      actor: 'Price Monitor Agent (A03)',
      action: 'Scraping matutino ejecutado',
      detail: 'Actualizadas 2,050 cotizaciones de Central de Abastos y Zorro.',
      result: 'Éxito',
      storeId: 'store-1',
    },
    {
      id: 'log-2',
      date: '15 Feb 2026',
      timestamp: '06:31 AM',
      actor: 'Opportunity Agent (A09)',
      action: 'Generación de oportunidades',
      detail: 'Detectado ahorro de $76.80 en Aceite Nutrioli con Scorpion.',
      result: 'Oportunidad creada',
      storeId: 'store-1',
    }
  ]);

  // Hilo 5 Transactional Handlers: POS Sales, Refunds, Cancellations
  const handleExecuteSale = (
    saleItems: SaleItem[], 
    payment: PaymentRecord, 
    notes?: string
  ): SaleTransaction => {
    const result = executeSaleTransaction(
      inventory,
      movements,
      auditLogs,
      'store-1',
      storeProfile.ownerName,
      saleItems,
      payment,
      notes
    );

    setSales((prev) => [result.sale, ...prev]);
    setInventory(result.updatedInventory);
    setMovements(result.updatedMovements);
    setAuditLogs(result.updatedAuditLogs);

    return result.sale;
  };

  const handleExecuteRefund = (
    sale: SaleTransaction, 
    refundReason: string, 
    restock: boolean
  ) => {
    const result = executeRefundTransaction(
      inventory,
      movements,
      auditLogs,
      sales,
      sale.id,
      storeProfile.ownerName,
      refundReason,
      restock
    );

    setSales(result.updatedSales);
    setInventory(result.updatedInventory);
    setMovements(result.updatedMovements);
    setAuditLogs(result.updatedAuditLogs);
  };

  const handleExecuteCancel = (
    sale: SaleTransaction, 
    cancellationMotive: string
  ) => {
    const result = executeCancelTransaction(
      inventory,
      movements,
      auditLogs,
      sales,
      sale.id,
      storeProfile.ownerName,
      cancellationMotive
    );

    setSales(result.updatedSales);
    setInventory(result.updatedInventory);
    setMovements(result.updatedMovements);
    setAuditLogs(result.updatedAuditLogs);
  };

  // 1. Record purchase
  const handleRecordPurchase = (
    productId: string, 
    units: number, 
    supplier: string, 
    pricePaid: number, 
    savings: number
  ) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newStock = item.currentStock + units;
          const newDaysOfStock = item.avgDailySales > 0 ? newStock / item.avgDailySales : 10;
          return {
            ...item,
            currentStock: newStock,
            daysOfStock: newDaysOfStock,
            lastCostPaid: pricePaid,
            stockStatus: newDaysOfStock < 2.5 ? 'CRÍTICO' : newDaysOfStock > 20 ? 'SOBRESTOCK' : 'NORMAL',
            lastUpdated: 'Hoy',
          };
        }
        return item;
      })
    );

    const targetProduct = inventory.find((i) => i.id === productId);
    const prodName = targetProduct ? targetProduct.name : 'Producto';
    const prodBarcode = targetProduct ? targetProduct.barcode : '7500000000000';

    // Record movement in Kardex
    const newMovement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      date: 'Hoy',
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      productId,
      productName: prodName,
      barcode: prodBarcode,
      quantity: units,
      type: 'compra',
      typeLabel: `Compra a ${supplier}`,
      unitCost: pricePaid,
      user: storeProfile.ownerName,
      storeId: 'store-1',
      reference: `PO-${Date.now().toString().slice(-4)}`,
      motive: `Reabastecimiento con ${supplier}`,
    };
    setMovements((prev) => [newMovement, ...prev]);

    // Record in Audit Trail
    const newAuditLog: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      date: 'Hoy',
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      actor: `${storeProfile.ownerName} (Tendero)`,
      action: 'Orden de compra registrada',
      detail: `Compró ${units} unidades de ${prodName} a $${pricePaid.toFixed(2)} c/u en ${supplier}. Ahorro: $${savings.toFixed(2)}.`,
      result: 'Kardex actualizado',
      storeId: 'store-1',
    };
    setAuditLogs((prev) => [newAuditLog, ...prev]);
  };

  // 2. Direct stock adjustment (+ / -)
  const handleUpdateStock = (productId: string, delta: number, motive: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newStock = Math.max(0, item.currentStock + delta);
          const newDaysOfStock = item.avgDailySales > 0 ? newStock / item.avgDailySales : 10;
          return {
            ...item,
            currentStock: newStock,
            daysOfStock: newDaysOfStock,
            stockStatus: newDaysOfStock < 2.5 ? 'CRÍTICO' : newDaysOfStock > 20 ? 'SOBRESTOCK' : 'NORMAL',
            lastUpdated: 'Hoy',
          };
        }
        return item;
      })
    );

    const targetProduct = inventory.find((i) => i.id === productId);
    if (targetProduct) {
      const newMovement: InventoryMovement = {
        id: `mov-${Date.now()}`,
        date: 'Hoy',
        timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        productId,
        productName: targetProduct.name,
        barcode: targetProduct.barcode,
        quantity: delta,
        type: delta > 0 ? 'ajuste' : 'venta',
        typeLabel: delta > 0 ? 'Ajuste positivo' : 'Ajuste / Venta',
        unitCost: targetProduct.lastCostPaid,
        user: storeProfile.ownerName,
        storeId: 'store-1',
        reference: 'Ajuste-Rápido',
        motive,
      };
      setMovements((prev) => [newMovement, ...prev]);
    }
  };

  // 3. Custom movement from Modal
  const handleRecordCustomMovement = (movementData: Omit<InventoryMovement, 'id' | 'timestamp' | 'date'>) => {
    const newMovement: InventoryMovement = {
      ...movementData,
      id: `mov-${Date.now()}`,
      date: 'Hoy',
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    };

    setMovements((prev) => [newMovement, ...prev]);

    // Update inventory stock
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === movementData.productId || item.barcode === movementData.barcode) {
          const newStock = Math.max(0, item.currentStock + movementData.quantity);
          const newDaysOfStock = item.avgDailySales > 0 ? newStock / item.avgDailySales : 10;
          return {
            ...item,
            currentStock: newStock,
            daysOfStock: newDaysOfStock,
            stockStatus: newDaysOfStock < 2.5 ? 'CRÍTICO' : newDaysOfStock > 20 ? 'SOBRESTOCK' : 'NORMAL',
            lastUpdated: 'Hoy',
          };
        }
        return item;
      })
    );
  };

  // 4. Add new product to master & store
  const handleAddNewProduct = (prodData: Omit<InventoryItem, 'id' | 'lastUpdated' | 'daysOfStock' | 'stockStatus'>) => {
    const days = prodData.avgDailySales > 0 ? prodData.currentStock / prodData.avgDailySales : 10;
    const newItem: InventoryItem = {
      ...prodData,
      id: `prod-${Date.now()}`,
      lastUpdated: 'Hoy',
      daysOfStock: days,
      stockStatus: days < 2.5 ? 'CRÍTICO' : days > 20 ? 'SOBRESTOCK' : 'NORMAL',
    };

    setInventory((prev) => [newItem, ...prev]);

    // Add initial entry to movements
    if (prodData.currentStock > 0) {
      setMovements((prev) => [
        {
          id: `mov-${Date.now()}`,
          date: 'Hoy',
          timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          productId: newItem.id,
          productName: newItem.name,
          barcode: newItem.barcode,
          quantity: newItem.currentStock,
          type: 'entrada',
          typeLabel: 'Alta inicial de inventario',
          unitCost: newItem.lastCostPaid,
          user: storeProfile.ownerName,
          storeId: 'store-1',
          reference: 'Catálogo-Inicial',
          motive: 'Registro inicial de nuevo producto',
        },
        ...prev
      ]);
    }
  };

  // 5. Apply daily opportunity
  const handleApplyOpportunity = (id: string) => {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return;

    if (opp.suggestedPurchaseUnits > 0) {
      handleRecordPurchase(
        opp.productId,
        opp.suggestedPurchaseUnits,
        'Mayorista recomendado por IA',
        opp.todayPrice,
        opp.estimatedSavings
      );
    }

    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'applied' } : o))
    );
  };

  // 6. Dismiss daily opportunity
  const handleDismissOpportunity = (id: string) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'dismissed' } : o))
    );
  };

  // 7. Trigger Scraper
  const handleTriggerScraper = (scraperId: string) => {
    setScraperJobs((prev) =>
      prev.map((j) =>
        j.id === scraperId
          ? {
              ...j,
              lastRun: 'Hace 1 min',
              status: 'idle',
              itemsProcessed: j.itemsProcessed + 15,
            }
          : j
      )
    );
  };

  const handleTriggerAllScrapers = () => {
    setScraperJobs((prev) =>
      prev.map((j) => ({
        ...j,
        lastRun: 'Hace un momento',
        status: 'idle',
        itemsProcessed: j.itemsProcessed + 40,
      }))
    );
  };

  // 8. Product Matching handlers
  const handleApproveMatch = (matchId: string) => {
    setMatchQueue((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status: 'approved' } : m))
    );
  };

  const handleRejectMatch = (matchId: string) => {
    setMatchQueue((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status: 'rejected' } : m))
    );
  };

  const handleResolveQualityIssue = (issueId: string) => {
    setQualityReports((prev) =>
      prev.map((q) => (q.id === issueId ? { ...q, status: 'resolved' } : q))
    );
  };

  const handleAcquireTrade = (tradeId: string) => {
    const item = tradingItems.find(t => t.id === tradeId);
    if (!item || item.applied) return;

    // 1. Add quantity to local inventory
    setInventory(prevInv => 
      prevInv.map(prod => 
        prod.barcode === item.barcode
          ? { 
              ...prod, 
              currentStock: prod.currentStock + item.qty,
              daysOfStock: (prod.currentStock + item.qty) / prod.avgDailySales,
              stockStatus: 'NORMAL' 
            }
          : prod
      )
    );

    // 2. Append custom Kardex movement
    const newMovement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      productId: `prod-${item.barcode}`,
      productName: item.name,
      barcode: item.barcode,
      type: 'entrada',
      typeLabel: 'Entrada por Intercambio',
      quantity: item.qty,
      date: 'Hoy',
      timestamp: new Date().toLocaleTimeString(),
      reference: `Intercambio: ${item.storeName}`,
      user: 'Don Pedro (Dueño)',
      motive: 'Adquisición de excedente inter-tiendas CDMX',
      storeId: storeProfile.id || 'store-001'
    };
    setMovements(prev => [newMovement, ...prev]);

    // 3. Mark listing as applied/completed
    setTradingItems(prev => 
      prev.map(t => t.id === tradeId ? { ...t, applied: true } : t)
    );

    // 4. Register a smart alert / message
    const customAlert: SmartAlert = {
      id: `alert-trade-${Date.now()}`,
      title: 'Intercambio Exitoso',
      message: `Has adquirido ${item.qty} pzas de ${item.name} de ${item.storeName} con un ahorro de $${item.savings.toFixed(2)}.`,
      level: 'INFORMATIVO',
      category: 'oportunidad',
      timestamp: 'Ahora mismo',
      status: 'active',
      productId: `prod-${item.barcode}`
    };
    setAlerts(prev => [customAlert, ...prev]);

    // 5. Append audit log
    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toLocaleString('es-MX'),
      actor: 'Don Pedro (Propietario)',
      action: 'INTERCAMBIO_EXCEDENTES',
      motive: `Adquisición de lote excedente de ${item.storeName} por geolocalización.`,
      beforeValue: `Stock previo de barra: ${inventory.find(i => i.barcode === item.barcode)?.currentStock || 0}`,
      afterValue: `Stock posterior: ${(inventory.find(i => i.barcode === item.barcode)?.currentStock || 0) + item.qty}`,
      storeId: storeProfile.id || 'store-001'
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // 9. AI Agent Execution handlers
  const handleExecuteAgent = async (agentId: string) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: `Analiza la situación actual para el agente ${agentId}` })
      });
      
      const result = await response.json();
      
      setAiAgents((prev) =>
        prev.map((a) =>
          a.id === agentId
            ? {
                ...a,
                lastExecuted: 'Hace un momento',
                recentActions: [
                  {
                    timestamp: 'Ahora mismo',
                    action: `Ejecución con Antigravity iniciada por ${storeProfile.ownerName}`,
                    result: result.success ? (result.output ? result.output.substring(0, 100) + '...' : '100% Satisfactorio.') : `Error: ${result.error}`,
                    impact: 'Datos procesados',
                  },
                  ...a.recentActions,
                ],
              }
            : a
        )
      );
    } catch (err) {
      console.error('Error executing agent:', err);
      throw err;
    }
  };

  const handleExecuteAllAgents = async () => {
    try {
      const response = await fetch('/api/agents/run-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      
      setAiAgents((prev) =>
        prev.map((a) => ({
          ...a,
          lastExecuted: 'Hace un momento',
        }))
      );

      return data;
    } catch (err) {
      console.error('Error running all agents:', err);
      throw err;
    }
  };

  // 10. Alerts handlers
  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'dismissed' } : a))
    );
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' } : a))
    );
  };

  // 11. Multi-Tenant Store Selection
  const handleSelectTenantStore = (tenant: TenantStore) => {
    setStoreProfile({
      storeName: tenant.name,
      ownerName: tenant.owner,
      phone: '55 1234 5678',
      zone: tenant.zone,
      address: tenant.address,
      posIntegrated: true,
      hasBarcodeScanner: true,
    });
  };

  // 12. Reset Sample Data
  const handleResetSampleData = () => {
    setStoreProfile(DEFAULT_STORE_PROFILE);
    setInventory(INITIAL_INVENTORY_ITEMS);
    setMovements(INITIAL_INVENTORY_MOVEMENTS);
    setSuppliers(INITIAL_SUPPLIERS);
    setPriceRecords(INITIAL_PRICE_RECORDS);
    setScraperJobs(INITIAL_SCRAPER_JOBS);
    setMatchQueue(INITIAL_PRODUCT_MATCH_ITEMS);
    setQualityReports(INITIAL_DATA_QUALITY_ISSUES);
    setAiAgents(INITIAL_AI_AGENTS);
    setOpportunities(INITIAL_DAILY_OPPORTUNITIES);
    setAlerts(INITIAL_SMART_ALERTS);
  };

  // Monthly accumulated savings
  const totalSavingsThisMonth = 1247.50 + opportunities.filter((o) => o.status === 'applied').reduce((acc, curr) => acc + curr.estimatedSavings, 0);
  const pendingAlertsCount = alerts.filter((a) => a.status === 'active' && a.level === 'CRÍTICO').length;
  const criticalStockCount = inventory.filter((i) => i.daysOfStock < 2.5).length;
  const pendingMatchesCount = matchQueue.filter((m) => m.status === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1D20] selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      
      {/* ────────────────────────────────────────────────────────── */}
      {/* MODE 1: PRODUCT UX APPLICATION (HILO 4)                    */}
      {/* ────────────────────────────────────────────────────────── */}
      {viewMode === 'app' && (
        <div className="flex-1 flex flex-col min-h-screen">
          
          {/* Main App Header */}
          <AppHeader
            storeProfile={storeProfile}
            activeTab={activeTab}
            onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
            onToggleViewMode={() => setViewMode('landing')}
            isLandingView={false}
            savingsThisMonth={totalSavingsThisMonth}
          />

          {/* Sub-Navigation Bar for Quick Switching Across 11 Modules */}
          <AppNavigationSubBar
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            pendingAlertsCount={pendingAlertsCount}
            criticalStockCount={criticalStockCount}
            pendingMatchesCount={pendingMatchesCount}
          />

            {/* Main App Canvas */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
              
              {/* VIEW 1: INICIO (EXECUTIVE TODAY SUMMARY) */}
              {activeTab === 'inicio' && (
                <div className="space-y-6">
                  <TodayDashboardView
                    storeProfile={storeProfile}
                    inventory={inventory}
                    opportunities={opportunities}
                    alerts={alerts}
                    onNavigateToTab={(tab) => setActiveTab(tab as ProductTab)}
                    onApplyOpportunity={handleApplyOpportunity}
                    onDismissOpportunity={handleDismissOpportunity}
                  />
                  
                  {/* Back Office Access Banner */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                    <div>
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>ABARROTES1 BACK OFFICE</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Acceso a herramientas de infraestructura, monitoreo de scrapers, gobernanza de agentes, benchmarks y auditoría.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('backoffice');
                        setBackOfficeSubTab('control');
                      }}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shrink-0 flex items-center gap-1.5"
                    >
                      <span>Abrir Back Office</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 2: POS (REGISTRO DE VENTA, HISTORIAL & PROMOCIONES) */}
              {(activeTab === 'pos' || activeTab === 'caja') && (
                <div className="space-y-6">
                  {/* Sub-tabs header for POS */}
                  <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                    <button 
                      onClick={() => setCajaSubTab('cobrar')} 
                      className={`px-4 py-2.5 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${cajaSubTab === 'cobrar' ? 'bg-[#0F5132] text-white' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>💵 Registro de Venta</span>
                    </button>
                    <button 
                      onClick={() => setCajaSubTab('historial')} 
                      className={`px-4 py-2.5 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${cajaSubTab === 'historial' ? 'bg-[#0F5132] text-white' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>📋 Historial de Ventas & Devoluciones</span>
                    </button>
                    <button 
                      onClick={() => setCajaSubTab('promos')} 
                      className={`px-4 py-2.5 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${cajaSubTab === 'promos' ? 'bg-[#0F5132] text-white' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>🧮 Calculadora de Promociones</span>
                    </button>
                  </div>

                  {/* Sub-tab Views */}
                  {cajaSubTab === 'cobrar' && (
                    <PosRegisterView
                      inventory={inventory}
                      storeProfile={storeProfile}
                      onExecuteSale={handleExecuteSale}
                      onNavigateToTab={(tab) => setActiveTab(tab as ProductTab)}
                    />
                  )}

                  {cajaSubTab === 'historial' && (
                    <SalesDemandAnalyticsView
                      sales={sales}
                      inventory={inventory}
                      storeProfile={storeProfile}
                      onRefundSale={handleExecuteRefund}
                      onCancelSale={handleExecuteCancel}
                      onNavigateToTab={(tab) => setActiveTab(tab as ProductTab)}
                    />
                  )}

                  {cajaSubTab === 'promos' && (
                    <PromoCalculatorView />
                  )}
                </div>
              )}

              {/* VIEW 3: PRODUCTOS (LECTOR DE CÓDIGOS & PRODUCT MATCHING) */}
              {activeTab === 'productos' && (
                <div className="space-y-6">
                  {/* Sub-tabs header for Productos */}
                  <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                    <button 
                      onClick={() => setProductosSubTab('lector')} 
                      className={`px-4 py-2.5 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${productosSubTab === 'lector' ? 'bg-[#0F5132] text-white' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}
                    >
                      <ScanBarcode className="w-3.5 h-3.5" />
                      <span>🔍 Lector / Registro de Códigos</span>
                    </button>
                    <button 
                      onClick={() => setProductosSubTab('matching')} 
                      className={`px-4 py-2.5 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${productosSubTab === 'matching' ? 'bg-[#0F5132] text-white' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}
                    >
                      <Handshake className="w-3.5 h-3.5" />
                      <span>🤝 Product Matching & Calidad</span>
                    </button>
                  </div>

                  {/* Sub-tab Views */}
                  {productosSubTab === 'lector' && (
                    <BarcodeScannerView
                      inventory={inventory}
                      onNavigateToTab={(tab) => setActiveTab(tab as ProductTab)}
                      onRecordMovement={handleRecordCustomMovement}
                      onAddNewProduct={handleAddNewProduct}
                    />
                  )}

                  {productosSubTab === 'matching' && (
                    <ProductMatchingView
                      matchQueue={matchQueue}
                      qualityReports={qualityReports}
                      onApproveMatch={handleApproveMatch}
                      onRejectMatch={handleRejectMatch}
                      onResolveQualityIssue={handleResolveQualityIssue}
                    />
                  )}
                </div>
              )}

              {/* VIEW 4: INVENTARIO (KARDEX, STOCK & ROTATION) */}
              {(activeTab === 'inventario' || activeTab === 'mi-tienda') && (
                <InventoryRotationView
                  inventory={inventory}
                  movements={movements}
                  priceRecords={priceRecords}
                  onUpdateStock={handleUpdateStock}
                  onRecordMovement={handleRecordCustomMovement}
                  onAddNewProduct={handleAddNewProduct}
                />
              )}

              {/* VIEW 5: COMPRAS (OPORTUNIDADES, ÓRDENES, PRECIOS & EXCEDENTES) */}
              {activeTab === 'compras' && (
                <div className="space-y-6">
                  {/* Sub-tabs header for Compras */}
                  <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                    <button 
                      onClick={() => setComprasSubTab('oportunidades')} 
                      className={`px-4 py-2.5 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${comprasSubTab === 'oportunidades' ? 'bg-[#0F5132] text-white' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>🛒 Oportunidades & Reorden</span>
                    </button>
                    <button 
                      onClick={() => setComprasSubTab('ordenes')} 
                      className={`px-4 py-2.5 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${comprasSubTab === 'ordenes' ? 'bg-[#0F5132] text-white' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>📋 Órdenes de Compra & Proveedores</span>
                    </button>
                    <button 
                      onClick={() => setComprasSubTab('precios')} 
                      className={`px-4 py-2.5 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${comprasSubTab === 'precios' ? 'bg-[#0F5132] text-white' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>🌎 Precios Mayoreo CDMX</span>
                    </button>
                    <button 
                      onClick={() => setComprasSubTab('excedentes')} 
                      className={`px-4 py-2.5 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${comprasSubTab === 'excedentes' ? 'bg-[#0F5132] text-white' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}
                    >
                      <Handshake className="w-3.5 h-3.5" />
                      <span>🤝 Intercambio de Excedentes</span>
                    </button>
                  </div>

                  {/* Sub-tab Views */}
                  {comprasSubTab === 'oportunidades' && (
                    <OpportunitiesCenterView
                      opportunities={opportunities}
                      onApplyOpportunity={handleApplyOpportunity}
                      onDismissOpportunity={handleDismissOpportunity}
                      onNavigateToTab={(tab) => setActiveTab(tab as ProductTab)}
                    />
                  )}

                  {comprasSubTab === 'ordenes' && (
                    <PurchasesSuppliersView
                      inventory={inventory}
                      suppliers={suppliers}
                      onRecordPurchase={handleRecordPurchase}
                    />
                  )}

                  {comprasSubTab === 'precios' && (
                    <PriceIntelligenceView
                      priceRecords={priceRecords}
                      scraperJobs={scraperJobs}
                      onTriggerScraper={handleTriggerScraper}
                      onTriggerAllScrapers={handleTriggerAllScrapers}
                    />
                  )}

                  {comprasSubTab === 'excedentes' && (
                    <div className="p-6 bg-white rounded-3xl border border-[#E2E5E8] space-y-6 shadow-xs">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div>
                          <h3 className="text-lg font-black text-[#1A1D20] flex items-center gap-1.5">
                            <Handshake className="w-5 h-5 text-[#0F5132]" />
                            <span>Intercambio de Excedentes de Tiendas CDMX</span>
                          </h3>
                          <p className="text-xs text-[#5A626A] mt-1">
                            Adquiere stock excedente de otras tiendas vecinas a precio de remate o publica tus mermas/sobrestock para liberar capital de trabajo.
                          </p>
                        </div>
                        <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-wider">
                          Geolocalización Activa
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {tradingItems.map((item) => (
                          <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-[#F8F9FA] flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-600 font-bold">{item.storeName}</span>
                                <span className="text-[#0D6832] font-black">{item.distance}</span>
                              </div>
                              <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{item.name}</h4>
                              <p className="text-xs text-slate-500">{item.brand} • {item.qty} piezas</p>
                              
                              <div className="pt-2 flex justify-between items-center border-t border-dashed border-slate-200">
                                <div className="text-left">
                                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Oferta</span>
                                  <span className="font-extrabold text-sm text-[#0D6832]">${item.offerPrice.toFixed(2)}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Ahorras</span>
                                  <span className="font-extrabold text-sm text-[#198754] bg-emerald-50 px-1.5 py-0.5 rounded-md">-${item.savings.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              disabled={item.applied}
                              onClick={() => handleAcquireTrade(item.id)}
                              className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${item.applied ? 'bg-emerald-100 text-[#0D6832] cursor-not-allowed flex items-center justify-center gap-1' : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs'}`}
                            >
                              {item.applied ? (
                                <>
                                  <ShieldCheck className="w-4 h-4" />
                                  <span>Adquirido</span>
                                </>
                              ) : (
                                'Adquirir Excedente'
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 6: MI IA (STORE BRAIN OPERATING SYSTEM PARA EL TENDERO) */}
              {activeTab === 'mi-ia' && (
                <StoreBrainOperatingSystemView
                  storeProfile={storeProfile}
                  inventory={inventory}
                  sales={sales}
                  suppliers={suppliers}
                  opportunities={opportunities}
                  alerts={alerts}
                  auditLogs={auditLogs}
                  costVariances={costVariances}
                  purchaseQueue={purchaseQueue}
                  reconciliationHistory={reconciliationHistory}
                  onUpdateInventory={(updated) => setInventory(updated)}
                  onUpdatePurchaseQueue={(updated) => setPurchaseQueue(updated)}
                  onUpdateAuditLogs={(updated) => setAuditLogs(updated)}
                  onUpdateCostVariances={(updated) => setCostVariances(updated)}
                  onAddReconciliation={(record) => setReconciliationHistory([record, ...reconciliationHistory])}
                  onNavigateToTab={(tab) => setActiveTab(tab as ProductTab)}
                  synthesis={synthesis}
                />
              )}

              {/* VIEW 7: REPORTES (ANALÍTICA DE DEMANDA Y VENTAS) */}
              {activeTab === 'reportes' && (
                <SalesDemandAnalyticsView
                  sales={sales}
                  inventory={inventory}
                  storeProfile={storeProfile}
                  onRefundSale={handleExecuteRefund}
                  onCancelSale={handleExecuteCancel}
                  onNavigateToTab={(tab) => setActiveTab(tab as ProductTab)}
                />
              )}

              {/* VIEW 8: CONFIGURACIÓN (CONFIGURACIÓN Y TENANTS DE TIENDA) */}
              {(activeTab === 'configuracion' || activeTab === 'settings') && (
                <StoreSettingsView
                  storeProfile={storeProfile}
                  onUpdateProfile={(p) => setStoreProfile(p)}
                  onSelectTenantStore={handleSelectTenantStore}
                  onResetSampleData={handleResetSampleData}
                />
              )}

              {/* BACK OFFICE: CONTROL Y HERRAMIENTAS TÉCNICAS DEL SISTEMA */}
              {(activeTab === 'backoffice' || activeTab === 'admin-panel') && (
                <div className="space-y-6">
                  {/* Back Office Master Header */}
                  <div className="bg-slate-950 p-6 rounded-3xl text-white space-y-4 shadow-xl border border-slate-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-lg text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
                            <span>🔐 ABARROTES1 BACK OFFICE</span>
                          </h3>
                          <span className="px-2.5 py-0.5 rounded bg-[#0F5132] text-emerald-300 text-[10px] font-black tracking-widest uppercase">
                            GOD MODE ENABLED
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Administración Técnica, Operaciones Internas y Mantenimiento del Sistema
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveTab('inicio')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold rounded-xl transition-all cursor-pointer border border-slate-700 flex items-center gap-1.5"
                      >
                        <span>← Volver a Mi Tienda</span>
                      </button>
                    </div>

                    {/* Technical Panels Bar (16 Back Office Modules) */}
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800">
                      <button 
                        onClick={() => setBackOfficeSubTab('control')} 
                        className={`px-3 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${backOfficeSubTab === 'control' ? 'bg-[#0F5132] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        🧠 Control Center
                      </button>
                      <button 
                        onClick={() => setBackOfficeSubTab('crm')} 
                        className={`px-3 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${backOfficeSubTab === 'crm' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        👥 CRM & 360°
                      </button>
                      <button 
                        onClick={() => setBackOfficeSubTab('agents')} 
                        className={`px-3 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${backOfficeSubTab === 'agents' ? 'bg-[#0F5132] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        🤖 AI Agents
                      </button>
                      <button 
                        onClick={() => setBackOfficeSubTab('scrapers')} 
                        className={`px-3 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${backOfficeSubTab === 'scrapers' ? 'bg-[#0F5132] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        🕷️ Scraper Operations
                      </button>
                      <button 
                        onClick={() => setBackOfficeSubTab('data')} 
                        className={`px-3 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${backOfficeSubTab === 'data' ? 'bg-[#0F5132] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        📊 Data Acquisition
                      </button>
                      <button 
                        onClick={() => setBackOfficeSubTab('sheets')} 
                        className={`px-3 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${backOfficeSubTab === 'sheets' ? 'bg-[#0F5132] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        📑 Sheets Intelligence
                      </button>
                      <button 
                        onClick={() => setBackOfficeSubTab('integrations')} 
                        className={`px-3 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${backOfficeSubTab === 'integrations' ? 'bg-[#0F5132] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        🔌 Integrations
                      </button>
                      <button 
                        onClick={() => setBackOfficeSubTab('health')} 
                        className={`px-3 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${backOfficeSubTab === 'health' ? 'bg-[#0F5132] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        🛡️ Production Health
                      </button>
                      <button 
                        onClick={() => setBackOfficeSubTab('benchmark')} 
                        className={`px-3 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${backOfficeSubTab === 'benchmark' ? 'bg-[#0F5132] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        🎯 Benchmark Moat
                      </button>
                      <button 
                        onClick={() => setBackOfficeSubTab('alerts')} 
                        className={`px-3 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${backOfficeSubTab === 'alerts' ? 'bg-[#0F5132] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        🔔 System Alerts
                      </button>
                      <button 
                        onClick={() => setBackOfficeSubTab('audit')} 
                        className={`px-3 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${backOfficeSubTab === 'audit' ? 'bg-[#0F5132] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        📜 Audit Log
                      </button>
                      <button 
                        onClick={() => setBackOfficeSubTab('testing')} 
                        className={`px-3 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${backOfficeSubTab === 'testing' ? 'bg-[#0F5132] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        🧪 Testing & Cert
                      </button>
                      <button 
                        onClick={() => setBackOfficeSubTab('config')} 
                        className={`px-3 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${backOfficeSubTab === 'config' ? 'bg-[#0F5132] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        ⚙️ System Config
                      </button>
                      <button 
                        onClick={() => setBackOfficeSubTab('security')} 
                        className={`px-3 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${backOfficeSubTab === 'security' ? 'bg-[#0F5132] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        🔐 Security & Access
                      </button>
                      <button 
                        onClick={() => setBackOfficeSubTab('analytics')} 
                        className={`px-3 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${backOfficeSubTab === 'analytics' ? 'bg-[#0F5132] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        📈 System Analytics
                      </button>
                      <button 
                        onClick={() => setBackOfficeSubTab('incidents')} 
                        className={`px-3 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${backOfficeSubTab === 'incidents' ? 'bg-[#0F5132] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        🚨 Incident Center
                      </button>
                    </div>
                  </div>

                  {/* Render Technical Content */}
                  <div className="bg-white p-2 rounded-3xl border border-[#E2E5E8] shadow-sm">
                    {backOfficeSubTab === 'control' && (
                      <ControlCenterView />
                    )}

                    {backOfficeSubTab === 'crm' && (
                      <div className="p-4">
                        <CrmModuleView />
                      </div>
                    )}

                    {backOfficeSubTab === 'agents' && (
                      <AIAgentsDashboardView
                        agents={aiAgents}
                        onExecuteAgent={handleExecuteAgent}
                        onExecuteAllAgents={handleExecuteAllAgents}
                      />
                    )}

                    {(backOfficeSubTab === 'scrapers' || backOfficeSubTab === 'data') && (
                      <LiveDataAcquisitionMonitor />
                    )}

                    {backOfficeSubTab === 'sheets' && (
                      <SheetsIntelligenceView />
                    )}

                    {backOfficeSubTab === 'integrations' && (
                      <IntegrationsHubView />
                    )}

                    {backOfficeSubTab === 'health' && (
                      <ProductionHealth initialTab="health" />
                    )}

                    {backOfficeSubTab === 'benchmark' && (
                      <BenchmarkView />
                    )}

                    {backOfficeSubTab === 'alerts' && (
                      <AlertsAuditView
                        initialTab="alerts"
                        alerts={alerts}
                        auditLogs={auditLogs}
                        onDismissAlert={handleDismissAlert}
                        onResolveAlert={handleResolveAlert}
                      />
                    )}

                    {backOfficeSubTab === 'audit' && (
                      <AlertsAuditView
                        initialTab="audit"
                        alerts={alerts}
                        auditLogs={auditLogs}
                        onDismissAlert={handleDismissAlert}
                        onResolveAlert={handleResolveAlert}
                      />
                    )}

                    {backOfficeSubTab === 'testing' && (
                      <ProductionHealth initialTab="testing" />
                    )}

                    {backOfficeSubTab === 'config' && (
                      <SystemConfigView />
                    )}

                    {backOfficeSubTab === 'security' && (
                      <SecurityAccessView />
                    )}

                    {backOfficeSubTab === 'analytics' && (
                      <SalesDemandAnalyticsView onOpenScanner={() => setActiveTab('lector-codigo')} />
                    )}

                    {backOfficeSubTab === 'incidents' && (
                      <ProductionHealth initialTab="incidents" />
                    )}
                  </div>
                </div>
              )}
          </main>

          {/* Bottom Navigation for Mobile Devices */}
          <NavigationBottomBar
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            pendingAlertsCount={pendingAlertsCount}
            criticalStockCount={criticalStockCount}
          />

          {/* Store Setup & Onboarding Modal */}
          <OnboardingModal
            isOpen={isOnboardingModalOpen}
            onClose={() => setIsOnboardingModalOpen(false)}
            currentProfile={storeProfile}
            onSaveProfile={(p) => setStoreProfile(p)}
          />
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODE 2: COMMERCIAL LANDING PAGE (HILO 3 - CONGELADA)       */}
      {/* ────────────────────────────────────────────────────────── */}
      {viewMode === 'landing' && (
        <div className="flex-1 flex flex-col">
          {/* Top Banner to switch to Live App */}
          <div className="bg-[#0F5132] text-white py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-2">
            <span>Estás viendo la Landing Comercial Oficial (Congelada).</span>
            <button
              onClick={() => setViewMode('app')}
              className="px-2.5 py-0.5 rounded bg-white text-[#0F5132] hover:bg-emerald-50 text-xs font-extrabold cursor-pointer transition-colors"
            >
              Abrir App de Tienda (Don Pedro) →
            </button>
          </div>

          {/* 1. Header / Navigation */}
          <Navbar
            onOpenTrialModal={() => setIsTrialModalOpen(true)}
            onOpenAppView={() => setViewMode('app')}
          />

          {/* Main Single-page Editorial Experience (Clean, Concise, Modern) */}
          <main className="flex-grow">
            <Hero onOpenTrialModal={() => setIsTrialModalOpen(true)} />
            <ProductShowcase3DSection 
              onOpenAppView={() => setViewMode('app')}
              onOpenTrialModal={() => setIsTrialModalOpen(true)}
            />
            <AiAdvisorSection />
            <FeaturesGridSection />
            <PricingSection onOpenTrialModal={() => setIsTrialModalOpen(true)} />
            <FaqSection />
            <FinalCtaSection onOpenTrialModal={() => setIsTrialModalOpen(true)} />
          </main>

          <Footer />

          <TrialModal
            isOpen={isTrialModalOpen}
            onClose={() => setIsTrialModalOpen(false)}
          />
        </div>
      )}

    </div>
  );
}
