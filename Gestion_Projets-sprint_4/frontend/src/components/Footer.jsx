import './Footer.css';
import {Circle} from '../icons/projectIcons'

export function FooterElement({text1,text2}){
    return(
        <div className="element">
                        <a href="#">{text1}</a>
                         <a href="#">{text2}</a>
                    </div>
          )   
}

export default function Footer() {
    return(
        <div id="contact" className="footercontainer">
            <div className="footer">
                <div className="footerelements">
                    <FooterElement text1={"Feedback"} text2={"Community"}/>
                    <FooterElement text1={"Trust , Safety and Security"} text2={"Help and support"}/>
                    <FooterElement text1={"Terms of use"} text2={"Cookie settings"}/>
                    <FooterElement text1={"Accessibility"} text2={"Cookie Policy"}/>
                </div>
                <div className="footercontact">
                    <div className="socialmedia">
                        <span><b>Follow us</b></span>
                        <Circle className="bx bxl-facebook"/>
                        <Circle className="bx bxl-instagram-alt"/>
                        <Circle className="bx bxl-twitter"/>   
                        <Circle className="bx bxl-linkedin"/>
                        <Circle className="bx bxl-youtube"/>                      
                    </div>
                    <div className="apps">
                        <span><b>Apps</b></span>
                        <Circle className="bx bxl-apple"/>
                        <Circle className="bx bxl-android"/>
                    </div>

                </div>
                <div className="footerlinecontainer">
                    <div className="footerline"></div>
                </div>
                <div className="footerfaxcontact">
                <span><b>e-Project</b></span>
                <div className="dawira"></div>
                <i class='bx bx-phone' ></i>
                <span>+213 48 749 452</span>
                </div>

            </div>
        </div>
    )
}