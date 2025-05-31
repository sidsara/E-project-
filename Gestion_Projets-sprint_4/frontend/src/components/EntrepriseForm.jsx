import React, { useState } from "react";
import "./MultiStepForm.css"; 
import axios from "axios";
import { CheckPhoto, EndStepLine } from "../icons/projectIcons";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/deposerSujet',
  withCredentials: true,
});


const EntrepriseForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    field: "",
    docs: null,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "docs") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.docs) {
      alert("Please fill out all required fields.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("titre", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("specialite", formData.field);
    formDataToSend.append("document", formData.docs);

    try {
      const response = await api.post("/deposerSujet", formDataToSend, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Project submitted successfully:", response.data);
      setIsSubmitted(true);
      setIsSubmitted(true);
setTimeout(() => {
  setIsSubmitted(false);
  setFormData({
    title: "",
    description: "",
    field: "",
    docs: null,
  });
}, 3000);
    } catch (error) {
      console.error("Error submitting project:", error);
      alert(`Error: ${error.response?.data?.error || "Failed to submit project"}`);
    }
  };


  return (
    <div className="form-wrapper">
      {!isSubmitted ? (
        <form className="form-content" onSubmit={handleSubmit}>
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

          <label>Field</label>
          <input
            type="text"
            name="field"
            placeholder="Field"
            value={formData.field}
            onChange={handleChange}
            required
          />

          <label>Project Docs</label>
          <div className="custom-file-input" onClick={() => document.getElementById("file-input").click()}>
            <input
              type="text"
              placeholder="Technical sheet"
              readOnly
              value={formData.docs ? formData.docs.name : ""}
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
              name="docs"
              onChange={handleChange}
              style={{ display: "none" }}
            />
          </div>

          <div className="buttons">
            <button type="submit" className="btn-primary">
              Submit
            </button>
          </div>
        </form>
      ) : (
        <div className="form-success">
          <EndStepLine/>
        <CheckPhoto/>
          <h2>Form Submitted Successfully</h2>
        </div>
      )}
    </div>
  );
};

export default EntrepriseForm;