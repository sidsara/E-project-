import React from 'react';
import './ConfirmMsg.css'; 

const ConfirmMsg = ({ message, onConfirm, onCancel }) => {
  if (!message) return null;

  return (
    <div className="confirm-msg-overlay">
      <div className="confirm-msg">
        <div className="confirm-msg-content">
          <svg className="confirm-msg-icon" viewBox="0 0 52 52">
            <circle className="confirm-msg-circle" cx="26" cy="26" r="25" />
            <path className="confirm-msg-question" d="M26 35v-4" />
            <path className="confirm-msg-question" d="M26 20a4 4 0 0 1 4 4v2" />
          </svg>
          <span>{message}</span>
        </div>
        <div className="confirm-msg-buttons">
          <button className="confirm-msg-button confirm-msg-button-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-msg-button confirm-msg-button-confirm" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmMsg;