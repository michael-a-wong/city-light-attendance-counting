import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import SubmitAttendance from './pages/SubmitAttendance';
import './App.css';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="nav">
      <div className="nav-container">
        <h1 className="nav-title">City Light Attendance</h1>
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
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/submit" element={<SubmitAttendance />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
