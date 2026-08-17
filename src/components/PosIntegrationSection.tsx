import React from 'react';
import { Layers, ArrowDown, Database, Cpu, Lightbulb, CheckCircle2, ShieldAlert, FileSpreadsheet, Smartphone, Server } from 'lucide-react';

export const PosIntegrationSection: React.FC = () => {
  return (
    <section id="no-cambies-pos" className="py-16 md:py-24 bg-[#F8F9FA] border-b border-[#E2E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl border border-[#E2E5E8] p-6 sm:p-10 lg:p-14 shadow-sm relative overflow-hidden">
          
          <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
            <span className="px-3.5 py-1.5 rounded-full bg-[#E8F5E9] text-[#0D6832] text-xs font-bold uppercase tracking-wider border border-[#C8E6C9]">
              Integración Abierta y Sin Fricción
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A1D20] tracking-tight">
              ¿Ya tienes un sistema?{' '}
              <span className="text-[#0F5132]">No queremos que cambies tu forma de trabajar.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#5A626A] leading-relaxed max-w-3xl mx-auto">
              Mi Abarrotero no depende de que compres o cambies de software. Nuestro objetivo es aprovechar la información que ya generas para darte inteligencia inmediata.
            </p>
          </div>

          {/* Flow Visual: TU POS / FUENTE -> DATOS -> MI ABARROTERO -> INTELIGENCIA */}
          <div className="max-w-4xl mx-auto bg-[#F8F9FA] rounded-2xl border border-[#E2E5E8] p-6 sm:p-8 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5A626A] block text-center mb-6">
              Flujo de Conexión Inteligente
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              
              {/* Node 1: TU FUENTE */}
              <div className="bg-white rounded-xl p-4 border border-[#E2E5E8] text-center space-y-1 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5A626A] block">
                  Paso 1
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1A1D20]">
                  TU POS O REGISTRO
                </h3>
                <p className="text-[11px] text-[#5A626A]">
                  Pulpos, otro POS, hojas de cálculo o notas
                </p>
              </div>

              {/* Node 2: DATOS */}
              <div className="bg-white rounded-xl p-4 border border-[#E2E5E8] text-center space-y-1 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5A626A] block">
                  Paso 2
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1A1D20]">
                  DATOS
                </h3>
                <p className="text-[11px] text-[#5A626A]">
                  Ventas y productos que ya manejas
                </p>
              </div>

              {/* Node 3: MI ABARROTERO */}
              <div className="bg-[#0F5132] text-white rounded-xl p-4 border border-emerald-800 text-center space-y-1 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 block">
                  Paso 3
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  MI ABARROTERO
                </h3>
                <p className="text-[11px] text-emerald-100">
                  Compara precios, promociones y rotación
                </p>
              </div>

              {/* Node 4: INTELIGENCIA */}
              <div className="bg-emerald-100 text-[#0D6832] rounded-xl p-4 border border-emerald-300 text-center space-y-1 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0D6832] block">
                  Resultado
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#0D6832]">
                  INTELIGENCIA
                </h3>
                <p className="text-[11px] text-[#0F5132]">
                  Recomendaciones de compra y ahorro
                </p>
              </div>

            </div>
          </div>

          {/* 4 Multi-Source Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-4xl mx-auto text-xs">
            <div className="p-4 rounded-xl bg-white border border-[#E2E5E8] space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-[#1A1D20]">
                <Server className="w-4 h-4 text-[#0F5132]" />
                <span>Sistemas POS</span>
              </div>
              <p className="text-[#5A626A] leading-relaxed">
                Conexión con sistemas comerciales existentes cuando sea técnicamente viable.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E5E8] space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-[#1A1D20]">
                <FileSpreadsheet className="w-4 h-4 text-[#0F5132]" />
                <span>Hojas de Cálculo</span>
              </div>
              <p className="text-[#5A626A] leading-relaxed">
                Carga rápida de listas de inventario o notas de surtido semanales.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E5E8] space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-[#1A1D20]">
                <Smartphone className="w-4 h-4 text-[#0F5132]" />
                <span>Escaneo en Mostrador</span>
              </div>
              <p className="text-[#5A626A] leading-relaxed">
                Registro ágil con lector de código de barras o cámara del celular.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E5E8] space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-[#1A1D20]">
                <CheckCircle2 className="w-4 h-4 text-[#0F5132]" />
                <span>Módulo Ligero</span>
              </div>
              <p className="text-[#5A626A] leading-relaxed">
                Herramientas operativas base incluidas para quienes no tienen sistema previo.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
