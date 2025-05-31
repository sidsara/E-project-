import React, { useState } from 'react';
import './Modal.css';

export default function NewLeaderModal({ teamMembers, onClose, onConfirm }) {
  const [selectedLeaderId, setSelectedLeaderId] = useState(null);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Select New Team Leader</h2>
        <button className="modal-close" onClick={onClose}>×</button>
        <ul className="modal-list">
          {teamMembers.length === 0 ? (
            <li>No team members available</li>
          ) : (
            teamMembers.map((member) => (
              <li key={member.id}>
                <label>
                  <input
                    type="radio"
                    name="newLeader"
                    value={member.id}
                    onChange={() => setSelectedLeaderId(member.id)}
                  />
                  {member.nom} {member.prenom}
                </label>
              </li>
            ))
          )}
        </ul>
        <button
          className="modal-confirm"
          onClick={() => onConfirm(selectedLeaderId)}
          disabled={!selectedLeaderId}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}