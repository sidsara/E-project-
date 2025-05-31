import React from "react";
import "../pages/Admin/AdminDashboard.css";

export default function InfoCard({ title, value, buttons, onUpload, onView }) {
  return (
    <div className="Info-card">
      <div>
        <div className="Info-card-title">{title}</div>
        <div className="Info-card-value">{value}</div>
      </div>
      <div className="Info-card-buttons">
        {title === "Companies" ? (
          <>
            <button
              className="Info-card-btn"
              onClick={() => window.location.href = "/Admin/Accounts"}
            >
              Create Company User
            </button>
            {buttons.filter(btnLabel => btnLabel === "View" || btnLabel === "View List").map((btnLabel, index) => (
              <button
                key={btnLabel}
                className="Info-card-btn"
                onClick={() => onView && onView(title)}
              >
                {btnLabel}
              </button>
            ))}
          </>
        ) : (
          buttons.map((btnLabel, index) => (
            <button
              key={index}
              className="Info-card-btn"
              onClick={() => {
                if (btnLabel === "Upload List" && onUpload) {
                  onUpload(title); // Pass the role (title) to upload handler
                } else if ((btnLabel === "View" || btnLabel === "View List") && onView) {
                  onView(title); // Pass the role (title) to view handler
                } else {
                  alert(`${btnLabel} clicked`);
                }
              }}
            >
              {btnLabel}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
