import React from 'react';
import { DollarSign, TrendingUp, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Layers, BarChart3, Boxes } from 'lucide-react';

export const EconomicValueSection: React.FC = () => {
  return (
    <section id="valor-economico" className="py-16 md:py-24 bg-white border-b border-[#E2E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3.5 py-1.5 rounded-full bg-[#E8F5E9] text-[#0D6832] text-xs font-bold uppercase tracking-wider border border-[#C8E6C9]">
            Acto 05 — Ecuación de Rentabilidad Real
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1D20] tracking-tight">
            Que el servicio genere más valor del que cuesta.
          </h2>
          <p className="text-base sm:text-lg text-[#5A626A] leading-relaxed">
            No medimos el éxito por funciones técnicas, sino por el valor medible que dejamos en tu caja cada mes. Si la plataforma no te ayuda a ahorrar o ganar más de lo que cuesta, no tiene sentido usarla.
          </p>
        </div>

        {/* Dynamic Metric Dashboard View */}
        <div className="max-w-4xl mx-auto bg-[#F8F9FA] rounded-3xl border border-[#E2E5E8] shadow-sm p-6 sm:p-10">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E5E8] pb-5 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A626A] block">
                Métrica Central del Producto
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#1A1D20]">
                “Este mes encontramos para ti...”
              </h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-50 text-[#0D6832] border border-emerald-200 text-xs font-bold self-start sm:self-auto">
              Resumen de Valor Mensual
            </div>
          </div>

          {/* 3 Pillars of Real Value */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch mb-8">
            
            {/* Pillar 1: Oportunidades detectadas */}
            <div className="bg-white rounded-2xl border border-[#E2E5E8] p-5 space-y-2 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D6832] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#5A626A] uppercase tracking-wider block">
                Oportunidades
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20] tabular-nums">
                28 alertas
              </div>
              <p className="text-xs text-[#5A626A] leading-relaxed">
                Precios más bajos, preventas analizadas y promociones desglosadas.
              </p>
            </div>

            {/* Pillar 2: Ahorro potencial */}
            <div className="bg-white rounded-2xl border border-[#E2E5E8] p-5 space-y-2 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D6832] flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#5A626A] uppercase tracking-wider block">
                Ahorro Potencial
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0D6832] tabular-nums">
                $1,247 <span className="text-xs text-[#5A626A] font-normal">MXN</span>
              </div>
              <p className="text-xs text-[#5A626A] leading-relaxed">
                Diferencial neto calculado en compras clave de refresco, lácteos y abarrotes.
              </p>
            </div>

            {/* Pillar 3: Inventario optimizado */}
            <div className="bg-white rounded-2xl border border-[#E2E5E8] p-5 space-y-2 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D6832] flex items-center justify-center font-bold">
                <Boxes className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#5A626A] uppercase tracking-wider block">
                Inventario Protegido
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20] tabular-nums">
                $2,400+ <span className="text-xs text-[#5A626A] font-normal">liberados</span>
              </div>
              <p className="text-xs text-[#5A626A] leading-relaxed">
                Capital no congelado al frenar compras de productos con rotación lenta.
              </p>
            </div>

          </div>

          {/* Net Return Bottom Banner */}
          <div className="bg-emerald-50/90 rounded-2xl border-2 border-emerald-300 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#0D6832]">
                Conclusión de Valor Neto
              </span>
              <h4 className="text-lg sm:text-xl font-black text-[#0F5132]">
                Abarrotes IA genera más valor del que cuesta la suscripción fija ($199/mes).
              </h4>
              <p className="text-xs text-[#0F5132]/80">
                La plataforma rinde cuentas de forma transparente con tus propios números de venta.
              </p>
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <span className="text-xs font-bold text-[#0D6832] block">Valor neto mensual</span>
              <span className="text-2xl sm:text-3xl font-black text-[#0F5132] tabular-nums">
                +$1,048 MXN
              </span>
            </div>
          </div>

          <p className="text-[11px] text-center text-[#5A626A] mt-4 italic">
            * Cifras de referencia para ilustrar el modelo de valor. Cada tienda ve reflejado su ahorro real conforme registra sus compras y ventas.
          </p>

        </div>

      </div>
    </section>
  );
};
