import React from 'react';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface PricingSectionProps {
  onOpenTrialModal: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenTrialModal }) => {
  return (
    <section id="pricing" className="scroll-mt-20 relative py-24 md:py-32 bg-[#07090E] border-b border-slate-800/80 overflow-hidden">
      {/* Background Subtle Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3 py-1 rounded-full bg-slate-900/80 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20 backdrop-blur-sm">
            Estructura de Costos
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Escalabilidad Financiera.
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Diseñado para generar un ROI positivo desde la primera semana de uso mediante la optimización de compras y mermas.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto bg-slate-900/60 rounded-3xl border border-emerald-500/30 p-8 sm:p-10 shadow-[0_0_40px_rgba(16,185,129,0.1)] relative backdrop-blur-md">
          
          {/* Top Pill */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-sm">
            Módulo Operativo Full
          </div>

          <div className="text-center space-y-3 pt-2">
            <h3 className="text-xl font-bold text-white">
              Licencia Single-Node
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Despliegue completo del motor de inventario, red de proveedores y analítica POS.
            </p>

            <div className="pt-4 pb-2">
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-5xl sm:text-6xl font-extrabold text-white tabular-nums tracking-tight">
                  $199*
                </span>
                <span className="text-base font-semibold text-slate-400">
                  MXN / mes
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Primeros 30 días 100% bonificados</span>
              </div>
            </div>
          </div>

          {/* Features Included */}
          <div className="space-y-4 my-8 pt-6 border-t border-slate-800 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-800">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Motor de rotación volumétrica 3D</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-800">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Acceso a red nodal de proveedores CDMX</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-800">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Telemetría de ventas y demanda predictiva</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-800">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Terminal de Punto de Venta (POS) ultrarrápida</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-800">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Sincronización en la nube multi-dispositivo</span>
            </div>
          </div>

          {/* CTA inside pricing */}
          <button
            onClick={onOpenTrialModal}
            className="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Desplegar Instancia</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-[11px] text-center text-slate-500 mt-4 leading-relaxed">
            * Tarifa base de infraestructura técnica sujeta a disponibilidad de nodos. Cancelación sin fricción en cualquier ciclo.
          </p>

        </div>

      </div>
    </section>
  );
};
