// NavBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  return (
    <nav className="navbar custom-navbar">
      <div className="container">
        <div className="navbar-nav mx-auto">
          <Link className="nav-link" to="/home">
            Home
          </Link>
          <Link className="nav-link" to="/chat">
            Mock Interview
          </Link>
          <Link className="nav-link" to="/resume">
            Resume Analysis
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
