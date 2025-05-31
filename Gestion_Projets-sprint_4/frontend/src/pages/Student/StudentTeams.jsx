import './Teams.css';
import Header from '../../components/Header';
import SidebarByUser from '../../components/SidebarByUser';
import { useEffect, useState } from 'react';
import Search from '../../components/Search';
import TeamCard from '../../pages/Student/Teams';
import axios from 'axios';
import { TeamsEmptyIcon } from '../../icons/projectIcons';
import NewLeaderModal from '../../components/NewLeaderModal';
import SuccMsg from '../../components/SuccMsg';
import ConfirmMsg from '../../components/ConfirmMsg';
import FailMsg from '../../components/FailMsg';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

export default function StudentTeams() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('student');
  const [userTeamId, setUserTeamId] = useState(null);
  const [userTeamStatus, setUserTeamStatus] = useState('Incomplete');
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [teamMembersForModal, setTeamMembersForModal] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmMessage, setConfirmMessage] = useState(null);
  const [failMsg, setFailMsg] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const equipeId = localStorage.getItem("equipeId");
        const isTeamLeader = localStorage.getItem("chefEquipe") === 'true';
        
        if (storedUser) {
          setUser(storedUser);
          
          // Fetch all teams with updated status
          const teamsResponse = await api.get('/teams', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            params: {
              niveau: storedUser.niveau,
              specialite: storedUser.specialite !== 'none' ? storedUser.specialite : undefined
            }
          });
          
          const baseUrl = "http://localhost:3000";
          
          const formattedTeams = teamsResponse.data.teams.filter(team => team && team.id).map(team => ({
            id: team.id,
            name: team.nom || `Team ${team.id}`,
            status: team.status, // Keep raw status (COMPLET/INCOMPLET)
            skills: team.skillsRequired || [],
            members: [
              ...(team.chefEquipe ? [{
              id: team.chefEquipe.id,
              nom: team.chefEquipe.nom,
              prenom: team.chefEquipe.prenom,
              chefEquipe: true,
              email: team.chefEquipe.email,
              skills: team.chefEquipe.skills,
              profileImageUrl: team.chefEquipe.profileImageUrl,
              name: `${team.chefEquipe.nom} ${team.chefEquipe.prenom}`,
              role: 'Team Leader',
              avatarUrl: team.chefEquipe.profileImageUrl 
                ? baseUrl + team.chefEquipe.profileImageUrl 
                : `https://ui-avatars.com/api/?name=${team.chefEquipe.nom}+${team.chefEquipe.prenom}`
              }] : []),
              ...(team.membres?.map(member => ({
              id: member.id,
              nom: member.nom,
              prenom: member.prenom,
              chefEquipe: false,
              email: member.email,
              skills: member.skills,
              profileImageUrl: member.profileImageUrl,
              name: `${member.nom} ${member.prenom}`,
              role: 'Member',
              avatarUrl: member.profileImageUrl ? baseUrl + member.profileImageUrl : 
                `https://ui-avatars.com/api/?name=${member.nom}+${member.prenom}`
              })) || [])
            ]
            }));
          
            let sortedTeams = formattedTeams;

            if (equipeId) {
              const myTeamId = parseInt(equipeId);
              const myTeam = formattedTeams.find(team => team.id === myTeamId);
              const otherTeams = formattedTeams
                .filter(team => team && team.id !== myTeamId)
                .sort((a, b) => a.id - b.id);
      
              sortedTeams = [myTeam, ...otherTeams];
              
              // Update local storage with current status from backend
              if (myTeam) {
                localStorage.setItem("teamStatus", myTeam.status);
                setUserTeamStatus(myTeam.status === "COMPLET" ? "Complete" : "Incomplete");
              }
            } else {
              sortedTeams = formattedTeams.sort((a, b) => a.id - b.id);
            }
      
            setAllTeams(sortedTeams);
            
            // Set user's team info
            if (equipeId) {
              setUserRole(isTeamLeader ? 'leader' : 'member');
              setUserTeamId(parseInt(equipeId));
            }
          }
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setLoading(false);
        }
      };
    fetchData();
  }, []);

  
// In your StudentTeams component

const handleTeamCreated = (newTeam) => {
  // Format the new team data with current user as leader
  const formattedTeam = {
    id: newTeam.id,
    name: newTeam.nom || `Team ${newTeam.id}`,
    status: newTeam.status || "INCOMPLET",
    skills: newTeam.competencesRequises || [],
    members: [{
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      chefEquipe: true,
      email: user.email,
      skills: user.skills || [],
      profileImageUrl: user.profileImageUrl,
      name: `${user.nom} ${user.prenom}`,
      role: 'Team Leader',
      avatarUrl: user.profileImageUrl 
        ? `http://localhost:3000${user.profileImageUrl}`
        : `https://ui-avatars.com/api/?name=${user.nom}+${user.prenom}`
    }]
  };

  // Update state
  setAllTeams(prevTeams => [formattedTeam, ...prevTeams]);
  setUserTeamId(newTeam.id);
  setUserRole('leader');
  
  // Update localStorage
  localStorage.setItem("equipeId", newTeam.id);
  localStorage.setItem("chefEquipe", "true");
  localStorage.setItem("teamStatus", newTeam.status || "INCOMPLET");
  
  // Update user in state and localStorage
  const updatedUser = {
    ...user,
    equipeId: newTeam.id,
    chefEquipe: true,
    equipe: formattedTeam
  };
  setUser(updatedUser);
  localStorage.setItem("user", JSON.stringify(updatedUser));
};


  const handleTeamStatusUpdate = async (teamId, newStatus,setSelectedStatus) => {
    try {
      const response = await api.put(`/updateEquipe/${teamId}`, {
        status: newStatus,
        skillsRequired: allTeams.find(t => t.id === teamId)?.skills || []
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (response.data.warning) {
        // Afficher un avertissement mais continuer
        setFailMsg(response.data.warning); // Display warning using FailMsg component
      }

      if (response.data.team) {
        setUserTeamStatus(response.data.team.status);
        localStorage.setItem("teamStatus", response.data.team.status);
        setSelectedStatus(response.data.team.status); // Update the selected status in the parent component if needed
        // Update the team in state
        setAllTeams(allTeams.map(team => 
          team.id === teamId ? {...team, status: response.data.team.status} : team
        ));
      }

      if (response.data.error) {
        setFailMsg(response.data.error); // Display the error message in red using FailMsg component
      } else if (response.data.successMsg) {
        setSuccessMsg(response.data.successMsg); // Display the success message using SuccMsg component
      }
    } catch (error) {
      console.error("Error updating team status:", error);
      if (error.response?.data?.error) {
        setFailMsg(error.response.data.error); // Display the error message in red using FailMsg component
      } else {
        setFailMsg("Failed to update team status"); // Fallback error message
      }
    }
  };

  const handleTeamSkillsUpdate = async (teamId, newSkills) => {
    try {
      console.log("Updating skills for team:", teamId, "with skills:", newSkills);
      
      const response = await api.put(`/updateEquipe/${teamId}`, {
        skillsRequired: newSkills,
        status: userTeamStatus // Keep current status
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (response.data.team) {
        // Update both skills and status in case they changed
        setAllTeams(allTeams.map(team => 
          team.id === teamId ? {
            ...team,
            skillsRequired: response.data.team.skillsRequired,
            status: response.data.team.status
          } : team
        ));
        
        // Update local storage if it's the user's team
        if (teamId === parseInt(localStorage.getItem("equipeId"))) {
          localStorage.setItem("teamStatus", response.data.team.status);
          setUserTeamStatus(response.data.team.status);
        }
        
        return true; // Indicate success
      }
      return false;
    } catch (error) {
      console.error("Error updating team skills:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setFailMsg(`Failed to update skills: ${error.response?.data?.error || error.message}`); // Display error using FailMsg component
      return false;
    }
  };
  const handleJoinRequest = async (teamId) => {
    try {
      const response = await api.post('http://localhost:3000/api/invitations/send', {
        equipeId: teamId,
        // Add any additional required fields
        senderId: user?.id,
        status: "pending"
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (response.data.message) {
        setSuccessMsg(response.data.message); // Display success message using SuccMsg component
      }
    } catch (error) {
      console.error("Error sending join request:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Failed to send join request";
      setFailMsg(errorMessage); // Display error using FailMsg component
    }
  };
  const handleDeleteTeam = async (teamId) => {
    setConfirmMessage({
      message: "Are you sure you want to delete this team?",
      onConfirm: async () => {
        try {
          // Call API to delete first
          const response = await api.delete(`/delete/${teamId}`, {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}` 
            }
          });
  
          // Verify successful response
          if (!response.data.success) {
            throw new Error(response.data.error || "Deletion failed on server");
          }
  
          // Only update state after successful deletion
          setAllTeams(prev => prev.filter(t => t.id !== teamId));
  
          // Clean up user data if it was their team
          if (userTeamId === teamId) {
            localStorage.removeItem("equipeId");
            localStorage.removeItem("chefEquipe");
            localStorage.removeItem("teamStatus");
            setUserTeamId(null);
            setUserRole('student');
          }

          // Refetch teams filtered by specialite and niveau
          const storedUser = JSON.parse(localStorage.getItem("user"));
          const teamsResponse = await api.get('/teams', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            params: {
              niveau: storedUser.niveau,
              specialite: storedUser.specialite !== 'none' ? storedUser.specialite : undefined
            }
          });

          const baseUrl = "http://localhost:3000";
          const formattedTeams = teamsResponse.data.teams.filter(team => team && team.id).map(team => ({
            id: team.id,
            name: team.nom || `Team ${team.id}`,
            status: team.status,
            skills: team.skillsRequired || [],
            members: [
              ...(team.chefEquipe ? [{
                id: team.chefEquipe.id,
                nom: team.chefEquipe.nom,
                prenom: team.chefEquipe.prenom,
                chefEquipe: true,
                email: team.chefEquipe.email,
                skills: team.chefEquipe.skills,
                profileImageUrl: team.chefEquipe.profileImageUrl,
                name: `${team.chefEquipe.nom} ${team.chefEquipe.prenom}`,
                role: 'Team Leader',
                avatarUrl: team.chefEquipe.profileImageUrl 
                  ? baseUrl + team.chefEquipe.profileImageUrl 
                  : `https://ui-avatars.com/api/?name=${team.chefEquipe.nom}+${team.chefEquipe.prenom}`
              }] : []),
              ...(team.membres?.map(member => ({
                id: member.id,
                nom: member.nom,
                prenom: member.prenom,
                chefEquipe: false,
                email: member.email,
                skills: member.skills,
                profileImageUrl: member.profileImageUrl,
                name: `${member.nom} ${member.prenom}`,
                role: 'Member',
                avatarUrl: member.profileImageUrl ? baseUrl + member.profileImageUrl : 
                  `https://ui-avatars.com/api/?name=${member.nom}+${member.prenom}`
              })) || [])
            ]
          }));

          setAllTeams(formattedTeams);

          console.log("Team deleted successfully:", response.data.message);
        } catch (error) {
          console.error("Delete failed:", {
            message: error.message,
            response: error.response?.data,
            config: error.config
          });

          setFailMsg(error.response?.data?.error || error.message || "Failed to delete team"); // Display error using FailMsg component
        }
      },
      onCancel: () => setConfirmMessage(null),
    });
  };

  const handleQuitTeam = async (teamId) => {
    try {
      const currentTeam = allTeams.find(t => t.id === teamId);
      
      // If user is leader and there are other members, show leader selection modal
      if (userRole === 'leader' && currentTeam.members.length > 1) {
        const otherMembers = currentTeam.members.filter(m => m.id !== user?.id);
        setTeamMembersForModal(otherMembers);
        setShowLeaderModal(true);
        return; // Exit early, let modal handle the rest
      }
  
      setConfirmMessage({
        message: "Are you sure you want to leave the team?",
        onConfirm: async () => {
          try {
            const response = await api.post('/leave', {}, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
  
            if (response.status !== 200) {
              throw new Error(response.data?.message || "Failed to leave team");
            }
  
            // Update state and storage
            updateUserAndTeamState(teamId, currentTeam);
  
            // Refresh user data
            await refreshUserData();
  
            setSuccessMsg("You have successfully left the team.");
          } catch (error) {
            console.error("Error leaving team:", error);
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                "An unexpected error occurred.";
            setFailMsg(errorMessage); // Display error using FailMsg component
          }
        },
        onCancel: () => setConfirmMessage(null),
      });
    } catch (error) {
      console.error("Error leaving team:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "An unexpected error occurred.";
      setFailMsg(errorMessage); // Display error using FailMsg component
    }
  };
  
  const handleModalConfirm = async (selectedLeaderId) => {
    setShowLeaderModal(false);
    try {
      const response = await api.post('/leave', { newChefId: selectedLeaderId }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (response.status !== 200) {
        throw new Error(response.data?.message || "Failed to leave team");
      }
  
      // Update local state and storage
      updateUserAndTeamState(userTeamId, allTeams.find(t => t.id === userTeamId));
  
      // Refresh user data
      await refreshUserData();
  
      setSuccessMsg("You have successfully left the team and transferred leadership.");
    } catch (error) {
      console.error("Error leaving team:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to leave team";
      setFailMsg(errorMessage); // Display error using FailMsg component
    }
  };
  
  // Helper function to update user and team state
  const updateUserAndTeamState = (teamId, currentTeam) => {
    // Remove team-related data from localStorage
    localStorage.removeItem("equipeId");
    localStorage.removeItem("chefEquipe");
    localStorage.removeItem("teamStatus");
    localStorage.removeItem("equipe");
  
    // Update the user object in localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      const updatedUser = {
        ...storedUser,
        chefEquipe: false,
        equipeId: null,
        equipe: null
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  
    // Update state
    setUserTeamId(null);
    setUserRole('student');
    
    // Update teams list
    setAllTeams(prevTeams => {
      // If team has no members left after user leaves, remove it
      if (currentTeam.members.length <= 1) {
        return prevTeams.filter(t => t.id !== teamId);
      }
      
      // Otherwise update the team with new leader if applicable
      return prevTeams.map(team => {
        if (team.id === teamId) {
          // Remove the leaving user
          const updatedMembers = team.members.filter(m => m.id !== user?.id);
          return { ...team, members: updatedMembers };
        }
        return team;
      });
    });
  };
  
  // Helper function to refresh user data
  const refreshUserData = async () => {
    try {
      const userRes = await api.get('/user/profile');
      const updatedUser = userRes.data.user;
      
      // Update user state
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };
  return (
    <div className="admincontainer">
      <SidebarByUser role="etudiant" />
      <div className="adminwrapper">
        <div className="adwrapper">
          <Header 
            page="Teams" 
            userrole="Student" 
            username={user ? `${user.nom} ${user.prenom}` : ''}
          />
          
          <Search page="Teams" onTeamCreated={handleTeamCreated}/>
          {loading? (
                <div className="loadercontainer" >
                  <div className="loader">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              ) : <><div className="teams-grid">
             {allTeams.filter(Boolean).map(team => {
              const isCurrentUserTeam = userTeamId === team.id; // This removes any undefined/null values
              return (
                <TeamCard
                  key={team.id}
                  teamName={isCurrentUserTeam ? ` ${team.name}` : team.name}
                  userRole={userRole}
                  status={team.status}
                  skills={team.skills}
                  members={team.members}
                  currentUserId={user?.id}
                  isCurrentUserTeam={isCurrentUserTeam}
                  teamId={team.id}
                  isUserTeamLeader={userRole === 'leader' && isCurrentUserTeam}
                  onStatusUpdate={isCurrentUserTeam ? handleTeamStatusUpdate : null}
                  onSkillsUpdate={isCurrentUserTeam ? handleTeamSkillsUpdate : null}
                  onJoinRequest={!userTeamId ? handleJoinRequest : null}
                  onDeleteTeam={userRole === 'leader' && isCurrentUserTeam ? handleDeleteTeam : null}
                  onQuitTeam={isCurrentUserTeam ? handleQuitTeam : null}
                  
                />
                
              );
            })}
            
           
          </div> {!userTeamId && allTeams.filter(Boolean).length === 0 && (
          <div className="no-teams-content">
            <TeamsEmptyIcon />
            </div>
          )}</>}
          <SuccMsg 
  message={successMsg} 
  onClose={() => setSuccessMsg('')}
/>
        </div>
      </div>
      {showLeaderModal && (
      <NewLeaderModal
        teamMembers={teamMembersForModal}
        onClose={() => setShowLeaderModal(false)}
        onConfirm={handleModalConfirm}
      />
    )}
    <ConfirmMsg 
      message={confirmMessage?.message} 
      onConfirm={async () => {
        if (confirmMessage?.onConfirm) {
          await confirmMessage.onConfirm();
        }
        setConfirmMessage(null); // Ensure the confirm message is cleared after confirmation
      }} 
      onCancel={() => setConfirmMessage(null)}
    />
    <FailMsg 
      message={failMsg} 
      onClose={() => setFailMsg('')}
    />
    </div>
  );
}
