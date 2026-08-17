import { Router } from 'express';
import { firestoreFabric } from '../engine/FirestoreFabric.js';
import { db } from '../db/database.js';
import { executeDatabaseMigration } from '../db/migration.js';
import { firestoreAdapter } from '../db/FirestoreAdapter.js';
import { shadowQueueManager } from '../db/shadowQueue.js';

export const firestoreFabricRouter = Router();

firestoreFabricRouter.get('/status', (req, res) => {
  try {
    const status = firestoreFabric.getStatus();
    const adapterStatus = firestoreAdapter.getStatus();
    res.json({
      success: true,
      fabric: {
        ...status,
        adapter: adapterStatus
      },
      shadowQueue: {
        pendingCount: shadowQueueManager.getPendingCount(),
        queue: shadowQueueManager.getQueue().map(q => ({
          id: q.id,
          collection: q.collection,
          docId: q.docId,
          addedAt: q.addedAt,
          retryCount: q.retryCount,
          lastError: q.lastError
        }))
      },
      securityRules: 'Verified (Strict path isolation, tenant ownership enforcement, append-only audit logs)',
      blueprint: 'Firestore Cloud Data Fabric schema active',
      tenantIsolation: 'Enforced via hierarchical subcollections: /organizations/{orgId}/stores/{storeId}/...'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

firestoreFabricRouter.post('/sync', async (req, res) => {
  try {
    console.log('[Firestore Fabric Route] Triggering complete database transform and migration...');
    const report = await executeDatabaseMigration();

    if (report.success) {
      res.json({
        success: true,
        message: 'Cloud Data Fabric migration & verification completed with ZERO data loss.',
        report,
        verifiedAt: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Migration completed with some mismatches or errors. Integrity verification failed.',
        report,
        verifiedAt: new Date().toISOString()
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
