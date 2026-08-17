import React, { useState } from 'react';
import { 
  TrendingUp, 
  Receipt, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  BarChart3, 
  Sparkles, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  RotateCcw, 
  Ban, 
  CheckCircle2, 
  X, 
  Clock, 
  CreditCard, 
  Eye, 
  Share2, 
  Layers, 
  Zap,
  Target,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { 
  SaleTransaction, 
  InventoryItem, 
  StoreProfile, 
  ProductDemandAnalysis, 
  DailySalesBrief, 
  ProductPerformanceBadge,
  PaymentMethod 
} from '../../types';
import { analyzeProductDemand, calculateDailySalesBrief } from '../../services/demandEngine';

interface SalesDemandAnalyticsViewProps {
  sales: SaleTransaction[];
  inventory: InventoryItem[];
  storeProfile: StoreProfile;
  onRefundSale: (sale: SaleTransaction, refundReason: string, restock: boolean) => void;
  onCancelSale: (sale: SaleTransaction, cancellationMotive: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const SalesDemandAnalyticsView: React.FC<SalesDemandAnalyticsViewProps> = ({
  sales,
  inventory,
  storeProfile,
  onRefundSale,
  onCancelSale,
  onNavigateToTab,
}) => {
  // Navigation sub-tabs
  type SalesSubTab = 'history' | 'analytics' | 'matrix' | 'forecast';
  const [activeSubTab, setActiveSubTab] = useState<SalesSubTab>('history');

  // Filters for sales ledger
  const [searchTicket, setSearchTicket] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  // Performance Matrix Filter
  const [matrixFilter, setMatrixFilter] = useState<string>('ALL');

  // Selected Sale for Detailed Modal View
  const [selectedSale, setSelectedSale] = useState<SaleTransaction | null>(null);

  // Refund / Cancel Action Modal State
  const [actionType, setActionType] = useState<'refund' | 'cancel' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [restockOnRefund, setRestockOnRefund] = useState(true);

  // Compute Demand Analyses & Brief
  const demandAnalyses: ProductDemandAnalysis[] = analyzeProductDemand(inventory, sales);
  const dailyBrief: DailySalesBrief = calculateDailySalesBrief(sales, demandAnalyses);

  // Filter Sales Transactions
  const filteredSales = sales.filter((s) => {
    const q = searchTicket.toLowerCase().trim();
    const matchesQuery = 
      !q || 
      s.ticketNumber.toString().includes(q) || 
      s.id.toLowerCase().includes(q) ||
      s.cashierName.toLowerCase().includes(q) ||
      s.items.some((i) => i.productName.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || s.payment.method === paymentFilter;

    return matchesQuery && matchesStatus && matchesPayment;
  });

  // Filter Matrix Items
  const filteredMatrix = demandAnalyses.filter((item) => {
    if (matrixFilter === 'ALL') return true;
    return item.performanceClass === matrixFilter;
  });

  // Submit Refund
  const handleExecuteRefund = () => {
    if (!selectedSale || !actionReason.trim()) return;
    onRefundSale(selectedSale, actionReason, restockOnRefund);
    setActionType(null);
    setActionReason('');
    setSelectedSale(null);
  };

  // Submit Cancellation
  const handleExecuteCancel = () => {
    if (!selectedSale || !actionReason.trim()) return;
    onCancelSale(selectedSale, actionReason);
    setActionType(null);
    setActionReason('');
    setSelectedSale(null);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header with Live Key Metrics Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#E2E5E8] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                Cerebro Comercial & Demanda
              </span>
              <span className="text-xs text-[#5A626A]">Tienda: {storeProfile.storeName}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1A1D20] mt-1 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#0F5132]" />
              Ventas, Demanda & Forecasting
            </h1>
            <p className="text-xs sm:text-sm text-[#5A626A]">
              Historial transaccional auditado, análisis de demanda predictiva y optimización de márgenes en tiempo real.
            </p>
          </div>

          {/* KPI Snapshot Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E2E5E8] text-center">
              <div className="text-[10px] text-[#5A626A] font-bold uppercase tracking-wider">Ventas Hoy</div>
              <div className="text-base font-black text-[#0F5132]">${dailyBrief.todaySales.toFixed(2)}</div>
              <div className="text-[10px] text-[#5A626A]">{dailyBrief.todayTickets} tickets</div>
            </div>

            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E2E5E8] text-center">
              <div className="text-[10px] text-[#5A626A] font-bold uppercase tracking-wider">Ganancia Bruta</div>
              <div className="text-base font-black text-[#1A1D20]">${dailyBrief.grossMargin.toFixed(2)}</div>
              <div className="text-[10px] text-emerald-700 font-bold">{dailyBrief.marginPercent}% margen</div>
            </div>

            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E2E5E8] text-center">
              <div className="text-[10px] text-[#5A626A] font-bold uppercase tracking-wider">Ticket Promedio</div>
              <div className="text-base font-black text-[#1A1D20]">${dailyBrief.avgTicket.toFixed(2)}</div>
              <div className="text-[10px] text-[#5A626A]">{dailyBrief.todayUnits} piezas</div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Top Estrella</div>
              <div className="text-xs font-black text-[#0F5132] truncate">{dailyBrief.topStarProduct}</div>
              <div className="text-[10px] text-emerald-700 font-bold">Alta Rotación</div>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-4 border-t border-[#E2E5E8]">
          {[
            { id: 'history' as SalesSubTab, label: 'Historial de Tickets', icon: Receipt },
            { id: 'analytics' as SalesSubTab, label: 'Métricas & Horas Pico', icon: BarChart3 },
            { id: 'matrix' as SalesSubTab, label: 'Matriz de Rendimiento', icon: Target },
            { id: 'forecast' as SalesSubTab, label: 'Motor de Demanda & Forecasting', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0F5132] text-white shadow-xs'
                    : 'bg-[#F8F9FA] text-[#5A626A] hover:bg-[#E2E5E8] hover:text-[#1A1D20]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 1: HISTORIAL DE TICKETS (LEDGER)
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          
          {/* Search & Filters */}
          <div className="bg-white rounded-2xl p-4 border border-[#E2E5E8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#5A626A]" />
              <input
                type="text"
                value={searchTicket}
                onChange={(e) => setSearchTicket(e.target.value)}
                placeholder="Buscar por ticket, producto o cajero..."
                className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#0F5132]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <div className="flex items-center gap-1 bg-[#F8F9FA] p-1 rounded-xl border border-[#E2E5E8] text-xs">
                <span className="text-[11px] text-[#5A626A] font-bold px-2">Estado:</span>
                {['ALL', 'COMPLETED', 'REFUNDED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-white text-[#1A1D20] shadow-2xs'
                        : 'text-[#5A626A] hover:text-[#1A1D20]'
                    }`}
                  >
                    {st === 'ALL' ? 'Todos' : st === 'COMPLETED' ? 'Completados' : st === 'REFUNDED' ? 'Devueltos' : 'Cancelados'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-[#F8F9FA] p-1 rounded-xl border border-[#E2E5E8] text-xs">
                <span className="text-[11px] text-[#5A626A] font-bold px-2">Pago:</span>
                {['ALL', 'efectivo', 'tarjeta', 'transferencia'].map((pm) => (
                  <button
                    key={pm}
                    onClick={() => setPaymentFilter(pm)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                      paymentFilter === pm
                        ? 'bg-white text-[#1A1D20] shadow-2xs'
                        : 'text-[#5A626A] hover:text-[#1A1D20]'
                    }`}
                  >
                    {pm === 'ALL' ? 'Todos' : pm}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-2xl border border-[#E2E5E8] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-[#E2E5E8] text-[#5A626A] font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Ticket</th>
                    <th className="py-3.5 px-4">Fecha & Hora</th>
                    <th className="py-3.5 px-4">Productos Vendidos</th>
                    <th className="py-3.5 px-4">Método de Pago</th>
                    <th className="py-3.5 px-4 text-right">Total</th>
                    <th className="py-3.5 px-4 text-right">Ganancia</th>
                    <th className="py-3.5 px-4 text-center">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#5A626A]">
                        No se encontraron tickets con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#1A1D20]">
                          #{sale.ticketNumber}
                        </td>
                        <td className="py-3.5 px-4 text-[#5A626A]">
                          <div>{sale.date}</div>
                          <div className="text-[10px] text-[#5A626A]">{sale.timestamp}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#1A1D20]">
                            {sale.totalUnits} {sale.totalUnits === 1 ? 'pieza' : 'piezas'} ({sale.items.length} {sale.items.length === 1 ? 'producto' : 'productos'})
                          </div>
                          <div className="text-[11px] text-[#5A626A] truncate max-w-xs">
                            {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase bg-slate-100 text-slate-800">
                            {sale.payment.method}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-sm text-[#1A1D20]">
                          ${sale.total.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-bold text-emerald-800">+${sale.totalGrossMargin.toFixed(2)}</div>
                          <div className="text-[10px] text-emerald-700">{sale.marginPercent}%</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            sale.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sale.status === 'REFUNDED'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {sale.status === 'COMPLETED' ? 'Completado' : sale.status === 'REFUNDED' ? 'Devuelto' : 'Cancelado'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="px-3 py-1.5 rounded-lg border border-[#E2E5E8] bg-white hover:bg-[#F8F9FA] font-bold text-xs text-[#1A1D20] flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 2: ANALÍTICA & HORAS PICO
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Hourly Curve Chart */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E5E8] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#1A1D20] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#0F5132]" />
                  Curva de Ventas por Hora (Picos de Afluencia en Mostrador)
                </h3>
                <p className="text-xs text-[#5A626A]">
                  Horarios de mayor tráfico para optimizar inventario y reabastecimiento antes de las horas pico.
                </p>
              </div>
              <span className="text-xs font-bold text-[#0F5132] bg-emerald-50 px-2.5 py-1 rounded-lg">
                Pico Principal: 5:00 PM - 7:00 PM
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-4 items-end min-h-[220px]">
              {dailyBrief.hourlySales.map((slot) => {
                const maxAmount = 1500;
                const heightPct = Math.min(100, Math.max(12, (slot.amount / maxAmount) * 100));
                const isPeak = slot.amount > 1000;

                return (
                  <div key={slot.hour} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="text-[10px] font-bold text-[#5A626A] opacity-0 group-hover:opacity-100 transition-opacity">
                      ${slot.amount}
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all ${
                        isPeak
                          ? 'bg-[#0F5132] group-hover:bg-[#198754]'
                          : 'bg-emerald-200 group-hover:bg-emerald-300'
                      }`}
                    />
                    <div className="text-[10px] font-bold text-[#5A626A]">{slot.hour}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Categories Breakdown & Payment Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category Revenue & Margin Share */}
            <div className="bg-white rounded-2xl p-5 border border-[#E2E5E8] shadow-xs space-y-4">
              <h3 className="text-base font-black text-[#1A1D20] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0F5132]" />
                Ventas y Margen por Categoría
              </h3>

              <div className="space-y-3">
                {[
                  { name: 'Bebidas', revenue: 480, margin: 24.5, pct: 36 },
                  { name: 'Abarrotes', revenue: 390, margin: 21.0, pct: 29 },
                  { name: 'Lácteos & Huevos', revenue: 260, margin: 18.2, pct: 19 },
                  { name: 'Botanas & Dulces', revenue: 120, margin: 26.0, pct: 9 },
                  { name: 'Limpieza', revenue: 90, margin: 22.0, pct: 7 },
                ].map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#1A1D20]">{cat.name}</span>
                      <span className="text-[#0F5132]">${cat.revenue.toFixed(2)} ({cat.margin}% margen)</span>
                    </div>
                    <div className="w-full bg-[#F8F9FA] rounded-full h-2 overflow-hidden">
                      <div
                        style={{ width: `${cat.pct}%` }}
                        className="bg-[#0F5132] h-full rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-[#E2E5E8] shadow-xs space-y-4">
              <h3 className="text-base font-black text-[#1A1D20] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0F5132]" />
                Distribución por Método de Pago
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#0F5132] flex items-center justify-center font-bold">
                      $
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1A1D20]">Efectivo en Caja</div>
                      <div className="text-[10px] text-[#5A626A]">72% del volumen total</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-[#1A1D20]">$965.00</div>
                    <div className="text-[10px] text-emerald-700 font-bold">Sin comisiones</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1A1D20]">Tarjeta Débito/Crédito</div>
                      <div className="text-[10px] text-[#5A626A]">20% del volumen</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-[#1A1D20]">$268.00</div>
                    <div className="text-[10px] text-slate-500">Terminal bancaria</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1A1D20]">Transferencias SPEI</div>
                      <div className="text-[10px] text-[#5A626A]">8% del volumen</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-[#1A1D20]">$107.00</div>
                    <div className="text-[10px] text-purple-700 font-bold">Abonos directos</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 3: MATRIZ DE RENDIMIENTO
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-[#E2E5E8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-[#1A1D20]">Matriz BCG de Rendimiento de Inventario</h3>
              <p className="text-xs text-[#5A626A]">Clasificación matemática según velocidad de venta y margen bruto real.</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { id: 'ALL', label: 'Todos' },
                { id: 'STAR', label: '⭐ Estrellas' },
                { id: 'CASH_COW', label: '🐮 Vaca Lechera' },
                { id: 'LOW_MARGIN', label: '📉 Margen Bajo' },
                { id: 'DEAD_STOCK', label: '🧊 Estancados' },
                { id: 'OPPORTUNITY', label: '💡 Oportunidad' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setMatrixFilter(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    matrixFilter === p.id
                      ? 'bg-[#0F5132] text-white shadow-xs'
                      : 'bg-[#F8F9FA] text-[#5A626A] hover:bg-[#E2E5E8]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Matrix Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatrix.map((item) => {
              const badgeStyles: Record<ProductPerformanceBadge, { bg: string; text: string; label: string }> = {
                STAR: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-900', label: '⭐ PRODUCTO ESTRELLA' },
                CASH_COW: { bg: 'bg-blue-100 border-blue-300', text: 'text-blue-900', label: '🐮 VACA LECHERA' },
                LOW_MARGIN: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-900', label: '📉 MARGEN REDUCIDO' },
                SLOW_MOVING: { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-900', label: '🐢 ROTACIÓN LENTA' },
                DEAD_STOCK: { bg: 'bg-red-100 border-red-300', text: 'text-red-900', label: '🧊 CAPITAL CONGELADO' },
                OPPORTUNITY: { bg: 'bg-purple-100 border-purple-300', text: 'text-purple-900', label: '💡 OPORTUNIDAD' },
              };

              const style = badgeStyles[item.performanceClass] || badgeStyles.SLOW_MOVING;

              return (
                <div
                  key={item.productId}
                  className="bg-white rounded-2xl p-4 border border-[#E2E5E8] shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                      <span className="text-[10px] text-[#5A626A] font-bold">Stock: {item.currentStock} pzas</span>
                    </div>

                    <h4 className="text-sm font-black text-[#1A1D20] mt-2">{item.productName}</h4>
                    <p className="text-xs text-[#5A626A] mt-0.5">{item.performanceClassTitle}</p>
                  </div>

                  {/* Key Financial & Velocity Stats */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#F8F9FA] rounded-xl text-center text-xs">
                    <div>
                      <div className="text-[10px] text-[#5A626A]">Venta Diaria</div>
                      <div className="font-bold text-[#1A1D20]">{item.avgDailySales} pzas</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#5A626A]">Margen Real</div>
                      <div className="font-bold text-[#0F5132]">{item.currentMarginPercent}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#5A626A]">Tendencia</div>
                      <div className="font-bold text-emerald-700">+{item.trendPercentage}%</div>
                    </div>
                  </div>

                  {/* Recommendation action */}
                  {item.priceRecommendationReason && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                      💡 {item.priceRecommendationReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 4: MOTOR DE DEMANDA & FORECASTING
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'forecast' && (
        <div className="space-y-6">
          
          {/* Lost Sales Warning Banner */}
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-950">Detector de Ventas Perdidas por Desabasto</h3>
                <p className="text-xs text-amber-900 mt-0.5">
                  Se estiman <strong>$460.00 MXN en demanda no capturada</strong> durante los últimos días debido a quiebres de stock en Leche Lala y Pan Blanco.
                </p>
              </div>
            </div>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('purchases')}
                className="px-4 py-2 bg-amber-900 text-white rounded-xl text-xs font-bold hover:bg-amber-950 transition-colors shrink-0 cursor-pointer"
              >
                Reabastecer en Compras
              </button>
            )}
          </div>

          {/* Forecasting Table for next 7 to 14 days */}
          <div className="bg-white rounded-2xl border border-[#E2E5E8] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E2E5E8]">
              <h3 className="text-base font-black text-[#1A1D20] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0F5132]" />
                Predicción de Demanda a 7 Días (Algoritmo Determinista con IA)
              </h3>
              <p className="text-xs text-[#5A626A]">
                Cálculo basado en velocidad histórica, día de la semana, estacionalidad y comportamiento de compra del cliente.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-[#E2E5E8] text-[#5A626A] font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Producto</th>
                    <th className="py-3.5 px-4">Stock Actual</th>
                    <th className="py-3.5 px-4">Venta Diaria</th>
                    <th className="py-3.5 px-4">Demanda Prevista (7 Días)</th>
                    <th className="py-3.5 px-4">Nivel de Confianza</th>
                    <th className="py-3.5 px-4">Precio Sugerido</th>
                    <th className="py-3.5 px-4">Diagnóstico Inteligente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {demandAnalyses.map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1A1D20]">{item.productName}</div>
                        <div className="text-[10px] text-[#5A626A]">{item.category}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className={item.currentStock < 10 ? 'text-red-600' : 'text-slate-800'}>
                          {item.currentStock} pzas
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#5A626A] font-medium">
                        {item.avgDailySales} pzas/día
                      </td>
                      <td className="py-3.5 px-4 font-black text-sm text-[#0F5132]">
                        ~{item.forecastNext7Days} pzas
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 bg-[#F8F9FA] rounded-full h-2 overflow-hidden">
                            <div
                              style={{ width: `${item.forecastConfidence}%` }}
                              className="bg-[#0F5132] h-full rounded-full"
                            />
                          </div>
                          <span className="font-bold text-[11px] text-[#5A626A]">{item.forecastConfidence}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        {item.suggestedSalePrice ? (
                          <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                            ${item.suggestedSalePrice.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-500">Sin cambios</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#5A626A] max-w-xs">
                        {item.priceRecommendationReason || 'Demanda estable en rango óptimo.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: INSPECCIÓN COMPLETA DE TICKET & DEVOLUCIONES / CANCELACIÓN
      ───────────────────────────────────────────────────────────── */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E5E8] animate-in fade-in zoom-in-95 duration-150 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E8]">
              <div>
                <span className="text-[10px] font-black text-[#0F5132] uppercase tracking-wider">
                  Ticket #{selectedSale.ticketNumber} • {selectedSale.status}
                </span>
                <h3 className="text-xl font-black text-[#1A1D20]">Detalle de Transacción</h3>
              </div>
              <button onClick={() => setSelectedSale(null)} className="p-1 text-[#5A626A] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8F9FA] p-3 rounded-xl border border-[#E2E5E8]">
              <div>
                <span className="text-[10px] text-[#5A626A]">Fecha y Hora:</span>
                <div className="font-bold text-[#1A1D20]">{selectedSale.date} {selectedSale.timestamp}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#5A626A]">Cajero:</span>
                <div className="font-bold text-[#1A1D20]">{selectedSale.cashierName}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#5A626A]">Método de Pago:</span>
                <div className="font-bold text-[#1A1D20] uppercase">{selectedSale.payment.method}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#5A626A]">ID Transacción:</span>
                <div className="font-mono text-[10px] text-[#5A626A] truncate">{selectedSale.id}</div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="space-y-2 max-h-52 overflow-y-auto divide-y divide-slate-100">
              {selectedSale.items.map((item, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#1A1D20]">{item.quantity}x {item.productName}</div>
                    <div className="text-[10px] text-[#5A626A]">Costo: ${item.unitCost.toFixed(2)} • Venta: ${item.unitPrice.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-[#1A1D20]">${item.total.toFixed(2)}</div>
                    <div className="text-[10px] text-emerald-700 font-bold">+${item.grossMargin.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
              <div className="flex justify-between font-bold text-sm text-[#1A1D20]">
                <span>Total Cobrado:</span>
                <span className="text-base text-[#0F5132]">${selectedSale.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-900 text-[11px]">
                <span>Ganancia Bruta:</span>
                <span className="font-bold">+${selectedSale.totalGrossMargin.toFixed(2)} ({selectedSale.marginPercent}%)</span>
              </div>
            </div>

            {/* Refund / Cancel Action Trigger if sale is completed */}
            {selectedSale.status === 'COMPLETED' && (
              <div className="pt-2 border-t border-[#E2E5E8] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('refund')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Procesar Devolución</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType('cancel')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold hover:bg-red-100 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Anular Ticket</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: DEVOLUCIÓN O CANCELACIÓN DE TICKET
      ───────────────────────────────────────────────────────────── */}
      {actionType && selectedSale && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E5E8] animate-in fade-in zoom-in-95 duration-150 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E8]">
              <h3 className="text-lg font-black text-[#1A1D20]">
                {actionType === 'refund' ? 'Procesar Devolución' : 'Anulación de Ticket'}
              </h3>
              <button onClick={() => setActionType(null)} className="p-1 text-[#5A626A] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5A626A]">
              {actionType === 'refund'
                ? `Se reembolsarán $${selectedSale.total.toFixed(2)} MXN correspondientes al Ticket #${selectedSale.ticketNumber}. Se creará un asiento de devolución en Kardex.`
                : `Se anulará el Ticket #${selectedSale.ticketNumber} y el inventario volverá a su estado anterior.`}
            </p>

            {actionType === 'refund' && (
              <label className="flex items-center gap-2 p-3 bg-[#F8F9FA] rounded-xl border border-[#E2E5E8] text-xs font-bold text-[#1A1D20] cursor-pointer">
                <input
                  type="checkbox"
                  checked={restockOnRefund}
                  onChange={(e) => setRestockOnRefund(e.target.checked)}
                  className="rounded text-[#0F5132] focus:ring-[#0F5132]"
                />
                <span>Reingresar productos al inventario físico</span>
              </label>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A1D20]">
                Motivo Obligatorio (Para Auditoría):
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Ej. Producto caducado, error de cobro, empaque dañado..."
                rows={3}
                className="w-full p-3 bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#0F5132]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionType(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E2E5E8] text-xs font-bold text-[#5A626A] hover:bg-[#F8F9FA] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!actionReason.trim()}
                onClick={actionType === 'refund' ? handleExecuteRefund : handleExecuteCancel}
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer ${
                  actionType === 'refund' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {actionType === 'refund' ? 'Confirmar Devolución' : 'Confirmar Anulación'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
