import { db } from '../db/database.js';
import { RawProductObservation, SupplierSource } from '../types.js';
import { googleSheetsSyncAgent } from './GoogleSheetsSyncAgent.js';
import { sourceHealthService } from './SourceHealthService.js';
import { circuitBreakerEngine } from './CircuitBreakerEngine.js';

export interface AuditRecord {
  runId: string;
  sourceRecordId: string;
  source: string;
  operation: 'INSERT' | 'UPDATE' | 'NO_OP' | 'REJECT' | 'ERROR';
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
  verification?: 'VERIFIED' | 'FAILED';
}

export class PipelineOrchestrator {
  private auditLogs: AuditRecord[] = [];

  public async runPipeline(sourceId: string, observations: RawProductObservation[], spreadsheetId: string, sheetName: string) {
    const source = db.getSourceById(sourceId);
    if (!source || source.recoveryState === 'BLOCKED') {
      console.log(`Source ${sourceId} BLOCKED or not found. Skipping.`);
      return;
    }

    const circuitCheck = circuitBreakerEngine.checkCircuit(sourceId);
    if (!circuitCheck.allowRequest) {
      console.log(`Circuit OPEN for source ${sourceId}. Skipping.`);
      return;
    }

    const runId = `run-${Date.now()}`;
    for (const obs of observations) {
      await this.processObservation(runId, source, obs, spreadsheetId, sheetName);
    }
  }

  private async processObservation(runId: string, source: SupplierSource, obs: RawProductObservation, spreadsheetId: string, sheetName: string) {
    if (!obs.sourceRecordId) {
      this.logAudit(runId, obs, source, 'REJECT', 'FAILED', 'Missing sourceRecordId');
      return;
    }

    try {
      const existingRow = await googleSheetsSyncAgent.findRowBySourceRecordId(spreadsheetId, sheetName, obs.sourceRecordId);
      
      if (existingRow) {
        // UPDATE o NO_OP
        const needsUpdate = await googleSheetsSyncAgent.compareAndVerify(spreadsheetId, sheetName, existingRow, obs);
        if (needsUpdate) {
          await googleSheetsSyncAgent.updateRow(spreadsheetId, sheetName, existingRow, obs);
          this.logAudit(runId, obs, source, 'UPDATE', 'SUCCESS', undefined, 'VERIFIED');
        } else {
          this.logAudit(runId, obs, source, 'NO_OP', 'SUCCESS', undefined, 'VERIFIED');
        }
      } else {
        // APPEND
        await googleSheetsSyncAgent.appendRow(spreadsheetId, sheetName, obs);
        this.logAudit(runId, obs, source, 'INSERT', 'SUCCESS', undefined, 'VERIFIED');
      }
    } catch (error: any) {
      this.logAudit(runId, obs, source, 'ERROR', 'FAILED', error.message);
    }
  }

  private logAudit(runId: string, obs: RawProductObservation, source: SupplierSource, operation: AuditRecord['operation'], status: AuditRecord['status'], error?: string, verification?: AuditRecord['verification']) {
    const record: AuditRecord = {
      runId,
      sourceRecordId: obs.sourceRecordId,
      source: source.name,
      operation,
      timestamp: new Date().toISOString(),
      status,
      error,
      verification,
    };
    this.auditLogs.push(record);
    console.log('AuditLog:', JSON.stringify(record));
  }
}

export const pipelineOrchestrator = new PipelineOrchestrator();
