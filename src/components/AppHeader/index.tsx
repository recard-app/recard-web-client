import React from 'react';
import { Link } from 'react-router-dom';
import './AppHeader.scss';
import { User as FirebaseUser } from 'firebase/auth';
import { APP_NAME, TEMP_ICON } from '../../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu/dropdown-menu';

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="profile-dropdown-trigger">
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    className="profile-image"
                  />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="profile-dropdown">
              <Link to="/my-cards">
                <DropdownMenuItem icon={TEMP_ICON}>My Cards</DropdownMenuItem>
              </Link>
              <Link to="/preferences">
                <DropdownMenuItem>Preferences</DropdownMenuItem>
              </Link>
              <Link to="/account">
                <DropdownMenuItem icon={TEMP_ICON}>My Account</DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={onLogout} className="signout-action" icon={TEMP_ICON}>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>
    </header>
  );
};

export default AppHeader;
