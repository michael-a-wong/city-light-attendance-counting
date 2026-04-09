import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitAttendanceRecord, fetchAttendanceRecords } from '../services/appsScriptService';
import { submitMockAttendanceRecord, fetchMockAttendanceRecords } from '../services/mockData';
import { AttendanceFormData, AttendanceRecord, LocationType } from '../types/attendance-types';
import { sanitizeInput } from '../utils/sanitization';
import { ATTENDANCE_PASSWORD } from '../config/auth';
import AttendanceFormSections from '../components/AttendanceFormSections';
import './SubmitAttendance.css';

// Use demo mode if explicitly set OR if Apps Script URL is not configured
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_APPS_SCRIPT_URL;

const SubmitAttendance = () => {
  const navigate = useNavigate();
  const [showErrorModal, setShowErrorModal] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.date) {
      setSubmitMessage('Name and date are required');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Check for duplicate records (same date + location)
      let existingRecords;
      if (DEMO_MODE) {
        existingRecords = await fetchMockAttendanceRecords();
      } else {
        existingRecords = await fetchAttendanceRecords(ATTENDANCE_PASSWORD);
      }

      const duplicate = existingRecords.find(
        (r) => r.date.split('T')[0] === formData.date && r.location === formData.location
      );

      if (duplicate) {
        setSubmitMessage('A record already exists for this date and location. Please use the Edit feature to update it.');
        setShowErrorModal(true);
        setIsSubmitting(false);
        return;
      }

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
        await submitAttendanceRecord(record, ATTENDANCE_PASSWORD);
      }

      // Redirect immediately on success
      navigate('/', { state: { refresh: true } });
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitMessage('Error submitting attendance. Please check your connection and try again.');
      setShowErrorModal(true);
      setIsSubmitting(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="submit-container">
      {isSubmitting && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Submitting attendance...</p>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="error-modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-modal-icon">⚠️</div>
            <h2>Submission Error</h2>
            <p>{submitMessage}</p>
            <button onClick={() => setShowErrorModal(false)} className="error-modal-button">
              OK
            </button>
          </div>
        </div>
      )}

      {DEMO_MODE && (
        <div className="demo-banner">
          <strong>Demo Mode:</strong> Submissions will be saved to mock data only (not Google Sheets).
        </div>
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

        <AttendanceFormSections formData={formData} onChange={handleInputChange} />

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
            <span className="total-label">Total (Adults + Kids)</span>
            <span className="total-value">{total + calculateKidsTotal()}</span>
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
        </button>
      </form>
    </div>
  );
};

export default SubmitAttendance;
