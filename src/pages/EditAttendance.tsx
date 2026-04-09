import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateAttendanceRecord, fetchAttendanceRecords } from '../services/appsScriptService';
import { updateMockAttendanceRecord, fetchMockAttendanceRecords } from '../services/mockData';
import { AttendanceFormData, AttendanceRecord, LocationType } from '../types/attendance-types';
import { sanitizeInput } from '../utils/sanitization';
import { ATTENDANCE_PASSWORD } from '../config/auth';
import AttendanceFormSections from '../components/AttendanceFormSections';
import './SubmitAttendance.css';

// Use demo mode if explicitly set OR if Apps Script URL is not configured
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_APPS_SCRIPT_URL;

const EditAttendance = () => {
  const navigate = useNavigate();
  const { location, date } = useParams<{ location: string; date: string }>();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [formData, setFormData] = useState<AttendanceFormData>({
    name: '',
    date: '',
    location: 'mission-college-main',
    farLeft: '',
    left: '',
    middleLeft: '',
    middleRight: '',
    right: '',
    farRight: '',
    back: '',
    momsRoom: '',
    familyRoom: '',
    overflow1: '',
    overflow2: '',
    leftWingLeftColumn: '',
    leftWingRightColumn: '',
    rightWingLeftColumn: '',
    rightWingRightColumn: '',
    svuFamilyOverflow: '',
    adjustment: '',
    kids: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecord = async () => {
      if (!date || !location) {
        setSubmitMessage('Invalid record identifier');
        setIsLoading(false);
        return;
      }

      try {
        let records: AttendanceRecord[];
        if (DEMO_MODE) {
          records = await fetchMockAttendanceRecords();
        } else {
          records = await fetchAttendanceRecords(ATTENDANCE_PASSWORD);
        }

        const decodedDate = decodeURIComponent(date);
        const decodedLocation = decodeURIComponent(location) as LocationType;

        // Compare only the date part (YYYY-MM-DD)
        const record = records.find(
          (r) => r.date.split('T')[0] === decodedDate.split('T')[0] && r.location === decodedLocation
        );

        if (record) {
          // Extract date in YYYY-MM-DD format for the date input
          const dateOnly = record.date.split('T')[0];

          setFormData({
            name: record.name,
            date: dateOnly,
            location: record.location,
            farLeft: record.farLeft.toString(),
            left: record.left.toString(),
            middleLeft: record.middleLeft.toString(),
            middleRight: record.middleRight.toString(),
            right: record.right.toString(),
            farRight: record.farRight.toString(),
            back: record.back.toString(),
            momsRoom: record.momsRoom.toString(),
            familyRoom: record.familyRoom.toString(),
            overflow1: record.overflow1.toString(),
            overflow2: record.overflow2.toString(),
            leftWingLeftColumn: record.leftWingLeftColumn.toString(),
            leftWingRightColumn: record.leftWingRightColumn.toString(),
            rightWingLeftColumn: record.rightWingLeftColumn.toString(),
            rightWingRightColumn: record.rightWingRightColumn.toString(),
            svuFamilyOverflow: record.svuFamilyOverflow.toString(),
            adjustment: record.adjustment.toString(),
            kids: record.kids.toString(),
            notes: record.notes || '',
          });
        } else {
          setSubmitMessage('Record not found. It may have been deleted or the link is incorrect.');
          setShowErrorModal(true);
        }
      } catch (error) {
        console.error('Error loading record:', error);
        setSubmitMessage('Error loading record. Please check your connection and try again.');
        setShowErrorModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecord();
  }, [date, location]);

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
    const sanitizedValue = name === 'notes' ? sanitizeInput(value) : value;
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
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
      const record: AttendanceRecord = {
        name: formData.name,
        date: formData.date,
        location: formData.location,
        farLeft: parseInt(formData.farLeft) || 0,
        left: parseInt(formData.left) || 0,
        middleLeft: parseInt(formData.middleLeft) || 0,
        middleRight: parseInt(formData.middleRight) || 0,
        right: parseInt(formData.right) || 0,
        farRight: parseInt(formData.farRight) || 0,
        back: parseInt(formData.back) || 0,
        momsRoom: parseInt(formData.momsRoom) || 0,
        familyRoom: parseInt(formData.familyRoom) || 0,
        overflow1: parseInt(formData.overflow1) || 0,
        overflow2: parseInt(formData.overflow2) || 0,
        leftWingLeftColumn: parseInt(formData.leftWingLeftColumn) || 0,
        leftWingRightColumn: parseInt(formData.leftWingRightColumn) || 0,
        rightWingLeftColumn: parseInt(formData.rightWingLeftColumn) || 0,
        rightWingRightColumn: parseInt(formData.rightWingRightColumn) || 0,
        svuFamilyOverflow: parseInt(formData.svuFamilyOverflow) || 0,
        adjustment: parseInt(formData.adjustment) || 0,
        kids: parseInt(formData.kids) || 0,
        notes: sanitizeInput(formData.notes),
        total: calculateTotal(),
      };

      if (DEMO_MODE) {
        await updateMockAttendanceRecord(record);
      } else {
        await updateAttendanceRecord(record, ATTENDANCE_PASSWORD);
      }

      // Redirect immediately on success
      navigate('/', { state: { refresh: true } });
    } catch (error) {
      console.error('Update error:', error);
      setSubmitMessage('Error updating attendance. Please check your connection and try again.');
      setShowErrorModal(true);
      setIsSubmitting(false);
    }
  };

  const total = calculateTotal();

  if (isLoading) {
    return (
      <div className="submit-container">
        <h1>Edit Attendance</h1>
        <div className="info-section">
          <p>Loading record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-container">
      {isSubmitting && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Updating attendance...</p>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="error-modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-modal-icon">⚠️</div>
            <h2>Update Error</h2>
            <p>{submitMessage}</p>
            <button onClick={() => setShowErrorModal(false)} className="error-modal-button">
              OK
            </button>
          </div>
        </div>
      )}

      <h1>Edit Attendance Record</h1>

      <div className="info-section">
        <p>
          Update the attendance counts for <strong>{formData.date}</strong> at{' '}
          <strong>
            {formData.location === 'mission-college-main'
              ? 'Mission College Main Room'
              : formData.location === 'mission-college-overflow'
              ? 'Mission College Overflow'
              : 'Silicon Valley University'}
          </strong>
        </p>
      </div>

      {DEMO_MODE && (
        <div className="demo-banner">
          <strong>Demo Mode:</strong> Changes will be saved to mock data only (not Google Sheets).
        </div>
      )}

      {submitMessage && (
        <div className={`message ${submitMessage.includes('Error') || submitMessage.includes('failed') || submitMessage.includes('not found') ? 'error' : 'success'}`}>
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
            disabled
          />
          <small style={{ color: 'var(--secondary)' }}>Date cannot be changed when editing</small>
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
            <span className="total-label">Total</span>
            <span className="total-value">{calculateCombinedTotal()}</span>
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Attendance'}
        </button>
      </form>
    </div>
  );
};

export default EditAttendance;
