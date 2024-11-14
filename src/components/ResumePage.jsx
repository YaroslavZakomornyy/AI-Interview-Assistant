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
      // Guard clause for undefined or null feedbackText
      if (!feedbackText) {
        throw new Error('No feedback text provided');
      }

      // First, try to split by clear section indicators
      const categories = [];
      const sections = feedbackText.split(/(?=Style:|Consistency:|Content:|General:)/g);
      
      if (sections.length === 0 || (sections.length === 1 && !sections[0].trim())) {
        // If no sections found, return a general feedback category
        return {
          categories: [{
            name: 'General',
            score: 5,
            feedback: feedbackText.trim() || 'No specific feedback provided',
            tips: 'Please try uploading your resume again for more specific feedback.'
          }]
        };
      }

      sections.forEach(section => {
        if (!section.trim()) return;
        
        // Enhanced regex to better capture feedback structure
        const categoryMatch = section.match(/([^:]+):\s*(\d+)\/10\s*([^]*?)(?=(?:Tips:|$))/i);
        const tipsMatch = section.match(/Tips:\s*([^]*?)(?=(?:[A-Z][a-z]+:|$))/i);
        
        if (categoryMatch) {
          categories.push({
            name: categoryMatch[1].trim(),
            score: parseInt(categoryMatch[2]) || 5,
            feedback: categoryMatch[3].trim(),
            tips: tipsMatch ? tipsMatch[1].trim() : "No specific tips provided."
          });
        }
      });

      // If no categories were created from parsing, create a general category
      if (categories.length === 0) {
        categories.push({
          name: 'General',
          score: 5,
          feedback: feedbackText.trim(),
          tips: "Please try uploading your resume again for more specific feedback."
        });
      }

      return { categories };
    } catch (error) {
      console.error('Error parsing feedback:', error);
      // Return a structured error feedback
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