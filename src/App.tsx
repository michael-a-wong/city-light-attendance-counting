import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import SubmitAttendance from './pages/SubmitAttendance';
import EditAttendance from './pages/EditAttendance';
import './App.css';

type Theme = 'light' | 'dark';

function Navigation({ theme, toggleTheme }: { theme: Theme; toggleTheme: () => void }) {
  const location = useLocation();

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-branding">
          <img src="/city-light-logo.png" alt="City Light Bible Church" className="nav-logo" />
          <h1 className="nav-title">City Light Weekly Attendance</h1>
        </div>
        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/submit"
            className={`nav-link ${location.pathname === '/submit' ? 'active' : ''}`}
          >
            Submit Attendance
          </Link>
          <div className="theme-toggle-container">
            <span className="theme-label">Dark Mode</span>
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle dark mode"
              role="switch"
              aria-checked={theme === 'dark'}
            >
              <span className="toggle-track">
                <span className="toggle-thumb"></span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  // Detect system preference
  const getSystemTheme = (): Theme => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    return saved || getSystemTheme();
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Router>
      <div className="app">
        <Navigation theme={theme} toggleTheme={toggleTheme} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/submit" element={<SubmitAttendance />} />
            <Route path="/edit/:location/:date" element={<EditAttendance />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
