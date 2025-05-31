import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './AffectStudentToTeam.css';

const AffectStudentToTeam = () => {
  const { studentId } = useParams();
  const [teamId, setTeamId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      console.log('Student ID:', studentId); // Debugging log
      console.log('Team ID:', teamId); // Debugging log
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}admin/affect-student`,
        { studentId, equipeId: teamId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(response.data.message);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'An error occurred');
      setSuccessMessage('');
    }
  };

  return (
    <div className="affect-student-to-team">
      <h2>Affect Student to Team</h2>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="teamId">Team ID:</label>
        <input
          type="text"
          id="teamId"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          required
        />
        <button type="submit">Assign</button>
      </form>
    </div>
  );
};

export default AffectStudentToTeam;