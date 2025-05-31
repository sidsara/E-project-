import React, { useState, useEffect } from "react";
import "./Teams.css";
import { DeleteIcon, QuitIcon, XIcon } from "../../icons/projectIcons";
import SuccMsg from '../../components/SuccMsg';


const TeamCard = ({ 
  teamName = "Team",
  userRole = "student", 
  status = "Incomplete", 
  skills = [],
  members = [],
  currentUserId,
  isCurrentUserTeam = false,
  teamId,
  isUserTeamLeader = false,
  onStatusUpdate,
  onSkillsUpdate,
  onJoinRequest,
  onDeleteTeam,
  onQuitTeam,
}) => {
  
  // Add loading state for join request
  const [isJoining, setIsJoining] = useState(false);
  // Status options
  const statusOptions = [
    { value: "COMPLET", label: "Complete", color: "#E6F0E8", textColor: "#365D3D" },
    { value: "INCOMPLET", label: "Incomplete", color: "#FEE2E2", textColor: "#B91C1C" }
  ];
  const [selectedStatus, setSelectedStatus] = useState(
    statusOptions.find(opt => opt.value === status)?.value || "INCOMPLET"
  );
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Skills options
  const initialSkillsOptions = [
    { value: "React", color: "#A7F3D0", textColor: "#065F46" },
    { value: "Node.js", color: "#BFDBFE", textColor: "#1E40AF" },
    { value: "Figma", color: "#FBCFE8", textColor: "#9D174D" },
    { value: "Prisma", color: "#DDD6FE", textColor: "#5B21B6" },
    { value: "SQL", color: "#FDE68A", textColor: "#92400E" }
  ];
  const [skillsOptions, setSkillsOptions] = useState(initialSkillsOptions);
  const [selectedSkills, setSelectedSkills] = useState(skills);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [successMsg, setSuccessMsg] = useState('');
  const [showMemberPopup, setShowMemberPopup] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const processMembers = () => {
    if (!members || members.length === 0) return [];
  
    // Trouver le chef d'équipe (leader) - modification ici
    const leader = members.find(member => member.chefEquipe === true || member.chefEquipe);
    const currentUser = members.find(member => member.id === currentUserId);
  
    // Filtrer les autres membres
    const others = members.filter(member =>
      member.id !== (leader?.id || "") &&
      member.id !== (currentUser?.id || "")
    );
  
    const displayArray = [];
  
    // 1. Ajouter le Chef d'équipe
    if (leader) {
      displayArray.push({
        ...leader,
        displayName: leader.id === currentUserId ? "Moi (Chef)" : leader.nom,
        role: "★ Chef d'équipe",
        isLeader: true,
        isCurrentUser: leader.id === currentUserId
      });
    }
  
    // 2. Ajouter l'utilisateur actuel si ce n'est pas le chef
    if (currentUser && (!leader || currentUser.id !== leader.id)) {
      displayArray.push({
        ...currentUser,
        displayName: "Me",
        role: "Membre",
        isLeader: false,
        isCurrentUser: true
      });
    }
  
    // 3. Ajouter les autres membres
    others.forEach(member => {
      displayArray.push({
        ...member,
        displayName: member.nom,
        role: "Membre",
        isLeader: false,
        isCurrentUser: false
      });
    });
  
    return displayArray;
  };
  
  const processedMembers = processMembers();

  
  // Helper functions
  const getRandomColor = (userId) => {
    const colors = [
      '#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A8',
      '#33FFF5', '#FF8C33', '#8C33FF', '#33FF8C', '#FF3385'
    ];
    return colors[userId.toString().split('').reduce((a,b) => a + parseInt(b), 0) % colors.length];
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.map(part => part[0]?.toUpperCase() || '').join('').substring(0, 2);
  };

  const generateRandomColor = () => {
    const colors = [
      { bg: "#FECACA", text: "#B91C1C" },
      { bg: "#FED7AA", text: "#9A3412" },
      { bg: "#FEF08A", text: "#854D0E" },
      { bg: "#BBF7D0", text: "#166534" },
      { bg: "#BFDBFE", text: "#1E40AF" }
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handlers
  const handleStatusChange = async (newStatus) => {
    if (onStatusUpdate) {
      await onStatusUpdate(teamId, newStatus,setSelectedStatus);
    }
  };

  const toggleSkill = async (skill) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    
    setSelectedSkills(newSkills);
    
    if (onSkillsUpdate) {
      try {
        const success = await onSkillsUpdate(teamId, newSkills);
        if (!success) {
          // Revert if update failed
          setSelectedSkills(selectedSkills);
        }
      } finally {
      }
    }
  };
  
  const removeSkill = async (skill, e) => {
    e.stopPropagation();
    const newSkills = selectedSkills.filter(s => s !== skill);
    setSelectedSkills(newSkills);
    
    if (onSkillsUpdate) {
      try {
        const success = await onSkillsUpdate(teamId, newSkills);
        if (!success) {
          // Revert if update failed
          setSelectedSkills(selectedSkills);
        }
      } finally {
      }
    }
  };
  

  const addNewSkill = async () => {
    if (newSkillInput.trim() && !skillsOptions.some(s => s.value === newSkillInput)) {
      const { bg: color, text: textColor } = generateRandomColor();
      const newSkill = {
        value: newSkillInput,
        color,
        textColor
      };
      
      const newSkills = [...selectedSkills, newSkillInput];
      
      setSkillsOptions([...skillsOptions, newSkill]);
      setSelectedSkills(newSkills);
      setNewSkillInput("");
      
      if (onSkillsUpdate) {
        try {
          const success = await onSkillsUpdate(teamId, newSkills);
          if (!success) {
            // Revert if update failed
            setSelectedSkills(selectedSkills.filter(s => s !== newSkillInput));
            setSkillsOptions(skillsOptions.filter(s => s.value !== newSkillInput));
          }
        } finally {
        }
      }
    }
  };

  const [invitationSent, setInvitationSent] = useState(false);
  const handleJoinClick = async () => {
    if (onJoinRequest && !invitationSent) {
      setIsJoining(true);
      try {
        await onJoinRequest(teamId);
        setInvitationSent(true);
        localStorage.setItem(`invitationSent_${teamId}_${currentUserId}`, 'true');
        setSuccessMsg('Invitation sent successfully!');
      } catch (error) {
        console.error("Join request failed:", error);
        setSuccessMsg('Failed to send invitation');
      } finally {
        setIsJoining(false);
      }
    }
  };
  const handleDeleteTeam = () => {
    if (onDeleteTeam ) {
      onDeleteTeam(teamId);
    }
  };
  
  const handleQuitTeam = () => {
    if (onQuitTeam) {
      onQuitTeam(teamId);
    }
  };

  useEffect(() => {
    const storedInvitationStatus = localStorage.getItem(`invitationSent_${teamId}_${currentUserId}`);
    if (storedInvitationStatus === 'true') {
      setInvitationSent(true);
    }
  }, [teamId, currentUserId]);
  // Determine if we should show the join button
  const showJoinButton = userRole === "student" && !isCurrentUserTeam && status !== "COMPLET";
  const isCompactCard = !showJoinButton;

  return (
    <div className={`team-card-wrapper ${selectedStatus === "COMPLET" ? "complete" : ""}`}>
      <div className={`team-info-card ${isCompactCard ? "compact" : ""}`}>
        <div className="card-header">
          <h3>
            {isCurrentUserTeam ? `My Team: ${teamName}` : `${teamName}`}
          </h3>
          <div className="card-actions">
    {/* Show Quit button for ALL team members (including leader) */}
    {isCurrentUserTeam && (
      <button 
        className="icon-btn quit-btn" 
        title="Quit team"
        onClick={handleQuitTeam}
      >
        <QuitIcon />
      </button>
    )}
          
          {isUserTeamLeader && (
      <button 
      className="icon-btn delete-btn" 
      title="Delete team"
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteTeam();
      }}
    >
      <DeleteIcon />
    </button>
    
    )}
  </div>
</div>
          

        {/* Status Section */}
        <div className="property-section">
          <div className="property-label">Status</div>
          {isUserTeamLeader ? (
            <div className="dropdown-container">
              <div 
                className="status-display clickable-field"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <span 
                  className="status-option selected"
                  style={{
                    backgroundColor: statusOptions.find(o => o.value === selectedStatus)?.color || "#F3F4F6",
                    color: statusOptions.find(o => o.value === selectedStatus)?.textColor || "#4B5563",
                  }}
                >
                  {statusOptions.find(o => o.value === selectedStatus)?.label}
                </span>
              </div>
              
              {showStatusDropdown && (
                <div className="dropdown-menu">
                  {statusOptions.map(option => (
                    <div
                      key={option.value}
                      className="dropdown-item"
                      style={{
                        backgroundColor: option.color,
                        color: option.textColor,
                      }}
                      onClick={() => {
                        handleStatusChange(option.value);
                        setShowStatusDropdown(false);
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span 
              className="status-option"
              style={{
                backgroundColor: statusOptions.find(o => o.value === selectedStatus)?.color || "#F3F4F6",
                color: statusOptions.find(o => o.value === selectedStatus)?.textColor || "#4B5563",
              }}
            >
              {statusOptions.find(o => o.value === selectedStatus)?.label}
            </span>
          )}
        </div>

        {/* Skills Section */}
        <div className="property-section">
          <div className="property-label">Skills Required</div>
          {isUserTeamLeader ? (
            <div className="dropdown-container">
              <div 
                className="skills-display clickable-field"
                onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
              >
                {selectedSkills.length > 0 ? (
                  <div className="selected-skills">
                    {selectedSkills.map(skill => {
                      const skillData = skillsOptions.find(s => s.value === skill);
                      return (
                        <div
                          key={skill}
                          className="skill-option selected"
                          style={{
                            backgroundColor: skillData?.color || "#F3F4F6",
                            color: skillData?.textColor || "#4B5563",
                          }}
                        >
                          {skill}
                          <span 
                            className="remove-skill"
                            onClick={(e) => removeSkill(skill, e)}
                          >
                            ×
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="placeholder">Select skills...</div>
                )}
              </div>
              
              {showSkillsDropdown && (
                <div className="dropdown-menu skills-dropdown">
                  <div className="skill-search">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      placeholder="Add new skill..."
                      onKeyDown={(e) => e.key === 'Enter' && addNewSkill()}
                    />
                    <button onClick={addNewSkill}>+</button>
                  </div>
                  <div className="skills-list">
                    {skillsOptions.map(skill => (
                      <div
                        key={skill.value}
                        className={`dropdown-item ${selectedSkills.includes(skill.value) ? "selected" : ""}`}
                        style={{
                          backgroundColor: skill.color,
                          color: skill.textColor,
                        }}
                        onClick={() => toggleSkill(skill.value)}
                      >
                        {skill.value}
                        {selectedSkills.includes(skill.value) && <span> ✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="selected-skills">
              {selectedSkills.length > 0 ? (
                selectedSkills.map(skill => {
                  const skillData = skillsOptions.find(s => s.value === skill);
                  return (
                    <div
                      key={skill}
                      className="skill-option"
                      style={{
                        backgroundColor: skillData?.color || "#F3F4F6",
                        color: skillData?.textColor || "#4B5563",
                      }}
                    >
                      {skill}
                    </div>
                  );
                })
              ) : (
                <div className="no-skills">No skills specified</div>
              )}
            </div>
          )}
        </div>

        {/* Team Members Section */}
        <div className="property-section">
          <div className="property-label">Team Members</div>
          <div className="team-avatars">
            {processedMembers.length > 0 ? (
              processedMembers.map((member) => (
                <span
                  key={member.id}
                  className={`avatar-link ...`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedMember(member);
                    setShowMemberPopup(true);
                  }}
                >
                  <span className={`avatar ${member.isLeader ? 'avatar-gold' : ''}`}>
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} />
                    ) : (
                      <div 
                        className="avatar-initials" 
                        style={{ 
                          backgroundColor: member.isCurrentUser ? '#ff6600' : getRandomColor(member.id),
                          color: '#fff'
                        }}
                      >
                        {getInitials(member.name)}
                      </div>
                    )}
                    {member.isCurrentUser && <span className="user-badge">**</span>}
                  </span>
                </span>
              ))
            ) : (
              <div className="placeholder">No members yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Join Button - only for students not in team and team is incomplete */}
      {showJoinButton && (
        <div className="Join-new-team">
          <button 
            className={`Join-new-btn ${isJoining ? 'joining' : ''} ${invitationSent ? 'invitation-sent' : ''}`} 
            onClick={handleJoinClick}
            disabled={isJoining || invitationSent}
          >
            {isJoining ? (
              <span className="three-dots">
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
              </span>
            ) : invitationSent ? (
              "Invitation Sent"
            ) : (
              <>
                <span className="plus-icon">＋</span> Request to Join
              </>
            )}
          </button>
        </div>
      )}
      <SuccMsg 
  message={successMsg} 
  onClose={() => setSuccessMsg('')}
/>
{showMemberPopup && selectedMember && (
  <div className="profile-popup-overlay" onClick={() => setShowMemberPopup(false)}>
    <div className="profile-popup-mini" onClick={e => e.stopPropagation()}>
      <div className="profile-banner mini" />
      <img
        className="profile-photo mini"
        src={selectedMember.avatarUrl || require('../../images/User.png')}
        alt="User"
      />
      <button
        className="close-popup mini"
        onClick={() => setShowMemberPopup(false)}
      >
        <XIcon/>
      </button>
      <div className="profile-section mini">
        <div className="profile-left mini">
          <h2 className="profile-name mini"><b>{selectedMember.nom} {selectedMember.prenom}</b></h2>
          <p className="profile-status mini">{selectedMember.niveau ? `${selectedMember.niveau} Year Student` : ''}</p>
          {selectedMember.specialite && (
            <p className="profile-feild mini">speciality: {selectedMember.specialite?.toUpperCase()}</p>
          )}
          <div className="skills-label mini">Skills ✩</div>
          <div className="skills-list mini" id="list1">
            {selectedMember.skills && selectedMember.skills.length > 0 ? (
              selectedMember.skills.map((skill, index) => {
                const colors = [
                  { background: "#BBF7D0", text: "#166534" },
                  { background: "#BFDBFE", text: "#1E40AF" },
                  { background: "#FECACA", text: "#B91C1C" },
                  { background: "#FED7AA", text: "#9A3412" },
                  { background: "#FEF08A", text: "#854D0E" },
                ];
                const { background, text } = colors[index % colors.length];
                return (
                  <span key={skill} className="skill-badge mini" style={{ backgroundColor: background, color: text }}>{skill}</span>
                );
              })
            ) : (
              <span className="no-skill-badge mini">No skills added yet</span>
            )}
          </div>
        </div>
        <div className="profile-right mini">
          <div className="current-role mini">
            <p>Current Role</p>
            <span>{selectedMember.isLeader ? 'Team Leader' : 'Team Member'}</span>
          </div>
        </div>
      </div>
      <div className="info-cards mini">
        <div className="info-card mini">
          <div className="card-title mini">Email</div>
          <p>{selectedMember.email}</p>
        </div>
      </div>
    </div>
  </div>
)}
 </div>
  );
};

export default TeamCard;