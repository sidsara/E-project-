import './AdminAccounts.css';
import Header from '../../components/Header';
import { useEffect,useState } from 'react';
import Search from '../../components/Search';
import AccountsListHeader from '../../components/AccountsListHeader';
import Account from '../../components/Account';
import axios from "axios";
import SidebarByUser from '../../components/SidebarByUser';
import { CheckPhoto,EndStepLine,StepLine } from '../../icons/projectIcons';
import { NoAccounts } from '../../icons/projectIcons'; // Import the NoTeamsIcon


export default function Admin() {
    const [user, setUser] = useState(null);
         
    useEffect(() => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    }, []);
    const [addcompanypage,setAddcompanypage]=useState(false);
    const [showFirst,setShowFirst]=useState(true);
    const [showFilter,setShowFilter]=useState(false);
    
    function hideFilter() {
        setShowFilter(false);
    }
    const [companyName, setCompanyName] = useState("");
    const [companyEmail, setCompanyEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAddClick = async () => {
        setLoading(true);
        setError(""); // Clear any previous errors
    
        try {
            const response = await axios.post(
                "http://localhost:3000/creer-entreprise",
                {
                    nom: companyName, // Match API expected keys
                    email: companyEmail,
                },
                {
                    withCredentials: true, // 👈 Important for cookie-based auth
                }
            );
    
            if (response.status === 200) {
                console.log("Success:", response.data);
                setShowFirst(false);
                setTimeout(() => {
                    setShowFirst(true);
                }, 3000);
            }
        } catch (error) {
            console.error("Error:", error);
            setError(error.response?.data?.error || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    function getRole(role){
     if (role==="entreprise"){
        return "Company"
     } else  if (role==="enseignant"){
        return "Professor"
     } else if (role==="etudiant"){
        return "Student"
     } else if (role==="admin"){
        return "Admin"
     } else {
        return "No role"
     }
    }
    function handlegoback(){
        setAddcompanypage(false);
        setError("");
    }

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token'); // Retrieve token from localStorage

                if (!token) {
                    console.error('No token found in localStorage');
                    setError('Authentication token is missing. Please log in again.');
                    setLoadingUsers(false);
                    return;
                }

                console.log('Sending token:', token); // Debugging log for token

                const response = await axios.get('http://localhost:3000/utilisateurs', {
                    headers: {
                        Authorization: `Bearer ${token}` // Include token in Authorization header
                    },
                    withCredentials: true // Ensure cookies are sent with the request
                });

                if (response.status === 200) {
                    console.log('Users fetched successfully:', response.data); // Debugging log for success
                    setUsers(response.data); // Set the fetched users in state
                } else {
                    console.error('Unexpected response status:', response.status);
                    setError('Failed to fetch users. Please try again later.');
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    console.error('Unauthorized access:', err.response.data); // Debugging log for 401 error
                    setError('Unauthorized access. Please log in again.');
                } else {
                    console.error('Error fetching users:', err.response?.data || err.message); // Debugging log for other errors
                    setError('Failed to fetch users. Please try again later.');
                }
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        console.log('Users state updated:', users); // Debugging log for users state
    }, [users]);

    let content;
    if (addcompanypage){
      content=(
        <>
        <Header page="Projects" userrole="Admin" username={user?.nom + " " + user?.prenom} />
        <div className="addfromcontainer">
            {showFirst ? (
                <div className="form">
                    <StepLine />
                    <div className="companyinfo">
                        <span>Company info:</span>
                        <p>Enter Company account information</p>
                        <label>Company Name</label>
                        <input
                            type="text"
                            placeholder="Company Name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                        <label>Company Email</label>
                        <input
                            type="email"
                            placeholder="Company Email"
                            value={companyEmail}
                            onChange={(e) => setCompanyEmail(e.target.value)}
                        />
                    </div>
                    {error && <div className="error">{error}</div>}
                    <div className="btns">
                        <button className="goback" onClick={handlegoback} disabled={loading}>Go Back</button>
                        <button className="add" onClick={handleAddClick} disabled={loading}>
                            {loading ? "Adding..." : "Add"}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="addedsuccesfuly">
                    <EndStepLine />
                    <CheckPhoto />
                    <h1>Account Added Successfully</h1>
                </div>
            )}
        </div>
    
        </>
      );  
    } else { 
        content=(<>
        <Header page="Accounts" userrole="Admin" username={user?.nom + " " + user?.prenom} />
            <Search page="Accounts" setAddcompanypage={setAddcompanypage} setShowFilter={setShowFilter} />
            <AccountsListHeader />
            <div className="accounts-list">
                {loadingUsers ? (
                   <div className="adminpload"><div className="loader">
                   <div></div>
                   <div></div>
                   <div></div>
                   <div></div>
                 </div></div>
                ) : (users.length === 0 || error) ? (
                    <div className="no-results">
                        <NoAccounts />
                        <h1><b>No Accounts Yet</b></h1>
                    </div>
                ) : (
                    users.map((user, index) => (
                        <Account
                            key={index}
                            role={getRole(user.role)}
                            isActive={false}
                            name={`${user.nom} ${user.prenom || ''}`}
                            email={user.email}
                        />
                    ))
                )}
            </div>
            </>
);
    }
    return(
   <>
    <div className="admincontainer">
        <SidebarByUser role="admin"/>
       <div className="adminwrapper">
        <div className="adwrapper">
           {content} 
        </div>
        </div> 
    </div>
    {showFilter && <div className="doyouwant" onClick={hideFilter}>
    <div className="filterbox" onClick={(e) => { e.stopPropagation();}}>
    <label>Role:</label>
        <select name="Feild" id="Feild">
            <option value="All">All</option>
            <option value="Admin">Admin</option>
            <option value="Professor">Professor</option>
            <option value="Student">Student</option>
            <option value="Company">Company</option>
        </select>
       <label>Active:</label>
        <select name="Year" id="Year">
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
        </select>
        <label>Last Activity:</label>
        <input type="text" placeholder="dd/mm/yyyy" />
        <label>Date Added:</label>
        <input type="text" placeholder="dd/mm/yyyy"/>
        <div className="yesno">
            <button className="cancel" onClick={hideFilter}>Cancel</button>
            <button className="yes"> Filter </button>
        </div>
    </div>
    </div>}
    </>
    );
}