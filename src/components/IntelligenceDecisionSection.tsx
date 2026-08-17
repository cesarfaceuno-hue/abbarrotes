import React, { useState } from 'react';
import { Cpu, CheckCircle2, PauseCircle, ArrowDownRight, RefreshCw, ShoppingCart, HelpCircle, Sparkles, Search, Layers, Calculator, ListChecks } from 'lucide-react';

export const IntelligenceDecisionSection: React.FC = () => {
  const [selectedDecision, setSelectedDecision] = useState<'comprar' | 'esperar' | 'comprar-menos' | 'comparar'>('comprar');

  const capabilities = [
    { name: 'Buscar', desc: 'Precios locales y mayoristas' },
    { name: 'Comparar', desc: 'Condiciones y costos netos' },
    { name: 'Analizar', desc: 'Venta diaria y merma' },
    { name: 'Detectar', desc: 'Falsas promociones' },
    { name: 'Calcular', desc: 'Costo unitario efectivo' },
    { name: 'Resumir', desc: 'En 30 segundos cada mañana' },
    { name: 'Recomendar', desc: 'La acción exacta a tomar' },
  ];

  const decisions = [
    {
      id: 'comprar' as const,
      label: 'Comprar',
      badge: 'Recomendado',
      badgeClass: 'bg-[#E8F5E9] text-[#0D6832] border-[#C8E6C9]',
      btnClass: 'bg-[#0F5132] text-white',
      title: 'Comprar 50 unidades (2 cajas)',
      desc: 'Alta rotación comprobada + stock para menos de 48 horas + mejor precio neto encontrado en mayorista de zona.',
      example: 'Coca-Cola 600 ml: Pagas $15.20 vs $17.00 anterior. Ahorras $90.00 MXN en la compra sin riesgo de estancamiento.',
    },
    {
      id: 'esperar' as const,
      label: 'Esperar',
      badge: 'Cuidar liquidez',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      btnClass: 'bg-amber-600 text-white',
      title: 'No comprar más hoy',
      desc: 'El proveedor ofrece un 12% de descuento aparente pero tienes 18 unidades en anaquel que tardarán más de 30 días en venderse.',
      example: 'Jabón en polvo 1 kg: Evitas congelar $600 pesos de tu caja chica que necesitas para pagar el refresco diario.',
    },
    {
      id: 'comprar-menos' as const,
      label: 'Comprar menos',
      badge: 'Ajuste de volumen',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      btnClass: 'bg-blue-600 text-white',
      title: 'Pedir solo 1 caja o medio fardo',
      desc: 'Demanda moderada con tendencia a la baja en la temporada. Comprar medio fardo mantiene producto fresco sin merma.',
      example: 'Galletas de temporada: Stock controlado a 7 días sin comprometer el capital de trabajo.',
    },
    {
      id: 'comparar' as const,
      label: 'Comparar proveedor',
      badge: 'Mejor margen',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      btnClass: 'bg-purple-600 text-white',
      title: 'Cambiar de canal de surtido',
      desc: 'El camión de ruta habitual te cobra $26.50 por litro, pero la abarrotera a 5 cuadras lo tiene en $24.30 en caja cerrada.',
      example: 'Leche entera 1 L: Ahorro de $26.40 por caja con entrega inmediata.',
    },
  ];

  const current = decisions.find((d) => d.id === selectedDecision) || decisions[0];

  return (
    <section className="py-16 md:py-24 bg-white border-b border-[#E2E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F5E9] text-[#0D6832] text-xs font-bold uppercase tracking-wider border border-[#C8E6C9]">
            <Cpu className="w-3.5 h-3.5 text-[#198754]" />
            <span>Filosofía Central de Producto</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1D20] tracking-tight">
            La IA hace el trabajo difícil.{' '}
            <span className="text-[#0F5132]">Tú tomas la decisión.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#5A626A] leading-relaxed">
            No tienes que convertirte en analista de datos ni pasar horas comparando folletos de proveedores. La plataforma hace todo el trabajo pesado para que tú solo tomes decisiones rápidas y acertadas.
          </p>
        </div>

        {/* 7 Core Action Words Strip */}
        <div className="max-w-5xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5A626A] block text-center mb-4">
            El trabajo que Abarrotes IA resuelve en segundo plano:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center">
            {capabilities.map((c, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8] shadow-2xs">
                <span className="text-xs font-extrabold text-[#0F5132] block">
                  {c.name}
                </span>
                <span className="text-[10px] text-[#5A626A] leading-tight block mt-0.5">
                  {c.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* The 5 Variables Math Integration Box */}
        <div className="max-w-5xl mx-auto bg-[#F8F9FA] rounded-3xl border border-[#E2E5E8] p-6 sm:p-10 mb-6">
          
          <span className="text-xs font-bold uppercase tracking-wider text-[#5A626A] block text-center mb-6">
            Variables evaluadas para encontrar la mejor opción disponible para TU tienda
          </span>

          {/* 5 Variable Badges in an equation format */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-[#1A1D20]">
            <div className="px-4 py-2 rounded-xl bg-white border border-[#E2E5E8] shadow-2xs">
              📦 Inventario actual
            </div>
            <span className="text-[#0F5132] font-black text-lg">+</span>
            <div className="px-4 py-2 rounded-xl bg-white border border-[#E2E5E8] shadow-2xs">
              📊 Ventas diarias
            </div>
            <span className="text-[#0F5132] font-black text-lg">+</span>
            <div className="px-4 py-2 rounded-xl bg-white border border-[#E2E5E8] shadow-2xs">
              🏷️ Precios de lista
            </div>
            <span className="text-[#0F5132] font-black text-lg">+</span>
            <div className="px-4 py-2 rounded-xl bg-white border border-[#E2E5E8] shadow-2xs">
              🎁 Promociones complejas
            </div>
            <span className="text-[#0F5132] font-black text-lg">+</span>
            <div className="px-4 py-2 rounded-xl bg-white border border-[#E2E5E8] shadow-2xs">
              ⚡ Velocidad de rotación
            </div>
          </div>

          <div className="text-center my-6">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0F5132] text-white shadow-sm font-black text-lg">
              ↓
            </span>
          </div>

          <div className="text-center font-extrabold text-xs sm:text-sm uppercase tracking-widest text-[#0F5132] mb-6">
            Respuesta Clara y Accionable en Pantalla
          </div>

          {/* Interactive 4 Decisions Switcher */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
            {decisions.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDecision(d.id)}
                className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
                  selectedDecision === d.id
                    ? `${d.btnClass} border-transparent shadow-sm scale-102`
                    : 'bg-white border-[#E2E5E8] text-[#5A626A] hover:bg-[#F1F3F5] hover:text-[#1A1D20]'
                }`}
              >
                “{d.label}”
              </button>
            ))}
          </div>

          {/* Active Decision Explanation Card */}
          <div className="bg-white rounded-2xl border border-[#E2E5E8] p-6 space-y-3 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E5E8] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold text-[#1A1D20]">
                  {current.title}
                </span>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-md font-bold border ${current.badgeClass}`}>
                {current.badge}
              </span>
            </div>

            <p className="text-sm sm:text-base text-[#1A1D20] leading-relaxed">
              {current.desc}
            </p>

            <div className="pt-2 text-xs font-semibold text-[#0F5132]">
              Ejemplo en tu mostrador: <span className="text-[#5A626A] font-normal">{current.example}</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
