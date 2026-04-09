import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  fetchAttendanceRecords,
  getAuthToken,
  initializeGoogleAPI,
  initializeGIS,
} from '../services/googleSheets';
import { AttendanceRecord } from '../types/attendance';
import './Home.css';

const Home = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    const initializeAPIs = async () => {
      try {
        await Promise.all([initializeGoogleAPI(), initializeGIS()]);
      } catch (error) {
        console.error('Error initializing Google APIs:', error);
        setError('Failed to initialize Google APIs');
      }
    };

    initializeAPIs();
  }, []);

  const handleAuth = async () => {
    try {
      setLoading(true);
      setError('');
      await getAuthToken();
      setIsAuthenticated(true);
      await loadRecords();
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAttendanceRecords();
      // Sort by date
      data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setRecords(data);
    } catch (error) {
      console.error('Error loading records:', error);
      setError('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    return records.map((record) => ({
      date: new Date(record.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      'Adult Total': record.total,
      Kids: record.kids,
      'Combined Total': record.total + record.kids,
    }));
  };

  const getStats = () => {
    if (records.length === 0) return null;

    const totalAdults = records.reduce((sum, r) => sum + r.total, 0);
    const totalKids = records.reduce((sum, r) => sum + r.kids, 0);
    const avgAdults = Math.round(totalAdults / records.length);
    const avgKids = Math.round(totalKids / records.length);
    const maxAdults = Math.max(...records.map((r) => r.total));
    const minAdults = Math.min(...records.map((r) => r.total));

    return {
      avgAdults,
      avgKids,
      maxAdults,
      minAdults,
      totalRecords: records.length,
    };
  };

  const stats = getStats();

  return (
    <div className="home-container">
      <h1>City Light Attendance Dashboard</h1>

      {!isAuthenticated && (
        <div className="auth-section">
          <p>Please authenticate with Google to view attendance data</p>
          <button onClick={handleAuth} className="auth-button" disabled={loading}>
            {loading ? 'Authenticating...' : 'Authenticate with Google'}
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {isAuthenticated && (
        <>
          <div className="controls">
            <button onClick={loadRecords} disabled={loading} className="refresh-button">
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
            <div className="chart-toggle">
              <button
                onClick={() => setChartType('line')}
                className={chartType === 'line' ? 'active' : ''}
              >
                Line Chart
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={chartType === 'bar' ? 'active' : ''}
              >
                Bar Chart
              </button>
            </div>
          </div>

          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Average Adults</h3>
                <p className="stat-value">{stats.avgAdults}</p>
              </div>
              <div className="stat-card">
                <h3>Average Kids</h3>
                <p className="stat-value">{stats.avgKids}</p>
              </div>
              <div className="stat-card">
                <h3>Peak Adults</h3>
                <p className="stat-value">{stats.maxAdults}</p>
              </div>
              <div className="stat-card">
                <h3>Lowest Adults</h3>
                <p className="stat-value">{stats.minAdults}</p>
              </div>
              <div className="stat-card">
                <h3>Total Records</h3>
                <p className="stat-value">{stats.totalRecords}</p>
              </div>
            </div>
          )}

          {records.length > 0 ? (
            <div className="chart-container">
              <h2>Attendance Trends</h2>
              <ResponsiveContainer width="100%" height={400}>
                {chartType === 'line' ? (
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Adult Total"
                      stroke="#0066cc"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Kids"
                      stroke="#28a745"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Combined Total"
                      stroke="#ffc107"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                ) : (
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Adult Total" fill="#0066cc" />
                    <Bar dataKey="Kids" fill="#28a745" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="no-data">
              <p>No attendance records found. Submit your first record!</p>
            </div>
          )}

          {records.length > 0 && (
            <div className="recent-records">
              <h2>Recent Attendance Records</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Adults</th>
                      <th>Kids</th>
                      <th>Total</th>
                      <th>Submitted By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records
                      .slice()
                      .reverse()
                      .slice(0, 10)
                      .map((record, index) => (
                        <tr key={index}>
                          <td>
                            {new Date(record.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td>{record.total}</td>
                          <td>{record.kids}</td>
                          <td>{record.total + record.kids}</td>
                          <td>{record.name}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
