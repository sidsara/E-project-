import React, { useEffect } from 'react';
import './SuccMsg.css';

const SuccMsg = ({ message, duration = 3000, onClose }) => {
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
    <div className="succ-msg">
      <div className="succ-msg-content">
        <svg className="succ-msg-icon" viewBox="0 0 52 52">
          <circle className="succ-msg-circle" cx="26" cy="26" r="25" />
          <path className="succ-msg-check" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default SuccMsg;