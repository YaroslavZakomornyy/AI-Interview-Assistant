import { FaComment, FaComments, FaMicrophone, FaTextWidth } from "react-icons/fa";
import InterviewModeSelector from "../InterviewModeSelector";
import "./InterviewParameters.css";
import { useState } from "react";

export default function InterviewParameters({ onStart, areMutable }) {
    const [behavior, setBehavior] = useState("enthusiastic");
    const [quality, setQuality] = useState("great");
    const [interviewType, setInterviewType] = useState("recruiter");
    const [jobDescription, setJobDescription] = useState();
    const [interviewMode, setInterviewMode] = useState("text");
    const [resume, setResume] = useState(null);

    // Handle resume file selection
    const handleResumeChange = (e) => {
        const file = e.target.files[0];
        if (file)
        {
            setResume(file);
        }
    };

    return (
        <div className="settings-container">
            <div className="chatbox-heading">Parameters</div>

            <div className="parameters-selections">
                {/* Behavior selection */}
                <div>
                    <label htmlFor="behavior-drop-down">Behavior</label>
                    <select name="behavior"
                        id="behavior-drop-down"
                        onChange={(e) => setBehavior(e.target.value)}
                        value={behavior}
                        disabled={!areMutable}
                    >
                        <option value="enthusiastic">Interested and enthusiastic</option>
                        <option value="stoic">Levelheaded and stoic</option>
                        <option value="cold">Adversarial and dismissive</option>
                    </select>
                </div>


                {/* Company quality selection */}
                <div>
                    <label htmlFor="company-rating-drop-down">Workplace quality</label>
                    <select name="company-rating"
                        id="company-rating-drop-down"
                        onChange={(e) => setQuality(e.target.value)}
                        value={quality}
                        disabled={!areMutable}
                    >
                        <option value="great">Great place to work</option>
                        <option value="fine">Average, has good and bad</option>
                        <option value="bad">Avoid it</option>
                    </select>
                </div>


                {/* Interviewer type */}
                <div>
                    <label htmlFor="interview-type-drop-down">Interview style</label>
                    <select name="company-rating"
                        id="interview-type-drop-down"
                        onChange={(e) => setInterviewType(e.target.value)}
                        value={interviewType}
                        disabled={!areMutable}
                    >
                        <option value="recruiter">Recruiter (High-level)</option>
                        <option value="engineer">Engineer (Technical)</option>
                        <option value="hr">Hiring Manager (Behavioral)</option>
                    </select>
                </div>


            </div>
            {/* Interview mode */}
            <div>
                <label htmlFor="interview-mode">Interview mode</label>
                <div id="interview-mode" className="interview-mode">
                    {(areMutable || interviewMode === "text") && <InterviewModeSelector name={"Text"}
                        icon={<FaComments />}
                        selected={interviewMode === "text"}
                        onClick={() => setInterviewMode("text")}
                        disabled={!areMutable}
                    />}
                    {(areMutable || interviewMode === "speech") && <InterviewModeSelector name={"Speech"}
                        icon={<FaMicrophone />}
                        selected={interviewMode === "speech"}
                        onClick={() => setInterviewMode("speech")}
                        disabled={!areMutable}
                    />}
                </div>
            </div>

            {/* Job Description */}
            <label htmlFor="job-description">Job description</label>
            <textarea
                id="job-description"
                className="job-description-input"
                placeholder="Paste job description here..."
                onChange={(e) => setJobDescription(e.target.value)}
                value={jobDescription}
                disabled={!areMutable}
            />

            {/* Resume Attachment */}
            {/* <label htmlFor="resume-upload">Attach your resume (PDF)</label>
            <input
                type="file"
                id="resume-upload"
                accept=".pdf"
                onChange={handleResumeChange}
                disabled={!areMutable}
            />
            {resume && <p>{resume.name}</p>} Display the file name once it's selected */}

            {/* Start Button */}
            {areMutable && <button
                className="start-button"
                onClick={() => onStart(behavior, quality, interviewType, jobDescription, interviewMode, resume)}
                disabled={!areMutable}
            >
                Start
            </button>}
        </div>
    );
}
