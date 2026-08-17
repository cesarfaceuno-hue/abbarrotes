import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'abarrotes_market_db.json');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

export interface BackupResult {
  success: boolean;
  backupPath?: string;
  timestamp: string;
  itemCounts?: {
    masterProducts: number;
    inventory: number;
    priceRecords: number;
    sales: number;
    decisions: number;
  };
  sha256?: string;
  error?: string;
}

/**
 * Creates a physical timestamped backup of the JSON database.
 * Analyzes the contents and returns detailed metrics for verification.
 */
export function createDatabaseBackup(): BackupResult {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      return {
        success: false,
        timestamp,
        error: 'Database file not found. Nothing to backup.'
      };
    }

    const backupPath = path.join(BACKUPS_DIR, `abarrotes_market_db_backup_${timestamp}.json`);
    
    // Copy the file
    fs.copyFileSync(DB_FILE, backupPath);

    // Read the backup file to verify it is valid JSON and extract checksums
    const content = fs.readFileSync(backupPath, 'utf-8');
    const parsed = JSON.parse(content);
    
    // Calculate SHA256 of the backup
    const sha256 = crypto.createHash('sha256').update(content).digest('hex');

    const itemCounts = {
      masterProducts: parsed.masterProducts?.length || 0,
      inventory: parsed.inventory?.length || 0,
      priceRecords: parsed.priceRecords?.length || 0,
      sales: parsed.sales?.length || 0,
      decisions: parsed.decisions?.length || 0
    };

    console.log(`[Backup System] Created database snapshot at: ${backupPath}`);
    console.log(`[Backup System] Checksum (SHA256): ${sha256}`);
    console.log(`[Backup System] Product count: ${itemCounts.masterProducts}, Inventory count: ${itemCounts.inventory}`);

    return {
      success: true,
      backupPath,
      timestamp,
      itemCounts,
      sha256
    };
  } catch (error: any) {
    console.error('[Backup System] Error during database snapshot:', error);
    return {
      success: false,
      timestamp,
      error: error.message
    };
  }
}
