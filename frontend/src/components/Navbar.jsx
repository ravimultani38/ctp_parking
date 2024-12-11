import  { useState, useEffect } from 'react';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const [isToggle, setIsToggle] = useState(false);
  const [isSign, setIsSign] = useState(false);
  const navigate = useNavigate();

  
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    if (authToken) {
      setIsSign(true); 
    } else {
      setIsSign(false); 
    }
  }, [authToken]);

  
  function toggleNav() {
    setIsToggle(!isToggle);
  }

 
  function handleLogout() {
    localStorage.removeItem('authToken');
    setIsSign(false); 
    navigate('/login'); 
  }

  return (
    <div className="navbar-container">
      <div className="navbar">
        <Link to="/" className="navbar-brand"><img className="logo" src="./src/assets/logo.png" alt="Parking Finder"/></Link>
        <div className="navbar-links desktop-links">
          <Link to="/" className="navbar-link">Activity</Link>
          <Link to="/settings" className="navbar-link">Settings</Link>
          {isSign ? (
            <button className="navbar-link logout" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login" className="navbar-link sign-in">Sign In</Link>
              <Link to="/signup" className="navbar-link register">Register</Link>
            </>
          )}
        </div>
        <div className="navbar-toggle md-hidden">
          <button className="toggle-button" onClick={toggleNav}>
            {isToggle ? 'X' : 'Menu'}
          </button>
        </div>
      </div>
      {isToggle && (
        <div className="navbar-mobile">
          <Link to="/" className="navbar-link mobile-link">Home</Link>
          <Link to="/about-me" className="navbar-link mobile-link">About Me</Link>
          <Link to="/experience" className="navbar-link mobile-link">Experience</Link>
          <Link to="/contact" className="navbar-link mobile-link">Contact</Link>
        </div>
      )}
    </div>
  );
};

