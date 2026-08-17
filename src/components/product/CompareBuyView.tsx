import React, { useState } from 'react';
import { Search, Filter, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Store, Package, Layers, Info, ShoppingCart, Plus } from 'lucide-react';
import { InventoryItem } from '../../types';

interface CompareBuyViewProps {
  inventory: InventoryItem[];
  initialSearchQuery?: string;
  onRecordPurchase: (productId: string, units: number, supplier: string, pricePaid: number, savings: number) => void;
}

export const CompareBuyView: React.FC<CompareBuyViewProps> = ({
  inventory,
  initialSearchQuery = '',
  onRecordPurchase,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedProductId, setSelectedProductId] = useState<string>(inventory[0]?.id || 'prod-1');
  const [purchaseUnits, setPurchaseUnits] = useState<number>(24);
  const [purchaseSuccessMsg, setPurchaseSuccessMsg] = useState<string | null>(null);

  const categories = ['Todos', 'Bebidas', 'Lácteos', 'Botanas', 'Limpieza', 'Abarrotes', 'Panadería'];

  const filteredItems = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentItem = inventory.find((i) => i.id === selectedProductId) || inventory[0];

  const handlePurchase = (supplierName: string, pricePerUnit: number) => {
    const regularCost = currentItem.lastCostPaid * purchaseUnits;
    const actualCost = pricePerUnit * purchaseUnits;
    const savings = Math.max(0, regularCost - actualCost);

    onRecordPurchase(currentItem.id, purchaseUnits, supplierName, pricePerUnit, savings);
    setPurchaseSuccessMsg(`¡Compra registrada! Agregamos ${purchaseUnits} pzas de ${currentItem.name} al inventario.`);
    setTimeout(() => setPurchaseSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20] tracking-tight">
            Comparador de Precios y Proveedores
          </h1>
          <p className="text-xs sm:text-sm text-[#5A626A]">
            Encuentra la mejor opción disponible para TU tienda según rotación, volumen y distancia.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#5A626A] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2E5E8] bg-white text-xs sm:text-sm focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] outline-none"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#0F5132] text-white shadow-2xs'
                : 'bg-white border border-[#E2E5E8] text-[#5A626A] hover:bg-[#F8F9FA] hover:text-[#1A1D20]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {purchaseSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-[#0D6832] font-bold text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#198754] shrink-0" />
          <span>{purchaseSuccessMsg}</span>
        </div>
      )}

      {/* Two Column Layout: Product List & Detailed Price Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Product Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          <div className="text-xs font-bold uppercase tracking-wider text-[#5A626A] px-1">
            Productos ({filteredItems.length})
          </div>

          {filteredItems.map((item) => {
            const isSelected = item.id === currentItem?.id;
            const savingsPerUnit = item.lastCostPaid - item.bestAvailablePrice;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedProductId(item.id);
                  setPurchaseUnits(item.rotation === 'Alta' ? 24 : 12);
                }}
                className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-50/90 border-[#0F5132] ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white border-[#E2E5E8] hover:bg-[#F8F9FA]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#1A1D20]">{item.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F1F3F5] text-[#5A626A] font-semibold">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-xs text-[#5A626A]">
                    {item.presentation} • Stock: <strong className="text-[#1A1D20]">{item.currentStock} pzas</strong>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-[#0D6832] tabular-nums">
                    ${item.bestAvailablePrice.toFixed(2)}
                  </div>
                  {savingsPerUnit > 0 ? (
                    <div className="text-[10px] font-bold text-[#198754]">
                      Ahorras ${savingsPerUnit.toFixed(2)}/u
                    </div>
                  ) : (
                    <div className="text-[10px] text-[#5A626A]">
                      Precio habitual
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Comparative Intelligence Card (7 cols) */}
        {currentItem && (
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-[#E2E5E8] p-6 sm:p-7 shadow-sm space-y-6">
              
              {/* Product Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#E2E5E8]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0D6832] uppercase tracking-wide">
                      {currentItem.category} • Código: {currentItem.barcode}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-[#1A1D20] tracking-tight">
                    {currentItem.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5A626A]">
                    Presentación: <strong>{currentItem.presentation}</strong> ({currentItem.brand})
                  </p>
                </div>

                {/* Stock & Velocity Snapshot */}
                <div className="bg-[#F8F9FA] rounded-2xl p-3 border border-[#E2E5E8] text-right">
                  <div className="text-[10px] uppercase font-bold text-[#5A626A]">Venta diaria</div>
                  <div className="text-base font-extrabold text-[#1A1D20]">
                    ~{currentItem.avgDailySales} pzas / día
                  </div>
                  <div className="text-[10px] font-semibold text-[#0D6832]">
                    Rotación {currentItem.rotation}
                  </div>
                </div>
              </div>

              {/* Options Table by Supplier */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#1A1D20]">
                  <span>Opciones de Compra Disponibles Hoy</span>
                  <span className="text-[#5A626A] font-normal">Actualizado hoy 06:30 AM</span>
                </div>

                <div className="space-y-2.5">
                  {currentItem.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        opt.isBest
                          ? 'bg-emerald-50/60 border-[#0F5132] ring-1 ring-emerald-500/20'
                          : 'bg-[#F8F9FA] border-[#E2E5E8]'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1A1D20]">{opt.supplier}</span>
                          {opt.isBest && (
                            <span className="px-2 py-0.5 rounded-full bg-[#0F5132] text-white text-[10px] font-extrabold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              MEJOR OPCIÓN
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#5A626A]">
                          Condición: {opt.condition || 'Sin mínimo especificado'} {opt.deliveryTime && `• Entrega: ${opt.deliveryTime}`}
                        </div>
                        {opt.notes && (
                          <div className="text-[11px] text-amber-800 font-semibold mt-0.5">
                            ⚠️ {opt.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2E5E8]">
                        <div className="text-left sm:text-right">
                          <div className="text-lg font-black text-[#1A1D20] tabular-nums">
                            ${opt.pricePerUnit.toFixed(2)}{' '}
                            <span className="text-[10px] font-normal text-[#5A626A]">/ pza</span>
                          </div>
                          {opt.pricePerUnit < currentItem.lastCostPaid ? (
                            <div className="text-[10px] font-bold text-[#0D6832]">
                              -${(currentItem.lastCostPaid - opt.pricePerUnit).toFixed(2)} vs tu último costo
                            </div>
                          ) : (
                            <div className="text-[10px] text-[#5A626A]">
                              Precio de referencia
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handlePurchase(opt.supplier, opt.pricePerUnit)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                            opt.isBest
                              ? 'bg-[#0F5132] hover:bg-[#198754] text-white shadow-2xs'
                              : 'bg-white hover:bg-[#F1F3F5] text-[#1A1D20] border border-[#E2E5E8]'
                          }`}
                        >
                          Elegir este
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Calculator Simulator */}
              <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-[#E2E5E8] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1D20] uppercase tracking-wide">
                    Simulador de Compra & Recuperación de Dinero
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#5A626A]">Cantidad:</span>
                    <input
                      type="number"
                      value={purchaseUnits}
                      onChange={(e) => setPurchaseUnits(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-2 py-1 bg-white border border-[#E2E5E8] rounded-lg text-xs font-bold text-center outline-none focus:border-[#0F5132]"
                    />
                    <span className="text-xs text-[#5A626A]">pzas</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-white border border-[#E2E5E8]">
                    <div className="text-[10px] text-[#5A626A]">Inversión total</div>
                    <div className="text-sm font-extrabold text-[#1A1D20] tabular-nums">
                      ${(purchaseUnits * currentItem.bestAvailablePrice).toFixed(2)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-[10px] text-[#0D6832]">Ahorro neto</div>
                    <div className="text-sm font-black text-[#0D6832] tabular-nums">
                      +${(purchaseUnits * Math.max(0, currentItem.lastCostPaid - currentItem.bestAvailablePrice)).toFixed(2)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E2E5E8]">
                    <div className="text-[10px] text-[#5A626A]">Recuperación est.</div>
                    <div className="text-sm font-extrabold text-[#1A1D20]">
                      ~{(purchaseUnits / (currentItem.avgDailySales || 1)).toFixed(1)} días
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(currentItem.bestSupplier, currentItem.bestAvailablePrice)}
                  className="w-full py-3 rounded-xl bg-[#0F5132] hover:bg-[#198754] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Registrar compra de {purchaseUnits} pzas con {currentItem.bestSupplier}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
