import "./PopupWindow.css";

export default function PopupWindow({ title, text, acceptButtonText, onAcceptClick, rejectButtonText, onRejectClick }) {


    return (
        <div className="interaction-blocker">
            <div className="popup-window">
                <h2>{title}</h2>
                <p>{text}</p>
                <div className="buttons">
                    {acceptButtonText &&
                        <button className="accept" onClick={onAcceptClick}>{acceptButtonText}</button>}
                    {rejectButtonText &&
                        <button className="reject" onClick={onRejectClick}>{rejectButtonText}</button>}
                </div>
            </div>
        </div>

    );
}