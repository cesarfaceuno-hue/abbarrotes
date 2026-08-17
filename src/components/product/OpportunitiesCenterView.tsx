import React, { useState } from 'react';
import { 
  Sparkles, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Info,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import { DailyOpportunity } from '../../types';

interface OpportunitiesCenterViewProps {
  opportunities: DailyOpportunity[];
  onApplyOpportunity: (id: string) => void;
  onDismissOpportunity: (id: string) => void;
  onNavigateToTab: (tabName: string) => void;
}

export const OpportunitiesCenterView: React.FC<OpportunitiesCenterViewProps> = ({
  opportunities,
  onApplyOpportunity,
  onDismissOpportunity,
  onNavigateToTab,
}) => {
  const [activeCategory, setActiveCategory] = useState<'todos' | 'ahorros' | 'compras' | 'margen' | 'riesgos' | 'inventario'>('todos');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const categories = [
    { id: 'todos', label: 'Todas', icon: Sparkles },
    { id: 'ahorros', label: 'Ahorros de Compra', icon: DollarSign },
    { id: 'compras', label: 'Reabastecimiento', icon: ShoppingCart },
    { id: 'margen', label: 'Mejora de Margen', icon: TrendingUp },
    { id: 'riesgos', label: 'Riesgo / Alzas', icon: AlertTriangle },
    { id: 'inventario', label: 'Trampas de Stock', icon: Package },
  ];

  const filteredOpportunities = opportunities.filter((opp) => {
    if (activeCategory === 'todos') return true;
    return opp.categoryType === activeCategory;
  });

  const handleApply = (opp: DailyOpportunity) => {
    onApplyOpportunity(opp.id);
    setSuccessMessage(`¡Oportunidad aplicada para "${opp.productName}"! Registrada en compras.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleDismiss = (opp: DailyOpportunity) => {
    onDismissOpportunity(opp.id);
    setSuccessMessage(`Oportunidad descartada.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20] tracking-tight">
          Centro de Oportunidades & Arbitraje Comercial
        </h1>
        <p className="text-xs sm:text-sm text-[#5A626A]">
          Diagnósticos transparentes con desglose financiero: <strong>QUÉ → POR QUÉ → CUÁNDO → CUÁNTO → BENEFICIO</strong>.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-[#0D6832] font-bold text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#198754] shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0F5132] text-white shadow-2xs'
                  : 'bg-white border border-[#E2E5E8] text-[#5A626A] hover:bg-[#F8F9FA]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.map((opp) => {
          const isApplied = opp.status === 'applied';
          const isDismissed = opp.status === 'dismissed';
          const isPending = opp.status === 'pending';

          return (
            <div
              key={opp.id}
              className={`bg-white rounded-3xl border p-6 sm:p-7 shadow-sm transition-all space-y-5 ${
                isApplied
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : isDismissed
                  ? 'border-gray-200 bg-gray-50/50 opacity-60'
                  : 'border-[#E2E5E8] hover:border-[#0F5132]'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2E5E8]">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wide flex items-center gap-1.5 ${
                    opp.badgeType === 'urgent'
                      ? 'bg-red-100 text-red-800'
                      : opp.badgeType === 'warning'
                      ? 'bg-amber-100 text-amber-900'
                      : opp.badgeType === 'info'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-emerald-100 text-[#0D6832]'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    {opp.badge}
                  </span>
                  <span className="text-xs font-bold text-[#5A626A]">
                    {opp.rotation} • {opp.stockAlert}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-[#0D6832] bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    Beneficio Est.: +${opp.estimatedSavings.toFixed(2)} MXN
                  </span>
                </div>
              </div>

              {/* Title & Core Summary */}
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-[#1A1D20] tracking-tight">
                  {opp.productName} ({opp.presentation})
                </h3>
                <p className="text-sm sm:text-base font-bold text-[#1A1D20]">
                  {opp.what}
                </p>
              </div>

              {/* 5-Step Transparency Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E2E5E8] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#5A626A] block">1. QUÉ SE DETECTÓ</span>
                  <p className="text-xs text-[#1A1D20] leading-relaxed">{opp.whyBreakdown.found}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E2E5E8] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#5A626A] block">2. CONTEXTO EN TU TIENDA</span>
                  <p className="text-xs text-[#1A1D20] leading-relaxed">{opp.whyBreakdown.context}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#0D6832] block">3. ACCIÓN RECOMENDADA</span>
                  <p className="text-xs text-[#0D6832] font-bold leading-relaxed">{opp.whyBreakdown.recommendation}</p>
                </div>
              </div>

              {/* Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8]">
                  <div className="text-[10px] uppercase font-bold text-[#5A626A]">Costo habitual</div>
                  <div className="text-sm font-extrabold text-[#1A1D20]">${opp.lastPrice.toFixed(2)}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] uppercase font-bold text-[#0D6832]">Precio detectado</div>
                  <div className="text-sm font-black text-[#0D6832]">${opp.todayPrice.toFixed(2)}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8]">
                  <div className="text-[10px] uppercase font-bold text-[#5A626A]">Velocidad de venta</div>
                  <div className="text-sm font-extrabold text-[#1A1D20]">{opp.salesVelocity}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8]">
                  <div className="text-[10px] uppercase font-bold text-[#5A626A]">Sugerencia de compra</div>
                  <div className="text-sm font-extrabold text-[#1A1D20]">{opp.suggestedPackage}</div>
                </div>
              </div>

              {/* Action Buttons */}
              {isPending && (
                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#E2E5E8]">
                  <button
                    onClick={() => handleDismiss(opp)}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-100 border border-[#E2E5E8] text-xs font-bold text-[#5A626A] transition-colors cursor-pointer"
                  >
                    Descartar por ahora
                  </button>

                  <button
                    onClick={() => handleApply(opp)}
                    className="px-5 py-2.5 rounded-xl bg-[#0F5132] hover:bg-[#198754] text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aceptar Oportunidad</span>
                  </button>
                </div>
              )}

              {isApplied && (
                <div className="text-xs font-bold text-[#0D6832] flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Oportunidad Aceptada e Integrada en tu Lista de Compras</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
