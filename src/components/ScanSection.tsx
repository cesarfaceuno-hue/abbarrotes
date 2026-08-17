import React from 'react';
import { ScanLine, Box, ArrowRight, BarChart3, Check } from 'lucide-react';

export const ScanSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-[#E2E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#0D6832] text-xs font-bold uppercase tracking-wider border border-[#C8E6C9]">
            Operación en 1 solo paso
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1A1D20] tracking-tight">
            Escanea una vez.{' '}
            <span className="text-[#0F5132]">La inteligencia empieza a trabajar.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#5A626A] leading-relaxed">
            El objetivo es eliminar el doble trabajo. Cuando recibes mercancía de tus proveedores, un solo escaneo alimenta tu stock y enciende el motor de análisis.
          </p>
        </div>

        {/* 4-Step Interactive Visual Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Step 1 */}
          <div className="bg-[#F8F9FA] rounded-2xl border border-[#E2E5E8] p-6 relative flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0F5132] text-white flex items-center justify-center shadow-xs">
                <ScanLine className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0F5132] uppercase tracking-wider">
                  Paso 1
                </span>
                <h3 className="text-lg font-bold text-[#1A1D20] mt-1">
                  Lector de código
                </h3>
                <p className="text-xs sm:text-sm text-[#5A626A] mt-2 leading-relaxed">
                  Llega mercancía al mostrador. Escaneas con tu pistola USB, inalámbrica o cámara.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E2E5E8] flex items-center gap-2 text-xs font-semibold text-[#1A1D20]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Cero captura manual</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#F8F9FA] rounded-2xl border border-[#E2E5E8] p-6 relative flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E5E8] text-[#1A1D20] flex items-center justify-center shadow-xs">
                <Box className="w-6 h-6 text-[#0F5132]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0F5132] uppercase tracking-wider">
                  Paso 2
                </span>
                <h3 className="text-lg font-bold text-[#1A1D20] mt-1">
                  Identificación de Producto
                </h3>
                <p className="text-xs sm:text-sm text-[#5A626A] mt-2 leading-relaxed">
                  El sistema reconoce al instante el producto: “Refresco Cola 600 ml — Caja c/24”.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E2E5E8] flex items-center gap-2 text-xs font-semibold text-[#1A1D20]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Catálogo normalizado</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#F8F9FA] rounded-2xl border border-[#E2E5E8] p-6 relative flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E5E8] text-[#1A1D20] flex items-center justify-center shadow-xs">
                <BarChart3 className="w-6 h-6 text-[#198754]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0F5132] uppercase tracking-wider">
                  Paso 3
                </span>
                <h3 className="text-lg font-bold text-[#1A1D20] mt-1">
                  Inventario Actualizado
                </h3>
                <p className="text-xs sm:text-sm text-[#5A626A] mt-2 leading-relaxed">
                  Se suman las unidades en tiempo real y se recalculan los días de cobertura restante.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E2E5E8] flex items-center gap-2 text-xs font-semibold text-[#1A1D20]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Stock en sincronía</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-emerald-900 text-white rounded-2xl p-6 relative flex flex-col justify-between shadow-md">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-800 text-emerald-300 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Paso 4
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Análisis Inteligente
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
                  Abarrotes IA compara contra precios de la zona y te dice cuándo te tocará resurtir al mejor costo.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-800 flex items-center gap-2 text-xs font-semibold text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Decisión lista</span>
            </div>
          </div>

        </div>

        {/* Small Notice */}
        <p className="mt-8 text-center text-xs text-[#5A626A] max-w-xl mx-auto">
          * La compatibilidad específica con hardware o escáneres existentes se adaptará según el equipo disponible en tu tienda.
        </p>

      </div>
    </section>
  );
};
