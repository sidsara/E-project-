import './Admin.css';
import './MinMaxForm.css'; // Add a new CSS file for styling the form
import Header from '../../components/Header';
import SidebarByUser from '../../components/SidebarByUser';
import { useEffect, useState } from 'react';
import InfoCard from '../../components/InfoCard';
import SuccMsg from '../../components/SuccMsg';
import axios from 'axios';
import StudentList from '../../components/StudentList';
import TeacherList from '../../components/TeacherList';
import CompanyList from '../../components/CompanyList';
import { ArrowCircleIcon } from '../../icons/projectIcons';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [counts, setCounts] = useState({
    students: 0,
    teachers: 0,
    companies: 0,
  });
  const [showList, setShowList] = useState({
    students: false,
    teachers: false,
    companies: false
  });
  const [minMembers, setMinMembers] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [niveau, setNiveau] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const baseURL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
    fetchCounts();
  }, []);

  useEffect(() => {
    const storedMinMembers = localStorage.getItem('minMembers');
    const storedMaxMembers = localStorage.getItem('maxMembers');
    const storedNiveau = localStorage.getItem('niveau');

    if (storedMinMembers) setMinMembers(storedMinMembers);
    if (storedMaxMembers) setMaxMembers(storedMaxMembers);
    if (storedNiveau) setNiveau(storedNiveau);
  }, []);

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem('token');

      const [studentsRes, teachersRes, companiesRes] = await Promise.all([
        axios.get(`${baseURL}count-students`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseURL}count-teachers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseURL}count-companies`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setCounts({
        students: studentsRes.data.count || 0,
        teachers: teachersRes.data.count || 0,
        companies: companiesRes.data.count || 0,
      });
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const handleUpload = async (role) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      const endpointMap = {
        'Students': `${baseURL}liste-etudiants`,
        'Teachers': `${baseURL}liste-enseignants`,
        'Companies': `${baseURL}liste-entreprises`
      };

      const endpoint = endpointMap[role];
      if (!endpoint) return alert('Unsupported role');

      try {
        const res = await axios.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          withCredentials: true,
        });
        setSuccessMessage(res.data.message);
        fetchCounts();
      } catch (err) {
        alert('Error: ' + (err.response?.data?.error || err.message));
      }
    };

    input.click();
  };

  const toggleList = (listType) => {
    setShowList(prev => ({
      ...prev,
      [listType]: !prev[listType]
    }));
  };

  const handleMinMaxSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      console.log('Request Payload:', { minMembers, maxMembers, niveau });
      console.log('Authorization Token:', token);
      const response = await axios.put(
        `${baseURL}minMaxMembers`,
        { minMembers: parseInt(minMembers, 10), maxMembers: parseInt(maxMembers, 10), niveau },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Response:', response.data);
      setFormMessage(response.data.message);
      setSuccessMessage('Min/Max members updated successfully!');

      // Store values in localStorage
      localStorage.setItem('minMembers', minMembers);
      localStorage.setItem('maxMembers', maxMembers);
      localStorage.setItem('niveau', niveau);
    } catch (error) {
      console.error('Error Response:', error.response);
      setFormMessage(error.response?.data?.error || 'An error occurred.');
    }
  };

  return (
    <div className="admincontainer">
      <SidebarByUser role="admin" />
      {successMessage && (
        <SuccMsg
          message={successMessage}
          duration={3000}
          onClose={() => setSuccessMessage('')}
        />
      )}
      <div className="adminwrapper">
        <div className="adwrapper">
          <Header
            page="Dashboard"
            userrole="Admin"
            username={user?.nom + ' ' + user?.prenom}
          />
          <div className='admin-welcome'>
            <h1>Welcome, {user?.prenom} {user?.nom}!</h1>
          </div>
          <div className="Info-cards-row">
            <InfoCard
              title="Students"
              value={counts.students}
              buttons={['Upload List', 'View List']}
              onUpload={() => handleUpload('Students')}
              onView={() => toggleList('students')}
            />
            <InfoCard
              title="Teachers"
              value={counts.teachers}
              buttons={['Upload List', 'View List']}
              onUpload={() => handleUpload('Teachers')}
              onView={() => toggleList('teachers')}
            />
            <InfoCard
              title="Companies"
              value={counts.companies}
              buttons={['Upload List', 'View List']}
              onUpload={() => handleUpload('Companies')}
              onView={() => toggleList('companies')}
            />
          </div>

          {showList.students && (
            <div className="modal-overlay" onClick={() => toggleList('students')}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="modal-close" onClick={() => toggleList('students')}>
                  &times;
                </span>
                <StudentList minMaxConfig={{ [niveau]: { minMembers, maxMembers } }} />
              </div>
            </div>
          )}

          {showList.teachers && (
            <div className="modal-overlay" onClick={() => toggleList('teachers')}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="modal-close" onClick={() => toggleList('teachers')}>
                  &times;
                </span>
                <TeacherList />
              </div>
            </div>
          )}

          {showList.companies && (
            <div className="modal-overlay" onClick={() => toggleList('companies')}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="modal-close" onClick={() => toggleList('companies')}>
                  &times;
                </span>
                <CompanyList />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', marginTop: 24 }}>
            <div className="min-max-form cool-ui" >
              <h2>Set Min/Max Members</h2>
              <form onSubmit={handleMinMaxSubmit}>
                <div className="form-group">
                  <label htmlFor="niveau">Niveau:</label>
                  <input
                    id="niveau"
                    type="text"
                    value={niveau}
                    onChange={(e) => setNiveau(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="minMembers">Min Members:</label>
                  <input
                    id="minMembers"
                    type="number"
                    value={minMembers}
                    onChange={(e) => setMinMembers(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="maxMembers">Max Members:</label>
                  <input
                    id="maxMembers"
                    type="number"
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(e.target.value)}
                    required
                  />
                </div>
                <button className="submit-btn" type="submit">Submit</button>
              </form>
            </div>
            <div className="admin-dashboard-action-cards">
              <div className="admin-action-card" onClick={() => window.location.href = '/Admin/Projects'}>
                <div className="admin-action-card-content">
                  <div>
                    <div className="admin-action-card-title">Manage projects submitted</div>
                    <div className="admin-action-card-desc">View, validate, or refuse student project submissions and monitor their progress.</div>
                  </div>
                  <ArrowCircleIcon className="admin-action-card-icon" style={{ color: '#ff6600' }} />
                </div>
              </div>
              <div className="admin-action-card" onClick={() => window.location.href = '/Admin/Accounts'}>
                <div className="admin-action-card-content">
                  <div>
                    <div className="admin-action-card-title">Consult accounts and manage them</div>
                    <div className="admin-action-card-desc">Browse, edit, or deactivate user and company accounts in the system.</div>
                  </div>
                  <ArrowCircleIcon className="admin-action-card-icon" style={{ color: '#ff6600' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}