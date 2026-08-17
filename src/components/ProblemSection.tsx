import React from 'react';
import { AlertCircle, ArrowRight, DollarSign, Clock, PackageCheck, AlertTriangle, ShieldCheck, Ban } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const painPoints = [
    {
      title: 'Comprar al proveedor habitual',
      desc: 'Pagar el precio de lista de la preventa de siempre por inercia o falta de tiempo, sin saber si la abarrotera de la esquina lo tiene 12% más barato.',
      impact: 'Pérdida invisible de margen en cada caja',
      tag: 'Inercia de compra',
    },
    {
      title: 'Aceptar promociones engañosas',
      desc: 'Comprar paquetes 2x1 o combos "con descuento" que al dividir el costo unitario terminan saliendo más caros que comprar piezas sueltas.',
      impact: 'Costo unitario real más elevado',
      tag: 'Publicidad confusa',
    },
    {
      title: 'Comprar demasiado de lo que no se vende',
      desc: 'Aceptar el descuento por fardo de un producto de lenta rotación y dejar $800 pesos atrapados en anaquel durante más de tres meses.',
      impact: 'Capital de trabajo congelado',
      tag: 'Exceso de stock',
    },
    {
      title: 'Quedarse sin producto clave',
      desc: 'Agotar el refresco o la leche un sábado por la tarde y perder ventas directas porque el proveedor pasa hasta el martes siguiente.',
      impact: 'Clientes que se van a la competencia',
      tag: 'Desabasto inesperado',
    },
    {
      title: 'Mantener dinero inmovilizado',
      desc: 'Tener cajas de mercancía lenta ocupando espacio en bodega mientras falta liquidez en la caja para pagar a los proveedores del día.',
      impact: 'Falta de flujo diario en caja',
      tag: 'Iliquidez operativa',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-b border-[#E2E5E8] relative overflow-hidden">
      {/* Background subtle architectural grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E5E8_1px,transparent_1px),linear-gradient(to_bottom,#E2E5E8_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Acto 01 — La realidad diaria del mostrador</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1D20] tracking-tight leading-tight">
            Tu tienda mueve dinero todos los días.{' '}
            <span className="text-[#0F5132] block sm:inline">¿Sabes dónde estás dejando dinero?</span>
          </h2>

          <p className="text-base sm:text-lg text-[#5A626A] leading-relaxed">
            Atender a los clientes, cobrar, recibir camiones, resurtir anaqueles y cuadrar caja... Administrar un comercio independiente es una labor titánica de 14 horas al día.
          </p>
        </div>

        {/* 5 Real-world Situations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {painPoints.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all hover:shadow-sm ${
                idx === 4
                  ? 'md:col-span-2 lg:col-span-1 bg-[#F8F9FA] border-[#E2E5E8]'
                  : 'bg-[#F8F9FA] border-[#E2E5E8]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-200">
                    {item.tag}
                  </span>
                  <span className="text-xs font-bold text-[#5A626A]">
                    0{idx + 1}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#1A1D20] leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#5A626A] leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E2E5E8] flex items-center gap-2 text-xs font-semibold text-red-700">
                <Ban className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{item.impact}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Core Empathy Message Box */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-[#0F5132] text-white rounded-2xl p-6 sm:p-8 text-center space-y-3 shadow-md relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-700/30 rounded-full blur-2xl pointer-events-none" />
            <p className="text-lg sm:text-xl font-bold leading-snug">
              “El problema no es que no sepas manejar tu tienda.{' '}
              <span className="text-emerald-200">Es que nadie tiene tiempo para comparar todo.”</span>
            </p>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl mx-auto">
              Mi Abarrotero nace para hacer esa labor silenciosa de comparación, análisis de rotación y búsqueda por ti, mientras tú sigues enfocado en tus clientes.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
