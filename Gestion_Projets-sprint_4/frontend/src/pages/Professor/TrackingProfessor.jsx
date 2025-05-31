import './TrackingProfessor.css';
import Header from '../../components/Header';
import { useEffect, useState } from 'react';
import SidebarByUser from '../../components/SidebarByUser';
import ProjectTeam from '../../components/ProjectTeam';
import axios from 'axios';
import { NoProjects } from '../../icons/projectIcons';

export default function Professor() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:3000/myProjects', {
          withCredentials: true, // send the cookie
        });
        setProjects(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error.response?.data || error.message);
        setLoading(false);
      }
    };
    

    if (storedUser?.id) {
      fetchProjects();
    }
  }, []);

  return (
    <div className="admincontainer">
      <SidebarByUser role="enseignant" />
      <div className="adminwrapper">
        <div className="adwrapper">
          <Header
            page="Tracking"
            userrole="Professor"
            username={user?.nom + " " + user?.prenom}
          />
        
           {loading? <div className="loadercontainer">
                  <div className="loader">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>:   <>
                {projects.length===0? <div className="notsupervisingprojects"><NoProjects/></div> : <div className="projectteamwrap">{projects.map((project) => (
              <ProjectTeam key={project.id} project={project} />
            ))}</div>

                }</>}
          </div>
        </div>
      
    </div>
  );
}
