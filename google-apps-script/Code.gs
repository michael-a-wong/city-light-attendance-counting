/**
 * City Light Bible Church Attendance Tracker
 * Google Apps Script Backend
 *
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Delete any existing code
 * 4. Paste this entire file
 * 5. Click "Deploy" → "New deployment"
 * 6. Type: "Web app"
 * 7. Execute as: "Me"
 * 8. Who has access: "Anyone"
 * 9. Click "Deploy"
 * 10. Copy the "Web app URL" - you'll need this for your React app
 * 11. Add the URL to Vercel environment variable: VITE_APPS_SCRIPT_URL
 */

// IMPORTANT: This password must match ATTENDANCE_PASSWORD in src/config/auth.ts
// To change the password, update BOTH locations
const VALID_PASSWORD = 'adminteam';

/**
 * Handle GET requests - Fetch, submit, or update attendance records
 */
function doGet(e) {
  try {
    // Safety check for parameters
    if (!e || !e.parameter) {
      return createErrorResponse('No parameters received');
    }

    // Check password
    const password = e.parameter.password;

    // Debug logging
    Logger.log('Received password: "' + password + '"');
    Logger.log('Expected password: "' + VALID_PASSWORD + '"');
    Logger.log('Password match: ' + (password === VALID_PASSWORD));

    if (!password || password !== VALID_PASSWORD) {
      return createErrorResponse('Invalid password');
    }

    const action = e.parameter.action;

    // Handle submit action
    if (action === 'submit') {
      const recordData = JSON.parse(e.parameter.data);
      return handleSubmit({ record: recordData });
    }

    // Handle update action
    if (action === 'update') {
      const recordData = JSON.parse(e.parameter.data);
      return handleUpdate({ record: recordData });
    }

    // Default: Fetch all records
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();

    // Skip header row (row 0)
    const headers = data[0];
    const rows = data.slice(1);

    // Convert to array of objects
    const records = rows.map(row => {
      const record = {};
      headers.forEach((header, index) => {
        // Convert Date column to simple YYYY-MM-DD strings (handle both Date objects and ISO strings)
        if (header === 'Date') {
          if (row[index] instanceof Date) {
            record[header] = row[index].toISOString().split('T')[0];
          } else if (typeof row[index] === 'string' && row[index].includes('T')) {
            // Already an ISO string, extract just the date part
            record[header] = row[index].split('T')[0];
          } else {
            record[header] = row[index];
          }
        } else {
          record[header] = row[index];
        }
      });
      return record;
    });

    return createSuccessResponse(records);
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return createErrorResponse('Failed to fetch records: ' + error.toString());
  }
}

/**
 * Submit a new attendance record
 */
function handleSubmit(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const record = data.record;

  // Build row in the same order as headers
  // Headers: Name, Date, Location, Far Left, Left, Middle Left, Middle Right, Right, Far Right,
  //          Back, Mom's Room, Family Room, Overflow 1, Overflow 2, Left Wing Left, Left Wing Right,
  //          Right Wing Left, Right Wing Right, SVU Family Overflow, Adjustment, Kids, Notes, Timestamp

  // Ensure date is stored as simple string (YYYY-MM-DD), not a Date object
  const dateString = String(record.date).split('T')[0];

  const row = [
    record.name,
    dateString,
    record.location,
    record.farLeft,
    record.left,
    record.middleLeft,
    record.middleRight,
    record.right,
    record.farRight,
    record.back,
    record.momsRoom,
    record.familyRoom,
    record.overflow1,
    record.overflow2,
    record.leftWingLeftColumn,
    record.leftWingRightColumn,
    record.rightWingLeftColumn,
    record.rightWingRightColumn,
    record.svuFamilyOverflow,
    record.adjustment,
    record.kids,
    record.notes,
    new Date().toISOString()
  ];

  sheet.appendRow(row);

  return createSuccessResponse({ message: 'Record submitted successfully' });
}

/**
 * Update an existing attendance record
 */
function handleUpdate(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const record = data.record;
  const allData = sheet.getDataRange().getValues();

  // Find the row to update (match by date and location only - name can be edited)
  let rowIndex = -1;
  const recordDate = String(record.date).split('T')[0];

  Logger.log('UPDATE: Looking for date=' + recordDate + ', location=' + record.location);
  Logger.log('UPDATE: Total rows in sheet: ' + (allData.length - 1));

  for (let i = 1; i < allData.length; i++) { // Start at 1 to skip headers
    const row = allData[i];

    // Convert sheet date to string for comparison (handle both Date objects and strings)
    const sheetDate = row[1] instanceof Date
      ? row[1].toISOString().split('T')[0]
      : String(row[1]).split('T')[0];

    Logger.log('Row ' + i + ': sheetDate=' + sheetDate + ', location=' + row[2]);

    if (sheetDate === recordDate && row[2] === record.location) {
      Logger.log('MATCH FOUND at row ' + i);
      rowIndex = i + 1; // Sheet rows are 1-indexed
      break;
    }
  }

  if (rowIndex === -1) {
    Logger.log('Record not found. Looking for: date=' + recordDate + ', location=' + record.location);
    return createErrorResponse('Record not found');
  }

  // Get original timestamp from existing row
  const originalTimestamp = allData[rowIndex - 1][22]; // Column W (index 22)

  // Ensure date is stored as simple string (YYYY-MM-DD), not a Date object
  const dateString = String(record.date).split('T')[0];

  // Build updated row
  const updatedRow = [
    record.name,
    dateString,
    record.location,
    record.farLeft,
    record.left,
    record.middleLeft,
    record.middleRight,
    record.right,
    record.farRight,
    record.back,
    record.momsRoom,
    record.familyRoom,
    record.overflow1,
    record.overflow2,
    record.leftWingLeftColumn,
    record.leftWingRightColumn,
    record.rightWingLeftColumn,
    record.rightWingRightColumn,
    record.svuFamilyOverflow,
    record.adjustment,
    record.kids,
    record.notes,
    originalTimestamp // Preserve original timestamp
  ];

  // Update the row
  const range = sheet.getRange(rowIndex, 1, 1, updatedRow.length);
  range.setValues([updatedRow]);

  return createSuccessResponse({ message: 'Record updated successfully' });
}

/**
 * Create a successful JSON response
 * Note: Apps Script automatically handles CORS when deployed as "Anyone can access"
 */
function createSuccessResponse(data) {
  const output = {
    success: true,
    data: data
  };

  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Create an error JSON response
 */
function createErrorResponse(message) {
  const output = {
    success: false,
    error: message
  };

  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}
