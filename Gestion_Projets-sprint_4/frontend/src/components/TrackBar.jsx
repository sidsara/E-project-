import React from 'react';
import './TrackBar.css';

const tabs = ["Schedules", "Tasks", "Feedbacks", "Documents"];

export default function TrackBar({ setPage, page }) {
  return (
    <div className="topnav-container">
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`topnav-tab ${tab === page ? 'active' : ''}`}
          onClick={() => setPage(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  );
}
