import "./Navbar.css";
import { Link } from "react-router-dom";
import Logo from "./Logo";
export default function Navbar() {
  return (
    <>
      
      <div className="navbar">
        <div className="homelogo">
          <Logo theme={"dark"} />
        </div>
        <ul className="navelements">
          <li>
            <a href="#home">Home</a>
          </li>
          <li>
            <a href="#">Blog</a>
          </li>
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>
        <div className="linecontainer">
          <div className="linee"></div>
        </div>
        <div className="loginspace">
          <Link to="/login">
            <button className="homeloginbtn">Log in</button>
          </Link>
        </div>
      </div>
    </>
  );
}
