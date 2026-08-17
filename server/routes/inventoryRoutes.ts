import { Router, Request, Response, NextFunction } from 'express';
import { InventoryRepository } from '../db/repositories/InventoryRepository.js';
import { MovementType } from '../types.js';

export const inventoryRouter = Router();
const inventoryRepo = new InventoryRepository();

// Helper to extract context and apply multi-tenant protection
function getContext(req: Request) {
  const tenantId = (req.headers['x-tenant-id'] || req.query.tenantId || req.body.tenantId || 'tenant-cdmx-01') as string;
  const storeId = (req.headers['x-store-id'] || req.query.storeId || req.body.storeId || 'store-cdmx-centro') as string;
  
  // Strict Tenant Isolation: If x-user-tenant-id is provided, it must match target tenantId
  const userTenantId = req.headers['x-user-tenant-id'] as string;
  if (userTenantId && userTenantId !== tenantId) {
    const error = new Error('Forbidden: Tenant isolation mismatch');
    (error as any).status = 403;
    throw error;
  }

  return { tenantId, storeId };
}

// Error Handling Wrapper
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
      success: false,
      error: message
    });
  });
};

// GET /api/inventory
inventoryRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { tenantId, storeId } = getContext(req);
    const items = await inventoryRepo.getAll(tenantId, storeId);
    res.json({ success: true, count: items.length, inventory: items });
  })
);

// GET /api/inventory/:productId
inventoryRouter.get(
  '/:productId',
  asyncHandler(async (req: Request, res: Response) => {
    const { tenantId, storeId } = getContext(req);
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    const item = await inventoryRepo.getByProductId(tenantId, storeId, productId);
    if (!item) {
      return res.status(404).json({ success: false, error: `Inventory item for product ${productId} not found` });
    }

    res.json({ success: true, item });
  })
);

// POST /api/inventory
inventoryRouter.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { tenantId, storeId } = getContext(req);
    const { masterProductId, stock, minStock, maxStock, unitCost, retailPrice, targetMargin, supplierLeadTimeDays, averageDailySales } = req.body;

    // Validation
    if (!masterProductId) {
      return res.status(422).json({ success: false, error: 'masterProductId is required' });
    }
    if (stock === undefined || stock < 0 || typeof stock !== 'number') {
      return res.status(400).json({ success: false, error: 'stock must be a non-negative number' });
    }
    if (minStock === undefined || minStock < 0 || typeof minStock !== 'number') {
      return res.status(400).json({ success: false, error: 'minStock must be a non-negative number' });
    }
    if (maxStock === undefined || maxStock < 0 || typeof maxStock !== 'number') {
      return res.status(400).json({ success: false, error: 'maxStock must be a non-negative number' });
    }
    if (unitCost === undefined || unitCost < 0 || typeof unitCost !== 'number') {
      return res.status(400).json({ success: false, error: 'unitCost must be a non-negative number' });
    }
    if (retailPrice === undefined || retailPrice < 0 || typeof retailPrice !== 'number') {
      return res.status(400).json({ success: false, error: 'retailPrice must be a non-negative number' });
    }

    // Check conflict
    const existing = await inventoryRepo.getByProductId(tenantId, storeId, masterProductId);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Inventory item already exists for this product' });
    }

    const itemId = await inventoryRepo.create({
      tenantId,
      storeId,
      masterProductId,
      stock,
      minStock,
      maxStock,
      reorderPoint: minStock * 1.5,
      unitCost,
      retailPrice,
      targetMargin: targetMargin || 20,
      supplierLeadTimeDays: supplierLeadTimeDays || 3,
      averageDailySales: averageDailySales || 0,
    });

    const item = await inventoryRepo.getByProductId(tenantId, storeId, itemId);
    res.status(201).json({ success: true, message: 'Inventory item created successfully', item });
  })
);

// PUT/PATCH /api/inventory/:productId
inventoryRouter.patch(
  '/:productId',
  asyncHandler(async (req: Request, res: Response) => {
    const { tenantId, storeId } = getContext(req);
    const { productId } = req.params;
    const updates = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    const existing = await inventoryRepo.getByProductId(tenantId, storeId, productId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Inventory item not found' });
    }

    // Validate numeric fields in updates if they exist
    const numericFields = ['stock', 'minStock', 'maxStock', 'unitCost', 'retailPrice', 'targetMargin', 'supplierLeadTimeDays', 'averageDailySales'];
    for (const field of numericFields) {
      if (updates[field] !== undefined) {
        if (typeof updates[field] !== 'number' || updates[field] < 0) {
          return res.status(400).json({ success: false, error: `${field} must be a non-negative number` });
        }
      }
    }

    await inventoryRepo.update(tenantId, storeId, productId, updates);
    const updated = await inventoryRepo.getByProductId(tenantId, storeId, productId);
    res.json({ success: true, message: 'Inventory item updated successfully', item: updated });
  })
);

// POST /api/inventory/movement
inventoryRouter.post(
  '/movement',
  asyncHandler(async (req: Request, res: Response) => {
    const { tenantId, storeId } = getContext(req);
    const { productId, quantity, type, reason, referenceId, requestId, actorId } = req.body;

    // Validation
    if (!productId) {
      return res.status(422).json({ success: false, error: 'productId is required' });
    }
    if (quantity === undefined || typeof quantity !== 'number' || quantity === 0) {
      return res.status(400).json({ success: false, error: 'quantity must be a non-zero number' });
    }
    if (!type) {
      return res.status(400).json({ success: false, error: 'type is required' });
    }

    try {
      await inventoryRepo.adjustStock(
        tenantId,
        storeId,
        productId,
        quantity,
        type as MovementType,
        referenceId || `ref-${Math.random().toString(36).substring(7)}`,
        requestId || `req-${Math.random().toString(36).substring(7)}`,
        actorId || 'API_User',
        reason || 'Manual Adjustment'
      );

      const item = await inventoryRepo.getByProductId(tenantId, storeId, productId);
      res.json({ success: true, message: 'Stock adjusted successfully', item });
    } catch (err: any) {
      if (err.message === 'INVENTORY_NOT_FOUND') {
        return res.status(404).json({ success: false, error: 'Inventory item not found for adjustment' });
      }
      if (err.message === 'INSUFFICIENT_STOCK') {
        return res.status(400).json({ success: false, error: 'Insufficient stock for this movement' });
      }
      throw err;
    }
  })
);
