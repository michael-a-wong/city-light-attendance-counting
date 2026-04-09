import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ATTENDANCE_PASSWORD } from '../config/auth';
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
import { fetchAttendanceRecords } from '../services/appsScriptService';
import { fetchMockAttendanceRecords } from '../services/mockData';
import { AttendanceRecord } from '../types/attendance-types';
import './Home.css';

// Use demo mode if explicitly set OR if Apps Script URL is not configured
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_APPS_SCRIPT_URL;

type LocationFilter = 'all' | 'mission-college-main' | 'mission-college-overflow' | 'silicon-valley-university';

interface ChartDataPoint {
  date: string;
  'MC Main Total'?: number;
  'MC Overflow Total'?: number;
  'SVU Total'?: number;
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

// Parse date string as local date (not UTC) to avoid timezone issues
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

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
    // Load records on mount
    loadRecords();
  }, []);

  useEffect(() => {
    // Reload data when navigating back with refresh state
    if (location.state && (location.state as { refresh?: boolean }).refresh) {
      loadRecords();
      // Clear the state so it doesn't reload again on next render
      navigate(location.pathname, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError('');

      const data = DEMO_MODE
        ? await fetchMockAttendanceRecords()
        : await fetchAttendanceRecords(ATTENDANCE_PASSWORD);

      // Sort by date
      data.sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime());
      setRecords(data);
    } catch (error) {
      console.error('Error loading records:', error);
      setError('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    // Get unique dates, sorted newest to oldest
    const uniqueDates = [...new Set(records.map(r => r.date))]
      .sort((a, b) => parseLocalDate(b).getTime() - parseLocalDate(a).getTime());

    // Take the last 10 dates
    const last10Dates = uniqueDates.slice(0, 10).reverse(); // Reverse to show oldest to newest in chart

    // Filter records to only those dates
    const recentRecords = records.filter(record =>
      last10Dates.includes(record.date)
    );

    if (locationFilter === 'all') {
      // For "All Locations", show individual location lines + combined total
      const groupedByDate = recentRecords.reduce((acc, record) => {
        const dateKey = record.date;
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            'MC Main Total': 0,
            'MC Overflow Total': 0,
            'SVU Total': 0,
            'Combined Total': 0,
          };
        }

        // Add to specific location (adults + kids)
        let locationKey: 'MC Main Total' | 'MC Overflow Total' | 'SVU Total';
        if (record.location === 'mission-college-main') {
          locationKey = 'MC Main Total';
        } else if (record.location === 'mission-college-overflow') {
          locationKey = 'MC Overflow Total';
        } else {
          locationKey = 'SVU Total';
        }

        const locationTotal = record.total + record.kids;
        acc[dateKey][locationKey] = (acc[dateKey][locationKey] || 0) + locationTotal;

        // Add to combined total
        acc[dateKey]['Combined Total'] = (acc[dateKey]['Combined Total'] || 0) + locationTotal;

        return acc;
      }, {} as Record<string, ChartDataPoint>);

      return Object.values(groupedByDate)
        .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime())
        .map((item) => ({
          date: parseLocalDate(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          'MC Main Total': item['MC Main Total'] || 0,
          'MC Overflow Total': item['MC Overflow Total'] || 0,
          'SVU Total': item['SVU Total'] || 0,
          'Combined Total': item['Combined Total'] || 0,
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
        .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime())
        .map((item) => ({
          date: parseLocalDate(item.date).toLocaleDateString('en-US', {
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

    // Get unique dates, sorted newest to oldest
    const uniqueDates = [...new Set(records.map(r => r.date))]
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Take the last 10 dates
    const last10Dates = uniqueDates.slice(0, 10);

    // Filter records to only those dates
    const recentRecords = records.filter(record =>
      last10Dates.includes(record.date)
    );

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
    ).sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()); // Sort newest first

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

  // Pagination calculations - filter by location first
  const filteredRecordsForTable = locationFilter === 'all'
    ? records
    : records.filter(r => r.location === locationFilter);

  const sortedRecords = filteredRecordsForTable
    .slice()
    .sort((a, b) => {
      const dateCompare = parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return (b.timestamp || '').localeCompare(a.timestamp || '');
    });

  const totalPages = Math.ceil(sortedRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = sortedRecords.slice(startIndex, endIndex);

  // Reset to page 1 when records change
  useEffect(() => {
    setCurrentPage(1);
  }, [records.length]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Calculate which page numbers to show (max 10)
  const getPageNumbers = () => {
    const maxPagesToShow = 10;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than or equal to max
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calculate start and end of the range
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    // Adjust if we're near the end
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="home-container">
      {DEMO_MODE && (
        <div className="demo-banner">
          <strong>Demo Mode:</strong> Using mock data. No Google authentication required.
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
          <div className="controls">
            <div className="controls-left">
              <button onClick={loadRecords} disabled={loading} className="refresh-button">
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
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

          {loading ? (
            <div className="chart-container">
              <h2>Attendance Trends</h2>
              <div className="loading-spinner" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner"></div>
              </div>
            </div>
          ) : records.length > 0 ? (
            <div className="chart-container">
              <h2>Recent Attendance Trends</h2>
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
                          dataKey="MC Main Total"
                          stroke={colors.mcMain}
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="MC Overflow Total"
                          stroke={colors.mcOverflow}
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="SVU Total"
                          stroke={colors.svu}
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Combined Total"
                          stroke={colors.combinedTotal}
                          strokeWidth={3}
                          strokeDasharray="5 5"
                          activeDot={{ r: 8 }}
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
                        <Bar dataKey="MC Main Total" fill={colors.mcMain} />
                        <Bar dataKey="MC Overflow Total" fill={colors.mcOverflow} />
                        <Bar dataKey="SVU Total" fill={colors.svu} />
                        <Bar dataKey="Combined Total" fill={colors.combinedTotal} />
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

          {loading ? (
            <div className="recent-records">
              <h2>Attendance Records</h2>
              <div className="loading-spinner" style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner"></div>
              </div>
            </div>
          ) : records.length > 0 ? (
            <div className="recent-records">
              <h2>Attendance Records</h2>
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
                    {currentRecords.map((record, index) => (
                      <tr
                        key={`${record.date}-${record.location}-${index}`}
                        className="clickable-row"
                        onClick={() => navigate(`/edit/${encodeURIComponent(record.location)}/${encodeURIComponent(record.date.split('T')[0])}`)}
                      >
                        <td>
                          {parseLocalDate(record.date).toLocaleDateString('en-US', {
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

                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-button"
                    >
                      Previous
                    </button>

                    <div className="pagination-pages">
                      {pageNumbers.map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-button"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="recent-records">
              <h2>Attendance Records</h2>
              <div className="no-data">
                <p>No attendance records found. Submit your first record!</p>
              </div>
            </div>
          )}
    </div>
  );
};

export default Home;
