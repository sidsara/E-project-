import React from 'react';
import SidebarByUser from '../../components/SidebarByUser.jsx';
import { useEffect,useState } from 'react';
import MultiStepForm from '../../components/MultiStepForm.jsx';
import '../Admin/Admin.css'; 
import Header from '../../components/Header.jsx';

const SubEnseignant = () => {
   const [user, setUser] = useState(null);
       
        useEffect(() => {
          const storedUser = JSON.parse(localStorage.getItem("user"));
          setUser(storedUser);
        }, []);
  return (
    <div className="admincontainer">
      <SidebarByUser role="enseignant" />
      <div className="adminwrapper">
        <div className="adwrapper">
                            <Header page="Projects" userrole="Professor" username={user?.nom + " " + user?.prenom}/>       
        
          <MultiStepForm />
        </div>
      </div>
    </div>
  );
};

export default SubEnseignant;
