import React, { useState } from 'react';
import './ResumePage.css';
import {evaluateResume as apiEvaluateResume} from './api';

function ResumePage() {
    const [feedback, setFeedback] = useState(null); 

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


    const handleFileChange = (event) => {
    const file = event.target.files[0];
    

      const inquireFeedback = async() =>{
        const res = await apiEvaluateResume(file, stateFeedback);
        console.log(res);
        // setFeedback(res);
      } 

    if (file && file.type === 'application/pdf') {
      // Process the PDF file here (replace with actual logic)
      inquireFeedback();
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