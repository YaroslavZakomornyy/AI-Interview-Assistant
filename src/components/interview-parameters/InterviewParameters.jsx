import "./InterviewParameters.css";
import { useState } from "react";

export default function InterviewParameters({ onStart }) {
  const [behavior, setBehavior] = useState("enthusiastic");
  const [quality, setQuality] = useState("great");
  const [interviewType, setInterviewType] = useState("recruiter");
  const [jobDescription, setJobDescription] = useState();

  return (
    <div className="settings-container">
      <div className="chatbox-heading">Parameters</div>

      {/* Behavior selection */}
      <label htmlFor="behavior-drop-down">Behavior</label>
      <select name="behavior" id="behavior-drop-down" onChange={(e) => setBehavior(e.target.value)} value={behavior}>
        <option value="enthusiastic">Interested and enthusiastic</option>
        <option value="stoic">Levelheaded and stoic</option>
        <option value="cold">Adversarial and dismissive</option>
      </select>

      {/* Company quality selection */}
      <label htmlFor="company-rating-drop-down">Workplace quality</label>
      <select name="company-rating" id="company-rating-drop-down" onChange={(e) => setQuality(e.target.value)} value={quality}>
        <option value="great">Great place to work</option>
        <option value="fine">Average, has good and bad</option>
        <option value="bad">Avoid it</option>
      </select>

      {/* Interviewer type */}
      <label htmlFor="interview-type-drop-down">Interview style</label>
      <select name="company-rating" id="interview-type-drop-down" onChange={(e) => setInterviewType(e.target.value)} value={jobDescription}>
        <option value="recruiter">Recruiter (High-level)</option>
        <option value="engineer">Engineer (Technical)</option>
        <option value="hr">Hiring Manager (Behavioral)</option>
      </select>

      {/* Job Description */}
      <label htmlFor="job-description">Job description</label>
      <textarea
        id="job-description"
        className="job-description-input"
        placeholder="Paste job description here..."
        onChange={(e) => setJobDescription(e.target.value)}
        value={jobDescription}
      />

      {/* Start Button */}
      <button
        className="start-button"
        onClick={() => onStart(behavior, quality, interviewType, jobDescription)}
      >
        Start
      </button>
    </div>
  );
}
