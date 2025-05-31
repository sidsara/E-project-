import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css'; // Make sure to create this CSS file

// Configure axios instance (moved outside component for better performance)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      // Basic email validation
      if (!email.includes('@') || !email.includes('.')) {
        throw new Error('Please enter a valid email address');
      }

      const response = await api.post('/forgot-password', { email });
      
      // Always show success message even if no response (security best practice)
      setMessage('If an account exists with this email, you will receive a password reset link shortly.');
      
    } catch (err) {
      // Handle different error types
      if (err.response) {
        // Server responded with error status (4xx, 5xx)
        setError(err.response.data?.error || 'Failed to send reset link. Please try again.');
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error. Please check your connection.');
      } else {
        // Other errors (like our validation error)
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <form onSubmit={handleForgotPassword} className="forgot-password-form">
        <h2>Reset Your Password</h2>
        <p className="instructions">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
            autoComplete="email"
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>

        {message && (
          <div className="alert success">
            <i className="icon-check"></i>
            {message}
          </div>
        )}

        {error && (
          <div className="alert error">
            <i className="icon-warning"></i>
            {error}
          </div>
        )}

        <div className="back-to-login">
          Remember your password? <a href="/login">Sign in</a>
        </div>
      </form>
    </div>
  );
}