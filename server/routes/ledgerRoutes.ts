import { Router, Request, Response, NextFunction } from 'express';
import { LedgerRepository } from '../db/repositories/LedgerRepository.js';
import { MovementType } from '../types.js';

export const ledgerRouter = Router();
const ledgerRepo = new LedgerRepository();

function getContext(req: Request) {
  const tenantId = (req.headers['x-tenant-id'] || req.query.tenantId || req.body.tenantId || 'tenant-cdmx-01') as string;
  const storeId = (req.headers['x-store-id'] || req.query.storeId || req.body.storeId || 'store-cdmx-centro') as string;
  
  const userTenantId = req.headers['x-user-tenant-id'] as string;
  if (userTenantId && userTenantId !== tenantId) {
    const error = new Error('Forbidden: Tenant isolation mismatch');
    (error as any).status = 403;
    throw error;
  }

  return { tenantId, storeId };
}

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ success: false, error: message });
  });
};

// GET /api/ledger
ledgerRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { tenantId, storeId } = getContext(req);
    const movements = await ledgerRepo.getMovements(tenantId, storeId);
    res.json({ success: true, count: movements.length, movements });
  })
);

// POST /api/ledger
ledgerRouter.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { tenantId, storeId } = getContext(req);
    const { productId, type, quantity, previousStock, resultingStock, referenceId, requestId, actorId, reason } = req.body;

    // Validation
    if (!productId) {
      return res.status(422).json({ success: false, error: 'productId is required' });
    }
    if (!type) {
      return res.status(400).json({ success: false, error: 'type is required' });
    }
    if (quantity === undefined || typeof quantity !== 'number') {
      return res.status(400).json({ success: false, error: 'quantity must be a number' });
    }

    const id = await ledgerRepo.createMovement({
      tenantId,
      storeId,
      productId,
      type: type as MovementType,
      quantity,
      previousStock: previousStock || 0,
      resultingStock: resultingStock || 0,
      referenceId: referenceId || `ref-${Math.random().toString(36).substring(7)}`,
      requestId: requestId || `req-${Math.random().toString(36).substring(7)}`,
      actorId: actorId || 'API_User',
      reason: reason || 'Manual Ledger Entry',
    });

    res.status(201).json({ success: true, message: 'Ledger entry created successfully', id });
  })
);
