import React, { useState } from 'react';
import { Calculator, XCircle, CheckCircle2, ArrowRight, Sparkles, AlertTriangle, ShieldCheck, Tag, Percent } from 'lucide-react';

export const PromotionsSection: React.FC = () => {
  const [selectedPromoFormat, setSelectedPromoFormat] = useState<number>(0);

  const promoFormats = [
    {
      type: '2 por $40 (Combo cerrado)',
      advertised: '2 por $40.00 en folleto',
      trueUnitCost: '$20.00 / pza',
      alternativeCost: '$18.50 / pza suelta',
      verdict: 'Mala compra: Pagas $1.50 más por pieza y compras el doble de lo necesario.',
      status: 'Oferta falsa',
      isWarning: true,
    },
    {
      type: '3x2 en galletas',
      advertised: 'Lleva 3 y paga 2 ($60 total)',
      trueUnitCost: '$20.00 / paquete',
      alternativeCost: '$19.00 en caja regular',
      verdict: 'Aparente ahorro, pero requiere inmovilizar dinero en 3 cajas completas.',
      status: 'Evaluar rotación',
      isWarning: true,
    },
    {
      type: 'Segunda pieza al 50%',
      advertised: '1ra $30, 2da a $15 ($45 el par)',
      trueUnitCost: '$22.50 / pza',
      alternativeCost: '$21.00 en abarrotera mayorista',
      verdict: 'El mayorista local sigue siendo más barato sin forzarte a comprar pares.',
      status: 'Mayorista gana',
      isWarning: true,
    },
    {
      type: '15% de descuento por bulto',
      advertised: 'Bulto con 20 pzas a $33.50 c/u',
      trueUnitCost: '$33.50 (vs $38.00)',
      alternativeCost: 'Requiere $670 de inversión',
      verdict: 'Excelente costo unitario, pero si vendes 1 al mes, congelarás $670 por casi un año.',
      status: 'Riesgo de liquidez',
      isWarning: true,
    },
  ];

  const currentPromo = promoFormats[selectedPromoFormat];

  return (
    <section className="py-16 md:py-24 bg-[#F8F9FA] border-b border-[#E2E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-200">
            Acto 03 — Claridad Matemática
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1D20] tracking-tight">
            No todas las promociones son una buena compra.
          </h2>
          <p className="text-base sm:text-lg text-[#5A626A] leading-relaxed">
            2x1, 3x2, 4 por $100, segunda al 50%, bonificaciones o paquetes mixtos. Abarrotes IA no te dice simplemente si hay oferta: calcula el <strong>costo real por unidad</strong> y el <strong>costo efectivo según la cantidad que realmente necesita tu tienda</strong>.
          </p>
        </div>

        {/* Promo Comparison Visual Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch mb-12">
          
          {/* Promo A: The Trap */}
          <div className="bg-white rounded-3xl border border-[#E2E5E8] p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 border border-red-200">
                  <XCircle className="w-4 h-4" /> Oferta de folleto
                </span>
                <span className="text-xs text-[#5A626A] font-semibold">Preventa habitual</span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20]">
                  “2 por $40.00”
                </h3>
                <p className="text-xs sm:text-sm text-[#5A626A] mt-1">
                  Parece una gran oferta a primera vista en el folleto...
                </p>
              </div>

              {/* Math breakdown */}
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E5E8] space-y-2.5 text-sm">
                <div className="flex justify-between text-[#5A626A]">
                  <span>Monto total a pagar:</span>
                  <span className="font-semibold text-[#1A1D20]">$40.00 MXN</span>
                </div>
                <div className="flex justify-between text-[#5A626A]">
                  <span>Unidades recibidas:</span>
                  <span className="font-semibold text-[#1A1D20]">2 piezas</span>
                </div>
                <div className="pt-2.5 border-t border-[#E2E5E8] flex justify-between items-center">
                  <span className="font-bold text-[#1A1D20]">Costo real por unidad:</span>
                  <span className="text-2xl font-extrabold text-red-600 tabular-nums">
                    $20.00
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3.5 rounded-xl bg-red-50 text-red-800 text-xs font-bold border border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>Estás pagando más de lo que cuesta la pieza suelta en mayorista.</span>
            </div>
          </div>

          {/* Promo B: The Real Best Cost */}
          <div className="bg-emerald-50/70 rounded-3xl border-2 border-emerald-300 p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#0F5132] text-white text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Compra inteligente
                </span>
                <span className="text-xs text-[#0D6832] font-bold">Mayorista local</span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F5132]">
                  $18.50 por unidad
                </h3>
                <p className="text-xs sm:text-sm text-[#0F5132]/80 mt-1">
                  Sin paquetes obligatorios ni compras forzadas.
                </p>
              </div>

              {/* Math breakdown */}
              <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-2.5 text-sm">
                <div className="flex justify-between text-[#5A626A]">
                  <span>Monto por 2 piezas:</span>
                  <span className="font-semibold text-[#1A1D20]">$37.00 MXN</span>
                </div>
                <div className="flex justify-between text-[#5A626A]">
                  <span>Ahorro neto en la compra:</span>
                  <span className="font-bold text-[#0D6832]">$3.00 MXN en el par</span>
                </div>
                <div className="pt-2.5 border-t border-emerald-100 flex justify-between items-center">
                  <span className="font-bold text-[#0F5132]">Costo real por unidad:</span>
                  <span className="text-2xl font-extrabold text-[#0D6832] tabular-nums">
                    $18.50
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3.5 rounded-xl bg-emerald-100 text-[#0D6832] text-xs font-bold border border-emerald-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#0D6832]" />
              <span>Abarrotes IA hace las cuentas difíciles por ti para cuidar cada peso.</span>
            </div>
          </div>

        </div>

        {/* Interactive Multi-Format Promotion Breakdown */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-[#E2E5E8] p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E5E8] pb-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#0F5132]" />
              <h4 className="text-sm sm:text-base font-bold text-[#1A1D20]">
                Desglose automático de esquemas comerciales complejos
              </h4>
            </div>
            <span className="text-xs text-[#5A626A] font-medium hidden sm:block">
              La IA normaliza todo a costo efectivo
            </span>
          </div>

          {/* Buttons for types */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {promoFormats.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPromoFormat(idx)}
                className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border cursor-pointer ${
                  selectedPromoFormat === idx
                    ? 'bg-[#0F5132] text-white border-transparent'
                    : 'bg-[#F8F9FA] border-[#E2E5E8] text-[#5A626A] hover:bg-[#F1F3F5] hover:text-[#1A1D20]'
                }`}
              >
                {p.type}
              </button>
            ))}
          </div>

          {/* Active explanation banner */}
          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-[#1A1D20] block sm:inline mr-2">
                {currentPromo.advertised}
              </span>
              <span className="text-[#5A626A]">
                → Costo real: <strong>{currentPromo.trueUnitCost}</strong> vs Alternativa: <strong>{currentPromo.alternativeCost}</strong>
              </span>
            </div>
            <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md shrink-0 border border-amber-200">
              {currentPromo.verdict}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
