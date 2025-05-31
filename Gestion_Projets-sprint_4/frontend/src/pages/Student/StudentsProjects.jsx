import "../Admin/Admin.css";
import "../Admin/AdminProjects.css";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import Header from "../../components/Header";
import Search from "../../components/Search";
import ProjectItem from "../../components/ProjectItem";
import SidebarByUser from "../../components/SidebarByUser";
import { fetchSujetsDisponibles } from "../../api/fetchSujetsDisponibles";
import { NotFoundPhoto } from "../../icons/projectIcons";

export default function StudentsProjects() {
  const [sujets, setSujets] = useState([]);
  const [niveau,setNiveau]=useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [proposedByFilter, setProposedByFilter] = useState("");
  const [supervisedByFilter, setSupervisedByFilter] = useState("");

  // Temporary filters
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
    setNiveau(storedUser.niveau)
  }, []);

useEffect(() => {
  async function fetchData() {
    try {
      setIsLoading(true);
      // Pass the searchTitle and niveau to the API function
      const data = await fetchSujetsDisponibles("", niveau);
      // The backend returns { data: sujets }, so use data.data
      setSujets(Array.isArray(data?.data) ? data.data : []);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch sujets:", error);
      setIsLoading(false);
    }
  }

  // Only fetch if niveau is set (not null)
  if (niveau) fetchData();
}, [searchTitle, niveau]);

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
    setProposedByFilter(tempProposedByFilter);
    setSupervisedByFilter(tempSupervisedByFilter);
    if (isZoomed) setIsZoomed(false);
    setShowFilter(false);
  };

  // Filtering logic
const filteredSujets = sujets
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
.sort((a, b) => new Date(a.dateDepot) - new Date(b.dateDepot))
  return (
    <>
      <div className="admincontainer">
        <SidebarByUser role="etudiant" />
        <div className="adminwrapper">
          <div className="adwrapper">
            <div className="allcontains">
              <Header page="Projects" userrole="Student" username={user?.nom + " " + user?.prenom} />
              <Search 
                page="Projects" 
                setShowFilter={setShowFilter}
                searchTitle={searchTitle}
                setSearchTitle={handleSearch}
              />
              
          <div className="projectswrap">
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
                    chef={user.chefEquipe}
                    sujetId={sujet.id}
                    role="student"
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
              ) : (<>
            <div style={{width: '100%' , height: '60vh' , display:'flex',flexDirection:'column', alignItems: 'center' , justifyContent:'center'}}> <NotFoundPhoto/>
            <h1 style={{
              fontFamily:'"Inria Sans", serif',
              color:'#ff6000'
            }}>No Projects Yet</h1></div>
     </>)
                
              }
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