import React from 'react';
import ReactDOM from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import { HistoryPanelPreview } from '../HistoryPanel';
import CreditCardPreviewList from '../CreditCardPreviewList';
import { SidebarItem } from './SidebarItem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu/dropdown-menu';
import { 
  Conversation, 
  SubscriptionPlan,
  ShowCompletedOnlyPreference,
  DROPDOWN_ICON,
  APP_NAME,
  PLAN_DISPLAY_TEXT,
  PAGE_NAMES,
  PAGE_ICONS
} from '../../types';
import { CreditCard } from '../../types/CreditCardTypes';
import './AppSidebar.scss';

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chatHistory: Conversation[];
  currentChatId: string | null;
  onCurrentChatIdChange: (chatId: string | null) => void;
  onHistoryUpdate: (updatedChat: Conversation | ((prevHistory: Conversation[]) => Conversation[])) => Promise<void>;
  subscriptionPlan: SubscriptionPlan;
  creditCards: CreditCard[];
  historyRefreshTrigger: number;
  isLoadingCreditCards: boolean;
  isLoadingHistory: boolean;
  onCardSelect: (card: CreditCard) => void;
  quickHistorySize: number;
  user: FirebaseUser | null;
  onLogout: () => void;
  onNewChat: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen,
  onToggle,
  chatHistory,
  currentChatId,
  onCurrentChatIdChange,
  onHistoryUpdate,
  subscriptionPlan,
  creditCards,
  historyRefreshTrigger,
  isLoadingCreditCards,
  isLoadingHistory,
  onCardSelect,
  quickHistorySize,
  user,
  onLogout,
  onNewChat
}) => {
  // Get current location for active state
  const location = useLocation();
  const navigate = useNavigate();
  
  // Helper function to determine if current path is home or chat route
  const isHomeOrChatRoute = (pathname: string) => {
    // Matches "/" route
    if (pathname === '/') return true;
    
    // Matches "/:chatId" route using currentChatId state
    if (currentChatId && pathname === `/${currentChatId}`) return true;
    
    return false;
  };
  
  // Centralized tooltip state
  const [activeTooltip, setActiveTooltip] = React.useState<{
    name: string;
    position: { top: number };
  } | null>(null);

  const showTooltip = (name: string, position: { top: number }) => {
    setActiveTooltip({ name, position });
  };

  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  // Mini navigation items for collapsed state
  const miniMiddleNavItems = [
    { to: "/", name: PAGE_NAMES.HOME, icon: PAGE_ICONS.HOME },
    { to: "/history", name: PAGE_NAMES.TRANSACTION_HISTORY, icon: PAGE_ICONS.TRANSACTION_HISTORY },
    { to: "/my-cards", name: PAGE_NAMES.MY_CARDS, icon: PAGE_ICONS.MY_CARDS }
  ];

  const handleMiniNavHover = (e: React.MouseEvent, name: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    showTooltip(name, { top: rect.top + rect.height / 2 });
  };

  const handleNewChatHover = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    showTooltip(PAGE_NAMES.NEW_TRANSACTION_CHAT, { top: rect.top + rect.height / 2 });
  };

  const handleNewChat = () => {
    // If we're on a home or chat route, use the callback to properly clear the chat
    if (isHomeOrChatRoute(location.pathname)) {
      onNewChat();
    } else {
      // For other pages, navigate to home
      onCurrentChatIdChange(null);
      navigate('/');
    }
  };

  // Global tooltip component
  const GlobalTooltip = () => {
    if (!activeTooltip || isOpen) return null;

    return ReactDOM.createPortal(
      <div 
        className="global-tooltip"
        style={{
          top: `${activeTooltip.position.top}px`
        }}
      >
        {activeTooltip.name}
      </div>,
      document.body
    );
  };

  return (
    <div 
      className={`app-sidebar ${isOpen ? 'open' : 'collapsed'}`}
    >
      {/* Sticky Top Section */}
      <div className="sidebar-top">
        {isOpen && (
          <h1 className="app-name">
            <Link to="/">
              <img src={PAGE_ICONS.LOGO} alt="Logo" />
              {APP_NAME}
            </Link>
          </h1>
        )}
        {!isOpen && (
          <div className="sidebar-logo">
            <Link 
              to="/" 
              className="logo-icon"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <img src={PAGE_ICONS.LOGO} alt="Logo" />
            </Link>
          </div>
        )}
        <div className="sidebar-toggle">
          <button 
            className="button outline small toggle-button"
            onClick={onToggle}
            aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isOpen ? '←' : '→'}
          </button>
        </div>
      </div>

      {/* Scrollable Middle Section */}
      <div className="sidebar-middle">
        {isOpen ? (
          <>
            {/* New Transaction Chat Button */}
            <button 
              className="new-chat-button"
              onClick={handleNewChat}
              aria-label="Start new transaction chat"
            >
              <img src={PAGE_ICONS.NEW_TRANSACTION_CHAT} alt="New Chat" />
              <span>{PAGE_NAMES.NEW_TRANSACTION_CHAT}</span>
            </button>

            {/* Full expanded content */}
            {/* Transaction History as SidebarItem */}
            <SidebarItem 
              icon={PAGE_ICONS.TRANSACTION_HISTORY}
              name={PAGE_NAMES.TRANSACTION_HISTORY} 
              page="/history"
              isDropdown={true}
            >
              <HistoryPanelPreview 
                existingHistoryList={chatHistory} 
                listSize={quickHistorySize}
                currentChatId={currentChatId}
                returnCurrentChatId={onCurrentChatIdChange}
                onHistoryUpdate={onHistoryUpdate}
                creditCards={creditCards}
                historyRefreshTrigger={historyRefreshTrigger}
                loading={isLoadingHistory}
              />
            </SidebarItem>

            {/* My Cards as SidebarItem */}
            <SidebarItem 
              icon={PAGE_ICONS.MY_CARDS}
              name={PAGE_NAMES.MY_CARDS} 
              page="/my-cards"
              isDropdown={true}
            >
              <CreditCardPreviewList 
                cards={creditCards}
                loading={isLoadingCreditCards}
                showOnlySelected={true}
                onCardSelect={onCardSelect}
              />
            </SidebarItem>
          </>
        ) : (
          <>
            {/* Collapsed mini-nav content - just icons */}
            <div className="mini-nav-icons">
              {/* New Chat Plus Button */}
              <button 
                className="mini-nav-icon new-chat-mini"
                onClick={handleNewChat}
                onMouseEnter={handleNewChatHover}
                onMouseLeave={() => hideTooltip()}
                aria-label="Start new transaction chat"
              >
                +
              </button>

              {miniMiddleNavItems.map((item, index) => {
                const isActive = item.to === '/' 
                  ? isHomeOrChatRoute(location.pathname)
                  : location.pathname === item.to;
                return (
                  <Link 
                    key={index}
                    to={item.to} 
                    className={`mini-nav-icon ${isActive ? 'active' : ''}`}
                    onMouseEnter={(e) => handleMiniNavHover(e, item.name)}
                    onMouseLeave={() => hideTooltip()}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <img src={item.icon} alt={item.name} />
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Sticky Bottom Section */}
      {user && (
        <div className="sidebar-bottom">
          {isOpen ? (
            <div className="user-profile-section">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="profile-trigger-button">
                    <div className="profile-trigger">
                      {user.photoURL && (
                        <img 
                          src={user.photoURL} 
                          alt="Profile" 
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          className="profile-image"
                        />
                      )}
                      <div className="profile-info">
                        <span className="profile-name">{user.displayName || user.email}</span>
                        <span className="profile-plan">
                          {subscriptionPlan === 'free' ? PLAN_DISPLAY_TEXT.FREE : PLAN_DISPLAY_TEXT.PREMIUM}
                        </span>
                      </div>
                      <img src={DROPDOWN_ICON} alt="Options" className="profile-options-icon" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right" sideOffset={20} className="sidebar-profile-dropdown">
                  <Link to="/preferences">
                    <DropdownMenuItem>{PAGE_NAMES.PREFERENCES}</DropdownMenuItem>
                  </Link>
                  <Link to="/account">
                    <DropdownMenuItem icon={PAGE_ICONS.MY_ACCOUNT}>{PAGE_NAMES.MY_ACCOUNT}</DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={onLogout} className="signout-action" icon={PAGE_ICONS.SIGN_OUT}>{PAGE_NAMES.SIGN_OUT}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="mini-nav-profile">
              {user.photoURL && (
                <>
                  <Link 
                    to="/preferences" 
                    className={`mini-nav-icon ${location.pathname === '/preferences' ? 'active' : ''}`}
                    onMouseEnter={(e) => handleMiniNavHover(e, PAGE_NAMES.PREFERENCES)}
                    onMouseLeave={() => hideTooltip()}
                    style={{ textDecoration: 'none', color: 'inherit', marginBottom: '12px' }}
                  >
                    <img src={PAGE_ICONS.PREFERENCES} alt={PAGE_NAMES.PREFERENCES} />
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="mini-nav-icon mini-profile-trigger" title={user.displayName || user.email || 'Profile'}>
                        <img 
                          src={user.photoURL} 
                          alt="Profile" 
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          className="mini-profile-image"
                        />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="right" sideOffset={16} className="mini-profile-dropdown">
                      <Link to="/account">
                        <DropdownMenuItem icon={PAGE_ICONS.MY_ACCOUNT}>{PAGE_NAMES.MY_ACCOUNT}</DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem onClick={onLogout} className="signout-action" icon={PAGE_ICONS.SIGN_OUT}>{PAGE_NAMES.SIGN_OUT}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Global tooltip rendered outside sidebar */}
      <GlobalTooltip />
    </div>
  );
};

export default AppSidebar;
