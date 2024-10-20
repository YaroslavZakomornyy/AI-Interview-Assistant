import { setParameters as apiSetParameters } from "../api";
import "./InterviewParameters.css";
import { useEffect, useRef } from "react";

export default function InterviewParameters() {
  const behSelectionRef = useRef(null);
  const qualitySelectionRef = useRef(null);
  const interviewSelectionRef = useRef(null);


  const updateParameters = async (behavior, quality, interviewStyle) => {
    const parameters = {
      "beh" : behavior,
      "quality": quality,
      "int" : interviewStyle
    }

    apiSetParameters(parameters);
  }
  
  return (
    <div className="settings-container">
      <div className="chatbox-heading">Parameters</div>

      {/* Behavior selection */}
      <label htmlFor="behavior-drop-down">Behavior</label>
        <select name="behavior" id="behavior-drop-down" ref={behSelectionRef}>
          <option value="enthusiastic">Interested and enthusiastic</option>
          <option value="stoic">Levelheaded and stoic</option>
          <option value="cold">Adversarial and dismissive</option>
        </select>

      {/* Company quality selection */}
      <label htmlFor="company-rating-drop-down">Workplace quality</label>
        <select name="company-rating" id="company-rating-drop-down" ref={qualitySelectionRef}>
          <option value="great">Great place to work</option>
          <option value="fine">Average, has good and bad</option>
          <option value="bad">Avoid it</option>
        </select>

      {/* Interviewer type */}
      <label htmlFor="interview-type-drop-down">Interview style
        <select name="company-rating" id="interview-type-drop-down" ref={interviewSelectionRef}>
          <option value="rec">Recruiter (High-level)</option>
          <option value="eng">Engineer (Technical)</option>
          <option value="hr">Hiring Manager (Behavioral)</option>
        </select>
      </label>

      <button onClick={() => updateParameters(behSelectionRef.current.value, qualitySelectionRef.current.value, interviewSelectionRef.current.value)}
              >
                Submit
      </button>
    </div>
  );
}