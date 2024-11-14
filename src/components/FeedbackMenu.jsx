// FeedbackModal.jsx
import React from 'react';
import './FeedbackMenu.css';

const FeedbackModal = ({ feedback, onClose }) => {
  if (!feedback) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2 className="modal-title">Resume Feedback Summary</h2>
        <div className="modal-body">
          {feedback.categories?.map((category, index) => (
            <div key={index} className="feedback-category">
              <h3 className="category-title">
                {category.name} - Score: {category.score}/10
              </h3>
              <div className="category-content">
                <p className="feedback-text">
                  <strong>Feedback:</strong> {category.feedback}
                </p>
                <p className="tips-text">
                  <strong>Tips:</strong> {category.tips}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;