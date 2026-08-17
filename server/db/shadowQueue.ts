import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getFirebaseAdmin } from './firebase.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const QUEUE_FILE = path.join(DATA_DIR, 'pending_shadow_syncs.json');
const CONFIG_FILE = path.join(process.cwd(), 'firebase-applet-config.json');

export interface PendingSyncItem {
  id: string;
  collection: string;
  docId: string;
  data: any;
  addedAt: string;
  retryCount: number;
  lastError?: string;
}

export class ShadowQueueManager {
  private queue: PendingSyncItem[] = [];
  private isProcessing = false;
  private workerInterval: NodeJS.Timeout | null = null;
  private config: { projectId: string; databaseId: string } = {
    projectId: 'gen-lang-client-0101148954',
    databaseId: 'ai-studio-remixabarrotesia-0ec72b82-5b2a-41dc-9f50-e8a10c5f84b3'
  };

  constructor() {
    this.ensureDataDirectory();
    this.loadQueue();
    this.loadFirebaseConfig();
    this.startWorker();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadFirebaseConfig() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        if (config.projectId) this.config.projectId = config.projectId;
        if (config.firestoreDatabaseId) this.config.databaseId = config.firestoreDatabaseId;
      }
    } catch (e) {
      // Ignore config file errors
    }
  }

  private loadQueue() {
    try {
      if (fs.existsSync(QUEUE_FILE)) {
        const content = fs.readFileSync(QUEUE_FILE, 'utf-8');
        this.queue = JSON.parse(content);
        console.log(`[ShadowQueue] Loaded ${this.queue.length} pending shadow sync items from disk.`);
      } else {
        this.queue = [];
      }
    } catch (err: any) {
      console.error('[ShadowQueue Error] Failed loading queue:', err.message);
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      this.ensureDataDirectory();
      fs.writeFileSync(QUEUE_FILE, JSON.stringify(this.queue, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('[ShadowQueue Error] Failed saving queue to disk:', err.message);
    }
  }

  /**
   * Appends a shadow write task to the queue.
   */
  public enqueue(collection: string, docId: string, data: any) {
    // Check if task already exists in queue to prevent duplicate piling
    const exists = this.queue.some(item => item.collection === collection && item.docId === docId);
    if (exists) {
      // Update data of existing item to latest state
      const idx = this.queue.findIndex(item => item.collection === collection && item.docId === docId);
      this.queue[idx].data = data;
      this.queue[idx].addedAt = new Date().toISOString();
      this.saveQueue();
      return;
    }

    const newItem: PendingSyncItem = {
      id: crypto.randomBytes(8).toString('hex'),
      collection,
      docId,
      data,
      addedAt: new Date().toISOString(),
      retryCount: 0
    };

    this.queue.push(newItem);
    this.saveQueue();
    console.log(`[ShadowQueue] Enqueued item for /${collection}/${docId}. Queue size: ${this.queue.length}`);
    
    // Trigger processing immediately in background
    this.processQueue();
  }

  /**
   * Starts a background worker that runs periodically to drain any pending items
   */
  private startWorker() {
    if (this.workerInterval) return;
    this.workerInterval = setInterval(() => {
      this.processQueue();
    }, 15000); // Check and retry every 15 seconds
  }

  /**
   * Processes all pending items in the queue
   */
  public async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    console.log(`[ShadowQueue] Worker processing ${this.queue.length} pending items...`);
    const successfulIds: string[] = [];

    try {
      const admin = getFirebaseAdmin({
        projectId: this.config.projectId,
        databaseId: this.config.databaseId
      });
      const firestore = admin.db;

      for (const item of this.queue) {
        try {
          // Sanitize data
          const sanitizedData = JSON.parse(JSON.stringify(item.data, (key, value) => {
            if (value === undefined) return null;
            return value;
          }));

          // Try syncing to Firestore
          await firestore.collection(item.collection).doc(item.docId).set({
            ...sanitizedData,
            _shadowSyncedAt: new Date().toISOString(),
            _syncStatus: 'SYNCED'
          }, { merge: true });

          successfulIds.push(item.id);
          console.log(`[ShadowQueue] Successfully synced /${item.collection}/${item.docId}`);
        } catch (itemErr: any) {
          item.retryCount++;
          item.lastError = itemErr.message;
          console.warn(`[ShadowQueue Mismatch] Failed syncing /${item.collection}/${item.docId} (Retry: ${item.retryCount}): ${itemErr.message}`);
        }
      }

      // Remove successful syncs
      if (successfulIds.length > 0) {
        this.queue = this.queue.filter(item => !successfulIds.includes(item.id));
        this.saveQueue();
      }

    } catch (gErr: any) {
      console.warn(`[ShadowQueue Offline] Firebase Admin SDK unavailable or offline: ${gErr.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public getQueue(): PendingSyncItem[] {
    return this.queue;
  }
}

export const shadowQueueManager = new ShadowQueueManager();
