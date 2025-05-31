import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import './Pagelogin.css';
import Logo from '../components/Logo';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

export default function Pagelogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await api.post("/login", {
        email,
        password,
      });
      
      const { token, user } = response.data;

      // Set HTTP-only cookie for session management
      document.cookie = `jwt=${token}; path=/; secure; SameSite=Strict`;

      // Store token and user data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userEmail", user.email);
      
     // Store team information if user is a student
if (user.role === "etudiant") {
  localStorage.setItem("equipe", JSON.stringify(user.equipe || {}));
  localStorage.setItem("equipeId", user.equipeId || '');
  localStorage.setItem("chefEquipe", user.chefEquipe ? 'true' : 'false');
  localStorage.setItem("teamStatus", user.equipe?.status || 'Incomplete');
  
  // Store team skills if available
  if (user.equipe?.skillsRequired) {
    localStorage.setItem("teamSkills", JSON.stringify(user.equipe.skillsRequired));
  }

   // Fetch project and team from backend and store in localStorage (non-blocking)
  api.get("/projectStudent", { withCredentials: true })
    .then(res => {
      const project = res.data.data.projet;
      const team = res.data.data.equipe;
      if (project) {
        localStorage.setItem("project", JSON.stringify(project));
      } else {
        localStorage.setItem("project", null);
      }
      if (team) {
        localStorage.setItem("equipe", JSON.stringify(team));
      }
    })
    .catch(error => {
      console.error("Failed to fetch project:", error);
    });
}
      
      // reset my states
      setEmail('');
      setPassword('');

      // Clear any previous state that might conflict
      localStorage.removeItem("searchTitle");
      localStorage.removeItem("filterState");

      // Redirect based on role
      switch(user.role) {
        case "admin":
          navigate("/Admin");
          break;
        case "etudiant":
          navigate("/Student");
          break;
        case "enseignant":
          navigate("/Professor");
          break;
        case "entreprise":
          navigate("/Company");
          break;
        default:
          navigate("/");
      }
      
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setError(error.response?.data?.error || "Login failed. Please try again.");
      
      // Clear sensitive data on failed login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userEmail");
      document.cookie = "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  };

  return (
    <>
      <div className="sidelogo"><Logo /></div>
      <div className="logwrapper">
        <div className="loginwrapper">
          <form className="loginfrom" onSubmit={handleLogin}>
            <Logo theme={'dark'} />
            <p className="welcomeback">Welcome back! Log in to your account</p>
            <div className="inputformat">
              <i className="bx bxs-envelope"></i>
              <input
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label><b>Email</b></label>
            </div>
            <div className="inputformat">
              <i className="bx bxs-lock-alt"></i>
              <input
                className="passinput"
                type="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label><b>Password</b></label>
            </div>
            <div className="remember-forgot">
              <div>
                <input type="checkbox" id="rememberMe" />
                <label htmlFor="rememberMe">Remember me?</label>
              </div>
              <a href="/forgot-password">Forgot Password</a>
            </div>
            {error && <div style={{color:'red'}}>{error}</div>}
            <button type="submit" className="loginbtn">Log in</button>
          </form>
        </div>
        <div className="bottomright">
          <a href="/support">Help and support</a>
        </div>
        <div className="bottomleft">
          <i className="bx bxs-phone"></i>
          <span>+213 48 749 452</span>
        </div>
      </div>
    </>
  );
}