import React from "react";
import "../pages/Admin/AdminDashboard.css";

export default function AppointmentCard({ date, description }) {
  return (
    <div className="appointment-card">
      <div className="appointment-title">Upcoming Appointment</div>
      <div className="appointment-info">
        <span className="appointment-date">{date}</span>
        <span className="appointment-desc">{description}</span>
      </div>
    </div>
  );
}
