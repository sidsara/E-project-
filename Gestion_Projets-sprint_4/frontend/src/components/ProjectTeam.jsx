import React, { useEffect, useState } from 'react';
import './ProjectTeam.css';
import { ArrowCercle } from '../icons/projectIcons';
import { Link } from 'react-router-dom';

const roleColors = {
  Frontend: 'green',
  Backend: 'blue',
  'UI/UX': 'pink',
  proposer: 'orange',
};

// Get the initials from the full name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  return parts.map(part => part[0]?.toUpperCase() || '').join('').substring(0, 2);
};

export default function ProjectTeam({ team, project }) {
  const [storedProject, setStoredProject] = useState(null);

  useEffect(() => {
    // If project is null and team is true, load from localStorage
    if (!project && team) {
      const savedProject = JSON.parse(localStorage.getItem('project'));
      setStoredProject(savedProject);
    }
  }, [project, team]);

  const currentProject = project || storedProject;
  if (!currentProject || !currentProject.Equipe) return null;

  const baseUrl = 'http://localhost:3000';
  const members = [...(currentProject.Equipe.etudiants || [])].sort((a, b) => {
    if (a.chefEquipe) return -1;
    if (b.chefEquipe) return 1;
    return 0;
  });

  function saveProject() {
    localStorage.setItem('project', JSON.stringify(currentProject));
  }

  return (
    <div className="team-card">
      {!team && (
        <Link to={`/Professor/Tracking/${currentProject.equipeId}`} style={{ textDecoration: 'none' }}>
          <button className="start-tracking-btn" onClick={saveProject}>
            Start Tracking Team {currentProject.equipeId} <ArrowCercle />
          </button>
        </Link>
      )}

      <div className="projectteaminfo">
        <div className="team-title">Team: {currentProject.equipeId}</div>
        <div className="members-list">
          {members.map((member, index) => (
            <div className="member-item" key={index}>
              <div className="avatar-wrapper">
                {member.profileImageUrl ? (
                  <img
                    className={member.chefEquipe ? 'avatar-img-highlighted' : 'avatar-img'}
                    src={`${baseUrl}${member.profileImageUrl}`}
                    alt={`${member.nom} ${member.prenom}`}
                  />
                ) : (
                  <div
                    className={`avatar-initialss ${member.chefEquipe ? 'avatar-highlighted' : ''}`}
                    style={{ backgroundColor: '#D9D9D9', color: 'black' }}
                  >
                    {getInitials(`${member.nom} ${member.prenom}`)}
                  </div>
                )}
              </div>
              <span className="member-name">{`${member.nom} ${member.prenom}`}</span>
              <span className={`role-badge ${roleColors[member.role] || ''}`}>
                {member.role || '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="projectteaminfo">
        <div className="team-title">Project Title:</div>
        <p className="prjtitle">{currentProject?.Sujet?.titre || 'Non défini'}</p>
      </div>
    </div>
  );
}
