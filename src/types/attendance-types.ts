export type LocationType = 'mission-college-main' | 'mission-college-overflow' | 'silicon-valley-university';

export interface AttendanceRecord {
  name: string;
  date: string;
  location: LocationType;
  // Mission College Main Room fields
  farLeft: number;
  left: number;
  middleLeft: number;
  middleRight: number;
  right: number;
  farRight: number;
  back: number;
  momsRoom: number;
  familyRoom: number;
  // Mission College Overflow Room fields
  overflow1: number;
  overflow2: number;
  // Silicon Valley University fields
  leftWingLeftColumn: number;
  leftWingRightColumn: number;
  rightWingLeftColumn: number;
  rightWingRightColumn: number;
  svuFamilyOverflow: number;
  // Common fields
  adjustment: number;
  kids: number;
  notes: string;
  total: number;
  timestamp?: string;
}

export interface AttendanceFormData {
  name: string;
  date: string;
  location: LocationType;
  // Mission College Main Room fields
  farLeft: string;
  left: string;
  middleLeft: string;
  middleRight: string;
  right: string;
  farRight: string;
  back: string;
  momsRoom: string;
  familyRoom: string;
  // Mission College Overflow Room fields
  overflow1: string;
  overflow2: string;
  // Silicon Valley University fields
  leftWingLeftColumn: string;
  leftWingRightColumn: string;
  rightWingLeftColumn: string;
  rightWingRightColumn: string;
  svuFamilyOverflow: string;
  // Common fields
  adjustment: string;
  kids: string;
  notes: string;
}
