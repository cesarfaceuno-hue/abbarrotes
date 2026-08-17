import React from 'react';
import { Check, ShieldCheck, ArrowRight, Sparkles, Clock, Calendar } from 'lucide-react';

interface TrialSectionProps {
  onOpenTrialModal: () => void;
}

export const TrialSection: React.FC<TrialSectionProps> = ({ onOpenTrialModal }) => {
  const trialPoints = [
    'Descubre oportunidades reales de ahorro en tu zona.',
    'Analiza tus productos de mayor volumen.',
    'Entiende tu inventario y rotación diaria.',
    'Compara opciones y promociones de proveedores.',
    'Mide el valor económico que genera en tu caja.',
  ];

  return (
    <section className="py-16 md:py-24 bg-[#F8F9FA] border-b border-[#E2E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#E2E5E8] shadow-sm p-8 sm:p-12 lg:p-14 relative overflow-hidden">
          
          {/* Subtle background flair */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="text-center space-y-4 max-w-2xl mx-auto mb-10 relative z-10">
            <span className="px-3.5 py-1.5 rounded-full bg-[#E8F5E9] text-[#0D6832] text-xs font-bold uppercase tracking-wider border border-[#C8E6C9]">
              Acto 06 — 30 Días de Prueba
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A1D20] tracking-tight">
              Pruébalo con tu propia tienda.
            </h2>

            <p className="text-base sm:text-lg text-[#5A626A] leading-relaxed">
              Durante 30 días puedes conocer el sistema, analizar tu operación y descubrir si realmente encuentras oportunidades que valen la pena.
            </p>
          </div>

          {/* 5 Bullet Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl mx-auto mb-10 relative z-10">
            {trialPoints.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8] text-xs sm:text-sm font-semibold text-[#1A1D20]"
              >
                <div className="w-5 h-5 rounded-full bg-[#0F5132] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Call to Action Button */}
          <div className="text-center space-y-3 relative z-10">
            <button
              onClick={onOpenTrialModal}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#0F5132] text-white text-base font-extrabold hover:bg-[#0D6832] transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
            >
              <span>Probar gratis 30 días</span>
              <ArrowRight className="w-5 h-5 text-emerald-300" />
            </button>

            <p className="text-xs text-[#5A626A] font-semibold">
              Comprueba primero. Decide después. Sin contratos ni compromisos forzosos.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
