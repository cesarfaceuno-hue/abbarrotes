import { Router, Request, Response, NextFunction } from 'express';
import { DiscoveryEngine, MatchingEngine, NormalizationEngine } from '../engine/DiscoveryAndMatchingEngine.js';

export const discoveryRouter = Router();
const discoveryEngine = new DiscoveryEngine();

// Context helper with multi-tenant protection
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

// POST /api/discovery/match
discoveryRouter.post(
  '/match',
  asyncHandler(async (req: Request, res: Response) => {
    const { tenantId, storeId } = getContext(req);
    const { query, brand, barcode, sku, presentation, unit } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: 'query is required' });
    }

    // 1. Normalización
    const normalizedTarget = NormalizationEngine.normalizeDetails(
      query,
      brand || '',
      barcode,
      sku,
      presentation,
      unit
    );

    // 2. Descubrimiento
    const discoveryResult = await discoveryEngine.discover({
      query,
      tenantId,
      storeId,
    });

    // 3. Matching
    const matchResults = MatchingEngine.match(normalizedTarget, discoveryResult.candidates);

    res.json({
      success: true,
      query,
      normalizedTarget,
      discoveryCount: discoveryResult.candidates.length,
      matchResults,
    });
  })
);
