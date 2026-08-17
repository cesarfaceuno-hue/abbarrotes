import React, { useState } from 'react';
import {
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  Plus,
  Send,
  Calendar,
  MessageSquare,
  FileText,
  UserCheck,
  ShieldCheck,
  Zap,
  ExternalLink,
  Store,
  ChevronRight
} from 'lucide-react';
import {
  CrmCustomer,
  CrmContact,
  CrmDealOpportunity,
  CrmActivity,
  CrmTask,
  Customer360View
} from '../../../types';

interface Customer360DrawerProps {
  data: Customer360View;
  onClose: () => void;
  onRefresh: () => void;
  onAddActivity: (act: Partial<CrmActivity>) => Promise<void>;
  onAddTask: (task: Partial<CrmTask>) => Promise<void>;
  onAddContact: (contact: Partial<CrmContact>) => Promise<void>;
  onUpdateTaskStatus: (taskId: string, status: string) => Promise<void>;
}

export const Customer360Drawer: React.FC<Customer360DrawerProps> = ({
  data,
  onClose,
  onRefresh,
  onAddActivity,
  onAddTask,
  onAddContact,
  onUpdateTaskStatus
}) => {
  const { customer, contacts, opportunities, activities, tasks, aiInsights, recentPurchases, inventoryHealth, auditLogs } = data;
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CONTACTS' | 'DEALS' | 'ACTIVITIES' | 'TASKS' | 'AUDIT'>('OVERVIEW');

  // Form states
  const [newNote, setNewNote] = useState('');
  const [activityType, setActivityType] = useState<'LLAMADA' | 'VISITA' | 'WHATSAPP' | 'NOTA'>('WHATSAPP');
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  // New task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'ALTA' | 'MEDIA' | 'CRITICA'>('MEDIA');

  // New contact form
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('GERENTE');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSubmittingActivity(true);
    try {
      await onAddActivity({
        customerId: customer.id,
        tenantId: customer.tenantId,
        type: activityType,
        title: `${activityType}: ${newNote.slice(0, 40)}...`,
        description: newNote,
        performedBy: 'Operador Back Office'
      });
      setNewNote('');
      onRefresh();
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await onAddTask({
      customerId: customer.id,
      tenantId: customer.tenantId,
      customerName: customer.name,
      title: taskTitle,
      priority: taskPriority,
      status: 'PENDIENTE',
      dueDate: new Date(Date.now() + 86400000).toISOString()
    });
    setTaskTitle('');
    setShowTaskForm(false);
    onRefresh();
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) return;
    await onAddContact({
      customerId: customer.id,
      tenantId: customer.tenantId,
      name: contactName,
      role: contactRole as any,
      phone: contactPhone,
      email: contactEmail,
      status: 'ACTIVO'
    });
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setShowContactForm(false);
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-4xl bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col h-full overflow-hidden text-slate-100 animate-in slide-in-from-right duration-200">
        
        {/* TOP HEADER */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Store className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {customer.name}
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                    customer.status === 'ACTIVO' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    customer.status === 'EN_RIESGO' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {customer.status}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full">
                    {customer.segment}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{customer.businessName}</span>
                  <span>•</span>
                  <span>Tenant: <code className="text-slate-300">{customer.tenantId}</code></span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-500" /> {customer.city} ({customer.zone})</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION SUB-TABS */}
        <div className="px-6 border-b border-slate-800 bg-slate-900/90 flex gap-2 overflow-x-auto text-sm">
          {[
            { id: 'OVERVIEW', label: 'Visión 360° & KPIs' },
            { id: 'CONTACTS', label: `Contactos (${contacts.length})` },
            { id: 'DEALS', label: `Oportunidades (${opportunities.length})` },
            { id: 'ACTIVITIES', label: `Timeline & Notas (${activities.length})` },
            { id: 'TASKS', label: `Tareas (${tasks.length})` },
            { id: 'AUDIT', label: 'Auditoría & Transacciones' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* DRAWER CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* AI INSIGHTS ALERT BOX */}
              {aiInsights.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                      <Zap className="w-4 h-4" /> Inteligencia Comercial Autónoma
                    </span>
                    <span className="text-xs text-amber-300 font-mono">Confianza 94%</span>
                  </div>
                  {aiInsights.map((ins) => (
                    <div key={ins.id} className="text-xs text-slate-300 space-y-1 bg-slate-950/40 p-3 rounded-lg border border-amber-500/20">
                      <p className="font-semibold text-amber-200">{ins.title}</p>
                      <p>{ins.description}</p>
                      <p className="text-emerald-400 font-medium">Acción recomendada: {ins.suggestedAction}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* COMMERCIAL PERFORMANCE METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Ventas Mensuales</span>
                  <p className="text-lg font-bold text-emerald-400">
                    ${customer.monthlySales.toLocaleString()} MXN
                  </p>
                  <span className="text-[11px] text-slate-500">Ticket prom: ${customer.avgTicket}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Margen Bruto</span>
                  <p className="text-lg font-bold text-indigo-400">
                    {customer.grossMarginPercent}%
                  </p>
                  <span className="text-[11px] text-emerald-400 font-medium">Meta: 24.0% (+2.5%)</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Riesgo de Churn</span>
                  <p className={`text-lg font-bold ${
                    customer.churnRiskScore > 40 ? 'text-rose-400' : customer.churnRiskScore > 20 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {customer.churnRiskScore}%
                  </p>
                  <span className="text-[11px] text-slate-500">Última compra hace {customer.daysSinceLastPurchase}d</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Valor Estimado (LTV)</span>
                  <p className="text-lg font-bold text-purple-400">
                    ${customer.estimatedLTV.toLocaleString()} MXN
                  </p>
                  <span className="text-[11px] text-slate-500">Proyección a 12 meses</span>
                </div>
              </div>

              {/* STORE BRAIN INVENTORY HEALTH INTEGRATION */}
              <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-400" />
                    Salud del Inventario & Stock Monitor (Store Brain)
                  </h3>
                  <span className="text-xs text-slate-400">Tenant Sync Activo</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">SKUs Monitoreados</span>
                    <p className="text-base font-bold text-white mt-1">{inventoryHealth.totalSkus}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">SKUs Críticos / Riesgo</span>
                    <p className="text-base font-bold text-rose-400 mt-1">{inventoryHealth.criticalSkus}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Valor de Inventario</span>
                    <p className="text-base font-bold text-emerald-400 mt-1">${Math.round(inventoryHealth.stockValue).toLocaleString()} MXN</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Días de Cobertura</span>
                    <p className="text-base font-bold text-cyan-400 mt-1">{inventoryHealth.daysOfInventory} días</p>
                  </div>
                </div>
              </div>

              {/* QUICK INFO & DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-semibold text-slate-200">Datos Generales & Contacto</h4>
                  <div className="space-y-2 text-slate-300">
                    <p><strong className="text-slate-400">Dirección:</strong> {customer.address}</p>
                    <p><strong className="text-slate-400">Teléfono:</strong> {customer.phone || 'No registrado'}</p>
                    <p><strong className="text-slate-400">Email:</strong> {customer.email || 'No registrado'}</p>
                    <p><strong className="text-slate-400">Ejecutivo Asignado:</strong> {customer.assignedTo}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-semibold text-slate-200">Etiquetas & Segmentación</h4>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-400 mt-2">
                    <strong className="text-slate-300">Notas de Cuenta:</strong> {customer.notes || 'Sin notas adicionales.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CONTACTS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200">Directorio de Contactos de la Tienda</h3>
                <button
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Contacto
                </button>
              </div>

              {showContactForm && (
                <form onSubmit={handleCreateContact} className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400">Nuevo Contacto</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <input
                      type="text"
                      placeholder="Nombre Completo"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="p-2 rounded bg-slate-900 border border-slate-700 text-white"
                      required
                    />
                    <select
                      value={contactRole}
                      onChange={(e) => setContactRole(e.target.value)}
                      className="p-2 rounded bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="PROPIETARIO">PROPIETARIO</option>
                      <option value="ENCARGADO">ENCARGADO</option>
                      <option value="GERENTE">GERENTE</option>
                      <option value="COMPRAS">COMPRAS</option>
                      <option value="PAGOS">PAGOS</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="Teléfono / WhatsApp"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="p-2 rounded bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded bg-emerald-600 font-semibold text-white"
                    >
                      Guardar Contacto
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {contacts.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{c.name}</span>
                        {c.isPrimary && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                            PRINCIPAL
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded">
                          {c.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-4">
                        {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-400" /> {c.phone}</span>}
                        {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-indigo-400" /> {c.email}</span>}
                        <span>{c.preferences}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {c.phone && (
                        <a
                          href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'DEALS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200">Pipeline de Ventas y Oportunidades</h3>
                <span className="text-xs text-slate-400">Total: {opportunities.length} acuerdos</span>
              </div>

              <div className="space-y-3">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{opp.title}</h4>
                      <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        opp.stage === 'GANADO' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        opp.stage === 'NEGOCIACION' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {opp.stage}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">Valor Pipeline:</span>
                        <p className="font-bold text-emerald-400">${opp.value.toLocaleString()} MXN</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Ahorro Estimado:</span>
                        <p className="font-bold text-cyan-400">${opp.estimatedSavings.toLocaleString()} MXN</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Probabilidad:</span>
                        <p className="font-bold text-indigo-400">{opp.probability}%</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Siguiente Acción:</span>
                        <p className="font-medium text-slate-300">{opp.nextAction}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ACTIVITIES' && (
            <div className="space-y-6">
              {/* ACTIVITY LOG FORM */}
              <form onSubmit={handleCreateActivity} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Registrar Nueva Interacción / Nota</span>
                  <div className="flex gap-1.5">
                    {(['WHATSAPP', 'LLAMADA', 'VISITA', 'NOTA'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setActivityType(t)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          activityType === t
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={2}
                  placeholder={`Escribe detalles de la ${activityType.toLowerCase()} con el cliente...`}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingActivity || !newNote.trim()}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Registrar Interacción
                  </button>
                </div>
              </form>

              {/* TIMELINE */}
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
                {activities.map((act) => (
                  <div key={act.id} className="relative flex items-start gap-4 pl-8">
                    <span className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-500" />
                    <div className="flex-1 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 flex items-center gap-2">
                          <span className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-emerald-400 rounded font-mono">
                            {act.type}
                          </span>
                          {act.title}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-300">{act.description}</p>
                      <span className="text-[10px] text-slate-500 block pt-1">
                        Por: {act.performedBy}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'TASKS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200">Tareas Operativas y Seguimientos</h3>
                <button
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva Tarea
                </button>
              </div>

              {showTaskForm && (
                <form onSubmit={handleCreateTask} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <input
                    type="text"
                    placeholder="Título de la tarea..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Prioridad:</span>
                      <select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value as any)}
                        className="p-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                      >
                        <option value="CRITICA">CRÍTICA</option>
                        <option value="ALTA">ALTA</option>
                        <option value="MEDIA">MEDIA</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowTaskForm(false)}
                        className="px-3 py-1 rounded bg-slate-800 text-slate-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded bg-emerald-600 text-white font-semibold"
                      >
                        Crear Tarea
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      task.status === 'COMPLETADA'
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === 'COMPLETADA'}
                        onChange={(e) =>
                          onUpdateTaskStatus(task.id, e.target.checked ? 'COMPLETADA' : 'PENDIENTE')
                        }
                        className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <p className={`font-semibold ${task.status === 'COMPLETADA' ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                          {task.title}
                        </p>
                        <span className="text-[11px] text-slate-500">
                          Asignado a: {task.assignedTo} • Vence: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.priority === 'CRITICA' ? 'bg-rose-500/20 text-rose-300' :
                      task.priority === 'ALTA' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Trazabilidad & Eventos de Auditoría de Cuenta</h3>
              <div className="space-y-2">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-500">No hay registros de auditoría recientes para este tenant.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-emerald-400">{log.action}</span>
                        <span className="text-slate-500 text-[11px]">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-300">{log.reason}</p>
                      <span className="text-[10px] text-slate-500 block">Actor: {log.actor} • Evidencia: {log.sourceEvidence}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-500">Abarrotes IA CRM 360 Core</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Cerrar Ficha 360°
          </button>
        </div>
      </div>
    </div>
  );
};
