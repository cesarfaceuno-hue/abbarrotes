import React, { useEffect, useState } from 'react';
import { RefreshCw, Play, CheckCircle, AlertTriangle, XCircle, Clock, Activity, Database, ShoppingCart, Box, AlertOctagon, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export function LiveDataAcquisitionMonitor() {
  const [sources, setSources] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (showLoader = true) => {
    if (showLoader && !sources.length) setLoading(true);
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/live-data/monitor');
      const data = await res.json();
      setSources(data.sources);
      setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const triggerRun = async (sourceId: string) => {
    try {
      await fetch('/api/live-data/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId })
      });
      fetchData(false);
    } catch (err) {
      console.error(err);
    }
  };

  const renderStatusIcon = (status: string, health: number) => {
    if (status === 'ACTIVE' && health >= 90) return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (status === 'ACTIVE' && health >= 50) return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    return <XCircle className="w-5 h-5 text-rose-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8 text-emerald-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-7xl mx-auto space-y-10"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-slate-900 tracking-tight"
          >
            Monitor de Inteligencia
          </motion.h2>
          <p className="text-lg text-slate-500 mt-2 font-medium">
            Adquisición de precios en vivo para Ciudad de México.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fetchData(true)}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/70 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl text-sm font-bold text-slate-800 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Sincronizar ahora</span>
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard title="Fuentes Activas" value={stats.activeSources || 0} icon={Database} delay={0.1} />
        <StatCard title="Productos Rastreados" value={stats.productsAcquired || 0} icon={Box} delay={0.2} />
        <StatCard title="Precios Actualizados" value={stats.pricesUpdated || 0} icon={TrendingUp} delay={0.3} />
        <StatCard 
          title="Anomalías Detectadas" 
          value={stats.priceAnomalies || 0} 
          icon={AlertOctagon} 
          delay={0.4} 
          highlight={stats.priceAnomalies > 0} 
        />
      </div>

      {/* Sources Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-slate-200/50 flex justify-between items-center bg-white/40">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Proveedores Conectados
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Proveedor</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Salud de Conexión</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Última Lectura</th>
                <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {sources.map((src, i) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  key={i} 
                  className="hover:bg-white/80 transition-colors group"
                >
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-base">{src.name}</span>
                      <span className="text-sm text-slate-500 font-medium">{src.officialDomain}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {renderStatusIcon(src.accessStatus, src.healthScore)}
                      <span className="text-sm font-bold text-slate-700 capitalize">{src.accessStatus.toLowerCase()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-100 rounded-full h-2 max-w-[120px] overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${src.healthScore}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${src.healthScore >= 90 ? 'bg-emerald-500' : src.healthScore >= 50 ? 'bg-amber-400' : 'bg-rose-500'}`} 
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{src.healthScore}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-slate-600">
                      <Clock className="w-4 h-4 mr-2 text-slate-400" />
                      {src.lastSuccessfulRun ? new Date(src.lastSuccessfulRun).toLocaleString('es-MX', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: 'short' }) : 'Pendiente'}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => triggerRun(src.id)} 
                      className="inline-flex items-center justify-center px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-sm transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Play className="w-4 h-4 mr-1.5 fill-current" /> Extraer
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, delay = 0, highlight = false }: { title: string, value: number | string, icon: React.ComponentType<{ className?: string }>, delay?: number, highlight?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-3xl flex flex-col justify-between ${highlight ? 'bg-rose-50 border border-rose-100/50' : 'bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${highlight ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</h3>
        <motion.p 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 0.2, type: "spring" }}
          className={`text-4xl font-black tracking-tight ${highlight ? 'text-rose-600' : 'text-slate-900'}`}
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  );
}
