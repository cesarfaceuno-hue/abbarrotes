import { google } from 'googleapis';
import { retryPolicyEngine } from './RetryPolicyEngine.js';

export class GoogleSheetsClient {
  private sheets: any;

  constructor() {
    // Uses Application Default Credentials (ADC) or Runtime Identity.
    const auth = new google.auth.GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
      ],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  private async executeWithRetry<T>(fn: () => Promise<T>, sourceId: string): Promise<T> {
    let attempt = 1;
    while (true) {
      try {
        return await fn();
      } catch (error: any) {
        const decision = retryPolicyEngine.evaluateRetry({
          sourceId,
          attempt,
          errorMessage: error.message,
          httpStatus: error.response?.status
        });

        if (decision.retry && attempt < 5) {
          attempt++;
          await new Promise(r => setTimeout(r, decision.delayMs));
        } else {
          throw error;
        }
      }
    }
  }

  public async getSpreadsheet(spreadsheetId: string) {
    return this.executeWithRetry(async () => {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });
      return response.data;
    }, 'SPREADSHEET_READ');
  }

  public async readRange(spreadsheetId: string, range: string) {
    return this.executeWithRetry(async () => {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      return response.data.values || [];
    }, 'RANGE_READ');
  }

  public async append(spreadsheetId: string, range: string, values: any[][]) {
    return this.executeWithRetry(async () => {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });
      return response.data;
    }, 'RANGE_APPEND');
  }

  public async update(spreadsheetId: string, range: string, values: any[][]) {
    return this.executeWithRetry(async () => {
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });
      return response.data;
    }, 'RANGE_UPDATE');
  }
}

export const googleSheetsClient = new GoogleSheetsClient();
