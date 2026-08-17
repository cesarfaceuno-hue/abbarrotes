import React from 'react';
import { ShoppingBag, ArrowRight, Database, Cpu, CheckCircle2, FileText, ArrowUpDown, Boxes, Sparkles, Layers } from 'lucide-react';

export const PosPhilosophySection: React.FC = () => {
  const posInputs = [
    { name: 'Ventas del día', icon: ShoppingBag, desc: 'Tickets y cobros en mostrador' },
    { name: 'Inventario actual', icon: Boxes, desc: 'Existencias físicas en anaquel' },
    { name: 'Catálogo de productos', icon: FileText, desc: 'Códigos y presentaciones' },
    { name: 'Entradas de mercancía', icon: ArrowUpDown, desc: 'Facturas y notas de compra' },
    { name: 'Salidas y mermas', icon: Database, desc: 'Consumo y producto dañado' },
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-b border-[#E2E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Headline */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3.5 py-1.5 rounded-full bg-[#E8F5E9] text-[#0D6832] text-xs font-bold uppercase tracking-wider border border-[#C8E6C9]">
            Estrategia de Producto
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1D20] tracking-tight leading-tight">
            Tu POS registra lo que pasa.{' '}
            <span className="text-[#0F5132] block sm:inline">Abarrotes IA te ayuda a decidir qué hacer.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#5A626A] leading-relaxed">
            No somos una empresa de POS que le puso IA. Somos una <strong>plataforma de inteligencia</strong> para pequeños comercios que utiliza tu información operativa para ayudarte a ganar más margen mañana.
          </p>
        </div>

        {/* Visual Split: POS (Left) vs Intelligence (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Left: Traditional POS Role */}
          <div className="lg:col-span-5 bg-[#F8F9FA] rounded-3xl border border-[#E2E5E8] p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5A626A]">
                  El Rol del Punto de Venta
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-semibold">
                  Fuente de Datos
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#1A1D20]">
                Registra la operación en mostrador
              </h3>

              <p className="text-xs sm:text-sm text-[#5A626A]">
                Proporciona los datos base de tu comercio:
              </p>

              <div className="space-y-2.5 pt-1">
                {posInputs.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#E2E5E8] text-xs font-medium text-[#1A1D20]">
                      <Icon className="w-4 h-4 text-[#5A626A] shrink-0" />
                      <div>
                        <strong>{item.name}</strong> • <span className="text-[#5A626A]">{item.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2E5E8] text-xs text-[#5A626A] italic text-center">
              “Excelente para cobrar rápido y llevar control del día.”
            </div>
          </div>

          {/* Center connector */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center gap-2 text-center py-4 lg:py-0">
            <div className="w-12 h-12 rounded-2xl bg-[#0F5132] text-white flex items-center justify-center shadow-sm">
              <Cpu className="w-6 h-6" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0F5132]">
              IA Procesa
            </span>
            <ArrowRight className="w-5 h-5 text-[#0F5132] hidden lg:block" />
          </div>

          {/* Right: Abarrotes IA Intelligence Role */}
          <div className="lg:col-span-5 bg-emerald-50/70 rounded-3xl border-2 border-emerald-300 p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0D6832]">
                  El Rol de Abarrotes IA
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#0F5132] text-white font-bold">
                  Inteligencia Comercial
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#0F5132]">
                Convierte esos datos en ahorro y margen
              </h3>

              <p className="text-xs sm:text-sm text-[#0F5132]/90">
                Abarrotes IA evalúa precios locales, promociones y rotación para responder:
              </p>

              <div className="space-y-3 pt-1 text-sm text-[#1A1D20]">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-[#198754] shrink-0 mt-0.5" />
                  <span className="text-xs leading-snug">
                    <strong>¿Dónde comprar hoy?</strong> Encuentra la mejor opción disponible para TU tienda.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-[#198754]" />
                  <span className="text-xs leading-snug">
                    <strong>¿Cuánto comprar?</strong> Evita quedarte sin mercancía rápida o congelar caja en producto lento.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-[#198754]" />
                  <span className="text-xs leading-snug">
                    <strong>¿Conviene esta promoción?</strong> Calcula el costo real por unidad antes de aceptar.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-200 text-xs font-bold text-[#0D6832] text-center">
              “Tu asesor estratégico de compras en el mostrador.”
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
