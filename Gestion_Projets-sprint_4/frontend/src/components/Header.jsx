import { GoBackCircle } from "../icons/projectIcons";
import userimage from "../images/User.png";
import './Header.css';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
export default function Header({page,username,userrole}) {
  const [picture,setPicture] = useState(userimage);
  const [user,setUser] = useState(null);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      const baseUrl = "http://localhost:3000";
      setPicture(storedUser.profileImageUrl ? baseUrl + storedUser.profileImageUrl : userimage);
    }
  }, []);

    return(
        <div className="adheader">
                 <span className="pagename" ><b style={{ display: 'flex', alignItems: 'center' }}> {page}</b></span> 
                 <div className="profile">
                   <Link to="./Profile">
                   <img src={picture} alt="user" />
                   </Link>
                  <Link to="./Profile" style={{textDecoration: "none"}}> <div className="userinfo">
                     <span className="userrole">{userrole}</span>   
                     <p className="username"><b>{username}</b></p> 
                   </div></Link>
                </div>
                 </div>

    );
}