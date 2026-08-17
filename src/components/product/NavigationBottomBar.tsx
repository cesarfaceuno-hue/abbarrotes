import React from 'react';
import { 
  Sun, 
  Brain,
  Package, 
  ScanBarcode, 
  ShoppingCart, 
  TrendingUp, 
  Sparkles, 
  Receipt, 
  LineChart, 
  Settings,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export type ProductTab = 
  | 'inicio' 
  | 'pos'
  | 'caja'
  | 'productos'
  | 'inventario'
  | 'mi-tienda'
  | 'compras' 
  | 'mi-ia'
  | 'reportes'
  | 'configuracion'
  | 'settings'
  | 'backoffice'
  | 'admin-panel';

interface NavigationBottomBarProps {
  activeTab: ProductTab;
  onSelectTab: (tab: ProductTab) => void;
  pendingAlertsCount: number;
  criticalStockCount: number;
}

export const NavigationBottomBar: React.FC<NavigationBottomBarProps> = ({
  activeTab,
  onSelectTab,
  pendingAlertsCount,
  criticalStockCount,
}) => {
  const primaryMobileTabs = [
    {
      id: 'inicio' as ProductTab,
      label: 'Inicio',
      icon: Sun,
    },
    {
      id: 'productos' as ProductTab,
      label: 'Productos',
      icon: Package,
      badge: criticalStockCount > 0 ? criticalStockCount : undefined,
    },
    {
      id: 'pos' as ProductTab,
      label: 'POS',
      icon: Receipt,
      highlight: true,
    },
    {
      id: 'compras' as ProductTab,
      label: 'Compras',
      icon: ShoppingCart,
    },
    {
      id: 'mi-ia' as ProductTab,
      label: 'Mi IA',
      icon: Brain,
      badge: pendingAlertsCount > 0 ? pendingAlertsCount : undefined,
    },
  ];

  return (
    <div className="sticky bottom-0 z-40 bg-white border-t border-[#E2E5E8] shadow-lg">
      <div className="max-w-5xl mx-auto px-2 sm:px-6">
        <nav className="flex items-center justify-around py-1.5 sm:py-2">
          {primaryMobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || 
              (tab.id === 'pos' && activeTab === 'caja') || 
              (tab.id === 'mi-ia' && activeTab === 'admin-panel');

            if (tab.highlight) {
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className="flex flex-col items-center justify-center -mt-5 group cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-transform group-active:scale-95 ${
                      isActive
                        ? 'bg-[#0F5132] text-white ring-4 ring-emerald-500/20'
                        : 'bg-[#0F5132] text-white hover:bg-[#198754]'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-1 ${
                      isActive ? 'text-[#0F5132]' : 'text-[#5A626A]'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 sm:px-3 rounded-xl transition-all cursor-pointer relative ${
                  isActive
                    ? 'text-[#0F5132] font-extrabold bg-emerald-50/80'
                    : 'text-[#5A626A] hover:text-[#1A1D20] hover:bg-[#F8F9FA]'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#0F5132]' : 'text-[#5A626A]'}`} />
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                  <span className="text-[11px] tracking-tight mt-1 whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
