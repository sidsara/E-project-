import './ProjectListHeader.css';

export default function ProjectListHeader(){
    return(
        <div className="projectlistheader">
        <ul>
            <li className="titleheader">Title</li>
            <li className="descriptionheader">Description</li>
            <li className="otherheader">Modify</li>
            <li className="otherheader">Delete</li>
        </ul>

    </div>
    );
}