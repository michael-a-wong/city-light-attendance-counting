/**
 * Location utility functions
 * Handles location name formatting and filtering
 */

import { LocationType } from '../types/attendance-types';
import { LOCATIONS, LOCATION_DISPLAY_NAMES, LOCATION_FULL_NAMES } from './constants';
import { AttendanceRecord } from '../types/attendance-types';

export type LocationFilter = 'all' | 'mission-college' | 'silicon-valley-university';

/**
 * Format location name for short display (e.g., "MC Main", "SVU")
 * @param location - Location type
 * @returns Short display name
 */
export const formatLocationName = (location: LocationType | string): string => {
  return LOCATION_DISPLAY_NAMES[location as LocationType] || location;
};

/**
 * Format location name for full display (e.g., "Mission College Main")
 * @param location - Location type
 * @returns Full display name
 */
export const formatLocationFullName = (location: LocationType | string): string => {
  return LOCATION_FULL_NAMES[location as LocationType] || location;
};

/**
 * Check if location is Mission College (Main or Overflow)
 * @param location - Location type
 * @returns True if Mission College
 */
export const isMissionCollege = (location: LocationType): boolean => {
  return location === LOCATIONS.MISSION_COLLEGE_MAIN ||
         location === LOCATIONS.MISSION_COLLEGE_OVERFLOW;
};

/**
 * Check if location is SVU
 * @param location - Location type
 * @returns True if SVU
 */
export const isSVU = (location: LocationType): boolean => {
  return location === LOCATIONS.SILICON_VALLEY_UNIVERSITY;
};

/**
 * Filter records by location filter
 * @param records - Array of attendance records
 * @param filter - Location filter
 * @returns Filtered records
 */
export const filterRecordsByLocation = (
  records: AttendanceRecord[],
  filter: LocationFilter
): AttendanceRecord[] => {
  if (filter === 'all') {
    return records;
  }

  if (filter === 'mission-college') {
    return records.filter(r =>
      r.location === LOCATIONS.MISSION_COLLEGE_MAIN ||
      r.location === LOCATIONS.MISSION_COLLEGE_OVERFLOW
    );
  }

  return records.filter(r => r.location === filter);
};

/**
 * Calculate total adults for a record based on location
 * @param record - Attendance record
 * @returns Total adults count
 */
export const calculateRecordAdults = (record: AttendanceRecord): number => {
  if (record.location === LOCATIONS.MISSION_COLLEGE_MAIN) {
    return record.farLeft + record.left + record.middleLeft +
           record.middleRight + record.right + record.farRight + record.back;
  }

  if (record.location === LOCATIONS.MISSION_COLLEGE_OVERFLOW) {
    return record.overflow1 + record.overflow2 + record.momsRoom + record.familyRoom;
  }

  if (record.location === LOCATIONS.SILICON_VALLEY_UNIVERSITY) {
    return record.leftWingLeftColumn + record.leftWingRightColumn +
           record.rightWingLeftColumn + record.rightWingRightColumn +
           record.svuFamilyOverflow;
  }

  return record.total;
};
