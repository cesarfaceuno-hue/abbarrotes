import { 
  InventoryItem, 
  InventoryMovement, 
  SaleTransaction, 
  SaleItem, 
  PaymentRecord, 
  StoreProfile, 
  AuditLogEntry 
} from '../types';

/**
 * Deterministic rounding utility to avoid float precision drift ($19.99 * 3 = $59.97).
 */
export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Validates cart stock against inventory before checkout commit.
 */
export function validateCartStock(
  items: SaleItem[],
  inventory: InventoryItem[]
): { isValid: boolean; warnings: string[]; blockers: string[] } {
  const warnings: string[] = [];
  const blockers: string[] = [];

  for (const item of items) {
    const prod = inventory.find((p) => p.id === item.productId || p.barcode === item.barcode);
    if (!prod) {
      warnings.push(`Producto "${item.productName}" no está registrado en el catálogo maestro.`);
      continue;
    }

    if (prod.currentStock <= 0) {
      warnings.push(`"${prod.name}" no tiene existencias registradas (Stock: 0).`);
    } else if (item.quantity > prod.currentStock) {
      warnings.push(`"${prod.name}" solo tiene ${prod.currentStock} unidades disponibles (intentas vender ${item.quantity}).`);
    }
  }

  return {
    isValid: blockers.length === 0,
    warnings,
    blockers,
  };
}

/**
 * Processes a completed POS sale atomically.
 * Updates Inventory, creates Kardex Movements, creates Audit Log, and creates Sale Transaction.
 */
export function processSaleTransaction(params: {
  items: SaleItem[];
  payment: PaymentRecord;
  storeProfile: StoreProfile;
  cashierName: string;
  ticketNumber: number;
  inventory: InventoryItem[];
  customerNote?: string;
  customTimestamp?: string;
}): {
  sale: SaleTransaction;
  updatedInventory: InventoryItem[];
  movements: InventoryMovement[];
  auditLog: AuditLogEntry;
} {
  const {
    items,
    payment,
    storeProfile,
    cashierName,
    ticketNumber,
    inventory,
    customerNote,
    customTimestamp,
  } = params;

  const now = new Date();
  const timeStr = customTimestamp || now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const saleId = `VTA-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${ticketNumber.toString().padStart(4, '0')}`;

  // 1. Calculate Totals Deterministically
  let subtotal = 0;
  let totalDiscount = 0;
  let totalCost = 0;
  let totalUnits = 0;

  const processedItems: SaleItem[] = items.map((item) => {
    const itemSubtotal = roundCurrency(item.unitPrice * item.quantity);
    const itemDiscount = roundCurrency((item.discount || 0) * item.quantity);
    const itemTotal = roundCurrency(Math.max(0, itemSubtotal - itemDiscount));
    const itemCostTotal = roundCurrency(item.unitCost * item.quantity);
    const itemGrossMargin = roundCurrency(itemTotal - itemCostTotal);
    const marginPct = itemTotal > 0 ? roundCurrency((itemGrossMargin / itemTotal) * 100) : 0;

    subtotal = roundCurrency(subtotal + itemSubtotal);
    totalDiscount = roundCurrency(totalDiscount + itemDiscount);
    totalCost = roundCurrency(totalCost + itemCostTotal);
    totalUnits += item.quantity;

    return {
      ...item,
      subtotal: itemSubtotal,
      discount: itemDiscount,
      total: itemTotal,
      grossMargin: itemGrossMargin,
      marginPercent: marginPct,
    };
  });

  const grandTotal = roundCurrency(Math.max(0, subtotal - totalDiscount));
  const totalGrossMargin = roundCurrency(grandTotal - totalCost);
  const totalMarginPercent = grandTotal > 0 ? roundCurrency((totalGrossMargin / grandTotal) * 100) : 0;

  // 2. Build SaleTransaction Object
  const sale: SaleTransaction = {
    id: saleId,
    idempotencyKey,
    ticketNumber,
    storeId: storeProfile.id || 'store-1',
    cashierName: cashierName || storeProfile.ownerName || 'Cajero',
    timestamp: timeStr,
    date: dateStr,
    items: processedItems,
    itemCount: processedItems.length,
    totalUnits,
    subtotal,
    totalDiscount,
    total: grandTotal,
    totalCost,
    totalGrossMargin,
    marginPercent: totalMarginPercent,
    payment: {
      ...payment,
      amount: grandTotal,
      status: 'completed',
    },
    status: 'COMPLETED',
    customerNote,
  };

  // 3. Deduct stock from Inventory
  const updatedInventory = inventory.map((invItem) => {
    const soldItem = processedItems.find(
      (si) => si.productId === invItem.id || si.barcode === invItem.barcode
    );

    if (soldItem) {
      const newStock = Math.max(0, invItem.currentStock - soldItem.quantity);
      const newDaysOfStock = invItem.avgDailySales > 0 ? newStock / invItem.avgDailySales : 10;
      
      return {
        ...invItem,
        currentStock: newStock,
        daysOfStock: roundCurrency(newDaysOfStock),
        stockStatus: (newDaysOfStock < 2.5 
          ? 'CRÍTICO' 
          : newDaysOfStock > 20 
          ? 'SOBRESTOCK' 
          : 'NORMAL') as InventoryItem['stockStatus'],
        lastUpdated: 'Hoy',
      };
    }
    return invItem;
  });

  // 4. Generate Immutable Kardex Movements (one per sold line item)
  const movements: InventoryMovement[] = processedItems.map((item, idx) => ({
    id: `mov-vta-${Date.now()}-${idx}`,
    date: 'Hoy',
    timestamp: timeStr,
    productId: item.productId,
    productName: item.productName,
    barcode: item.barcode,
    quantity: -item.quantity, // Outflow
    type: 'venta',
    typeLabel: `Venta Mostrador #${ticketNumber}`,
    unitCost: item.unitCost,
    user: cashierName || storeProfile.ownerName || 'Cajero',
    storeId: storeProfile.id || 'store-1',
    reference: `Ticket #${ticketNumber}`,
    motive: `Cobro en ${payment.method} (${item.quantity} pzas x $${item.unitPrice.toFixed(2)})`,
  }));

  // 5. Generate Audit Log Entry
  const auditLog: AuditLogEntry = {
    id: `aud-vta-${Date.now()}`,
    date: 'Hoy',
    timestamp: timeStr,
    actor: `${cashierName || storeProfile.ownerName} (POS)`,
    action: `Venta completada (Ticket #${ticketNumber})`,
    detail: `Total cobrado: $${grandTotal.toFixed(2)} (${totalUnits} piezas, margen $${totalGrossMargin.toFixed(2)} / ${totalMarginPercent}%). Método: ${payment.method.toUpperCase()}.`,
    result: 'Transacción exitosa',
    storeId: storeProfile.id || 'store-1',
  };

  return {
    sale,
    updatedInventory,
    movements,
    auditLog,
  };
}

/**
 * Processes a refund/return transaction.
 * Returns stock to inventory, records Kardex devolution, updates sale status to 'REFUNDED'.
 */
export function processRefundTransaction(params: {
  sale: SaleTransaction;
  refundReason: string;
  restockItems: boolean;
  storeProfile: StoreProfile;
  cashierName: string;
  inventory: InventoryItem[];
}): {
  refundedSale: SaleTransaction;
  updatedInventory: InventoryItem[];
  movements: InventoryMovement[];
  auditLog: AuditLogEntry;
} {
  const { sale, refundReason, restockItems, storeProfile, cashierName, inventory } = params;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  const refundedSale: SaleTransaction = {
    ...sale,
    status: 'REFUNDED',
    refundAmount: sale.total,
    refundTimestamp: timeStr,
    refundReason,
  };

  let updatedInventory = inventory;
  const movements: InventoryMovement[] = [];

  if (restockItems) {
    // Restock items back into inventory
    updatedInventory = inventory.map((invItem) => {
      const refundedItem = sale.items.find(
        (si) => si.productId === invItem.id || si.barcode === invItem.barcode
      );

      if (refundedItem) {
        const newStock = invItem.currentStock + refundedItem.quantity;
        const newDaysOfStock = invItem.avgDailySales > 0 ? newStock / invItem.avgDailySales : 10;
        return {
          ...invItem,
          currentStock: newStock,
          daysOfStock: roundCurrency(newDaysOfStock),
          stockStatus: (newDaysOfStock < 2.5 
            ? 'CRÍTICO' 
            : newDaysOfStock > 20 
            ? 'SOBRESTOCK' 
            : 'NORMAL') as InventoryItem['stockStatus'],
          lastUpdated: 'Hoy',
        };
      }
      return invItem;
    });

    // Create Kardex 'devolucion' entries
    (sale.items || []).forEach((item, idx) => {
      movements.push({
        id: `mov-dev-${Date.now()}-${idx}`,
        date: 'Hoy',
        timestamp: timeStr,
        productId: item.productId,
        productName: item.productName,
        barcode: item.barcode,
        quantity: item.quantity, // Inflow back
        type: 'devolucion',
        typeLabel: `Devolución Ticket #${sale.ticketNumber}`,
        unitCost: item.unitCost,
        user: cashierName || storeProfile.ownerName || 'Cajero',
        storeId: storeProfile.id || 'store-1',
        reference: `Devolución #${sale.ticketNumber}`,
        motive: `Motivo: ${refundReason}`,
      });
    });
  }

  const auditLog: AuditLogEntry = {
    id: `aud-ref-${Date.now()}`,
    date: 'Hoy',
    timestamp: timeStr,
    actor: `${cashierName || storeProfile.ownerName} (Cajero/Admin)`,
    action: `Devolución procesada (Ticket #${sale.ticketNumber})`,
    detail: `Reembolso total de $${sale.total.toFixed(2)}. Motivo: ${refundReason}. Reingreso a inventario: ${restockItems ? 'SÍ' : 'NO'}.`,
    result: 'Devolución registrada en Kardex',
    storeId: storeProfile.id || 'store-1',
  };

  return {
    refundedSale,
    updatedInventory,
    movements,
    auditLog,
  };
}

/**
 * Processes a ticket cancellation.
 */
export function processCancelTransaction(params: {
  sale: SaleTransaction;
  cancellationMotive: string;
  storeProfile: StoreProfile;
  cashierName: string;
  inventory: InventoryItem[];
}): {
  cancelledSale: SaleTransaction;
  updatedInventory: InventoryItem[];
  movements: InventoryMovement[];
  auditLog: AuditLogEntry;
} {
  const { sale, cancellationMotive, storeProfile, cashierName, inventory } = params;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  const cancelledSale: SaleTransaction = {
    ...sale,
    status: 'CANCELLED',
    cancellationMotive,
  };

  // Revert inventory
  const updatedInventory = inventory.map((invItem) => {
    const cancelledItem = sale.items.find(
      (si) => si.productId === invItem.id || si.barcode === invItem.barcode
    );

    if (cancelledItem) {
      const newStock = invItem.currentStock + cancelledItem.quantity;
      const newDaysOfStock = invItem.avgDailySales > 0 ? newStock / invItem.avgDailySales : 10;
      return {
        ...invItem,
        currentStock: newStock,
        daysOfStock: roundCurrency(newDaysOfStock),
        stockStatus: (newDaysOfStock < 2.5 
          ? 'CRÍTICO' 
          : newDaysOfStock > 20 
          ? 'SOBRESTOCK' 
          : 'NORMAL') as InventoryItem['stockStatus'],
        lastUpdated: 'Hoy',
      };
    }
    return invItem;
  });

  const movements: InventoryMovement[] = sale.items.map((item, idx) => ({
    id: `mov-can-${Date.now()}-${idx}`,
    date: 'Hoy',
    timestamp: timeStr,
    productId: item.productId,
    productName: item.productName,
    barcode: item.barcode,
    quantity: item.quantity,
    type: 'ajuste',
    typeLabel: `Cancelación Ticket #${sale.ticketNumber}`,
    unitCost: item.unitCost,
    user: cashierName || storeProfile.ownerName || 'Cajero',
    storeId: storeProfile.id || 'store-1',
    reference: `Anulación #${sale.ticketNumber}`,
    motive: `Cancelación autorizada. Motivo: ${cancellationMotive}`,
  }));

  const auditLog: AuditLogEntry = {
    id: `aud-can-${Date.now()}`,
    date: 'Hoy',
    timestamp: timeStr,
    actor: `${cashierName || storeProfile.ownerName} (Admin)`,
    action: `Cancelación de ticket #${sale.ticketNumber}`,
    detail: `Anulación de venta de $${sale.total.toFixed(2)}. Motivo: ${cancellationMotive}. Inventario revertido.`,
    result: 'Ticket cancelado',
    storeId: storeProfile.id || 'store-1',
  };

  return {
    cancelledSale,
    updatedInventory,
    movements,
    auditLog,
  };
}

/**
 * Top-level State Wrapper: Executes a sale atomically and returns updated domain slices.
 */
export function executeSaleTransaction(
  inventory: InventoryItem[],
  movements: InventoryMovement[],
  auditLogs: AuditLogEntry[],
  storeId: string,
  cashierName: string,
  saleItems: SaleItem[],
  payment: PaymentRecord,
  notes?: string
): {
  sale: SaleTransaction;
  updatedInventory: InventoryItem[];
  updatedMovements: InventoryMovement[];
  updatedAuditLogs: AuditLogEntry[];
} {
  const ticketNumber = 1000 + movements.length + 1;
  const storeProfile: StoreProfile = {
    id: storeId,
    storeName: 'Mi Tienda',
    ownerName: cashierName,
    phone: '',
    zone: 'Centro',
    address: '',
    posIntegrated: true,
    hasBarcodeScanner: true,
  };

  const res = processSaleTransaction({
    items: saleItems,
    payment,
    storeProfile,
    cashierName,
    ticketNumber,
    inventory,
    customerNote: notes,
  });

  return {
    sale: res.sale,
    updatedInventory: res.updatedInventory,
    updatedMovements: [...res.movements, ...movements],
    updatedAuditLogs: [res.auditLog, ...auditLogs],
  };
}

/**
 * Top-level State Wrapper: Executes a refund atomically and returns updated domain slices.
 */
export function executeRefundTransaction(
  inventory: InventoryItem[],
  movements: InventoryMovement[],
  auditLogs: AuditLogEntry[],
  sales: SaleTransaction[],
  saleId: string,
  cashierName: string,
  refundReason: string,
  restock: boolean
): {
  updatedSales: SaleTransaction[];
  updatedInventory: InventoryItem[];
  updatedMovements: InventoryMovement[];
  updatedAuditLogs: AuditLogEntry[];
} {
  const sale = sales.find((s) => s.id === saleId);
  if (!sale) {
    return {
      updatedSales: sales,
      updatedInventory: inventory,
      updatedMovements: movements,
      updatedAuditLogs: auditLogs,
    };
  }

  const storeProfile: StoreProfile = {
    id: sale.storeId,
    storeName: 'Mi Tienda',
    ownerName: cashierName,
    phone: '',
    zone: 'Centro',
    address: '',
    posIntegrated: true,
    hasBarcodeScanner: true,
  };

  const res = processRefundTransaction({
    sale,
    refundReason,
    restockItems: restock,
    storeProfile,
    cashierName,
    inventory,
  });

  return {
    updatedSales: sales.map((s) => (s.id === saleId ? res.refundedSale : s)),
    updatedInventory: res.updatedInventory,
    updatedMovements: [...res.movements, ...movements],
    updatedAuditLogs: [res.auditLog, ...auditLogs],
  };
}

/**
 * Top-level State Wrapper: Executes a ticket cancellation atomically and returns updated domain slices.
 */
export function executeCancelTransaction(
  inventory: InventoryItem[],
  movements: InventoryMovement[],
  auditLogs: AuditLogEntry[],
  sales: SaleTransaction[],
  saleId: string,
  cashierName: string,
  cancellationMotive: string
): {
  updatedSales: SaleTransaction[];
  updatedInventory: InventoryItem[];
  updatedMovements: InventoryMovement[];
  updatedAuditLogs: AuditLogEntry[];
} {
  const sale = sales.find((s) => s.id === saleId);
  if (!sale) {
    return {
      updatedSales: sales,
      updatedInventory: inventory,
      updatedMovements: movements,
      updatedAuditLogs: auditLogs,
    };
  }

  const storeProfile: StoreProfile = {
    id: sale.storeId,
    storeName: 'Mi Tienda',
    ownerName: cashierName,
    phone: '',
    zone: 'Centro',
    address: '',
    posIntegrated: true,
    hasBarcodeScanner: true,
  };

  const res = processCancelTransaction({
    sale,
    cancellationMotive,
    storeProfile,
    cashierName,
    inventory,
  });

  return {
    updatedSales: sales.map((s) => (s.id === saleId ? res.cancelledSale : s)),
    updatedInventory: res.updatedInventory,
    updatedMovements: [...res.movements, ...movements],
    updatedAuditLogs: [res.auditLog, ...auditLogs],
  };
}
