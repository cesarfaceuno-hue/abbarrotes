import React from 'react';
import { 
  Sun, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingCart, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Package, 
  ScanBarcode, 
  ShieldCheck, 
  Smartphone,
  Layers,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { InventoryItem, DailyOpportunity, StoreProfile, SmartAlert } from '../../types';

interface TodayDashboardViewProps {
  storeProfile: StoreProfile;
  inventory: InventoryItem[];
  opportunities: DailyOpportunity[];
  alerts: SmartAlert[];
  onNavigateToTab: (tabName: string) => void;
  onApplyOpportunity: (oppId: string) => void;
  onDismissOpportunity: (oppId: string) => void;
  onOpenAiAdvisor?: () => void;
}

export const TodayDashboardView: React.FC<TodayDashboardViewProps> = ({
  storeProfile,
  inventory,
  opportunities,
  alerts,
  onNavigateToTab,
  onApplyOpportunity,
  onDismissOpportunity,
  onOpenAiAdvisor,
}) => {
  // Urgent inventory items (< 2.5 days of stock)
  const criticalItems = inventory.filter((i) => i.daysOfStock < 2.5);
  
  // Pending opportunities
  const pendingOpportunities = opportunities.filter((o) => o.status === 'pending');
  const topOpportunity = pendingOpportunities[0] || opportunities[0];

  // Total potential savings
  const totalPotentialSavings = pendingOpportunities.reduce((acc, curr) => acc + curr.estimatedSavings, 0);

  // Critical alerts count
  const criticalAlerts = alerts.filter((a) => a.level === 'CRÍTICO' && a.status === 'active');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* 1. Morning Greeting & Daily Brief Banner */}
      <div className="bg-linear-to-r from-[#0F5132] to-[#157347] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
                <Sun className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
                Reporte Matutino • Martes 15 de Febrero, 2026
              </span>
            </div>

            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-100 border border-white/10">
              <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
              <span>WhatsApp enviado a {storeProfile.ownerName} (06:30 AM)</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Buenos días, {storeProfile.ownerName}
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mt-1 leading-relaxed">
              Hoy monitoreamos <strong>4 fuentes mayoristas</strong> en tu zona. Tienes <strong>{criticalItems.length} productos críticos</strong> de abasto y una oportunidad de ahorro de <strong>${totalPotentialSavings.toFixed(2)} MXN</strong> en tus compras matutinas.
            </p>
          </div>

          {/* Quick Action Matrix for the Morning */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <div className="text-[11px] text-emerald-200 font-semibold uppercase">Desabastos hoy</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {criticalItems.length} <span className="text-xs font-normal text-emerald-200">productos</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <div className="text-[11px] text-emerald-200 font-semibold uppercase">Ahorro potencial</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5 tabular-nums">
                ${totalPotentialSavings.toFixed(2)}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <div className="text-[11px] text-emerald-200 font-semibold uppercase">Alertas Activas</div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
                {criticalAlerts.length} <span className="text-xs font-normal text-white">críticas</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <div className="text-[11px] text-emerald-200 font-semibold uppercase">Red de Precios</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span className="text-sm font-bold text-white">100% al día</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Urgent Decision of the Day (The Hero Card) */}
      {topOpportunity && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500/40 p-6 sm:p-7 shadow-md relative overflow-hidden space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E5E8]">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#0D6832] font-black text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#198754]" />
                RECOMENDACIÓN #1 DEL DÍA
              </span>
              <span className="text-xs font-bold text-[#5A626A]">
                {topOpportunity.badge}
              </span>
            </div>

            <span className="text-xs font-extrabold text-[#0D6832] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Ahorras +${topOpportunity.estimatedSavings.toFixed(2)} MXN
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#1A1D20] tracking-tight">
                {topOpportunity.productName} ({topOpportunity.presentation})
              </h2>
              <p className="text-sm text-[#1A1D20] font-bold">
                {topOpportunity.what}
              </p>
              <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E2E5E8] text-xs text-[#5A626A] space-y-1">
                <p><strong>Situación:</strong> {topOpportunity.whyBreakdown.context}</p>
                <p className="text-[#0D6832] font-semibold">
                  <strong>Plan de acción:</strong> {topOpportunity.whyBreakdown.recommendation}
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-2.5">
              <button
                onClick={() => onApplyOpportunity(topOpportunity.id)}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0F5132] hover:bg-[#198754] text-white font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <span>Aceptar y Agregar a Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateToTab('purchases')}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#F8F9FA] hover:bg-[#E2E5E8] text-[#1A1D20] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#E2E5E8]"
              >
                <span>Comparar todos los proveedores</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Operational Shortcuts & Critical Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Critical Products List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E2E5E8] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E8]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-extrabold text-base text-[#1A1D20]">
                Productos a Punto de Agotarse ({criticalItems.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="text-xs font-bold text-[#0F5132] hover:text-[#198754] flex items-center gap-1 cursor-pointer"
            >
              <span>Ver inventario completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {criticalItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-red-200 bg-red-50/40 flex items-center justify-between gap-3 hover:bg-red-50/80 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#1A1D20]">{item.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-black">
                      {item.daysOfStock.toFixed(1)} DÍAS
                    </span>
                  </div>
                  <div className="text-xs text-[#5A626A]">
                    Te quedan <strong>{item.currentStock} pzas</strong> • Vendes ~{item.avgDailySales} al día
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToTab('purchases')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-red-300 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-2xs shrink-0"
                >
                  Surtir hoy
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Actions & Fast Access (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Mostrador Barcode Scanner & POS Register Shortcuts */}
          <div className="bg-[#1A1D20] rounded-3xl p-5 text-white shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                <ScanBarcode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Caja POS & Lector Mostrador</h3>
                <p className="text-[11px] text-gray-300">Cobro rápido de tickets, lector de código de barras y cálculo de cambio.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigateToTab('pos')}
                className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Cobrar en Caja POS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateToTab('sales')}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
              >
                <span>Ver Demanda</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              </button>
            </div>
          </div>

          {/* Asesor IA (OpenAI) Direct Action Card */}
          {onOpenAiAdvisor && (
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-3xl p-5 text-white shadow-md space-y-3 border border-emerald-600/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center shadow-sm border border-amber-300/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <span>Asesor OpenAI (GPT-4o)</span>
                      <span className="bg-amber-400 text-stone-950 font-black text-[9px] px-1.5 py-0.2 rounded-md">ACTIVO</span>
                    </h3>
                    <p className="text-[11px] text-emerald-200">Pregunta sobre márgenes, proveedores o estrategias de caja.</p>
                  </div>
                </div>
              </div>
              <button
                onClick={onOpenAiAdvisor}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-emerald-50 text-[#0F5132] font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Consultar Asesor Inteligente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateToTab('purchases')}
              className="p-4 rounded-2xl bg-white border border-[#E2E5E8] hover:border-[#0F5132] text-left transition-all cursor-pointer shadow-2xs space-y-1 group"
            >
              <ShoppingCart className="w-5 h-5 text-[#0F5132] group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-[#1A1D20] pt-1">Lista de Compras</div>
              <div className="text-[10px] text-[#5A626A]">Armar pedido inteligente</div>
            </button>

            <button
              onClick={() => onNavigateToTab('prices')}
              className="p-4 rounded-2xl bg-white border border-[#E2E5E8] hover:border-[#0F5132] text-left transition-all cursor-pointer shadow-2xs space-y-1 group"
            >
              <TrendingUp className="w-5 h-5 text-[#0F5132] group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-[#1A1D20] pt-1">Red de Precios</div>
              <div className="text-[10px] text-[#5A626A]">Central, Zorro, Scorpion</div>
            </button>

            <button
              onClick={() => onNavigateToTab('calculator')}
              className="p-4 rounded-2xl bg-white border border-[#E2E5E8] hover:border-[#0F5132] text-left transition-all cursor-pointer shadow-2xs space-y-1 group"
            >
              <DollarSign className="w-5 h-5 text-[#0F5132] group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-[#1A1D20] pt-1">Calculadora Promos</div>
              <div className="text-[10px] text-[#5A626A]">Desarmar combos 3x2</div>
            </button>

            <button
              onClick={() => onNavigateToTab('agents')}
              className="p-4 rounded-2xl bg-white border border-[#E2E5E8] hover:border-[#0F5132] text-left transition-all cursor-pointer shadow-2xs space-y-1 group"
            >
              <Sparkles className="w-5 h-5 text-[#0F5132] group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-[#1A1D20] pt-1">9 Agentes IA</div>
              <div className="text-[10px] text-[#5A626A]">Gobernanza y contratos</div>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
