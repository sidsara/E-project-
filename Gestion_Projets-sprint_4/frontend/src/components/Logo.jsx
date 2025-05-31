import logo from '../images/Logo.png';
import logolight from '../images/lightlogo.png';
import './Logo.css'
export default function Logo({theme}){
    const spanClass = theme === 'light' ? 'light' : 'dark';
    return(
        
        <div className="logo">
           {theme === 'light' ? <img src={logolight} alt="logo" /> : <img src={logo} alt="logo" />}
            <span className={spanClass}>e-Project</span>
           {theme === 'light' ?  <div className="cerclelight"></div>
 :  <div className="cercle"></div>
}
        </div>
        
    )
}