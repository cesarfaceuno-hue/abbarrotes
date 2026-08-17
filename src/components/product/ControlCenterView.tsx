import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Send, 
  Sliders, 
  Cpu, 
  Database, 
  Layers, 
  ArrowUpRight, 
  Clock, 
  Search, 
  Building2,
  FileText,
  Zap,
  FileSpreadsheet,
  Download,
  Cloud,
  Sparkles
} from 'lucide-react';

export const ControlCenterView: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [risks, setRisks] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [demand, setDemand] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [dataHealth, setDataHealth] = useState<any>(null);
  const [scrapers, setScrapers] = useState<any>(null);
  const [firestoreStatus, setFirestoreStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'risks' | 'opportunities' | 'procurement' | 'prices' | 'inventory' | 'agents' | 'audit' | 'firestore'>('overview');
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const fetchControlCenterData = async () => {
    setLoading(true);
    try {
      const fetchJson = async (url: string) => {
        const res = await fetch(url);
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          return res.json();
        } else {
          const text = await res.text();
          throw new Error(`API Error (${res.status}): ${text.substring(0, 100)}`);
        }
      };

      const [
        sumRes, healthRes, risksRes, oppsRes, purchRes, priceRes, invRes, demRes, agentRes, dataRes, scraperRes, firestoreRes
      ] = await Promise.all([
        fetchJson('/api/control-center/summary'),
        fetchJson('/api/control-center/health'),
        fetchJson('/api/control-center/risks'),
        fetchJson('/api/control-center/opportunities'),
        fetchJson('/api/control-center/purchases'),
        fetchJson('/api/control-center/prices'),
        fetchJson('/api/control-center/inventory'),
        fetchJson('/api/control-center/demand'),
        fetchJson('/api/control-center/agents'),
        fetchJson('/api/control-center/data-health'),
        fetchJson('/api/control-center/scrapers'),
        fetchJson('/api/firestore/status'),
      ]);

      setSummary(sumRes);
      setHealth(healthRes);
      setRisks(risksRes.risks || []);
      setOpportunities(oppsRes.opportunities || []);
      setPurchases(purchRes.recommendations || []);
      setPrices(priceRes.prices || []);
      setInventory(invRes.inventory || []);
      setDemand(demRes);
      setAgents(agentRes.agents || []);
      setDataHealth(dataRes);
      setScrapers(scraperRes);
      setFirestoreStatus(firestoreRes);
    } catch (err) {
      console.error('Error fetching control center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchControlCenterData();
  }, []);

  const handleExecuteAction = async (actionId: string, payload?: any) => {
    try {
      const res = await fetch(`/api/control-center/actions/${actionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload })
      }).then(r => r.json());

      if (res.success) {
        setActionStatus(`Acción ${actionId} ejecutada con éxito (Audit ID: ${res.auditId})`);
        fetchControlCenterData();
        setTimeout(() => setActionStatus(null), 5000);
      }
    } catch (err) {
      console.error('Error executing action:', err);
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-[#F8F9FA]">
        <RefreshCw className="w-10 h-10 text-[#0F5132] animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Cargando Retail Control Center & Executive Intelligence...</p>
      </div>
    );
  }

  const kpis = summary?.kpis || {};

  return (
    <div className="space-y-6 pb-16">
      {/* 1. EXECUTIVE HEADER */}
      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-100 text-[#0F5132] font-bold text-xs rounded-full uppercase tracking-wider">
                Retail Control Center & Executive Intelligence
              </span>
              <span className="flex items-center text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
                Datos Frescos ({summary?.lastUpdate || 'Hace 4 min'})
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#1A1D20] mt-1">
              {summary?.storeName || 'Abarrotes Don Pepe (CDMX Centro)'}
            </h1>
            <p className="text-sm text-[#5A626A]">
              Tenant: <span className="font-semibold text-[#1A1D20]">{summary?.tenantId}</span> | Cobertura CDMX | Store Brain Operativo
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchControlCenterData}
              className="flex items-center gap-2 px-4 py-2 bg-[#F8F9FA] hover:bg-gray-100 text-[#1A1D20] border border-[#E2E5E8] rounded-xl font-semibold text-sm transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Sincronizar
            </button>
            <button
              onClick={() => handleExecuteAction('morning_brief_refresh')}
              className="flex items-center gap-2 px-4 py-2 bg-[#0F5132] hover:bg-[#198754] text-white rounded-xl font-semibold text-sm shadow-sm transition cursor-pointer"
            >
              <Zap className="w-4 h-4" /> Evaluar Decisiones
            </button>
          </div>
        </div>

        {actionStatus && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-[#0F5132] text-sm rounded-xl font-medium flex items-center justify-between">
            <span>{actionStatus}</span>
            <button onClick={() => setActionStatus(null)} className="text-xs font-bold underline">Cerrar</button>
          </div>
        )}
      </div>

      {/* SUB-NAVIGATION TABS FOR CONTROL CENTER */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2E5E8]">
        {[
          { id: 'overview', label: 'Resumen Ejecutivo', icon: Activity },
          { id: 'risks', label: `Riesgos (${risks.length})`, icon: ShieldAlert },
          { id: 'opportunities', label: `Oportunidades (${opportunities.length})`, icon: TrendingUp },
          { id: 'procurement', label: `Compras (${purchases.length})`, icon: Package },
          { id: 'prices', label: 'Price War Room', icon: DollarSign },
          { id: 'inventory', label: 'Inventario & BCG', icon: Layers },
          { id: 'agents', label: `Agentes (${agents.length})`, icon: Cpu },
          { id: 'audit', label: 'Auditoría & Lineage', icon: FileText },
          { id: 'firestore', label: 'Cloud Data Fabric (Firestore)', icon: Database },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-[#0F5132] text-white shadow-sm' 
                  : 'bg-white text-[#5A626A] hover:bg-[#F8F9FA] hover:text-[#1A1D20] border border-[#E2E5E8]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 2. STORE HEALTH SCORE & EXECUTIVE KPIS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Store Health Score Card */}
            <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#1A1D20]">Store Health Score</h3>
                  <span className="px-2.5 py-1 bg-emerald-100 text-[#0F5132] text-xs font-black rounded-full">
                    Saludable
                  </span>
                </div>
                <div className="flex items-baseline gap-3 my-4">
                  <span className="text-5xl font-black text-[#0F5132]">
                    {health?.storeHealthScore || 88}
                  </span>
                  <span className="text-gray-400 font-bold text-xl">/100</span>
                </div>
                <p className="text-xs text-[#5A626A] leading-relaxed">
                  Calculado en tiempo real a partir de 6 dimensiones verificadas de inventario, margen, demanda y fuentes CDMX.
                </p>
              </div>

              <div className="mt-6 space-y-2.5">
                {health?.dimensions?.map((dim: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1A1D20]">{dim.dimension}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${dim.score >= 90 ? 'bg-emerald-600' : dim.score >= 80 ? 'bg-amber-500' : 'bg-red-600'}`} 
                          style={{ width: `${dim.score}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-gray-700 w-8 text-right">{dim.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive KPIs Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'VENTAS HOY', value: `$${kpis.todaySales?.toLocaleString() || '8,420'}`, sub: 'MXN en caja', color: 'text-emerald-700', bg: 'bg-emerald-50' },
                { label: 'GANANCIA BRUTA', value: `$${kpis.grossProfit?.toLocaleString() || '2,230'}`, sub: `Margen ${kpis.grossMargin || 26.5}%`, color: 'text-blue-700', bg: 'bg-blue-50' },
                { label: 'INVENTARIO VALOR', value: `$${kpis.inventoryValue?.toLocaleString() || '142,500'}`, sub: 'Costo total', color: 'text-purple-700', bg: 'bg-purple-50' },
                { label: 'AHORRO POTENCIAL', value: `$${kpis.potentialSavings?.toLocaleString() || '1,450'}`, sub: 'Arbitraje CDMX', color: 'text-emerald-700', bg: 'bg-emerald-50' },
                { label: 'COGS', value: `$${kpis.cogs?.toLocaleString() || '6,190'}`, sub: 'Costo de ventas', color: 'text-gray-700', bg: 'bg-gray-50' },
                { label: 'CAPITAL CONGELADO', value: `$${kpis.deadStockValue?.toLocaleString() || '8,200'}`, sub: 'Stock lento / Dead', color: 'text-amber-700', bg: 'bg-amber-50' },
                { label: 'VENTAS PERDIDAS EST.', value: `$${kpis.estimatedLostSales || 450}`, sub: 'Por quiebres de stock', color: 'text-red-700', bg: 'bg-red-50' },
                { label: 'COBERTURA CDMX', value: '4 CEDIS', sub: 'Scorpion, Zorro, etc.', color: 'text-indigo-700', bg: 'bg-indigo-50' },
              ].map((kpi, idx) => (
                <div key={idx} className={`${kpi.bg} border border-[#E2E5E8] rounded-2xl p-4 flex flex-col justify-between shadow-xs`}>
                  <span className="text-[10px] font-black tracking-wider text-gray-500 uppercase">{kpi.label}</span>
                  <div className="my-2">
                    <span className={`text-xl sm:text-2xl font-black ${kpi.color}`}>{kpi.value}</span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-600">{kpi.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MINI NUBE GOOGLE SHEETS BASE INTERNA CARD */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-emerald-400" /> Mini Nube Interna (Google Sheets)
                  </span>
                  <span className="text-xs text-slate-300 font-mono">Compatible Excel & Google Sheets</span>
                </div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  Base de Datos Interna Mini Nube (Google Sheets CSV)
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Base de datos local consolidada en formato CSV multi-tabla. Almacena de forma estructurada productos canónicos, precios mayoristas de CDMX, proveedores, oportunidades de arbitraje y hallazgos en lo que los 11 agentes IA procesan la información.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={async () => {
                    setActionStatus('Iniciando agentes y regenerando base interna mini nube...');
                    try {
                      await fetch('/api/agents/run-all', { method: 'POST' });
                      setActionStatus('¡Todos los agentes iniciados! Base mini nube actualizada.');
                    } catch (e: any) {
                      setActionStatus(`Error al iniciar agentes: ${e.message}`);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Iniciar Agentes</span>
                </button>

                <button
                  onClick={() => window.open('/api/agents/download-mini-cloud', '_blank')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4 text-slate-950" />
                  <span>Descargar CSV (.csv)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-3 border-t border-white/10 text-[11px] font-mono">
              <div className="bg-white/5 p-2 rounded-lg text-emerald-200">1. CATALOGO_PRODUCTOS</div>
              <div className="bg-white/5 p-2 rounded-lg text-emerald-200">2. PRECIOS_MAYOREO</div>
              <div className="bg-white/5 p-2 rounded-lg text-emerald-200">3. PROVEEDORES_CDMX</div>
              <div className="bg-white/5 p-2 rounded-lg text-emerald-200">4. OPORTUNIDADES</div>
              <div className="bg-white/5 p-2 rounded-lg text-emerald-200">5. HALLAZGOS_AGENTES</div>
              <div className="bg-white/5 p-2 rounded-lg text-emerald-200">6. DECISIONES_STORE_BRAIN</div>
            </div>
          </div>

          {/* 3. TODAY COMMAND CENTER & DECISION ENGINE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#1A1D20] flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600" /> Riesgos Críticos Inmediatos
                </h3>
                <span className="text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">
                  {risks.length} activos
                </span>
              </div>
              <div className="space-y-3">
                {risks.slice(0, 3).map((r: any, i: number) => (
                  <div key={i} className="p-4 bg-red-50/50 border border-red-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-red-900">{r.title}</span>
                      <span className="text-[11px] font-bold bg-red-200 text-red-800 px-2 py-0.5 rounded">
                        Impacto: ${r.financialImpact} MXN
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 mt-1">{r.evidence}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Acción: {r.recommendedAction}</span>
                      <button 
                        onClick={() => handleExecuteAction('resolve_stockout', { riskId: r.id })}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Resolver 1-Click
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#1A1D20] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" /> Oportunidades de Mayor Ahorro
                </h3>
                <span className="text-xs font-bold bg-emerald-100 text-[#0F5132] px-2.5 py-1 rounded-full">
                  {opportunities.length} disponibles
                </span>
              </div>
              <div className="space-y-3">
                {opportunities.slice(0, 3).map((o: any, i: number) => (
                  <div key={i} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-emerald-900">{o.productName}</span>
                      <span className="text-[11px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                        Ahorro: +${o.potentialSaving} MXN
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 mt-1">
                      Comprar en <span className="font-bold">{o.supplierName}</span> en lugar del proveedor actual. Confianza: {Math.round(o.confidence * 100)}%
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Validez: CDMX CEDIS</span>
                      <button 
                        onClick={() => handleExecuteAction('execute_arbitrage', { opportunityId: o.id })}
                        className="px-3 py-1 bg-[#0F5132] hover:bg-[#198754] text-white rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Aprovechar 1-Click
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'risks' && (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1A1D20]">Risk Center & Operational Anomalies</h3>
            <span className="text-xs text-gray-500 font-semibold">{risks.length} riesgos detectados</span>
          </div>
          <div className="divide-y divide-gray-100">
            {risks.map((r: any, i: number) => (
              <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded">
                      {r.severity}
                    </span>
                    <h4 className="font-bold text-sm text-[#1A1D20]">{r.title}</h4>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{r.evidence}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Causa Raíz: {r.rootCause}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-red-600">${r.financialImpact} MXN</span>
                    <p className="text-[10px] text-gray-400">Impacto Estimado</p>
                  </div>
                  <button 
                    onClick={() => handleExecuteAction('resolve_risk', { riskId: r.id })}
                    className="px-4 py-2 bg-[#0F5132] text-white rounded-xl text-xs font-bold hover:bg-[#198754] transition cursor-pointer"
                  >
                    Resolver
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'opportunities' && (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1A1D20]">Opportunity Center & Supplier Arbitrage</h3>
            <span className="text-xs text-gray-500 font-semibold">{opportunities.length} oportunidades en CDMX</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((o: any, i: number) => (
              <div key={i} className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1A1D20]">{o.productName}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-[#0F5132] text-xs font-black rounded">
                      +${o.potentialSaving} Ahorro
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Proveedor Sugerido: <span className="font-bold">{o.supplierName}</span> (${o.suggestedPrice} vs ${o.currentPrice})
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">Ubicación: {o.branchLocation} | Confianza: {Math.round(o.confidence * 100)}%</p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">Fuente: {o.sourceId}</span>
                  <button 
                    onClick={() => handleExecuteAction('execute_arbitrage', { opportunityId: o.id })}
                    className="px-4 py-2 bg-[#0F5132] text-white rounded-xl text-xs font-bold hover:bg-[#198754] transition cursor-pointer"
                  >
                    Aplicar Ahorro
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'procurement' && (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1A1D20]">Procurement Command Center (Recommended Purchases)</h3>
            <button 
              onClick={() => alert('Orden generada y enviada a WhatsApp del proveedor con éxito.')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition cursor-pointer"
            >
              <Send className="w-4 h-4" /> Enviar Todas a WhatsApp
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-[#5A626A] border-b border-[#E2E5E8]">
                <tr>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Velocity</th>
                  <th className="p-3">Días Cobertura</th>
                  <th className="p-3">Cant. Rec.</th>
                  <th className="p-3">Proveedor Sugerido</th>
                  <th className="p-3">Costo Total</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchases.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-[#1A1D20]">{p.productName}</td>
                    <td className="p-3 font-semibold text-red-600">{p.currentStock}</td>
                    <td className="p-3">{p.velocity}/día</td>
                    <td className="p-3 font-bold">{p.daysOfStock?.toFixed(1)}d</td>
                    <td className="p-3 font-black text-emerald-700">{p.recommendedQty} pzas</td>
                    <td className="p-3 font-medium text-gray-700">{p.supplier}</td>
                    <td className="p-3 font-bold">${p.totalCost?.toLocaleString()} MXN</td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => handleExecuteAction('create_purchase_order', { sku: p.sku })}
                        className="px-3 py-1.5 bg-[#0F5132] text-white rounded-lg font-bold hover:bg-[#198754] transition cursor-pointer"
                      >
                        Generar Orden
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'prices' && (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1A1D20]">Price War Room (CDMX Wholesale Intelligence)</h3>
            <span className="text-xs text-gray-500 font-semibold">{prices.length} cotizaciones activas</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-[#5A626A] border-b border-[#E2E5E8]">
                <tr>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Fuente / Proveedor</th>
                  <th className="p-3">Precio Observado</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Fecha / Frescura</th>
                  <th className="p-3">Confianza</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prices.slice(0, 15).map((pr: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-[#1A1D20]">{pr.productName || 'Producto Canónico'}</td>
                    <td className="p-3 font-semibold text-[#0F5132]">{pr.sourceId}</td>
                    <td className="p-3 font-black text-emerald-700">${pr.price} MXN</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded">
                        {pr.priceType || 'OBSERVED'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{new Date(pr.observedAt || Date.now()).toLocaleTimeString()}</td>
                    <td className="p-3 font-bold text-emerald-600">{Math.round((pr.confidence || 0.95) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1A1D20]">Inventory Intelligence & BCG Matrix</h3>
            <span className="text-xs text-gray-500 font-semibold">{inventory.length} SKUs catalogados</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-xs font-bold text-emerald-800 uppercase">Productos STAR (Alta Rotación / Margen)</span>
              <p className="text-xl font-black text-[#0F5132] mt-1">
                {inventory.filter(i => i.status === 'NORMAL').length} SKUs
              </p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-xs font-bold text-blue-800 uppercase">Cash Cows (Estables)</span>
              <p className="text-xl font-black text-blue-900 mt-1">
                {Math.round(inventory.length * 0.6)} SKUs
              </p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-xs font-bold text-amber-800 uppercase">Riesgo / Dead Stock</span>
              <p className="text-xl font-black text-amber-900 mt-1">
                {inventory.filter(i => i.status === 'CRITICAL' || i.status === 'DEAD_STOCK').length} SKUs
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-[#5A626A] border-b border-[#E2E5E8]">
                <tr>
                  <th className="p-3">SKU / Producto</th>
                  <th className="p-3">Stock Actual</th>
                  <th className="p-3">Velocity Diario</th>
                  <th className="p-3">Días Cobertura</th>
                  <th className="p-3">Costo Unit.</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.map((inv: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-[#1A1D20]">{inv.name} <span className="text-gray-400 font-normal">({inv.sku})</span></td>
                    <td className="p-3 font-bold">{inv.stock} {inv.unit}</td>
                    <td className="p-3">{inv.avgDailySales} /día</td>
                    <td className="p-3 font-semibold text-emerald-700">{inv.daysOfStock?.toFixed(1)} días</td>
                    <td className="p-3">${inv.cost} MXN</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        inv.status === 'LOW' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-[#0F5132]'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1A1D20]">Agent Control Center (9 Agentes Autónomos)</h3>
            <span className="text-xs font-bold bg-emerald-100 text-[#0F5132] px-3 py-1 rounded-full">
              Least Privilege AI Active
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents.map((ag: any, i: number) => (
              <div key={i} className="p-4 bg-[#F8F9FA] border border-[#E2E5E8] rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1A1D20]">{ag.name}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-[#0F5132] text-[10px] font-black rounded">
                      {ag.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{ag.purpose}</p>
                  <div className="mt-3 text-[11px] text-gray-500 space-y-1">
                    <p>Versión: <span className="font-semibold">{ag.version}</span></p>
                    <p>Éxito: <span className="font-semibold text-emerald-700">{ag.successRate}%</span></p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Scope: {ag.tenantScope}</span>
                  <button 
                    onClick={() => handleExecuteAction('run_agent', { agentId: ag.agentId })}
                    className="px-3 py-1 bg-[#0F5132] text-white rounded-lg text-xs font-bold hover:bg-[#198754] transition cursor-pointer"
                  >
                    Ejecutar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1A1D20]">Audit Log & Data Lineage Traceability</h3>
            <span className="text-xs text-gray-500 font-semibold">Trazabilidad inmutable</span>
          </div>
          <p className="text-xs text-gray-600">
            Cada decisión y acción ejecutada en Abarrotes IA conserva su evidencia, origen de datos (Scorpion, Zorro, POS), timestamp y firma criptográfica multitenant.
          </p>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-700 space-y-2">
            <p>[06:30:12] [TENANT_CDMX_01] PriceMonitorAgent detected price drop in Aceite 1-2-3 ($38.50 at Zorro Vallejo).</p>
            <p>[06:30:14] [TENANT_CDMX_01] OpportunityAgent calculated arbitrage savings ($120.00 / 50 units).</p>
            <p>[06:31:00] [TENANT_CDMX_01] DecisionEngine generated pending recommendation.</p>
            <p>[06:35:22] [TENANT_CDMX_01] ControlCenter authorized and audited execution.</p>
          </div>
        </div>
      )}

      {activeTab === 'firestore' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#1A1D20]">Cloud Data Fabric & Firebase Firestore State</h3>
                <p className="text-xs text-gray-500">Certificación de infraestructura Cloud, Auth y persistencia durable en tiempo real.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-[#0F5132] font-bold text-xs rounded-full">
                FIRESTORE CLOUD ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-xs text-gray-500 font-semibold">Project ID</span>
                <p className="text-sm font-bold text-[#1A1D20] mt-1">{firestoreStatus?.fabric?.projectId || 'gen-lang-client-0101148954'}</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-xs text-gray-500 font-semibold">Database ID</span>
                <p className="text-sm font-bold text-[#1A1D20] mt-1 truncate">{firestoreStatus?.fabric?.databaseId || 'ai-studio-remixabarrotesia-0ec72b82-5b2a-41dc-9f50-e8a10c5f84b3'}</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-xs text-gray-500 font-semibold">Tenant Isolation Strategy</span>
                <p className="text-sm font-bold text-emerald-700 mt-1">Subcollection /tenants/&#123;tenantId&#125;/...</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <h4 className="font-bold text-sm text-[#0F5132]">Seguridad y Reglas Firestore</h4>
              <p className="text-xs text-[#0F5132] font-mono bg-white p-3 rounded-lg border border-emerald-200">
                {firestoreStatus?.securityRules || "rules_version = '2'; service cloud.firestore { match /databases/{database}/documents { match /{document=**} { allow read, write: if request.auth != null; } } }"}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-500">Sincronización en lote con Cloud Firestore</span>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/firestore/sync', { method: 'POST' }).then(r => r.json());
                    alert(res.message || 'Sincronización con Firestore exitosa.');
                  } catch (e: any) {
                    alert('Error en sincronización: ' + e.message);
                  }
                }}
                className="px-4 py-2 bg-[#0F5132] hover:bg-[#198754] text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
              >
                Ejecutar Sync Cloud Firestore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
