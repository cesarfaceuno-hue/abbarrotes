import React, { useState } from 'react';
import { 
  Package, 
  Compass, 
  TrendingUp, 
  BarChart3, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Coins,
  Cpu
} from 'lucide-react';
import { Inventory3DCanvas } from './Inventory3DCanvas';
import { SuppliersNetwork3DCanvas } from './SuppliersNetwork3DCanvas';
import { SavingsTorus3DCanvas } from './SavingsTorus3DCanvas';
import { AnalyticsPrism3DCanvas } from './AnalyticsPrism3DCanvas';

interface VisualNarrative3DSectionProps {
  onOpenTrialModal: () => void;
}

export const VisualNarrative3DSection: React.FC<VisualNarrative3DSectionProps> = ({ onOpenTrialModal }) => {
  const [activeNarrative, setActiveNarrative] = useState<'inventory' | 'suppliers' | 'savings' | 'analytics'>('inventory');

  return (
    <section 
      id="narrativa-3d" 
      className="relative py-28 bg-[#0B0F17] text-white overflow-hidden border-b border-slate-800/80"
    >
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-20">
        
        {/* Section Lead */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Descomposición Dimensional del Negocio</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Cada dimensión de tu tienda,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              optimizada con precisión física.
            </span>
          </h2>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            El sistema de inteligencia descompone el flujo operativo en 4 pilares fundamentales: inventario volumétrico, red mayorista, retorno de caja y analítica predictiva.
          </p>
        </div>

        {/* Feature 1: INVENTORY (3D Stacked Volumetric Product Blocks) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-slate-900/40 rounded-3xl p-6 sm:p-10 border border-slate-800 backdrop-blur-sm">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold uppercase">
              <Package className="w-4 h-4" />
              <span>01 • INVENTARIO VOLUMÉTRICO</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Control físico de existencias. Cero capital congelado en anaquel.
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              El motor calcula la velocidad de rotación real de cada SKU. Distingue productos de alta tracción (Coca-Cola, Lala, Aceite) de artículos de baja rotación, alertándote antes de que se produzca un desabasto o sobrestock.
            </p>

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Semáforo tridimensional de riesgo de desabasto (48h / 72h / 7 días).</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Kardex automatizado por lector de código de barras o registro táctil.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sugerencia exacta de piezas a comprar para no ahogar el flujo de caja.</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 flex items-center justify-center relative">
            <div className="w-full max-w-md p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800 font-mono">
                <span>MATRIZ_INVENTARIO_3D</span>
                <span className="text-emerald-400">ROTACIÓN: 6.4 DÍAS</span>
              </div>
              <Inventory3DCanvas />
              <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Óptimo</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Reorden</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Crítico</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: SUPPLIERS (Connected 3D Nodes) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-slate-900/40 rounded-3xl p-6 sm:p-10 border border-slate-800 backdrop-blur-sm">
          <div className="lg:col-span-6 order-2 lg:order-1 flex items-center justify-center relative">
            <div className="w-full max-w-md p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800 font-mono">
                <span>RED_NODAL_MAYORISTA_CDMX</span>
                <span className="text-cyan-400">4 NODOS ACTIVOS</span>
              </div>
              <SuppliersNetwork3DCanvas />
              <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span className="text-emerald-400">Central de Abastos</span>
                <span className="text-sky-400">Scorpion</span>
                <span className="text-amber-400">Zorro</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-bold uppercase">
              <Compass className="w-4 h-4" />
              <span>02 • RED NEURAL DE PROVEEDORES</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Conexión directa con la Central de Abastos, Scorpion y Zorro.
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Compara precios de mayoreo actualizados todos los días a las 06:00 AM. El sistema calcula el costo unitario por bulto, caja o paquete, ponderando flete y distancia para decirte exactamente dónde te conviene surtir.
            </p>

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Auditoría de más de 2,400 cotizaciones mayoristas en tiempo real.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Detección de ofertas por volumen (ej. 3x2, descuentos por bulto cerrado).</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Historial de variaciones de costo para anticipar alzas de la canasta básica.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 3: SAVINGS (Flowing Refractive Torus) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-slate-900/40 rounded-3xl p-6 sm:p-10 border border-slate-800 backdrop-blur-sm">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold uppercase">
              <Coins className="w-4 h-4" />
              <span>03 • MOTOR DE EXPANSIÓN DE MARGEN</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Convierte compras inteligentes en dinero líquido en tu cuenta.
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Un tendero promedio pierde entre $1,200 y $3,500 MXN mensuales simplemente por comprarle por inercia al mismo preventista o repartidor. Nuestro bucle económico optimiza cada compra para ensanchar el margen bruto de 18% a más del 28%.
            </p>

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ahorro promedio verificado: $1,247.50 MXN al mes por tienda.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Recomendación precisa de precio de venta en mostrador para no perder clientes.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Calculadora de combos y promociones locales (ej. Refresco + Botana).</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 flex items-center justify-center relative">
            <div className="w-full max-w-md p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800 font-mono">
                <span>BUCLE_ECONÓMICO_3D</span>
                <span className="text-emerald-400">+28.4% MARGEN EFECTIVO</span>
              </div>
              <SavingsTorus3DCanvas />
              <div className="text-center text-xs text-emerald-400 font-bold pt-2 border-t border-slate-800">
                Transformación de Costo Habitual → Margen Protegido
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4: ANALYTICS (3D Data Prisms) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-slate-900/40 rounded-3xl p-6 sm:p-10 border border-slate-800 backdrop-blur-sm">
          <div className="lg:col-span-6 order-2 lg:order-1 flex items-center justify-center relative">
            <div className="w-full max-w-md p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800 font-mono">
                <span>PRISMAS_DE_DEMANDA_3D</span>
                <span className="text-sky-400">TELEMETRÍA EN VIVO</span>
              </div>
              <AnalyticsPrism3DCanvas />
              <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Bebidas</span>
                <span>Botanas</span>
                <span>Abarrotes</span>
                <span>Limpieza</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-950/80 border border-sky-800 text-sky-400 text-xs font-bold uppercase">
              <BarChart3 className="w-4 h-4" />
              <span>04 • ANALÍTICA DE DEMANDA Y TENDENCIAS</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Comprende los patrones de compra de tu colonia.
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Métricas claras y sin tecnicismos que te dicen cuáles días se venden más refrescos, cuándo surtir botanas para el fin de semana y qué productos están perdiendo tracción en anaquel.
            </p>

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Previsión de demanda para fines de semana, quincenas y festividades.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Historial de tickets y promedio de compra por cliente.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Exportación instantánea a hojas de cálculo o respaldo en la nube.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
};
