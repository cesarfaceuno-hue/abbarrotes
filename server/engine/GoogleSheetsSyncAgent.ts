import { googleSheetsClient } from './GoogleSheetsClient.js';
import { db } from '../db/database.js';
import { RawProductObservation } from '../types.js';

export class GoogleSheetsSyncAgent {
  
  constructor() {}

  /**
   * Sincroniza observaciones procesadas a un Google Sheet específico.
   * Implementa batch writing, deduplicación e idempotencia.
   */
  public async syncToSheets(spreadsheetId: string, sheetName: string, observations: RawProductObservation[]) {
    if (observations.length === 0) return;

    // 1. Deduplicación por sourceRecordId
    const uniqueObservations = observations.filter((obs, index, self) =>
      index === self.findIndex((o) => o.sourceRecordId === obs.sourceRecordId)
    );

    // 2. Preparar payload (batch)
    const rows = uniqueObservations.map(obs => [
      obs.sourceRecordId, 
      obs.observedAt,
      obs.productNameRaw,
      obs.priceRaw,
      obs.availabilityRaw,
      obs.dataQualityStatus,
      obs.processingStatus
    ]);

    // 3. Escribir en Sheet
    try {
      await googleSheetsClient.append(spreadsheetId, `${sheetName}!A1`, rows);
      console.log(`Sync exitoso: ${uniqueObservations.length} filas escritas.`);
    } catch (error) {
      console.error('Error sincronizando con Google Sheets:', error);
      throw error;
    }
  }

  public async findRowBySourceRecordId(spreadsheetId: string, sheetName: string, sourceRecordId: string): Promise<number | null> {
    const values = await googleSheetsClient.readRange(spreadsheetId, `${sheetName}!A:A`);
    const index = values.findIndex(row => row[0] === sourceRecordId);
    return index !== -1 ? index + 1 : null;
  }

  public async updateRow(spreadsheetId: string, sheetName: string, rowNumber: number, obs: RawProductObservation) {
    const values = [[
      obs.sourceRecordId,
      obs.observedAt,
      obs.productNameRaw,
      obs.priceRaw,
      obs.availabilityRaw,
      obs.dataQualityStatus,
      obs.processingStatus
    ]];
    await googleSheetsClient.update(spreadsheetId, `${sheetName}!A${rowNumber}`, values);
  }

  public async appendRow(spreadsheetId: string, sheetName: string, obs: RawProductObservation) {
    const values = [[
      obs.sourceRecordId,
      obs.observedAt,
      obs.productNameRaw,
      obs.priceRaw,
      obs.availabilityRaw,
      obs.dataQualityStatus,
      obs.processingStatus
    ]];
    await googleSheetsClient.append(spreadsheetId, `${sheetName}!A1`, values);
  }

  public async compareAndVerify(spreadsheetId: string, sheetName: string, rowNumber: number, obs: RawProductObservation): Promise<boolean> {
    const values = await googleSheetsClient.readRange(spreadsheetId, `${sheetName}!A${rowNumber}:G${rowNumber}`);
    const row = values[0] || [];
    
    // Comparar campos críticos ignorando undefined en obs
    const priceChanged = obs.priceRaw !== undefined && row[3] !== String(obs.priceRaw);
    const availabilityChanged = obs.availabilityRaw !== undefined && row[4] !== String(obs.availabilityRaw);
    
    return priceChanged || availabilityChanged;
  }
}

export const googleSheetsSyncAgent = new GoogleSheetsSyncAgent();
