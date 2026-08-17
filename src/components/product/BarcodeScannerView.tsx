import React, { useState } from 'react';
import { 
  ScanBarcode, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  Camera, 
  RefreshCw, 
  ShoppingCart, 
  ShieldCheck,
  Plus,
  Minus,
  Layers,
  History,
  TrendingDown,
  Info
} from 'lucide-react';
import { InventoryItem, InventoryMovement } from '../../types';

interface BarcodeScannerViewProps {
  inventory: InventoryItem[];
  onNavigateToTab: (tabName: string) => void;
  onRecordMovement: (movement: Omit<InventoryMovement, 'id' | 'timestamp' | 'date'>) => void;
  onAddNewProduct: (product: Omit<InventoryItem, 'id' | 'lastUpdated' | 'daysOfStock' | 'stockStatus'>) => void;
}

export const BarcodeScannerView: React.FC<BarcodeScannerViewProps> = ({
  inventory,
  onNavigateToTab,
  onRecordMovement,
  onAddNewProduct,
}) => {
  const [manualBarcode, setManualBarcode] = useState<string>('7501055301088');
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(inventory[0] || null);
  const [isScanningAnim, setIsScanningAnim] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  // IA Discovery & Matching States (EAN automatic matching)
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [discoveryStep, setDiscoveryStep] = useState<number>(0);
  const [discoveryProgress, setDiscoveryProgress] = useState<string>('');
  const [discoveredProduct, setDiscoveredProduct] = useState<any | null>(null);

  const handleTriggerDiscovery = async () => {
    setIsDiscovering(true);
    setDiscoveryStep(1);
    setDiscoveryProgress('DISCOVERY_AGENT: Consultando Base de Datos Universal por EAN...');
    setDiscoveredProduct(null);

    try {
      // Step 1: Check Universal Product Database API
      const res = await fetch(`/api/ai/best-price/${manualBarcode}`);
      
      if (res.ok) {
        const data = await res.json();
        setDiscoveryStep(5);
        setDiscoveryProgress('MATCHING_AGENT: Coincidencia de alta confianza encontrada en Catálogo Maestro Universal.');
        
        setTimeout(() => {
          setIsDiscovering(false);
          setDiscoveryStep(6);
          setDiscoveryProgress('');
          setDiscoveredProduct({
            name: data.product.canonicalName,
            brand: data.product.brand,
            category: data.product.category,
            barcode: data.product.barcode || manualBarcode,
            currentStock: 0,
            minSafetyStock: 10,
            avgDailySales: 2.0,
            lastCostPaid: data.bestPrice || 35.0,
            salePrice: data.product.avgRetailPriceCdmx || Number(((data.bestPrice || 35) * 1.25).toFixed(2)),
            bestSupplier: data.bestSupplier || 'Mayorista CDMX Registrado',
            bestAvailablePrice: data.bestPrice || 32.0,
            presentation: data.product.presentation || 'Pieza',
            marketOptions: data.allSupplierPrices?.length > 0
              ? data.allSupplierPrices.map((sp: any) => ({ supplier: sp.supplierName, price: sp.price, url: sp.sourceUrl }))
              : [{ supplier: data.bestSupplier || 'Mayorista CDMX', price: data.bestPrice || 32.0, url: data.bestSupplierSourceUrl || '#' }]
          });
        }, 1000);
        return;
      }

      // Step 2: If not immediately in DB, trigger real live scraper acquisition
      setDiscoveryStep(2);
      setDiscoveryProgress('SCRAPER_AGENTS: Rastreando fuentes de mayoreo CDMX (Scorpion, MayoreoTotal, ClickAbasto)...');
      
      await fetch('/api/scraper/run-all', { method: 'POST' });

      setDiscoveryStep(4);
      setDiscoveryProgress('DATA_QUALITY_AGENT: Normalizando y procesando observaciones recibidas...');

      const secondCheck = await fetch(`/api/ai/best-price/${manualBarcode}`);
      if (secondCheck.ok) {
        const data = await secondCheck.json();
        setIsDiscovering(false);
        setDiscoveryStep(6);
        setDiscoveryProgress('');
        setDiscoveredProduct({
          name: data.product.canonicalName,
          brand: data.product.brand,
          category: data.product.category,
          barcode: data.product.barcode || manualBarcode,
          currentStock: 0,
          minSafetyStock: 10,
          avgDailySales: 2.0,
          lastCostPaid: data.bestPrice || 35.0,
          salePrice: data.product.avgRetailPriceCdmx || Number(((data.bestPrice || 35) * 1.25).toFixed(2)),
          bestSupplier: data.bestSupplier || 'Mayorista CDMX Registrado',
          bestAvailablePrice: data.bestPrice || 32.0,
          presentation: data.product.presentation || 'Pieza',
          marketOptions: data.allSupplierPrices?.length > 0
            ? data.allSupplierPrices.map((sp: any) => ({ supplier: sp.supplierName, price: sp.price, url: sp.sourceUrl }))
            : [{ supplier: data.bestSupplier || 'Mayorista CDMX', price: data.bestPrice || 32.0, url: data.bestSupplierSourceUrl || '#' }]
        });
      } else {
        // Fallback search in master catalog
        const searchRes = await fetch(`/api/ai/search?q=${manualBarcode}`);
        const searchData = searchRes.ok ? await searchRes.json() : null;
        const matched = searchData?.products?.[0];

        setIsDiscovering(false);
        setDiscoveryStep(6);
        setDiscoveryProgress('');

        if (matched) {
          setDiscoveredProduct({
            name: matched.canonicalName,
            brand: matched.brand,
            category: matched.category,
            barcode: matched.barcode || manualBarcode,
            currentStock: 0,
            minSafetyStock: 10,
            avgDailySales: 2.0,
            lastCostPaid: matched.cheapestWholesaleCost || 30.0,
            salePrice: matched.avgRetailPriceCdmx || 38.0,
            bestSupplier: 'Mayorista CDMX Registrado',
            bestAvailablePrice: matched.cheapestWholesaleCost || 30.0,
            presentation: matched.presentation || 'Pieza',
            marketOptions: [
              { supplier: 'Mayorista CDMX Principal', price: matched.cheapestWholesaleCost || 30.0, url: '#' }
            ]
          });
        } else {
          setScanMessage(`Código ${manualBarcode} no encontrado en fuentes públicas. Puedes registrarlo manualmente.`);
        }
      }
    } catch (err: any) {
      setIsDiscovering(false);
      setDiscoveryStep(0);
      setScanMessage(`Error en búsqueda: ${err.message}`);
    }
  };

  const handleAddDiscoveredProduct = () => {
    if (!discoveredProduct) return;
    
    // Call props callback to register in inventory
    onAddNewProduct({
      name: discoveredProduct.name,
      brand: discoveredProduct.brand,
      category: discoveredProduct.category,
      barcode: discoveredProduct.barcode,
      currentStock: 12, // Initial physical batch added
      minSafetyStock: discoveredProduct.minSafetyStock,
      avgDailySales: discoveredProduct.avgDailySales,
      lastCostPaid: discoveredProduct.lastCostPaid,
      salePrice: discoveredProduct.salePrice,
      bestSupplier: discoveredProduct.bestSupplier,
      bestAvailablePrice: discoveredProduct.bestAvailablePrice,
      presentation: discoveredProduct.presentation,
    });

    // Automatically select the newly created item
    const newItem: InventoryItem = {
      id: `prod-${Date.now()}`,
      name: discoveredProduct.name,
      brand: discoveredProduct.brand,
      category: discoveredProduct.category,
      barcode: discoveredProduct.barcode,
      currentStock: 12,
      minStockAlert: discoveredProduct.minSafetyStock || 10,
      avgDailySales: discoveredProduct.avgDailySales,
      lastCostPaid: discoveredProduct.lastCostPaid,
      salePrice: discoveredProduct.salePrice,
      bestSupplier: discoveredProduct.bestSupplier,
      bestAvailablePrice: discoveredProduct.bestAvailablePrice,
      presentation: discoveredProduct.presentation,
      daysOfStock: 12 / discoveredProduct.avgDailySales,
      stockStatus: 'NORMAL',
      rotation: 'Media',
      marginPercent: ((discoveredProduct.salePrice - discoveredProduct.lastCostPaid) / discoveredProduct.salePrice) * 100,
      options: [],
      lastUpdated: 'Hoy'
    };

    setScannedItem(newItem);
    setIsNotFound(false);
    setDiscoveredProduct(null);
    setDiscoveryStep(0);
    setScanMessage(`¡Producto registrado en tu tienda con éxito!`);
    setTimeout(() => setScanMessage(null), 3000);
  };

  const sampleProducts = [
    { barcode: '7501055301088', label: 'Coca-Cola 600ml' },
    { barcode: '7501020512344', label: 'Leche Lala 1L' },
    { barcode: '7501007200114', label: 'Jabón Roma 1kg' },
    { barcode: '7501011115678', label: 'Sabritas Sal 42g' },
    { barcode: '7501000111202', label: 'Pan Bimbo Grande' },
    { barcode: '7501032900012', label: 'Aceite 1-2-3 1L' },
    { barcode: '7501002345091', label: 'Huevo San Juan' },
    { barcode: '7509999999999', label: 'Código Nuevo (Demo)' },
  ];

  const handleScanBarcode = (code: string) => {
    setIsScanningAnim(true);
    setScanMessage('Consultando código de barras en catálogo maestro...');
    setIsNotFound(false);

    setTimeout(() => {
      setIsScanningAnim(false);
      const found = inventory.find((i) => i.barcode === code);
      if (found) {
        setScannedItem(found);
        setScanMessage(`¡Producto detectado: ${found.name}!`);
      } else {
        setScannedItem(null);
        setIsNotFound(true);
        setScanMessage('Código no registrado en inventario local.');
      }
      setTimeout(() => setScanMessage(null), 3000);
    }, 450);
  };

  const handleQuickAction = (type: 'entrada' | 'venta' | 'merma', qty: number) => {
    if (!scannedItem) return;

    const actualQty = (type === 'venta' || type === 'merma') ? -qty : qty;

    onRecordMovement({
      productId: scannedItem.id,
      productName: scannedItem.name,
      barcode: scannedItem.barcode,
      quantity: actualQty,
      type: type,
      typeLabel: type === 'entrada' ? 'Entrada mostrador' : type === 'venta' ? 'Venta mostrador' : 'Merma mostrador',
      unitCost: scannedItem.lastCostPaid,
      user: 'Don Pedro Gómez',
      storeId: 'store-1',
      reference: 'Scanner-Quick',
      motive: `Operación rápida desde lector (${type})`,
    });

    setScanMessage(`¡Registrado: ${actualQty > 0 ? `+${actualQty}` : actualQty} pzas en Kardex!`);
    setTimeout(() => setScanMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20] tracking-tight">
          Lector de Código de Barras en Mostrador
        </h1>
        <p className="text-xs sm:text-sm text-[#5A626A]">
          Identificación instantánea por cámara o pistola de código. Consulta inventario, días de stock, mejor precio mayorista y registra movimientos con 1 clic.
        </p>
      </div>

      {scanMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-[#0D6832] font-bold text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#198754] shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Main Grid: Scanner Viewport (Left) & Intelligence Analysis (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Scanner Viewport (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#1A1D20] rounded-3xl p-5 text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[320px]">
            
            {/* Viewfinder Reticle */}
            <div className="relative w-64 h-48 border-2 border-dashed border-emerald-400/60 rounded-2xl flex items-center justify-center overflow-hidden bg-black/40">
              
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

              {/* Animated Red/Laser Scan Line */}
              <div
                className={`absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] transition-all duration-700 ${
                  isScanningAnim ? 'top-full animate-bounce' : 'top-1/2'
                }`}
              />

              {/* Center icon / state */}
              <div className="text-center space-y-1 z-10 px-4">
                <ScanBarcode className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
                <span className="text-[11px] text-emerald-200 font-semibold block">
                  Coloca el código frente a la cámara
                </span>
              </div>
            </div>

            {/* Status indicator */}
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Cámara lista • Reconocimiento instantáneo</span>
            </div>
          </div>

          {/* Quick Test Barcode Buttons */}
          <div className="bg-white rounded-2xl border border-[#E2E5E8] p-4 space-y-2.5 shadow-2xs">
            <span className="text-xs font-bold text-[#1A1D20] block">
              Pruebas Rápidas (Haz clic para simular escaneo):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleProducts.map((p) => (
                <button
                  key={p.barcode}
                  onClick={() => {
                    setManualBarcode(p.barcode);
                    handleScanBarcode(p.barcode);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#F8F9FA] hover:bg-emerald-50 hover:border-emerald-300 border border-[#E2E5E8] text-[11px] font-bold text-[#1A1D20] transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Numerical Input */}
          <div className="bg-white rounded-2xl border border-[#E2E5E8] p-4 flex gap-2 shadow-2xs">
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Ingresa código de barras manual..."
              className="flex-1 px-3 py-2 text-xs border border-[#E2E5E8] rounded-xl outline-none focus:border-[#0F5132]"
            />
            <button
              onClick={() => handleScanBarcode(manualBarcode)}
              className="px-3.5 py-2 bg-[#0F5132] text-white text-xs font-bold rounded-xl hover:bg-[#198754] transition-colors cursor-pointer shadow-2xs"
            >
              Escanear
            </button>
          </div>
        </div>

        {/* Intelligence Result Card (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {scannedItem ? (
            <div className="bg-white rounded-3xl border border-[#E2E5E8] p-6 sm:p-7 shadow-sm space-y-5">
              
              {/* Top Detection Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E8]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-[#0D6832] uppercase tracking-wide">
                    Producto Identificado • {scannedItem.category}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#5A626A] bg-[#F1F3F5] px-2 py-0.5 rounded">
                  {scannedItem.barcode}
                </span>
              </div>

              {/* Product Info */}
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-[#1A1D20] tracking-tight">
                  {scannedItem.name}
                </h2>
                <p className="text-xs sm:text-sm text-[#5A626A]">
                  Presentación: <strong>{scannedItem.presentation}</strong> ({scannedItem.brand})
                </p>
              </div>

              {/* Instant Price & Stock Analysis Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-[#E2E5E8]">
                  <div className="text-[10px] uppercase font-bold text-[#5A626A]">Último costo</div>
                  <div className="text-base font-extrabold text-[#1A1D20] tabular-nums">
                    ${scannedItem.lastCostPaid.toFixed(2)}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] uppercase font-bold text-[#0D6832]">Mejor hoy</div>
                  <div className="text-base font-black text-[#0D6832] tabular-nums">
                    ${scannedItem.bestAvailablePrice.toFixed(2)}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-[#E2E5E8]">
                  <div className="text-[10px] uppercase font-bold text-[#5A626A]">Stock actual</div>
                  <div className="text-base font-extrabold text-[#1A1D20] tabular-nums">
                    {scannedItem.currentStock} pzas
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-[#E2E5E8]">
                  <div className="text-[10px] uppercase font-bold text-[#5A626A]">Cobertura</div>
                  <div className="text-base font-extrabold text-[#1A1D20]">
                    ~{scannedItem.daysOfStock.toFixed(1)} días
                  </div>
                </div>
              </div>

              {/* Real-time IA Recommendation Capsule */}
              <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#198754]" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#0D6832]">
                    Diagnóstico IA para Mostrador:
                  </span>
                </div>
                
                {scannedItem.daysOfStock < 2.5 ? (
                  <p className="text-xs text-[#1A1D20] leading-relaxed">
                    <strong>⚠️ Alerta de desabasto inminente:</strong> Te quedan {scannedItem.currentStock} piezas y vendes ~{scannedItem.avgDailySales} al día. Si viene el repartidor hoy,{' '}
                    <strong>compra 2 cajas a ${scannedItem.bestAvailablePrice.toFixed(2)} c/u en {scannedItem.bestSupplier}</strong> para no perder ventas este fin de semana.
                  </p>
                ) : scannedItem.daysOfStock > 20 ? (
                  <p className="text-xs text-[#1A1D20] leading-relaxed">
                    <strong>⏳ No comprar por ahora:</strong> Tienes {scannedItem.currentStock} unidades en anaquel (suficiente para {scannedItem.daysOfStock.toFixed(0)} días). Aunque el repartidor te ofrezca descuento por bulto, congelarás tu dinero.
                  </p>
                ) : (
                  <p className="text-xs text-[#1A1D20] leading-relaxed">
                    <strong>✅ Nivel de inventario saludable:</strong> Tienes cobertura para {scannedItem.daysOfStock.toFixed(1)} días. Puedes reponer 1 caja de {scannedItem.bestSupplier} al mejor precio disponible (${scannedItem.bestAvailablePrice.toFixed(2)}).
                  </p>
                )}
              </div>

              {/* Quick Kardex Movement Action Buttons */}
              <div className="space-y-2 pt-1 border-t border-[#E2E5E8]">
                <span className="text-xs font-bold text-[#1A1D20] block">
                  Registrar Operación Rápida en Mostrador:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickAction('venta', 1)}
                    className="py-2.5 px-3 rounded-xl bg-[#F8F9FA] hover:bg-blue-50 hover:text-blue-700 border border-[#E2E5E8] text-xs font-bold text-[#1A1D20] transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Venta (-1 pza)</span>
                  </button>

                  <button
                    onClick={() => handleQuickAction('entrada', 12)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-[#0D6832] transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Entrada (+12)</span>
                  </button>

                  <button
                    onClick={() => handleQuickAction('merma', 1)}
                    className="py-2.5 px-3 rounded-xl bg-[#F8F9FA] hover:bg-red-50 hover:text-red-700 border border-[#E2E5E8] text-xs font-bold text-[#5A626A] transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Merma (-1)</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  onClick={() => onNavigateToTab('purchases')}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#0F5132] hover:bg-[#198754] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <span>Comparar Opciones de Proveedores</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : isNotFound ? (
            <div className="p-8 bg-white rounded-3xl border border-amber-200 text-center space-y-5 shadow-sm">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
              <div>
                <h3 className="text-base font-extrabold text-[#1A1D20]">Código de Barras no registrado</h3>
                <p className="text-xs text-[#5A626A] mt-1">
                  El código <strong className="font-mono">{manualBarcode}</strong> no existe en tu inventario local.
                </p>
              </div>

              {!isDiscovering && !discoveredProduct && (
                <div className="space-y-3">
                  <p className="text-xs text-[#5A626A]">
                    MI ABARROTERO puede buscar este producto automáticamente en los catálogos de los mayoristas principales de la CDMX usando su código EAN.
                  </p>
                  <button
                    onClick={handleTriggerDiscovery}
                    className="w-full py-3 px-5 rounded-xl bg-[#0F5132] text-white text-xs font-bold hover:bg-[#198754] transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                    <span>⚡ Identificar Automáticamente con IA y Mercado</span>
                  </button>
                </div>
              )}

              {isDiscovering && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-left animate-pulse">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0D6832]">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#198754]" />
                    <span>Ejecutando Agentes de Inteligencia Comercial...</span>
                  </div>
                  <p className="text-xs text-[#1A1D20] font-mono leading-relaxed">
                    {discoveryProgress}
                  </p>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#0F5132] h-full transition-all duration-500" 
                      style={{ width: `${(discoveryStep / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#5A626A] block text-right">Fase {discoveryStep} de 5</span>
                </div>
              )}

              {discoveredProduct && (
                <div className="p-5 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-left space-y-4">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#0D6832] font-black text-[9px] uppercase tracking-wide">
                      ¡PRODUCTO DETECTADO CON ÉXITO!
                    </span>
                    <h4 className="font-black text-lg text-[#1A1D20] mt-1">{discoveredProduct.name}</h4>
                    <p className="text-xs text-[#5A626A]">{discoveredProduct.brand} • {discoveredProduct.presentation}</p>
                  </div>

                  <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#5A626A] block">Precios Mayoristas Encontrados (CDMX):</span>
                    {discoveredProduct.marketOptions.map((opt: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-[#1A1D20] font-medium">{opt.supplier}:</span>
                        <strong className="text-[#0D6832] tabular-nums">${opt.price.toFixed(2)}</strong>
                      </div>
                    ))}
                    <div className="pt-1.5 border-t border-dashed border-emerald-100 flex justify-between text-xs font-bold">
                      <span className="text-slate-700">Mejor opción:</span>
                      <span className="text-[#0F5132] font-black">{discoveredProduct.bestSupplier} (${discoveredProduct.bestAvailablePrice.toFixed(2)})</span>
                    </div>
                  </div>

                  <button
                    onClick={handleAddDiscoveredProduct}
                    className="w-full py-3 px-4 bg-[#0F5132] hover:bg-[#198754] text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>✅ Registrar y Agregar a mi Inventario (Mi Tienda)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 bg-white rounded-3xl border border-[#E2E5E8] text-center space-y-3">
              <ScanBarcode className="w-12 h-12 text-[#5A626A] mx-auto opacity-40" />
              <p className="text-sm font-bold text-[#1A1D20]">Escanea un producto para ver el análisis</p>
              <p className="text-xs text-[#5A626A]">Abarrotes IA cruzará tu precio de compra con los mayoristas de tu zona.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
