import Header from '../../components/Header';
import SidebarByUser from '../../components/SidebarByUser';
import { useEffect,useState } from 'react';

export default function Company() {
     const [user, setUser] = useState(null);
             
      useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setUser(storedUser);
      }, []);
    return(
    <div className="admincontainer">
        <SidebarByUser role="entreprise"/>
       <div className="adminwrapper">
        <div className="adwrapper">
            <Header page="Dashboard" userrole="Company" username={user?.nom }/>
        </div>
        </div> 
    </div>
    );
}