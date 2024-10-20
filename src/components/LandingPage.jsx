import React from 'react';
import { Link } from 'react-router-dom';
import './landingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="nav-bar">
      </div>
      <main className="content-section">
        <h1>AI Interview Assistant</h1>
        <p>Practice your interview skills with AI!</p>
        <Link to="/Home" className="cta-button">Try now</Link>
      </main>
    </div>
  );
};

export default LandingPage;