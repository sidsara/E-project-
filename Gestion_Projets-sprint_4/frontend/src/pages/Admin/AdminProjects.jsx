import "./Admin.css";
import "./AdminProjects.css";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import Header from "../../components/Header";
import Search from "../../components/Search";
import ProjectItem from "../../components/ProjectItem";
import ProjectListHeader from "../../components/ProjectListHeader";
import SidebarByUser from "../../components/SidebarByUser";
import { getSujets } from "./getSujets";
import { NotFoundPhoto } from "../../icons/projectIcons";

export default function AdminProjects() {
  const [sujets, setSujets] = useState([]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [fieldFilter, setFieldFilter] = useState("All");
  const [proposedByFilter, setProposedByFilter] = useState("");
  const [supervisedByFilter, setSupervisedByFilter] = useState("");

  // Temporary filters
  const [tempStatusFilter, setTempStatusFilter] = useState("All");
  const [tempYearFilter, setTempYearFilter] = useState("All");
  const [tempFieldFilter, setTempFieldFilter] = useState("All");
  const [tempProposedByFilter, setTempProposedByFilter] = useState("");
  const [tempSupervisedByFilter, setTempSupervisedByFilter] = useState("");

  // React Router
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const searchTitleFromUrl = searchParams.get("search") || "";
  const [searchTitle, setSearchTitle] = useState(searchTitleFromUrl);
  const [user, setUser] = useState(null);
         
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await getSujets();
        setSujets(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch sujets:", error);
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle search navigation
  const handleSearch = (searchTerm) => {
    const term = searchTerm.trim();
    setSearchTitle(term);
    if (term) {
      navigate(`?search=${encodeURIComponent(term)}`, { replace: true });
    } else {
      navigate("", { replace: true }); // Remove search param if empty
    }
  };

  // Apply filters
  const applyFilters = () => {
    setStatusFilter(tempStatusFilter);
    setYearFilter(tempYearFilter);
    setFieldFilter(tempFieldFilter);
    setProposedByFilter(tempProposedByFilter);
    setSupervisedByFilter(tempSupervisedByFilter);
    if (isZoomed) setIsZoomed(false);
    setShowFilter(false);
  };

  // Filtering logic
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
  if (yearFilter !== "All" && sujet.niveau !== parseInt(yearFilter, 10)) return false;
  return true;
})
.filter((sujet) => {
  if ((parseInt(yearFilter, 10) === 4 || parseInt(yearFilter, 10) === 5) && fieldFilter !== "All") {
    if (sujet.specialite !== fieldFilter) return false;
  }
  return true;
})
.filter((sujet) => {
  if (
    proposedByFilter &&
    !sujet.Entreprise?.email?.includes(proposedByFilter) &&
    !sujet.Enseignant?.email?.includes(proposedByFilter) &&
    !sujet.Entreprise?.nom?.includes(proposedByFilter) &&
    !sujet.Entreprise?.prenom?.includes(proposedByFilter) &&
    !sujet.Enseignant?.nom?.includes(proposedByFilter) &&
    !sujet.Enseignant?.prenom?.includes(proposedByFilter)
  ) {
    return false;
  }
  return true;
})
.filter((sujet) => {
  if (
    supervisedByFilter && 
    (!sujet.equipeEncadrants?.Enseignants || 
    !sujet.equipeEncadrants.Enseignants.some((enc) => 
      enc.email?.includes(supervisedByFilter) || 
      enc.nom?.includes(supervisedByFilter) || 
      enc.prenom?.includes(supervisedByFilter)
    ))
  ) {
    return false;
  }
  return true;
})
.filter((sujet) => {
  return sujet.titre.toLowerCase().includes(searchTitle.toLowerCase());
})
.sort((a, b) => {
  // First sort by status (Accepted > Await > Rejected)
  const statusOrder = { accepted: 1, pending: 2, rejected: 3 };
  return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
})
.sort((a, b) => new Date(a.dateDepot) - new Date(b.dateDepot))
.sort((a, b) => {
  if (a.status === "rejected") return 1;
  if (b.status === "rejected") return -1;
  if (a.status === "accepted") return 1;
  if (b.status === "accepted") return -1;
  return 0;
});
  return (
    <>
      <div className="admincontainer">
        <SidebarByUser role="admin" />
        <div className="adminwrapper">
          <div className="adwrapper">
            <div className="allcontains">
              <Header page="Projects" userrole="Admin" username={user?.nom + " " + user?.prenom} />
              <Search 
                page="Projects" 
                setShowFilter={setShowFilter}
                searchTitle={searchTitle}
                setSearchTitle={handleSearch}
              />
              {!isZoomed && <ProjectListHeader />}
              
              <div className="projects-list">
                {isLoading ? (
                    <div className="adminpload"><div className="loader">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div></div>
                       
                ) : filteredSujets.length === 0 ? (
                    <div className="no-results">
                      <NotFoundPhoto/>
                      <h1><b>No Project Found</b></h1>
                    </div>
                ) : (
                    filteredSujets.map((sujet, index) => (
                        <ProjectItem
                            key={index}
                            sujetId={sujet.id}
                            role="admin"
                            title={sujet.titre}
                            entreprise={sujet.Entreprise}
                            enseignant={sujet.Enseignant}
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
                )}
              </div>

              <div className="space"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Popup */}
      {showFilter && (
        <div className="doyouwant" onClick={() => setShowFilter(false)}>
          <div className="filterbox" onClick={(e) => e.stopPropagation()}>
            <label>Proposed by:</label>
            <input 
              type="text" 
              placeholder="Enter email or name" 
              value={tempProposedByFilter} 
              onChange={(e) => setTempProposedByFilter(e.target.value)} 
            />

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