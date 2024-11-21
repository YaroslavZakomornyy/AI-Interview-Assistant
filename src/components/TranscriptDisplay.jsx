// TranscriptDisplay.jsx
import React from 'react';
import './TranscriptDisplay.css';
import NavBar from './NavBar';

const TranscriptDisplay = ({ transcript, onClose }) => {
  return (
    <div className="transcript-overlay">
      <div className="transcript-modal">
        <div className="transcript-header">
          <h2>Interview Transcript</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="transcript-content">
          {transcript.map((message, index) => (
            <div 
              key={index} 
              className={`transcript-message ${message.sender}-message`}
            >
              <span className="message-sender">{message.sender === 'user' ? 'You' : 'Interviewer'}:</span>
              <span className="message-text">{message.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TranscriptDisplay;