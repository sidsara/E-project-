import { ThreeDots } from '../icons/projectIcons';
import './Feedback.css';

export default function Feedback({ feedback,nom,prenom,picture,date,role}) {
    function timeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
    
        const units = [
            { name: 'year', seconds: 31536000 },
            { name: 'month', seconds: 2592000 },
            { name: 'day', seconds: 86400 },
            { name: 'hour', seconds: 3600 },
            { name: 'minute', seconds: 60 },
            { name: 'second', seconds: 1 }
        ];
    
        for (let unit of units) {
            const amount = Math.floor(diffInSeconds / unit.seconds);
            if (amount >= 1) {
                return `${amount} ${unit.name}${amount > 1 ? 's' : ''} ago`;
            }
        }
    
        return "just now";
    }
    const dateago = timeAgo(date);
    
    return(
        <>
            <div className="feedback-card">
               <div className="feedback-header">
               <div className="feedback-profile">
                <div className="feedback-picture-container">
                    <img src={picture} alt={`${prenom} ${nom}`} />
                </div>
                <p>{nom} {prenom}</p>
                <span>{dateago}</span>
                </div>
               {role==="professor" && <ThreeDots/>}

               </div>
                <div className="feedback-content">
                    <p>{feedback}</p>
                </div>
            </div>
        </>
    );
}