import { useState } from 'react';
import './ProjectItem.css';
import axios from "axios";
import { updateSujet } from '../api/UpdateSujets';
import { sendSujetRequest } from '../api/SendRequestSujet';
import {XIcon,CheckIcon,HatIcon,GoBackIcon,ProjectFileIcon,RefusePhoto,CheckPhoto} from '../icons/projectIcons'

  
 
export default function ProjectItem({sujetId,entreprise,enseignant,encadrants,title,description,document,niveau,feild,role,isZoomed,setIsZoomed,isValidated,chef}){
    
    const [ProjectItemClass,setProjectItemClass]=useState(role==="student"? "wrapitemcontainer":"projectlistitemcontainer");
    const [validated,setValidated]=useState(false);
    const [refused,setRefused]=useState(false);
    const [showDoYouWant,setShowDoYouWant]=useState(false);
    const [showRefuse,setShowRefuse]=useState(false);
    const [showSucces,setShowSuccess]=useState(false);
    const [showValidateSuccess,setShowValidateSuccess]=useState(false);
    const [showRefuseSuccess,setShowRefuseSuccess]=useState(false);
    const [showDeleteSuccess,setShowDeleteSuccess]=useState(false);
    const [deleted,setDeleted]=useState(false);
    const hidecondition=!(isZoomed && (ProjectItemClass ==="projectlistitemcontainer" || ProjectItemClass ==="wrapitemcontainer")) && !deleted;
    const [showDelete,setShowDelete]=useState(false);
    const [showModify,setShowModify]=useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [year, setYear] = useState('All');
    const [modifyTitle, setModifyTitle] = useState("");
    const [modifyDescription, setModifyDescription] = useState("");
    const [modifyField, setModifyField] = useState(feild);
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [uploadedFile, setUploadedFile] = useState(null); 
    const [newSupervisor,setNewSupervisor] = useState(null); 
    const [entrepriseSupervisors, setEntrepriseSupervisors] = useState([]);
    const [showAddSupervisor,setShowAddSupervisor]=useState(false);
    const [requestbtn,setRequestbtn]=useState(<button onClick={(e)=> { e.stopPropagation(); handleSendRequestSujet();}}>
    <svg width="12" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 6H10H1ZM5.5 11V1V11Z" fill="#205375"/>
<path d="M1 6H10M5.5 11V1" stroke="#ff6000" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>Request to choose</button>);


    const [reason, setReason] = useState(""); // ✅ State to store reason
    let supervior;
    if (entreprise!==null){supervior=entreprise?.nom;} else if (enseignant!==null){supervior=enseignant?.nom+" "+enseignant?.prenom;}
    const hideDoYouWant = () => {
      setShowDoYouWant(false);
      setShowRefuse(false);
    };
    const renderEncadrants = (encadrants) => {
      if (!encadrants || !encadrants.Enseignants) return null; // Check if data exists
    
      return encadrants.Enseignants.map((encadrant) => (
        <li key={encadrant.id}>
          {encadrant.nom} {encadrant.prenom}
        </li>
      ));
    };
  

    // ❌ Handle Refuse Project
const handleRefuse = async () => {
   
  if (!reason.trim()) {
        setError("Please provide a reason for refusal.");
        return;
      }
    
      try {
        setLoading(true);
        setError(null);
    
        const response = await axios.patch(
          `http://localhost:3000/${sujetId}/reject`, // ✅ Correct endpoint
          { reason }, // ✅ Send reason in request body
          { withCredentials: true }
        );
    
        console.log("Refuse Response:", response.data);
    
        setRefused(true);
        setShowRefuse(false);
        setShowRefuseSuccess(true);
        setShowSuccess(true);
    
        setTimeout(() => {
          setShowRefuseSuccess(false);
          setShowSuccess(false);
        }, 3000);
      } catch (err) {
        setError("Failed to refuse project");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
  

  // ✅ Handle Validate Project
  const handleValidate = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const response = await axios.patch( // ✅ Change PUT → PATCH
        `http://localhost:3000/${sujetId}/validate`, // ✅ Correct URL structure
        { approved: true },
        { withCredentials: true }
      );
  
      console.log("Validate Response:", response.data);
  
      setValidated(true);
      setShowDoYouWant(false);
      setShowValidateSuccess(true);
      setShowSuccess(true);
      setTimeout(() => {
        setShowValidateSuccess(false);
        setShowSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError("Failed to validate project");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  // handle delete 
  const deleteSujet = async (sujetId) => {
    try {
      const response = await axios.delete(`http://localhost:3000/delete-sujet/${sujetId}`, {
        withCredentials: true, // ⬅️ ajoute ça
      });
  
      handleDelete(); // chwiya zwa9.
      console.log(response.data.message); // "Good job Sara 😍" khalithalak hbb
    } catch (error) {
      console.error("Erreur lors de la suppression du sujet :", error.response?.data || error.message);
    }
  };
  // handle update 
  const handleUpdateSujet = async () => {
    const modifyNiveau = { "1st": 1, "2nd": 2, "3rd": 3, "4th": 4, "5th": 5 }[year];
    console.log(uploadedFile);
   {year==="All" && setYear(annee)}
  
    const updatedData = {};
  
    if (modifyTitle?.trim()) updatedData.titre = modifyTitle.trim();
    if (modifyDescription?.trim()) updatedData.description = modifyDescription.trim();
    if (modifyNiveau) updatedData.niveau = modifyNiveau.toString();
    if (modifyField?.trim()) updatedData.specialite = modifyField.trim();
    if (uploadedFile) updatedData.document = uploadedFile;
    // if (encadrantsEmails?.length > 0) updatedData.encadrantsEmails = encadrantsEmails;
    console.log("Updated Data:", updatedData);
    if (Object.keys(updatedData).length === 0) {
      console.log("Aucune donnée modifiée.");
      return;
    }
  
    try {
      const result = await updateSujet(sujetId, updatedData);
      console.log("Success:", result);
      setShowModify(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };
  
  
  
  
  
  
  
  

      let annee;
     switch(niveau){
      case 1:
        annee="1st";
        break;
        case 2:
        annee="2nd";
        break;
        case 3:
        annee="3rd";
        break;
        case 4:
        annee="4th";
        break;
        case 5:
        annee="5th";
        break;
        default:
          annee="3rd";
     }
    
     function handleDelete(){
         if (!isZoomed){setDeleted(true);} else {
            setTimeout(() => {
                setIsZoomed(false);
                 }, 3000); // Change time here if needed
         }
           setShowDelete(false);
           setShowSuccess(true);
           setShowDeleteSuccess(true);
           setTimeout(() => {
            setDeleted(true);
             }, 3000); // Change time here if needed
     }
   
    let buttonscontent;
    function showValidatePopUp(){
        setShowDoYouWant(true);
    }
    function showRefusePopUp(){
        setShowRefuse(true);
    }
    function showDeletePopUp(){
        setShowDelete(true);
    }
    function hideDelete(){
        setShowDelete(false);
    }
    function showmodifyPopUp(){
        setShowModify(true);
        setYear(annee);
    }
    function hideModify(){
        setShowModify(false);
        setModifyDescription("");
        setModifyTitle("");
        setModifyField("All");
        setUploadedFileName("");
    }
    if (role==='professor' || role==='company'){
      if (isValidated==="accepted" || validated) {
        buttonscontent=( <div className="validated">
            <button><CheckIcon/>Validated</button>
        </div>);
    } else if (isValidated==="rejected" || refused){
       buttonscontent=( <div className="refused">
        <button><XIcon/>Refused</button>
    </div>);
    } else {
      buttonscontent=(
        <>
            <div id='btn1' className="button">
                <button className="modify" onClick={(e) => { e.stopPropagation(); showmodifyPopUp(); }}>Modify</button>
            </div>
            <div className="button">
                <button className="delete" onClick={(e) => { e.stopPropagation(); showDeletePopUp(); }}>Delete</button>
            </div>
        </>  
    );
    } 
       
    } else if (role==='admin') {
        if (((isValidated==="accepted" || validated) && enseignant!==null) || ((isValidated==="accepted" || validated) && encadrants!==null && enseignant===null)) {
            buttonscontent=( <div className="validated">
                <button><CheckIcon/>Validated</button>
            </div>);
        } else if ((isValidated==="accepted" || validated) && enseignant===null ) {
          buttonscontent=( 
            <><svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="25" r="25" fill="#FF6600"/>
            <path d="M18 25L22 31L32 16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div className="addsupervisor">
            <button onClick={(e)=> {e.stopPropagation(); setShowAddSupervisor(true);} }>Add Supervisor</button>
        </div>
            </>);
          
        } else if (isValidated==="rejected" || refused){
           buttonscontent=( <div className="refused">
            <button><XIcon/>Refused</button>
        </div>);
        } else {
            buttonscontent = (
                <>
                    <div id='btn1' className="button">
                        <button className="modify" onClick={(e) => { e.stopPropagation(); showRefusePopUp(); }}>Refuse</button>
                    </div>
                    <div className="button">
                        <button className="delete" onClick={(e) => { e.stopPropagation(); showValidatePopUp(); }}>Validate</button>
                    </div>
                </>
            );
        }
    }  
    function handleProjectItemCLick(){
       if (!isZoomed){ 
            setProjectItemClass("bigprojectlistitemcontainer");
        setIsZoomed(!isZoomed);
        }
    }
    function handleGoBackCLick(){
        if (isZoomed){ 
            if (role==='student'){ setProjectItemClass("wrapitemcontainer");}else{ setProjectItemClass("projectlistitemcontainer");}
            setIsZoomed(!isZoomed);
         }
     }
    
    
    function triggerFileInput() {
        // Trigger the hidden file input when the paperclip icon is clicked
        document.getElementById('file-upload').click();
    }

    const handleYearChange = (event) => {
      setYear(event.target.value);
    };
    const handleAddSupervisor = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");
    
      try {
        const response = await updateSujet(sujetId, {
          encadrantsEmails: [newSupervisor],
        });
    
        const added = response.sujet.equipeEncadrants?.Enseignants.find(
          (e) => e.email.toLowerCase() === newSupervisor.toLowerCase()
        );
    
        if (added) {
          setEntrepriseSupervisors((prev) => {
            // Avoid duplicates
            const exists = prev.some(
              (sup) => sup.email.toLowerCase() === added.email.toLowerCase()
            );
            if (exists) return prev;
            return [...prev, { nom: added.nom, prenom: added.prenom, email: added.email }];
          });
        }
    
        setShowAddSupervisor(false);
        setNewSupervisor("");
      } catch (err) {
        const message = err?.error || "Échec de l'ajout de l'encadrant";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    
    const handleSendRequestSujet = async () => {
      try {
        const result = await sendSujetRequest(sujetId);
        setRequestbtn(<button>Request sent</button>);
      }  catch (err) {
        console.error("Full error:", err);
        console.error("Response data:", err?.response?.data);
        alert(err?.response?.data?.error || err.message || "Erreur inconnue");
      }
      
    };
    
    return( 
        hidecondition && (
            <>
            {/* add supervisor Modal */}
            {showAddSupervisor && (
              <div className="doyouwant">
                <div className="filterbox">
                <label>Enter supervior email :</label>
            <input 
              type="text" 
              placeholder="Enter email" 
              value={newSupervisor} 
              onChange={(e) => setNewSupervisor(e.target.value)} 
            />
                  {error && <p style={{ color: "red" }}>{error}</p>}
                  <div className="yesno">
                    <button className="cancel" onClick={() => setShowAddSupervisor(false)} disabled={loading}>
                      Cancel
                    </button>
                    <button className="yes" onClick={handleAddSupervisor} disabled={loading}>
                      {loading ? "Processing..." : "Yes"}
                    </button>
                  </div>
                </div>
              </div>
            )}

          {/* Refuse Project Modal */}
          {showRefuse && (
  <div className="doyouwant">
    <div className="doyouwantwrapper">
      <p>Do you want to refuse this project?</p>
      <textarea
        name="reason"
        id="reason"
        placeholder="If yes, please provide a reason..."
        value={reason} // ✅ Bind to state
        onChange={(e) => setReason(e.target.value)} // ✅ Update state on input
      ></textarea>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="yesno">
        <button className="cancel" onClick={() => setShowRefuse(false)} disabled={loading}>
          Cancel
        </button>
        <button className="yes" onClick={handleRefuse} disabled={loading}>
          {loading ? "Processing..." : "Yes"}
        </button>
      </div>
    </div>
  </div>
)}


      {/* Validate Project Modal */}
      {showDoYouWant && (
        <div className="doyouwant">
          <div className="doyouwantwrapper">
            <p>Do you want to validate this project?</p>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div className="yesno">
              <button className="cancel" onClick={() => setShowDoYouWant(false)} disabled={loading}>
                Cancel
              </button>
              <button className="yes" onClick={handleValidate} disabled={loading}>
                {loading ? "Processing..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success & Error Messages */}
     
      
            {showDelete && <div className="doyouwant">
            <div className="doyouwantwrapper">
                <p>Do you want to delete this project?</p>
                <div className="yesno">
                    <button className="cancel" onClick={hideDelete}>Cancel</button>
                    <button className="yes" onClick={() => deleteSujet(sujetId)}>Yes</button>
                </div>
            </div>
            </div>}
            {showModify && (
  <div className="doyouwant">
    <div className="filterbox">
      <label>Title:</label>
      <input
        placeholder='Enter New title'
        type="text"
        value={modifyTitle}
        onChange={(e) => setModifyTitle(e.target.value)}
      />

      <label>Description:</label>
      <textarea
      placeholder='Enter New description'
        name="description"
        id="description"
        value={modifyDescription}
        onChange={(e) => setModifyDescription(e.target.value)}
      ></textarea>

      <label>Year:</label>
      <select name="Year" id="Year" value={year} onChange={handleYearChange}>
        <option value={annee}>{annee}</option>
        {annee!=="2nd" && <option value="2nd">2nd</option>}
        {annee!=="3rd" && <option value="3rd">3rd</option>}
        {annee!=="4th" && <option value="4th">4th</option>}
        {annee!=="5th" && <option value="5th">5th</option>}
      </select>

      {(year === '4th' || year === '5th') && (
        <>
          <label>Field:</label>
          <select
            name="Field"
            id="Field"
            value={modifyField}
            onChange={(e) => setModifyField(e.target.value)}
          > {(feild!==null || feild!=="") && <option value={feild}>{feild}</option>}
            {(feild!=="AI" && feild!=="ai") && <option value="AI">AI</option>}
            {(feild!=="ISI" && feild!=="isi") && <option value="ISI">ISI</option>}
            {(feild!=="SIW" && feild!=="siw") && <option value="SIW">SIW</option>}
          </select>
        </>
      )}

<label>Project file:</label>
<div className="file-upload-container">
  <label htmlFor="file-upload" className="custom-file-label">
    {uploadedFileName === "" ? (
      <>
        <span>New File</span>
        <i className="fas fa-file-alt"></i>
      </>
    ) : (
      <div className="filename">{uploadedFileName}</div>
    )}
  </label>
  <input
  type="file"
  id="file-upload"
  style={{ display: "none" }}
  onChange={(e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFileName(file.name); // show name in UI
      setUploadedFile(file); // store the actual file
    } else {
      setUploadedFileName("");
      setUploadedFile(null);
    }
  }}
/>

</div>


      <div className="yesno">
        <button className="cancel" onClick={hideModify}>
          Cancel
        </button>
        <button className="yes" onClick={handleUpdateSujet}>

          Modify
        </button>
      </div>
    </div>
  </div>
)}

            <div className={ProjectItemClass} onClick={handleProjectItemCLick}>
                <div className="projectlistitem">
                   {(showSucces && ProjectItemClass==="bigprojectlistitemcontainer") ? 
                   <>
                  {showValidateSuccess &&  <div className="validatesuccess">
                   <CheckPhoto/>
                   <h1>This Ptoject Has Been Validated</h1>
                   </div>}
                   {showRefuseSuccess &&  <div className="validatesuccess">
                   <RefusePhoto/>
                   <h1>This Ptoject Has Been Refused</h1>
                   </div>}
                   {showDeleteSuccess && <div className="validatesuccess">
                   <RefusePhoto/>
                   <h1>This Ptoject Has Been Deleted</h1>
                   </div>
                   }
                   </>
                   : 
                   <>
              <div className="title">
                 {isZoomed? <h2>{title}</h2>: <h2>{title.length > 30 ? title.slice(0, 30) + "..." : title}</h2>}
                  <GoBackIcon handleGoBackCLick={handleGoBackCLick} />
              </div>
              <div className="projectdescription">
                  <span>Description:</span>
                  {isZoomed ? <p>{description}</p>:<p>{description.length > 130 ? description.slice(0, 130) + "..." : description}</p>}
              </div>
             {(enseignant!==null || encadrants!==null) &&  <div className="projectsupervisors">
                  <span>Supervior(s):</span>
                  <ul>
                    {enseignant!==null && <li>{enseignant.nom+" "+enseignant.prenom}</li>}
                  {renderEncadrants(encadrants)}   
                  


                  </ul>
              </div>}
              {(niveau===4 || niveau===5) && <div className="feild">
                <span>feild</span>
                <ul>
                  <li>{feild}</li>
                </ul>
              </div>}
              <div className="projectfile">
              <button onClick={(e) => {
                e.stopPropagation();
                const fullUrl = `http://localhost:3000/${document}`;
                window.open(fullUrl, '_blank', 'noopener,noreferrer');
              }}>
                <ProjectFileIcon /><b>Project File</b>
                  </button>
              </div>
             
             
              {role!=='student' && <div className="buttonss">
                 {buttonscontent}
              </div>}
             
              
              {(chef && niveau!==3 ) &&  (<div className="choose-project">
             

             {requestbtn}
           </div>)}
              {(!chef || niveau===3 || ProjectItemClass==="bigprojectlistitemcontainer")  && (<div className="bywho">
                  <p><b>By:{supervior}</b></p>
              </div>)}
              <div className="year">
                  <p>{annee}<br/>Year</p>
                  <HatIcon/>
              </div>
              </>
                   }
                </div>
            </div>
            </>
        )
    );
}