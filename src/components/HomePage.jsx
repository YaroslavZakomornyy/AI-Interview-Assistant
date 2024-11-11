import React from 'react';
import './HomePage.css';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-page">
      <h1>AI Interview Assistant</h1>
      <p>Welcome to your AI-powered interview assistant.</p>
      <Link to="/chat" className="button">Interview Simulation</Link>
      <p></p>
      <Link to="/resume" className="button">Resume Analysis</Link>
      <p></p>
      <Link to="/resume" className="button">Past Feedback</Link>
    </div>
  );
}

export default HomePage;