import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Homepage from './pages/Homepage';
import Pagelogin from "./pages/Pagelogin";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Chat from "./components/Chat/Chat";

// Admin
import Admin from './pages/Admin/Admin';
import AdminProjects from './pages/Admin/AdminProjects';
import AdminAccounts from './pages/Admin/AdminAccounts';

// Professor
import Professor from './pages/Professor/Professor';
import SubEnseignant from './pages/Professor/SubmissionEnseignant';
import ProfessorProjects from './pages/Professor/ProfesorProjects';
import TrackingProfessor from './pages/Professor/TrackingProfessor';
import TeamTracking from './pages/Professor/TeamTracking';

// Company
import Company from './pages/Company/Company';
import SubEntreprise from './pages/Company/SubEntreprise';
import CompanyProjects from './pages/Company/CompanyProjects';

// Student
import Student from './pages/Student/Student';
import Profile from './pages/Student/Profile';
import StudentTeams from './pages/Student/StudentTeams';
import StudentsProjects from './pages/Student/StudentsProjects';
import StudentTracking from './pages/Student/StudentTracking';
import AffectStudentToTeam from './pages/Student/AffectStudentToTeam';

function App() {
  return (
    <Router>
      <Routes>
        {/* General */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Pagelogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/chat" element={<Chat />} />

        {/* Admin */}
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Admin/Accounts" element={<AdminAccounts />} />
        <Route path="/Admin/Projects" element={<AdminProjects />} />

        {/* Professor */}
        <Route path="/Professor" element={<Professor />} />
        <Route path="/Professor/Submission" element={<SubEnseignant />} />
        <Route path="/Professor/Projects" element={<ProfessorProjects />} />
        <Route path="/Professor/Tracking" element={<TrackingProfessor />} />
        <Route path="/Professor/Tracking/:id" element={<TeamTracking />} />
        <Route path="/Professor/Tracking/:id/:section" element={<TeamTracking />} />

        {/* Company */}
        <Route path="/Company" element={<Company />} />
        <Route path="/Company/Submission" element={<SubEntreprise />} />
        <Route path="/Company/Projects" element={<CompanyProjects />} />

        {/* Student */}
        <Route path="/Student" element={<Student />} />
        <Route path="/Student/Projects" element={<StudentsProjects />} />
        <Route path="/Student/Profile" element={<Profile />} />
        <Route path="/Student/Teams" element={<StudentTeams />} />
        <Route path="/Student/Teams/Profile" element={<Profile />} />
        <Route path="/Student/Projects/Profile" element={<Profile />} />
        <Route path="/Student/Tracking" element={<StudentTracking />} />
        <Route path="/Student/Tracking/:section" element={<StudentTracking />} />
        <Route path="/affect-student-to-team/:studentId" element={<AffectStudentToTeam />} />
      </Routes>
    </Router>
  );
}

export default App;
