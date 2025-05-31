import './Account.css'
import userimage from '../images/User.png';
import {OrangeCircleIcon,BlueCircleIcon,MoreIcon} from '../icons/projectIcons'

export default function Account({role,isActive,name,email}){
    return(
        <div className="accountcontainer">
             <div className="account">
                <div className="accprofile">
                 <img src={userimage} alt="userimage" />
                 <div className="info">
                    <span><b>{name}</b></span>
                    <p>{email}</p>
                 </div>
                </div>
                <div className="role" style={{ marginLeft: '50px' }}>
                   <button>{role}</button>
                </div>
                <div className="status">
                  {isActive? <> <OrangeCircleIcon/>
                    <span>Active</span></> : <>
                    <BlueCircleIcon/>
                    <span>Inactive</span></>}
                </div>
                <div className="date">
                 <span>Mar 15, 2025</span>
                </div>
                <div className="date">
                <span>Mar 1, 2025</span>

                </div>
                <div className="more">
                  <MoreIcon/>
                </div>
             </div>
        </div>
    );
}