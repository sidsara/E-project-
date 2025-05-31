import React, { useState } from 'react';
import './ScheduleCard.css'; 
import axios from 'axios';
import { OnlineIcon, PresentialIcon } from '../icons/projectIcons';

const ScheduleCard = ({id, type, title, date, time, duration, locationOrLink, status,role }) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [showStatusOptions, setShowStatusOptions] = useState(false);

  const icon = type === 'ONLINE' ? <OnlineIcon /> : <PresentialIcon />;
  const project = JSON.parse(localStorage.getItem("project"));
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/updateAppointmentStatus/${project.id}/${appointmentId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      console.log("Appointment updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating appointment status:", error.response?.data || error.message);
      throw error;
    } 
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      setCurrentStatus(newStatus);
      setShowStatusOptions(false);
    } catch (err) {
      alert('Failed to update status');
      console.log(id,newStatus,project.id);

    }
  };

  const handleStatusClick = (e) => {
   if(role==="professor"){
     e.stopPropagation();
    e.preventDefault();
    setShowStatusOptions(!showStatusOptions);
   }
  };

  return (
    <div className={`schedule-card ${type.toLowerCase()}`}>
      <div className={`meeting-type ${type.toLowerCase()}`}>
        {icon} {type === 'ONLINE' ? ' Online Meeting' : ' Presential Meeting'}
      </div>

      <div className="details">
        <div><span>Title:</span> {title}</div>
        <div><span>Date:</span> {date.substring(0, 10)}</div>
        <div><span>Time:</span> {time}</div>
        <div><span>Duration:</span> {duration}</div>
        <div>
          <span>{type === 'ONLINE' ? 'Link:' : 'Location:'}</span> {locationOrLink}
        </div>
      </div>

      <div className="status-section" onClick={handleStatusClick} style={{ position: 'relative' }}>
        <div className={`status ${currentStatus.toLowerCase()}`}>
          ● {currentStatus}
        </div>

        {showStatusOptions && (
          <div className="schedule-status-dropdown">
            <div className='status upcoming' onClick={() => handleStatusChange("UPCOMING")}>● UPCOMING</div>
            <div className='status completed' onClick={() => handleStatusChange("COMPLETED")}>● COMPLETED</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleCard;
