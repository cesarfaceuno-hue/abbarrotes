import { Router, Request, Response, NextFunction } from 'express';
import { GlobalProductRepository } from '../db/repositories/GlobalProductRepository.js';

export const globalProductRouter = Router();
const globalProductRepo = new GlobalProductRepository();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ success: false, error: message });
  });
};

// GET /api/products/global
globalProductRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const products = await globalProductRepo.getAll();
    res.json({ success: true, count: products.length, products });
  })
);

// GET /api/products/global/:id
globalProductRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await globalProductRepo.getById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: `Product with ID ${id} not found` });
    }
    res.json({ success: true, product });
  })
);

// GET /api/products/global/barcode/:barcode
globalProductRouter.get(
  '/barcode/:barcode',
  asyncHandler(async (req: Request, res: Response) => {
    const { barcode } = req.params;
    const product = await globalProductRepo.getByBarcode(barcode);
    if (!product) {
      return res.status(404).json({ success: false, error: `Product with barcode ${barcode} not found` });
    }
    res.json({ success: true, product });
  })
);

// POST /api/products/global
globalProductRouter.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      canonicalName,
      brand,
      category,
      subcategory,
      barcode,
      sku,
      presentation,
      unit,
      packSize,
      avgRetailPriceCdmx,
      cheapestWholesaleCost,
      cheapestSupplierId,
      active,
    } = req.body;

    // Validation
    if (!canonicalName) {
      return res.status(422).json({ success: false, error: 'canonicalName is required' });
    }
    if (!brand) {
      return res.status(400).json({ success: false, error: 'brand is required' });
    }
    if (!category) {
      return res.status(400).json({ success: false, error: 'category is required' });
    }

    const id = await globalProductRepo.create({
      canonicalName,
      brand,
      category,
      subcategory,
      barcode,
      sku,
      presentation: presentation || 'PZA',
      unit: unit || 'pieza',
      packSize: packSize || 1,
      avgRetailPriceCdmx: avgRetailPriceCdmx || 0,
      cheapestWholesaleCost: cheapestWholesaleCost || 0,
      cheapestSupplierId: cheapestSupplierId || '',
      active: active !== undefined ? active : true,
      lastUpdated: new Date().toISOString(),
    });

    const product = await globalProductRepo.getById(id);
    res.status(201).json({ success: true, message: 'Global product created successfully', product });
  })
);
