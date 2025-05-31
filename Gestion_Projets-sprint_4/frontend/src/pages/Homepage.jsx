import './Homepage.css';
import Navbar from '../components/Navbar';
import React from "react";
import home2 from '../images/Home2.png';
import home3 from '../images/Home3.png';
import home4 from '../images/Home4.png';
import homeimage from '../images/Home1.jpg';
import Footer from '../components/Footer';
import {Orangeline,Vector,Orangecircle} from '../icons/projectIcons';
export function Usernumber({user,number}){
    return(
        <div className="usernumber">
            <label><b>{user}</b></label>
            <span>+{number}</span>
        </div>

    )
}

export function Areyou({user,content}){
    return(
        <div className="areyou">
        <div className="areyoucontent">
        <span><b><i>Are you a {user} ?</i></b></span>
            <Vector/>
            <p><i>{content}</i></p>
        </div>
        </div>)}
    
export default function Homepage() {
    return(
       <>
        <Navbar/>
        <div id="home" className="homecontent">
        <img src={homeimage} alt="home" />
         <div className="description">
            <h1><b> Manage Academic Projects</b></h1>
            <p>Track and manage final year and multidisciplinary projects</p>
            <p> whether you're a student, supervisor, or company.</p>
            <div className="readme">
            <button>Read More</button>
            </div>
         </div>
        </div>
        <div id="about" className="nemberusers">
            <Usernumber user={"Students"} number={1500}/>
            <Usernumber user={"Professors"} number={36}/>
            <Usernumber user={"Companies"} number={10}/>
        </div>
        <Orangeline/>
        <Areyou user={"Student"} content={"Collaborate and structure your project efficiently"}/>
        <div className="userwrapper">
           <img src={home2} alt="home2" />
           <div className="usercontent">
            <div className="phrase">
                <p><Orangecircle/> Form and validate your project team in just a few clicks</p>
            </div>
            <div className="phrase">
                <p><Orangecircle/>    Submit your preference form and choose the topic that suits you best</p>
            </div>
            <div className="phrase">
                <p><Orangecircle/>   Upload your deliverables and communicate easily with your supervisor</p>
            </div>
           </div>

        </div>
        
        <Areyou user={"professor"} content={"Supervise, evaluate, and participate in thesis juries"}/>
        <div className="userwrapper">
           
           <div className="usercontent">
            <div className="phrase1">
                <p><Orangecircle/> Propose project topics and track their progress in real time</p>
            </div>
            <div className="phrase1">
                <p><Orangecircle/>       Communicate with your students and assess their deliverables</p>
            </div>
            <div className="phrase1">
                <p><Orangecircle/>   Easily submit defense authorizations</p>
            </div>
            <div className="phrase1">
                <p><Orangecircle/>               Be part of the thesis defense jury and evaluate student projects</p>
            </div>
           </div>
           <img src={home3} alt="home3" />
        </div>
        <Areyou user={"Company"} content={"Find tomorrow’s talents by offering your projects"}/>
        <div className="userwrapper">
           <img src={home4} alt="home4" />
           <div className="usercontent">
            <div className="phrase">
                <p><Orangecircle/> Post your Final Year Project (FYP) offers and attract top students</p>
            </div>
            <div className="phrase">
                <p><Orangecircle/>     Track applications and select the profiles that best match your needs</p>
            </div>
            <div className="phrase">
                <p><Orangecircle/>   Schedule interviews directly on the platform with accepted students</p>
            </div>
           </div>

        </div>
        <Footer/>
       </>

    )
}
