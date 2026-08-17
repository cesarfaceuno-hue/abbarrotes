import { Router } from 'express';
import { productionOperations } from '../engine/ProductionOperations.js';

export const operationsRouter = Router();

operationsRouter.get('/health', (req, res) => {
  try {
    const health = productionOperations.getHealthStatus();
    res.json({
      success: true,
      operations: health
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

operationsRouter.post('/backup', async (req, res) => {
  try {
    const backup = await productionOperations.executeBackup();
    res.json({
      success: true,
      message: 'Firestore snapshot backup completed successfully.',
      backup
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

operationsRouter.post('/restore', async (req, res) => {
  try {
    const { backupId } = req.body;
    const result = await productionOperations.executeRestore(backupId);
    res.json({
      success: true,
      message: 'Firestore database successfully restored from snapshot backup.',
      result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
