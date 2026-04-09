import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitAttendanceRecord, getAuthToken } from '../services/googleSheets';
import { submitMockAttendanceRecord } from '../services/mockData';
import { AttendanceFormData, AttendanceRecord, LocationType } from '../types/attendance-types';
import { sanitizeInput } from '../utils/sanitization';
import './SubmitAttendance.css';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const SubmitAttendance = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AttendanceFormData>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    location: 'mission-college-main',
    // Mission College Main Room fields
    farLeft: '',
    left: '',
    middleLeft: '',
    middleRight: '',
    right: '',
    farRight: '',
    back: '',
    momsRoom: '',
    familyRoom: '',
    // Mission College Overflow Room fields
    overflow1: '',
    overflow2: '',
    // Silicon Valley University fields
    leftWingLeftColumn: '',
    leftWingRightColumn: '',
    rightWingLeftColumn: '',
    rightWingRightColumn: '',
    svuFamilyOverflow: '',
    // Common fields
    adjustment: '',
    kids: '',
    notes: '',
  });

  const [isAuthenticated, setIsAuthenticated] = useState(DEMO_MODE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const calculateTotal = (): number => {
    const { location, adjustment } = formData;
    let total = 0;

    if (location === 'mission-college-main') {
      total =
        (parseInt(formData.farLeft) || 0) +
        (parseInt(formData.left) || 0) +
        (parseInt(formData.middleLeft) || 0) +
        (parseInt(formData.middleRight) || 0) +
        (parseInt(formData.right) || 0) +
        (parseInt(formData.farRight) || 0) +
        (parseInt(formData.back) || 0);
    } else if (location === 'mission-college-overflow') {
      total =
        (parseInt(formData.overflow1) || 0) +
        (parseInt(formData.overflow2) || 0) +
        (parseInt(formData.momsRoom) || 0) +
        (parseInt(formData.familyRoom) || 0);
    } else if (location === 'silicon-valley-university') {
      total =
        (parseInt(formData.leftWingLeftColumn) || 0) +
        (parseInt(formData.leftWingRightColumn) || 0) +
        (parseInt(formData.rightWingLeftColumn) || 0) +
        (parseInt(formData.rightWingRightColumn) || 0) +
        (parseInt(formData.svuFamilyOverflow) || 0);
    }

    // Add adjustment (common to all locations)
    total += parseInt(adjustment) || 0;

    return total;
  };

  const calculateKidsTotal = (): number => {
    return parseInt(formData.kids) || 0;
  };

  const calculateCombinedTotal = (): number => {
    return calculateTotal() + calculateKidsTotal();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // Sanitize the notes field to prevent code injection
    const sanitizedValue = name === 'notes' ? sanitizeInput(value) : value;
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleLocationChange = (location: LocationType) => {
    setFormData((prev) => ({ ...prev, location }));
  };

  const handleAuth = async () => {
    try {
      await getAuthToken();
      setIsAuthenticated(true);
      setSubmitMessage('Successfully authenticated with Google');
      setTimeout(() => setSubmitMessage(''), 3000);
    } catch (error) {
      console.error('Authentication error:', error);
      setSubmitMessage('Authentication failed. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setSubmitMessage('Please authenticate with Google first');
      return;
    }

    if (!formData.name || !formData.date) {
      setSubmitMessage('Name and date are required');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const record: AttendanceRecord = {
        name: formData.name,
        date: formData.date,
        location: formData.location,
        // Mission College Main Room fields
        farLeft: parseInt(formData.farLeft) || 0,
        left: parseInt(formData.left) || 0,
        middleLeft: parseInt(formData.middleLeft) || 0,
        middleRight: parseInt(formData.middleRight) || 0,
        right: parseInt(formData.right) || 0,
        farRight: parseInt(formData.farRight) || 0,
        back: parseInt(formData.back) || 0,
        momsRoom: parseInt(formData.momsRoom) || 0,
        familyRoom: parseInt(formData.familyRoom) || 0,
        // Mission College Overflow Room fields
        overflow1: parseInt(formData.overflow1) || 0,
        overflow2: parseInt(formData.overflow2) || 0,
        // Silicon Valley University fields
        leftWingLeftColumn: parseInt(formData.leftWingLeftColumn) || 0,
        leftWingRightColumn: parseInt(formData.leftWingRightColumn) || 0,
        rightWingLeftColumn: parseInt(formData.rightWingLeftColumn) || 0,
        rightWingRightColumn: parseInt(formData.rightWingRightColumn) || 0,
        svuFamilyOverflow: parseInt(formData.svuFamilyOverflow) || 0,
        // Common fields
        adjustment: parseInt(formData.adjustment) || 0,
        kids: parseInt(formData.kids) || 0,
        notes: sanitizeInput(formData.notes), // Sanitize notes before submission
        total: calculateTotal(),
      };

      if (DEMO_MODE) {
        await submitMockAttendanceRecord(record);
      } else {
        await submitAttendanceRecord(record);
      }

      setSubmitMessage('Attendance submitted successfully! Redirecting...');

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitMessage('Error submitting attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="submit-container">
      {DEMO_MODE && (
        <div className="demo-banner">
          <strong>Demo Mode:</strong> Submissions will be saved to mock data only (not Google Sheets).
        </div>
      )}

      {!isAuthenticated && (
        <button onClick={handleAuth} className="auth-button">
          Authenticate with Google
        </button>
      )}

      {submitMessage && (
        <div className={`message ${submitMessage.includes('Error') || submitMessage.includes('failed') ? 'error' : 'success'}`}>
          {submitMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="attendance-form">
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Sunday's date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>

        <h2>Select Location</h2>
        <div className="location-tabs">
          <button
            type="button"
            className={formData.location === 'mission-college-main' ? 'active' : ''}
            onClick={() => handleLocationChange('mission-college-main')}
          >
            Mission College Main Room
          </button>
          <button
            type="button"
            className={formData.location === 'mission-college-overflow' ? 'active' : ''}
            onClick={() => handleLocationChange('mission-college-overflow')}
          >
            Mission College Overflow
          </button>
          <button
            type="button"
            className={formData.location === 'silicon-valley-university' ? 'active' : ''}
            onClick={() => handleLocationChange('silicon-valley-university')}
          >
            Silicon Valley University
          </button>
        </div>

        <div className="info-section">
          {formData.location === 'mission-college-main' && (
            <>
              <h3>Mission College Main Room - Instructions</h3>
              <ul>
                <li>All descriptors (far left, etc.) are when <strong>facing the stage</strong></li>
                <li>Count <strong>adults only</strong> in each section - kids are counted separately below</li>
                <li><strong>Back section:</strong> Tech team, purple chairs along the wall, and anyone outside</li>
                <li><strong>Adjustment:</strong> Rough estimate of people who entered after initial count</li>
                <li><strong>Kids:</strong> Total children in the room (we do NOT count children's ministry)</li>
              </ul>
              <p>
                📄 View detailed instructions{' '}
                <a
                  href="https://docs.google.com/document/d/1LivReU3QJvyr4AD1Q-rh0auIIYWgKFy0A41AF7ziqls/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="instructions-link"
                >
                  Here
                </a>
              </p>
            </>
          )}
          {formData.location === 'mission-college-overflow' && (
            <>
              <h3>Mission College Overflow - Instructions</h3>
              <ul>
                <li><strong>Overflow 1:</strong> Gillmor Lecture Hall 103</li>
                <li><strong>Overflow 2:</strong> Gillmor Lecture Hall 107</li>
                <li><strong>Mom's Room:</strong> Gillmor Classroom 202</li>
                <li><strong>Family Room:</strong> Gillmor Classroom 219</li>
                <li>Count <strong>adults only</strong> in each room - kids are counted separately below</li>
                <li><strong>Adjustment:</strong> Rough estimate of people who entered after initial count</li>
                <li><strong>Kids:</strong> Total children in all overflow rooms (we do NOT count children's ministry)</li>
              </ul>
              <p>
                📄 View detailed instructions{' '}
                <a
                  href="https://docs.google.com/document/d/1LivReU3QJvyr4AD1Q-rh0auIIYWgKFy0A41AF7ziqls/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="instructions-link"
                >
                  Here
                </a>
              </p>
            </>
          )}
          {formData.location === 'silicon-valley-university' && (
            <>
              <h3>Silicon Valley University - Instructions</h3>
              <ul>
                <li>Count each wing and column separately when <strong>facing the stage</strong></li>
                <li><strong>Left Wing:</strong> Has left and right columns</li>
                <li><strong>Right Wing:</strong> Has left and right columns</li>
                <li>Count <strong>adults only</strong> in each section - kids are counted separately below</li>
                <li><strong>Family/Overflow Room:</strong> Separate room for families with young children</li>
                <li><strong>Adjustment:</strong> Rough estimate of people who entered after initial count</li>
                <li><strong>Kids:</strong> Total children in the venue (we do NOT count children's ministry)</li>
              </ul>
              <p>
                📄 View detailed instructions{' '}
                <a
                  href="https://docs.google.com/document/d/1LivReU3QJvyr4AD1Q-rh0auIIYWgKFy0A41AF7ziqls/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="instructions-link"
                >
                  Here
                </a>
              </p>
            </>
          )}
        </div>

        <h2>Section Counts</h2>

        {/* Mission College Main Room */}
        {formData.location === 'mission-college-main' && (
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="farLeft">Far left *</label>
              <input
                type="number"
                id="farLeft"
                name="farLeft"
                value={formData.farLeft}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="left">Left *</label>
              <input
                type="number"
                id="left"
                name="left"
                value={formData.left}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="middleLeft">Middle left *</label>
              <input
                type="number"
                id="middleLeft"
                name="middleLeft"
                value={formData.middleLeft}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="middleRight">Middle right *</label>
              <input
                type="number"
                id="middleRight"
                name="middleRight"
                value={formData.middleRight}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="right">Right *</label>
              <input
                type="number"
                id="right"
                name="right"
                value={formData.right}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="farRight">Far right *</label>
              <input
                type="number"
                id="farRight"
                name="farRight"
                value={formData.farRight}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="back">Back *</label>
              <input
                type="number"
                id="back"
                name="back"
                value={formData.back}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="adjustment">Adjustment *</label>
              <input
                type="number"
                id="adjustment"
                name="adjustment"
                value={formData.adjustment}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="kids">Kids (Total from all locations) *</label>
              <input
                type="number"
                id="kids"
                name="kids"
                value={formData.kids}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
          </div>
        )}

        {/* Mission College Overflow Room */}
        {formData.location === 'mission-college-overflow' && (
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="overflow1">Overflow 1: Gillmor Lecture Hall 103 *</label>
              <input
                type="number"
                id="overflow1"
                name="overflow1"
                value={formData.overflow1}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="overflow2">Overflow 2: Gillmor Lecture Hall 107 *</label>
              <input
                type="number"
                id="overflow2"
                name="overflow2"
                value={formData.overflow2}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="momsRoom">Mom's Room: Gillmor Classroom 202 *</label>
              <input
                type="number"
                id="momsRoom"
                name="momsRoom"
                value={formData.momsRoom}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="familyRoom">Family Room: Gillmor Classroom 219 *</label>
              <input
                type="number"
                id="familyRoom"
                name="familyRoom"
                value={formData.familyRoom}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="adjustment">Adjustment *</label>
              <input
                type="number"
                id="adjustment"
                name="adjustment"
                value={formData.adjustment}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="kids">Kids (Total from all locations) *</label>
              <input
                type="number"
                id="kids"
                name="kids"
                value={formData.kids}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
          </div>
        )}

        {/* Silicon Valley University */}
        {formData.location === 'silicon-valley-university' && (
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="leftWingLeftColumn">Left Wing Left Column *</label>
              <input
                type="number"
                id="leftWingLeftColumn"
                name="leftWingLeftColumn"
                value={formData.leftWingLeftColumn}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="leftWingRightColumn">Left Wing Right Column *</label>
              <input
                type="number"
                id="leftWingRightColumn"
                name="leftWingRightColumn"
                value={formData.leftWingRightColumn}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rightWingLeftColumn">Right Wing Left Column *</label>
              <input
                type="number"
                id="rightWingLeftColumn"
                name="rightWingLeftColumn"
                value={formData.rightWingLeftColumn}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rightWingRightColumn">Right Wing Right Column *</label>
              <input
                type="number"
                id="rightWingRightColumn"
                name="rightWingRightColumn"
                value={formData.rightWingRightColumn}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="svuFamilyOverflow">Family / Overflow Room *</label>
              <input
                type="number"
                id="svuFamilyOverflow"
                name="svuFamilyOverflow"
                value={formData.svuFamilyOverflow}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="adjustment">Adjustment *</label>
              <input
                type="number"
                id="adjustment"
                name="adjustment"
                value={formData.adjustment}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="kids">Kids (Total from all locations) *</label>
              <input
                type="number"
                id="kids"
                name="kids"
                value={formData.kids}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="notes">Notes or comments</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
          />
        </div>

        <div className="running-total">
          <div className="total-row">
            <span className="total-label">Adults</span>
            <span className="total-value">{total}</span>
          </div>
          <div className="total-row">
            <span className="total-label">Kids</span>
            <span className="total-value">{calculateKidsTotal()}</span>
          </div>
          <div className="total-row total-combined">
            <span className="total-label">Total</span>
            <span className="total-value">{calculateCombinedTotal()}</span>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting || !isAuthenticated} className="submit-button">
          {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
        </button>
      </form>
    </div>
  );
};

export default SubmitAttendance;
