import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AppHeader.scss';

const AppHeader = ({ user, onModalOpen, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/"><h1>ReCard</h1></Link>
      </div>
      
      <nav className="nav-links">
        <button onClick={onModalOpen}>Select your Credit Cards</button>
        <Link to="/about">About</Link>
        {user ? (
          <div className="profile-dropdown" ref={dropdownRef}>
            {user.picture && (
              <img 
                src={user.picture} 
                alt="Profile" 
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%',
                  marginLeft: '10px',
                  marginRight: '10px',
                  cursor: 'pointer'
                }} 
              />
            )}
            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/account" onClick={() => setDropdownOpen(false)}>My Account</Link>
                <button 
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/signin">
            <button>Sign In</button>
          </Link>
        )}
      </nav>
    </header>
  );
};

export default AppHeader;
