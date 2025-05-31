import React, { useEffect } from 'react';
import './FailMsg.css'; // We'll create this CSS file

const FailMsg = ({ message, duration = 3000, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fail-msg">
      <div className="fail-msg-content">
        <svg className="fail-msg-icon" viewBox="0 0 52 52">
          <circle className="fail-msg-circle" cx="26" cy="26" r="25" />
          <path className="fail-msg-x" d="M16 16L36 36 M36 16L16 36" />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default FailMsg;