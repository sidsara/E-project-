import './NotificationsDropdown.css';
import { CheckIcon, XIcon } from '../icons/projectIcons';

export default function ProfNotificationsDropdown({ demandes, onAccept, onDecline, loading, error }) {
    console.log('demandes:', demandes);


  return (
    <div className="notifications-dropdown">
      <div className="dropdown-content">
        {loading && <div className="loading-message">Loading requests...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && Array.isArray(demandes) && demandes.length === 0 && (
          <div className="empty-message">No new subject requests</div>
        )}

        {Array.isArray(demandes) && demandes.map((demande) => {
          const equipe = demande.Equipe || {};
          const sujet = demande.Sujet || {};
          const membres = equipe.etudiants || [];

          return (
            <div key={demande.id} className="invitation-item">
              <div className="invitation-info">
                <div className="sender-details">
                  <span className="sender-name">Team {equipe.id ?? 'N/A'}</span>
                  <span className="invitation-message">
                    Request to work on subject: <strong>{sujet.titre ?? 'N/A'}</strong>
                  </span>
                  <div className="invitation-details">
                    <div>Team members: {membres.map(e => `${e.prenom} ${e.nom}`).join(', ')}</div>
                   
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  aria-label="Accept request"
                  className="accept-btn"
                  onClick={() => onAccept(demande.id)}
                >
                  <CheckIcon className="min-icon" />
                </button>
                <button
                  aria-label="Decline request"
                  className="decline-btn"
                  onClick={() => onDecline(demande.id)}
                >
                  <XIcon className="min-icon" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
