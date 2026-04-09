/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchAttendanceRecords } from '../services/appsScriptService';
import { fetchMockAttendanceRecords } from '../services/mockData';
import { AttendanceRecord } from '../types/attendance-types';
import { ATTENDANCE_PASSWORD } from '../config/auth';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_APPS_SCRIPT_URL;

interface AttendanceDataContextType {
  records: AttendanceRecord[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string;
  refresh: () => Promise<void>;
}

const AttendanceDataContext = createContext<AttendanceDataContextType | undefined>(undefined);

export const AttendanceDataProvider = ({ children }: { children: ReactNode }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string>('');

  const loadRecords = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError('');

    try {
      let data: AttendanceRecord[];
      if (DEMO_MODE) {
        data = await fetchMockAttendanceRecords();
      } else {
        data = await fetchAttendanceRecords(ATTENDANCE_PASSWORD);
      }
      setRecords(data);
    } catch (err) {
      console.error('Error loading records:', err);
      setError('Error loading attendance records. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const refresh = async () => {
    await loadRecords(true);
  };

  return (
    <AttendanceDataContext.Provider value={{ records, isLoading, isRefreshing, error, refresh }}>
      {children}
    </AttendanceDataContext.Provider>
  );
};

export const useAttendanceData = () => {
  const context = useContext(AttendanceDataContext);
  if (context === undefined) {
    throw new Error('useAttendanceData must be used within an AttendanceDataProvider');
  }
  return context;
};
