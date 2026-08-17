import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { CtaSphere3DCanvas } from './3d/CtaSphere3DCanvas';

interface FinalCtaSectionProps {
  onOpenTrialModal: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ onOpenTrialModal }) => {
  return (
    <section className="py-24 md:py-40 bg-[#05070A] text-white relative overflow-hidden border-t border-white/5">
      
      {/* Background 3D Visual */}
      <div className="absolute inset-0 z-0 opacity-40">
        <CtaSphere3DCanvas />
      </div>

      {/* Atmospheric Depth Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fase de Despliegue v3.0</span>
        </div>

        {/* Headlines */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1] text-white">
            Inicializa tu <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Operación Autónoma.
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-400 leading-relaxed font-medium max-w-2xl mx-auto">
            Integra el núcleo de inteligencia a tu tienda y transforma compras reactivas en adquisiciones matemáticas en menos de 48 horas.
          </p>
        </div>

        {/* CTA Button Group */}
        <div className="space-y-6 pt-6">
          <button
            onClick={onOpenTrialModal}
            className="group relative inline-flex items-center justify-center gap-4 px-12 py-6 rounded-2xl bg-emerald-500 text-slate-950 text-base font-black uppercase tracking-widest hover:bg-emerald-400 transition-all cursor-pointer shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:shadow-[0_30px_70px_rgba(16,185,129,0.5)] active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10">Desplegar Instancia Piloto</span>
            <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-[10px] sm:text-xs text-slate-500 font-black uppercase tracking-[0.1em] max-w-md mx-auto">
            Acceso bonificado durante el primer ciclo (30 días). Arquitectura zero-config sin compromisos de permanencia.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="pt-12 flex flex-wrap items-center justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Encriptación End-to-End</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Uptime 99.9% SLI</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Respaldo Multi-Región</span>
          </div>
        </div>

      </div>
    </section>
  );
};

