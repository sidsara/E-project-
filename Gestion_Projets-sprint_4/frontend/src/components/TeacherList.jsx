import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StudentList.css'; // Reusing the same CSS
import userimage from '../images/User.png';
import { OrangeCircleIcon, BlueCircleIcon } from '../icons/projectIcons';

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}enseignants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data?.teachers) {
          setTeachers(response.data.teachers);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!teachers.length) return <div>No teachers found.</div>;

  return (
    <div className="student-list">
      <h2>Teacher List</h2>
      <div className="studentlistcontainer">
        {teachers.map((teacher) => (
          <div className="student" key={teacher.id}>
            <div className="profile">
              <img src={userimage} alt="teacher" />
              <div className="info">
                <span>{teacher.nom} {teacher.prenom}</span>
                <p>{teacher.email}</p>
              </div>
            </div>
            <div className={`status ${teacher.isActive ? 'active' : ''}`}>
              {teacher.isActive ? <OrangeCircleIcon /> : <BlueCircleIcon />}
              <span>{teacher.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="actions">
              <button>View</button>
              <button>Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherList;