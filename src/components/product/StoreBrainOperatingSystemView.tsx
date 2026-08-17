import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  Layers,
  ChevronRight,
  Info,
  RefreshCw,
  ShoppingCart,
  Receipt,
  FileText,
  Truck,
  Check,
  X,
  SlidersHorizontal,
  ChevronDown,
  HelpCircle,
  BarChart3,
  Calendar,
  PhoneCall,
  Lock,
  Plus
} from 'lucide-react';
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
  DailyOperatingPhase,
  DecisionSeverity,
  DecisionDomain,
  DataQualityTag,
} from '../../types';
import {
  buildStoreBrainSnapshot,
  executeBrainDecisionAction,
  enqueueScannerStockoutSignal,
  reconcileCashRegister,
} from '../../services/storeBrainEngine';

interface StoreBrainOperatingSystemViewProps {
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
  onUpdateInventory: (updated: InventoryItem[]) => void;
  onUpdatePurchaseQueue: (updated: PurchaseQueueItem[]) => void;
  onUpdateAuditLogs: (updated: AuditLogEntry[]) => void;
  onUpdateCostVariances: (updated: ReceivingCostVariance[]) => void;
  onAddReconciliation: (record: CashReconciliationRecord) => void;
  onNavigateToTab: (tabName: string) => void;
  synthesis?: string;
}

export const StoreBrainOperatingSystemView: React.FC<StoreBrainOperatingSystemViewProps> = ({
  storeProfile,
  inventory,
  sales,
  suppliers,
  opportunities,
  alerts,
  auditLogs,
  costVariances,
  purchaseQueue,
  reconciliationHistory,
  onUpdateInventory,
  onUpdatePurchaseQueue,
  onUpdateAuditLogs,
  onUpdateCostVariances,
  onAddReconciliation,
  onNavigateToTab,
  synthesis,
}) => {
  // Operating Phase State
  const [activePhase, setActivePhase] = useState<DailyOperatingPhase>('APERTURA');
  
  // Perspective View Mode (Decisiones Unificadas, Riesgos, Oportunidades, Acciones, Causa Raíz)
  const [viewPerspective, setViewPerspective] = useState<'ALL' | 'RISKS' | 'OPPORTUNITIES' | 'ACTIONS' | 'ROOT_CAUSE'>('ALL');
  
  // Severity Filter
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');

  // Selected Decision for Detail Modal / Inspector
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

  // Cash Reconciliation Form State (Fase 3: Cierre)
  const [cashInput, setCashInput] = useState<string>('3850');
  const [cardInput, setCardInput] = useState<string>('420');
  const [speiInput, setSpeiInput] = useState<string>('72');
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [reconciliationSuccess, setReconciliationSuccess] = useState<boolean>(false);

  // Notification / Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Build Store Brain Snapshot
  const snapshot: StoreBrainSnapshot = useMemo(() => {
    return buildStoreBrainSnapshot({
      storeProfile,
      inventory,
      sales,
      suppliers,
      opportunities,
      alerts,
      auditLogs,
      costVariances,
      purchaseQueue,
      reconciliationHistory,
      currentPhase: activePhase,
      synthesis,
    });
  }, [
    storeProfile,
    inventory,
    sales,
    suppliers,
    opportunities,
    alerts,
    auditLogs,
    costVariances,
    purchaseQueue,
    reconciliationHistory,
    activePhase,
    synthesis,
  ]);

  // Filtered Decisions based on active perspective & severity
  const filteredDecisions = useMemo(() => {
    return snapshot.decisions.filter((d) => {
      // Perspective filter
      if (viewPerspective === 'RISKS') {
        if (d.type !== 'STOCKOUT_RISK' && d.type !== 'MARGIN_SQUEEZE' && d.type !== 'CAPITAL_TRAP' && d.type !== 'COST_VARIANCE') {
          return false;
        }
      } else if (viewPerspective === 'OPPORTUNITIES') {
        if (d.type !== 'SUPPLIER_ARBITRAGE' && d.type !== 'VOLUME_DISCOUNT' && d.type !== 'DEMAND_OPPORTUNITY') {
          return false;
        }
      } else if (viewPerspective === 'ACTIONS') {
        if (d.action.executionState !== 'PENDING') return false;
      }

      // Severity filter
      if (severityFilter !== 'ALL' && d.severity !== severityFilter) {
        return false;
      }

      return true;
    });
  }, [snapshot.decisions, viewPerspective, severityFilter]);

  // Handle 1-Click Execution of Brain Decisions
  const handleExecuteDecision = (decisionId: string) => {
    const result = executeBrainDecisionAction({
      snapshot,
      decisionId,
      user: storeProfile.ownerName || 'Don Pedro Gómez',
      inventory,
      purchaseQueue,
      auditLogs,
      costVariances,
    });

    onUpdateInventory(result.updatedInventory);
    onUpdatePurchaseQueue(result.updatedPurchaseQueue);
    onUpdateAuditLogs(result.updatedAuditLogs);
    onUpdateCostVariances(result.updatedCostVariances);
    showToast(result.resultMessage);
  };

  // Handle Cash Reconciliation Submission
  const handlePerformReconciliation = (e: React.FormEvent) => {
    e.preventDefault();
    const cashVal = parseFloat(cashInput) || 0;
    const cardVal = parseFloat(cardInput) || 0;
    const speiVal = parseFloat(speiInput) || 0;

    const result = reconcileCashRegister({
      sales,
      actualCash: cashVal,
      actualCard: cardVal,
      actualSpei: speiVal,
      cashierUser: storeProfile.ownerName || 'Don Pedro Gómez',
      notes: closingNotes,
      storeId: storeProfile.id || 'store-1',
    });

    onAddReconciliation(result.reconciliationRecord);
    onUpdateAuditLogs([result.auditLog, ...auditLogs]);
    setReconciliationSuccess(true);
    showToast(
      result.reconciliationRecord.status === 'BALANCED'
        ? 'Cierre de caja completado con éxito: Cuadrado al 100%'
        : `Cierre registrado con discrepancia: Diferencia total $${result.reconciliationRecord.cashDifference + result.reconciliationRecord.cardDifference + result.reconciliationRecord.speiDifference}`
    );
  };

  return (
    <div id="store-brain-root" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1D20] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-7 h-7 rounded-lg bg-[#0F5132] text-white flex items-center justify-center font-black">
            ✓
          </div>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Master Architecture Banner: Store Brain + Daily Operating System */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-950 rounded-[32px] p-6 sm:p-10 text-white shadow-[0_20px_50px_rgb(0,0,0,0.15)] relative overflow-hidden"
      >
        {/* Subtle optical background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-3xl bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-inner">
                <Brain className="w-7 h-7 text-emerald-200 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300/80">
                    MI ABARROTERO • STORE BRAIN CORE
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
                    Hilo 6.1
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Sistema Operativo Diario
                </h1>
              </div>
            </div>

            {/* Store Health Badge */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-4 bg-black/20 backdrop-blur-xl px-5 py-3 rounded-3xl border border-white/10 shadow-inner"
            >
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-emerald-200/80 tracking-wider">Salud Operativa</div>
                <div className="text-lg font-black text-white tracking-tight">
                  {snapshot.storeHealthScore}/100 • <span className="opacity-90">{snapshot.storeHealthStatus}</span>
                </div>
              </div>
              <div className="relative flex h-4 w-4">
                {snapshot.storeHealthScore > 85 && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-4 w-4 ${
                  snapshot.storeHealthScore > 85 ? 'bg-emerald-400' : snapshot.storeHealthScore > 65 ? 'bg-amber-400' : 'bg-rose-500'
                }`}></span>
              </div>
            </motion.div>
          </div>

          {/* Daily Operating Phase Switcher (APERTURA -> OPERACIÓN -> CIERRE) */}
          <div className="bg-black/20 p-2 rounded-3xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2 backdrop-blur-md">
            <button
              onClick={() => setActivePhase('APERTURA')}
              className={`flex items-center justify-center gap-3 py-3 px-4 rounded-2xl font-bold text-xs transition-all duration-300 cursor-pointer relative ${
                activePhase === 'APERTURA'
                  ? 'bg-white text-emerald-900 shadow-[0_4px_15px_rgb(0,0,0,0.1)]'
                  : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className={`w-5 h-5 ${activePhase === 'APERTURA' ? 'text-emerald-600' : ''}`} />
              <div className="text-left">
                <div className="leading-tight font-black tracking-wide">FASE 1: APERTURA</div>
                <div className="text-[10px] opacity-75 font-medium mt-0.5">06:30 - 08:00 AM (90s Brief)</div>
              </div>
            </button>

            <button
              onClick={() => setActivePhase('OPERACION')}
              className={`flex items-center justify-center gap-3 py-3 px-4 rounded-2xl font-bold text-xs transition-all duration-300 cursor-pointer relative ${
                activePhase === 'OPERACION'
                  ? 'bg-white text-emerald-900 shadow-[0_4px_15px_rgb(0,0,0,0.1)]'
                  : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className={`w-5 h-5 ${activePhase === 'OPERACION' ? 'text-emerald-600' : ''}`} />
              <div className="text-left">
                <div className="leading-tight font-black tracking-wide">FASE 2: OPERACIÓN</div>
                <div className="text-[10px] opacity-75 font-medium mt-0.5">08:00 AM - 20:00 PM (Tiempo Real)</div>
              </div>
            </button>

            <button
              onClick={() => setActivePhase('CIERRE')}
              className={`flex items-center justify-center gap-3 py-3 px-4 rounded-2xl font-bold text-xs transition-all duration-300 cursor-pointer relative ${
                activePhase === 'CIERRE'
                  ? 'bg-white text-emerald-900 shadow-[0_4px_15px_rgb(0,0,0,0.1)]'
                  : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Lock className={`w-5 h-5 ${activePhase === 'CIERRE' ? 'text-emerald-600' : ''}`} />
              <div className="text-left">
                <div className="leading-tight font-black tracking-wide">FASE 3: CIERRE</div>
                <div className="text-[10px] opacity-75 font-medium mt-0.5">20:00 - 21:30 PM (Arqueo & Feedback)</div>
              </div>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-[20px] border border-white/10 hover:bg-white/15 transition-colors">
              <div className="text-[10px] text-emerald-200/80 uppercase font-black tracking-widest">Ventas del Día</div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                ${snapshot.financialSummary.todaySales.toFixed(2)}
              </div>
              <div className="text-xs text-emerald-300 font-medium mt-1">
                Margen: {snapshot.financialSummary.todayMarginPercent}%
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-[20px] border border-white/10 hover:bg-white/15 transition-colors">
              <div className="text-[10px] text-emerald-200/80 uppercase font-black tracking-widest">Riesgo Desabasto</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1 tracking-tight">
                ${snapshot.financialSummary.estimatedLostRevenue.toFixed(2)}
              </div>
              <div className="text-xs text-amber-200/80 font-medium mt-1">
                {snapshot.criticalRisks.length} productos críticos
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-[20px] border border-white/10 hover:bg-white/15 transition-colors">
              <div className="text-[10px] text-emerald-200/80 uppercase font-black tracking-widest">Ahorros Arbitraje</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1 tracking-tight">
                ${snapshot.financialSummary.potentialSavingsAvailable.toFixed(2)}
              </div>
              <div className="text-xs text-emerald-200/80 font-medium mt-1">
                {snapshot.opportunities.length} acuerdos detectados
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-[20px] border border-white/10 hover:bg-white/15 transition-colors">
              <div className="text-[10px] text-emerald-200/80 uppercase font-black tracking-widest">Cola de Compras</div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                {snapshot.purchaseQueue.filter((q) => q.status === 'QUEUED').length} <span className="text-sm font-medium text-emerald-200/80">ítems</span>
              </div>
              <div className="text-xs text-emerald-200/80 font-medium mt-1">
                Listos para surtido
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          FASE 1 VIEW: APERTURA (90 SECONDS MORNING BRIEF)
      ───────────────────────────────────────────────────────────── */}
      {activePhase === 'APERTURA' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between bg-emerald-50/80 backdrop-blur-md border border-emerald-100 px-6 py-4 rounded-3xl text-emerald-900 text-sm font-medium shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <span>
                <strong className="font-black tracking-tight text-base block sm:inline mr-2">Apertura Matutina:</strong> Revisa el estado de la tienda en menos de 90 segundos antes de levantar cortina.
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePhase('OPERACION')}
              className="hidden sm:flex bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-800 transition-colors cursor-pointer shadow-[0_4px_15px_rgb(16,185,129,0.3)] items-center gap-2"
            >
              Iniciar Operación <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Executive Synthesis by Store Manager Agent */}
          {snapshot.morningBrief.synthesis && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-radial from-emerald-50 to-emerald-100/50 border border-emerald-200/60 rounded-[32px] p-8 shadow-[0_12px_40px_rgb(16,185,129,0.03)] space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 rounded-2xl text-white shadow-[0_4px_12px_rgb(5,150,105,0.2)]">
                  <Brain className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-emerald-950 tracking-tight">
                    Síntesis Ejecutiva del Store Manager Agent
                  </h3>
                  <p className="text-[10px] sm:text-xs text-emerald-700 font-bold uppercase tracking-wider mt-0.5">
                    Análisis Multi-Agente Consolidado • Ciudad de México
                  </p>
                </div>
              </div>
              <div className="prose prose-emerald max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium bg-white/50 backdrop-blur-xs p-6 rounded-2xl border border-emerald-100/40">
                {snapshot.morningBrief.synthesis}
              </div>
            </motion.div>
          )}

          {/* Morning Brief 3-Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 1. Cash & Targets */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 text-slate-900 font-black text-base tracking-tight">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  Caja & Metas
                </div>
                <span className="text-[10px] font-black uppercase px-3 py-1 bg-emerald-100/50 text-emerald-700 rounded-full tracking-wider">
                  Fondo Inicial
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Efectivo de Apertura</span>
                  <span className="font-black text-slate-900 text-lg tabular-nums">${snapshot.morningBrief.openingCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Meta de Venta Diaria</span>
                  <span className="font-black text-emerald-600 text-lg tabular-nums">${snapshot.morningBrief.dailyGoal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100/50">
                  <span className="text-slate-500 font-medium">Venta Ayer</span>
                  <span className="font-bold text-slate-700 tabular-nums">${snapshot.morningBrief.yesterdaySales.toFixed(2)} <span className="text-xs text-slate-400 font-normal ml-1">({snapshot.morningBrief.yesterdayMargin}% mrgn)</span></span>
                </div>
              </div>
            </motion.div>

            {/* 2. Top Critical Decisions */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 lg:col-span-2"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 text-slate-900 font-black text-base tracking-tight">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  Prioridades Matutinas
                </div>
                <span className="text-[10px] font-black uppercase px-3 py-1 bg-amber-100/50 text-amber-700 rounded-full tracking-wider">
                  Top 3 Acciones
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {snapshot.morningBrief.topDecisions.map((dec, idx) => (
                  <div key={dec.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-4 transition-colors hover:bg-white hover:shadow-md">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-black text-[10px]">#{idx + 1}</span>
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider truncate">{dec.domain}</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm leading-tight line-clamp-2">{dec.productName}</h4>
                      <p className="text-xs text-slate-500 mt-2 font-medium">{dec.action.label}</p>
                    </div>
                    <motion.button

                      onClick={() => handleExecuteDecision(dec.id)}
                      disabled={dec.action.executionState === 'EXECUTED'}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all shrink-0 cursor-pointer ${
                        dec.action.executionState === 'EXECUTED'
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-[#0F5132] text-white hover:bg-[#198754]'
                      }`}
                    >
                      {dec.action.executionState === 'EXECUTED' ? 'Listo ✓' : '1-Click'}
                    </motion.button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 3. Urgent Supplier Visits */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 text-slate-900 font-black text-base tracking-tight">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                    <Truck className="w-5 h-5" />
                  </div>
                  Rutas Hoy
                </div>
                <span className="text-[10px] font-black uppercase px-3 py-1 bg-blue-100/50 text-blue-700 rounded-full tracking-wider">
                  Visitas Confirmadas
                </span>
              </div>

              <div className="space-y-3">
                {snapshot.morningBrief.urgentSupplierVisits.map((v, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2 transition-colors hover:bg-white hover:shadow-md">
                    <div className="flex justify-between items-center font-black text-slate-900 text-sm">
                      <span className="truncate mr-2">{v.supplierName}</span>
                      <span className="text-[10px] text-blue-700 bg-blue-100/50 px-2 py-1 rounded-md font-mono tracking-wider shrink-0">
                        {v.visitTime}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium items-center">
                      <span className="flex items-center gap-1.5"><PhoneCall className="w-3 h-3 text-slate-400" /> {v.contactPhone}</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onNavigateToTab('purchases')}
                        className="text-blue-600 font-black hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        Catálogo <ChevronRight className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DECISION ENGINE: UNIFIED 3-PERSPECTIVE DASHBOARD
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-[#E2E5E8] p-6 sm:p-7 shadow-xs space-y-6">
        {/* Navigation / Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2E5E8]">
          {/* 3 Perspectives: Unified, Risks, Opportunities, Actions, Root Causes */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setViewPerspective('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewPerspective === 'ALL'
                  ? 'bg-[#0F5132] text-white shadow-2xs'
                  : 'bg-[#F8F9FA] text-[#5A626A] hover:text-[#1A1D20]'
              }`}
            >
              Matriz Unificada ({snapshot.decisions.length})
            </button>

            <button
              onClick={() => setViewPerspective('RISKS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewPerspective === 'RISKS'
                  ? 'bg-red-700 text-white shadow-2xs'
                  : 'bg-red-50 text-red-800 hover:bg-red-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Riesgos: Evita Pérdidas ({snapshot.criticalRisks.length + snapshot.highRisks.length})</span>
            </button>

            <button
              onClick={() => setViewPerspective('OPPORTUNITIES')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewPerspective === 'OPPORTUNITIES'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Oportunidades: Gana/Ahorra ({snapshot.opportunities.length})</span>
            </button>

            <button
              onClick={() => setViewPerspective('ACTIONS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewPerspective === 'ACTIONS'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Acciones: Haz Esto ({snapshot.recommendedActions.length})</span>
            </button>

            <button
              onClick={() => setViewPerspective('ROOT_CAUSE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewPerspective === 'ROOT_CAUSE'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Causa Raíz ({snapshot.groupedDecisions.length} grupos)</span>
            </button>
          </div>

          {/* Severity Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5A626A]">Severidad:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#1A1D20] focus:ring-2 focus:ring-[#0F5132]"
            >
              <option value="ALL">Todas las severidades</option>
              <option value="CRITICAL">Solo Críticas</option>
              <option value="HIGH">Solo Altas</option>
              <option value="MEDIUM">Medias</option>
            </select>
          </div>
        </div>

        {/* DECISIONS LIST: Root Cause Clustered View */}
        {viewPerspective === 'ROOT_CAUSE' ? (
          <div className="space-y-6">
            {snapshot.groupedDecisions.map((group) => (
              <div key={group.groupKey} className="rounded-2xl border border-[#E2E5E8] overflow-hidden">
                <div className="bg-[#F8F9FA] px-4 py-3 border-b border-[#E2E5E8] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-700" />
                    <span className="font-black text-sm text-[#1A1D20]">{group.title}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                    {group.count} decisiones asociadas
                  </span>
                </div>

                <div className="divide-y divide-[#E2E5E8]">
                  {group.decisions.map((dec) => (
                    <div key={dec.id} className="p-4 hover:bg-emerald-50/30 transition-colors flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            dec.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {dec.severity}
                          </span>
                          <span className="font-black text-sm text-[#1A1D20]">{dec.productName}</span>
                        </div>
                        <p className="text-xs text-[#5A626A] font-medium">{dec.what}</p>
                        <p className="text-[11px] text-purple-900 font-semibold">Causa raíz: {dec.rootCause}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-black text-[#1A1D20]">
                            {dec.financialImpact < 0 ? `-${Math.abs(dec.financialImpact)} MXN` : `+${dec.financialImpact} MXN`}
                          </div>
                          <div className="text-[10px] text-[#5A626A] font-mono">Confianza: {dec.confidence}%</div>
                        </div>

                        <button
                          onClick={() => handleExecuteDecision(dec.id)}
                          disabled={dec.action.executionState === 'EXECUTED'}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                            dec.action.executionState === 'EXECUTED'
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-[#0F5132] text-white hover:bg-[#198754]'
                          }`}
                        >
                          {dec.action.executionState === 'EXECUTED' ? 'Ejecutado ✓' : dec.action.buttonText}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* STANDARD UNIFIED DECISION CARDS LIST */
          <div className="space-y-4">
            {filteredDecisions.length === 0 ? (
              <div className="text-center py-12 bg-[#F8F9FA] rounded-2xl border border-dashed border-[#E2E5E8] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-[#1A1D20]">No hay decisiones pendientes en esta vista</p>
                <p className="text-xs text-[#5A626A]">Tu inventario, márgenes y proveedores están operando en rango óptimo.</p>
              </div>
            ) : (
              filteredDecisions.map((decision) => {
                const isExecuted = decision.action.executionState === 'EXECUTED';

                return (
                  <div
                    key={decision.id}
                    className={`rounded-2xl border p-5 transition-all space-y-3 relative overflow-hidden ${
                      isExecuted
                        ? 'bg-[#F8F9FA] border-[#E2E5E8] opacity-75'
                        : decision.severity === 'CRITICAL'
                        ? 'bg-white border-red-300 shadow-sm hover:border-red-400'
                        : 'bg-white border-[#E2E5E8] shadow-2xs hover:border-[#0F5132]'
                    }`}
                  >
                    {/* Header line: Tags, Severity, Type, Data Quality */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                          decision.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : decision.severity === 'HIGH'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {decision.severity} • {decision.type.replace('_', ' ')}
                        </span>

                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-gray-100 text-[#5A626A] rounded-md">
                          TAG: {decision.confidenceTag} ({decision.confidence}%)
                        </span>

                        {isExecuted && (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-black flex items-center gap-1">
                            <Check className="w-3 h-3" /> EJECUTADO EN AUDITORÍA
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-black text-[#1A1D20]">
                        {decision.financialImpact < 0 ? (
                          <span className="text-red-700 font-black">
                            Pérdida evitable: -${Math.abs(decision.financialImpact).toFixed(2)} MXN
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-black">
                            Ganancia / Ahorro: +${decision.financialImpact.toFixed(2)} MXN
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product & Explanation */}
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-black text-[#1A1D20]">
                        {decision.productName || 'Decisión Global'}
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-[#1A1D20] leading-snug">
                        {decision.what}
                      </p>
                      <p className="text-xs text-[#5A626A] leading-relaxed">
                        {decision.why}
                      </p>
                    </div>

                    {/* Evidence & Root Cause Drawer */}
                    <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E2E5E8] text-xs space-y-2">
                      <div className="text-[11px] font-black text-purple-900 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-700" />
                        <span>Causa Raíz: {decision.rootCause}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#E2E5E8]">
                        {decision.evidence.map((ev, i) => (
                          <div key={i} className="text-[11px]">
                            <span className="text-[#5A626A] block">{ev.label}:</span>
                            <span className="font-bold text-[#1A1D20]">{ev.value}</span>
                          </div>
                        ))}
                      </div>

                      {decision.risk?.consequenceIfIgnored && (
                        <div className="text-[11px] text-red-800 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">
                          <strong>Consecuencia si se ignora:</strong> {decision.risk.consequenceIfIgnored}
                        </div>
                      )}
                    </div>

                    {/* 1-Click Action Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="text-xs text-[#5A626A]">
                        <strong>Acción sugerida:</strong> {decision.action.explanation}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleExecuteDecision(decision.id)}
                          disabled={isExecuted}
                          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            isExecuted
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-[#0F5132] hover:bg-[#198754] text-white'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{isExecuted ? 'Acción Ejecutada' : decision.action.buttonText}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          FASE 2 VIEW: OPERACIÓN EN TIEMPO REAL (RECEIVING & QUEUE)
      ───────────────────────────────────────────────────────────── */}
      {activePhase === 'OPERACION' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Purchase Queue Real-Time Table */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E2E5E8] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E8]">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#0F5132]" />
                <h2 className="text-base font-black text-[#1A1D20]">Cola de Compras Activa</h2>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-[#0F5132] rounded-full">
                {purchaseQueue.length} órdenes en cola
              </span>
            </div>

            <p className="text-xs text-[#5A626A]">
              Los desabastos detectados en mostrador o generados por el Store Brain entran directamente a esta cola de surtido.
            </p>

            <div className="divide-y divide-[#E2E5E8] max-h-96 overflow-y-auto pr-1">
              {purchaseQueue.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 truncate">
                    <div className="font-black text-[#1A1D20] truncate">{item.productName}</div>
                    <div className="text-[11px] text-[#5A626A]">
                      Proveedor: <span className="font-semibold text-blue-700">{item.supplierName}</span> • Sugerido: {item.suggestedQuantity} pzas (${item.estimatedTotalCost.toFixed(2)})
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      Origen: {item.source} • {item.addedAt}
                    </div>
                  </div>

                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black shrink-0 ${
                    item.urgency === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.urgency}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateToTab('purchases')}
              className="w-full py-2.5 bg-[#F8F9FA] hover:bg-[#E2E5E8] text-[#1A1D20] font-bold text-xs rounded-xl transition-colors cursor-pointer border border-[#E2E5E8] flex items-center justify-center gap-1.5"
            >
              <span>Gestionar y Enviar Pedidos a Proveedores</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Receiving Cost Variances (Discrepancias en Recepción) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E2E5E8] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E8]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-black text-[#1A1D20]">Recepción & Facturas</h2>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                Auditoría de Costos
              </span>
            </div>

            <p className="text-xs text-[#5A626A]">
              Control de sobrecostos no avisados por repartidores al momento de recibir mercancía en tienda.
            </p>

            <div className="space-y-3">
              {costVariances.map((v) => (
                <div key={v.id} className="p-3 bg-[#F8F9FA] rounded-2xl border border-[#E2E5E8] text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold text-[#1A1D20]">
                    <span className="truncate">{v.productName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      v.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {v.status === 'ACCEPTED' ? 'Aclarado' : 'Pendiente'}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#5A626A] space-y-0.5">
                    <div>Proveedor: <strong>{v.supplierName}</strong> ({v.invoiceReference})</div>
                    <div>Pactado: <strong>${v.pactedCost}</strong> ➔ Facturado: <strong className="text-red-700">${v.invoiceCost}</strong> (+${v.varianceAmount} / +{v.variancePercent}%)</div>
                    <div className="text-red-800 font-bold">Impacto en remisión: +${v.totalImpact.toFixed(2)} MXN</div>
                  </div>

                  {v.status === 'PENDING_REVIEW' && (
                    <button
                      onClick={() => {
                        const updated = costVariances.map((cv) =>
                          cv.id === v.id ? { ...cv, status: 'ACCEPTED' as const, reviewedBy: storeProfile.ownerName } : cv
                        );
                        onUpdateCostVariances(updated);
                        showToast(`Remisión de ${v.supplierName} validada y registrada.`);
                      }}
                      className="w-full py-1.5 bg-[#0F5132] text-white font-bold text-[11px] rounded-lg hover:bg-[#198754] transition-colors cursor-pointer"
                    >
                      Aclarar y Registrar Nota de Crédito
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          FASE 3 VIEW: CIERRE & FEEDBACK LOOP (CASH RECONCILIATION)
      ───────────────────────────────────────────────────────────── */}
      {activePhase === 'CIERRE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cash Register Reconciliation Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E2E5E8] p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E8]">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#0F5132]" />
                <h2 className="text-lg font-black text-[#1A1D20]">Arqueo de Caja & Conciliación</h2>
              </div>
              <span className="text-xs font-extrabold px-2.5 py-0.5 bg-emerald-100 text-[#0F5132] rounded-full">
                Cierre Nocturno
              </span>
            </div>

            <p className="text-xs text-[#5A626A] leading-relaxed">
              Ingresa el dinero físico contado en el cajón para contrastar automáticamente contra los tickets del punto de venta.
            </p>

            <form onSubmit={handlePerformReconciliation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A1D20]">Efectivo en Cajón ($):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={cashInput}
                    onChange={(e) => setCashInput(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl px-3 py-2 text-sm font-black text-[#1A1D20] focus:ring-2 focus:ring-[#0F5132]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A1D20]">Vouchers Tarjeta ($):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={cardInput}
                    onChange={(e) => setCardInput(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl px-3 py-2 text-sm font-black text-[#1A1D20] focus:ring-2 focus:ring-[#0F5132]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A1D20]">Transferencias SPEI ($):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={speiInput}
                    onChange={(e) => setSpeiInput(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl px-3 py-2 text-sm font-black text-[#1A1D20] focus:ring-2 focus:ring-[#0F5132]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A1D20]">Observaciones del Turno:</label>
                <textarea
                  rows={2}
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Ej: Turno tranquilo sin novedades, todo cuadrado."
                  className="w-full bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl p-3 text-xs text-[#1A1D20] focus:ring-2 focus:ring-[#0F5132]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#0F5132] hover:bg-[#198754] text-white font-black text-sm rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Ejecutar Cierre & Calcular Ganancia Real</span>
              </button>
            </form>
          </div>

          {/* Tomorrow's Plan & Feedback Loop Output */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E2E5E8] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E8]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-black text-[#1A1D20]">Plan para Mañana</h2>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                Feedback Loop
              </span>
            </div>

            <p className="text-xs text-[#5A626A]">
              Proyección generada por el Demand Engine a partir del ritmo de venta observado hoy.
            </p>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#5A626A]">Demanda esperada mañana:</span>
                <span className="font-black text-[#1A1D20] text-sm">{snapshot.tomorrowPlan.expectedDemandUnits} unidades</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#5A626A]">Venta estimada proyectada:</span>
                <span className="font-black text-blue-900 text-sm">${snapshot.tomorrowPlan.expectedSalesAmount.toFixed(2)} MXN</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#1A1D20]">Resurtidos Críticos Sugeridos:</span>
              {snapshot.tomorrowPlan.criticalReorderItems.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E5E8] text-xs flex justify-between items-center">
                  <span className="font-bold text-[#1A1D20] truncate">{item.name}</span>
                  <span className="text-blue-800 font-black font-mono">+{item.qty} pzas</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
