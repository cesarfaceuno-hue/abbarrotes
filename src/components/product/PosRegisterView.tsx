import React, { useState, useRef, useEffect } from 'react';
import { 
  ScanBarcode, 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  DollarSign, 
  CreditCard, 
  ArrowRightLeft, 
  Printer, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  Tag, 
  Pause, 
  Play, 
  X, 
  Receipt,
  Sparkles,
  TrendingUp,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  InventoryItem, 
  SaleItem, 
  PaymentMethod, 
  PaymentRecord, 
  SaleTransaction, 
  StoreProfile,
  HeldCart 
} from '../../types';
import { roundCurrency, validateCartStock } from '../../services/transactionEngine';

interface PosRegisterViewProps {
  inventory: InventoryItem[];
  storeProfile: StoreProfile;
  onCompleteSale: (
    items: SaleItem[],
    payment: PaymentRecord,
    customerNote?: string
  ) => SaleTransaction;
  onNavigateToTab?: (tab: string) => void;
}

export const PosRegisterView: React.FC<PosRegisterViewProps> = ({
  inventory,
  storeProfile,
  onCompleteSale,
  onNavigateToTab,
}) => {
  // POS Cart State
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>([]);
  const [showHeldModal, setShowHeldModal] = useState(false);

  // Payment & Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [cardReference, setCardReference] = useState('');
  const [transferReference, setTransferReference] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Completed Ticket Modal State
  const [completedSale, setCompletedSale] = useState<SaleTransaction | null>(null);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Focus barcode input on mount
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Categories list
  const categories = ['Todos', 'Bebidas', 'Lácteos', 'Botanas', 'Limpieza', 'Abarrotes', 'Panadería'];

  // Filtered Products
  const filteredProducts = inventory.filter((prod) => {
    const matchesCat = selectedCategory === 'Todos' || prod.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      !q || 
      prod.name.toLowerCase().includes(q) || 
      prod.barcode.includes(q) || 
      (prod.sku && prod.sku.toLowerCase().includes(q)) ||
      prod.brand.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  // Add product to cart by item
  const handleAddToCart = (product: InventoryItem, qty = 1) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.productId === product.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const item = updated[existingIdx];
        const newQty = item.quantity + qty;
        const subtotal = roundCurrency(item.unitPrice * newQty);
        const discountTotal = roundCurrency(item.discount * newQty);
        const total = roundCurrency(Math.max(0, subtotal - discountTotal));
        const costTotal = roundCurrency(item.unitCost * newQty);
        const grossMargin = roundCurrency(total - costTotal);
        const marginPercent = total > 0 ? roundCurrency((grossMargin / total) * 100) : 0;

        updated[existingIdx] = {
          ...item,
          quantity: newQty,
          subtotal,
          total,
          grossMargin,
          marginPercent,
        };
        return updated;
      } else {
        const subtotal = roundCurrency(product.salePrice * qty);
        const total = subtotal;
        const costTotal = roundCurrency(product.lastCostPaid * qty);
        const grossMargin = roundCurrency(total - costTotal);
        const marginPercent = total > 0 ? roundCurrency((grossMargin / total) * 100) : 0;

        const newItem: SaleItem = {
          productId: product.id,
          barcode: product.barcode,
          productName: product.name,
          presentation: product.presentation,
          category: product.category,
          quantity: qty,
          unitPrice: product.salePrice,
          unitCost: product.lastCostPaid,
          discount: 0,
          subtotal,
          total,
          grossMargin,
          marginPercent,
        };
        return [...prev, newItem];
      }
    });

    // Re-focus scanner
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 50);
  };

  // Handle barcode submit
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    const matchedProd = inventory.find(
      (p) => p.barcode === code || (p.sku && p.sku.toLowerCase() === code.toLowerCase())
    );

    if (matchedProd) {
      handleAddToCart(matchedProd, 1);
      setBarcodeInput('');
    } else {
      alert(`Código "${code}" no encontrado en el catálogo. Puedes buscarlo por nombre o registrarlo.`);
    }
  };

  // Update item quantity
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const subtotal = roundCurrency(item.unitPrice * newQty);
            const discountTotal = roundCurrency(item.discount * newQty);
            const total = roundCurrency(Math.max(0, subtotal - discountTotal));
            const costTotal = roundCurrency(item.unitCost * newQty);
            const grossMargin = roundCurrency(total - costTotal);
            const marginPercent = total > 0 ? roundCurrency((grossMargin / total) * 100) : 0;

            return {
              ...item,
              quantity: newQty,
              subtotal,
              total,
              grossMargin,
              marginPercent,
            };
          }
          return item;
        })
        .filter(Boolean) as SaleItem[];
    });
  };

  // Remove single line item
  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Clear entire cart
  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('¿Deseas vaciar el carrito actual?')) {
      setCart([]);
      barcodeInputRef.current?.focus();
    }
  };

  // Hold current cart
  const handleHoldCart = () => {
    if (cart.length === 0) return;
    const subtotal = cart.reduce((acc, i) => acc + i.subtotal, 0);
    const total = cart.reduce((acc, i) => acc + i.total, 0);
    const newHeld: HeldCart = {
      id: `held-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      customerLabel: `Cliente #${heldCarts.length + 1} (${cart.length} items)`,
      items: cart,
      subtotal,
      total,
    };
    setHeldCarts((prev) => [...prev, newHeld]);
    setCart([]);
    barcodeInputRef.current?.focus();
  };

  // Recover held cart
  const handleRecoverHeldCart = (held: HeldCart) => {
    if (cart.length > 0) {
      if (!window.confirm('Tienes una venta en curso. ¿Deseas reemplazarla con el ticket recuperado?')) {
        return;
      }
    }
    setCart(held.items);
    setHeldCarts((prev) => prev.filter((h) => h.id !== held.id));
    setShowHeldModal(false);
    barcodeInputRef.current?.focus();
  };

  // Cart Calculations
  const cartSubtotal = roundCurrency(cart.reduce((acc, i) => acc + i.subtotal, 0));
  const cartTotalDiscount = roundCurrency(cart.reduce((acc, i) => acc + (i.discount * i.quantity), 0));
  const cartTotal = roundCurrency(Math.max(0, cartSubtotal - cartTotalDiscount));
  const cartTotalCost = roundCurrency(cart.reduce((acc, i) => acc + (i.unitCost * i.quantity), 0));
  const cartGrossMargin = roundCurrency(cartTotal - cartTotalCost);
  const cartMarginPercent = cartTotal > 0 ? roundCurrency((cartGrossMargin / cartTotal) * 100) : 0;
  const cartTotalUnits = cart.reduce((acc, i) => acc + i.quantity, 0);

  // Open Checkout Modal
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;

    // Validate stock constraints
    const validation = validateCartStock(cart, inventory);
    if (validation.warnings.length > 0) {
      // Show non-blocking warning
      console.warn('Advertencias de stock:', validation.warnings);
    }

    setPaymentMethod('efectivo');
    setCashReceived(cartTotal.toString());
    setCardReference('');
    setTransferReference('');
    setCustomerNote('');
    setCheckoutError(null);
    setIsCheckoutOpen(true);
  };

  // Quick cash buttons helper
  const handleQuickCash = (amount: number) => {
    setCashReceived(amount.toString());
  };

  // Complete Sale Commit
  const handleCommitSale = () => {
    setCheckoutError(null);

    const receivedNum = parseFloat(cashReceived) || 0;
    if (paymentMethod === 'efectivo' && receivedNum < cartTotal) {
      setCheckoutError(`El efectivo recibido ($${receivedNum.toFixed(2)}) es menor al total a pagar ($${cartTotal.toFixed(2)}).`);
      return;
    }

    const change = paymentMethod === 'efectivo' ? roundCurrency(Math.max(0, receivedNum - cartTotal)) : 0;

    const payment: PaymentRecord = {
      method: paymentMethod,
      amount: cartTotal,
      cashReceived: paymentMethod === 'efectivo' ? receivedNum : undefined,
      change: paymentMethod === 'efectivo' ? change : undefined,
      reference: paymentMethod === 'tarjeta' ? cardReference : paymentMethod === 'transferencia' ? transferReference : undefined,
      status: 'completed',
    };

    // Execute atomic sale commit
    const completed = onCompleteSale(cart, payment, customerNote);

    setCompletedSale(completed);
    setCart([]);
    setIsCheckoutOpen(false);
  };

  // Export ticket to WhatsApp format
  const handleCopyWhatsappTicket = () => {
    if (!completedSale) return;

    let text = `🧾 *TICKET DE COMPRA — ${storeProfile.storeName.toUpperCase()}*\n`;
    text += `📅 Fecha: ${completedSale.date} | ⏰ ${completedSale.timestamp}\n`;
    text += `🎫 Ticket #: ${completedSale.ticketNumber} | Atendió: ${completedSale.cashierName}\n`;
    text += `📍 ${storeProfile.zone}\n`;
    text += `──────────────────────\n`;
    if (Array.isArray(completedSale.items)) {
      completedSale.items.forEach((it) => {
        text += `• ${it.quantity}x ${it.productName} (${it.presentation}) — $${it.total.toFixed(2)}\n`;
      });
    }
    text += `──────────────────────\n`;
    text += `*SUBTOTAL:* $${completedSale.subtotal.toFixed(2)}\n`;
    if (completedSale.totalDiscount > 0) {
      text += `*DESCUENTO:* -$${completedSale.totalDiscount.toFixed(2)}\n`;
    }
    text += `*TOTAL PAGADO:* $${completedSale.total.toFixed(2)}\n`;
    text += `💳 Método de pago: ${completedSale.payment.method.toUpperCase()}\n`;
    if (completedSale.payment.method === 'efectivo' && completedSale.payment.cashReceived) {
      text += `💵 Recibido: $${completedSale.payment.cashReceived.toFixed(2)} | Cambio: $${completedSale.payment.change?.toFixed(2)}\n`;
    }
    text += `──────────────────────\n`;
    text += `¡Gracias por tu compra en ${storeProfile.storeName}!\n`;

    navigator.clipboard.writeText(text);
    setCopiedWhatsapp(true);
    setTimeout(() => setCopiedWhatsapp(false), 3000);
  };

  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const changeCalculated = Math.max(0, roundCurrency(cashReceivedNum - cartTotal));

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Quick Status */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E5E8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              Punto de Venta Mostrador
            </span>
            <span className="text-xs text-[#5A626A]">Caja Activa: {storeProfile.ownerName}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1A1D20] mt-1 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#0F5132]" />
            Terminal de Ventas POS
          </h1>
          <p className="text-xs sm:text-sm text-[#5A626A]">
            Escaneo ultra-rápido, control de inventario en tiempo real y cálculo automático de ganancia por ticket.
          </p>
        </div>

        {/* Quick status & held carts */}
        <div className="flex items-center gap-2 flex-wrap">
          {heldCarts.length > 0 && (
            <button
              onClick={() => setShowHeldModal(true)}
              className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 text-amber-600" />
              <span>{heldCarts.length} {heldCarts.length === 1 ? 'ticket en espera' : 'tickets en espera'}</span>
            </button>
          )}

          <div className="bg-[#F8F9FA] px-3.5 py-2 rounded-xl border border-[#E2E5E8] text-right">
            <div className="text-[10px] text-[#5A626A] font-bold uppercase tracking-wider">Productos en Catálogo</div>
            <div className="text-sm font-black text-[#1A1D20]">{inventory.length} SKUs disponibles</div>
          </div>
        </div>
      </div>

      {/* 2. Main POS Dual Workspace: Left = Catalog/Scanner, Right = Cart & Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: SCANNER & PRODUCT CATALOG (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Barcode & Search Input Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#E2E5E8] shadow-xs space-y-3">
            <form onSubmit={handleBarcodeSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <ScanBarcode className="w-5 h-5 text-[#0F5132]" />
              </div>
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Escanear código de barras o ingresar SKU y presionar Enter..."
                className="w-full pl-11 pr-24 py-3 bg-[#F8F9FA] border-2 border-emerald-500/40 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#0F5132] text-white rounded-lg text-xs font-bold hover:bg-[#198754] transition-colors cursor-pointer"
              >
                Agregar
              </button>
            </form>

            {/* Quick barcode test shortcuts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] text-[#5A626A] font-bold whitespace-nowrap">Escaneos rápidos:</span>
              <button
                type="button"
                onClick={() => {
                  const p = inventory.find((i) => i.barcode === '7501055301088');
                  if (p) handleAddToCart(p, 1);
                }}
                className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100 whitespace-nowrap cursor-pointer"
              >
                + Coca-Cola 600ml
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = inventory.find((i) => i.barcode === '7501020512344');
                  if (p) handleAddToCart(p, 1);
                }}
                className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100 whitespace-nowrap cursor-pointer"
              >
                + Leche Lala 1L
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = inventory.find((i) => i.barcode === '7501011115678');
                  if (p) handleAddToCart(p, 1);
                }}
                className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100 whitespace-nowrap cursor-pointer"
              >
                + Papas Sabritas
              </button>
            </div>
          </div>

          {/* Search by Text & Categories Filter */}
          <div className="bg-white rounded-2xl p-4 border border-[#E2E5E8] shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#5A626A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar producto por nombre o marca..."
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#0F5132]"
                />
              </div>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-2 text-xs text-[#5A626A] hover:text-[#1A1D20] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Categories Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#0F5132] text-white shadow-xs'
                      : 'bg-[#F8F9FA] text-[#5A626A] hover:bg-[#E2E5E8] hover:text-[#1A1D20]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-[#5A626A]">
                  No se encontraron productos coincidentes.
                </div>
              ) : (
                filteredProducts.map((prod) => {
                  const inCartItem = cart.find((i) => i.productId === prod.id);
                  const isOutOfStock = prod.currentStock <= 0;

                  return (
                    <button
                      key={prod.id}
                      onClick={() => handleAddToCart(prod, 1)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all group relative cursor-pointer ${
                        inCartItem
                          ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                          : 'border-[#E2E5E8] bg-white hover:border-[#0F5132] hover:shadow-xs'
                      }`}
                    >
                      {inCartItem && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-[#0F5132] text-white text-[10px] font-black">
                          {inCartItem.quantity} en venta
                        </span>
                      )}

                      <div>
                        <span className="text-[10px] font-extrabold text-[#5A626A] uppercase tracking-wider">
                          {prod.category}
                        </span>
                        <h4 className="text-xs font-bold text-[#1A1D20] line-clamp-2 mt-0.5 group-hover:text-[#0F5132]">
                          {prod.name}
                        </h4>
                        <p className="text-[11px] text-[#5A626A] mt-0.5">{prod.presentation}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-black text-[#0F5132]">
                            ${prod.salePrice.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-[#5A626A]">
                            Stock: <strong className={prod.currentStock < 5 ? 'text-red-600' : 'text-slate-800'}>{prod.currentStock}</strong>
                          </div>
                        </div>
                        <div className="w-6 h-6 rounded-lg bg-[#F8F9FA] group-hover:bg-[#0F5132] group-hover:text-white flex items-center justify-center transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE TICKET CART & INSTANT TOTALS (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E5E8] shadow-xs flex flex-col h-full">
            
            {/* Cart Header */}
            <div className="p-4 border-b border-[#E2E5E8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#0F5132]" />
                <h3 className="text-base font-black text-[#1A1D20]">Ticket en Curso</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black">
                  {cartTotalUnits} {cartTotalUnits === 1 ? 'pieza' : 'piezas'}
                </span>
              </div>

              {cart.length > 0 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleHoldCart}
                    title="Poner ticket en espera"
                    className="p-1.5 text-xs text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClearCart}
                    title="Vaciar ticket"
                    className="p-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="p-4 flex-1 overflow-y-auto max-h-[380px] divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="py-16 text-center text-[#5A626A] space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#F8F9FA] mx-auto flex items-center justify-center text-[#5A626A]">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-[#1A1D20]">El carrito está vacío</p>
                  <p className="text-xs text-[#5A626A]">Escanea un código de barras o selecciona un producto de la izquierda.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#1A1D20] truncate">
                        {item.productName}
                      </div>
                      <div className="text-[11px] text-[#5A626A] flex items-center gap-2 mt-0.5">
                        <span>${item.unitPrice.toFixed(2)} c/u</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">Ganancia: ${item.grossMargin.toFixed(2)} ({item.marginPercent}%)</span>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, -1)}
                        className="w-7 h-7 rounded-lg bg-[#F8F9FA] hover:bg-[#E2E5E8] flex items-center justify-center text-[#1A1D20] font-bold cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-[#1A1D20]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, 1)}
                        className="w-7 h-7 rounded-lg bg-[#F8F9FA] hover:bg-[#E2E5E8] flex items-center justify-center text-[#1A1D20] font-bold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right min-w-[60px]">
                      <div className="text-xs font-black text-[#1A1D20]">
                        ${item.total.toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-[10px] text-red-500 hover:text-red-700 font-bold cursor-pointer"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Financial Summary & Checkout Button */}
            <div className="p-4 bg-[#F8F9FA] border-t border-[#E2E5E8] rounded-b-2xl space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#5A626A]">
                  <span>Subtotal ({cartTotalUnits} artículos):</span>
                  <span className="font-bold text-[#1A1D20]">${cartSubtotal.toFixed(2)}</span>
                </div>
                {cartTotalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Descuento aplicado:</span>
                    <span className="font-bold">-${cartTotalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#5A626A] text-[11px] pt-1 border-t border-slate-200">
                  <span className="flex items-center gap-1 text-[#0F5132] font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Ganancia Bruta de la Venta:
                  </span>
                  <span className="font-extrabold text-[#0F5132]">
                    ${cartGrossMargin.toFixed(2)} ({cartMarginPercent}%)
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-[#1A1D20] pt-1">
                  <span>TOTAL A COBRAR:</span>
                  <span className="text-xl text-[#0F5132]">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Big Checkout Trigger Button */}
              <button
                disabled={cart.length === 0}
                onClick={handleOpenCheckout}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                  cart.length > 0
                    ? 'bg-[#0F5132] text-white hover:bg-[#198754] active:scale-98 ring-4 ring-emerald-500/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>Cobrar ${cartTotal.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHECKOUT & PAYMENT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E5E8] animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E5E8]">
              <div>
                <span className="text-[10px] font-black text-[#0F5132] uppercase tracking-wider">Cierre de Venta</span>
                <h3 className="text-xl font-black text-[#1A1D20]">Cobrar Venta Mostrador</h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-lg text-[#5A626A] hover:bg-[#F8F9FA] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              
              {/* Grand Total Highlight */}
              <div className="bg-[#F8F9FA] rounded-2xl p-4 text-center border border-[#E2E5E8]">
                <span className="text-xs text-[#5A626A] font-bold uppercase tracking-wider">Total a Pagar</span>
                <div className="text-3xl font-black text-[#0F5132] mt-0.5">
                  ${cartTotal.toFixed(2)}
                </div>
                <div className="text-xs text-[#5A626A] mt-1">
                  {cartTotalUnits} artículos • Ganancia bruta estimada: ${cartGrossMargin.toFixed(2)}
                </div>
              </div>

              {/* Payment Methods Selector Tabs */}
              <div>
                <label className="text-xs font-bold text-[#1A1D20] block mb-2">Método de Pago:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`py-3 px-2 rounded-xl text-xs font-black flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'efectivo'
                        ? 'bg-[#0F5132] text-white ring-2 ring-emerald-500/30 shadow-xs'
                        : 'bg-[#F8F9FA] text-[#5A626A] hover:bg-[#E2E5E8]'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Efectivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('tarjeta')}
                    className={`py-3 px-2 rounded-xl text-xs font-black flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'tarjeta'
                        ? 'bg-[#0F5132] text-white ring-2 ring-emerald-500/30 shadow-xs'
                        : 'bg-[#F8F9FA] text-[#5A626A] hover:bg-[#E2E5E8]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Tarjeta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transferencia')}
                    className={`py-3 px-2 rounded-xl text-xs font-black flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'transferencia'
                        ? 'bg-[#0F5132] text-white ring-2 ring-emerald-500/30 shadow-xs'
                        : 'bg-[#F8F9FA] text-[#5A626A] hover:bg-[#E2E5E8]'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Transferencia</span>
                  </button>
                </div>
              </div>

              {/* Cash Calculations Form */}
              {paymentMethod === 'efectivo' && (
                <div className="space-y-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1A1D20]">Efectivo Recibido:</label>
                    <div className="flex items-center gap-1">
                      {[50, 100, 200, 500].map((bill) => (
                        <button
                          key={bill}
                          type="button"
                          onClick={() => handleQuickCash(bill)}
                          className="px-2 py-0.5 rounded bg-white text-emerald-900 border border-emerald-300 text-[11px] font-bold hover:bg-emerald-100 cursor-pointer"
                        >
                          ${bill}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleQuickCash(cartTotal)}
                        className="px-2 py-0.5 rounded bg-emerald-700 text-white text-[11px] font-bold hover:bg-emerald-800 cursor-pointer"
                      >
                        Exacto
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-lg font-black text-[#5A626A]">$</span>
                    <input
                      type="number"
                      step="0.50"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-white border-2 border-emerald-400 rounded-xl text-xl font-black text-[#1A1D20] focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                    />
                  </div>

                  {/* Change Display */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-200">
                    <span className="text-xs font-extrabold text-[#5A626A] uppercase tracking-wider">Cambio a Entregar:</span>
                    <span className={`text-xl font-black ${cashReceivedNum < cartTotal ? 'text-red-600' : 'text-[#0F5132]'}`}>
                      ${changeCalculated.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Card Reference */}
              {paymentMethod === 'tarjeta' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1A1D20]">Código de Autorización / Terminal (Opcional):</label>
                  <input
                    type="text"
                    value={cardReference}
                    onChange={(e) => setCardReference(e.target.value)}
                    placeholder="Ej. AUT-884920"
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-[#0F5132]"
                  />
                </div>
              )}

              {/* Transfer Reference */}
              {paymentMethod === 'transferencia' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1A1D20]">Referencia / Clave de Rastreo SPEI (Opcional):</label>
                  <input
                    type="text"
                    value={transferReference}
                    onChange={(e) => setTransferReference(e.target.value)}
                    placeholder="Ej. SPEI-9921004"
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-[#0F5132]"
                  />
                </div>
              )}

              {/* Customer note */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5A626A]">Nota del Ticket (Opcional):</label>
                <input
                  type="text"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Ej. Vecino Don Toño, fiado parcial, entrega a domicilio..."
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                />
              </div>

              {checkoutError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-[#E2E5E8] text-xs font-bold text-[#5A626A] hover:bg-[#F8F9FA] cursor-pointer"
              >
                Regresar
              </button>
              <button
                type="button"
                onClick={handleCommitSale}
                className="flex-2 py-3 px-4 rounded-xl bg-[#0F5132] text-white text-xs font-black hover:bg-[#198754] transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Completar Venta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. COMPLETED TICKET RECEIPT MODAL */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E5E8] animate-in fade-in zoom-in-95 duration-150 space-y-4">
            
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#0F5132] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-[#1A1D20]">¡Venta Registrada con Éxito!</h3>
              <p className="text-xs text-[#5A626A]">El inventario y el Kardex fueron actualizados en tiempo real.</p>
            </div>

            {/* Paper Ticket Visual */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300 font-mono text-xs text-slate-800 space-y-2">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <div className="font-bold text-sm tracking-wider">{storeProfile.storeName.toUpperCase()}</div>
                <div className="text-[10px] text-slate-600">Propietario: {storeProfile.ownerName}</div>
                <div className="text-[10px] text-slate-500">{storeProfile.zone}</div>
                <div className="text-[10px] text-slate-500">Ticket #{completedSale.ticketNumber} • {completedSale.date} {completedSale.timestamp}</div>
              </div>

              {/* Items Table */}
              <div className="space-y-1 py-1">
                {completedSale.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px]">
                    <span className="truncate pr-2">{it.quantity}x {it.productName}</span>
                    <span className="font-bold shrink-0">${it.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-2 border-t border-dashed border-slate-300 space-y-0.5 text-right">
                <div className="flex justify-between text-[11px]">
                  <span>Subtotal:</span>
                  <span>${completedSale.subtotal.toFixed(2)}</span>
                </div>
                {completedSale.totalDiscount > 0 && (
                  <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
                    <span>Descuento:</span>
                    <span>-${completedSale.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200">
                  <span>TOTAL PAGADO:</span>
                  <span className="text-sm">${completedSale.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Método:</span>
                  <span>{completedSale.payment.method.toUpperCase()}</span>
                </div>
                {completedSale.payment.method === 'efectivo' && completedSale.payment.cashReceived && (
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Recibido: ${completedSale.payment.cashReceived.toFixed(2)}</span>
                    <span className="font-bold">Cambio: ${completedSale.payment.change?.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Merchant Insight Badge */}
              <div className="bg-emerald-100/80 p-2 rounded-lg text-[10px] text-emerald-950 font-sans flex items-center justify-between font-bold">
                <span>Ganancia bruta de este ticket:</span>
                <span className="text-emerald-800">+${completedSale.totalGrossMargin.toFixed(2)} ({completedSale.marginPercent}%)</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 px-3 rounded-xl border border-[#E2E5E8] text-xs font-bold text-[#1A1D20] hover:bg-[#F8F9FA] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#5A626A]" />
                  <span>Imprimir</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyWhatsappTicket}
                  className="py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 hover:bg-emerald-100 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-emerald-700" />
                  <span>{copiedWhatsapp ? '¡Copiado!' : 'WhatsApp'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCompletedSale(null);
                  barcodeInputRef.current?.focus();
                }}
                className="w-full py-3 rounded-xl bg-[#0F5132] text-white text-xs font-black hover:bg-[#198754] transition-colors shadow-md cursor-pointer"
              >
                Nueva Venta (Escáner Listo)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. HELD CARTS MODAL */}
      {showHeldModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E5E8] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E8]">
              <h3 className="text-base font-black text-[#1A1D20]">Tickets en Espera ({heldCarts.length})</h3>
              <button onClick={() => setShowHeldModal(false)} className="p-1 text-[#5A626A] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {heldCarts.map((held) => (
                <div
                  key={held.id}
                  className="p-3 rounded-xl border border-[#E2E5E8] bg-[#F8F9FA] flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-[#1A1D20]">{held.customerLabel}</div>
                    <div className="text-[11px] text-[#5A626A]">Guardado a las {held.timestamp} • {held.items.length} productos</div>
                    <div className="text-xs font-black text-[#0F5132] mt-0.5">${held.total.toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => handleRecoverHeldCart(held)}
                    className="px-3 py-1.5 rounded-lg bg-[#0F5132] text-white text-xs font-bold hover:bg-[#198754] cursor-pointer"
                  >
                    Reanudar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
