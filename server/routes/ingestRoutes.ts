import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/database.js';
import { dataHub } from '../datahub/DataHub.js';
import { googleSheetsIntelligenceAgent } from '../engine/GoogleSheetsIntelligenceAgent.js';
import { MasterProduct } from '../types.js';

export const ingestRouter = Router();

/**
 * Middleware de autenticación flexible para Zapier
 */
const authenticateBearer = (req: Request, res: Response, next: NextFunction) => {
  const expectedToken = process.env.INGEST_API_KEY || process.env.ZAPIER_API_KEY || process.env.API_SECRET_KEY;
  if (!expectedToken) {
    // Si no hay token configurado en variables de entorno, permite la solicitud de Zapier sin bloqueo.
    return next();
  }

  // Extraer token desde diversas fuentes posibles que utiliza Zapier
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-api-key']) {
    token = String(req.headers['x-api-key']).trim();
  } else if (req.query.api_key || req.query.token) {
    token = String(req.query.api_key || req.query.token).trim();
  } else if (req.body && (req.body.api_key || req.body.token)) {
    token = String(req.body.api_key || req.body.token).trim();
  }

  if (token && token === expectedToken) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'Unauthorized: Se requiere un token de autenticación válido para Zapier.'
  });
};

ingestRouter.use(authenticateBearer);

/**
 * POST /api/ingest/products
 * Endpoint Adapter para Zapier e Ingesta Externa de Productos.
 * Traduce el contrato externo de Zapier al modelo de datos canónico del sistema.
 */
ingestRouter.post('/products', async (req: Request, res: Response) => {
  try {
    const result = dataHub.recordScraperObservation(req.body);
    
    // Sync external layers
    googleSheetsIntelligenceAgent.syncFromDatabase();
    googleSheetsIntelligenceAgent.exportMiniCloudDatabaseFile();

    const statusCode = result.isNew ? 201 : 200;
    const actionType = result.isNew ? 'INSERT' : 'UPSERT';

    return res.status(statusCode).json({
      success: true,
      action: actionType,
      message: `Producto ${actionType === 'INSERT' ? 'creado' : 'actualizado'} exitosamente en el catálogo maestro.`,
      product: {
        product_id: result.product.id,
        source_id: req.body.source_id || '',
        sku: result.product.sku,
        name: result.product.canonicalName,
        brand: result.product.brand,
        category: result.product.category,
        price: result.product.avgRetailPriceCdmx,
        currency: 'MXN',
        unit: result.product.unit,
        availability: result.product.active ? 'in_stock' : 'out_of_stock',
        product_url: req.body.product_url || '',
        image_url: req.body.image_url || '',
        scraped_at: result.product.lastUpdated
      }
    });
  } catch (err: any) {
    console.error('[INGEST PRODUCTS ERROR]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Error interno durante la ingesta de productos.'
    });
  }
});