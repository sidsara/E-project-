import './TeamTracking.css';
import Header from '../../components/Header';
import axios from 'axios';
import User from '../../images/User.png';
import { useEffect,useState } from 'react';
import { AddFeedbackIcon, CancelAddArrow, GoBackCircle, NoFeedbackYet, NoScheduleYet } from '../../icons/projectIcons';
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
    const [showAddSchedule, setShowAddSchedule] = useState(false);
    const [scheduleLoading, setScheduleLoading] = useState(true);
    const [meetingType, setMeetingType] = useState("ONLINE");
    const [meetingTitle, setMeetingTitle] = useState("");
    const [meetingDate, setMeetingDate] = useState("");
    const [meetingTime, setMeetingTime] = useState("");
    const [meetingDuration, setMeetingDuration] = useState("");
    const [meetingLocation, setMeetingLocation] = useState(null);
    const [meetingLink, setMeetingLink] = useState(null);
      const project = JSON.parse(localStorage.getItem("project"));

     const page = (
     
     <>
    <GoBackCircle onClick={goback} /> Tracking Team {project?.equipeId}
  </>
);
    const [appointments, setAppointments] = useState([]);
    const [scheduleError, setScheduleError] = useState(null);
    const [showAddFeedback, setShowAddFeedback] = useState(false);
    const [remarkInput, setRemarkInput] = useState("");
    const [showAddTask, setShowAddTask] = useState(false);
    const [taskDescription, setTaskDescription] = useState("");
    const [taskDeadline, setTaskDeadline] = useState("");
    const token = localStorage.getItem('token');
    const [tasks, setTasks] = useState([]);
    const [livrables, setLivrables] = useState([]);
    const [livrablesLoading, setLivrablesLoading] = useState(true);


     const [user, setUser] = useState(null);
       const navigate=useNavigate();
       function handleTrackSectionClick(newSection) {
        setSide(newSection);
       if(newSection === "Schedules") { navigate(`/Professor/Tracking/10`);}else{ navigate(`/Professor/Tracking/10/${newSection}`);}
      }
      // api to create a new schedule
      const CreateSchedule = async (appointmentData, projectId) => {
        try {
          const response = await axios.post(
            `http://localhost:3000/createAppointment/${projectId}`,
            {
              ...appointmentData,
              date: appointmentData.date.split('T')[0], // Send date only
            },
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );
          return response.data.data;
        } catch (error) {
          console.error("Error details:", error.response?.data || error.message);
          throw error;
        }
      };

      
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
            `http://localhost:3000/addRemark/${project.id}`,
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
              `http://localhost:3000/getLivrables/${project.id}`,
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
      
      
      

      
  function goback() {
    navigate("/Professor/Tracking");}    
    const location = useLocation();

    useEffect(() => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
  
      // Extract the section from the pathname
      const pathParts = location.pathname.split("/").filter(Boolean);
      const lastSegment = pathParts[pathParts.length - 1];
  
      const validSections = ["Schedules", "Tasks", "Feedbacks", "Documents"];
      if (validSections.includes(lastSegment)) {
        setSide(capitalizeFirstLetter(lastSegment));
      } else {
        setSide("Schedules"); // default
      }
    }, [location.pathname]);
  
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    const handleAddSchedule = async () => {
      const project = JSON.parse(localStorage.getItem("project"));
      
      // Format time to HH:MM if needed
      const formattedTime = meetingTime.includes(':') ? meetingTime : `${meetingTime}:00`;
    
      const newAppointment = {
        titre: meetingTitle,
        date: meetingDate, // YYYY-MM-DD format
        heure: formattedTime, // HH:MM format
        salle: meetingType === "ONLINE" ? meetingLink : meetingLocation,
        duration: meetingDuration + " min", 
        status: "UPCOMING",
        type: meetingType,
      };
    
      try {
        const created = await CreateSchedule(newAppointment, project.id);
        setAppointments(prev => [...prev, created]);
        resetForm();
      } catch (error) {
        setScheduleError(error.response?.data?.message || error.message);
      }
    };
    const handleAddTask = async () => {
      try {
        const project = JSON.parse(localStorage.getItem("project"));
        
        if (!taskDescription.trim()) {
          alert("Please enter a task description");
          return;
        }
    
        if (!taskDeadline) {
          alert("Please select a deadline");
          return;
        }
    
        const taskData = {
          description: taskDescription,
          deadline: new Date(taskDeadline).toISOString(),
          status: "TODO"
        };
    
        const response = await axios.post(
          `http://localhost:3000/createTask/${project.id}`,
          taskData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
    
        // Add the new task to the state
        setTasks(prevTasks => [...prevTasks, response.data]);
        
        // Reset form
        setTaskDescription("");
        setTaskDeadline("");
        setShowAddTask(false);
        
      } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        alert(`Error: ${error.response?.data?.message || "Failed to add task"}`);
      }
    };

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

    const resetForm = () => {
      setShowAddSchedule(false);
      setMeetingTitle("");
      setMeetingDate("");
      setMeetingTime("");
      setMeetingDuration("");
      setMeetingLink("");
      setMeetingLocation("");
      setMeetingType("ONLINE");
      setScheduleError(null);
    };
    
    
        
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
          
    return(
    <div className="admincontainer">
        <SidebarByUser role="enseignant"/>
       <div className="adminwrapper">
        <div className="adwrapper">
            <Header page={page} userrole="Professor" username={user?.nom + " " + user?.prenom}/>
            <div className="trackteamcontent">
            <div className="trackingside">
                <TrackBar setPage={handleTrackSectionClick} page={side}/>
                <div className="trackhead">
                    <p>
                      {side==="Schedules" && "Meeting Timeline"}
                      {side==="Tasks" && "To Do List"}
                      {side==="Feedbacks" && "Review"}
                      {side==="Documents" && "Shared Files"}
                      
                    </p>
                     {side==="Schedules" && 
                    <button className='add-button' onClick={()=> setShowAddSchedule(true)}><AddSchedule/> Add Schedule</button>
                }
                
                 { side==="Feedbacks" && 
(<>{
  showAddFeedback ? 
  <button className='cancel-add-button' onClick={()=> setShowAddFeedback(false)}><CancelAddArrow/>Cancel Add</button>
: 
<button className='add-button' onClick={()=> setShowAddFeedback(true)}><AddFeedbackIcon/> Add Feedback</button>

}</>)                 }
                 {side === "Tasks" && 
                  <button className='add-button' onClick={() => setShowAddTask(true)}>
                    <AddTaskIcon/> Add New Task
                  </button>
                }
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
                        projectId={project.id}
                        id={appointment.id}
                        type={appointment.type}
                        title={appointment.titre}
                        date={appointment.date}
                        time={appointment.heure}
                        duration={appointment.duration}
                        locationOrLink={appointment.salle}
                        status={appointment.status}
                        role="professor"
                      />
                    ))}
                    </div>}</>
                }
                {showAddSchedule && (
                  <div className="doyouwant" onClick={() => setShowAddSchedule(false)}>
                    <div className="add-schedule" onClick={(e) => e.stopPropagation()}>
                      <label>Meeting Type:</label>
                      <select value={meetingType} onChange={(e) => setMeetingType(e.target.value)}>
                        <option value="ONLINE">Online</option>
                        <option value="ONSITE">Onsite</option>
                      </select>
                      <label>Title:</label>

                      <input 
                    type="text" 
                    placeholder="Enter Title"
                    value={meetingTitle} 
                    onChange={(e) => setMeetingTitle(e.target.value)} 
                    />
                    <label>Date:</label>
                      <input 
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        required
                      />
                      <div className="time">
                        <div className="hour">
                        <label>time:</label>
                        <input 
                          type="time"
                          value={meetingTime}
                          onChange={(e) => setMeetingTime(e.target.value)}
                          placeholder="Enter Time" 
                        />
                      </div>
                        <div className="duration">
                        <label>Duration (min):</label>
                        <input
                          type="number"
                          value={meetingDuration}
                          onChange={(e) => setMeetingDuration(e.target.value)}
                          min="15"
                          required
                        />
                          </div>

                          </div>

           

                            {(meetingType === "ONLINE") && (
                              <>
                                <label>Link:</label>
                                <input
                        type="url"
                        value={meetingLink}
                        placeholder="Enter Meeting Link"
                        onChange={(e) => setMeetingLink(e.target.value)}
                        required
                      />
                              </>
                            )}
                            {(meetingType === "ONSITE") && (
                              <>
                        <label>Location:</label>
                        <input
                      type="text"
                      placeholder="Enter Location"
                      value={meetingLocation}
                      onChange={(e) => setMeetingLocation(e.target.value)}
                    />
                      </>
                    )}
            <div style={{color:'red', textAlign:'center', fontSize: '14px', margin: '5px 0'}}>{scheduleError}</div>

            <div className="yesno">
              <button className="cancel" onClick={() => setShowAddSchedule(false)}>Cancel</button>
              <button className="yes" onClick={handleAddSchedule}>Add</button>
            </div>
          </div>
        </div>
      )}
                </>

                   


  )
  
}
{side === "Tasks" && (
  <>
    <TaskList 
      tasks={tasks} 
      setTasks={setTasks}
    />
    {showAddTask && (
      <div className="doyouwant" onClick={() => setShowAddTask(false)}>            <div className="add-schedule" onClick={(e) => e.stopPropagation()}>
              <label>Task Description:</label>
              <input
                type="text"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Enter Task"
              />
              <label>Deadline:</label>
              <input
                type="date"
                value={taskDeadline}
                onChange={(e) => setTaskDeadline(e.target.value)}
              />
              <div className="yesno">
                <button className="cancel" onClick={() => setShowAddTask(false)}>Cancel</button>
                <button className="yes" onClick={handleAddTask}>Add Task</button>
              </div>
            </div>
          </div>
        )}
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
         {showAddFeedback ?  (
  <div className='add-feedback'>
   <textarea name="feedback" id="feedback" placeholder='Write your feeback here' value={remarkInput} onChange={(e) => setRemarkInput(e.target.value)}></textarea>
   <button className='addfbtn' onClick={handleAddRemark}>Add</button>
  </div>) : 
   <div className='no-data-yet'><NoFeedbackYet/></div>
   } </>:<div className='feedbacks-list'>
         {showAddFeedback && (
  <div className='add-feedback'>
   <textarea name="feedback" id="feedback" placeholder='Write your feeback here' value={remarkInput} onChange={(e) => setRemarkInput(e.target.value)}></textarea>
   <button className='addfbtn' onClick={handleAddRemark}>Add</button>
  </div>)}
          {remarks.map((feedback, index) => (
            <Feedback
              key={index}
              feedback={feedback.contenu}
              nom={user.nom}
              prenom={user.prenom}
              date={feedback.createdAt}
              picture={User}
              role="professor" 
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
    ) : livrables.length === 0 ? (
      <div className='no-data-yet'><NoScheduleYet /></div>
    ) : (<div className='documents-list'>
      {livrables.map((livrable, index) => (
        <Document
          key={index}
          id={livrable.id}
          name={livrable.nom}
          document={livrable.fichier} 
          status={livrable.status || "PENDING"} 
          role="professor"
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
            </div>
          
        </div>
        </div> 
    </div>
    );
}