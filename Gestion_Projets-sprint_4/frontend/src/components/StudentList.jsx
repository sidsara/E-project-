import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StudentList.css';
import userimage from '../images/User.png';
import { OrangeCircleIcon, BlueCircleIcon } from '../icons/projectIcons';
import { useNavigate } from 'react-router-dom';

const StudentList = (props) => {
  const { minMaxConfig } = props;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [teamLeader, setTeamLeader] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterNiveau, setFilterNiveau] = useState('');
  const [filterSpecialite, setFilterSpecialite] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentsWithoutTeam = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}admin/students-without-team`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.students) {
          setStudents(response.data.students);
        }
      } catch (error) {
        console.error('Error fetching students without team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsWithoutTeam();
  }, []);

  useEffect(() => {
    console.log('Students data:', students);
  }, [students]);

  useEffect(() => {
    console.log('Received minMaxConfig:', minMaxConfig);
  }, [minMaxConfig]);

  useEffect(() => {
    console.log('minMaxConfig prop received in StudentList:', minMaxConfig);
  }, [minMaxConfig]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}admin/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.teams) {
          setTeams(response.data.teams);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  const handleSelectStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleCreateTeam = async () => {
    setErrorMessage("");
    if (!teamLeader) {
      setErrorMessage('Please select a team leader.');
      return;
    }

    // Ensure all selected students have the same level and specialty
    const selectedStudentDetails = students.filter((student) =>
      selectedStudents.includes(student.id)
    );

    const niveau = selectedStudentDetails[0]?.niveau;
    console.log('Selected niveau:', niveau);

    const specialite = selectedStudentDetails[0]?.specialite;

    const isValid = selectedStudentDetails.every(
      (student) => student.niveau === niveau && student.specialite === specialite
    );

    if (!isValid) {
      setErrorMessage('All selected students must have the same level and specialty.');
      return;
    }

    // Correctly access minMembers and maxMembers for the selected niveau
    let minMembers, maxMembers;
    if (String(niveau) === '5') {
      minMembers = 1;
      maxMembers = 2;
    } else {
      minMembers = 5;
      maxMembers = 7;
    }

    console.log('Using minMembers:', minMembers, 'and maxMembers:', maxMembers);

    if (selectedStudents.length < minMembers || selectedStudents.length > maxMembers) {
      setErrorMessage(`Team size must be between ${minMembers} and ${maxMembers} members.`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Payload being sent to backend:', {
        memberIds: selectedStudents,
        leaderId: Number(teamLeader),
        niveau,
        specialite,
        minMembers,
        maxMembers,
      });
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}admin/create-team`,
        { memberIds: selectedStudents, leaderId: Number(teamLeader), niveau, specialite, minMembers, maxMembers },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(response.data.message || 'Team created successfully!');
      setSelectedStudents([]);
      setTeamLeader(null);
      setIsModalOpen(false);
      // Refresh the student list
      const updatedResponse = await axios.get(`${process.env.REACT_APP_API_URL}admin/students-without-team`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(updatedResponse.data.students || []);
    } catch (error) {
      console.error('Error creating team:', error);
      setErrorMessage('Failed to create team.');
    }
  };

  const handleAssignToTeam = async () => {
    setErrorMessage("");
    if (!selectedTeam) {
      setErrorMessage('Please select a team.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}admin/affect-student`,
        { studentId: selectedStudents[0], equipeId: selectedTeam },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(response.data.message || 'Student assigned to team successfully!');
      setSelectedStudents([]);
      setSelectedTeam(null);
      setIsAssignModalOpen(false);
      // Refresh the student list
      const updatedResponse = await axios.get(`${process.env.REACT_APP_API_URL}admin/students-without-team`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(updatedResponse.data.students || []);
    } catch (error) {
      console.error('Error assigning student to team:', error);
      const backendMsg = error.response?.data?.message || error.response?.data?.error;
      setErrorMessage(backendMsg || 'Failed to assign student to team.');
    }
  };

  const filteredStudents = students.filter((student) => {
    // Filter by niveau if set
    if (filterNiveau && student.niveau !== filterNiveau) return false;
  
    // Only apply specialite filter if niveau is 4 or 5 AND specialite filter is set
    if ((filterNiveau === '4' || filterNiveau === '5') && filterSpecialite) {
      // Case-insensitive comparison and handle null/undefined
      if (!student.specialite || student.specialite.toUpperCase() !== filterSpecialite.toUpperCase()) {
        return false;
      }
    }
    return true;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (students.length === 0) {
    return <div>No students found.</div>;
  }

  return (
    <div className="student-list">
      <h2>Student List</h2>
      <div className="filters">
        <label htmlFor="niveau">Filter by Niveau:</label>
        <select
          id="niveau"
          value={filterNiveau}
          onChange={(e) => setFilterNiveau(e.target.value)}
        >
          <option value="">All</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>

        {(filterNiveau === '4' || filterNiveau === '5') && (
          <>
            <label htmlFor="specialite">Filter by Specialite:</label>
            <select
              id="specialite"
              value={filterSpecialite}
              onChange={(e) => setFilterSpecialite(e.target.value)}
            >
              <option value="">All</option>
              {[...new Set(
                students
                  .filter(student => student.niveau === '4' || student.niveau === '5')
                  .map(student => student.specialite)
              )].filter(Boolean).map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </>
        )}
      </div>

      <button
        className="create-team-btn"
        onClick={() => {
          setErrorMessage("");
          setIsAssignModalOpen(false); // Hide assign modal if open
          setIsModalOpen(true);
        }}
        disabled={selectedStudents.length === 0}
      >
        Create Team
      </button>

      <button
        className="assign-team-btn"
        onClick={() => {
          setErrorMessage("");
          setIsModalOpen(false); // Hide create modal if open
          setIsAssignModalOpen(true);
        }}
        disabled={selectedStudents.length !== 1} // Only allow if exactly one student is selected
      >
        Assign to Team
      </button>

      {isModalOpen && (
        <div className="modal">
          <h3>Create Team</h3>
          {selectedStudents.length === 1 ? (
            <>
              <p>Team leader: <b>{(() => {
                const student = students.find((s) => s.id === selectedStudents[0]);
                return student ? `${student.prenom} ${student.nom}` : selectedStudents[0];
              })()}</b></p>
              {/* Set the only selected student as leader by default */}
              {teamLeader !== selectedStudents[0] && setTeamLeader(selectedStudents[0])}
            </>
          ) : (
            <>
              <p>Select a team leader:</p>
              <select
                className="modal-select"
                value={teamLeader || ''}
                onChange={(e) => setTeamLeader(e.target.value)}
              >
                <option value="" disabled>Select leader</option>
                {selectedStudents.map((studentId) => {
                  const student = students.find((s) => s.id === studentId);
                  return (
                    <option key={studentId} value={studentId}>
                      {student ? `${student.prenom} ${student.nom}` : studentId}
                    </option>
                  );
                })}
              </select>
            </>
          )}
         

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button className="create-team-btn" onClick={handleCreateTeam}>Confirm</button>
            <button className="assign-team-btn" onClick={() => {
              setErrorMessage("");
              setIsModalOpen(false);
            }}>Cancel</button>
          </div>
          {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

        </div>
      )}

      {isAssignModalOpen && (
        <div className="modal">
          <h3>Assign Student to Team</h3>
          <p>Select a team:</p>
          <select
            className="modal-select"
            value={selectedTeam || ''}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="" disabled>Select team</option>
            {teams
              .filter(team => !filterNiveau || String(team.niveau) === String(filterNiveau))
              .map((team) => (
                <option key={team.id} value={team.id}>
                  {`team : ${team.id}`}
                </option>
              ))}
          </select>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button className="assign-team-btn" onClick={handleAssignToTeam}>Assign</button>
            <button className="create-team-btn" onClick={() => {
              setErrorMessage("");
              setIsAssignModalOpen(false);
            }}>Cancel</button>
          </div>
          {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

        </div>
      )}

      <div className="studentlistcontainer">
        {filteredStudents.map((student, index) => (
          <div className="student" key={index}>
            <div className="profile">
              <input
                type="checkbox"
                checked={selectedStudents.includes(student.id)}
                onChange={() => handleSelectStudent(student.id)}
              />
              <img src={userimage} alt="userimage" />
              <div className="info">
                <span><b>{student.name}</b></span>
                <p>{student.email}</p>
              </div>
            </div>
            <div className={`status ${student.isActive ? 'active' : ''}`}>
              {student.isActive ? (
                <>
                  <OrangeCircleIcon />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <BlueCircleIcon />
                  <span>Inactive</span>
                </>
              )}*/
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentList;