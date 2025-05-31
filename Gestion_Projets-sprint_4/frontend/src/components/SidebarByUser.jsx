import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "./Logo";
import "./Sidebar.css";
import { BsChatDots } from "react-icons/bs";
import {
  Whiteline,
  DashboardIcon,
  TeamsIcon,
  AccountsIcon,
  ProjectsIcon,
  SubmissionsIcon,
  SettingsIcon,
  LogoutIcon,
  ProfileIcon,
  TrackingIcon,
} from "../icons/projectIcons";

// SidebarByUser Component
function SidebarByUser({ role }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.get("http://localhost:3000/logout", {
        withCredentials: true,
      });
      if (response.status === 200) {
        localStorage.clear(); //
        navigate("/login"); // Redirect to login page after successful logout
      } else {
        console.error("Logout failed:", response);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  let sidebarItems = [];

  switch (role) {
    case "admin":
      sidebarItems = [
        { path: "/Admin", icon: <DashboardIcon />, label: "Dashboard" },
        { path: "/Admin/Accounts", icon: <AccountsIcon />, label: "Accounts" },
        { path: "/Admin/Projects", icon: <ProjectsIcon />, label: "Projects" },
      ];
      break;
    case "enseignant":
      sidebarItems = [
        { path: "/Professor", icon: <DashboardIcon />, label: "Dashboard" },
        {
          path: "/Professor/Submission",
          icon: <SubmissionsIcon />,
          label: "Submission",
        },
        {
          path: "/Professor/Projects",
          icon: <ProjectsIcon />,
          label: "Projects",
        },
        {
          path: "/Professor/Tracking",
          icon: <TrackingIcon />,
          label: "Tracking",
        },
        {
          path: "/chat",
          icon: <BsChatDots />,
          label: "Messages",
        },
       
      ];
      break;
    case "etudiant":
      sidebarItems = [
        { path: "/Student", icon: <DashboardIcon />, label: "Dashboard" },
        {
          path: "/Student/Projects",
          icon: <ProjectsIcon />,
          label: "Projects",
        },
        { path: "/Student/Teams", icon: <TeamsIcon />, label: "Teams" },

        {
          path: "/chat",
          icon: <BsChatDots />,
          label: "Messages",
        },
       
        {
          path: "/Student/Tracking",
          icon: <TrackingIcon />,
          label: "Tracking",
        },

        {
          path: "/Student/Profile",
          icon: <ProfileIcon />,
          label: "My Profile",
        },
      ];
      break;
    case "entreprise":
      sidebarItems = [
        { path: "/Company", icon: <DashboardIcon />, label: "Dashboard" },
        {
          path: "/Company/Submission",
          icon: <SubmissionsIcon />,
          label: "Submission",
        },
        {
          path: "/Company/Projects",
          icon: <ProjectsIcon />,
          label: "Projects",
        },
        {
          path: "/chat",
          icon: <BsChatDots />,
          label: "Messages",
        },
        
      ];
      break;
    default:
      sidebarItems = [];
  }

  return (
    <div className="sidebar">
      {}
      <Logo theme={"light"} />

      {}
      <div className="center">
        <ul className="sidebarlistup">
          {sidebarItems.map((item, index) => (
            <Link to={item.path} key={index}>
              <li>
                {item.icon}
                {item.label}
              </li>
            </Link>
          ))}
        </ul>
      </div>

      {}
      <div className="linediv">
        <Whiteline />
      </div>

      {}
      <ul className="sidebarlistup">
        <Link to="/Settings">
          <li>
            <SettingsIcon />
            Settings
          </li>
        </Link>
        <a>
          <li onClick={handleLogout}>
            <LogoutIcon /> Log out
          </li>
        </a>
      </ul>
    </div>
  );
}

export default SidebarByUser;
