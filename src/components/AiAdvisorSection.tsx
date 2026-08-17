import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Cpu, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Database,
  BarChart3,
  LineChart,
  ShoppingCart
} from 'lucide-react';
import { AiAdvisor3DCanvas } from './3d/AiAdvisor3DCanvas';

export const AiAdvisorSection: React.FC = () => {
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showInsight, setShowInsight] = useState(false);

  useEffect(() => {
    // Simulate the Intelligence Loop on entry
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 1) {
            clearInterval(interval);
            setShowInsight(true);
            return 1;
          }
          return prev + 0.01;
        });
      }, 30);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="ai-advisor" className="relative py-32 bg-[#07090E] text-white overflow-hidden border-b border-white/5">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Context & Copy */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-[0.2em] uppercase"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Intelligence in Motion</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-[1.1]"
            >
              Turn store complexity into <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">absolute clarity.</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg sm:text-xl font-medium leading-relaxed"
            >
              Tu asesor de IA no es un chatbot. Es una entidad cognitiva que procesa inventario, ruteo de mayoristas y márgenes en milisegundos para entregarte decisiones de alta rentabilidad.
            </motion.p>

            {/* Benefits List */}
            <div className="space-y-6 pt-4">
              {[
                { 
                  icon: TrendingUp, 
                  title: 'Detectar Oportunidades', 
                  desc: 'Escanea miles de SKUs para encontrar ahorros en la Central de Abastos y mayoristas.',
                  color: 'text-emerald-400'
                },
                { 
                  icon: BarChart3, 
                  title: 'Entender tus Márgenes', 
                  desc: 'Visualiza la rentabilidad real de cada producto considerando mermas y costos ocultos.',
                  color: 'text-cyan-400'
                },
                { 
                  icon: Zap, 
                  title: 'Actuar más Rápido', 
                  desc: 'Recibe recomendaciones accionables directo en tu terminal, sin análisis manual.',
                  color: 'text-emerald-400'
                },
              ].map((benefit, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="flex gap-5 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:border-emerald-500/30 transition-all">
                    <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                  </div>
                  <div>
                    <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">{benefit.title}</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="pt-8"
            >
              <button className="group px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all flex items-center gap-3">
                <span>Conocer al Asesor</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* Right Column: AI 3D Scene */}
          <div className="relative flex items-center justify-center min-h-[500px] lg:min-h-[600px]">
            {/* 3D Canvas */}
            <AiAdvisor3DCanvas 
              className="w-full h-full" 
              progress={analysisProgress}
            />

            {/* Floating Data Elements (Visual Hints) */}
            <AnimatePresence>
              {!showInsight && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[
                    { icon: ShoppingCart, label: 'Stock', x: '20%', y: '30%', delay: 0.1 },
                    { icon: Database, label: 'Costos', x: '75%', y: '25%', delay: 0.3 },
                    { icon: LineChart, label: 'Márgenes', x: '15%', y: '70%', delay: 0.5 },
                    { icon: ShieldCheck, label: 'Seguridad', x: '80%', y: '65%', delay: 0.7 },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: analysisProgress > 0.8 ? 0 : 0.6, 
                        scale: analysisProgress > 0.8 ? 0.5 : 1,
                        x: analysisProgress > 0.8 ? '50%' : item.x,
                        y: analysisProgress > 0.8 ? '50%' : item.y
                      }}
                      className="absolute p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2 backdrop-blur-md"
                      style={{ left: item.x, top: item.y }}
                    >
                      <item.icon className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* AI Insight Card: The Recommendation */}
            <AnimatePresence>
              {showInsight && (
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.9, rotateX: 20 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                  className="absolute bottom-10 sm:bottom-20 right-0 sm:right-10 w-full max-w-[320px] p-6 rounded-[32px] border border-emerald-500/30 bg-[#07090E]/80 backdrop-blur-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/5 z-20"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">AI Strategy Detected</span>
                      <span className="text-xs font-bold text-slate-400 uppercase">Optimization Engine</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Potential Savings</span>
                      <div className="text-3xl font-black text-emerald-400 tracking-tighter">
                        $2,840<span className="text-sm text-emerald-400/50">.00</span>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
                      "Detecté una oportunidad de compra consolidada en Aceite Nutrioli 1L. Comprando 12 cajas hoy en Central de Abastos, optimizas tu margen un 14.5%."
                    </p>

                    <button className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                      <span>Ver Análisis Completo</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};
