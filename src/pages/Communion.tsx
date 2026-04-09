import { useState } from 'react';
import { useAttendanceData } from '../contexts/AttendanceDataContext';
import './Communion.css';

const Communion = () => {
  const { records, isLoading, isRefreshing, error, refresh } = useAttendanceData();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<'mission-college' | 'silicon-valley-university'>('mission-college');

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
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Loading communion data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="communion-container">
      {isRefreshing && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Refreshing data...</p>
          </div>
        </div>
      )}

      <div className="communion-header">
        <h1>Communion Counts</h1>
        <button
          onClick={refresh}
          className="refresh-button"
          disabled={isRefreshing}
          aria-label="Refresh data"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={isRefreshing ? 'spinning' : ''}
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

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
