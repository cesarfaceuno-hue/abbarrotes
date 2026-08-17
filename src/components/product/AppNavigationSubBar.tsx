import React from 'react';
import { 
  Sun, 
  Brain,
  Package, 
  ScanBarcode, 
  ShoppingCart, 
  Receipt,
  LineChart,
  Settings,
  ShieldCheck,
  Cpu,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductTab } from './NavigationBottomBar';

interface AppNavigationSubBarProps {
  activeTab: ProductTab;
  onSelectTab: (tab: ProductTab) => void;
  pendingAlertsCount: number;
  criticalStockCount: number;
  pendingMatchesCount: number;
}

export const AppNavigationSubBar: React.FC<AppNavigationSubBarProps> = ({
  activeTab,
  onSelectTab,
  pendingAlertsCount,
  criticalStockCount,
  pendingMatchesCount,
}) => {
  // Customer Menu items (Exact 4 options requested)
  const customerTabs = [
    { id: 'pos' as ProductTab, label: 'POS', icon: Receipt },
    { id: 'productos' as ProductTab, label: 'Productos', icon: ScanBarcode, badge: pendingMatchesCount > 0 ? pendingMatchesCount : undefined },
    { id: 'inventario' as ProductTab, label: 'Inventario', icon: Package, badge: criticalStockCount > 0 ? criticalStockCount : undefined },
    { id: 'reportes' as ProductTab, label: 'Reportes', icon: LineChart },
  ];

  const isBackOfficeActive = activeTab === 'backoffice' || activeTab === 'admin-panel';

  return (
    <div className="bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgb(0,0,0,0.02)] sticky top-16 sm:top-20 z-30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between gap-1.5 py-3 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 relative">
          
          {/* Customer Main Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <AnimatePresence>
              {customerTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id || 
                  (tab.id === 'pos' && activeTab === 'caja') || 
                  (tab.id === 'inventario' && activeTab === 'mi-tienda') || 
                  (tab.id === 'configuracion' && activeTab === 'settings') || 
                  (tab.id === 'mi-ia' && activeTab === 'admin-panel' && !isBackOfficeActive);

                return (
                  <button
                    key={tab.id}
                    onClick={() => onSelectTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-[13px] font-bold whitespace-nowrap transition-colors cursor-pointer relative z-10 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-tab-indicator"
                        className="absolute inset-0 bg-emerald-600 rounded-2xl -z-10 shadow-[0_4px_15px_rgb(16,185,129,0.3)]"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <motion.span 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                          isActive ? 'bg-white/20 text-white' : 'bg-rose-500 text-white shadow-xs'
                        }`}
                      >
                        {tab.badge}
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Separate Back Office Entry Point */}
          <div className="pl-3 border-l border-slate-200 flex items-center shrink-0">
            <button
              onClick={() => onSelectTab('backoffice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isBackOfficeActive
                  ? 'bg-slate-950 text-emerald-400 ring-2 ring-emerald-500/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white shadow-xs'
              }`}
              title="Abarrotes1 Back Office - Administración Técnica"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Back Office</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
