import React from 'react';
import { Link } from 'react-router-dom';
import './AppHeader.scss';
import { User as FirebaseUser } from 'firebase/auth';
import { APP_NAME, DROPDOWN_ICON } from '../../types';
import { Dropdown, DropdownItem } from '../../elements';

/**
 * Props interface for AppHeader component
 * @property {FirebaseUser | null} user - Current Firebase user or null if not authenticated
 * @property {() => void} onLogout - Callback to handle user logout
 * @property {boolean} isSidePanelOpen - Whether the sidebar is currently open
 * @property {() => void} toggleSidePanel - Callback to toggle sidebar open/closed state
 */
export interface AppHeaderProps {
  user: FirebaseUser | null;
  onLogout: () => void;
  isSidePanelOpen: boolean;
  toggleSidePanel: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ user, onLogout, isSidePanelOpen, toggleSidePanel }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        {user && (
          <button 
            className="sidebar-toggle-button"
            onClick={toggleSidePanel}
            aria-label={isSidePanelOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            ☰
          </button>
        )}
        <div className="logo">
          <Link to="/"><h1>{APP_NAME}</h1></Link>
        </div>
      </div>
      
      <nav className="nav-links">
        {/*{user && <button onClick={onModalOpen}>Manage your Credit Cards</button>}*/}
        {/* // Removed the button for now */}
        {user && (
          <Dropdown 
            trigger={
              user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className="profile-image"
                />
              )
            }
            className="profile-dropdown"
          >
            <Link to="/my-cards">
              <DropdownItem icon={DROPDOWN_ICON}>My Cards</DropdownItem>
            </Link>
            <Link to="/preferences">
              <DropdownItem>Preferences</DropdownItem>
            </Link>
            <Link to="/account">
              <DropdownItem icon={DROPDOWN_ICON}>My Account</DropdownItem>
            </Link>
            <DropdownItem onClick={onLogout} className="signout-action" icon={DROPDOWN_ICON}>Sign Out</DropdownItem>
          </Dropdown>
        )}
      </nav>
    </header>
  );
};

export default AppHeader;
