import './Search.css';
import { SearchIcon, PlusIcon, FilterIcon, NotificationIcon, BlueX, MiniCheckPhoto, MiniRefusePhoto } from '../icons/projectIcons';
import NotificationsDropdown from './NotificationsDropdown';
import ProfNotificationsDropdown from './ProfNotificationDropdown';

import { useState, useEffect } from "react";
import { createEquipe } from '../pages/Student/CreateEquipe';
import axios from 'axios';

function Skill({ skill, setSkills,background,text }) {
  const [showSkill, setShowSkill] = useState(true);
  const deleteSkill = (name) => {
    setSkills(prev => prev.filter(s => s !== name));
  };
  const handleDelete = () => {
    setShowSkill(false);
    deleteSkill(skill);
  };
  return (
    showSkill && (
      <span className="skill-badge" style={{ backgroundColor: background, color: text }}>
        {skill}
        <div onClick={handleDelete} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <BlueX />
        </div>
      </span>
    )
  );
}

export default function Search({ page, setAddcompanypage, setShowFilter, setSearchTitle, searchTitle, onTeamCreated,role }) {
  const [inputValue, setInputValue] = useState(searchTitle || "");
  const [showCreate, setShowCreate] = useState(false);
  const [firstText, setFirstText] = useState(true);
  const [secondText, setSecondText] = useState(false);
  const [skill, setSkill] = useState("");
  const [skills, setSkills] = useState([]);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [showSuccessCreate, setShowSuccessCreate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const [createIcon, setCreateIcon] = useState((<MiniRefusePhoto />));

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    if (showNotifications) fetchNotifications();
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/invitations/notifications', { withCredentials: true });
      setInvitations(response.data.receivedInvitations || []);
      setError(null);
    } catch (err) {
      console.error("Fetch notifications error:", err);
      setError("Failed to load notifications");
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId) => {
    try {
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) {
        throw new Error("Invitation not found");
      }
  
      const response = await axios.post(
        `http://localhost:3000/api/invitations/accept/${invitation.equipeId}`,
        { invitationId },
        { withCredentials: true }
      );
      
    } catch (err) {
      await fetchNotifications();
      console.error("Failed to accept invitation:", err);
      setError(err.response?.data?.message || "Failed to accept invitation");
    }
  };
  

  const handleDecline = async (invitationId) => {
    try {
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) {
        throw new Error("Invitation not found");
      }
  
      const response = await axios.post(
        `http://localhost:3000/api/invitations/reject/${invitation.equipeId}`,
        { invitationId },
        { withCredentials: true }
      );
      
    } catch (err) {
      await fetchNotifications();
      console.error("Failed to decline invitation:", err);
      setError(err.response?.data?.message || "Failed to decline invitation");
    }
  };

  const handleKeyDown2 = (e) => { if (e.key === 'Enter') handleSubmit(); };
  const handleSubmit = () => { if (skill) setSkills([...skills, skill]); setSkill(""); };
  const getRandomSkillColor  = (index) => {
    const colors = [
      { background: "#BBF7D0", text: "#166534" },
      { background: "#BFDBFE", text: "#1E40AF" },
      { background: "#FECACA", text: "#B91C1C" },
      { background: "#FED7AA", text: "#9A3412" },
      { background: "#FEF08A", text: "#854D0E" },
    ];
    return colors[index % colors.length]; 
  };
  const handleCreate = async () => {
    let success = false;
    try {
      const result = await createEquipe(skills, user?.id, token);
      setMessage(result.message);
      if (result.success) {
        // Make sure the skills are included in the team object
        const teamWithSkills = {
          ...result.team,
          competencesRequises: skills // Ensure skills are included
        };
        
        localStorage.setItem('equipe', JSON.stringify(teamWithSkills));
        const updatedUser = { 
          ...user, 
          equipe: teamWithSkills,
          equipeId: teamWithSkills.id, 
          chefEquipe: true 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setShowSuccessCreate(true);
        success = true;
        setCreateIcon(<MiniCheckPhoto />);
        
        // Call the callback with the team including skills
        if (onTeamCreated) {
          onTeamCreated(teamWithSkills);
        }
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create team');
    } finally {
      setTimeout(() => {
        setShowCreate(false);
        setShowSuccessCreate(false);
        setSkills([]);
        setFirstText(true);
        setSecondText(false);
        setMessage("");
      }, 3000);
    }
  };
  const handleSearchSubmit = () => setSearchTitle(inputValue.trim());
  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearchSubmit(); };
  const handleFilterClick = () => setShowFilter && setShowFilter(true);
  const handleAddCompanyClick = () => setAddcompanypage && setAddcompanypage(true);
  const [invitationsProf, setInvitationsProf] = useState(null);
  const fetchNotificationsProf = async () => {
  try {
    setLoading(true);
    const response = await axios.get('http://localhost:3000/api/demandes/received', { withCredentials: true });
    setInvitationsProf(response.data || null);
    console.log("invitation:",invitationsProf);
    setError(null);
  } catch (err) {
   console.error("Fetch professor notifications error:", err);
   setError("Failed to load professor notifications");
    setInvitationsProf(null);
  } finally {
    setLoading(false);
  }
};
const handleAcceptProf = async (demandeId) => {
  try {
    setInvitationsProf(prev => prev.filter(inv => inv.id !== demandeId));
    await axios.post(`http://localhost:3000/api/demandes/accept/${demandeId}`, {}, { withCredentials: true });
  } catch (err) {
    await fetchNotificationsProf();
    setError(err.response?.data?.error || "Failed to accept demande");
  }
};
const handleDeclineProf = async (demandeId, motifRefus = "Demande refusée par l'enseignant.") => {
  try {
    setInvitationsProf(prev => prev.filter(inv => inv.id !== demandeId));
    await axios.post(`http://localhost:3000/api/demandes/reject/${demandeId}`, { motifRefus }, { withCredentials: true });
  } catch (err) {
    await fetchNotificationsProf();
    setError(err.response?.data?.error || "Failed to decline demande");
  }
};
useEffect(() => {
  if (showNotifications && page === "Projects" && role === "professor") fetchNotificationsProf();
}, [showNotifications, page, role]);

  return (
    <>
      {(page==="Projects" && role!=="professor") &&
        <div className="searchsection">
          <div className="search">
            <SearchIcon onClick={handleSearchSubmit} />
            <input placeholder="Search a project" type="text" className="input" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} />
          </div>
          <div className="filter">
            <button onClick={handleFilterClick}>Filter<FilterIcon /></button>
          </div>
        </div>}

      {page === "Teams" &&
        <div className="searchsection">
          <div className="searchacc">
            <SearchIcon onClick={handleSearchSubmit} />
            <input placeholder="Search a project" type="text" className="input" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} />
          </div>
          <div className="filteracc">
            <button onClick={handleFilterClick}>Filter<FilterIcon /></button>
          </div>
          <div className="createteam">
            <div className="notification-icon-container" onClick={() => setShowNotifications(!showNotifications)}>
              <NotificationIcon className="notif" />
              {invitations.length > 0 && <div className="notification-badge"></div>}
            </div>
            <button onClick={() => setShowCreate(true)}><PlusIcon />Create Team</button>
          </div>
          {showNotifications &&
            <NotificationsDropdown invitations={invitations} onAccept={handleAccept} onDecline={handleDecline} loading={loading} error={error} isTeamLeader={user?.chefEquipe} />
          }
        </div>}
        {(page==="Projects" && role==="professor") && <> <div className="searchsection">
          <div className="searchacc">
            <SearchIcon onClick={handleSearchSubmit} />
            <input placeholder="Search a project" type="text" className="input" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} />
          </div>
          <div className="notifprof">
            <div className="notification-icon-container" onClick={() => setShowNotifications(!showNotifications)}>
              <NotificationIcon className="notif" />
              {invitationsProf!==0 && <div className="notification-badge"></div>}
            </div>
          </div>
          <div className="filteracc">
            <button onClick={handleFilterClick}>Filter<FilterIcon /></button>
          </div>
          {showNotifications &&
            <ProfNotificationsDropdown demandes={invitationsProf} onAccept={handleAcceptProf} onDecline={handleDeclineProf} loading={loading} error={error} />
          }
          
        </div></>}

      {page === "Accounts" &&
        <div className="searchsection">
          <div className="searchacc">
            <SearchIcon onClick={handleSearchSubmit} />
            <input placeholder="Search a project" type="text" className="input" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} />
          </div>
          <div className="filteracc">
            <button onClick={handleFilterClick}>Filter<FilterIcon /></button>
          </div>
          <div className="addcompanyacc">
            <button onClick={handleAddCompanyClick}><PlusIcon />Add Company Account</button>
          </div>
        </div>}

      {showCreate && <div className="doyouwant">
        <div className="doyouwantwrapper">
          {firstText ? <p>Do you want to create a team?</p> :
            secondText ? 
            <>{message ? <>{createIcon}<p style={{ color: '#ff6000' }}>{message}</p></> : <p>Do you want to add required skills to your team?</p>}</>
              : showSuccessCreate ? <>{createIcon}<p style={{ color: '#ff6000' }}>{message}</p></>
                : message ? <>{createIcon}<p style={{ color: '#ff6000' }}>{message}</p></>
                  : <div className="editprofile">
                    <label>Required Skills:</label>
                    <div className="addskill">
                      <input type="text" placeholder='Add skill' value={skill} onChange={(e) => setSkill(e.target.value)} onKeyDown={handleKeyDown2} />
                      <button onClick={handleSubmit}>Add</button>
                    </div>
                    <div className='skills-list' style={{marginBottom:'10px'}}>
                      {skills.map((skill,index)  => { 
                         const { background, text } = getRandomSkillColor(index);
                         return (<Skill key={skill} skill={skill} setSkills={setSkills} background={background} text={text}/>)})}
                    </div>
                  </div>}

          <div className="yesno">
            {firstText ? <><button className="cancel" onClick={() => setShowCreate(false)}>Cancel</button><button className="yes" onClick={() => { setFirstText(false); setSecondText(true); }}>Yes</button></>
              : secondText ? (!showSuccessCreate && !message && <><button className="cancel" onClick={handleCreate}>No</button><button className="yes" onClick={() => setSecondText(false)}>Yes</button></>)
                : (!showSuccessCreate && !message && <><button className="cancel" onClick={() => { setSecondText(true); setSkills([]); }}>Go back</button><button className="yes" onClick={handleCreate}>Create</button></>)}</div>
        </div>
      </div>}
    </>
  );
}
