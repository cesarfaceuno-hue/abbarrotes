import React from 'react';
import { Database, Cpu, Lightbulb, TrendingUp, ArrowDown, ArrowRight } from 'lucide-react';

export const DataFlowSection: React.FC = () => {
  const steps = [
    {
      step: '1',
      title: 'Datos de tu tienda',
      description: 'Inventario actual, ventas del día, entradas de mercancía y códigos de barras que ya escaneas.',
      icon: Database,
      badge: 'Lo que ya tienes',
    },
    {
      step: '2',
      title: 'Abarrotes IA procesa',
      description: 'Calcula tu velocidad de rotación, días de inventario restante y compara precios con proveedores locales.',
      icon: Cpu,
      badge: 'El trabajo pesado',
    },
    {
      step: '3',
      title: 'Recomendaciones claras',
      description: 'Recibes alertas sencillas: qué conviene comprar, qué precio es mejor y cuánto inventario necesitas.',
      icon: Lightbulb,
      badge: 'Sin matemáticas',
    },
    {
      step: '4',
      title: 'Mejores decisiones',
      description: 'Compras al menor costo posible, evitas quedarte sin producto y cuidas tu dinero en caja.',
      icon: TrendingUp,
      badge: 'Mayor rentabilidad',
    },
  ];

  return (
    <section id="como-funciona" className="py-16 md:py-24 bg-white border-b border-[#E2E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3.5 py-1.5 rounded-full bg-[#F1F3F5] text-[#1A1D20] text-xs font-bold uppercase tracking-wider">
            Flujo de Inteligencia
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1A1D20] tracking-tight">
            Tu tienda ya genera datos.{' '}
            <span className="text-[#0F5132]">Abarrotes IA los convierte en decisiones.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#5A626A] leading-relaxed">
            No necesitas hojas de cálculo ni horas de análisis. El sistema toma la información de tu operación y la traduce en acciones inmediatas de compra y ahorro.
          </p>
        </div>

        {/* Visual Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-[#F8F9FA] rounded-2xl border border-[#E2E5E8] p-6 flex flex-col justify-between hover:border-[#198754] transition-all hover:shadow-sm group"
              >
                {/* Step badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E5E8] flex items-center justify-center text-[#0F5132] font-bold text-base shadow-2xs group-hover:bg-[#0F5132] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-[#E2E5E8] text-[#5A626A]">
                    {item.badge}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <h3 className="text-lg font-bold text-[#1A1D20]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#5A626A] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E2E5E8]/60 flex items-center justify-between text-xs text-[#0F5132] font-semibold">
                  <span>Paso 0{item.step}</span>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 hidden md:block text-[#198754]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Note */}
        <div className="mt-12 p-4 sm:p-6 rounded-2xl bg-[#F8F9FA] border border-[#E2E5E8] text-center max-w-2xl mx-auto">
          <p className="text-sm sm:text-base text-[#1A1D20] font-medium">
            💡 <strong>La regla principal:</strong> Tú atiendes tu mostrador y tomas la decisión final. La plataforma se encarga de las cuentas y la búsqueda.
          </p>
        </div>

      </div>
    </section>
  );
};
