import React from 'react';
import './WelcomeSection.css';

export default function WelcomeSection({ username, role }) {
  return (
    <div className="welcome-section">
      <div className="welcome-text">
        <h2>Welcome, {username}!</h2>
        <p>We're glad to see you on your {role} dashboard. Explore your projects, manage your tasks, and make the most of your journey!</p>
      </div>
      <div className="welcome-illustration">
        {/* Student SVG Icon */}
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="70" cy="120" rx="50" ry="12" fill="#E0E7FF"/>
          <circle cx="70" cy="54" r="28" fill="#FFB300"/>
          <ellipse cx="70" cy="54" rx="18" ry="20" fill="#FFE0B2"/>
          <ellipse cx="70" cy="54" rx="10" ry="12" fill="#FFD180"/>
          <rect x="40" y="80" width="60" height="30" rx="15" fill="#6366F1"/>
          <rect x="55" y="90" width="30" height="20" rx="10" fill="#A5B4FC"/>
          <rect x="60" y="100" width="20" height="10" rx="5" fill="#818CF8"/>
          <polygon points="70,20 110,40 70,60 30,40" fill="#374151"/>
          <rect x="67" y="60" width="6" height="10" rx="3" fill="#374151"/>
        </svg>
      </div>
    </div>
  );
}
