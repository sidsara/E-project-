import React, { useState, useEffect } from "react";
import "./MultiStepForm.css";
import CustomDropdown from "./CustomDropdown";
import axios from "axios";
import { CheckPhoto, EndStepLine } from "../icons/projectIcons";

const levelToNiv = {
  "2CP": 2,
  "1CS": 3,
  "2CS": 4,
  "3CS": 5,
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "",
    speciality: "",
    document: null,
    membersCount: 0,
    teamLeaderEmail: "",
    teamMembers: [],
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("userEmail");
      if (storedEmail) {
        setFormData((prev) => ({ ...prev, teamLeaderEmail: storedEmail }));
      }
    }
  }, []);
  
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "document") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleMemberChange = (index, e) => {
    const { value } = e.target;
    const updatedMembers = [...formData.teamMembers];
    updatedMembers[index] = { ...updatedMembers[index], email: value };
    setFormData({ ...formData, teamMembers: updatedMembers });
  };

  const handleMemberCountChange = (e) => {
    const count = Math.max(0, Math.min(5, Number(e.target.value)));
    const currentMembers = formData.teamMembers;

    if (count > currentMembers.length) {
      const newMembers = Array(count - currentMembers.length).fill({ email: "" });
      setFormData({ ...formData, membersCount: count, teamMembers: [...currentMembers, ...newMembers] });
    } else if (count < currentMembers.length) {
      const emptyMembers = currentMembers.filter((member) => member.email.trim() === "");
      const filledMembers = currentMembers.filter((member) => member.email.trim() !== "");
      const membersToRemove = currentMembers.length - count;

      if (emptyMembers.length >= membersToRemove) {
        const updatedMembers = [
          ...filledMembers,
          ...emptyMembers.slice(0, emptyMembers.length - membersToRemove),
        ];
        setFormData({ ...formData, membersCount: count, teamMembers: updatedMembers });
      } else {
        alert("Cannot decrease count: Some fields being removed are filled.");
      }
    }
  };

  const nextStep = () => {
    const isSpecialityDisabled = formData.level === "2CP" || formData.level === "1CS";
    
    if (
      !formData.title ||
      !formData.description ||
      !formData.level ||
      (!formData.speciality && !isSpecialityDisabled) ||
      !formData.document
    ) {
      alert("Please fill out all required fields.");
      return;
    }
  
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const numericNiveau = levelToNiv[formData.level];
    if (isNaN(numericNiveau)) {
      alert("Invalid study level selected");
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append("titre", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("niveau", numericNiveau.toString());
    formDataToSend.append("specialite", formData.speciality);
    formDataToSend.append("encadrantsEmails", JSON.stringify(formData.teamMembers.map(m => m.email)));
    
    if (formData.document) {
      formDataToSend.append("document", formData.document);
    }
  
    try {
      const response = await api.post("/deposerSujet", formDataToSend, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      });
  
      setStep(3);
      setStep(3);
setTimeout(() => {
  setStep(1);
  setFormData({
    title: "",
    description: "",
    level: "",
    speciality: "",
    document: null,
    membersCount: 0,
    teamLeaderEmail: localStorage.getItem("userEmail") || "",
    teamMembers: [],
  });
}, 3000);
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      alert(`Erreur: ${error.response?.data?.error || "Échec de l'envoi du sujet"}`);
    }
  };

  const isSpecialityDisabled = formData.level === "2CP" || formData.level === "1CS";

  return (
    <div className="form-wrapper">
      

      {step === 1 && (
        <><div className="stepper">
        <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
        <div className={`line ${step >= 2 ? "active" : ""}`} />
        <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
      </div>
      
      <form className="form-content" onSubmit={(e) => e.preventDefault()}>
          <h2>Project Details</h2>
          <p>Enter your Project details</p>

          <label>Project Title</label>
          <input
            type="text"
            name="title"
            placeholder="Project title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <label>Study Level</label>
          <CustomDropdown
            options={[
              { value: "2CP", label: "2CP" },
              { value: "1CS", label: "1CS" },
              { value: "2CS", label: "2CS" },
              { value: "3CS", label: "3CS" },
            ]}
            selectedValue={formData.level}
            onSelect={(value) => {
              console.log("Selected Level:", value, "Mapped Niv:", levelToNiv[value]);
              setFormData((prev) => ({
                ...prev,
                level: value, 
                niv: levelToNiv[value], // aya ida dina niv ndo niv w ida dina level ndo level 
              }));
            }}
            placeholder="Select level"
            required
          />

          <label>Speciality</label>
          <CustomDropdown
            options={[
              { value: "SIW", label: "SIW" },
              { value: "ISI", label: "ISI" },
              { value: "AI", label: "AI" },
            ]}
            selectedValue={formData.speciality}
            onSelect={(value) => setFormData({ ...formData, speciality: value })}
            placeholder="Select a speciality"
            disabled={isSpecialityDisabled}
            required={!isSpecialityDisabled}
          />

          <label>Project Docs</label>
          <div className="custom-file-input" onClick={() => document.getElementById("file-input").click()}>
            <input
              type="text"
              placeholder="Technical sheet"
              readOnly
              value={formData.document ? formData.document.name : ""}
              required
            />
            <span className="attach-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6h-1.5v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6H16.5z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <input
              type="file"
              id="file-input"
              name="document"
              onChange={handleChange}
              style={{ display: "none" }}
              required
            />
          </div>

          <div className="buttons">
            <button type="button" className="btn-primary" onClick={nextStep}>
              Next Step
            </button>
          </div>
        </form></>
      )}

      {step === 2 && (
        <>
        <div className="stepper">
        <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
        <div className={`line ${step >= 2 ? "active" : ""}`} />
        <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
      </div>
        <form className="form-content" onSubmit={handleSubmit}>
          <h2>Team Info</h2>
          <p>Project will be supervised by a team?</p>

          <label>Number of Additional Members (0-5)</label>
          <input
            type="number"
            min={0}
            max={5}
            value={formData.membersCount}
            onChange={handleMemberCountChange}
          />

          <div className="team-leader">
            <label>Team Leader Email</label>
            <input
              type="email"
              value={formData.teamLeaderEmail}
              disabled
              className="member-email-input"
            />
          </div>

          <div className="team-arborescence">
            {formData.membersCount > 0 && <div className="top-circle"></div>}

            {formData.teamMembers.map((member, index) => (
              <div key={index} className="member-node">
                <div className="member-line"></div>
                <div className="member-input">
                  <label>Member {index + 1} infos</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={member.email}
                    onChange={(e) => handleMemberChange(index, e)}
                    required={formData.membersCount > 0}
                    className="member-email-input"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="buttons">
            <button type="button" className="btn-outline" onClick={prevStep}>
              Previous Step
            </button>
            <button type="submit" className="btn-primary">
              Submit
            </button>
          </div>
        </form></>
      )}

      {step === 3 && (
        <div className="form-success">
          <EndStepLine/>
          <CheckPhoto/>

          <h2>Form Submitted Successfully</h2>
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;