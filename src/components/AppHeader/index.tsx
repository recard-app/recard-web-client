import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AppHeader.scss';
import { handleClickOutside } from './utils';
import { User as FirebaseUser } from 'firebase/auth';
import { APP_NAME } from '../../types';
/**
 * Props interface for AppHeader component
 * @property {FirebaseUser | null} user - Current Firebase user or null if not authenticated
 * @property {() => void} onModalOpen - Callback to open credit card selection modal
 * @property {() => void} onLogout - Callback to handle user logout
 */
export interface AppHeaderProps {
  user: FirebaseUser | null;
  onModalOpen: () => void;
  onLogout: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ user, onModalOpen, onLogout }) => {
  /**
   * State to control profile dropdown menu visibility
   * true = dropdown is visible, false = dropdown is hidden
   */
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /**
   * Ref to track dropdown container element for click outside detection
   * Used to close dropdown when clicking outside of it
   */
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /**
   * Effect to handle clicking outside of dropdown menu
   * - Adds click event listener to document
   * - Checks if click was outside dropdown area
   * - Closes dropdown if click was outside
   * - Cleans up event listener on unmount
   */
  useEffect(() => {
    const listener = (event: Event) => handleClickOutside(event, dropdownRef, setDropdownOpen);
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, []);

  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/"><h1>{APP_NAME}</h1></Link>
      </div>
      
      <nav className="nav-links">
        {user && <button onClick={onModalOpen}>Select your Credit Cards</button>}
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
