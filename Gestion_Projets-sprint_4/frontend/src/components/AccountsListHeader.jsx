
import './AccountsListHeader.css'
export default function AccountsListHeader(){
    return(
        <div className="acclistheadercontainer">
             <ul>
                <li className='info'>Username</li>
                <li className='info'>Role</li>
                <li className='info'>Status</li>
                <li className='info'>Last Activity</li>
                <li className='info'>Date Added</li>
                <li className='more'>More</li>
             </ul>
        </div>
    );
}