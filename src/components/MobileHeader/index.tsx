import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Drawer } from 'vaul';
import { APP_NAME, PAGE_ICONS, PAGE_NAMES, PAGES, DROPDOWN_ICONS, PLAN_DISPLAY_TEXT, SIDEBAR_TOGGLE_ICON_COLOR, ICON_GRAY, ICON_PRIMARY, SIDEBAR_INACTIVE_ICON_COLOR, PageUtils } from '../../types';
import { Icon } from '../../icons';
import { HistoryPanelPreview } from '../HistoryPanel';
import CreditCardPreviewList from '../CreditCardPreviewList';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu/dropdown-menu';
import { Conversation, SubscriptionPlan } from '../../types';
import { CreditCard } from '../../types/CreditCardTypes';
import { User as FirebaseUser } from 'firebase/auth';
import './MobileHeader.scss';

interface MobileHeaderProps {
  title: string;
  rightContent?: React.ReactNode;
  onLogout?: () => void;
  // Right-side help button for pages with help
  showHelpButton?: boolean;
  onHelpClick?: () => void;
  // Sidebar-like data/handlers
  chatHistory?: Conversation[];
  currentChatId?: string | null;
  onCurrentChatIdChange?: (chatId: string | null) => void;
  onHistoryUpdate?: (updatedChat: Conversation | ((prevHistory: Conversation[]) => Conversation[])) => Promise<void> | void;
  subscriptionPlan?: SubscriptionPlan;
  creditCards?: CreditCard[];
  isLoadingCreditCards?: boolean;
  isLoadingHistory?: boolean;
  onCardSelect?: (card: CreditCard) => void;
  quickHistorySize?: number;
  user?: FirebaseUser | null;
  onNewChat?: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  // title is intentionally unused; we don't render dynamic titles in mobile header
  title: _unusedTitle, 
  rightContent,
  showHelpButton = false,
  onHelpClick,
  onLogout,
  chatHistory = [],
  currentChatId = null,
  onCurrentChatIdChange,
  onHistoryUpdate,
  subscriptionPlan = 'free',
  creditCards = [],
  isLoadingCreditCards = false,
  isLoadingHistory = false,
  onCardSelect,
  quickHistorySize = 3,
  user = null,
  onNewChat
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isActive = (path: string): boolean => location.pathname === path;
  const isHomeOrChatRoute = (pathname: string) => {
    if (pathname === PAGES.HOME.PATH) return true;
    if (currentChatId && pathname === `${PAGES.HOME.PATH}${currentChatId}`) return true;
    return false;
  };

  // Get the current page title for display in mobile header
  const getCurrentPageTitle = (): string => {
    const currentPath = location.pathname;
    
    // Handle home/chat routes specially
    if (isHomeOrChatRoute(currentPath)) {
      return PAGE_NAMES.HOME;
    }
    
    // Direct path matching for better reliability
    switch (currentPath) {
      case PAGES.HISTORY.PATH:
        return PAGE_NAMES.TRANSACTION_HISTORY;
      case PAGES.MY_CARDS.PATH:
        return PAGE_NAMES.MY_CARDS;
      case PAGES.PREFERENCES.PATH:
        return PAGE_NAMES.PREFERENCES;
      case PAGES.ACCOUNT.PATH:
        return PAGE_NAMES.MY_ACCOUNT;
      default:
        // Use PageUtils as fallback
        const pageTitle = PageUtils.getTitleByPath(currentPath);
        if (pageTitle) {
          return pageTitle;
        }
        return PAGE_NAMES.HOME; // final fallback
    }
  };

  // Get the current page icon (mini) for display in mobile header
  const getCurrentPageIcon = (): React.ReactNode | null => {
    const currentPath = location.pathname;
    if (isHomeOrChatRoute(currentPath)) return null;

    switch (currentPath) {
      case PAGES.HISTORY.PATH:
        return <Icon name="history" variant="solid" size={18} color={ICON_PRIMARY} className="title-icon" />;
      case PAGES.MY_CARDS.PATH:
        return <Icon name="card" variant="solid" size={18} color={ICON_PRIMARY} className="title-icon" />;
      case PAGES.PREFERENCES.PATH:
        return <Icon name="preferences" variant="solid" size={18} color={ICON_PRIMARY} className="title-icon" />;
      case PAGES.ACCOUNT.PATH:
        return <Icon name="account" variant="solid" size={18} color={ICON_PRIMARY} className="title-icon" />;
      default:
        return null;
    }
  };

  const handleNewChatClick = () => {
    if (isHomeOrChatRoute(location.pathname)) {
      onNewChat?.();
    } else {
      onCurrentChatIdChange?.(null);
      navigate(PAGES.HOME.PATH);
    }
    setIsDrawerOpen(false);
  };

  // We no longer render a dynamic title in the mobile header

  return (
    <>
      <header className="mobile-header" role="banner">
        <Drawer.Root direction="left" open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <div className="mobile-header__left">
            <Drawer.Trigger asChild>
              <button className="button no-outline small icon-gray-hover mobile-header__menu-button" aria-label="Open menu">
                <Icon name="sidebar" variant="open" size={20} color={SIDEBAR_TOGGLE_ICON_COLOR} />
              </button>
            </Drawer.Trigger>
          </div>

          <div className="mobile-header__center">
            {isHomeOrChatRoute(location.pathname) ? (
              <Link to={PAGES.HOME.PATH} className="mobile-header__brand" aria-label={APP_NAME}>
                <img src={PAGE_ICONS.LOGO} alt={`${APP_NAME} logo`} />
              </Link>
            ) : (
              <h1 className="mobile-header__title">
                {getCurrentPageIcon()}
                <span>{getCurrentPageTitle()}</span>
              </h1>
            )}
          </div>

          <div className="mobile-header__actions">
            {showHelpButton && onHelpClick ? (
              <button 
                className="button no-outline small icon-gray-hover mobile-header__help-button"
                onClick={onHelpClick}
                aria-label="Open help"
                title="Help"
              >
                <Icon name="help" variant="outline" size={20} color={SIDEBAR_TOGGLE_ICON_COLOR} />
              </button>
            ) : (
              rightContent || <span aria-hidden className="header-spacer" />
            )}
          </div>
          <Drawer.Portal>
            <Drawer.Overlay className="mobile-drawer-overlay" />
            <Drawer.Content className="mobile-drawer-content" aria-label={`${APP_NAME} mobile navigation`} aria-describedby={undefined}>
              <div className="mobile-drawer-container">
                <div className="mobile-drawer-header">
                  <Link to={PAGES.HOME.PATH} className="mobile-drawer-brand" onClick={(e)=>e.stopPropagation()} aria-label={APP_NAME}>
                    <img src={PAGE_ICONS.LOGO} alt="Logo" />
                    <span className="brand-name">{APP_NAME}</span>
                  </Link>
                  <Drawer.Title className="visually-hidden">Menu</Drawer.Title>
                  <Drawer.Description className="visually-hidden">Mobile navigation drawer</Drawer.Description>
                  <Drawer.Close asChild>
                    <button className="mobile-drawer-close button no-outline small icon-gray-hover" aria-label="Close menu">
                      <Icon name="sidebar" variant="close" size={20} color={SIDEBAR_TOGGLE_ICON_COLOR} />
                    </button>
                  </Drawer.Close>
                </div>

                <div className="mobile-drawer-body">
                  <nav className="mobile-drawer-nav" role="navigation">
                    <ul className="primary-links">
                      <li className="nav-item-new-chat">
                        <Drawer.Close asChild>
                          <button onClick={handleNewChatClick} aria-label="Start new transaction chat">
                            <Icon name="chat-bubble" variant="micro" size={16} />
                            <span>New Transaction Chat</span>
                          </button>
                        </Drawer.Close>
                      </li>
                      <li className={isActive(PAGES.HISTORY.PATH) ? 'active' : ''}>
                        <Drawer.Close asChild>
                          <Link to={PAGES.HISTORY.PATH}>
                            <Icon 
                              name="history" 
                              variant={isActive(PAGES.HISTORY.PATH) ? 'solid' : 'outline'} 
                              size={16}
                              color={SIDEBAR_INACTIVE_ICON_COLOR}
                            />
                            <span>{PAGE_NAMES.TRANSACTION_HISTORY}</span>
                          </Link>
                        </Drawer.Close>
                      </li>
                      <li className={isActive(PAGES.MY_CARDS.PATH) ? 'active' : ''}>
                        <Drawer.Close asChild>
                          <Link to={PAGES.MY_CARDS.PATH}>
                            <Icon 
                              name="card" 
                              variant={isActive(PAGES.MY_CARDS.PATH) ? 'solid' : 'outline'} 
                              size={16}
                              color={SIDEBAR_INACTIVE_ICON_COLOR}
                            />
                            <span>{PAGE_NAMES.MY_CARDS}</span>
                          </Link>
                        </Drawer.Close>
                      </li>
                    </ul>
                  </nav>

                  <div className="mobile-drawer-section">
                    <div className="section-title">Recent Transactions</div>
                    <div
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('.actions-dropdown')) return;
                        setIsDrawerOpen(false);
                      }}
                    >
                      <HistoryPanelPreview 
                        existingHistoryList={chatHistory}
                        listSize={quickHistorySize}
                        currentChatId={currentChatId}
                        returnCurrentChatId={onCurrentChatIdChange!}
                        onHistoryUpdate={onHistoryUpdate!}
                        creditCards={creditCards}
                        historyRefreshTrigger={0}
                        loading={isLoadingHistory}
                      />
                    </div>
                  </div>

                  <div className="mobile-drawer-section">
                    <div className="section-title">My Cards</div>
                    <CreditCardPreviewList 
                      cards={creditCards}
                      loading={isLoadingCreditCards}
                      showOnlySelected={true}
                      onCardSelect={onCardSelect!}
                      variant="mobile-sidebar"
                    />
                  </div>
                </div>

                {user && (
                  <div className="mobile-drawer-bottom">
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
                              <Icon 
                                name="ellipsis-vertical" 
                                variant="mini" 
                                size={20}
                                color={ICON_GRAY}
                                className="profile-options-icon"
                              />
                            </div>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="top" sideOffset={8} className="mobile-drawer-dropdown">
                          <Drawer.Close asChild>
                            <Link to={PAGES.PREFERENCES.PATH}>
                              <DropdownMenuItem icon={DROPDOWN_ICONS.PREFERENCES.NORMAL}>
                                {PAGE_NAMES.PREFERENCES}
                              </DropdownMenuItem>
                            </Link>
                          </Drawer.Close>
                          <Drawer.Close asChild>
                            <Link to={PAGES.ACCOUNT.PATH}>
                              <DropdownMenuItem icon={DROPDOWN_ICONS.MY_ACCOUNT.NORMAL}>
                                {PAGE_NAMES.MY_ACCOUNT}
                              </DropdownMenuItem>
                            </Link>
                          </Drawer.Close>
                          <Drawer.Close asChild>
                            <DropdownMenuItem onClick={onLogout} className="signout-action" icon={DROPDOWN_ICONS.SIGN_OUT.RED}>
                              {PAGE_NAMES.SIGN_OUT}
                            </DropdownMenuItem>
                          </Drawer.Close>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>

      </header>
    </>
  );
};

export default MobileHeader;


