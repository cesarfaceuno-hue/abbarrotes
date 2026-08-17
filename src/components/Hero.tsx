import React from 'react';
import { ArrowRight, Sparkles, Activity, ShieldCheck, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { Hero3DCanvas } from './3d/Hero3DCanvas';

interface HeroProps {
  onOpenTrialModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenTrialModal }) => {
  return (
    <section className="relative overflow-hidden min-h-[95vh] bg-[#07090E] text-white flex items-center border-b border-slate-800/80">
      {/* Deep Space / Atmospheric Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/20 via-[#07090E] to-[#07090E] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          
          {/* Left Column: UI & Typography */}
          <div className="lg:col-span-6 space-y-10 relative z-20">
            {/* Top Label */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-bold tracking-wider uppercase backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Inteligencia de Retail Autónoma</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.05]"
            >
              El núcleo operativo de <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400">
                tu negocio inteligente.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-400 font-medium leading-relaxed max-w-xl"
            >
              Infraestructura dimensional que unifica inventario volumétrico, ruteo de compras mayoristas y telemetría predictiva. Toma decisiones físicas con precisión digital.
            </motion.p>

            {/* CTA Group */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-5"
            >
              <button
                onClick={onOpenTrialModal}
                className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg shadow-[0_0_50px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98] cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10">Acceder al Sistema</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#product-showcase-3d"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl bg-slate-900/40 hover:bg-slate-800 text-white border border-slate-800 font-bold text-lg transition-all text-center backdrop-blur-md"
              >
                <span>Explorar Arquitectura</span>
              </a>
            </motion.div>
            
            {/* Stats/Metrics subtle strip */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="pt-12 flex items-center gap-10 border-t border-slate-800/80"
            >
              <div className="space-y-1">
                <strong className="block text-3xl font-black text-white">18.4%</strong>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Ahorro Promedio</span>
              </div>
              <div className="w-px h-10 bg-slate-800/80" />
              <div className="space-y-1">
                <strong className="block text-3xl font-black text-white">42ms</strong>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Latencia Core</span>
              </div>
              <div className="w-px h-10 bg-slate-800/80" />
              <div className="space-y-1">
                <strong className="block text-3xl font-black text-white">100%</strong>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">SLA Garantizado</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive 3D Hero Element + HUD */}
          <div className="lg:col-span-6 relative h-[500px] lg:h-[800px] -mx-4 sm:mx-0 flex items-center justify-center">
            
            {/* HUD: Floating Telemetry Elements */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              {/* Telemetry 1: Status */}
              <motion.div 
                animate={{ y: [0, -15, 0], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[15%] right-[10%] p-3 rounded-xl border border-emerald-500/20 bg-[#07090E]/60 backdrop-blur-lg flex items-center gap-3 shadow-2xl"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">System Status</span>
                  <span className="text-xs font-bold text-white">AUTONOMOUS_RUNNING</span>
                </div>
              </motion.div>

              {/* Telemetry 2: Latency */}
              <motion.div 
                animate={{ y: [0, 15, 0], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[25%] left-[5%] p-3 rounded-xl border border-cyan-500/20 bg-[#07090E]/60 backdrop-blur-lg flex items-center gap-3 shadow-2xl"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-tighter">API Latency</span>
                  <span className="text-xs font-bold text-white">42ms RESPONSE</span>
                </div>
              </motion.div>

              {/* Telemetry 3: Integrity */}
              <motion.div 
                animate={{ x: [0, 10, 0], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-[45%] left-[15%] p-3 rounded-xl border border-slate-500/20 bg-[#07090E]/40 backdrop-blur-md flex items-center gap-3 shadow-xl"
              >
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Data Integrity: 100%</span>
              </motion.div>

              {/* Telemetry 4: Cloud Sync */}
              <motion.div 
                animate={{ y: [0, -10, 0], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-[10%] right-[20%] p-3 rounded-xl border border-emerald-500/10 bg-[#07090E]/40 backdrop-blur-sm flex items-center gap-3"
              >
                <Database className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Multi-Tenant Sync</span>
              </motion.div>
            </div>

            {/* 3D Canvas wrapper */}
            <div className="absolute inset-0 z-10">
               <Hero3DCanvas />
            </div>

            {/* Subtle Gradient Glow behind 3D */}
            <div className="absolute w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] z-0 opacity-40" />
          </div>

        </div>
      </div>
    </section>
  );
};

