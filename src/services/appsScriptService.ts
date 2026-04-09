import { AttendanceRecord } from '../types/attendance-types';

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

/**
 * Fetch all attendance records from Google Apps Script
 */
export const fetchAttendanceRecords = async (password: string): Promise<AttendanceRecord[]> => {
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?password=${encodeURIComponent(password)}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch records');
    }

    // Convert the data from Apps Script format to AttendanceRecord format
    const records: AttendanceRecord[] = result.data.map((row: Record<string, unknown>): AttendanceRecord => {
      const farLeft = Number(row['Far Left'] || 0);
      const left = Number(row['Left'] || 0);
      const middleLeft = Number(row['Middle Left'] || 0);
      const middleRight = Number(row['Middle Right'] || 0);
      const right = Number(row['Right'] || 0);
      const farRight = Number(row['Far Right'] || 0);
      const back = Number(row['Back'] || 0);
      const momsRoom = Number(row["Mom's Room"] || 0);
      const familyRoom = Number(row['Family Room'] || 0);
      const overflow1 = Number(row['Overflow 1'] || 0);
      const overflow2 = Number(row['Overflow 2'] || 0);
      const leftWingLeftColumn = Number(row['Left Wing Left'] || 0);
      const leftWingRightColumn = Number(row['Left Wing Right'] || 0);
      const rightWingLeftColumn = Number(row['Right Wing Left'] || 0);
      const rightWingRightColumn = Number(row['Right Wing Right'] || 0);
      const svuFamilyOverflow = Number(row['SVU Family Overflow'] || 0);
      const adjustment = Number(row['Adjustment'] || 0);

      // Calculate total from all section counts
      const total = farLeft + left + middleLeft + middleRight + right + farRight +
                    back + momsRoom + familyRoom + overflow1 + overflow2 +
                    leftWingLeftColumn + leftWingRightColumn +
                    rightWingLeftColumn + rightWingRightColumn +
                    svuFamilyOverflow + adjustment;

      return {
        name: String(row['Name'] || ''),
        date: String(row['Date'] || ''),
        location: String(row['Location'] || 'mission-college-main') as AttendanceRecord['location'],
        farLeft,
        left,
        middleLeft,
        middleRight,
        right,
        farRight,
        back,
        momsRoom,
        familyRoom,
        overflow1,
        overflow2,
        leftWingLeftColumn,
        leftWingRightColumn,
        rightWingLeftColumn,
        rightWingRightColumn,
        svuFamilyOverflow,
        adjustment,
        kids: Number(row['Kids'] || 0),
        notes: String(row['Notes'] || ''),
        total,
        timestamp: String(row['Timestamp'] || ''),
      };
    });

    return records;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    throw error;
  }
};

/**
 * Submit a new attendance record to Google Apps Script
 */
export const submitAttendanceRecord = async (
  record: AttendanceRecord,
  password: string
): Promise<void> => {
  try {
    // Use GET request with URL params to avoid CORS preflight
    const params = new URLSearchParams({
      password: password,
      action: 'submit',
      data: JSON.stringify(record),
    });

    const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to submit record');
    }

    console.log('Attendance record submitted successfully');
  } catch (error) {
    console.error('Error submitting attendance record:', error);
    throw error;
  }
};

/**
 * Update an existing attendance record in Google Apps Script
 */
export const updateAttendanceRecord = async (
  record: AttendanceRecord,
  password: string
): Promise<void> => {
  try {
    // Use GET request with URL params to avoid CORS preflight
    const params = new URLSearchParams({
      password: password,
      action: 'update',
      data: JSON.stringify(record),
    });

    const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to update record');
    }

    console.log('Attendance record updated successfully');
  } catch (error) {
    console.error('Error updating attendance record:', error);
    throw error;
  }
};
