import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import './AppHeader.scss';

interface AppHeaderProps {
  user: FirebaseUser | null;
  onModalOpen: () => void;
  onLogout: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ user, onModalOpen, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
            {user.photoURL && (
              <img 
                src={user.photoURL} 
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
                <Link to="/preferences" onClick={() => setDropdownOpen(false)}>Preferences</Link>
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
