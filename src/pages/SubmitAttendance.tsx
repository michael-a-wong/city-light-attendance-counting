import { useState, useEffect } from 'react';
import { submitAttendanceRecord, getAuthToken } from '../services/googleSheets';
import { AttendanceFormData, AttendanceRecord } from '../types/attendance';
import './SubmitAttendance.css';

const SubmitAttendance = () => {
  const [formData, setFormData] = useState<AttendanceFormData>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    farLeft: '',
    left: '',
    middleLeft: '',
    middleRight: '',
    right: '',
    farRight: '',
    back: '',
    momsRoom: '',
    overflow1: '',
    overflow2: '',
    familyRoom: '',
    adjustment: '',
    kids: '',
    notes: '',
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const calculateTotal = (): number => {
    const {
      farLeft,
      left,
      middleLeft,
      middleRight,
      right,
      farRight,
      back,
      momsRoom,
      overflow1,
      overflow2,
      familyRoom,
      adjustment,
    } = formData;

    return (
      (parseInt(farLeft) || 0) +
      (parseInt(left) || 0) +
      (parseInt(middleLeft) || 0) +
      (parseInt(middleRight) || 0) +
      (parseInt(right) || 0) +
      (parseInt(farRight) || 0) +
      (parseInt(back) || 0) +
      (parseInt(momsRoom) || 0) +
      (parseInt(overflow1) || 0) +
      (parseInt(overflow2) || 0) +
      (parseInt(familyRoom) || 0) +
      (parseInt(adjustment) || 0)
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        farLeft: parseInt(formData.farLeft) || 0,
        left: parseInt(formData.left) || 0,
        middleLeft: parseInt(formData.middleLeft) || 0,
        middleRight: parseInt(formData.middleRight) || 0,
        right: parseInt(formData.right) || 0,
        farRight: parseInt(formData.farRight) || 0,
        back: parseInt(formData.back) || 0,
        momsRoom: parseInt(formData.momsRoom) || 0,
        overflow1: parseInt(formData.overflow1) || 0,
        overflow2: parseInt(formData.overflow2) || 0,
        familyRoom: parseInt(formData.familyRoom) || 0,
        adjustment: parseInt(formData.adjustment) || 0,
        kids: parseInt(formData.kids) || 0,
        notes: formData.notes,
        total: calculateTotal(),
      };

      await submitAttendanceRecord(record);
      setSubmitMessage('Attendance submitted successfully!');

      // Reset form
      setFormData({
        name: '',
        date: new Date().toISOString().split('T')[0],
        farLeft: '',
        left: '',
        middleLeft: '',
        middleRight: '',
        right: '',
        farRight: '',
        back: '',
        momsRoom: '',
        overflow1: '',
        overflow2: '',
        familyRoom: '',
        adjustment: '',
        kids: '',
        notes: '',
      });
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
      <h1>City Light Weekly Attendance</h1>

      <div className="info-section">
        <p>
          All descriptors (far left, etc.) are when facing the stage. As of January 2024, we have six sections.
        </p>
        <p>
          The count for each section should include <strong>adults only</strong>. There is a separate section at the end called "Kids" for how many total children were in the room. We do not count children's ministry.
        </p>
        <p>
          The "back" section is the Tech team, the purple chairs along the wall, and anyone outside.
          "Adjustment" is a rough estimate of how many people may have entered after the initial count.
        </p>
      </div>

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

        <h2>Section Counts (Adults Only)</h2>

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

        <div className="running-total">
          <h2>Adult Total So Far: {total}</h2>
        </div>

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

        <button type="submit" disabled={isSubmitting || !isAuthenticated} className="submit-button">
          {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
        </button>
      </form>
    </div>
  );
};

export default SubmitAttendance;
