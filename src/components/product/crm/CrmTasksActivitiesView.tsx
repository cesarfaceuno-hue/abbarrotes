import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  MessageSquare,
  Phone,
  Building2,
  Calendar,
  Send,
  Filter,
  Check
} from 'lucide-react';
import { CrmTask, CrmActivity, CrmCustomer } from '../../../types';

interface CrmTasksActivitiesViewProps {
  tasks: CrmTask[];
  activities: CrmActivity[];
  customers: CrmCustomer[];
  onUpdateTaskStatus: (taskId: string, status: string) => Promise<void>;
  onCreateTask: (task: Partial<CrmTask>) => Promise<void>;
  onCreateActivity: (activity: Partial<CrmActivity>) => Promise<void>;
  onSelectCustomer: (customerId: string) => void;
}

export const CrmTasksActivitiesView: React.FC<CrmTasksActivitiesViewProps> = ({
  tasks,
  activities,
  customers,
  onUpdateTaskStatus,
  onCreateTask,
  onCreateActivity,
  onSelectCustomer
}) => {
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'HOY' | 'PENDIENTE' | 'COMPLETADA'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICA' | 'ALTA' | 'MEDIA'>('ALL');
  const [activityFilter, setActivityFilter] = useState<string>('ALL');

  // New task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCustomerId, setTaskCustomerId] = useState(customers[0]?.id || '');
  const [taskPriority, setTaskPriority] = useState<'CRITICA' | 'ALTA' | 'MEDIA'>('MEDIA');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);

  // New activity modal
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [actCustomerId, setActCustomerId] = useState(customers[0]?.id || '');
  const [actType, setActType] = useState<'WHATSAPP' | 'LLAMADA' | 'VISITA' | 'NOTA'>('WHATSAPP');
  const [actNote, setActNote] = useState('');

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const cust = customers.find(c => c.id === taskCustomerId);
    await onCreateTask({
      customerId: taskCustomerId,
      tenantId: cust?.tenantId,
      customerName: cust?.name,
      title: taskTitle,
      priority: taskPriority,
      status: 'PENDIENTE',
      dueDate: new Date(taskDueDate).toISOString()
    });
    setTaskTitle('');
    setShowTaskModal(false);
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actNote.trim()) return;
    const cust = customers.find(c => c.id === actCustomerId);
    await onCreateActivity({
      customerId: actCustomerId,
      tenantId: cust?.tenantId,
      type: actType,
      title: `${actType}: ${actNote.slice(0, 35)}...`,
      description: actNote,
      performedBy: 'Operador Back Office'
    });
    setActNote('');
    setShowActivityModal(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter !== 'ALL' && t.status !== taskFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    return true;
  });

  const filteredActivities = activities.filter((a) => {
    if (activityFilter !== 'ALL' && a.type !== activityFilter) return false;
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* TASKS COLUMN */}
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Tareas Operativas de Seguimiento
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {tasks.filter(t => t.status !== 'COMPLETADA').length} tareas pendientes en el equipo
            </p>
          </div>
          <button
            onClick={() => setShowTaskModal(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Nueva Tarea
          </button>
        </div>

        {/* TASK FILTERS */}
        <div className="flex flex-wrap gap-2 text-xs">
          {(['ALL', 'HOY', 'PENDIENTE', 'COMPLETADA'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTaskFilter(f)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                taskFilter === f
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f === 'ALL' ? 'Todas' : f}
            </button>
          ))}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs"
          >
            <option value="ALL">Todas las prioridades</option>
            <option value="CRITICA">Crítica</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
          </select>
        </div>

        {/* TASKS LIST */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                t.status === 'COMPLETADA'
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={t.status === 'COMPLETADA'}
                  onChange={(e) =>
                    onUpdateTaskStatus(t.id, e.target.checked ? 'COMPLETADA' : 'PENDIENTE')
                  }
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <div>
                  <p className={`font-semibold ${t.status === 'COMPLETADA' ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                    {t.title}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <button
                      onClick={() => onSelectCustomer(t.customerId)}
                      className="text-emerald-400 hover:underline font-medium"
                    >
                      {t.customerName}
                    </button>
                    <span>•</span>
                    <span>Asignado: {t.assignedTo}</span>
                    <span>•</span>
                    <span>Vence: {new Date(t.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                t.priority === 'CRITICA' ? 'bg-rose-500/20 text-rose-300' :
                t.priority === 'ALTA' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {t.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVITIES COLUMN */}
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" /> Registro de Actividades & Timeline
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Trazabilidad de interacciones y notas comerciales en vivo
            </p>
          </div>
          <button
            onClick={() => setShowActivityModal(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Registrar Interacción
          </button>
        </div>

        {/* ACTIVITY FILTERS */}
        <div className="flex flex-wrap gap-2 text-xs">
          {['ALL', 'WHATSAPP', 'LLAMADA', 'VISITA', 'NOTA'].map((f) => (
            <button
              key={f}
              onClick={() => setActivityFilter(f)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                activityFilter === f
                  ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f === 'ALL' ? 'Todas' : f}
            </button>
          ))}
        </div>

        {/* ACTIVITIES LIST */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredActivities.map((act) => (
            <div key={act.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <span className="px-1.5 py-0.5 text-[10px] bg-slate-900 text-indigo-400 rounded font-mono border border-indigo-500/30">
                    {act.type}
                  </span>
                  <button
                    onClick={() => onSelectCustomer(act.customerId)}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {act.title}
                  </button>
                </span>
                <span className="text-[11px] text-slate-500">
                  {new Date(act.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-slate-300">{act.description}</p>
              <span className="text-[10px] text-slate-500 block pt-1">
                Registrado por: {act.performedBy}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Nueva Tarea de Seguimiento
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Cliente / Tienda</label>
                <select
                  value={taskCustomerId}
                  onChange={(e) => setTaskCustomerId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.zone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Descripción de la Tarea</label>
                <input
                  type="text"
                  placeholder="Ej: Llamar a Don Pepe para confirmar entrega mayorista..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Prioridad</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="CRITICA">CRÍTICA</option>
                    <option value="ALTA">ALTA</option>
                    <option value="MEDIA">MEDIA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ACTIVITY MODAL */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" /> Registrar Interacción Comercial
            </h3>

            <form onSubmit={handleCreateActivity} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Cliente / Tienda</label>
                <select
                  value={actCustomerId}
                  onChange={(e) => setActCustomerId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.zone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Canal de Interacción</label>
                <select
                  value={actType}
                  onChange={(e) => setActType(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="WHATSAPP">WHATSAPP</option>
                  <option value="LLAMADA">LLAMADA TELEFÓNICA</option>
                  <option value="VISITA">VISITA EN TIENDA</option>
                  <option value="NOTA">NOTA INTERNA</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Resumen de la Conversación / Resultado</label>
                <textarea
                  rows={3}
                  placeholder="Detalles acordados con el cliente..."
                  value={actNote}
                  onChange={(e) => setActNote(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold"
                >
                  Registrar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
