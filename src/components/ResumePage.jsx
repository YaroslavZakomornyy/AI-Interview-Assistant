import React, { useState } from 'react';
import './ResumePage.css';
import { evaluateResume as apiEvaluateResume } from './api';
import FeedbackModal from './FeedbackMenu';

function ResumePage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [feedbackDetails, setFeedbackDetails] = useState(null);
  const [jobDescription, setJobDescription] = useState("");

  const updateStatus = (status) => {
    const statusMessages = {
      "Uploading": "Uploading your resume...",
      "Evaluating": "Analyzing your resume...",
      "Done": "Analysis complete!",
      "Error": "An error occurred. Please try again."
    };
    setStatus(statusMessages[status] || status);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFeedbackDetails(null);
      updateStatus("Uploading");
      try {
        const res = await apiEvaluateResume(file, jobDescription, updateStatus);
        
        if (!res || !res.data || !res.data.message) {
          throw new Error('Invalid response format or missing feedback message');
        }

        const feedbackText = res.data.message;
        const feedback = parseFeedbackResponse(feedbackText);
        setFeedbackDetails(feedback);
        updateStatus("Done");
      } catch (error) {
        console.error('Error uploading resume:', error);
        updateStatus('Error');
        setFeedbackDetails(null);
      }
    } else {
      updateStatus('Please upload a PDF file.');
      setFeedbackDetails(null);
    }
  };

  const parseFeedbackResponse = (feedbackText) => {
    try {
      const cleanedText = feedbackText
        .replace(/#{3,}/g, '') 
        .replace(/\*\*/g, '')
        .trim();

      const sections = cleanedText.split(/(?=Style:|Consistency:|Content:|General:|Areas for Improvement:)/g);
      
      const categories = sections.map(section => {
        const titleMatch = section.match(/^([^:]+):\s*(?:Score:\s*)?(\d+)?\/?10?\s*(.*)/);
        if (titleMatch) {
          const [, name, score, remainingText] = titleMatch;
          const [feedbackPart, tipsPart] = remainingText.split(/(?=Tips:)/);

          const feedback = feedbackPart ? feedbackPart.split(/(?:\d+\.\s+)/).filter(Boolean).join('\n\n') : '';
          const tips = tipsPart ? tipsPart.replace(/^Tips:\s*/, '').split(/(?:\d+\.\s+)/).filter(Boolean).join('\n\n') : "No specific tips provided.";

          return {
            name: name.trim(),
            score: parseInt(score) || 5,
            feedback: feedback.trim(),
            tips: tips || "No specific tips provided."
          };
        }
        return null;
      }).filter(Boolean);

      if (categories.length === 0) {
        categories.push({
          name: 'General',
          score: 5,
          feedback: cleanedText,
          tips: "Please try uploading your resume again for more specific feedback."
        });
      }

      return { categories };
    } catch (error) {
      console.error('Error parsing feedback:', error);
      return {
        categories: [{
          name: 'Error',
          score: 0,
          feedback: 'There was an error processing your resume feedback.',
          tips: 'Please try uploading your resume again or contact support if the problem persists.'
        }]
      };
    }
  };

  return (
    <div className="resume-page">
      <h1>Resume Analysis</h1>
      <p>Upload your resume and job description to get AI-powered feedback!</p>
      
      <div className="input-container">
        <textarea
          className="job-description-input"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
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
      
      {status && <div className="status-message">{status}</div>}
      
      {feedbackDetails && (
        <FeedbackModal 
          feedback={feedbackDetails} 
          onClose={() => setFeedbackDetails(null)} 
        />
      )}
    </div>
  );
}

export default ResumePage;
