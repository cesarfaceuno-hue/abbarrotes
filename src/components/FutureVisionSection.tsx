import React from 'react';
import { Network, Store, Sparkles, ShoppingBag, ArrowRight, Share2, Users } from 'lucide-react';

export const FutureVisionSection: React.FC = () => {
  const steps = [
    { label: 'TU TIENDA', desc: 'Comercio independiente en el barrio', icon: Store },
    { label: 'INVENTARIO', desc: 'Control de entradas y salidas', icon: ShoppingBag },
    { label: 'INTELIGENCIA', desc: 'Análisis de rotación y precios', icon: Sparkles },
    { label: 'MEJORES COMPRAS', desc: 'Ahorro unitario diario', icon: ArrowRight },
    { label: 'RED DE TIENDAS', desc: 'Comunidad de abarroteros conectados', icon: Users },
    { label: 'COMERCIO ENTRE TIENDAS', desc: 'Compras consolidadas e intercambio', icon: Share2 },
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-b border-[#E2E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3.5 py-1.5 rounded-full bg-[#E8F5E9] text-[#0D6832] text-xs font-bold uppercase tracking-wider border border-[#C8E6C9]">
            Visión a Largo Plazo
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1D20] tracking-tight">
            Hoy te ayudamos a comprar mejor.{' '}
            <span className="text-[#0F5132] block sm:inline">Mañana podemos ayudarte a comerciar mejor.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#5A626A] leading-relaxed">
            Comenzamos resolviendo el problema inmediato de tu mostrador: comprar con mejores precios y sin congelar dinero. A medida que más tiendas se sumen, la inteligencia colectiva abrirá nuevas ventajas comerciales.
          </p>
        </div>

        {/* Roadmap Chain: TU TIENDA -> INVENTARIO -> INTELIGENCIA -> MEJORES COMPRAS -> RED DE TIENDAS -> COMERCIO ENTRE TIENDAS */}
        <div className="max-w-5xl mx-auto bg-[#F8F9FA] rounded-3xl border border-[#E2E5E8] p-6 sm:p-10">
          
          <span className="text-xs font-bold uppercase tracking-wider text-[#5A626A] block text-center mb-8">
            La Evolución del Comercio de Barrio
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isFuture = idx >= 4;
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    isFuture
                      ? 'bg-white border-dashed border-emerald-300'
                      : 'bg-white border-[#E2E5E8]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isFuture
                          ? 'bg-emerald-100 text-[#0D6832]'
                          : 'bg-[#0F5132] text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[#5A626A]">
                      Fase 0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-[#1A1D20] tracking-tight">
                    {step.label}
                  </h3>

                  <p className="text-xs text-[#5A626A] mt-1">
                    {step.desc}
                  </p>

                  <div className="mt-3 pt-2 border-t border-[#E2E5E8] text-[10px] font-bold text-[#0D6832]">
                    {isFuture ? '✨ Próximamente' : '✓ Disponible hoy'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center text-xs text-[#5A626A] max-w-xl mx-auto">
            La fuerza de miles de abarroteros independientes organizados con inteligencia para competir al tú por tú con las grandes cadenas.
          </div>

        </div>

      </div>
    </section>
  );
};
