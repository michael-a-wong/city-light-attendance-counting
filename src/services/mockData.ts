import { AttendanceRecord } from '../types/attendance-types';

// Helper function to calculate total from all sections
const calculateTotal = (record: Partial<AttendanceRecord>): number => {
  return (record.farLeft || 0) +
         (record.left || 0) +
         (record.middleLeft || 0) +
         (record.middleRight || 0) +
         (record.right || 0) +
         (record.farRight || 0) +
         (record.back || 0) +
         (record.momsRoom || 0) +
         (record.familyRoom || 0) +
         (record.overflow1 || 0) +
         (record.overflow2 || 0) +
         (record.leftWingLeftColumn || 0) +
         (record.leftWingRightColumn || 0) +
         (record.rightWingLeftColumn || 0) +
         (record.rightWingRightColumn || 0) +
         (record.svuFamilyOverflow || 0) +
         (record.adjustment || 0);
};

// Generate mock attendance data for the last 20 weeks
const generateMockData = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date('2026-04-08');
  const counters = ['Sarah Johnson', 'Mike Wilson', 'Emily Brown', 'Chris Taylor', 'Alex Davis'];

  // Growth trend: start at ~350, end at ~500
  // Week 19 (oldest) = 350, Week 0 (newest) = 500
  const getGrowthFactor = (week: number): number => {
    // Linear growth from 0.875 (week 19) to 1.25 (week 0)
    return 0.875 + ((19 - week) / 19) * 0.375;
  };

  // SVU weeks: weeks 2, 6, 13, 17 (4 times out of 20)
  const svuWeeks = [2, 6, 13, 17];
  // Week 10: All 3 locations (test case)
  const testWeek = 10;

  // Generate data for last 20 weeks (20 Sundays)
  for (let week = 0; week < 20; week++) {
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - (week * 7));
    const dateStr = sunday.toISOString().split('T')[0];

    const growthFactor = getGrowthFactor(week);
    // Add random fluctuation (±10%)
    const fluctuation = 0.9 + (Math.random() * 0.2);
    const totalFactor = growthFactor * fluctuation;

    const isSVUWeek = svuWeeks.includes(week);
    const isTestWeek = week === testWeek;

    if (isTestWeek) {
      // Week 10: All 3 locations (test case)
      // Mission College Main
      const mcMainRecord = {
        name: counters[week % counters.length],
        date: dateStr,
        location: 'mission-college-main' as const,
        farLeft: Math.round(28 * totalFactor),
        left: Math.round(32 * totalFactor),
        middleLeft: Math.round(35 * totalFactor),
        middleRight: Math.round(33 * totalFactor),
        right: Math.round(30 * totalFactor),
        farRight: Math.round(26 * totalFactor),
        back: Math.round(15 * totalFactor),
        momsRoom: Math.round(4 * totalFactor),
        familyRoom: Math.round(7 * totalFactor),
        overflow1: 0,
        overflow2: 0,
        leftWingLeftColumn: 0,
        leftWingRightColumn: 0,
        rightWingLeftColumn: 0,
        rightWingRightColumn: 0,
        svuFamilyOverflow: 0,
        adjustment: Math.round(5 * totalFactor),
        kids: Math.round(40 * totalFactor),
        notes: '',
        total: 0,
        timestamp: `${dateStr}T10:00:00Z`,
      };
      mcMainRecord.total = calculateTotal(mcMainRecord);
      records.push(mcMainRecord);

      // Mission College Overflow
      const mcOverflowRecord = {
        name: counters[(week + 1) % counters.length],
        date: dateStr,
        location: 'mission-college-overflow' as const,
        farLeft: 0,
        left: 0,
        middleLeft: 0,
        middleRight: 0,
        right: 0,
        farRight: 0,
        back: 0,
        momsRoom: 0,
        familyRoom: 0,
        overflow1: Math.round(55 * totalFactor),
        overflow2: Math.round(60 * totalFactor),
        leftWingLeftColumn: 0,
        leftWingRightColumn: 0,
        rightWingLeftColumn: 0,
        rightWingRightColumn: 0,
        svuFamilyOverflow: 0,
        adjustment: Math.round(3 * totalFactor),
        kids: Math.round(25 * totalFactor),
        notes: '',
        total: 0,
        timestamp: `${dateStr}T10:15:00Z`,
      };
      mcOverflowRecord.total = calculateTotal(mcOverflowRecord);
      records.push(mcOverflowRecord);

      // SVU
      const svuRecord = {
        name: counters[(week + 2) % counters.length],
        date: dateStr,
        location: 'silicon-valley-university' as const,
        farLeft: 0,
        left: 0,
        middleLeft: 0,
        middleRight: 0,
        right: 0,
        farRight: 0,
        back: 0,
        momsRoom: 0,
        familyRoom: 0,
        overflow1: 0,
        overflow2: 0,
        leftWingLeftColumn: Math.round(20 * totalFactor),
        leftWingRightColumn: Math.round(22 * totalFactor),
        rightWingLeftColumn: Math.round(21 * totalFactor),
        rightWingRightColumn: Math.round(24 * totalFactor),
        svuFamilyOverflow: Math.round(10 * totalFactor),
        adjustment: Math.round(3 * totalFactor),
        kids: Math.round(18 * totalFactor),
        notes: '',
        total: 0,
        timestamp: `${dateStr}T11:00:00Z`,
      };
      svuRecord.total = calculateTotal(svuRecord);
      records.push(svuRecord);
    } else if (isSVUWeek) {
      // SVU only (no Mission College)
      const svuOnlyRecord = {
        name: counters[week % counters.length],
        date: dateStr,
        location: 'silicon-valley-university' as const,
        farLeft: 0,
        left: 0,
        middleLeft: 0,
        middleRight: 0,
        right: 0,
        farRight: 0,
        back: 0,
        momsRoom: 0,
        familyRoom: 0,
        overflow1: 0,
        overflow2: 0,
        leftWingLeftColumn: Math.round(85 * totalFactor),
        leftWingRightColumn: Math.round(90 * totalFactor),
        rightWingLeftColumn: Math.round(88 * totalFactor),
        rightWingRightColumn: Math.round(95 * totalFactor),
        svuFamilyOverflow: Math.round(35 * totalFactor),
        adjustment: Math.round(7 * totalFactor),
        kids: Math.round(65 * totalFactor),
        notes: '',
        total: 0,
        timestamp: `${dateStr}T11:00:00Z`,
      };
      svuOnlyRecord.total = calculateTotal(svuOnlyRecord);
      records.push(svuOnlyRecord);
    } else {
      // Mission College only (Main + Overflow)
      // Mission College Main
      const regularMcMainRecord = {
        name: counters[week % counters.length],
        date: dateStr,
        location: 'mission-college-main' as const,
        farLeft: Math.round(28 * totalFactor),
        left: Math.round(32 * totalFactor),
        middleLeft: Math.round(35 * totalFactor),
        middleRight: Math.round(33 * totalFactor),
        right: Math.round(30 * totalFactor),
        farRight: Math.round(26 * totalFactor),
        back: Math.round(15 * totalFactor),
        momsRoom: Math.round(4 * totalFactor),
        familyRoom: Math.round(7 * totalFactor),
        overflow1: 0,
        overflow2: 0,
        leftWingLeftColumn: 0,
        leftWingRightColumn: 0,
        rightWingLeftColumn: 0,
        rightWingRightColumn: 0,
        svuFamilyOverflow: 0,
        adjustment: Math.round(5 * totalFactor),
        kids: Math.round(40 * totalFactor),
        notes: '',
        total: 0,
        timestamp: `${dateStr}T10:00:00Z`,
      };
      regularMcMainRecord.total = calculateTotal(regularMcMainRecord);
      records.push(regularMcMainRecord);

      // Mission College Overflow
      const regularMcOverflowRecord = {
        name: counters[(week + 1) % counters.length],
        date: dateStr,
        location: 'mission-college-overflow' as const,
        farLeft: 0,
        left: 0,
        middleLeft: 0,
        middleRight: 0,
        right: 0,
        farRight: 0,
        back: 0,
        momsRoom: 0,
        familyRoom: 0,
        overflow1: Math.round(80 * totalFactor),
        overflow2: Math.round(85 * totalFactor),
        leftWingLeftColumn: 0,
        leftWingRightColumn: 0,
        rightWingLeftColumn: 0,
        rightWingRightColumn: 0,
        svuFamilyOverflow: 0,
        adjustment: Math.round(4 * totalFactor),
        kids: Math.round(30 * totalFactor),
        notes: '',
        total: 0,
        timestamp: `${dateStr}T10:15:00Z`,
      };
      regularMcOverflowRecord.total = calculateTotal(regularMcOverflowRecord);
      records.push(regularMcOverflowRecord);
    }
  }

  return records;
};

// Mock attendance data for demo mode
const mockRecords: AttendanceRecord[] = generateMockData();

/**
 * Fetch mock attendance records
 */
export const fetchMockAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return a copy of the mock data
  return [...mockRecords];
};

/**
 * Submit a mock attendance record
 */
export const submitMockAttendanceRecord = async (
  record: AttendanceRecord
): Promise<void> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Add timestamp
  record.timestamp = new Date().toISOString();

  // Add to mock records
  mockRecords.push(record);

  console.log('Mock record submitted:', record);
};

/**
 * Update a mock attendance record
 * Finds record by date, name, and location (the unique key)
 */
export const updateMockAttendanceRecord = async (
  record: AttendanceRecord
): Promise<void> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Find the index of the record to update
  const index = mockRecords.findIndex(
    (r) => r.date === record.date && r.name === record.name && r.location === record.location
  );

  if (index === -1) {
    throw new Error('Record not found');
  }

  // Preserve the original timestamp
  const originalTimestamp = mockRecords[index].timestamp;

  // Update the record in place
  mockRecords[index] = {
    ...record,
    timestamp: originalTimestamp,
  };

  console.log('Mock record updated:', mockRecords[index]);
};
