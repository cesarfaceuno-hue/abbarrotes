import React from 'react';
import { ShoppingCart, Boxes, Barcode, PackageSearch, FileText, ArrowUpDown } from 'lucide-react';

export const PosCapabilitiesSection: React.FC = () => {
  const tools = [
    { title: 'Registro de Ventas', icon: ShoppingCart, desc: 'Cobro rápido en mostrador y tickets claros.' },
    { title: 'Control de Inventario', icon: Boxes, desc: 'Monitoreo de existencias en tiempo real sin descuadres.' },
    { title: 'Lectura de Códigos', icon: Barcode, desc: 'Compatibilidad con pistolas lectoras USB y Bluetooth.' },
    { title: 'Catálogo de Productos', icon: PackageSearch, desc: 'Búsqueda por nombre, marca o presentación.' },
    { title: 'Registro de Entradas', icon: ArrowUpDown, desc: 'Recepción veloz de mercancía de proveedores.' },
    { title: 'Reportes de Movimiento', icon: FileText, desc: 'Historial diario de flujo de caja y ventas.' },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#F8F9FA] border-b border-[#E2E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3 py-1 rounded-full bg-[#F1F3F5] text-[#5A626A] text-xs font-bold uppercase tracking-wider border border-[#E2E5E8]">
            Herramientas Operativas Base
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1A1D20] tracking-tight">
            Todo lo que esperas de un POS.{' '}
            <span className="text-[#0F5132]">Más inteligencia.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#5A626A] leading-relaxed">
            Las funciones operativas básicas para cobrar y administrar tu mostrador están cubiertas, pero el verdadero valor está en decirte qué comprar para ganar más.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#E2E5E8] p-5 flex items-start gap-4 hover:border-[#198754] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8] flex items-center justify-center text-[#0F5132] shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1A1D20]">
                    {tool.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5A626A] mt-1 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note on focus */}
        <div className="mt-12 text-center text-xs text-[#5A626A] max-w-xl mx-auto">
          <span>Un sistema de cobro registra el pasado. <strong>Mi Abarrotero optimiza tus compras hacia el futuro.</strong></span>
        </div>

      </div>
    </section>
  );
};
