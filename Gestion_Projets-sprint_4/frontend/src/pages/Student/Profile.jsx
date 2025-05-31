import './Profile.css';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { InCompleteStatus, RoleIcon, ChangePFP, ArrowCircleIcon, BlueX, CompleteStatus, OrangeReturnIcon } from '../../icons/projectIcons';
import User from '../../images/User.png'
import SidebarByUser from '../../components/SidebarByUser';
import { Link } from 'react-router-dom';

function Skill({ skill, edit, no, setSkills,background, text }) {
  const [showSkill, setShowSkill] = useState(true);

  const deleteSkill = (name) => {
    // Filter out the skill with the given name
    setSkills((prevSkills) => prevSkills.filter(skill => skill !== name));
  };

  function handleDeleteSkill() {
    setShowSkill(false);
    deleteSkill(skill);
  }

  const className = no ? "no-skill-badge" : "skill-badge";
  return (
    <>
      {showSkill &&
        <span className={className} style={{ backgroundColor: background, color: text }}>{skill}{edit && <div onClick={handleDeleteSkill} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><BlueX /></div>}</span>
      }
    </>
  );
}
const getYear = (niveau) => {
  const years = ["1st", "2nd", "3rd", "4th", "5th"];
  return years[niveau - 1] || "";
};

export default function Profile({ role }) {
  const [user, setUser] = useState(null);
  const [projet,setProjet]=useState(null);
 const [equipe, setEquipe] = useState(() => {
  try {
    const storedEquipe = localStorage.getItem("equipe");
    console.log("Raw storedEquipe:", storedEquipe);
    const parsedEquipe = storedEquipe ? JSON.parse(storedEquipe) : null;
    console.log("Parsed equipe:", parsedEquipe);
    return parsedEquipe;
  } catch (error) {
    console.error("Error parsing equipe from localStorage:", error);
    return null;
  }
});

  
  
  const [year, setYear] = useState("");
  const [skill, setSkill] = useState("");
  const [skills, setSkills] = useState([]);
  const [picture, setPicture] = useState(User);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const fileInputRef = useRef(null);
  const getRandomSkillColor  = (index) => {
    const colors = [
      { background: "#BBF7D0", text: "#166534" },
      { background: "#BFDBFE", text: "#1E40AF" },
      { background: "#FECACA", text: "#B91C1C" },
      { background: "#FED7AA", text: "#9A3412" },
      { background: "#FEF08A", text: "#854D0E" },
    ];
    return colors[index % colors.length]; 
  };
  
  function handleEditClick() {
    setShowEditProfile(true);
  }

  function handleReturnClick() {
    setShowEditProfile(false);
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (skill !== "") {
      setSkills([...skills, skill]);
    }
    setSkill("");
  };

  function resetSkills() {
    // Reset skills to the original state fetched from the user object
    setSkills(user?.skills || []); // Always reset to the original skills from the user object
    setSkill(""); // Reset the input field for adding a new skill
  }



  const handleChangeClick = () => {
    fileInputRef.current.click(); // simulate click on file input
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPicture(imageUrl);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (equipe?.projet){
      setProjet(equipe.projet);
      console.log("Stored equipe.projet:", equipe.projet);
    }
    if (storedUser) {
      console.log("User object:", storedUser);
      console.log("Equipe object:", storedUser.equipe);
      console.log("Stored equipe:", equipe);
      setUser(storedUser);
      setSkills(storedUser.skills || []);
      setYear(getYear(storedUser.niveau));
      const baseUrl = "http://localhost:3000";
      setPicture(storedUser.profileImageUrl ? baseUrl + storedUser.profileImageUrl : User);
    }
  }, []);

  const handleSaveProfile = async () => {
    const formData = new FormData();
    formData.append("skills", JSON.stringify(skills));

    if (fileInputRef.current?.files[0]) {
      formData.append("profileImage", fileInputRef.current.files[0]);
    }

    try {
      const response = await axios.put(
        "http://localhost:3000/updateProfile", // <-- update to your actual backend URL
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // if needed
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        const baseUrl = "http://localhost:3000";
        setPicture(updatedUser.profileImageUrl ? baseUrl + updatedUser.profileImageUrl : User);
        setShowEditProfile(false);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="admincontainer">
      <SidebarByUser role="etudiant" />
      <div className="adminwrapper">
        <div className="profilewrapper">
          <div className="profile-banner" />
          <img
            className="profile-photo"
            src={picture}
            alt="User"
          />
          {showEditProfile &&
            <div className="changepfp" onClick={handleChangeClick}><ChangePFP /></div>
          }
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <div className="profile-section">
            <div className="profile-left">
              <h2 className="profile-name"><b>{user?.nom} {user?.prenom}</b></h2>
              <p className="profile-status">{year} Year Student</p>
              {(year === "4th" || year === "5th") &&
                <p className="profile-feild">speciality: {user?.specialite?.toUpperCase()}</p>
              }
              {!showEditProfile && <><div className="skills-label">Skills ✩</div>
                <div className="skills-list" id='list1'>
                  {user?.skills?.length === 0 ? (
                    <Skill skill="No skills added yet" no={true} />
                  ) : (
                    <>
                      {user?.skills?.map((skill, index) => {
                         const { background, text } = getRandomSkillColor(index);
                          return (
                        
                        <Skill skill={skill} no={false} key={skill} background={background} text={text}/>
                      )})}
                    </>
                  )}
                </div></>}
            </div>
            {!showEditProfile ?
              <div className="profile-right">
                <button className="edit-btn" onClick={handleEditClick}>Edit Profile</button>
                <div className="current-role">
                  <p>Current Role<RoleIcon /></p>
                  <span>
                    {user?.chefEquipe
                      ? "Team Leader"
                      : user?.equipeId !== null
                        ? "Team Member"
                        : "No Role"}
                  </span>
                </div>
              </div> :
              <div className="profile-right" >
                <OrangeReturnIcon className="return" onClick={handleReturnClick} />
              </div>
            }
          </div>
          {!showEditProfile && <div className="info-cards">
            <div className="info-card">
              <div className="card-title">
                My Team : {!user
                  ? "Loading..."
                  : equipe?.id !== null && equipe?.id !== undefined
                    ? equipe?.id
                    : "Not in a team, please join one!"}
                {equipe?.id ? (
                  equipe.status === "INCOMPLET" ? <InCompleteStatus /> : <CompleteStatus />
                ) : null}
              </div>
              {equipe?.id ?
                <>
                  <p>Manage your team and track the project status</p>
                  <span className="arrow"><ArrowCircleIcon /></span>
                </>
                :
                <div className='join-butn'><Link to="./../Teams"><button>Join a Team</button></Link></div>
              }
            </div>
            <div className="info-card">
              <div className="card-title">
                My Project :
                {projet ? (
                  <span>{projet.Sujet?.titre}</span>
                ) : (
                  <span style={{ color: "grey" }}>Not Assigned Yet</span>
                )}
              </div>
              {projet ? (
                <>
                  <p>Manage your project and track the project status</p>
                  <span className="arrow"><ArrowCircleIcon /></span>
                </>
              ) : (
                <p>No topic has been assigned to your team yet</p>
              )}
            </div>
          </div>}
          {showEditProfile && <div className="editform">
            <div className="editprofile">
              <label>Skills:</label>
              <div className="addskill">
                <input type="text" placeholder='Add skill' value={skill} onChange={(e) => setSkill(e.target.value)} onKeyDown={handleKeyDown} />
                <button onClick={handleSubmit}>Add</button>
             </div>
              <div className='skills-list'>
                {(skills.length > 0) && skills.map((skill,index) =>{ 
                         const { background, text } = getRandomSkillColor(index);
                  return(
                  <Skill skill={skill} edit="true" setSkills={setSkills} key={skill} background={background} text={text}/>
                )})}
              </div>
              <div className="bn">
                <button className='cancel' onClick={resetSkills}>Cancel</button>
                <button className='save' onClick={handleSaveProfile}>Save</button>
              </div>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}