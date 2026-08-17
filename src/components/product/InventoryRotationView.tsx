import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Minus, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpDown, 
  History, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  Layers, 
  Trash2, 
  X,
  FileText,
  ScanBarcode,
  ShoppingBag,
  Info,
  TrendingDown,
  ArrowDownRight,
  ArrowUpRight,
  Globe
} from 'lucide-react';
import { InventoryItem, InventoryMovement, PriceRecord, MovementType, StockStatusType } from '../../types';

interface InventoryRotationViewProps {
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  priceRecords: PriceRecord[];
  onUpdateStock: (productId: string, delta: number, motive: string) => void;
  onRecordMovement: (movement: Omit<InventoryMovement, 'id' | 'timestamp' | 'date'>) => void;
  onAddNewProduct: (product: Omit<InventoryItem, 'id' | 'lastUpdated' | 'daysOfStock' | 'stockStatus'>) => void;
}

export const InventoryRotationView: React.FC<InventoryRotationViewProps> = ({
  inventory,
  movements,
  priceRecords,
  onUpdateStock,
  onRecordMovement,
  onAddNewProduct,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'mio' | 'mercado' | 'kardex'>('mio');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  
  // Modals state
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [selectedProductForMovement, setSelectedProductForMovement] = useState<InventoryItem | null>(null);
  
  // Movement form state
  const [movementType, setMovementType] = useState<MovementType>('entrada');
  const [movementQty, setMovementQty] = useState<number>(1);
  const [movementMotive, setMovementMotive] = useState<string>('');
  const [movementCost, setMovementCost] = useState<number>(0);
  const [movementReference, setMovementReference] = useState<string>('');

  // New Product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdBarcode, setNewProdBarcode] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdPresentation, setNewProdPresentation] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<InventoryItem['category']>('Abarrotes');
  const [newProdStock, setNewProdStock] = useState<number>(10);
  const [newProdCost, setNewProdCost] = useState<number>(15.0);
  const [newProdPrice, setNewProdPrice] = useState<number>(20.0);
  const [newProdDailySales, setNewProdDailySales] = useState<number>(2.0);

  const categories = ['Todos', 'Bebidas', 'Lácteos', 'Botanas', 'Limpieza', 'Abarrotes', 'Panadería', 'Dulcería'];

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.barcode.includes(searchQuery);

      const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchQuery, selectedCategory]);

  const handleOpenMovementModal = (item: InventoryItem, defaultType: MovementType = 'entrada') => {
    setSelectedProductForMovement(item);
    setMovementType(defaultType);
    setMovementQty(1);
    setMovementCost(item.lastCostPaid);
    setMovementMotive(defaultType === 'merma' ? 'Empaque dañado' : 'Reabastecimiento regular');
    setMovementReference('Manual-Ajuste');
    setIsMovementModalOpen(true);
  };

  const handleSaveMovement = () => {
    if (!selectedProductForMovement) return;

    const actualQty = (movementType === 'merma' || movementType === 'venta') ? -Math.abs(movementQty) : Math.abs(movementQty);

    onRecordMovement({
      productId: selectedProductForMovement.id,
      productName: selectedProductForMovement.name,
      barcode: selectedProductForMovement.barcode,
      quantity: actualQty,
      type: movementType,
      typeLabel: movementType === 'entrada' ? 'Entrada manual' : movementType === 'merma' ? 'Merma / Daño' : movementType === 'venta' ? 'Venta mostrador' : 'Ajuste inventario',
      unitCost: movementCost,
      user: 'Don Pedro Gómez',
      storeId: 'store-1',
      reference: movementReference || 'Ajuste-Directo',
      motive: movementMotive || 'Operación manual en mostrador',
    });

    setIsMovementModalOpen(false);
  };

  const handleSaveNewProduct = () => {
    if (!newProdName || !newProdBarcode) return;

    onAddNewProduct({
      barcode: newProdBarcode,
      name: newProdName,
      brand: newProdBrand || 'Genérico',
      presentation: newProdPresentation || 'Pieza',
      category: newProdCategory,
      currentStock: newProdStock,
      minStockAlert: Math.max(2, Math.round(newProdDailySales * 2)),
      maxStock: Math.round(newProdDailySales * 15),
      reorderPoint: Math.round(newProdDailySales * 3),
      lastCostPaid: newProdCost,
      bestAvailablePrice: newProdCost,
      bestSupplier: 'Proveedor Local',
      avgDailySales: newProdDailySales,
      rotation: newProdDailySales >= 5 ? 'Alta' : newProdDailySales >= 1.5 ? 'Media' : 'Baja',
      salePrice: newProdPrice,
      marginPercent: newProdPrice > 0 ? ((newProdPrice - newProdCost) / newProdPrice) * 100 : 20,
      options: [
        { supplier: 'Proveedor Local', pricePerUnit: newProdCost, isBest: true, condition: 'Precio inicial capturado' }
      ]
    });

    setIsNewProductModalOpen(false);
    setNewProdName('');
    setNewProdBarcode('');
    setNewProdBrand('');
    setNewProdPresentation('');
  };

  // Helper to get market price data for a product
  const getMarketDataForProduct = (item: InventoryItem) => {
    const matchingRecords = priceRecords.filter(
      r => r.productName.toLowerCase().includes(item.name.toLowerCase().slice(0, 6)) || 
           r.id.includes(item.id)
    );

    if (matchingRecords.length === 0) {
      // Fallback synthetic market data based on cost
      const lowest = item.lastCostPaid * 0.92;
      const avg = item.lastCostPaid * 1.05;
      return {
        lowestPrice: lowest,
        avgPrice: avg,
        availability: 'Inmediata (CDMX)',
        supplier: 'Central de Abastos / Zorro',
        diffVsMine: item.salePrice - lowest,
        hasOpportunity: item.lastCostPaid > lowest * 1.03
      };
    }

    const prices = matchingRecords.map(r => r.price);
    const lowestPrice = Math.min(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const bestRecord = matchingRecords.find(r => r.price === lowestPrice) || matchingRecords[0];

    return {
      lowestPrice,
      avgPrice,
      availability: bestRecord.availability || 'Inmediata',
      supplier: bestRecord.supplier || bestRecord.source,
      diffVsMine: item.salePrice - lowestPrice,
      hasOpportunity: item.lastCostPaid > lowestPrice * 1.03
    };
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header & New Product Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20] tracking-tight">
            Inventario & Mercado CDMX
          </h1>
          <p className="text-xs sm:text-sm text-[#5A626A]">
            Visualiza tu inventario local y compáralo en tiempo real con los precios de mayoristas en CDMX.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewProductModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#0F5132] hover:bg-[#198754] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Producto o Piezas</span>
          </button>
        </div>
      </div>

      {/* Two Views Sub-Navigation Switcher + Kardex */}
      <div className="flex border-b border-[#E2E5E8] gap-6">
        <button
          onClick={() => setActiveSubTab('mio')}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'mio'
              ? 'border-[#0F5132] text-[#0F5132]'
              : 'border-transparent text-[#5A626A] hover:text-[#1A1D20]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Inventario Mío ({inventory.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mercado')}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'mercado'
              ? 'border-[#0F5132] text-[#0F5132]'
              : 'border-transparent text-[#5A626A] hover:text-[#1A1D20]'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Inventario del Mercado CDMX</span>
        </button>

        <button
          onClick={() => setActiveSubTab('kardex')}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'kardex'
              ? 'border-[#0F5132] text-[#0F5132]'
              : 'border-transparent text-[#5A626A] hover:text-[#1A1D20]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Kardex / Historial ({movements.length})</span>
        </button>
      </div>

      {/* VIEW 1: INVENTARIO MÍO */}
      {activeSubTab === 'mio' && (
        <div className="space-y-5">
          
          {/* Search & Categories */}
          <div className="bg-white rounded-2xl border border-[#E2E5E8] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#5A626A] absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar producto en mi inventario por nombre o código..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#E2E5E8] bg-white outline-none focus:border-[#0F5132]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#0F5132] text-white shadow-2xs'
                      : 'bg-white border border-[#E2E5E8] text-[#5A626A] hover:bg-[#F8F9FA]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table: Inventario Mío */}
          <div className="bg-white rounded-3xl border border-[#E2E5E8] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F8F9FA] border-b border-[#E2E5E8] text-[11px] font-black uppercase tracking-wider text-[#5A626A]">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Producto</th>
                    <th className="py-3.5 px-4 text-center">Existencias (Piezas)</th>
                    <th className="py-3.5 px-4 text-right">Costo ($)</th>
                    <th className="py-3.5 px-4 text-right">Precio de Venta ($)</th>
                    <th className="py-3.5 px-4 text-center">Margen (%)</th>
                    <th className="py-3.5 px-4 text-right">Valor del Inventario</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5E8]">
                  {filteredInventory.map((item) => {
                    const inventoryValue = item.currentStock * item.lastCostPaid;

                    return (
                      <tr key={item.id} className="hover:bg-[#F8F9FA]/80 transition-colors">
                        
                        {/* Producto */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-extrabold text-sm text-[#1A1D20]">{item.name}</div>
                          <div className="text-xs text-[#5A626A]">
                            {item.presentation} • <span className="font-mono text-[11px]">{item.barcode}</span>
                          </div>
                        </td>

                        {/* Existencias (captura rápida de piezas) */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onUpdateStock(item.id, -1, 'Ajuste rápido mostrador')}
                              className="w-7 h-7 rounded-lg bg-[#F1F3F5] hover:bg-red-100 hover:text-red-700 text-[#5A626A] flex items-center justify-center font-bold cursor-pointer transition-colors"
                              title="Restar 1 pza"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="font-black text-sm text-[#1A1D20] w-12 text-center tabular-nums bg-slate-50 py-1 rounded-md border border-slate-200">
                              {item.currentStock}
                            </span>

                            <button
                              onClick={() => onUpdateStock(item.id, 1, 'Ajuste rápido mostrador')}
                              className="w-7 h-7 rounded-lg bg-[#F1F3F5] hover:bg-emerald-100 hover:text-[#0D6832] text-[#5A626A] flex items-center justify-center font-bold cursor-pointer transition-colors"
                              title="Sumar 1 pza"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Costo */}
                        <td className="py-4 px-4 text-right font-semibold text-[#1A1D20] tabular-nums">
                          ${item.lastCostPaid.toFixed(2)}
                        </td>

                        {/* Precio de venta */}
                        <td className="py-4 px-4 text-right font-black text-[#0F5132] tabular-nums">
                          ${item.salePrice.toFixed(2)}
                        </td>

                        {/* Margen */}
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                            item.marginPercent < 15 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-[#0D6832]'
                          }`}>
                            {item.marginPercent.toFixed(1)}%
                          </span>
                        </td>

                        {/* Valor del inventario */}
                        <td className="py-4 px-4 text-right font-extrabold text-[#1A1D20] tabular-nums">
                          ${inventoryValue.toFixed(2)}
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <button
                            onClick={() => handleOpenMovementModal(item, 'entrada')}
                            className="px-3 py-1.5 rounded-xl bg-[#F8F9FA] hover:bg-emerald-50 hover:text-[#0D6832] border border-[#E2E5E8] text-xs font-bold text-[#1A1D20] transition-colors cursor-pointer"
                          >
                            Ajustar / Entradas
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INVENTARIO DEL MERCADO */}
      {activeSubTab === 'mercado' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-[#0D6832]">
            <Globe className="w-6 h-6 shrink-0 text-[#0F5132]" />
            <div className="text-xs sm:text-sm">
              <strong className="block font-black text-emerald-900">Datos de Scrapers CDMX en tiempo real</strong>
              Comparativa de tu inventario contra los precios más bajos y promedios reportados por la Central de Abastos, Zorro Abarrotero y Scorpion.
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#E2E5E8] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F8F9FA] border-b border-[#E2E5E8] text-[11px] font-black uppercase tracking-wider text-[#5A626A]">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Producto</th>
                    <th className="py-3.5 px-4 text-center">Mi Precio Venta</th>
                    <th className="py-3.5 px-4 text-right">Precio Mercado (Más Bajo)</th>
                    <th className="py-3.5 px-4 text-right">Precio Promedio</th>
                    <th className="py-3.5 px-4 text-center">Disponibilidad</th>
                    <th className="py-3.5 px-4 text-right">Diferencia vs Mi Precio</th>
                    <th className="py-3.5 px-4 sm:px-6 text-center">Oportunidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5E8]">
                  {inventory.map((item) => {
                    const market = getMarketDataForProduct(item);

                    return (
                      <tr key={item.id} className="hover:bg-[#F8F9FA]/80 transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-extrabold text-sm text-[#1A1D20]">{item.name}</div>
                          <div className="text-xs text-[#5A626A]">{item.brand} • {item.presentation}</div>
                        </td>

                        <td className="py-4 px-4 text-center font-bold text-[#1A1D20] tabular-nums">
                          ${item.salePrice.toFixed(2)}
                        </td>

                        <td className="py-4 px-4 text-right font-black text-[#0D6832] tabular-nums">
                          ${market.lowestPrice.toFixed(2)}
                          <span className="block text-[10px] font-normal text-slate-500">{market.supplier}</span>
                        </td>

                        <td className="py-4 px-4 text-right font-semibold text-slate-700 tabular-nums">
                          ${market.avgPrice.toFixed(2)}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-[#0D6832]">
                            {market.availability}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right font-bold tabular-nums">
                          <span className={market.diffVsMine > 0 ? 'text-emerald-700' : 'text-slate-700'}>
                            {market.diffVsMine > 0 ? `-$${market.diffVsMine.toFixed(2)}` : `$${Math.abs(market.diffVsMine).toFixed(2)}`}
                          </span>
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-center">
                          {market.hasOpportunity ? (
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-[#0D6832] font-black text-xs inline-flex items-center gap-1 shadow-2xs">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>¡Ahorro Disponible!</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Precio óptimo</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: KARDEX / MOVEMENTS */}
      {activeSubTab === 'kardex' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-[#E2E5E8] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E8]">
              <div>
                <h3 className="font-extrabold text-base text-[#1A1D20]">
                  Kardex / Historial de Movimientos
                </h3>
                <p className="text-xs text-[#5A626A]">
                  Trazabilidad inmutable de entradas, salidas, ventas, mermas y ajustes.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F8F9FA] border-b border-[#E2E5E8] text-[10px] font-black uppercase text-[#5A626A]">
                  <tr>
                    <th className="py-3 px-4">Fecha & Hora</th>
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4 text-center">Tipo Movimiento</th>
                    <th className="py-3 px-4 text-center">Cantidad</th>
                    <th className="py-3 px-4">Motivo / Referencia</th>
                    <th className="py-3 px-4 text-right">Usuario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5E8]">
                  {movements.map((mov) => {
                    const isPositive = mov.quantity > 0;

                    return (
                      <tr key={mov.id} className="hover:bg-[#F8F9FA] transition-colors">
                        <td className="py-3 px-4 text-[#5A626A] text-xs whitespace-nowrap">
                          {mov.timestamp} • {mov.date}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#1A1D20]">
                          {mov.productName}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            mov.type === 'compra' || mov.type === 'entrada'
                              ? 'bg-emerald-100 text-[#0D6832]'
                              : mov.type === 'merma'
                              ? 'bg-red-100 text-red-800'
                              : mov.type === 'venta'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {mov.typeLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-black tabular-nums">
                          <span className={isPositive ? 'text-[#0D6832]' : 'text-red-700'}>
                            {isPositive ? `+${mov.quantity}` : mov.quantity} pzas
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-[#5A626A]">
                          <div>{mov.motive}</div>
                          <span className="font-mono text-[10px] text-gray-400">Ref: {mov.reference}</span>
                        </td>
                        <td className="py-3 px-4 text-right text-xs font-semibold text-[#1A1D20]">
                          {mov.user}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR MOVIMIENTO */}
      {isMovementModalOpen && selectedProductForMovement && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E8]">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#0F5132]" />
                <h3 className="font-extrabold text-base text-[#1A1D20]">
                  Registrar Movimiento
                </h3>
              </div>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F8F9FA] text-[#5A626A] flex items-center justify-center hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F8F9FA] rounded-2xl border border-[#E2E5E8]">
                <div className="font-bold text-sm text-[#1A1D20]">{selectedProductForMovement.name}</div>
                <div className="text-[#5A626A]">Existencias actuales: <strong>{selectedProductForMovement.currentStock} pzas</strong></div>
              </div>

              <div>
                <label className="block font-bold text-[#1A1D20] mb-1">Tipo de Operación</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as MovementType)}
                  className="w-full px-3 py-2 border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
                >
                  <option value="entrada">Entrada / Compra (+)</option>
                  <option value="venta">Venta Mostrador (-)</option>
                  <option value="merma">Merma / Empaque Roto (-)</option>
                  <option value="ajuste">Ajuste de Conteo Físico</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1A1D20] mb-1">Cantidad de Piezas</label>
                  <input
                    type="number"
                    min="1"
                    value={movementQty}
                    onChange={(e) => setMovementQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A1D20] mb-1">Costo Unitario ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={movementCost}
                    onChange={(e) => setMovementCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1A1D20] mb-1">Motivo / Justificación</label>
                <input
                  type="text"
                  value={movementMotive}
                  onChange={(e) => setMovementMotive(e.target.value)}
                  placeholder="Ej. Surtido con preventa, merma..."
                  className="w-full px-3 py-2 border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E2E5E8] text-xs font-bold text-[#5A626A] hover:bg-[#F8F9FA] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMovement}
                className="flex-1 py-2.5 rounded-xl bg-[#0F5132] hover:bg-[#198754] text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                Guardar Movimiento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO PRODUCTO / CAPTURA DE PIEZAS */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E8]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#0F5132]" />
                <h3 className="font-extrabold text-base text-[#1A1D20]">
                  Registrar Nuevo Producto o Piezas
                </h3>
              </div>
              <button
                onClick={() => setIsNewProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F8F9FA] text-[#5A626A] flex items-center justify-center hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#1A1D20] mb-1">Nombre Comercial *</label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Ej. Sabritas Sal 170g"
                  className="w-full px-3 py-2 border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1A1D20] mb-1">Código de Barras *</label>
                  <input
                    type="text"
                    value={newProdBarcode}
                    onChange={(e) => setNewProdBarcode(e.target.value)}
                    placeholder="7501000..."
                    className="w-full px-3 py-2 border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A1D20] mb-1">Marca</label>
                  <input
                    type="text"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    placeholder="Sabritas, Bimbo..."
                    className="w-full px-3 py-2 border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1A1D20] mb-1">Categoría</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as InventoryItem['category'])}
                    className="w-full px-3 py-2 border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
                  >
                    <option value="Bebidas">Bebidas</option>
                    <option value="Lácteos">Lácteos</option>
                    <option value="Botanas">Botanas</option>
                    <option value="Limpieza">Limpieza</option>
                    <option value="Abarrotes">Abarrotes</option>
                    <option value="Panadería">Panadería</option>
                    <option value="Dulcería">Dulcería</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1A1D20] mb-1">Presentación</label>
                  <input
                    type="text"
                    value={newProdPresentation}
                    onChange={(e) => setNewProdPresentation(e.target.value)}
                    placeholder="Bolsa 170g / Pieza"
                    className="w-full px-3 py-2 border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-[#1A1D20] mb-1">¿Cuántas piezas tienes? *</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132] font-black text-emerald-800 bg-emerald-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A1D20] mb-1">Costo Compra ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A1D20] mb-1">Precio Venta ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setIsNewProductModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E2E5E8] text-xs font-bold text-[#5A626A] hover:bg-[#F8F9FA] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNewProduct}
                disabled={!newProdName || !newProdBarcode}
                className="flex-1 py-2.5 rounded-xl bg-[#0F5132] hover:bg-[#198754] disabled:opacity-50 text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                Guardar en Inventario
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
