import React from 'react';
import './HomePage.css';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';

function HomePage() {
  const handlePastFeedbackClick = (event) => {
    event.preventDefault();
    alert("The 'Past Feedback' feature is still in progress. Check back soon!");
  };
  return (
    <div className="home-page">
      <NavBar />
      <h1>AI Interview Assistant</h1>
      <p>Welcome to your AI-powered interview assistant.</p>
      <Link to="/chat" className="button">Interview Simulation</Link>
      <p></p>
      <Link to="/resume" className="button">Resume Analysis</Link>
      <p></p>
      {/* <a href="#" className="button" onClick={handlePastFeedbackClick}>Past Feedback</a> */}
    </div>
  );
}

export default HomePage;