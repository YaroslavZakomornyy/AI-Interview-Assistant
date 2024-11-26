import "./InterviewModeSelector.css";

export default function InterviewModeSelector({name, icon, onClick, selected = false, disabled = false}){

    return (
        <button className={`interview-mode-selector ${selected}`} onClick={onClick} disabled={disabled}>
            <div>
                {icon}
            </div>
            {name}
        </button>
    );
}