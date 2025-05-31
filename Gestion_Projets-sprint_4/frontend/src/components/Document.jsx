import { useState } from 'react';
import {
    AddStatus,
    DocumentIcon,
    InValidStatus,
    ToImproveStatus,
    ValidStatus
} from '../icons/projectIcons';
    import axios from 'axios';
    import './Document.css';

    export default function Document({ id, document, name, status, role }) {
        const [showStatusOptions, setShowStatusOptions] = useState(false);
        const [currentStatus, setCurrentStatus] = useState(status);
      
        const baseUrl = "http://localhost:3000";
      
        const getStatusIcon = () => {
          switch (currentStatus) {
            case 'VALIDATED':
              return <ValidStatus />;
            case 'REJECTED':
              return <InValidStatus />;
            case 'NEEDS_IMPROVEMENT':
              return <ToImproveStatus />;
            default:
              if(role==="professor"){
                return <AddStatus/>
              } else {return null};
          }
        };
      
        const handleStatusClick = (e) => {
          if(role==="professor"){
            e.stopPropagation();
            e.preventDefault();
            setShowStatusOptions(!showStatusOptions);
          }
        };
      
        const updateLivrableStatus = async (livrableId, newStatus) => {
          try {
            const response = await axios.put(
              `http://localhost:3000/livrables/${livrableId}`, 
              { status: newStatus },
              { withCredentials: true }
            );
            return response.data;
          } catch (error) {
            console.error('Error updating livrable status:', error.response?.data || error.message);
            throw error;
          }
        };
      
        const handleStatusChange = (livrableId, status) => {
          updateLivrableStatus(livrableId, status)
            .then((data) => {
              console.log('Status updated: ' + data.message);
              setCurrentStatus(status);  // Ensure state is updated
              setShowStatusOptions(false);  // Close the dropdown
            })
            .catch((err) => {
              alert('Failed to update status');
            });
        };
      
        return (
          <a
            style={{ textDecoration: 'none' }}
            href={`${baseUrl}/${document}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="document-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <DocumentIcon />
                <div className="document-content">
                  <span>File:</span>
                  <p>{name}</p>
                </div>
              </div>
      
              <div className="document-status" onClick={handleStatusClick} style={{ position: 'relative' }}>
                {getStatusIcon()}
                {showStatusOptions && (
                  <div className="status-dropdown">
                    <div onClick={() => handleStatusChange(id, 'VALIDATED')}><ValidStatus/></div>
                    <div onClick={() => handleStatusChange(id, 'REJECTED')}><InValidStatus/></div>
                    <div onClick={() => handleStatusChange(id, 'NEEDS_IMPROVEMENT')}><ToImproveStatus/></div>
                    </div>
                )}
              </div>
            </div>
          </a>
        );
      }
      