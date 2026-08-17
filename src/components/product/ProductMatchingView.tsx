import React, { useState } from 'react';
import { 
  GitMerge, 
  Search, 
  Check, 
  X, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Database, 
  Layers, 
  CheckCircle2, 
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { ProductMatchItem, DataQualityReport } from '../../types';

interface ProductMatchingViewProps {
  matchQueue: ProductMatchItem[];
  qualityReports: DataQualityReport[];
  onApproveMatch: (matchId: string) => void;
  onRejectMatch: (matchId: string) => void;
  onResolveQualityIssue: (issueId: string) => void;
}

export const ProductMatchingView: React.FC<ProductMatchingViewProps> = ({
  matchQueue,
  qualityReports,
  onApproveMatch,
  onRejectMatch,
  onResolveQualityIssue,
}) => {
  const [activeTab, setActiveTab] = useState<'matching' | 'quality'>('matching');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const filteredMatches = matchQueue.filter((m) => {
    if (filterStatus === 'all') return true;
    return m.status === filterStatus;
  });

  const pendingMatchesCount = matchQueue.filter((m) => m.status === 'pending').length;
  const pendingIssuesCount = qualityReports.filter((q) => q.status === 'pending').length;

  const handleApprove = (id: string) => {
    onApproveMatch(id);
    setFeedbackMsg('¡Coincidencia aprobada e incorporada al Catálogo Maestro!');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleReject = (id: string) => {
    onRejectMatch(id);
    setFeedbackMsg('Coincidencia rechazada. No se contaminará el catálogo.');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20] tracking-tight">
            Product Matching & Calidad de Datos
          </h1>
          <p className="text-xs sm:text-sm text-[#5A626A]">
            Resolución de identidades canónicas entre textos desestructurados de mayoristas y validación de integridad.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#F8F9FA] p-1 rounded-2xl border border-[#E2E5E8]">
          <button
            onClick={() => setActiveTab('matching')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'matching'
                ? 'bg-[#0F5132] text-white shadow-2xs'
                : 'text-[#5A626A] hover:text-[#1A1D20]'
            }`}
          >
            Cola de Matching ({pendingMatchesCount})
          </button>

          <button
            onClick={() => setActiveTab('quality')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'quality'
                ? 'bg-[#0F5132] text-white shadow-2xs'
                : 'text-[#5A626A] hover:text-[#1A1D20]'
            }`}
          >
            Guardián de Calidad ({pendingIssuesCount})
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-[#0D6832] font-bold text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#198754] shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* SUB-TAB 1: MATCHING QUEUE */}
      {activeTab === 'matching' && (
        <div className="space-y-4">
          
          {/* Filter Status Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5A626A]">Mostrar:</span>
            {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-[#0F5132] text-white shadow-2xs'
                    : 'bg-white border border-[#E2E5E8] text-[#5A626A] hover:bg-[#F8F9FA]'
                }`}
              >
                {st === 'pending' ? `Pendientes (${pendingMatchesCount})` : st === 'approved' ? 'Aprobadas' : st === 'rejected' ? 'Rechazadas' : 'Todas'}
              </button>
            ))}
          </div>

          {/* Matches Grid */}
          <div className="space-y-3">
            {filteredMatches.map((item) => {
              const isApproved = item.status === 'approved';
              const isRejected = item.status === 'rejected';
              const isPending = item.status === 'pending';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-2xs transition-all space-y-4 ${
                    isPending
                      ? 'border-amber-300 bg-amber-50/10'
                      : isApproved
                      ? 'border-emerald-200 bg-white'
                      : 'border-red-200 bg-gray-50/50 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E5E8]">
                    <div className="flex items-center gap-2">
                      <GitMerge className="w-4 h-4 text-[#0F5132]" />
                      <span className="text-xs font-bold uppercase tracking-wide text-[#5A626A]">
                        Fuente: {item.sourceOrigin}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#5A626A]">Nivel de confianza:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        item.confidenceScore >= 95
                          ? 'bg-emerald-100 text-[#0D6832]'
                          : item.confidenceScore >= 70
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.confidenceScore}% Coincidencia
                      </span>
                    </div>
                  </div>

                  {/* Comparison columns: Raw Source vs Canonical Target */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    {/* Left: Raw text from Scraper/Note */}
                    <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E2E5E8] space-y-1">
                      <div className="text-[10px] uppercase font-bold text-[#5A626A]">
                        Texto sin procesar recibido del mayorista
                      </div>
                      <div className="text-sm font-black text-[#1A1D20] font-mono">
                        "{item.sourceText}"
                      </div>
                      <div className="text-[11px] text-[#5A626A] pt-1">
                        Detectado: <strong>{item.detectedBrand}</strong> • <strong>{item.detectedVolume}</strong>
                      </div>
                    </div>

                    {/* Right: Candidate in Product Master */}
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-[#0D6832]">
                        Producto Canónico Sugerido en Maestro
                      </div>
                      <div className="text-sm font-black text-[#0D6832]">
                        {item.candidateName}
                      </div>
                      <div className="text-[11px] text-[#5A626A] pt-1">
                        Marca: <strong>{item.candidateBrand}</strong> • Presentación: <strong>{item.candidatePresentation}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Signals pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs font-bold text-[#5A626A] mr-1">Señales IA:</span>
                    {item.signals.map((sig, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#F1F3F5] text-[#1A1D20] text-[11px] font-semibold"
                      >
                        ✓ {sig}
                      </span>
                    ))}
                  </div>

                  {/* Action buttons if pending */}
                  {isPending && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E5E8]">
                      <button
                        onClick={() => handleReject(item.id)}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        <span>Rechazar (Distinto)</span>
                      </button>

                      <button
                        onClick={() => handleApprove(item.id)}
                        className="px-4 py-2 rounded-xl bg-[#0F5132] hover:bg-[#198754] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Aprobar Coincidencia</span>
                      </button>
                    </div>
                  )}

                  {isApproved && (
                    <div className="text-xs font-bold text-[#0D6832] flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Emparejamiento Aprobado y Activo en Catálogo</span>
                    </div>
                  )}

                  {isRejected && (
                    <div className="text-xs font-bold text-red-700 flex items-center gap-1.5 pt-1">
                      <X className="w-4 h-4" />
                      <span>Emparejamiento Rechazado (Tratado como producto independiente)</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* SUB-TAB 2: DATA QUALITY REPORTS */}
      {activeTab === 'quality' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-[#E2E5E8] p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-[#1A1D20]">
                Auditoría Automática de Calidad de Datos
              </h3>
              <p className="text-xs text-[#5A626A]">
                El Agente 08 analiza continuamente la base de datos para prevenir anomalías de precio, márgenes negativos y duplicados.
              </p>
            </div>

            <div className="space-y-3">
              {qualityReports.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    report.status === 'resolved'
                      ? 'bg-gray-50 border-[#E2E5E8] opacity-75'
                      : 'bg-amber-50/70 border-amber-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-bold text-sm text-[#1A1D20]">{report.title}</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[10px] font-black uppercase">
                        {report.severity}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A626A]">{report.description}</p>
                    <div className="text-xs font-semibold text-[#0D6832]">
                      Sugerencia: {report.suggestedFix}
                    </div>
                  </div>

                  {report.status === 'pending' ? (
                    <button
                      onClick={() => onResolveQualityIssue(report.id)}
                      className="px-3.5 py-2 rounded-xl bg-[#0F5132] hover:bg-[#198754] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs shrink-0"
                    >
                      Aplicar Corrección
                    </button>
                  ) : (
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 text-[#0D6832] text-xs font-bold shrink-0">
                      Resuelto
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
