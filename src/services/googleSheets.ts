import { AttendanceRecord } from '../types/attendance-types';

// Google Sheets API configuration
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

// These should be set in environment variables
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID;

let gapiInited = false;
let gisInited = false;
let tokenClient: google.accounts.oauth2.TokenClient | null = null;

/**
 * Initialize Google API client
 */
export const initializeGoogleAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
          });
          gapiInited = true;
          console.log('GAPI client initialized');
          resolve();
        } catch (error) {
          console.error('Error initializing GAPI client:', error);
          reject(error);
        }
      });
    };
    script.onerror = () => reject(new Error('Failed to load Google API script'));
    document.body.appendChild(script);
  });
};

/**
 * Initialize Google Identity Services
 */
export const initializeGIS = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
      });
      gisInited = true;
      console.log('GIS initialized');
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load GIS script'));
    document.body.appendChild(script);
  });
};

/**
 * Get Google auth token
 */
export const getAuthToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!gapiInited || !gisInited) {
      reject(new Error('Google API not initialized'));
      return;
    }

    tokenClient.callback = async (resp: google.accounts.oauth2.TokenResponse) => {
      if (resp.error !== undefined) {
        reject(resp);
      } else {
        resolve(gapi.client.getToken().access_token);
      }
    };

    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

/**
 * Sign out from Google
 */
export const signOut = () => {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token, () => {
      console.log('Access token revoked');
    });
    gapi.client.setToken(null);
  }
};

/**
 * Fetch all attendance records from Google Sheets
 */
export const fetchAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A2:Q', // Assuming headers in row 1
    });

    const rows = response.result.values || [];
    return rows.map((row: string[]): AttendanceRecord => {
      const farLeft = parseInt(row[2]) || 0;
      const left = parseInt(row[3]) || 0;
      const middleLeft = parseInt(row[4]) || 0;
      const middleRight = parseInt(row[5]) || 0;
      const right = parseInt(row[6]) || 0;
      const farRight = parseInt(row[7]) || 0;
      const back = parseInt(row[8]) || 0;
      const momsRoom = parseInt(row[9]) || 0;
      const overflow1 = parseInt(row[10]) || 0;
      const overflow2 = parseInt(row[11]) || 0;
      const familyRoom = parseInt(row[12]) || 0;
      const adjustment = parseInt(row[13]) || 0;
      const kids = parseInt(row[14]) || 0;

      const total =
        farLeft +
        left +
        middleLeft +
        middleRight +
        right +
        farRight +
        back +
        momsRoom +
        overflow1 +
        overflow2 +
        familyRoom +
        adjustment;

      return {
        name: row[0] || '',
        date: row[1] || '',
        farLeft,
        left,
        middleLeft,
        middleRight,
        right,
        farRight,
        back,
        momsRoom,
        overflow1,
        overflow2,
        familyRoom,
        adjustment,
        kids,
        notes: row[15] || '',
        total,
        timestamp: row[16] || '',
      };
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    throw error;
  }
};

/**
 * Submit a new attendance record to Google Sheets
 */
export const submitAttendanceRecord = async (
  record: AttendanceRecord
): Promise<void> => {
  try {
    const values = [
      [
        record.name,
        record.date,
        record.farLeft,
        record.left,
        record.middleLeft,
        record.middleRight,
        record.right,
        record.farRight,
        record.back,
        record.momsRoom,
        record.overflow1,
        record.overflow2,
        record.familyRoom,
        record.adjustment,
        record.kids,
        record.notes,
        new Date().toISOString(),
      ],
    ];

    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:Q',
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    console.log('Attendance record submitted successfully');
  } catch (error) {
    console.error('Error submitting attendance record:', error);
    throw error;
  }
};
/**
 * Update an existing attendance record in Google Sheets
 * Finds record by date, name, and location (the unique key)
 */
export const updateAttendanceRecord = async (
  record: AttendanceRecord
): Promise<void> => {
  try {
    // First, fetch all records to find the row number
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A2:Q', // Assuming headers in row 1
    });

    const rows = response.result.values || [];

    // Find the row index (0-based in rows array, but add 2 for sheet row number because headers are row 1)
    const rowIndex = rows.findIndex((row: string[]) => 
      row[1] === record.date && row[0] === record.name && row[2] === record.location
    );

    if (rowIndex === -1) {
      throw new Error('Record not found');
    }

    // Calculate the actual row number in the sheet (add 2: 1 for header, 1 for 0-based index)
    const sheetRowNumber = rowIndex + 2;

    // Update the specific row
    const values = [
      [
        record.name,
        record.date,
        record.location,
        record.farLeft,
        record.left,
        record.middleLeft,
        record.middleRight,
        record.right,
        record.farRight,
        record.back,
        record.momsRoom,
        record.overflow1,
        record.overflow2,
        record.familyRoom,
        record.adjustment,
        record.kids,
        record.notes,
        rows[rowIndex][16] || new Date().toISOString(), // Preserve original timestamp
      ],
    ];

    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!A${sheetRowNumber}:Q${sheetRowNumber}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    console.log('Attendance record updated successfully');
  } catch (error) {
    console.error('Error updating attendance record:', error);
    throw error;
  }
};
