import React, { useState } from 'react';
import './ResumePage.css';
import {evaluateResume as apiEvaluateResume} from './api';
import FeedbackMenu from './FeedbackMenu';

function ResumePage() {
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState(""); 
  const [feedbackDetails, setFeedbackDetails] = useState(null);

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
      const res = await apiEvaluateResume(file, stateFeedback);
      setFeedback("Feedback received.");
      setFeedbackDetails(res); // Assuming res contains feedback details
    } else {
      setFeedback('Please upload a PDF file.');
    }
  };

  return (
      <div className="resume-page">
      <h1>Resume Analysis</h1>
      <p>Upload your resume to get AI powered feedback!</p>
      <input type="file" accept="application/pdf" name="file" onChange={handleFileChange} />
      {feedback && <div className="feedback">{feedback}</div>}
      </div>
  );
}

export default ResumePage;