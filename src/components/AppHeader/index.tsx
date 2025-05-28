import React from 'react';
import { Link } from 'react-router-dom';
import './AppHeader.scss';
import { User as FirebaseUser } from 'firebase/auth';
import { APP_NAME, DROPDOWN_ICON } from '../../types';
import { Dropdown, DropdownItem } from '../../elements';

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
  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/"><h1>{APP_NAME}</h1></Link>
      </div>
      
      <nav className="nav-links">
        {/*{user && <button onClick={onModalOpen}>Manage your Credit Cards</button>}*/}
        {/* // Removed the button for now */}
        {user ? (
          <Dropdown 
            trigger={
              user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%',
                    marginLeft: '10px',
                    marginRight: '10px',
                    cursor: 'pointer'
                  }} 
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
