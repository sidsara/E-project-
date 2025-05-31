import { useEffect, useState } from 'react';
import Header from "../../components/Header";
import axios from "axios";
import Search from "../../components/Search";
import { useLocation, useNavigate } from "react-router-dom"; 
import ProjectItem from "../../components/ProjectItem";
import ProjectListHeader from "../../components/ProjectListHeader";
import SidebarByUser from "../../components/SidebarByUser";
import { NotFoundPhoto } from "../../icons/projectIcons";

export default function CompanyProjects() {
  const [sujets, setSujets] = useState([]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [fieldFilter, setFieldFilter] = useState("All");
  const [supervisedByFilter, setSupervisedByFilter] = useState("");

  // Temporary filters
  const [tempStatusFilter, setTempStatusFilter] = useState("All");
  const [tempYearFilter, setTempYearFilter] = useState("All");
  const [tempFieldFilter, setTempFieldFilter] = useState("All");
  const [tempSupervisedByFilter, setTempSupervisedByFilter] = useState("");

  // React Router
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const searchTitleFromUrl = searchParams.get("search") || "";
  const [searchTitle, setSearchTitle] = useState(searchTitleFromUrl);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);
  useEffect(() => {
    const getSujets = async () => {
      try {
        const response = await axios.get('http://localhost:3000/sujets-by-user', {
          headers: {
            'x-user-id': user?.id,
            'x-user-role': user?.role,
          },
          withCredentials: true
        });
        console.log("Sujets:", response.data);
        setIsLoading(false);
        setSujets(response.data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    getSujets();
  }, []);
  
  

  const handleSearch = (searchTerm) => {
    const term = searchTerm.trim();
    setSearchTitle(term);
    if (term) {
      navigate(`?search=${encodeURIComponent(term)}`, { replace: true });
    } else {
      navigate("", { replace: true });
    }
  };

  const applyFilters = () => {
    setStatusFilter(tempStatusFilter);
    setYearFilter(tempYearFilter);
    setFieldFilter(tempFieldFilter);
    setSupervisedByFilter(tempSupervisedByFilter);
    if (isZoomed) setIsZoomed(false);
    setShowFilter(false);
  };

  const filteredSujets = sujets
    .filter((sujet) => {
      if (statusFilter !== "All") {
        if (statusFilter === "Validated" && sujet.status !== "accepted") return false;
        if (statusFilter === "Refused" && sujet.status !== "rejected") return false;
        if (statusFilter === "Await" && sujet.status !== "pending") return false;
      }
      return true;
    })
    .filter((sujet) => {
      if (yearFilter !== "All") {
        const sujetYear = parseInt(sujet.niveau, 10);
        const filterYear = parseInt(yearFilter, 10);
        return sujetYear === filterYear;
      }
      return true;
    })
    .filter((sujet) => {
      if ((yearFilter === "4" || yearFilter === "5") && fieldFilter !== "All") {
        return sujet.specialite === fieldFilter;
      }
      return true;
    })
    .filter((sujet) => {
      if (supervisedByFilter) {
        return sujet.equipeEncadrants?.Enseignants?.some((enc) => 
          enc.email?.includes(supervisedByFilter) || 
          enc.nom?.includes(supervisedByFilter) || 
          enc.prenom?.includes(supervisedByFilter)
        );
      }
      return true;
    })
    .filter((sujet) => {
      return sujet.titre.toLowerCase().includes(searchTitle.toLowerCase());
    })
    .sort((a, b) => {
      const statusOrder = { accepted: 1, pending: 2, rejected: 3 };
      return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
    })
    .sort((a, b) => new Date(a.dateDepot) - new Date(b.dateDepot));

  return (
    <>
      <div className="admincontainer">
        <SidebarByUser role="entreprise"/>
        <div className="adminwrapper">
          <div className="adwrapper">
            <div className="allcontains">
              <Header page="Projects" userrole="Company" username={user?.nom} />
              <Search 
                page="Projects" 
                setShowFilter={setShowFilter}
                searchTitle={searchTitle}
                setSearchTitle={handleSearch}
              />
              {error && <div className="error-message">{error}</div>}
              {!isZoomed && <ProjectListHeader />}
              
              {isLoading ? (
                <div className="loadercontainer">
                  <div className="loader">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              ) : filteredSujets.length > 0 ? (
                filteredSujets.map((sujet) => (
                  <ProjectItem
                    key={sujet.id}
                    sujetId={sujet.id}
                    role="company"
                    title={sujet.titre}
                    entreprise={user}
                    enseignant={null}
                    document={sujet.document}
                    encadrants={sujet.equipeEncadrants}
                    niveau={sujet.niveau}
                    feild={sujet.specialite}
                    isZoomed={isZoomed}
                    description={sujet.description}
                    setIsZoomed={setIsZoomed}
                    isValidated={sujet.status}
                  />
                ))
              ) : (
                <div className="no-results">
                  <NotFoundPhoto/>
                  <h1><b>No Project Found</b></h1>
                </div>
              )}

              <div className="space"></div>
            </div>
          </div>
        </div>
      </div>

      {showFilter && (
        <div className="doyouwant" onClick={() => setShowFilter(false)}>
          <div className="filterbox" onClick={(e) => e.stopPropagation()}>
            <label>Supervised by:</label>
            <input 
              type="text" 
              placeholder="Enter email or name" 
              value={tempSupervisedByFilter} 
              onChange={(e) => setTempSupervisedByFilter(e.target.value)} 
            />

            <label>Status:</label>
            <select value={tempStatusFilter} onChange={(e) => setTempStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Validated">Validated</option>
              <option value="Refused">Refused</option>
              <option value="Await">Await</option>
            </select>

            <label>Year:</label>
            <select value={tempYearFilter} onChange={(e) => setTempYearFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="2">2nd</option>
              <option value="3">3rd</option>
              <option value="4">4th</option>
              <option value="5">5th</option>
            </select>

            {(tempYearFilter === "4" || tempYearFilter === "5") && (
              <>
                <label>Field:</label>
                <select value={tempFieldFilter} onChange={(e) => setTempFieldFilter(e.target.value)}>
                  <option value="All">All</option>
                  <option value="SIW">SIW</option>
                  <option value="ISI">ISI</option>
                  <option value="AI">AI</option>
                </select>
              </>
            )}

            <div className="yesno">
              <button className="cancel" onClick={() => setShowFilter(false)}>Cancel</button>
              <button className="yes" onClick={applyFilters}>Filter</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}