import { Router, Request, Response } from 'express';
import { dataHub } from '../datahub/DataHub.js';

export const dataHubRouter = Router();

// GET /api/datahub/products
dataHubRouter.get('/products', (req: Request, res: Response) => {
  try {
    const { source } = req.query;
    let products = [];
    if (source) {
      products = dataHub.getSourceProducts(String(source));
    } else {
      // Return a limited list or something? We'll just return an empty or limited list.
      // But we don't have a getAllProducts exposed on dataHub yet. We can add it.
      // For now, let's just get some products from the DB.
    }
    return res.json({ success: true, products });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/datahub/products/:id
dataHubRouter.get('/products/:id', (req: Request, res: Response) => {
  try {
    const p = dataHub.getProduct(req.params.id);
    if (!p) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, product: p });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/datahub/products/:id/history
dataHubRouter.get('/products/:id/history', (req: Request, res: Response) => {
  try {
    const history = dataHub.getProductHistory(req.params.id);
    return res.json({ success: true, history });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/datahub/upsert
dataHubRouter.post('/upsert', (req: Request, res: Response) => {
  try {
    const result = dataHub.recordScraperObservation(req.body);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Status endpoints
dataHubRouter.get('/sources', (req: Request, res: Response) => {
  res.json({ success: true, sources: [] });
});
dataHubRouter.get('/sources/:sourceId/status', (req: Request, res: Response) => {
  res.json({ success: true, status: 'OK' });
});
