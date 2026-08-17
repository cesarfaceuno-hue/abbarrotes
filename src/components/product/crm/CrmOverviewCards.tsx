import React from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Zap,
  Clock
} from 'lucide-react';

interface CrmOverviewCardsProps {
  overview: {
    totalCustomers: number;
    activeCustomers: number;
    atRiskCustomers: number;
    prospectCustomers: number;
    pipelineValue: number;
    totalEstimatedSavings: number;
    opportunitiesCount: number;
    pendingTasks: number;
    todayTasks: number;
    aiInsightsCount: number;
    criticalInsightsCount: number;
    activeSuppliersCount: number;
    avgCustomerSales: number;
    avgGrossMargin: number;
  };
}

export const CrmOverviewCards: React.FC<CrmOverviewCardsProps> = ({ overview }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {/* CARD 1: TOTAL TIENDAS */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Tiendas / Clientes</span>
          <Users className="w-4 h-4 text-emerald-400" />
        </div>
        <p className="text-xl font-bold text-white tracking-tight">
          {overview.totalCustomers}
        </p>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-emerald-400 font-semibold">{overview.activeCustomers} activos</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-400">{overview.prospectCustomers} prosp.</span>
        </div>
      </div>

      {/* CARD 2: PIPELINE VALUE */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Pipeline Comercial</span>
          <DollarSign className="w-4 h-4 text-indigo-400" />
        </div>
        <p className="text-xl font-bold text-indigo-400 tracking-tight">
          ${(overview.pipelineValue / 1000).toFixed(0)}k <span className="text-xs text-slate-400 font-normal">MXN</span>
        </p>
        <span className="text-[11px] text-slate-400 block">
          {overview.opportunitiesCount} acuerdos activos
        </span>
      </div>

      {/* CARD 3: ESTIMATED SAVINGS */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Ahorro Estimado Clientes</span>
          <TrendingUp className="w-4 h-4 text-cyan-400" />
        </div>
        <p className="text-xl font-bold text-cyan-400 tracking-tight">
          ${overview.totalEstimatedSavings.toLocaleString()}
        </p>
        <span className="text-[11px] text-emerald-400 block font-medium">
          Retorno tangible
        </span>
      </div>

      {/* CARD 4: AT RISK / CHURN */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Riesgo de Churn</span>
          <AlertTriangle className={`w-4 h-4 ${overview.atRiskCustomers > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
        </div>
        <p className={`text-xl font-bold tracking-tight ${overview.atRiskCustomers > 0 ? 'text-rose-400' : 'text-white'}`}>
          {overview.atRiskCustomers}
        </p>
        <span className="text-[11px] text-slate-400 block">
          Requieren retención
        </span>
      </div>

      {/* CARD 5: PENDING TASKS */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Tareas Operativas</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <p className="text-xl font-bold text-white tracking-tight">
          {overview.pendingTasks}
        </p>
        <span className="text-[11px] text-amber-400 block font-medium">
          {overview.todayTasks} vencen hoy
        </span>
      </div>

      {/* CARD 6: AI INSIGHTS */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>IA Insights Comerciales</span>
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <p className="text-xl font-bold text-amber-400 tracking-tight">
          {overview.aiInsightsCount}
        </p>
        <span className="text-[11px] text-rose-400 block font-medium">
          {overview.criticalInsightsCount} alta severidad
        </span>
      </div>
    </div>
  );
};
