import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CompanyList.css';

import { OrangeCircleIcon, BlueCircleIcon } from '../icons/projectIcons';

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}entreprises`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data && response.data.companies) {
          setCompanies(response.data.companies);
        } else {
          console.warn('No companies data found in response:', response.data);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (companies.length === 0) {
    return <div>No companies found.</div>;
  }

  return (
    <div className="company-list">
      <h2>Company List</h2>
      <div className="companylistcontainer">
        {companies.map((company, index) => (
          <div className="company" key={index}>
            <div className="profile">
              <div className="info" style={{ textAlign: 'left' }}>
                <span><b>{company.nom}</b></span>
                <p>{company.email}</p>
                <p>{company.secteur}</p>
              </div>
            </div>
            <div className={`status ${company.isActive ? 'active' : ''}`}>
              {company.isActive ? (
                <>
                  <OrangeCircleIcon />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <BlueCircleIcon />
                  <span>Inactive</span>
                </>
              )}
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

export default CompanyList;