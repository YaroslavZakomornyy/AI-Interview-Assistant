import React from 'react';
import './FeedbackMenu.css';

function FeedbackMenu({ feedback }) {
  return (
    <div className="feedback-menu">
      <h2>Resume Feedback Summary</h2>
      {feedback.categories.map((category, index) => (
        <div key={index} className="feedback-category">
          <h3>{category.name} - Score: {category.score}/10</h3>
          <p><strong>Feedback:</strong> {category.feedback}</p>
          <p><strong>Tips:</strong> {category.tips}</p>
        </div>
      ))}
    </div>
  );
}

export default FeedbackMenu;
