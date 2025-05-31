import '../Professor/TeamTracking.css';
import Header from '../../components/Header';
import axios from 'axios';
import User from '../../images/User.png';
import { useEffect,useState } from 'react';
import { AddDocumentIcon, AddFeedbackIcon, CancelAddArrow, GoBackCircle, NoFeedbackYet, NoScheduleYet, NotAvailableYet } from '../../icons/projectIcons';
import { useNavigate } from 'react-router-dom';
import { AddSchedule, AddTaskIcon } from '../../icons/projectIcons';
import SidebarByUser from '../../components/SidebarByUser';
import ProjectTeam from '../../components/ProjectTeam';
import ScheduleCard from '../../components/ScheduleCard';
import TrackBar from '../../components/TrackBar';
import TaskList from '../../components/TaskList';
import { useLocation } from 'react-router-dom';
import Feedback from '../../components/Feedback';
import Document from '../../components/Document';
export default function TeamTracking() {
    const [side, setSide] = useState("Schedules");
    const [scheduleLoading, setScheduleLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [showAddFeedback, setShowAddFeedback] = useState(false);
    const [remarkInput, setRemarkInput] = useState("");
    const token = localStorage.getItem('token');
    const [showAddDoc,setShowAddDoc]=useState(false);
    const [tasks, setTasks] = useState([]);
    const project = JSON.parse(localStorage.getItem("project"));
    const [selectedFile, setSelectedFile] = useState(null);

    const [livrables, setLivrables] = useState([]);
    const [livrablesLoading, setLivrablesLoading] = useState(true);
    const [nom, setNom] = useState("");
    const [newDocument,setNewDocument]=useState(null);
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
      };

     const [user, setUser] = useState(null);
       const navigate=useNavigate();
       function handleTrackSectionClick(newSection) {
        setSide(newSection);
       if(newSection === "Schedules") { navigate(`/Student/Tracking`);}else{ navigate(`/Student/Tracking/${newSection}`);}
      }
      
      
      
      // api to get feedbacks by project id
      const [remarks, setRemarks] = useState([]);
      const [feedbacksLoading, setFeedbacksLoading] = useState(true);


       useEffect(() => {
              const fetchRemarks = async () => {
                if (!project?.id) return;
            
                try {
                  const response = await axios.get(
                    `http://localhost:3000/getAllRemarks/${project.id}`,
                    { withCredentials: true }
                  );
            
                  // Sort remarks by createdAt descending (newest first)
                  const sortedRemarks = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                  setRemarks(sortedRemarks);
                  setFeedbacksLoading(false);
                  console.log("Fetched remarks:", sortedRemarks);
                } catch (err) {
                  console.log(err.response?.data?.message || "Failed to fetch remarks");
                  setFeedbacksLoading(false);
                } finally {
                  setFeedbacksLoading(false);
                }
              };
            
              fetchRemarks();
            }, [project?.id]);

      
      
      

      const handleAddRemark = async () => {
        if (!remarkInput.trim()) return;
      
        try {
          const response = await axios.post(
            `http://localhost:3000/addRemark/${project?.id}`,
            { remark: remarkInput },
            {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
      
          // Add and re-sort remarks
          const updatedRemarks = [...remarks, response.data.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRemarks(updatedRemarks);
          setShowAddFeedback(false);
          setRemarkInput("");
        } catch (error) {
          console.error("Error adding remark:", error);
        }
      };
      // get Documents by project id
      useEffect(() => {
        const fetchDocuments = async () => {
          if (!project?.id) return;
          try {
            const response = await axios.get(
              `http://localhost:3000/getLivrables/${project?.id}`,
              { withCredentials: true }
            );
            setLivrables(response.data);
            console.log("Fetched documents:", response.data);
          } catch (error) {
            console.error("Error fetching livrables:", error);
          } finally {
            setLivrablesLoading(false);
          }
        };
      
        setLivrablesLoading(true);
        fetchDocuments();
      }, [project?.id]);
      
      
      

      
     
    const location = useLocation();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setUser(storedUser);
      
        // Récupération de la section à partir du pathname
        const pathParts = location.pathname.split("/").filter(Boolean);
        const lastSegment = pathParts[pathParts.length - 1];
      
        const validSections = ["Schedules", "Tasks", "Feedbacks", "Documents"];
      
        // Si le segment est une section valide, on la met à jour
        if (validSections.includes(lastSegment)) {
          setSide(capitalizeFirstLetter(lastSegment));
        } else {
          setSide("Schedules"); // par défaut
        }
      }, [location.pathname]);
      
  
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    

    useEffect(() => {
      const fetchTasks = async () => {
        try {
          const project = JSON.parse(localStorage.getItem("project"));
          if (project?.id) {
            const response = await axios.get(
              `http://localhost:3000/getTasks/${project.id}`,
              {
                withCredentials: true,
                headers: {
                  'Authorization': `Bearer ${token}`,
                }
              }
            );
            setTasks(response.data);
          }
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      };
    
      fetchTasks();
    }, [token]);

  
    
    
        
          useEffect(() => {
            const fetchAppointments = async () => {
              try {
                const project = JSON.parse(localStorage.getItem('project'));
          
                if (!project || !project.id) {
                  throw new Error('Project not found in local storage');
                }
          
                const response = await axios.get(
                  `http://localhost:3000/appointments/${project.id}`,
                  {
                    withCredentials: true,
                  }
                );
          
                const newAppointments = response.data.data;
          
                // Compare with old appointments
                if (JSON.stringify(newAppointments) !== JSON.stringify(appointments)) {
                  setAppointments(newAppointments);
                  console.log("Appointments updated");
                  setScheduleLoading(false);
                } else {
                  console.log("No changes in appointments");
                }
              } catch (err) {
                console.error('Failed to fetch appointments:', err);
                setScheduleLoading(false);
              }
            };
          
            fetchAppointments();
          
            const interval = setInterval(fetchAppointments, 10000);
          
            return () => clearInterval(interval);
          }, [appointments]);
          const handleUpload = async () => {
            if (!selectedFile) {
              // Affiche un message d’erreur dans l’interface plutôt que dans une alerte
              console.warn("Aucun fichier sélectionné");
              return;
            }
          
            const formData = new FormData();
            formData.append("fichier", selectedFile);
            formData.append("nom", nom); // si tu veux nommer le fichier manuellement
          
            try {
              const response = await axios.post(
                `http://localhost:3000/deposerLivrable/${project.id}`,
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`, // si nécessaire
                  },
                  withCredentials: true,
                }
              );
          
              const livrable = response.data.data;
          
              console.log("Succès dépôt :", livrable);
          
              // Ajout du document dans l’interface
              setNewDocument(
                <Document
                  key={livrable.id}
                  id={livrable.id}
                  name={livrable.nom}
                  document={livrable.fichier}
                  role="student"
                  status={livrable.status || "PENDING"}
                />
              );
              setShowAddDoc(false);
              setSelectedFile(null);
            } catch (error) {
              console.error("Erreur lors de l'upload :", error);
              // Tu peux ici gérer un message d’erreur UI si tu veux
            }
          };
          
          
    return(
    <div className="admincontainer">
        <SidebarByUser role="etudiant"/>
       <div className="adminwrapper">
        <div className="adwrapper">
            <Header page="Tracking" userrole="Student" username={user?.nom + " " + user?.prenom}/>
         {project?  <div className="trackteamcontent">
            <div className="trackingside">
                <TrackBar setPage={handleTrackSectionClick} page={side}/>
                <div className="trackhead">
                    <p>
                      {side==="Schedules" && "Meeting Timeline"}
                      {side==="Tasks" && "To Do List"}
                      {side==="Feedbacks" && "Review"}
                      {side==="Documents" && "Shared Files"}
                      
                    </p>
                 
                
                {(side==="Documents" && user.chefEquipe) && 
(<>{
  showAddDoc ? 
  <button className='cancel-add-button' onClick={()=> setShowAddDoc(false)}><CancelAddArrow/>Cancel Add</button>
: 
<button className='add-button' onClick={()=> setShowAddDoc(true)}><AddDocumentIcon/> Add Docement</button>

}</>)                 }
                
                </div>
                
                {side==="Schedules" && (
                    
                    <>

                    {scheduleLoading ?  
                      <div className="loadercontainer">
                  <div className="loader">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                       </div>
                    : 
                      <>
                  {appointments.length === 0 ? <div className='no-data-yet'><NoScheduleYet/></div>: <div className='schedules-list'>
                      {appointments.map((appointment, index) => (
                      <ScheduleCard
                        key={index}
                        projectId={project?.id}
                        id={appointment.id}
                        type={appointment.type}
                        title={appointment.titre}
                        date={appointment.date}
                        time={appointment.heure}
                        duration={appointment.duration}
                        locationOrLink={appointment.salle}
                        status={appointment.status}
                        role="student"
                      />
                    ))}
                    </div>}</>
                }
        
                </>

                   


  )
  
}
{side === "Tasks" && (
  <>
    <TaskList 
      tasks={tasks} 
      setTasks={setTasks}
    />
  
      </>
    )}
{side === "Feedbacks" &&
 
  <>
  {feedbacksLoading ? <div className="loadercontainer">
    <div className="loader">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
         </div>
         : remarks.length === 0 ? <> 
        <div className='no-data-yet'><NoFeedbackYet/></div> </>:<div className='feedbacks-list'>
         {showAddFeedback && (
  <div className='add-feedback'>
   <textarea name="feedback" id="feedback" placeholder='Write your feeback here' value={remarkInput} onChange={(e) => setRemarkInput(e.target.value)}></textarea>
   <button className='addfbtn' onClick={handleAddRemark}>Add</button>
  </div>)}
          {remarks.map((feedback, index) => (
            <Feedback
              key={index}
              feedback={feedback.contenu}
              nom={project.Encadrant?.nom}
              prenom={project.Encadrant?.prenom}
              date={feedback.createdAt}
              picture={User}
              role="student" 
            />
          ))} <div style={{marginBottom: '12rem'}}></div>
         </div> }</>


  }
  {side === "Documents" && (<>
    {livrablesLoading ? (
      <div className="loadercontainer">
        <div className="loader">
          <div></div><div></div><div></div><div></div>
        </div>
      </div>
    ) : livrables.length === 0 ? <> 
    {showAddDoc ?  (
 <div className="add-feedback">
 <input
   type="text"
   readOnly
   value={selectedFile ? selectedFile.name : ""}
   placeholder="Select file"
   onClick={() => document.getElementById("hiddenFileInput").click()}
   className="file-display-input"
 />

 <input
   type="file"
   id="hiddenFileInput"
   style={{ display: "none" }}
   onChange={(e) => setSelectedFile(e.target.files[0])}
 />

 <button className="adddbtn" onClick={handleUpload}>
   Add
 </button>
</div>) : 
<div className='no-data-yet'><NoScheduleYet/></div>
} </>: (<div className='documents-list'>
    {showAddDoc && (
  <div className="add-feedback">
    <input
      type="text"
      readOnly
      value={selectedFile ? selectedFile.name : ""}
      placeholder="Select file"
      onClick={() => document.getElementById("hiddenFileInput").click()}
      className="file-display-input"
    />

    <input
      type="file"
      id="hiddenFileInput"
      style={{ display: "none" }}
      onChange={(e) => setSelectedFile(e.target.files[0])}
    />

    <button className="adddbtn" onClick={handleUpload}>
      Add
    </button>
  </div>
)}
       {newDocument}
      {livrables.map((livrable, index) => (
        <Document
          key={index}
          id={livrable.id}
          name={livrable.nom}
          document={livrable.fichier} 
          role="student"
          status={livrable.status || "PENDING"} // Adjust based on DB schema
        />
      ))} <div style={{marginBottom: '12rem'}}></div></div>
    )}
    </>




  )}
            </div> 
            <div className="projectteamside">
                <p>Project Informations</p>
                <ProjectTeam team={true} />
            </div>
            </div>: <div style={{display: 'flex' , alignItems: 'center' , justifyContent : 'center' , width :'100%', height :'78vh'
            }}><NotAvailableYet/></div>}
          
        </div>
        </div> 
    </div>
    );
}