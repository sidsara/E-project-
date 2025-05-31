import React from 'react';
import './Modal.css';

export default function Modal({ title, items, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title} List</h2>
        <button className="modal-close" onClick={onClose}>×</button>
        <ul className="modal-list">
          {items.length === 0 ? (
            <li>No data available</li>
          ) : (
            items.map((item, index) => (
              <li key={index}>
                <strong>{item.nom} {item.prenom}</strong> — {item.email}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
