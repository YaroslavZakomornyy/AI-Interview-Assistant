import React, { useState } from 'react';
import './ResumePage.css';
import {evaluateResume as apiEvaluateResume} from './api';
import FeedbackMenu from './FeedbackMenu';

function ResumePage() {
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState(""); 
  const [feedbackDetails, setFeedbackDetails] = useState(null);
  // const [jobDescription, setJobDescription] = useState("");

  const stateFeedback = (fb) => {
    switch(fb){
      case "Uploading":
        setFeedback("Uploading your resume...");
        break;
      case "Evaluating":
        setFeedback("Analyzing your resume...");
        break;
      case "Done":
        setFeedback("Retrieving your resume...");
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      stateFeedback("Uploading");
      const res = await apiEvaluateResume(file, jobDescription, stateFeedback);
      setFeedback("Feedback received.");
      setFeedbackDetails(res);
    } else {
      setFeedback('Please upload a PDF file.');
    }
  };

  return (
    <div className="resume-page">
      <h1>Resume Analysis</h1>
      <p>Upload your resume and job description to get AI powered feedback!</p>
      
      <div className="input-container">
        <textarea
          className="job-description-input"
          placeholder="Paste the job description here..."
          // value={jobDescription}
          // onChange={(e) => setJobDescription(e.target.value)}
        />
        
        <div className="file-input-container">
          <input 
            type="file" 
            accept="application/pdf" 
            name="file" 
            onChange={handleFileChange}
          />
        </div>
      </div>
      
      {feedback && <div className="feedback">{feedback}</div>}
    </div>
  );
}

export default ResumePage;