import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Zap,
  Filter
} from 'lucide-react';
import { CrmDealOpportunity, CrmCustomer } from '../../../types';

interface PipelineKanbanViewProps {
  opportunities: CrmDealOpportunity[];
  customers: CrmCustomer[];
  onUpdateStage: (oppId: string, newStage: string) => Promise<void>;
  onCreateOpportunity: (opp: Partial<CrmDealOpportunity>) => Promise<void>;
  onSelectCustomer: (customerId: string) => void;
}

const STAGES = [
  { id: 'NUEVO', label: 'Nuevo / Prospecto', color: 'border-slate-700 bg-slate-900/50' },
  { id: 'CONTACTADO', label: 'Contactado', color: 'border-blue-500/30 bg-blue-500/5' },
  { id: 'PROPUESTA_ENVIADA', label: 'Propuesta Enviada', color: 'border-amber-500/30 bg-amber-500/5' },
  { id: 'NEGOCIACION', label: 'En Negociación', color: 'border-purple-500/30 bg-purple-500/5' },
  { id: 'GANADO', label: 'Cerrado Ganado', color: 'border-emerald-500/30 bg-emerald-500/5' },
  { id: 'PERDIDO', label: 'Perdido', color: 'border-rose-500/30 bg-rose-500/5' },
];

export const PipelineKanbanView: React.FC<PipelineKanbanViewProps> = ({
  opportunities,
  customers,
  onUpdateStage,
  onCreateOpportunity,
  onSelectCustomer
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [title, setTitle] = useState('');
  const [value, setValue] = useState(15000);
  const [savings, setSavings] = useState(3000);
  const [stage, setStage] = useState('NUEVO');
  const [nextAction, setNextAction] = useState('Presentar propuesta de ahorro mayorista');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const cust = customers.find(c => c.id === selectedCustomerId);
    await onCreateOpportunity({
      customerId: selectedCustomerId,
      tenantId: cust?.tenantId,
      customerName: cust?.name || 'Cliente',
      title,
      value: Number(value),
      estimatedSavings: Number(savings),
      stage: stage as any,
      probability: stage === 'GANADO' ? 100 : stage === 'NEGOCIACION' ? 75 : 50,
      nextAction,
      source: 'MANUAL_OPERATOR'
    });
    setTitle('');
    setShowModal(false);
  };

  const totalPipelineValue = opportunities
    .filter(o => o.stage !== 'PERDIDO')
    .reduce((acc, o) => acc + o.value, 0);

  const totalPipelineSavings = opportunities
    .filter(o => o.stage !== 'PERDIDO')
    .reduce((acc, o) => acc + o.estimatedSavings, 0);

  return (
    <div className="space-y-6">
      {/* SUMMARY HEADER */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-slate-400">Total en Pipeline</span>
            <p className="text-xl font-bold text-emerald-400">
              ${totalPipelineValue.toLocaleString()} MXN
            </p>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-xs text-slate-400">Ahorro Proyectado Clientes</span>
            <p className="text-xl font-bold text-cyan-400">
              ${totalPipelineSavings.toLocaleString()} MXN
            </p>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-xs text-slate-400">Oportunidades Activas</span>
            <p className="text-xl font-bold text-white">
              {opportunities.filter(o => o.stage !== 'PERDIDO' && o.stage !== 'GANADO').length}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/30"
        >
          <Plus className="w-4 h-4" /> Nueva Oportunidad
        </button>
      </div>

      {/* KANBAN BOARD COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start">
        {STAGES.map((col) => {
          const colOpps = opportunities.filter((o) => o.stage === col.id);
          const colTotal = colOpps.reduce((acc, o) => acc + o.value, 0);

          return (
            <div
              key={col.id}
              className={`p-3 rounded-xl border ${col.color} flex flex-col min-h-[500px] space-y-3`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">{col.label}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
                  {colOpps.length}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                ${colTotal.toLocaleString()} MXN
              </span>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colOpps.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2 group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <button
                        onClick={() => onSelectCustomer(opp.customerId)}
                        className="text-left font-bold text-xs text-white hover:text-emerald-400 transition-colors line-clamp-1"
                      >
                        {opp.customerName}
                      </button>
                      <span className="text-[10px] font-mono text-indigo-400 font-semibold">
                        {opp.probability}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">{opp.title}</p>

                    <div className="pt-1 border-t border-slate-900 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-400">
                        ${opp.value.toLocaleString()}
                      </span>
                      {opp.estimatedSavings > 0 && (
                        <span className="text-cyan-400 text-[10px]">
                          - ${opp.estimatedSavings.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {opp.nextAction && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="line-clamp-1">{opp.nextAction}</span>
                      </p>
                    )}

                    {/* STAGE CONTROLS */}
                    <div className="pt-2 flex items-center justify-between gap-1 text-[10px]">
                      <select
                        value={opp.stage}
                        onChange={(e) => onUpdateStage(opp.id, e.target.value)}
                        className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px] w-full focus:outline-none focus:border-emerald-500"
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE OPPORTUNITY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" /> Nueva Oportunidad Comercial
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Cliente / Tienda</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.zone}) - {c.tenantId}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Título de la Oportunidad</label>
                <input
                  type="text"
                  placeholder="Ej: Centralización de compras Aceite y Abarrotes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Valor de Compra (MXN)</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Ahorro Estimado (MXN)</label>
                  <input
                    type="number"
                    value={savings}
                    onChange={(e) => setSavings(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Etapa Inicial</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Próxima Acción de Seguimiento</label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-900/30"
                >
                  Guardar Oportunidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
