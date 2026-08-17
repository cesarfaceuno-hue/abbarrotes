import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Package, 
  Compass, 
  DollarSign, 
  ArrowUpRight,
  Cpu,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Showcase3DBackground } from './Showcase3DBackground';

interface ProductShowcase3DSectionProps {
  onOpenAppView?: () => void;
  onOpenTrialModal: () => void;
}

export const ProductShowcase3DSection: React.FC<ProductShowcase3DSectionProps> = ({
  onOpenAppView,
  onOpenTrialModal
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'pos' | 'inventario' | 'ia'>('radar');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: x * 6, y: -y * 6 });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section 
      id="product-showcase-3d" 
      className="relative py-32 bg-[#07090E] text-white overflow-hidden border-t border-b border-white/5"
    >
      {/* Cinematic Background Canvas */}
      <Showcase3DBackground />

      {/* Atmospheric Depth Glows (Synced with Hero) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header: Premium & Minimal */}
        <div className="text-center max-w-4xl mx-auto mb-20 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-[0.2em] uppercase"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Product Infrastructure Showcase</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-[1.1]"
          >
            El cerebro de tu tienda,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400">
              proyectado en 3D real.
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg sm:text-xl font-medium leading-relaxed max-w-3xl mx-auto"
          >
            Nuestra arquitectura dimensional no es solo visual; es el motor que procesa miles de puntos de datos de mayoristas y mermas para entregarte rentabilidad pura en cada ticket.
          </motion.p>

          {/* Technological Navigation: High Precision Pills */}
          <div className="pt-8 flex flex-wrap justify-center gap-3">
            {[
              { id: 'radar', icon: Compass, label: 'Radar Mayorista' },
              { id: 'inventario', icon: Package, label: 'Kardex 3D' },
              { id: 'pos', icon: DollarSign, label: 'Terminal POS' },
              { id: 'ia', icon: Cpu, label: 'Asesor IA' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative group px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-3 cursor-pointer overflow-hidden ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-slate-950' : 'text-emerald-500'}`} />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="tab-highlight"
                    className="absolute inset-0 bg-white/20 mix-blend-overlay"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Floating Stage: The Refractive Glass Slab */}
        <div 
          className="relative perspective-[2000px] flex justify-center py-10"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Specular Aura Glow */}
          <div className="absolute -inset-10 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-emerald-500/10 rounded-[40px] blur-3xl opacity-40 animate-pulse" />

          {/* Master 3D Board: Refractive Emerald Glass Aesthetic */}
          <motion.div 
            className="relative w-full max-w-5xl rounded-[32px] border border-white/10 bg-[#07090E]/60 backdrop-blur-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden ring-1 ring-white/5"
            style={{
              rotateY: mousePos.x,
              rotateX: mousePos.y,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Top Technical Bar (SaaS HUD Style) */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40 border border-rose-500/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40 border border-amber-500/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 border border-emerald-500/20" />
                </div>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase">System Core v3.7 // Terminal Instance</span>
              </div>

              <div className="hidden sm:flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-400/80 uppercase tracking-tighter">Latency: 18ms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] font-black text-cyan-400/80 uppercase tracking-tighter">Sync: ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Dashboard Content Matrix */}
            <div className="p-8 sm:p-12 min-h-[480px] flex flex-col">
              <AnimatePresence mode="wait">
                {activeTab === 'radar' && (
                  <motion.div 
                    key="radar"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8 flex-1"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { title: 'Central de Abastos', price: '$29.50', old: '$35.00', savings: '-18.4%', label: 'Azúcar Zulka 1kg', color: 'emerald' },
                        { title: 'Scorpion Mayorista', price: '$32.50', old: '$37.00', savings: '-12.2%', label: 'Aceite Nutrioli 1L', color: 'cyan' },
                        { title: 'Zorro Abarrotero', price: '$18.50', old: '$21.70', savings: '-14.8%', label: 'Jabón Zote 400g', color: 'emerald' },
                      ].map((card, i) => (
                        <div key={i} className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-all shadow-xl">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                            <span>{card.title}</span>
                            <span className="text-emerald-400">{card.savings}</span>
                          </div>
                          <h4 className="text-xl font-black text-white mb-4">{card.label}</h4>
                          <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-black text-emerald-400">{card.price}</span>
                            <span className="text-sm text-slate-600 line-through font-bold">{card.old}</span>
                          </div>
                          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase">ROI Proyectado</span>
                            <span className="text-[10px] font-black text-emerald-400">+22.4%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Live Telemetry Stream */}
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 font-mono text-[11px] leading-relaxed">
                      <div className="flex items-center justify-between text-slate-500 mb-4 border-b border-white/5 pb-4">
                        <span className="flex items-center gap-3">
                          <Database className="w-4 h-4 text-emerald-500" />
                          <span className="font-black uppercase tracking-[0.2em]">Live Acquisition Data Stream</span>
                        </span>
                        <span className="text-emerald-500 font-black">STABLE // 2,480 AUDITS</span>
                      </div>
                      <div className="space-y-1.5 opacity-60">
                        <p><span className="text-slate-600">[06:30:12]</span> <span className="text-emerald-500 font-bold">MATCH_SYNC:</span> SKU_7501000111204 - Coca-Cola 600ml - Sync Zorro vs Scorpion</p>
                        <p><span className="text-slate-600">[06:30:15]</span> <span className="text-cyan-500 font-bold">INSIGHT_GEN:</span> Margen sugerido: 28% para competencia local en ruteo CDMX</p>
                        <p><span className="text-slate-600">[06:30:18]</span> <span className="text-emerald-500 font-bold">OPPORTUNITY:</span> Desvío de compra detectado - Ahorro potencial: $184.50</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'inventario' && (
                  <motion.div 
                    key="inventario"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8 flex-1"
                  >
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: 'Valor Activo', value: '$48,250', sub: 'Capital de trabajo', icon: Database, color: 'emerald' },
                        { label: 'Días de Stock', value: '6.4 días', sub: 'Rotación saludable', icon: RefreshCw, color: 'emerald' },
                        { label: 'Reorden', value: '2 SKU', sub: 'Nivel crítico', icon: ShieldCheck, color: 'cyan' },
                        { label: 'Margen Bruto', value: '28.4%', sub: 'Retorno neto', icon: TrendingUp, color: 'emerald' },
                      ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between h-36">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
                            <stat.icon className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div>
                            <span className="text-2xl font-black text-white block">{stat.value}</span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{stat.sub}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-8 rounded-2xl bg-black/40 border border-white/5 space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Kardex Log // Interfaz Dimensional</h4>
                      <div className="space-y-4 font-mono text-[11px]">
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                          <span className="text-slate-500">[14:15] VENTA_TICKET_2041 - Coca-Cola 600ml (x2)</span>
                          <span className="text-emerald-400 font-black">+$48.00 MXN</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                          <span className="text-slate-500">[13:40] COMPRA_IN_ZORRO - Nutrioli 1L (x24)</span>
                          <span className="text-cyan-400 font-black">-$780.00 MXN</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'pos' && (
                  <motion.div 
                    key="pos"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1"
                  >
                    <div className="lg:col-span-8 p-8 rounded-2xl bg-white/[0.03] border border-white/5 space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Checkout Terminal // Mostrador</h4>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black">3 ITEMS</span>
                      </div>
                      <div className="space-y-3">
                        <div className="p-5 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                          <div>
                            <span className="text-sm font-black text-white block">Coca-Cola 600ml NR</span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase">2 UNIDADES x $18.00</span>
                          </div>
                          <span className="text-lg font-black text-emerald-400">$36.00</span>
                        </div>
                        <div className="p-5 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
                          <div>
                            <span className="text-sm font-black text-white block">Sabritas Sal 45g</span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase">1 UNIDAD x $20.00</span>
                          </div>
                          <span className="text-lg font-black text-emerald-400">$20.00</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-4 p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col justify-between gap-10">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 mb-2 block">Total Due</span>
                        <div className="text-5xl font-black text-white tracking-tighter">
                          $56<span className="text-xl text-slate-500">.00</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Margen: 28.5%</span>
                        </div>
                      </div>
                      <button
                        onClick={onOpenTrialModal}
                        className="group w-full py-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-3"
                      >
                        <span>Finalizar Venta</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'ia' && (
                  <motion.div 
                    key="ia"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8 flex-1"
                  >
                    <div className="p-10 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                      <div className="flex items-center gap-3 text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
                        <Cpu className="w-5 h-5" />
                        <span>AI Cognitive Advisor // Insight Generation</span>
                      </div>
                      <p className="text-xl sm:text-2xl text-slate-200 font-bold leading-relaxed italic">
                        "El análisis dimensional sugiere una adquisición de 2 bultos de azúcar Zulka en Central de Abastos hoy. Ahorro proyectado: $550 MXN. Nivel de confianza: 98%."
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {[
                        { label: 'Ahorro Acumulado', value: '$1,247.50', icon: DollarSign },
                        { label: 'Insights Ejecutados', value: '42 Decisiones', icon: Zap },
                        { label: 'Tiempo Recuperado', value: '45 min/día', icon: RefreshCw },
                      ].map((card, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <card.icon className="w-6 h-6 text-emerald-500" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{card.label}</span>
                            <span className="text-lg font-black text-white">{card.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Technical Footer */}
            <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Multi-tenant Isolation Architecture // AES-256</span>
              </div>

              <div className="flex items-center gap-4">
                {onOpenAppView && (
                  <button
                    onClick={onOpenAppView}
                    className="group px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 border border-white/5"
                  >
                    <span>Abrir Consola de Tienda</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
                <button
                  onClick={onOpenTrialModal}
                  className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-widest shadow-xl transition-all cursor-pointer"
                >
                  Desplegar Ahora
                </button>
              </div>
            </div>

          </motion.div>
        </div>

      </div>
    </section>
  );
};
