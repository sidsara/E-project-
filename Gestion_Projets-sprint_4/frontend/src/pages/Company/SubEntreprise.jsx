import React from "react";
import SidebarByUser from "../../components/SidebarByUser";
import EntrepriseForm from "../../components/EntrepriseForm";
import "../Admin/Admin.css"; 

const SubEntreprise = () => {
  return (
    <div className="admincontainer">
      <SidebarByUser role="entreprise" />
      <div className="adminwrapper">
        <div className="adwrapper">
          <span className="pagename">
            <b>Submission</b>
          </span>
          <EntrepriseForm />
        </div>
      </div>
    </div>
  );
};

export default SubEntreprise;