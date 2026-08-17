import React, { useState } from 'react';
import { Clock, DollarSign, TrendingUp, Info, ShieldAlert } from 'lucide-react';

export const RoiSimulationSection: React.FC = () => {
  const [units, setUnits] = useState(200);
  const costPerUnit = 15.0;
  const salePricePerUnit = 18.0;
  const dailySaleRate = 25;

  const totalInvestment = units * costPerUnit;
  const totalRevenue = units * salePricePerUnit;
  const estimatedMargin = totalRevenue - totalInvestment;
  const estimatedDays = (units / dailySaleRate).toFixed(1);

  return (
    <section className="py-16 md:py-24 bg-white border-b border-[#E2E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#0D6832] text-xs font-bold uppercase tracking-wider border border-[#C8E6C9]">
            Retorno de Inversión y Capital
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1A1D20] tracking-tight">
            Compra con más información.{' '}
            <span className="text-[#0F5132]">No a ciegas.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#5A626A] leading-relaxed">
            Antes de soltar $3,000 o $5,000 pesos en mercancía, conoce cuántos días tardarás aproximadamente en recuperar tu dinero en caja y cuánto margen te dejará.
          </p>
        </div>

        {/* Interactive Simulation Dashboard Card */}
        <div className="bg-[#F8F9FA] rounded-3xl border border-[#E2E5E8] p-6 sm:p-10 lg:p-12 max-w-4xl mx-auto shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E5E8] pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F5132]">
                Simulador de Compra y Retorno
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1A1D20] mt-0.5">
                Refresco Cola (Lote de Resurtido)
              </h3>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#E2E5E8]">
              <span className="text-xs text-[#5A626A] font-medium">Venta histórica:</span>
              <span className="text-sm font-bold text-[#1A1D20] tabular-nums">25 pzas / día</span>
            </div>
          </div>

          {/* Metric breakdown grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
            
            {/* Box 1 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E5E8]">
              <span className="text-xs font-medium text-[#5A626A] block">Volumen de compra</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20] tabular-nums mt-1 block">
                {units}
                <span className="text-xs font-medium text-[#5A626A] ml-1">unidades</span>
              </span>
              <span className="text-[11px] text-[#5A626A] block mt-1">
                @ ${costPerUnit.toFixed(2)} por pieza
              </span>
            </div>

            {/* Box 2 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E5E8]">
              <span className="text-xs font-medium text-[#5A626A] block">Inversión requerida</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20] tabular-nums mt-1 block">
                ${totalInvestment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-[#5A626A] block mt-1">Capital en efectivo</span>
            </div>

            {/* Box 3 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E5E8]">
              <span className="text-xs font-medium text-[#0D6832] font-semibold block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Tiempo estimado
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0D6832] tabular-nums mt-1 block">
                ~{estimatedDays} días
              </span>
              <span className="text-[11px] text-[#0D6832] font-medium block mt-1">
                Para recuperar el dinero
              </span>
            </div>

            {/* Box 4 */}
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-[#0F5132] block flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Ganancia bruta
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0D6832] tabular-nums mt-1 block">
                +${estimatedMargin.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-[#0F5132] font-medium block mt-1">
                Margen proyectado
              </span>
            </div>

          </div>

          {/* Decision Verdict Box */}
          <div className="p-4 rounded-2xl bg-white border border-[#E2E5E8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#0D6832] flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <span className="text-sm font-bold text-[#1A1D20] block">
                  Diagnóstico Abarrotes IA: Excelente oportunidad de compra
                </span>
                <span className="text-xs text-[#5A626A]">
                  Rotación sana, no estrangula tu liquidez y recuperas la inversión en una semana.
                </span>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-[#0F5132] text-white text-xs font-bold shrink-0 text-center">
              Recomendación: Aprobada
            </span>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="mt-6 pt-4 border-t border-[#E2E5E8] flex items-start gap-2 text-xs text-[#5A626A]">
            <Info className="w-4 h-4 text-[#5A626A] shrink-0 mt-0.5" />
            <p>
              <strong>Aviso legal:</strong> Las estimaciones dependen de los datos históricos, precios de venta al público, demanda y condiciones reales del negocio. No representan una promesa ni garantía de ganancias fijas.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
