import React from 'react';
import './FeedbackMenu.css';

const FeedbackModal = ({ feedback, onClose }) => {
  if (!feedback) return null;

  const renderFormattedText = (text) => {
    return text.split('\n\n').map((paragraph, index) => (
      <p key={index} className="feedback-paragraph">
        {paragraph.trim() && `• ${paragraph.trim()}`}
      </p>
    ));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2 className="modal-title">Resume Feedback Summary</h2>
        <div className="modal-body">
          {feedback.categories?.map((category, index) => (
            <div key={index} className="feedback-category">
              <div className="category-header">
                <h3 className="category-title">
                  {category.name}
                </h3>
                <div className="score-badge">
                  Score: {category.score}/10
                </div>
              </div>
              
              <div className="category-content">
                <div className="feedback-section">
                  <h4 className="section-title">Feedback</h4>
                  <div className="feedback-text">
                    {renderFormattedText(category.feedback)}
                  </div>
                </div>

                {category.tips && (
                  <div className="tips-section">
                    <h4 className="section-title">Recommendations</h4>
                    <div className="tips-text">
                      {renderFormattedText(category.tips)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;