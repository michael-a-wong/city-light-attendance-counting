import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { fetchMockAttendanceRecords } from '../services/mockData';
import { AttendanceRecord } from '../types/attendance-types';
import './Home.css';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID;

type LocationFilter = 'all' | 'mission-college-main' | 'mission-college-overflow' | 'silicon-valley-university';

interface ChartDataPoint {
  date: string;
  'MC Main'?: number;
  'MC Overflow'?: number;
  'SVU'?: number;
  'Total Adults'?: number;
  'Total Kids'?: number;
  'Combined Total'?: number;
  'Adult Total'?: number;
  'Kids'?: number;
  [key: string]: string | number | undefined;
}

const formatLocationName = (location: string): string => {
  switch (location) {
    case 'mission-college-main':
      return 'MC Main';
    case 'mission-college-overflow':
      return 'MC Overflow';
    case 'silicon-valley-university':
      return 'SVU';
    default:
      return location;
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(DEMO_MODE);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect theme changes
  useEffect(() => {
    const updateTheme = () => {
      setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark');
    };

    // Initial check
    updateTheme();

    // Watch for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const initializeAPIs = async () => {
      if (DEMO_MODE) {
        // In demo mode, load mock data immediately
        await loadRecords();
        return;
      }

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

      const data = DEMO_MODE
        ? await fetchMockAttendanceRecords()
        : await fetchAttendanceRecords();

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
    // Filter to last 10 weeks
    const tenWeeksAgo = new Date();
    tenWeeksAgo.setDate(tenWeeksAgo.getDate() - (10 * 7));

    const recentRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= tenWeeksAgo;
    });

    if (locationFilter === 'all') {
      // For "All Locations", show individual location lines + total line
      const groupedByDate = recentRecords.reduce((acc, record) => {
        const dateKey = record.date;
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            'MC Main': 0,
            'MC Overflow': 0,
            'SVU': 0,
            'Total Adults': 0,
            'Total Kids': 0,
          };
        }

        // Add to specific location
        const locationName = formatLocationName(record.location);
        const currentValue = acc[dateKey][locationName];
        acc[dateKey][locationName] = (typeof currentValue === 'number' ? currentValue : 0) + record.total;

        // Add to totals
        acc[dateKey]['Total Adults'] = (acc[dateKey]['Total Adults'] || 0) + record.total;
        acc[dateKey]['Total Kids'] = (acc[dateKey]['Total Kids'] || 0) + record.kids;

        return acc;
      }, {} as Record<string, ChartDataPoint>);

      return Object.values(groupedByDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((item) => ({
          date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          'MC Main': item['MC Main'] || 0,
          'MC Overflow': item['MC Overflow'] || 0,
          'SVU': item['SVU'] || 0,
          'Total Adults': item['Total Adults'] || 0,
          'Total Kids': item['Total Kids'] || 0,
          'Combined Total': (item['Total Adults'] || 0) + (item['Total Kids'] || 0),
        }));
    } else {
      // For specific location, show just that location's data
      const filteredRecords = recentRecords.filter(r => r.location === locationFilter);

      const groupedByDate = filteredRecords.reduce((acc, record) => {
        const dateKey = record.date;
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            adultTotal: 0,
            kidsTotal: 0,
          };
        }
        acc[dateKey].adultTotal += record.total;
        acc[dateKey].kidsTotal += record.kids;
        return acc;
      }, {} as Record<string, { date: string; adultTotal: number; kidsTotal: number }>);

      return Object.values(groupedByDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((item) => ({
          date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          'Adult Total': item.adultTotal,
          Kids: item.kidsTotal,
          'Combined Total': item.adultTotal + item.kidsTotal,
        }));
    }
  };

  // Get chart colors from CSS variables
  const getChartColors = () => {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    return {
      mcMain: style.getPropertyValue('--chart-mc-main').trim(),
      mcOverflow: style.getPropertyValue('--chart-mc-overflow').trim(),
      svu: style.getPropertyValue('--chart-svu').trim(),
      totalAdults: style.getPropertyValue('--chart-total-adults').trim(),
      totalKids: style.getPropertyValue('--chart-total-kids').trim(),
      combinedTotal: style.getPropertyValue('--chart-combined').trim(),
      adultTotal: style.getPropertyValue('--chart-total-adults').trim(),
      kids: style.getPropertyValue('--chart-total-kids').trim(),
      grid: style.getPropertyValue('--chart-grid').trim(),
      axis: style.getPropertyValue('--chart-axis').trim(),
    };
  };

  const colors = getChartColors();

  const getStats = () => {
    if (records.length === 0) return null;

    // Filter to last 10 weeks
    const tenWeeksAgo = new Date();
    tenWeeksAgo.setDate(tenWeeksAgo.getDate() - (10 * 7));

    const recentRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= tenWeeksAgo;
    });

    // Filter records by location if not 'all'
    const filteredRecords = locationFilter === 'all'
      ? recentRecords
      : recentRecords.filter(r => r.location === locationFilter);

    if (filteredRecords.length === 0) return null;

    // Group records by date and sum totals
    const dailyTotals = Object.values(
      filteredRecords.reduce((acc, record) => {
        const dateKey = record.date;
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            adultTotal: 0,
            kidsTotal: 0,
            combinedTotal: 0,
          };
        }
        acc[dateKey].adultTotal += record.total;
        acc[dateKey].kidsTotal += record.kids;
        acc[dateKey].combinedTotal += record.total + record.kids;
        return acc;
      }, {} as Record<string, { date: string; adultTotal: number; kidsTotal: number; combinedTotal: number }>)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort newest first

    // Calculate Average Total
    const totalCombined = dailyTotals.reduce((sum, r) => sum + r.combinedTotal, 0);
    const avgTotal = Math.round(totalCombined / dailyTotals.length);

    // Calculate Peak Total
    const peakTotal = Math.max(...dailyTotals.map((r) => r.combinedTotal));

    // Calculate Weekly Change (latest week vs second latest week)
    let weeklyChange = 0;
    let weeklyChangePercent = 0;
    if (dailyTotals.length >= 2) {
      const latestWeek = dailyTotals[0].combinedTotal;
      const previousWeek = dailyTotals[1].combinedTotal;
      weeklyChange = latestWeek - previousWeek;
      weeklyChangePercent = previousWeek > 0 ? Math.round((weeklyChange / previousWeek) * 100) : 0;
    }

    return {
      avgTotal,
      peakTotal,
      weeklyChange,
      weeklyChangePercent,
    };
  };

  const stats = getStats();

  return (
    <div className="home-container">
      {DEMO_MODE && (
        <div className="demo-banner">
          <strong>Demo Mode:</strong> Using mock data. No Google authentication required.
        </div>
      )}

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
            <div className="controls-left">
              <button onClick={loadRecords} disabled={loading} className="refresh-button">
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
              {!DEMO_MODE && SPREADSHEET_ID && SPREADSHEET_ID !== 'your_spreadsheet_id_here' && (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sheet-button"
                >
                  📊 Open Google Sheet
                </a>
              )}
            </div>

            <div className="filter-controls">
              <div className="location-filter">
                <label htmlFor="location-filter">Filter by Location:</label>
                <select
                  id="location-filter"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value as LocationFilter)}
                  className="location-select"
                >
                  <option value="all">All Locations</option>
                  <option value="mission-college-main">Mission College Main</option>
                  <option value="mission-college-overflow">Mission College Overflow</option>
                  <option value="silicon-valley-university">Silicon Valley University</option>
                </select>
              </div>

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
          </div>

          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Average Total</h3>
                <p className="stat-value">{stats.avgTotal}</p>
              </div>
              <div className="stat-card">
                <h3>Peak Total</h3>
                <p className="stat-value">{stats.peakTotal}</p>
              </div>
              <div className={`stat-card ${stats.weeklyChange >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                <h3>Weekly Change</h3>
                <p className="stat-value">
                  {stats.weeklyChange >= 0 ? '+' : ''}{stats.weeklyChange}
                </p>
              </div>
            </div>
          )}

          {records.length > 0 ? (
            <div className="chart-container">
              <h2>Attendance Trends</h2>
              <ResponsiveContainer width="100%" height={400}>
                {chartType === 'line' ? (
                  <LineChart data={getChartData() as never}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis dataKey="date" stroke={colors.axis} />
                    <YAxis stroke={colors.axis} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', border: `1px solid ${colors.grid}` }} />
                    <Legend />
                    {locationFilter === 'all' ? (
                      <>
                        <Line
                          type="monotone"
                          dataKey="MC Main"
                          stroke={colors.mcMain}
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="MC Overflow"
                          stroke={colors.mcOverflow}
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="SVU"
                          stroke={colors.svu}
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Total Adults"
                          stroke={colors.totalAdults}
                          strokeWidth={3}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Total Kids"
                          stroke={colors.totalKids}
                          strokeWidth={3}
                        />
                        <Line
                          type="monotone"
                          dataKey="Combined Total"
                          stroke={colors.combinedTotal}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      </>
                    ) : (
                      <>
                        <Line
                          type="monotone"
                          dataKey="Adult Total"
                          stroke={colors.adultTotal}
                          strokeWidth={3}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Kids"
                          stroke={colors.kids}
                          strokeWidth={3}
                        />
                        <Line
                          type="monotone"
                          dataKey="Combined Total"
                          stroke={colors.combinedTotal}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      </>
                    )}
                  </LineChart>
                ) : (
                  <BarChart data={getChartData() as never}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis dataKey="date" stroke={colors.axis} />
                    <YAxis stroke={colors.axis} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', border: `1px solid ${colors.grid}` }} />
                    <Legend />
                    {locationFilter === 'all' ? (
                      <>
                        <Bar dataKey="MC Main" fill={colors.mcMain} />
                        <Bar dataKey="MC Overflow" fill={colors.mcOverflow} />
                        <Bar dataKey="SVU" fill={colors.svu} />
                        <Bar dataKey="Total Adults" fill={colors.totalAdults} />
                        <Bar dataKey="Total Kids" fill={colors.totalKids} />
                      </>
                    ) : (
                      <>
                        <Bar dataKey="Adult Total" fill={colors.adultTotal} />
                        <Bar dataKey="Kids" fill={colors.kids} />
                      </>
                    )}
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
              <p className="records-hint">Click on any record to edit</p>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Adults</th>
                      <th>Kids</th>
                      <th>Total</th>
                      <th>Submitted By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records
                      .slice()
                      .sort((a, b) => {
                        const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
                        if (dateCompare !== 0) return dateCompare;
                        return (b.timestamp || '').localeCompare(a.timestamp || '');
                      })
                      .slice(0, 15)
                      .map((record, index) => (
                        <tr
                          key={`${record.date}-${record.location}-${index}`}
                          className="clickable-row"
                          onClick={() => navigate(`/edit/${encodeURIComponent(record.location)}/${encodeURIComponent(record.date)}`)}
                        >
                          <td>
                            {new Date(record.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td>{formatLocationName(record.location)}</td>
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
