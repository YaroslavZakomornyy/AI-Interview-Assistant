import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();

  return (
    <nav className="navbar custom-navbar">
      <div className="container">
        <div className="navbar-nav mx-auto">
          <Link 
            className="nav-link" 
            to="/home"
            style={{ opacity: location.pathname === '/home' ? 1 : 0.8 }}
          >
            Home
          </Link>
          <Link 
            className="nav-link" 
            to="/chat"
            style={{ opacity: location.pathname === '/chat' ? 1 : 0.8 }}
          >
            Mock Interview
          </Link> 
          {/* <Link to="/mock-interview" style={{ color: 'white', marginRight: '2rem' }}>Mock Interview</Link> */}
          <Link 
            className="nav-link" 
            to="/resume"
            style={{ opacity: location.pathname === '/resume' ? 1 : 0.8 }}
          >
            Resume Analysis
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;