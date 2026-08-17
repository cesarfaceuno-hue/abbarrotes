import React from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  Share2, 
  Zap, 
  BarChart3, 
  ArrowRight,
  ShieldCheck,
  Activity,
  Database
} from 'lucide-react';
import { Inventory3DCanvas } from './3d/Inventory3DCanvas';
import { SuppliersNetwork3DCanvas } from './3d/SuppliersNetwork3DCanvas';
import { SavingsTorus3DCanvas } from './3d/SavingsTorus3DCanvas';
import { AnalyticsPrism3DCanvas } from './3d/AnalyticsPrism3DCanvas';

interface FeatureRowProps {
  index: number;
  canvas: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  cta?: string;
  metrics: { label: string; value: string; icon: any }[];
  id: string;
}

const FeatureRow: React.FC<FeatureRowProps> = ({ 
  index, 
  canvas, 
  eyebrow, 
  title, 
  description, 
  cta, 
  metrics,
  id 
}) => {
  const isEven = index % 2 === 0;

  return (
    <div id={id} className="py-24 sm:py-32 border-b border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: isEven ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`space-y-8 ${isEven ? 'order-1' : 'order-1 lg:order-2'}`}
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-[10px] font-black tracking-[0.2em] uppercase">
                <span>{eyebrow}</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white leading-none">
                {title}
              </h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
                {description}
              </p>
            </div>

            {/* Technical HUD Metrics */}
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <metric.icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{metric.label}</span>
                  </div>
                  <div className="text-xl font-black text-white">{metric.value}</div>
                </div>
              ))}
            </div>

            {cta && (
              <button className="group flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest hover:text-emerald-300 transition-colors">
                <span>{cta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </motion.div>

          {/* 3D Visualizer */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`relative rounded-3xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden p-4 sm:p-8 min-h-[360px] sm:min-h-[440px] flex items-center justify-center ${isEven ? 'order-2' : 'order-2 lg:order-1'}`}
          >
            {/* Specular Glows */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
            
            {canvas}

            {/* Internal HUD Overlays */}
            <div className="absolute top-6 left-6 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Live Visualizer // Stream_Active</span>
            </div>
            
            <div className="absolute bottom-6 right-6">
              <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/5 backdrop-blur-md">
                <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">Instance: Node_{id.toUpperCase()}</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export const FeaturesGridSection: React.FC = () => {
  const features = [
    {
      id: 'inventory',
      eyebrow: 'Módulo de Inventario',
      title: 'Control Volumétrico de Stock.',
      description: 'Nuestro motor de Kardex 3D no solo cuenta piezas; proyecta la velocidad de rotación para evitar capital estancado y mermas por caducidad.',
      cta: 'Ver sistema de rotación',
      canvas: <Inventory3DCanvas />,
      metrics: [
        { label: 'Precisión', value: '99.98%', icon: ShieldCheck },
        { label: 'Auditados', value: '1.2M+', icon: Database }
      ]
    },
    {
      id: 'suppliers',
      eyebrow: 'Red de Proveedores',
      title: 'Conexión Total con Mayoristas.',
      description: 'Sincronización en tiempo real con Central de Abastos, Scorpion y Zorro. Detectamos el mejor precio antes de que hagas el pedido.',
      cta: 'Explorar red mayorista',
      canvas: <SuppliersNetwork3DCanvas />,
      metrics: [
        { label: 'Nodos', value: '24 Hubs', icon: Share2 },
        { label: 'Latencia', value: '12ms', icon: Activity }
      ]
    },
    {
      id: 'savings',
      eyebrow: 'Optimización de Costos',
      title: 'Ingeniería de Ahorro Continuo.',
      description: 'Algoritmos de convergencia que analizan el histórico de compras para sugerir el volumen óptimo que maximiza tu retorno de caja.',
      cta: 'Ver motor de márgenes',
      canvas: <SavingsTorus3DCanvas />,
      metrics: [
        { label: 'ROI Promedio', value: '22.4%', icon: Zap },
        { label: 'Ahorro Net', value: '$8.4k/mes', icon: Package }
      ]
    },
    {
      id: 'analytics',
      eyebrow: 'Análisis Predictivo',
      title: 'Entiende tu Tienda en 3D.',
      description: 'Visualiza la salud financiera de tu negocio a través de prismas de datos. De reportes estáticos a inteligencia accionable de un vistazo.',
      cta: 'Abrir tablero táctico',
      canvas: <AnalyticsPrism3DCanvas />,
      metrics: [
        { label: 'Visualización', value: 'Real-time', icon: BarChart3 },
        { label: 'Predicción', value: '94% Conf.', icon: ShieldCheck }
      ]
    }
  ];

  return (
    <section id="features-system" className="scroll-mt-20 bg-[#07090E]">
      {features.map((feature, index) => (
        <FeatureRow 
          key={feature.id} 
          index={index} 
          {...feature} 
        />
      ))}
    </section>
  );
};
