import { setParameters as apiSetParameters } from "../api";
import "./InterviewParameters.css";
import { useEffect, useRef } from "react";

export default function InterviewParameters() {
  const behSelectionRef = useRef(null);
  const qualitySelectionRef = useRef(null);


  const updateParameters = async (behavior, quality) => {
    const parameters = {
      "beh" : behavior,
      "quality": quality
    }

    apiSetParameters(parameters);
  }
  
  return (
    <div className="settings-container">
      <div className="chatbox-heading">Parameters</div>

      {/* Behavior selection */}
      <label htmlFor="behavior-drop-down">Behavior
        <select name="behavior" id="behavior-drop-down" ref={behSelectionRef}>
          <option value="enthusiastic">Interested and enthusiastic</option>
          <option value="stoic">Levelheaded and stoic</option>
          <option value="dismissive">Adversarial and dismissive</option>
        </select>
      </label>

      {/* Company quality selection */}
      <label htmlFor="company-rating-drop-down">Workplace quality
        <select name="company-rating" id="company-rating-drop-down" ref={qualitySelectionRef}>
          <option value="great">Great place to work</option>
          <option value="fine">Average, has good and bad</option>
          <option value="bad">Avoid it</option>
        </select>
      </label>

      <button onClick={() => updateParameters(behSelectionRef.current.value, qualitySelectionRef.current.value)}>Submit</button>
    </div>
  );
}