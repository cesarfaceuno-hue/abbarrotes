import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  History, 
  Check, 
  X, 
  Filter, 
  ArrowRight, 
  User, 
  Layers, 
  Info,
  Calendar
} from 'lucide-react';
import { SmartAlert, AuditLogEntry, AlertPriorityLevel } from '../../types';

interface AlertsAuditViewProps {
  alerts: SmartAlert[];
  auditLogs: AuditLogEntry[];
  onDismissAlert: (alertId: string) => void;
  onResolveAlert: (alertId: string) => void;
  initialTab?: 'alerts' | 'audit';
}

export const AlertsAuditView: React.FC<AlertsAuditViewProps> = ({
  alerts,
  auditLogs,
  onDismissAlert,
  onResolveAlert,
  initialTab = 'alerts',
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'audit'>(initialTab);
  const [selectedLevel, setSelectedLevel] = useState<string>('Todos');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const levels = ['Todos', 'CRÍTICO', 'ALTO', 'MEDIO', 'INFORMATIVO'];

  const filteredAlerts = alerts.filter((a) => {
    if (selectedLevel === 'Todos') return true;
    return a.level === selectedLevel;
  });

  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20] tracking-tight">
            Alertas Operativas & Auditoría Inmutable
          </h1>
          <p className="text-xs sm:text-sm text-[#5A626A]">
            Notificaciones clasificadas por severidad y bitácora completa de decisiones tomadas en el negocio.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#F8F9FA] p-1 rounded-2xl border border-[#E2E5E8]">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-[#0F5132] text-white shadow-2xs'
                : 'text-[#5A626A] hover:text-[#1A1D20]'
            }`}
          >
            Alertas Inteligentes ({activeAlertsCount})
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-[#0F5132] text-white shadow-2xs'
                : 'text-[#5A626A] hover:text-[#1A1D20]'
            }`}
          >
            Bitácora de Auditoría ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          
          {/* Level Filter Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5A626A]">Severidad:</span>
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-[#0F5132] text-white shadow-2xs'
                    : 'bg-white border border-[#E2E5E8] text-[#5A626A] hover:bg-[#F8F9FA]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Alerts Grid */}
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const isResolved = alert.status === 'resolved';

              return (
                <div
                  key={alert.id}
                  className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-2xs transition-all space-y-3 ${
                    alert.level === 'CRÍTICO'
                      ? 'border-red-300 bg-red-50/20'
                      : alert.level === 'ALTO'
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-[#E2E5E8]'
                  } ${isResolved ? 'opacity-60 bg-gray-50' : ''}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E2E5E8]">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        alert.level === 'CRÍTICO'
                          ? 'bg-red-600 text-white'
                          : alert.level === 'ALTO'
                          ? 'bg-amber-500 text-white'
                          : alert.level === 'MEDIO'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}>
                        {alert.level}
                      </span>
                      <span className="text-xs font-bold text-[#5A626A]">
                        {alert.category}
                      </span>
                    </div>

                    <span className="text-xs text-[#5A626A]">{alert.timestamp}</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-[#1A1D20]">
                      {alert.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A626A] leading-relaxed">
                      {alert.message}
                    </p>
                  </div>

                  {alert.actionLabel && !isResolved && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E5E8]">
                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#5A626A] hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        Descartar
                      </button>

                      <button
                        onClick={() => onResolveAlert(alert.id)}
                        className="px-4 py-2 rounded-xl bg-[#0F5132] hover:bg-[#198754] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        {alert.actionLabel}
                      </button>
                    </div>
                  )}

                  {isResolved && (
                    <div className="text-xs font-bold text-[#0D6832] flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Alerta Atendida</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* SUB-TAB 2: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-[#E2E5E8] p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-[#1A1D20]">
                Historial Inmutable de Acciones y Decisiones
              </h3>
              <p className="text-xs text-[#5A626A]">
                Registro cronológico detallado de intervenciones de usuarios y agentes de IA.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F8F9FA] border-b border-[#E2E5E8] text-[10px] font-black uppercase text-[#5A626A]">
                  <tr>
                    <th className="py-3 px-4">Fecha & Hora</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Acción / Módulo</th>
                    <th className="py-3 px-4">Detalle / Justificación</th>
                    <th className="py-3 px-4 text-right">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5E8]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-3.5 px-4 text-[#5A626A] text-xs whitespace-nowrap">
                        {log.timestamp} • {log.date}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-[#1A1D20]">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#0F5132]" />
                          <span>{log.actor}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-[#F1F3F5] text-[#1A1D20] font-bold text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#5A626A]">
                        {log.detail}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs font-semibold text-[#0D6832]">
                        {log.result}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
