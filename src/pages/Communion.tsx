import { useState, useEffect } from 'react';
import { fetchAttendanceRecords } from '../services/appsScriptService';
import { fetchMockAttendanceRecords } from '../services/mockData';
import { AttendanceRecord } from '../types/attendance-types';
import { ATTENDANCE_PASSWORD } from '../config/auth';
import './Communion.css';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_APPS_SCRIPT_URL;

const Communion = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<'mission-college' | 'silicon-valley-university'>('mission-college');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadRecords = async () => {
      try {
        let data: AttendanceRecord[];
        if (DEMO_MODE) {
          data = await fetchMockAttendanceRecords();
        } else {
          data = await fetchAttendanceRecords(ATTENDANCE_PASSWORD);
        }
        setRecords(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading records:', err);
        setError('Error loading attendance records');
        setIsLoading(false);
      }
    };

    loadRecords();
  }, []);

  // Get unique dates sorted newest first
  const uniqueDates = [...new Set(records.map(r => r.date.split('T')[0]))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Filter records by selected date
  const dateRecords = records.filter(r => r.date.split('T')[0] === selectedDate);

  // Find specific location records
  const mainRecord = dateRecords.find(r => r.location === 'mission-college-main');
  const overflowRecord = dateRecords.find(r => r.location === 'mission-college-overflow');
  const svuRecord = dateRecords.find(r => r.location === 'silicon-valley-university');

  // Calculate totals
  const hasData = selectedLocation === 'mission-college'
    ? (mainRecord || overflowRecord)
    : svuRecord;

  const missionCollegeMainTotal = mainRecord
    ? mainRecord.farLeft + mainRecord.left + mainRecord.middleLeft +
      mainRecord.middleRight + mainRecord.right + mainRecord.farRight + mainRecord.back
    : 0;

  const overflowRoom1Total = overflowRecord ? overflowRecord.overflow1 : 0;
  const overflowRoom2Total = overflowRecord ? overflowRecord.overflow2 : 0;

  const leftWingTotal = svuRecord
    ? svuRecord.leftWingLeftColumn + svuRecord.leftWingRightColumn
    : 0;

  const rightWingTotal = svuRecord
    ? svuRecord.rightWingLeftColumn + svuRecord.rightWingRightColumn
    : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="communion-container">
        <h1>Communion Counts</h1>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="communion-container">
        <h1>Communion Counts</h1>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="communion-container">
      <h1>Communion Counts</h1>

      <div className="communion-controls">
        <div className="form-group">
          <label htmlFor="date">Select Date</label>
          <select
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-select"
          >
            <option value="">-- Select a date --</option>
            {uniqueDates.map(date => (
              <option key={date} value={date}>
                {formatDate(date)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="location">Select Location</label>
          <select
            id="location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value as 'mission-college' | 'silicon-valley-university')}
            className="location-select"
          >
            <option value="mission-college">Mission College</option>
            <option value="silicon-valley-university">Silicon Valley University</option>
          </select>
        </div>
      </div>

      {selectedDate && (
        <div className="communion-results">
          {!hasData && (
            <div className="warning-banner">
              ⚠️ No data found for {selectedLocation === 'mission-college' ? 'Mission College' : 'Silicon Valley University'} on {formatDate(selectedDate)}
            </div>
          )}

          {selectedLocation === 'mission-college' ? (
            <div className="totals-grid">
              <div className="total-card">
                <div className="total-label">Main Room (Adults)</div>
                <div className="total-value">{missionCollegeMainTotal}</div>
                {!mainRecord && <div className="no-data-text">No data</div>}
              </div>

              <div className="total-card">
                <div className="total-label">Overflow Room 1 (Adults)</div>
                <div className="total-subtitle">Gillmor Lecture Hall 103</div>
                <div className="total-value">{overflowRoom1Total}</div>
                {!overflowRecord && <div className="no-data-text">No data</div>}
              </div>

              <div className="total-card">
                <div className="total-label">Overflow Room 2 (Adults)</div>
                <div className="total-subtitle">Gillmor Lecture Hall 107</div>
                <div className="total-value">{overflowRoom2Total}</div>
                {!overflowRecord && <div className="no-data-text">No data</div>}
              </div>

              <div className="total-card total-combined">
                <div className="total-label">Total Adults</div>
                <div className="total-value">{missionCollegeMainTotal + overflowRoom1Total + overflowRoom2Total}</div>
              </div>
            </div>
          ) : (
            <div className="totals-grid">
              <div className="total-card">
                <div className="total-label">Left Wing (Adults)</div>
                <div className="total-value">{leftWingTotal}</div>
                {!svuRecord && <div className="no-data-text">No data</div>}
              </div>

              <div className="total-card">
                <div className="total-label">Right Wing (Adults)</div>
                <div className="total-value">{rightWingTotal}</div>
                {!svuRecord && <div className="no-data-text">No data</div>}
              </div>

              <div className="total-card total-combined">
                <div className="total-label">Total Adults</div>
                <div className="total-value">{leftWingTotal + rightWingTotal}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="info-section">
          <p>Select a date and location to view communion counts.</p>
        </div>
      )}
    </div>
  );
};

export default Communion;
