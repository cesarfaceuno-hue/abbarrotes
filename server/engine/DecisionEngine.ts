import { db } from '../db/database.js';
import { DecisionRecord, DecisionEvidence, InventoryItem, MasterProduct, SupplierOffer } from '../types.js';

export class DecisionEngine {
  private tenantId = 'tenant-demo';
  private organizationId = 'org-1';
  private storeId = 'store-cdmx-1';

  public async evaluateAll(): Promise<void> {
    const inventory = db.getInventory().filter(i => i.tenantId === this.tenantId && i.storeId === this.storeId);
    const products = db.getMasterProducts();
    const offers = db.getSupplierOffers();

    for (const item of inventory) {
      const product = products.find(p => p.id === item.masterProductId);
      if (!product) continue;

      this.evaluateStockoutRisk(item, product);
      this.evaluateMarginSqueeze(item, product, offers);
      this.evaluateDeadStock(item, product);
      this.evaluateSupplierArbitrage(item, product, offers);
    }
  }

  private evaluateStockoutRisk(item: InventoryItem, product: MasterProduct) {
    // Days of stock = quantity / averageDailySales
    const daysOfStock = item.averageDailySales > 0 ? item.quantity / item.averageDailySales : 999;
    
    if (daysOfStock < item.supplierLeadTimeDays) {
      const estimatedLostUnits = (item.supplierLeadTimeDays - daysOfStock) * item.averageDailySales;
      const estimatedLostRevenue = estimatedLostUnits * item.retailPrice;

      const evidence: DecisionEvidence[] = [
        {
          type: 'INVENTORY_LEVEL',
          value: item.quantity,
          label: 'Inventario Actual',
          timestamp: new Date().toISOString()
        },
        {
          type: 'SALES_VELOCITY',
          value: item.averageDailySales,
          label: 'Ventas Diarias Promedio',
          timestamp: new Date().toISOString()
        }
      ];

      const severity = daysOfStock <= 1 ? 'CRITICAL' : 'HIGH';

      this.createOrUpdateDecision({
        id: `dec-stockout-${item.masterProductId}`,
        tenantId: this.tenantId,
        organizationId: this.organizationId,
        storeId: this.storeId,
        type: 'STOCKOUT_RISK',
        severity,
        status: 'PENDING',
        what: `Riesgo de quiebre de stock para ${product.canonicalName}`,
        why: `El inventario actual (${item.quantity} uds) se agotará en ${daysOfStock.toFixed(1)} días. El tiempo de entrega del proveedor es ${item.supplierLeadTimeDays} días.`,
        rootCause: 'La velocidad de ventas supera el inventario de cobertura.',
        evidence,
        dataQuality: 'VALID',
        financialImpact: -estimatedLostRevenue,
        estimatedSavings: 0,
        estimatedLostRevenue,
        estimatedMarginImpact: 0,
        confidence: 90, // Deterministic based on current velocity
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        consequenceIfIgnored: `Pérdida estimada de venta de $${estimatedLostRevenue.toFixed(2)}`,
        recommendedAction: `Pedir ${Math.ceil(item.averageDailySales * 7)} unidades para cobertura semanal.`,
        actionType: 'CREATE_PURCHASE_ORDER',
        requiresApproval: true,
        relatedMasterProductId: product.id
      });
    }
  }

  private evaluateMarginSqueeze(item: InventoryItem, product: MasterProduct, offers: SupplierOffer[]) {
    // Product cheapest wholesale cost might have gone up
    const currentMargin = ((item.retailPrice - item.unitCost) / item.retailPrice) * 100;

    if (currentMargin < item.targetMargin) {
      const marginLossPerUnit = (item.targetMargin / 100 * item.retailPrice) - (item.retailPrice - item.unitCost);
      const estimatedMonthlyLoss = marginLossPerUnit * item.averageDailySales * 30;

      const evidence: DecisionEvidence[] = [
        {
          type: 'COST_CHANGE',
          value: item.unitCost,
          label: 'Costo Unitario Actual',
          timestamp: new Date().toISOString()
        },
        {
          type: 'PRICE_OBSERVATION',
          value: item.retailPrice,
          label: 'Precio de Venta Actual',
          timestamp: new Date().toISOString()
        }
      ];

      this.createOrUpdateDecision({
        id: `dec-margin-${item.masterProductId}`,
        tenantId: this.tenantId,
        organizationId: this.organizationId,
        storeId: this.storeId,
        type: 'MARGIN_SQUEEZE',
        severity: currentMargin < (item.targetMargin - 10) ? 'HIGH' : 'MEDIUM',
        status: 'PENDING',
        what: `Compresión de margen en ${product.canonicalName}`,
        why: `El margen actual es ${currentMargin.toFixed(1)}%, por debajo del objetivo de ${item.targetMargin}%.`,
        rootCause: 'Incremento del costo del proveedor o precio de venta estancado.',
        evidence,
        dataQuality: 'VALID',
        financialImpact: -estimatedMonthlyLoss,
        estimatedSavings: 0,
        estimatedLostRevenue: 0,
        estimatedMarginImpact: estimatedMonthlyLoss,
        confidence: 95,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        consequenceIfIgnored: `Pérdida mensual de margen de $${estimatedMonthlyLoss.toFixed(2)}`,
        recommendedAction: `Ajustar el precio público a $${(item.unitCost / (1 - (item.targetMargin/100))).toFixed(2)} o buscar proveedor más barato.`,
        actionType: 'UPDATE_PRICE',
        requiresApproval: true,
        relatedMasterProductId: product.id
      });
    }
  }

  private evaluateDeadStock(item: InventoryItem, product: MasterProduct) {
    if (item.averageDailySales < 0.2 && item.quantity > 10) {
      const capitalBlocked = item.quantity * item.unitCost;
      
      const evidence: DecisionEvidence[] = [
        {
          type: 'SALES_VELOCITY',
          value: item.averageDailySales,
          label: 'Ventas Diarias Promedio',
          timestamp: new Date().toISOString()
        },
        {
          type: 'INVENTORY_LEVEL',
          value: item.quantity,
          label: 'Inventario Estancado',
          timestamp: new Date().toISOString()
        }
      ];

      this.createOrUpdateDecision({
        id: `dec-deadstock-${item.masterProductId}`,
        tenantId: this.tenantId,
        organizationId: this.organizationId,
        storeId: this.storeId,
        type: 'DEAD_STOCK',
        severity: capitalBlocked > 500 ? 'HIGH' : 'MEDIUM',
        status: 'PENDING',
        what: `Capital bloqueado en ${product.canonicalName}`,
        why: `Producto sin rotación (Venta diaria: ${item.averageDailySales.toFixed(2)}). Capital inmovilizado: $${capitalBlocked.toFixed(2)}.`,
        rootCause: 'Demanda sobreestimada o mala exposición en tienda.',
        evidence,
        dataQuality: 'VALID',
        financialImpact: -capitalBlocked,
        estimatedSavings: 0,
        estimatedLostRevenue: 0,
        estimatedMarginImpact: 0,
        confidence: 85,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        consequenceIfIgnored: `Capital bloqueado de $${capitalBlocked.toFixed(2)} y riesgo de caducidad.`,
        recommendedAction: `Aplicar descuento promocional o crear bundle para liquidar.`,
        actionType: 'CREATE_PROMOTION',
        requiresApproval: true,
        relatedMasterProductId: product.id
      });
    }
  }

  private evaluateSupplierArbitrage(item: InventoryItem, product: MasterProduct, offers: SupplierOffer[]) {
    // Find if there's a better supplier offer than current unitCost
    const productOffers = offers.filter(o => o.masterProductId === product.id && o.price < item.unitCost && o.availability === 'IN_STOCK');
    
    if (productOffers.length > 0) {
      // Sort by best price
      productOffers.sort((a, b) => a.price - b.price);
      const bestOffer = productOffers[0];

      const unitSavings = item.unitCost - bestOffer.price;
      const expectedPurchaseQty = Math.ceil(item.averageDailySales * 14); // 2 weeks supply
      const totalSavings = unitSavings * expectedPurchaseQty;

      if (totalSavings > 20) { // Arbitrage worth it threshold
        const evidence: DecisionEvidence[] = [
          {
            type: 'SUPPLIER_OFFER',
            value: bestOffer.price,
            label: `Oferta en ${bestOffer.supplierName}`,
            source: bestOffer.supplierName,
            sourceUrl: bestOffer.sourceUrl,
            timestamp: bestOffer.observedAt
          },
          {
            type: 'COST_CHANGE',
            value: item.unitCost,
            label: 'Costo Histórico Actual',
            timestamp: new Date().toISOString()
          }
        ];

        this.createOrUpdateDecision({
          id: `dec-arbitrage-${item.masterProductId}`,
          tenantId: this.tenantId,
          organizationId: this.organizationId,
          storeId: this.storeId,
          type: 'SUPPLIER_ARBITRAGE',
          severity: totalSavings > 200 ? 'HIGH' : 'MEDIUM',
          status: 'PENDING',
          what: `Oportunidad de ahorro en ${product.canonicalName}`,
          why: `El proveedor ${bestOffer.supplierName} ofrece el producto a $${bestOffer.price.toFixed(2)}, inferior a tu costo de $${item.unitCost.toFixed(2)}.`,
          rootCause: 'Discrepancia de precios en el mercado mayorista.',
          evidence,
          dataQuality: 'VALID',
          financialImpact: totalSavings,
          estimatedSavings: totalSavings,
          estimatedLostRevenue: 0,
          estimatedMarginImpact: 0,
          confidence: 95,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          consequenceIfIgnored: `Se perderán $${totalSavings.toFixed(2)} en ahorros potenciales en la próxima compra.`,
          recommendedAction: `Comprar ${expectedPurchaseQty} unidades en ${bestOffer.supplierName}.`,
          actionType: 'CHANGE_SUPPLIER',
          requiresApproval: true,
          relatedMasterProductId: product.id
        });
      }
    }
  }

  private createOrUpdateDecision(decision: DecisionRecord) {
    const existing = db.getDecisionById(decision.id);
    if (!existing || existing.status === 'PENDING') {
      db.upsertDecision(decision);
    }
  }
}

export const decisionEngine = new DecisionEngine();
