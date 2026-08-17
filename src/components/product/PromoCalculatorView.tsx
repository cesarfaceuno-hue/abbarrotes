import React, { useState } from 'react';
import { Calculator, Sparkles, AlertTriangle, CheckCircle2, HelpCircle, ArrowRight, ShieldCheck, DollarSign, Clock } from 'lucide-react';
import { PromoCalculationResult } from '../../types';

export const PromoCalculatorView: React.FC = () => {
  // Input fields
  const [productName, setProductName] = useState<string>('Detergente en Polvo 1kg');
  const [regularCostPerUnit, setRegularCostPerUnit] = useState<number>(38.0);
  const [unitsToBuy, setUnitsToBuy] = useState<number>(20);
  const [totalPromoCost, setTotalPromoCost] = useState<number>(670.0);
  const [unitsReceived, setUnitsReceived] = useState<number>(20);
  const [dailySales, setDailySales] = useState<number>(0.5);
  const [alternativeWholesalePrice, setAlternativeWholesalePrice] = useState<number>(36.0);

  // Quick preset templates
  const presets = [
    {
      label: 'Detergente Bulto 20 pzas ($670)',
      name: 'Jabón / Detergente en Polvo 1kg',
      regular: 38.0,
      buyUnits: 20,
      totalCost: 670.0,
      received: 20,
      sales: 0.5,
      alternative: 36.0,
      desc: 'Típica trampa de volumen en producto de baja rotación.',
    },
    {
      label: 'Refresco 4 cajas + 1 gratis',
      name: 'Refresco 600ml (Caja c/24)',
      regular: 17.0,
      buyUnits: 96,
      totalCost: 1440.0, // 4 * 360
      received: 120, // 5 * 24
      sales: 12.0,
      alternative: 15.2,
      desc: 'Alta rotación con producto gratis real.',
    },
    {
      label: 'Galletas 3x2 en mayoreo',
      name: 'Galletas Marías 170g',
      regular: 16.0,
      buyUnits: 30,
      totalCost: 320.0,
      received: 30,
      sales: 3.0,
      alternative: 14.5,
      desc: 'Promoción estándar de temporada.',
    },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setProductName(p.name);
    setRegularCostPerUnit(p.regular);
    setUnitsToBuy(p.buyUnits);
    setTotalPromoCost(p.totalCost);
    setUnitsReceived(p.received);
    setDailySales(p.sales);
    setAlternativeWholesalePrice(p.alternative);
  };

  // Calculations
  const realCostPerUnit = unitsReceived > 0 ? totalPromoCost / unitsReceived : 0;
  const regularTotal = regularCostPerUnit * unitsReceived;
  const nominalSavings = regularTotal - totalPromoCost;
  const daysToRecover = dailySales > 0 ? unitsReceived / dailySales : 999;
  const capitalLocked = totalPromoCost;

  // Verdict evaluation logic
  let verdict: 'excelente' | 'trampa' | 'regular' = 'regular';
  let verdictTitle = 'Oferta neutral';
  let verdictExplanation = '';

  if (daysToRecover > 25 && nominalSavings < 150) {
    verdict = 'trampa';
    verdictTitle = '⚠️ Falsa Oferta / Trampa de Inventario';
    verdictExplanation = `Aunque el costo unitario baja a $${realCostPerUnit.toFixed(2)}, tardarás ${daysToRecover.toFixed(0)} días en vender todo. Congelarás $${capitalLocked.toFixed(2)} pesos de tu caja chica por un ahorro mínimo. Es mejor comprar pocas piezas en tu mayorista habitual.`;
  } else if (daysToRecover <= 10 && realCostPerUnit <= alternativeWholesalePrice) {
    verdict = 'excelente';
    verdictTitle = '✅ Oferta Excelente / Aprovechar Hoy';
    verdictExplanation = `El costo unitario real es de $${realCostPerUnit.toFixed(2)} (ahorras $${(regularCostPerUnit - realCostPerUnit).toFixed(2)} por pieza). Como vendes ${dailySales} pzas al día, recuperarás tu dinero en solo ${daysToRecover.toFixed(1)} días.`;
  } else {
    verdict = 'regular';
    verdictTitle = '🔍 Evaluar según tu flujo del día';
    verdictExplanation = `El ahorro total es de $${nominalSavings.toFixed(2)} MXN y tardarás ~${daysToRecover.toFixed(0)} días en agotar el producto. Cómpralo solo si tienes suficiente dinero en caja para pagar los otros repartidores de hoy.`;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20] tracking-tight">
          Calculadora de Promociones y Ofertas de Proveedor
        </h1>
        <p className="text-xs sm:text-sm text-[#5A626A]">
          Desarma combos confusos ("3x2", "segunda al 50%", "bultos con regalo") y descubre si te conviene o solo congelas tu dinero.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="bg-white rounded-2xl border border-[#E2E5E8] p-4 space-y-2">
        <span className="text-xs font-bold text-[#1A1D20]">
          Ejemplos reales de ofertas comunes de repartidores:
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 rounded-xl bg-[#F8F9FA] hover:bg-emerald-50 hover:border-emerald-300 border border-[#E2E5E8] text-xs font-bold text-[#1A1D20] transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Inputs (Left) & Verdict Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E2E5E8] p-6 space-y-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D6832]">
            Datos de la Oferta del Repartidor
          </span>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                Producto
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                  Tu costo regular habitual ($/pza)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={regularCostPerUnit}
                  onChange={(e) => setRegularCostPerUnit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                  Precio total que pagarías ($)
                </label>
                <input
                  type="number"
                  step="1"
                  value={totalPromoCost}
                  onChange={(e) => setTotalPromoCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                  Piezas totales que recibes
                </label>
                <input
                  type="number"
                  value={unitsReceived}
                  onChange={(e) => setUnitsReceived(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                  Venta diaria promedio en tu tienda
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={dailySales}
                  onChange={(e) => setDailySales(parseFloat(e.target.value) || 0.1)}
                  className="w-full px-3 py-2 text-xs border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                Precio en mayorista alternativo ($/pza)
              </label>
              <input
                type="number"
                step="0.1"
                value={alternativeWholesalePrice}
                onChange={(e) => setAlternativeWholesalePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
              />
            </div>
          </div>
        </div>

        {/* Output Verdict (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-[#E2E5E8] p-6 sm:p-7 shadow-sm space-y-6">
            
            {/* Financial Metrics Matrix */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E2E5E8] text-center">
                <div className="text-[10px] uppercase font-bold text-[#5A626A]">Costo unitario real</div>
                <div className="text-xl font-black text-[#1A1D20] tabular-nums mt-0.5">
                  ${realCostPerUnit.toFixed(2)}
                </div>
                <div className="text-[10px] text-[#0D6832] font-semibold">
                  vs ${regularCostPerUnit.toFixed(2)} habitual
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-[10px] uppercase font-bold text-[#0D6832]">Ahorro nominal total</div>
                <div className="text-xl font-black text-[#0D6832] tabular-nums mt-0.5">
                  ${Math.max(0, nominalSavings).toFixed(2)}
                </div>
                <div className="text-[10px] text-[#0D6832] font-semibold">
                  en las {unitsReceived} piezas
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E2E5E8] text-center">
                <div className="text-[10px] uppercase font-bold text-[#5A626A]">Días para recuperar</div>
                <div className="text-xl font-black text-[#1A1D20] tabular-nums mt-0.5">
                  ~{daysToRecover.toFixed(0)} días
                </div>
                <div className="text-[10px] text-[#5A626A] font-semibold">
                  con venta de {dailySales} pza/d
                </div>
              </div>
            </div>

            {/* AI Verdict Card */}
            <div
              className={`p-5 rounded-2xl border space-y-2.5 ${
                verdict === 'excelente'
                  ? 'bg-emerald-50/80 border-emerald-300 text-[#0D6832]'
                  : verdict === 'trampa'
                  ? 'bg-amber-50/90 border-amber-300 text-amber-900'
                  : 'bg-blue-50/80 border-blue-300 text-blue-950'
              }`}
            >
              <div className="flex items-center gap-2">
                {verdict === 'excelente' ? (
                  <CheckCircle2 className="w-5 h-5 text-[#198754] shrink-0" />
                ) : verdict === 'trampa' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                ) : (
                  <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
                )}
                <h3 className="text-base font-extrabold tracking-tight">
                  {verdictTitle}
                </h3>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed text-[#1A1D20]">
                {verdictExplanation}
              </p>
            </div>

            {/* Key takeaway bullet */}
            <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E5E8] text-xs text-[#5A626A] space-y-1">
              <span className="font-bold text-[#1A1D20] block">Regla de Oro en Abarrotes IA:</span>
              <p>
                Un descuento del 15% no sirve si te obliga a congelar dinero durante 40 días. Ese capital rinde 10 veces más rotando refresco o leche todos los días.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
