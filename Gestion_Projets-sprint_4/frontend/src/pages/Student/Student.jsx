import Header from '../../components/Header';
import SidebarByUser from '../../components/SidebarByUser';
import { useEffect,useState } from 'react';
import axios from 'axios';
import WelcomeSection from '../../components/WelcomeSection';
import { dashIcon } from '../../icons/projectIcons';

export default function Student() {
     const [user, setUser] = useState(null);
     
      useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setUser(storedUser);
      }, []);
      
    return(
    <div className="admincontainer">
        <SidebarByUser role="etudiant"/>
       <div className="adminwrapper">
        <div className="adwrapper">
            <Header page="Dashboard" userrole="Student" username={user?.nom + " " + user?.prenom}/>
        </div>
        
        </div> 
    </div>
    );
}