import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Store, 
  Package, 
  Layers, 
  Info, 
  Copy, 
  Smartphone, 
  Clock, 
  ShieldCheck,
  Star,
  Phone,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';
import { InventoryItem, SupplierEntity, SmartPurchaseItem } from '../../types';

interface PurchasesSuppliersViewProps {
  inventory: InventoryItem[];
  suppliers: SupplierEntity[];
  onRecordPurchase: (productId: string, units: number, supplier: string, pricePaid: number, savings: number) => void;
}

export const PurchasesSuppliersView: React.FC<PurchasesSuppliersViewProps> = ({
  inventory,
  suppliers,
  onRecordPurchase,
}) => {
  const [activeTab, setActiveTab] = useState<'smart_orders' | 'suppliers' | 'compare'>('smart_orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || 'supp-1');
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [purchaseSuccessMsg, setPurchaseSuccessMsg] = useState<string | null>(null);

  // Derive smart purchase recommendations from inventory
  const [purchaseItems, setPurchaseItems] = useState<SmartPurchaseItem[]>(() => {
    return inventory
      .filter((item) => item.daysOfStock < 5.0)
      .map((item) => {
        const isCritical = item.daysOfStock < 2.5;
        const suggested = isCritical ? Math.max(12, Math.round(item.avgDailySales * 4)) : Math.max(6, Math.round(item.avgDailySales * 2));
        const unitSavings = Math.max(0, item.lastCostPaid - item.bestAvailablePrice);

        return {
          productId: item.id,
          productName: item.name,
          presentation: item.presentation,
          category: item.category,
          currentStock: item.currentStock,
          avgDailySales: item.avgDailySales,
          daysRemaining: item.daysOfStock,
          suggestedUnits: suggested,
          suggestedPackage: `${suggested} piezas con ${item.bestSupplier}`,
          bestSupplier: item.bestSupplier,
          unitPrice: item.bestAvailablePrice,
          totalInvestment: suggested * item.bestAvailablePrice,
          potentialSavings: suggested * unitSavings,
          priority: isCritical ? 'CRÍTICA' : 'SUGERIDA',
          reason: isCritical ? 'Riesgo de desabasto en < 48 horas' : 'Nivel bajo preventivo',
          selected: true,
        };
      });
  });

  const toggleItemSelection = (productId: string) => {
    setPurchaseItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectedItems = purchaseItems.filter((i) => i.selected);
  const totalInvestment = selectedItems.reduce((acc, curr) => acc + curr.totalInvestment, 0);
  const totalSavings = selectedItems.reduce((acc, curr) => acc + curr.potentialSavings, 0);

  const handleExecuteAllPurchases = () => {
    (selectedItems || []).forEach((item) => {
      onRecordPurchase(
        item.productId,
        item.suggestedUnits,
        item.bestSupplier,
        item.unitPrice,
        item.potentialSavings
      );
    });

    setPurchaseSuccessMsg(`¡Órdenes registradas! Agregamos ${selectedItems.length} productos al inventario en Kardex.`);
    setTimeout(() => setPurchaseSuccessMsg(null), 4000);
  };

  const handleCopyWhatsAppOrder = () => {
    const text = `*ORDEN DE COMPRA — ABARROTES LA LUPITA*\n` +
      `_Fecha: ${new Date().toLocaleDateString('es-MX')}_\n\n` +
      selectedItems.map((item, idx) => `${idx + 1}. *${item.productName}* (${item.presentation}) - *${item.suggestedUnits} pzas* (${item.bestSupplier})`).join('\n') +
      `\n\n*Inversión total est.: $${totalInvestment.toFixed(2)} MXN*\n` +
      `*Ahorro generado vs precio regular: $${totalSavings.toFixed(2)} MXN*\n\n` +
      `Generado con Abarrotes IA.`;

    navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20] tracking-tight">
            Compras Inteligentes & Proveedores
          </h1>
          <p className="text-xs sm:text-sm text-[#5A626A]">
            Optimiza tu capital de trabajo: compra lo necesario para rotar sin congelar dinero en anaquel.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#F8F9FA] p-1 rounded-2xl border border-[#E2E5E8]">
          <button
            onClick={() => setActiveTab('smart_orders')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'smart_orders'
                ? 'bg-[#0F5132] text-white shadow-2xs'
                : 'text-[#5A626A] hover:text-[#1A1D20]'
            }`}
          >
            Lista Sugerida ({selectedItems.length})
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'suppliers'
                ? 'bg-[#0F5132] text-white shadow-2xs'
                : 'text-[#5A626A] hover:text-[#1A1D20]'
            }`}
          >
            Directorio Proveedores ({suppliers.length})
          </button>
        </div>
      </div>

      {purchaseSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-[#0D6832] font-bold text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#198754] shrink-0" />
          <span>{purchaseSuccessMsg}</span>
        </div>
      )}

      {/* SUB-TAB 1: SMART PURCHASE ORDERS */}
      {activeTab === 'smart_orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Order Recommendations List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-[#E2E5E8] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E8]">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#0F5132]" />
                  <h3 className="font-extrabold text-base text-[#1A1D20]">
                    Sugerencias de Compra para Hoy ({purchaseItems.length})
                  </h3>
                </div>
                <span className="text-xs text-[#5A626A]">Basado en rotación real de 7 días</span>
              </div>

              <div className="space-y-3">
                {purchaseItems.map((item) => (
                  <div
                    key={item.productId}
                    onClick={() => toggleItemSelection(item.productId)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      item.selected
                        ? 'bg-emerald-50/70 border-[#0F5132] ring-1 ring-emerald-500/20'
                        : 'bg-[#F8F9FA] border-[#E2E5E8] opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => {}}
                        className="w-4 h-4 text-[#0F5132] rounded focus:ring-[#0F5132] cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#1A1D20]">{item.productName}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                            item.priority === 'CRÍTICA' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                        <div className="text-xs text-[#5A626A]">
                          Comprar: <strong className="text-[#1A1D20]">{item.suggestedUnits} pzas</strong> con {item.bestSupplier}
                        </div>
                        <div className="text-[11px] text-[#0D6832] font-semibold">
                          ${item.unitPrice.toFixed(2)}/u • Ahorras +${item.potentialSavings.toFixed(2)} MXN
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-[#1A1D20] tabular-nums">
                        ${item.totalInvestment.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-[#5A626A]">
                        Quedan {item.daysRemaining.toFixed(1)} días
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary & WhatsApp Export Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-[#E2E5E8] p-6 shadow-sm space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D6832]">
                Resumen de Orden Consolidada
              </span>

              {/* Total calculations */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E2E5E8]">
                  <div className="text-[10px] uppercase font-bold text-[#5A626A]">Inversión requerida</div>
                  <div className="text-xl font-black text-[#1A1D20] tabular-nums mt-0.5">
                    ${totalInvestment.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[#5A626A]">{selectedItems.length} productos</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] uppercase font-bold text-[#0D6832]">Ahorro neto total</div>
                  <div className="text-xl font-black text-[#0D6832] tabular-nums mt-0.5">
                    +${totalSavings.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[#0D6832] font-semibold">vs precios regulares</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleExecuteAllPurchases}
                  disabled={selectedItems.length === 0}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#0F5132] hover:bg-[#198754] disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Registrar Compra Completa en Kardex</span>
                </button>

                <button
                  onClick={handleCopyWhatsAppOrder}
                  disabled={selectedItems.length === 0}
                  className="w-full py-3 px-4 rounded-xl bg-[#F8F9FA] hover:bg-[#F1F3F5] border border-[#E2E5E8] text-[#1A1D20] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>{copiedMsg ? '¡Copiado al portapapeles!' : 'Copiar formato para WhatsApp'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E5E8] text-xs text-[#5A626A] space-y-1">
                <span className="font-bold text-[#1A1D20] block">Control de Flujo de Caja:</span>
                <p>
                  Estas cantidades aseguran 4 a 6 días de inventario sin comprometer dinero en productos lentos.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: SUPPLIERS DIRECTORY */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((supp) => (
              <div
                key={supp.id}
                className="bg-white rounded-3xl border border-[#E2E5E8] p-5 shadow-2xs space-y-4 flex flex-col justify-between hover:border-[#0F5132] transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-base text-[#1A1D20]">{supp.name}</h3>
                      <p className="text-xs text-[#5A626A]">{supp.category}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span className="text-xs font-black text-amber-900">{supp.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#5A626A] pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0F5132] shrink-0" />
                      <span>{supp.zone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#0F5132] shrink-0" />
                      <span>Visita: <strong>{supp.visitSchedule}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#0F5132] shrink-0" />
                      <span>{supp.contactName} ({supp.phone})</span>
                    </div>
                  </div>

                  {supp.notes && (
                    <div className="p-2.5 rounded-xl bg-[#F8F9FA] text-[11px] text-[#5A626A] border border-[#E2E5E8]">
                      💡 {supp.notes}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E2E5E8] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#5A626A] block text-[10px]">Fiabilidad entrega</span>
                    <strong className="text-[#0D6832] font-black">{supp.reliabilityScore}%</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[#5A626A] block text-[10px]">Catálogo activo</span>
                    <strong className="text-[#1A1D20] font-black">{supp.catalogCount} SKUs</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
