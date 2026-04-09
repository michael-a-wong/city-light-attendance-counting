import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateAttendanceRecord, getAuthToken } from '../services/googleSheets';
import { updateMockAttendanceRecord, fetchMockAttendanceRecords } from '../services/mockData';
import { AttendanceFormData, AttendanceRecord, LocationType } from '../types/attendance-types';
import { sanitizeInput } from '../utils/sanitization';
import './SubmitAttendance.css';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const EditAttendance = () => {
  const navigate = useNavigate();
  const { location, date } = useParams<{ location: string; date: string }>();
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

  const [isAuthenticated, setIsAuthenticated] = useState(DEMO_MODE);
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
          // TODO: Implement fetching from Google Sheets
          records = [];
        }

        const decodedDate = decodeURIComponent(date);
        const decodedLocation = decodeURIComponent(location) as LocationType;

        const record = records.find(
          (r) => r.date === decodedDate && r.location === decodedLocation
        );

        if (record) {
          setFormData({
            name: record.name,
            date: record.date,
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
          setSubmitMessage('Record not found');
        }
      } catch (error) {
        console.error('Error loading record:', error);
        setSubmitMessage('Error loading record');
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
        await updateAttendanceRecord(record);
      }

      setSubmitMessage('Attendance updated successfully! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Update error:', error);
      setSubmitMessage('Error updating attendance. Please try again.');
    } finally {
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

      {!isAuthenticated && (
        <button onClick={handleAuth} className="auth-button">
          Authenticate with Google
        </button>
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
              <label htmlFor="momsRoom">Mom's Room *</label>
              <input
                type="number"
                id="momsRoom"
                name="momsRoom"
                value={formData.momsRoom}
                onChange={handleInputChange}
                min="0"
                required
              />
              <small>Gillmor Classroom 202. Do not count if the door is closed.</small>
            </div>

            <div className="form-group">
              <label htmlFor="familyRoom">Family Room: Gillmor Classroom 219 (Adults only)</label>
              <input
                type="number"
                id="familyRoom"
                name="familyRoom"
                value={formData.familyRoom}
                onChange={handleInputChange}
                min="0"
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

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => navigate('/')} className="cancel-button">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || !isAuthenticated} className="submit-button">
            {isSubmitting ? 'Updating...' : 'Update Attendance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAttendance;
