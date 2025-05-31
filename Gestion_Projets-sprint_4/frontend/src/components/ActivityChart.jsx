import React from "react";
import "../pages/Admin/AdminDashboard.css";

export default function ActivityChart() {
  return (
    <div className="activity-chart-container">
      <div className="activity-chart-header">
        <h3>Activity Growth</h3>
        <select className="activity-chart-dropdown">
          <option>Jan 2021</option>
        </select>
      </div>
      <div className="activity-chart-graph">
        {/* Simulated static chart */}
        <div className="bar-row">
          {Array.from({ length: 18 }).map((_, index) => (
            <div key={index} className="bar-group">
              <div className="bar yoga"></div>
              <div className="bar meditation"></div>
              <div className="bar aerobics"></div>
              <div className="bar-label">Jan {index + 1}</div>
            </div>
          ))}
        </div>
        <div className="activity-chart-legend">
          <span className="legend yoga">Yoga</span>
          <span className="legend meditation">Meditation</span>
          <span className="legend aerobics">Aerobics</span>
        </div>
      </div>
    </div>
  );
}
