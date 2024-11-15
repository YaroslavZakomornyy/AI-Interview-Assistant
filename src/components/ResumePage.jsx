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

        const feedback = await parseFeedbackResponse(feedbackText);
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

  const parseFeedbackResponse = async (feedbackText) => {
      let trimmedText = feedbackText.substring(feedbackText.indexOf("["));
      trimmedText = trimmedText.substring(0, trimmedText.lastIndexOf("]") + 1);
      trimmedText = await JSON.parse(trimmedText);
      try {
      const categories = trimmedText.map(section => {
        // Provide more detailed default tips if none are provided
        if (!section.tips) {
            tips = generateDefaultTips(section.categoryName);
        }

        return {
        name: section.categoryName.trim(),
        score: section.score,
        feedback: section.feedback.trim(),
        tips: section.tips
        };
      }).filter(Boolean);
  
      // Fallback if no specific categories found
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
  
  // Generate default tips based on category name
  const generateDefaultTips = (categoryName) => {
    switch (categoryName) {
      case 'Style':
        return "• Ensure consistent formatting and font usage.\n• Keep bullet points clear and concise.";
      case 'Consistency':
        return "• Verify consistency in dates, job titles, and locations.\n• Ensure uniform use of action verbs.";
      case 'Content':
        return "• Include quantifiable achievements.\n• Tailor skills and experiences to match the job description.";
      case 'General':
        return "• Focus on key skills that match the job requirements.\n• Avoid excessive or unnecessary information.";
      case 'Areas for Improvement':
        return "• Highlight your achievements more prominently.\n• Use action-oriented language to describe your experiences.";
      default:
        return "• Review your resume for clarity and relevance to the job description.";
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
