import React, { useState, useEffect } from 'react';
import {
  Users,
  Store,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Phone,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Building2,
  Zap,
  MapPin,
  Clock,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  CrmCustomer,
  CrmContact,
  CrmDealOpportunity,
  CrmActivity,
  CrmTask,
  CrmSupplierPartner,
  CrmAiInsight,
  Customer360View
} from '../../../types';
import { CrmOverviewCards } from './CrmOverviewCards';
import { Customer360Drawer } from './Customer360Drawer';
import { PipelineKanbanView } from './PipelineKanbanView';
import { CrmTasksActivitiesView } from './CrmTasksActivitiesView';
import { CrmSuppliersPartnersView } from './CrmSuppliersPartnersView';

export const CrmModuleView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'CUSTOMERS' | 'PIPELINE' | 'TASKS' | 'SUPPLIERS' | 'AI_INSIGHTS'>('CUSTOMERS');
  
  // Data states
  const [overview, setOverview] = useState<any>({
    totalCustomers: 0,
    activeCustomers: 0,
    atRiskCustomers: 0,
    prospectCustomers: 0,
    pipelineValue: 0,
    totalEstimatedSavings: 0,
    opportunitiesCount: 0,
    pendingTasks: 0,
    todayTasks: 0,
    aiInsightsCount: 0,
    criticalInsightsCount: 0,
    activeSuppliersCount: 0,
    avgCustomerSales: 0,
    avgGrossMargin: 0,
  });

  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [opportunities, setOpportunities] = useState<CrmDealOpportunity[]>([]);
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [suppliers, setSuppliers] = useState<CrmSupplierPartner[]>([]);
  const [aiInsights, setAiInsights] = useState<CrmAiInsight[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [segmentFilter, setSegmentFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Customer 360 drawer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customer360Data, setCustomer360Data] = useState<Customer360View | null>(null);
  const [isLoading360, setIsLoading360] = useState(false);

  // New Customer Modal
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustBusiness, setNewCustBusiness] = useState('');
  const [newCustType, setNewCustType] = useState('TIENDA_ABARROTES');
  const [newCustSegment, setNewCustSegment] = useState('TIER_B');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustZone, setNewCustZone] = useState('CENTRO');
  const [newCustSales, setNewCustSales] = useState(45000);

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/crm/overview');
      const data = await res.json();
      if (data.success) {
        setOverview(data.overview);
      }
    } catch (err) {
      console.error('Error fetching CRM overview:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (segmentFilter !== 'ALL') params.append('segment', segmentFilter);
      if (zoneFilter !== 'ALL') params.append('zone', zoneFilter);

      const res = await fetch(`/api/crm/customers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const res = await fetch('/api/crm/opportunities');
      const data = await res.json();
      if (data.success) setOpportunities(data.opportunities);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/crm/tasks');
      const data = await res.json();
      if (data.success) setTasks(data.tasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/crm/activities');
      const data = await res.json();
      if (data.success) setActivities(data.activities);
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/crm/suppliers');
      const data = await res.json();
      if (data.success) setSuppliers(data.suppliers);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const fetchAiInsights = async () => {
    try {
      const res = await fetch('/api/crm/ai-insights');
      const data = await res.json();
      if (data.success) setAiInsights(data.insights);
    } catch (err) {
      console.error('Error fetching insights:', err);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchOverview(),
      fetchCustomers(),
      fetchOpportunities(),
      fetchTasks(),
      fetchActivities(),
      fetchSuppliers(),
      fetchAiInsights(),
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [searchQuery, statusFilter, segmentFilter, zoneFilter]);

  // Load customer 360
  const openCustomer360 = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsLoading360(true);
    try {
      const res = await fetch(`/api/crm/customers/${customerId}/360`);
      const data = await res.json();
      if (data.success) {
        setCustomer360Data(data.data);
      }
    } catch (err) {
      console.error('Error loading customer 360:', err);
    } finally {
      setIsLoading360(false);
    }
  };

  // Mutations
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    try {
      const res = await fetch('/api/crm/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustName,
          businessName: newCustBusiness || newCustName,
          type: newCustType,
          segment: newCustSegment,
          phone: newCustPhone,
          email: newCustEmail,
          address: newCustAddress,
          zone: newCustZone,
          monthlySales: Number(newCustSales),
          status: 'PROSPECTO'
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowNewCustomerModal(false);
        setNewCustName('');
        setNewCustPhone('');
        setNewCustEmail('');
        setNewCustAddress('');
        fetchAllData();
      }
    } catch (err) {
      console.error('Error creating customer:', err);
    }
  };

  const handleUpdateOpportunityStage = async (oppId: string, newStage: string) => {
    try {
      const res = await fetch(`/api/crm/opportunities/${oppId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
      const data = await res.json();
      if (data.success) {
        fetchOpportunities();
        fetchOverview();
      }
    } catch (err) {
      console.error('Error updating opportunity stage:', err);
    }
  };

  const handleCreateOpportunity = async (opp: Partial<CrmDealOpportunity>) => {
    try {
      const res = await fetch('/api/crm/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opp)
      });
      const data = await res.json();
      if (data.success) {
        fetchOpportunities();
        fetchOverview();
      }
    } catch (err) {
      console.error('Error creating opportunity:', err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch(`/api/crm/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        fetchTasks();
        fetchOverview();
        if (selectedCustomerId) {
          openCustomer360(selectedCustomerId);
        }
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleCreateTask = async (task: Partial<CrmTask>) => {
    try {
      const res = await fetch('/api/crm/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      const data = await res.json();
      if (data.success) {
        fetchTasks();
        fetchOverview();
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleCreateActivity = async (activity: Partial<CrmActivity>) => {
    try {
      const res = await fetch('/api/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity)
      });
      const data = await res.json();
      if (data.success) {
        fetchActivities();
      }
    } catch (err) {
      console.error('Error creating activity:', err);
    }
  };

  const handleAddContact = async (contact: Partial<CrmContact>) => {
    try {
      const res = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      });
      const data = await res.json();
      if (data.success && selectedCustomerId) {
        openCustomer360(selectedCustomerId);
      }
    } catch (err) {
      console.error('Error adding contact:', err);
    }
  };

  const handleCreateSupplier = async (supp: Partial<CrmSupplierPartner>) => {
    try {
      const res = await fetch('/api/crm/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supp)
      });
      const data = await res.json();
      if (data.success) {
        fetchSuppliers();
        fetchOverview();
      }
    } catch (err) {
      console.error('Error creating supplier:', err);
    }
  };

  const handleApplyAiInsight = async (insightId: string) => {
    try {
      const res = await fetch(`/api/crm/ai-insights/${insightId}/apply`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      }
    } catch (err) {
      console.error('Error applying insight:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                CRM & Customer 360 Core
                <span className="px-2.5 py-0.5 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Fase 1 Operativa
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Gestión unificada de tenderos, comercios, contactos, pipeline mayorista y tareas operativas
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={fetchAllData}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Sincronizar CRM"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={() => setShowNewCustomerModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30 w-full md:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /> Registrar Cliente / Tienda
          </button>
        </div>
      </div>

      {/* OVERVIEW METRICS CARDS */}
      <CrmOverviewCards overview={overview} />

      {/* NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-slate-800 overflow-x-auto pb-1 gap-2">
        <div className="flex gap-2">
          {[
            { id: 'CUSTOMERS', label: `👥 Clientes / Tiendas (${customers.length})` },
            { id: 'PIPELINE', label: `💼 Pipeline (${opportunities.length})` },
            { id: 'TASKS', label: `⚡ Tareas & Timeline (${tasks.length})` },
            { id: 'SUPPLIERS', label: `🏢 Proveedores (${suppliers.length})` },
            { id: 'AI_INSIGHTS', label: `🧠 IA Insights (${aiInsights.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`py-3 px-4 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: CUSTOMERS TABLE & DIRECTORY */}
      {activeSubTab === 'CUSTOMERS' && (
        <div className="space-y-4">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, tienda, teléfono, email, zona o etiqueta..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-300"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="ACTIVO">Activos</option>
                <option value="PROSPECTO">Prospectos</option>
                <option value="EN_RIESGO">En Riesgo</option>
                <option value="INACTIVO">Inactivos</option>
              </select>

              <select
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value)}
                className="p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-300"
              >
                <option value="ALL">Todos los Segmentos</option>
                <option value="TIER_A">Tier A (Alto Valor)</option>
                <option value="TIER_B">Tier B (Medio)</option>
                <option value="TIER_C">Tier C (Estándar)</option>
              </select>

              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-300"
              >
                <option value="ALL">Todas las Zonas</option>
                <option value="CENTRO">CDMX Centro</option>
                <option value="SUR">CDMX Sur</option>
                <option value="ORIENTE">CDMX Oriente</option>
                <option value="NORTE">CDMX Norte</option>
                <option value="PONIENTE">CDMX Poniente</option>
              </select>
            </div>
          </div>

          {/* CUSTOMERS DIRECTORY TABLE */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Cliente / Comercio</th>
                    <th className="p-4">Contacto & WhatsApp</th>
                    <th className="p-4">Zona / Ubicación</th>
                    <th className="p-4">Segmento & Estado</th>
                    <th className="p-4">Ventas & Margen</th>
                    <th className="p-4">Salud & Churn Risk</th>
                    <th className="p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No se encontraron comercios con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => openCustomer360(c.id)}
                      >
                        <td className="p-4">
                          <div className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                            <Store className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{c.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{c.businessName}</p>
                          <span className="text-[10px] font-mono text-slate-500">ID: {c.tenantId}</span>
                        </td>

                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-1">
                            {c.phone ? (
                              <a
                                href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium border border-emerald-500/30 transition-colors"
                              >
                                <MessageSquare className="w-3 h-3" /> {c.phone}
                              </a>
                            ) : (
                              <span className="text-slate-500 text-xs">Sin teléfono</span>
                            )}
                            {c.email && (
                              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                {c.email}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-medium text-slate-200">{c.city}</span>
                          <span className="text-[11px] text-slate-400 block">{c.zone}</span>
                          <span className="text-[10px] text-slate-500 line-clamp-1">{c.address}</span>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              c.status === 'ACTIVO' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                              c.status === 'EN_RIESGO' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                              'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}>
                              {c.status}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-indigo-300 font-mono">
                              {c.segment}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-emerald-400 text-sm">
                            ${c.monthlySales.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-indigo-400 block font-medium">
                            Margen: {c.grossMarginPercent}%
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400">Riesgo:</span>
                              <span className={`font-bold ${
                                c.churnRiskScore > 40 ? 'text-rose-400' : c.churnRiskScore > 20 ? 'text-amber-400' : 'text-emerald-400'
                              }`}>
                                {c.churnRiskScore}%
                              </span>
                            </div>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${c.churnRiskScore > 40 ? 'bg-rose-500' : c.churnRiskScore > 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${c.churnRiskScore}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 block">
                              Últ. compra hace {c.daysSinceLastPurchase}d
                            </span>
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => openCustomer360(c.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1 ml-auto transition-colors"
                          >
                            <span>Ficha 360°</span>
                            <ChevronRight className="w-3.5 h-3.5" />
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

      {/* TAB 2: PIPELINE KANBAN */}
      {activeSubTab === 'PIPELINE' && (
        <PipelineKanbanView
          opportunities={opportunities}
          customers={customers}
          onUpdateStage={handleUpdateOpportunityStage}
          onCreateOpportunity={handleCreateOpportunity}
          onSelectCustomer={openCustomer360}
        />
      )}

      {/* TAB 3: TASKS & ACTIVITIES */}
      {activeSubTab === 'TASKS' && (
        <CrmTasksActivitiesView
          tasks={tasks}
          activities={activities}
          customers={customers}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onCreateTask={handleCreateTask}
          onCreateActivity={handleCreateActivity}
          onSelectCustomer={openCustomer360}
        />
      )}

      {/* TAB 4: WHOLESALE SUPPLIERS */}
      {activeSubTab === 'SUPPLIERS' && (
        <CrmSuppliersPartnersView
          suppliers={suppliers}
          onCreateSupplier={handleCreateSupplier}
        />
      )}

      {/* TAB 5: AI INSIGHTS */}
      {activeSubTab === 'AI_INSIGHTS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Inteligencia Comercial Autónoma & Recomendaciones de Cuenta
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Modelos de inferencia para detección de churn, optimización de márgenes y ventas cruzadas
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map((ins) => (
              <div
                key={ins.id}
                className="p-5 rounded-xl bg-slate-950 border border-amber-500/30 hover:border-amber-500/50 transition-all space-y-3 shadow-md relative"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {ins.type}
                    </span>
                    <h4 className="font-bold text-white text-sm mt-1">{ins.title}</h4>
                    <p className="text-xs text-slate-400">{ins.customerName} ({ins.tenantId})</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ins.severity === 'CRITICO' ? 'bg-rose-500/20 text-rose-300' :
                    ins.severity === 'ALERTA' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {ins.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-300">{ins.description}</p>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
                  <span className="text-slate-400 font-medium">Acción Operativa Sugerida:</span>
                  <p className="text-emerald-400 font-bold">{ins.suggestedAction}</p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Impacto: ${ins.estimatedImpact.toLocaleString()} MXN • Confianza: {Math.round(ins.confidence * 100)}%
                  </span>
                  <button
                    onClick={() => handleApplyAiInsight(ins.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-900/30"
                  >
                    <Check className="w-3.5 h-3.5" /> Aplicar Acción
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOMER 360 DRAWER */}
      {selectedCustomerId && customer360Data && (
        <Customer360Drawer
          data={customer360Data}
          onClose={() => {
            setSelectedCustomerId(null);
            setCustomer360Data(null);
          }}
          onRefresh={() => openCustomer360(selectedCustomerId)}
          onAddActivity={handleCreateActivity}
          onAddTask={handleCreateTask}
          onAddContact={handleAddContact}
          onUpdateTaskStatus={handleUpdateTaskStatus}
        />
      )}

      {/* REGISTER NEW CUSTOMER MODAL */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-400" /> Registrar Nuevo Comercio / Tienda
            </h3>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Nombre Comercial de la Tienda</label>
                  <input
                    type="text"
                    placeholder="Ej: Abarrotes San Judas"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Razón Social / Propietario</label>
                  <input
                    type="text"
                    placeholder="Ej: Abarrotes San Judas S.A."
                    value={newCustBusiness}
                    onChange={(e) => setNewCustBusiness(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Segmento</label>
                  <select
                    value={newCustSegment}
                    onChange={(e) => setNewCustSegment(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="TIER_A">TIER A (Alto Volumen)</option>
                    <option value="TIER_B">TIER B (Medio)</option>
                    <option value="TIER_C">TIER C (Estándar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Zona CDMX</label>
                  <select
                    value={newCustZone}
                    onChange={(e) => setNewCustZone(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="CENTRO">CDMX Centro</option>
                    <option value="SUR">CDMX Sur</option>
                    <option value="ORIENTE">CDMX Oriente</option>
                    <option value="NORTE">CDMX Norte</option>
                    <option value="PONIENTE">CDMX Poniente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="55-8888-9999"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="tienda@abarrotes.mx"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Dirección Completa</label>
                <input
                  type="text"
                  placeholder="Calle, Número, Colonia, Alcaldía..."
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ventas Mensuales Estimadas (MXN)</label>
                <input
                  type="number"
                  value={newCustSales}
                  onChange={(e) => setNewCustSales(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-900/30"
                >
                  Registrar Comercio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
