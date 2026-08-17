import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, ShoppingBag, HelpCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { MOCK_DAILY_OPPORTUNITIES } from '../data/landingData';

export const DailyOpportunitiesSection: React.FC = () => {
  const [expandedWhy, setExpandedWhy] = useState<number | null>(1);

  const toggleWhy = (id: number) => {
    setExpandedWhy(expandedWhy === id ? null : id);
  };

  return (
    <section className="py-16 md:py-24 bg-[#F8F9FA] border-b border-[#E2E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="px-3.5 py-1.5 rounded-full bg-[#E8F5E9] text-[#0D6832] text-xs font-bold uppercase tracking-wider border border-[#C8E6C9]">
            Acto 04 — Reporte Matutino en 30 Segundos
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1D20] tracking-tight">
            Toma decisiones en 30 segundos cada mañana.
          </h2>
          <p className="text-base sm:text-lg text-[#5A626A] leading-relaxed">
            Sin gráficas interminables ni paneles de control complicados. Cada mañana recibes las oportunidades concretas con la explicación exacta de <strong>por qué</strong> te conviene actuar.
          </p>
        </div>

        {/* Mock Daily Dashboard Interface */}
        <div className="bg-white rounded-3xl border border-[#E2E5E8] shadow-sm p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto space-y-6">
          
          {/* Dashboard Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E5E8] pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#0F5132] text-white flex items-center justify-center font-extrabold text-lg shadow-xs">
                P
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#1A1D20]">
                  Buenos días, Pedro 👋
                </h3>
                <p className="text-xs sm:text-sm text-[#5A626A]">
                  Abarrotes La Lupita • Listo antes de abrir la cortina hoy
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-[#0D6832] border border-emerald-200 text-xs font-bold self-start sm:self-auto">
              <Sparkles className="w-4 h-4 text-[#198754]" />
              <span>Encontramos 3 oportunidades para hoy</span>
            </div>
          </div>

          {/* 3 Structured Opportunity Cards */}
          <div className="space-y-4">
            {MOCK_DAILY_OPPORTUNITIES.map((item) => {
              const isWhyOpen = expandedWhy === item.id;
              return (
                <div
                  key={item.id}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                    item.status === 'Comprar'
                      ? 'bg-[#F8F9FA] border-[#E2E5E8] hover:border-emerald-300'
                      : 'bg-amber-50/40 border-amber-200'
                  }`}
                >
                  {/* Top Product Summary Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base sm:text-lg font-extrabold text-[#1A1D20]">
                        {item.product}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-md font-bold ${
                          item.status === 'Comprar'
                            ? 'bg-[#E8F5E9] text-[#0D6832] border border-[#C8E6C9]'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                      <span className="text-xs text-[#5A626A] font-medium">
                        • {item.rotation}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-lg self-start sm:self-auto ${
                        item.status === 'Comprar'
                          ? 'bg-[#0F5132] text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      Acción: {item.status}
                    </span>
                  </div>

                  {/* Concise Summary Line */}
                  <p className="text-xs sm:text-sm text-[#1A1D20] font-medium mb-3">
                    {item.what} — <strong className="text-[#0F5132]">{item.recommendation}</strong>
                  </p>

                  {/* Interactive "¿Por qué?" Trust Button */}
                  <div className="pt-1">
                    <button
                      onClick={() => toggleWhy(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2E5E8] text-xs font-bold text-[#0F5132] hover:border-[#0F5132] transition-colors cursor-pointer shadow-2xs"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-[#198754]" />
                      <span>{isWhyOpen ? 'Ocultar desglose de decisión' : '¿Por qué recomendamos esto?'}</span>
                      {isWhyOpen ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                    </button>
                  </div>

                  {/* 3-Step Trust Architecture: Qué encontraste -> Por qué -> Qué recomendamos */}
                  {isWhyOpen && (
                    <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-white border border-emerald-200 text-xs text-[#1A1D20] space-y-3 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F5132] border-b border-emerald-100 pb-2">
                        <ShieldCheck className="w-4 h-4 text-[#198754]" />
                        <span>Transparencia total de la decisión:</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                        
                        {/* 1. Qué encontramos */}
                        <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A626A] block mb-1">
                            1. Qué encontramos
                          </span>
                          <p className="text-xs font-medium text-[#1A1D20] leading-relaxed">
                            {item.whyBreakdown.found}
                          </p>
                        </div>

                        {/* 2. Tu realidad de venta */}
                        <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A626A] block mb-1">
                            2. Tu realidad de inventario
                          </span>
                          <p className="text-xs font-medium text-[#1A1D20] leading-relaxed">
                            {item.whyBreakdown.context}
                          </p>
                        </div>

                        {/* 3. Qué recomendamos */}
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0F5132]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D6832] block mb-1">
                            3. Qué recomendamos
                          </span>
                          <p className="text-xs font-bold text-[#0F5132] leading-relaxed">
                            {item.whyBreakdown.recommendation}
                          </p>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="pt-2 text-center text-xs text-[#5A626A]">
            <span>💡 Transparencia total: La IA te muestra sus fuentes y lógica para que siempre tengas el control de tu dinero.</span>
          </div>

        </div>

      </div>
    </section>
  );
};
