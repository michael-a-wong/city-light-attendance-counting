export interface AttendanceRecord {
  name: string;
  date: string;
  farLeft: number;
  left: number;
  middleLeft: number;
  middleRight: number;
  right: number;
  farRight: number;
  back: number;
  momsRoom: number;
  overflow1: number;
  overflow2: number;
  familyRoom: number;
  adjustment: number;
  kids: number;
  notes: string;
  total: number;
  timestamp?: string;
}

export interface AttendanceFormData {
  name: string;
  date: string;
  farLeft: string;
  left: string;
  middleLeft: string;
  middleRight: string;
  right: string;
  farRight: string;
  back: string;
  momsRoom: string;
  overflow1: string;
  overflow2: string;
  familyRoom: string;
  adjustment: string;
  kids: string;
  notes: string;
}
