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
    switch(status) {
      case "Uploading":
        setStatus("Uploading your resume...");
        break;
      case "Evaluating":
        setStatus("Analyzing your resume...");
        break;
      case "Done":
        setStatus("Analysis complete!");
        break;
      default:
        setStatus(status);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFeedbackDetails(null);
      updateStatus("Uploading");
      try {
        const res = await apiEvaluateResume(file, jobDescription, updateStatus);
        
        // Check if response and response.data exist
        if (!res || !res.data) {
          throw new Error('Invalid response format');
        }
        
        // Access the message from the response data
        const feedbackText = res.data.message;
        if (!feedbackText) {
          throw new Error('No feedback message in response');
        }

        const feedback = parseFeedbackResponse(feedbackText);
        setFeedbackDetails(feedback);
        updateStatus("Done");
      } catch (error) {
        console.error('Error uploading resume:', error);
        updateStatus('An error occurred during upload. Please try again.');
        setFeedbackDetails(null);
      }
    } else {
      updateStatus('Please upload a PDF file.');
      setFeedbackDetails(null);
    }
  };

  const parseFeedbackResponse = (feedbackText) => {
    try {
      if (!feedbackText) {
        throw new Error('No feedback text provided');
      }

      // Clean up the text by removing excess symbols and formatting
      const cleanedText = feedbackText
        .replace(/#{3,}/g, '') // Remove ### symbols
        .replace(/\*\*/g, '')  // Remove ** symbols
        .trim();

      // Split into main sections
      const sections = cleanedText.split(/(?=Style:|Consistency:|Content:|General:|Areas for Improvement:)/g);
      
      const categories = [];
      
      sections.forEach(section => {
        if (!section.trim()) return;
        
        // Extract section name and score
        const titleMatch = section.match(/^([^:]+):\s*(?:Score:\s*)?(\d+)?\/?10?\s*(.*)/);
        
        if (titleMatch) {
          const [, name, score, remainingText] = titleMatch;
          
          // Split feedback and tips
          let feedback = '';
          let tips = '';
          
          // Check if there's a "Tips:" section
          const [feedbackPart, tipsPart] = remainingText.split(/(?=Tips:)/);
          
          if (feedbackPart) {
            // Process feedback: Split into bullet points if possible
            feedback = feedbackPart
              .split(/(?:\d+\.\s+)/)
              .filter(Boolean)
              .map(point => point.trim())
              .join('\n\n');
          }
          
          if (tipsPart) {
            // Process tips: Remove "Tips:" prefix and split into bullet points
            tips = tipsPart
              .replace(/^Tips:\s*/, '')
              .split(/(?:\d+\.\s+)/)
              .filter(Boolean)
              .map(point => point.trim())
              .join('\n\n');
          }
          
          categories.push({
            name: name.trim(),
            score: parseInt(score) || 5,
            feedback: feedback.trim(),
            tips: tips || "No specific tips provided."
          });
        }
      });

      // If no categories were found, create a default one
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
          tips: 'Please try uploading your resume again. If the problem persists, contact support.'
        }]
      };
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