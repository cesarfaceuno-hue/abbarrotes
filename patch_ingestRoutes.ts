import fs from 'fs';

const filePath = 'server/routes/ingestRoutes.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "import { db } from '../db/database.js';",
  "import { db } from '../db/database.js';\nimport { dataHub } from '../datahub/DataHub.js';"
);

// We want to replace the logic inside ingestRouter.post('/products', ...)
// Actually it's simpler to just rewrite the ingestRouter.post entirely using regex or indexOf.
const startIdx = content.indexOf("ingestRouter.post('/products',");
if (startIdx !== -1) {
  const replacement = `ingestRouter.post('/products', async (req: Request, res: Response) => {
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
      message: \`Producto \${actionType === 'INSERT' ? 'creado' : 'actualizado'} exitosamente en el catálogo maestro.\`,
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
});`;

  // Find the end of the post block
  // It's the last function in the file, so we can just replace everything after startIdx.
  content = content.substring(0, startIdx) + replacement;
  fs.writeFileSync(filePath, content);
}
