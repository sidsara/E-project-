import './NotificationsDropdown.css';
import { CheckIcon, XIcon } from '../icons/projectIcons';

export default function NotificationsDropdown({ invitations, onAccept, onDecline, loading, error, isTeamLeader }) {
  const baseUrl = "http://localhost:3000";
  
  // Helper functions
  const getRandomColor = (userId) => {
    const colors = [
      '#FFB6C1', '#FFD700', '#98FB98', '#ADD8E6', '#DDA0DD', 
      '#FFA07A', '#87CEFA', '#90EE90', '#FFC0CB', '#FFA500'
    ];
    return colors[userId.toString().split('').reduce((a,b) => a + parseInt(b), 0) % colors.length];
  };

  const getSenderName = (sender) => {
    return `${sender.prenom} ${sender.nom}`;
  };

  const getSenderSkills = (sender) => {
    return sender.skills?.join(', ') || 'No skills specified';
  };

  return (
    <div className="notifications-dropdown">
      <div className="dropdown-content">
        {loading && <div className="loading-message">Loading notifications...</div>}
        {error && <div className="error-message">{error}</div>}
        
        {!loading && !error && invitations.length === 0 && (
          <div className="empty-message">No new notifications</div>
        )}

        {invitations.map((invitation) => {if (!invitation || !invitation.sender) return null;

  return (
          <div key={invitation.id} className="invitation-item">
            <div className="invitation-info">
              <div className="sender-avatar-container">
                <a
                  href={`/profile/${invitation.sender.id}`}
                  className="avatar-link"
                  title={getSenderName(invitation.sender)}
                >
                  <span className="avatar">
                    <img 
                      src={
                        invitation.sender.profileImageUrl 
                          ? baseUrl + invitation.sender.profileImageUrl 
                          : `https://ui-avatars.com/api/?name=${invitation.sender.nom}+${invitation.sender.prenom}`
                      } 
                      alt={getSenderName(invitation.sender)} 
                      className="avatar-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${invitation.sender.nom}+${invitation.sender.prenom}`;
                      }}
                    />
                  </span>
                </a>
              </div>
              <div className="sender-details">
                <span className="sender-name">{getSenderName(invitation.sender)}</span>
                <span className="invitation-message">Sent invitation request to join your team</span>
                <div className="invitation-details">
                  <div className="sender-skills">Skills: {getSenderSkills(invitation.sender)}</div>
                </div>
              </div>
            </div>
            {isTeamLeader && (
              <div className="action-buttons">
                <button className="accept-btn" onClick={() => onAccept(invitation.id)}>
                  <CheckIcon className="min-icon" />
                </button>
                <button className="decline-btn" onClick={() => onDecline(invitation.id)}>
                  <XIcon className="min-icon" />
                </button>
              </div>
            )}
          </div>);
})}
      </div>
    </div>
  );
}