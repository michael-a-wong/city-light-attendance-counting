import { useState, FormEvent } from 'react';
import './PasswordPrompt.css';

interface PasswordPromptProps {
  onSuccess: () => void;
}

const PasswordPrompt = ({ onSuccess }: PasswordPromptProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (password === 'clbc-admin-team') {
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="password-overlay">
      <div className="password-container">
        <img src="/city-light-logo.png" alt="City Light Bible Church" className="password-logo" />
        <h1>City Light Attendance</h1>
        <p>Please enter the password to continue</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            className="password-input"
          />

          {error && <div className="password-error">{error}</div>}

          <button type="submit" className="password-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordPrompt;
