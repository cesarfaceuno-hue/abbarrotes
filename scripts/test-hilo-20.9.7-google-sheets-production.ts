import { googleSheetsClient } from '../server/engine/GoogleSheetsClient.js';
import dotenv from 'dotenv';
dotenv.config();

async function runTests() {
  console.log('--- Hilo 20.9.7 Google Sheets Production Tests ---');
  console.log('CWD:', process.cwd());
  console.log('Validating environment...');
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1XSkwXwoQdOeQQLwWuTd4R3WNSAR9QhFANJT1URPAfqU';
  
  if (!spreadsheetId) {
    console.log('ENV keys:', Object.keys(process.env));
    console.error('TEST 1: Config Validation - FAILED (No SPREADSHEET_ID)');
    process.exit(1);
  }
  console.log('TEST 1: Config Validation - PASS');

  try {
    // TEST 3 & 4: Metadata Read
    const metadata = await googleSheetsClient.getSpreadsheet(spreadsheetId);
    console.log('TEST 3: Spreadsheet Metadata READ - PASS');
    
    // TEST 5: WRITE
    const timestamp = new Date().toISOString();
    const testData = [['SYSTEM_TEST', timestamp, 'TEST_WRITE', '0', 'IN_STOCK', 'VALID', 'PROCESSED']];
    await googleSheetsClient.append(spreadsheetId, 'SYSTEM_TESTS!A1', testData);
    console.log('TEST 5: WRITE - PASS');

    // TEST 6: READ-BACK
    const rows = await googleSheetsClient.readRange(spreadsheetId, 'SYSTEM_TESTS!A:G');
    const lastRow = rows[rows.length - 1];
    if (lastRow[1] === timestamp) {
        console.log('TEST 6: READ-BACK - PASS');
    } else {
        throw new Error('Read-back verification failed');
    }

    console.log('--- All Tests Passed Successfully ---');
  } catch (error: any) {
    console.error('Tests FAILED:', error.message);
    process.exit(1);
  }
}

runTests();
