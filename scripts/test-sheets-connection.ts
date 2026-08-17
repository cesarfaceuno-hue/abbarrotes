
import { google } from 'googleapis';

async function checkConnection() {
  const spreadsheetId = '1IFMZOMj0PJkblD2BSDkUadWjRW_3DJbFx0Rvqzw6GOw';
  const range = 'A1:A1';
  
  const auth = new google.auth.GoogleAuth({
    projectId: 'gen-lang-client-0510827236',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const client = await auth.getClient();
  // @ts-ignore
  console.log('DIAGNOSTIC - Identity:', client.email || client.keyFile || 'ADC / Runtime Identity');
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    console.log('CONEXIÓN EXITOSA. Valor A1:', res.data.values?.[0]?.[0] || 'VACÍO');
  } catch (err) {
    console.error('ERROR DE CONEXIÓN:', err);
  }
}

checkConnection();
