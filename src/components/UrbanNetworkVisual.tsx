import React, { useState } from 'react';
import { Package, DollarSign, Truck, Boxes, RefreshCw, CheckCircle2, ArrowRight, ArrowDown, Sparkles, MapPin, Layers } from 'lucide-react';

export const UrbanNetworkVisual: React.FC = () => {
  const [activeNode, setActiveNode] = useState<number>(5);

  const nodes = [
    {
      id: 0,
      label: 'PRODUCTO',
      sub: 'Coca-Cola 600 ml',
      icon: Package,
      detail: 'Demanda diaria y margen actual',
      color: 'border-slate-300 bg-white text-[#1A1D20]',
    },
    {
      id: 1,
      label: 'PRECIO',
      sub: '$17.00 previo vs $15.20',
      icon: DollarSign,
      detail: 'Diferencial neto por unidad analizado',
      color: 'border-slate-300 bg-white text-[#1A1D20]',
    },
    {
      id: 2,
      label: 'OPCIONES',
      sub: 'Mayoristas y preventa',
      icon: Truck,
      detail: 'Disponibilidad, volumen y condiciones reales',
      color: 'border-slate-300 bg-white text-[#1A1D20]',
    },
    {
      id: 3,
      label: 'INVENTARIO',
      sub: '24 piezas en existencia',
      icon: Boxes,
      detail: 'Cobertura estimada: 2 días de venta',
      color: 'border-slate-300 bg-white text-[#1A1D20]',
    },
    {
      id: 4,
      label: 'ROTACIÓN',
      sub: 'Alta: 12 u / día',
      icon: RefreshCw,
      detail: 'Retorno de capital en 4 días garantizados',
      color: 'border-slate-300 bg-white text-[#1A1D20]',
    },
    {
      id: 5,
      label: 'RECOMENDACIÓN',
      sub: 'Comprar 50 unidades (2 cajas)',
      icon: CheckCircle2,
      detail: 'Ahorro potencial: $90.00 MXN en esta compra',
      color: 'border-emerald-500 bg-emerald-50 text-[#0F5132]',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#F8F9FA] border-b border-[#E2E5E8] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F5E9] text-[#0D6832] text-xs font-bold uppercase tracking-wider border border-[#C8E6C9]">
            <Sparkles className="w-3.5 h-3.5 text-[#198754]" />
            <span>Red de Información Comercial Local</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1A1D20] tracking-tight">
            Así fluye la inteligencia para tu tienda.
          </h2>

          <p className="text-base sm:text-lg text-[#5A626A] leading-relaxed">
            Cada producto en tu mostrador se conecta con opciones comerciales locales, promociones efectivas, inventario y velocidad de venta para encontrar <strong>la mejor opción disponible para TU tienda</strong>.
          </p>
        </div>

        {/* Urban Network Metro-style Flow Board */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-[#E2E5E8] shadow-sm p-6 sm:p-10 relative">
          
          {/* Top Subway-style Line Track Indicator (Desktop) */}
          <div className="hidden lg:block relative mb-12">
            {/* The Metro Line Track */}
            <div className="absolute top-5 left-8 right-8 h-1 bg-gradient-to-r from-slate-300 via-emerald-400 to-[#0F5132] rounded-full z-0" />
            
            {/* 6 Metro Line Stations */}
            <div className="grid grid-cols-6 relative z-10 text-center">
              {nodes.map((n, idx) => {
                const Icon = n.icon;
                const isSelected = activeNode === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setActiveNode(n.id)}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all ${
                        isSelected
                          ? 'bg-[#0F5132] text-white border-emerald-300 ring-4 ring-emerald-500/20 scale-110'
                          : 'bg-white text-[#5A626A] border-slate-300 group-hover:border-[#0F5132] group-hover:text-[#0F5132]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`mt-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                        isSelected ? 'text-[#0F5132]' : 'text-[#5A626A]'
                      }`}
                    >
                      {n.label}
                    </span>
                    <span className="text-[10px] text-[#5A626A] font-medium hidden sm:block">
                      Paso 0{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid representation for Mobile & Tablet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map((n, idx) => {
              const Icon = n.icon;
              const isSelected = activeNode === n.id;
              const isLast = idx === nodes.length - 1;
              return (
                <div
                  key={n.id}
                  onClick={() => setActiveNode(n.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                    isLast
                      ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                      : isSelected
                      ? 'bg-[#F8F9FA] border-[#0F5132] shadow-2xs'
                      : 'bg-[#F8F9FA] border-[#E2E5E8] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isLast
                            ? 'bg-[#0F5132] text-white'
                            : 'bg-white border border-[#E2E5E8] text-[#1A1D20]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1A1D20]">
                        {n.label}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#5A626A]">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#1A1D20]">
                    {n.sub}
                  </h3>

                  <p className="text-xs text-[#5A626A] mt-1">
                    {n.detail}
                  </p>

                  {isLast && (
                    <div className="mt-3 pt-2.5 border-t border-emerald-200 flex items-center justify-between text-xs text-[#0D6832] font-bold">
                      <span>Decisión lista</span>
                      <ArrowRight className="w-4 h-4 text-[#198754]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Clarifying Footer */}
          <div className="mt-8 pt-6 border-t border-[#E2E5E8] text-center text-xs text-[#5A626A]">
            <p>
              La decisión evalúa: <strong>precio + distancia + disponibilidad + promociones + volumen + condiciones de entrega + velocidad de venta</strong>.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
