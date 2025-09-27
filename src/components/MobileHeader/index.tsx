import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Drawer } from 'vaul';
import { APP_NAME, PAGE_ICONS, PAGE_NAMES, PAGES, DROPDOWN_ICONS, PLAN_DISPLAY_TEXT, SIDEBAR_TOGGLE_ICON_COLOR, ICON_GRAY, ICON_PRIMARY, ICON_PRIMARY_MEDIUM, SIDEBAR_INACTIVE_ICON_COLOR, PageUtils, TERMINOLOGY } from '../../types';
import { Icon } from '../../icons';
import { HistoryPanelPreview } from '../HistoryPanel';
import CreditCardPreviewList from '../CreditCardPreviewList';
import CreditSummary from '../CreditSummary';
import CreditList from '../CreditsDisplay/CreditList';
import { convertPrioritizedCreditsToUserCredits } from '../../utils/creditTransformers';
import { useCredits } from '../../contexts/ComponentsContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu/dropdown-menu';
import { Conversation, SubscriptionPlan } from '../../types';
import { CreditCard } from '../../types/CreditCardTypes';
import { MonthlyStatsResponse, PrioritizedCredit } from '../../types/CardCreditsTypes';
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
  onOpenCardSelector?: () => void;
  monthlyStats?: MonthlyStatsResponse | null;
  isLoadingMonthlyStats?: boolean;
  prioritizedCredits?: PrioritizedCredit[];
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
  onNewChat,
  onOpenCardSelector,
  monthlyStats = null,
  isLoadingMonthlyStats = false,
  prioritizedCredits = []
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Get credits data from context for proper credit matching
  const credits = useCredits();

  const isActive = (path: string): boolean => {
    // Special handling for MY_CREDITS - highlight for all my-credits/* pages
    if (path === PAGES.MY_CREDITS.PATH) {
      return location.pathname.startsWith(PAGES.MY_CREDITS.PATH);
    }
    return location.pathname === path;
  };
  const isHomeOrChatRoute = (pathname: string) => {
    return PageUtils.isPage(pathname, 'HOME');
  };

  // Check if current chat has messages to determine if new chat button should be visible
  const shouldShowNewChatButton = () => {
    if (!currentChatId) {
      // No current chat selected, so we're in a "new" state - hide button
      return false;
    }
    
    // Find the current chat in history
    const currentChat = chatHistory?.find(chat => chat.chatId === currentChatId);
    if (!currentChat) {
      // Current chat not found in history (new chat) - hide button
      return false;
    }
    
    // Show button if current chat has messages
    return currentChat.conversation && currentChat.conversation.length > 0;
  };

  // Determine if user has any selected cards (fallback to length > 0)
  const hasSelectedCards = Array.isArray(creditCards)
    ? creditCards.some((c: any) => c && c.selected === true)
    : false;
  
  // Separate logic for each button type
  // New chat button: show if user has cards AND current chat has messages
  const shouldShowNewChatButton_Mobile = (isLoadingCreditCards || hasSelectedCards) && shouldShowNewChatButton();
  
  // Add cards button: show if user has no cards selected (regardless of chat state)
  const shouldShowAddCardsButton = !isLoadingCreditCards && !hasSelectedCards;

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
      case PAGES.MY_CREDITS.PATH:
        return PAGE_NAMES.MY_CREDITS;
      case PAGES.MY_CREDITS_HISTORY.PATH:
        return PAGE_NAMES.MY_CREDITS;
      case PAGES.DELETE_HISTORY.PATH:
        return 'Delete History';
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
        return <Icon name="conversation-bubbles" variant="solid" size={18} color={ICON_PRIMARY} className="title-icon" />;
      case PAGES.MY_CARDS.PATH:
        return <Icon name="card" variant="solid" size={18} color={ICON_PRIMARY} className="title-icon" />;
      case PAGES.PREFERENCES.PATH:
        return <Icon name="preferences" variant="solid" size={18} color={ICON_PRIMARY} className="title-icon" />;
      case PAGES.ACCOUNT.PATH:
        return <Icon name="account" variant="solid" size={18} color={ICON_PRIMARY} className="title-icon" />;
      case PAGES.MY_CREDITS.PATH:
        return <Icon name="banknotes" variant="solid" size={18} color={ICON_PRIMARY} className="title-icon" />;
      case PAGES.MY_CREDITS_HISTORY.PATH:
        return <Icon name="banknotes" variant="solid" size={18} color={ICON_PRIMARY} className="title-icon" />;
      case PAGES.DELETE_HISTORY.PATH:
        return <Icon name="delete" variant="solid" size={18} color={ICON_PRIMARY} className="title-icon" />;
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

  const handleAddCardsClick = () => {
    onOpenCardSelector?.();
    setIsDrawerOpen(false);
  };

  // We no longer render a dynamic title in the mobile header

  return (
    <>
      <header className="mobile-header" role="banner">
        <Drawer.Root direction="left" open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <div className="mobile-header__left">
            <Drawer.Trigger asChild>
              <button className="button no-outline small icon-gray-hover-fill mobile-header__menu-button" aria-label="Open menu">
                <Icon name="bar-menu" variant="mini" size={22} color={SIDEBAR_TOGGLE_ICON_COLOR} />
              </button>
            </Drawer.Trigger>
            {isHomeOrChatRoute(location.pathname) ? (
              <div className="mobile-header__brand" aria-label={APP_NAME}>
                <img src={PAGE_ICONS.LOGO} alt={`${APP_NAME} logo`} />
              </div>
            ) : null}
          </div>

          <div className="mobile-header__center">
            {(() => {
              const currentTitle = getCurrentPageTitle();
              if (isHomeOrChatRoute(location.pathname)) return null;
              return (
                <h1 className="mobile-header__title">
                  {getCurrentPageIcon()}
                  <span>{currentTitle}</span>
                </h1>
              );
            })()}
          </div>

          <div className="mobile-header__actions">
            {isHomeOrChatRoute(location.pathname) && (onNewChat || onOpenCardSelector) ? (
              <>
                {shouldShowNewChatButton_Mobile && (
                  <button 
                    className="button ghost small icon with-text mobile-header__new-chat-button"
                    onClick={handleNewChatClick}
                    aria-label={PAGE_NAMES.NEW_TRANSACTION_CHAT}
                    title={PAGE_NAMES.NEW_TRANSACTION_CHAT}
                  >
                    <Icon name="chat-bubble" variant="micro" size={16} color={ICON_PRIMARY_MEDIUM} />
                    <span>{PAGE_NAMES.NEW_TRANSACTION_CHAT}</span>
                  </button>
                )}
                {shouldShowAddCardsButton && (
                  <button 
                    className="button ghost small icon with-text mobile-header__new-chat-button"
                    onClick={handleAddCardsClick}
                    aria-label="Add cards"
                    title="Add Cards"
                  >
                    <Icon name="card" variant="mini" size={16} color={ICON_PRIMARY_MEDIUM} />
                    <span>Add Cards</span>
                  </button>
                )}
              </>
            ) : null}
            {showHelpButton && onHelpClick ? (
              <button 
                className="button no-outline small icon-gray-hover mobile-header__help-button"
                onClick={onHelpClick}
                aria-label="Open help"
                title="Help"
              >
                <Icon name="help" variant="outline" size={22} color={SIDEBAR_TOGGLE_ICON_COLOR} />
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
                <Drawer.Close asChild>
                  <button className="mobile-drawer-close button no-outline small icon-gray-hover-fill" aria-label="Close menu">
                    <Icon name="arrow-left" variant="mini" size={22} color={SIDEBAR_TOGGLE_ICON_COLOR} />
                  </button>
                </Drawer.Close>
                <Drawer.Close asChild>
                  <Link to={PAGES.HOME.PATH} className="mobile-drawer-brand" aria-label={APP_NAME}>
                    <img src={PAGE_ICONS.LOGO} alt="Logo" />
                    <span className="brand-name">{APP_NAME}</span>
                  </Link>
                </Drawer.Close>
                <Drawer.Title className="visually-hidden">Menu</Drawer.Title>
                <Drawer.Description className="visually-hidden">Mobile navigation drawer</Drawer.Description>
              </div>

                <div className="mobile-drawer-body">
                  <nav className="mobile-drawer-nav" role="navigation">
                    <ul className="primary-links">
                      {/* Always show new chat button in mobile drawer (acts like sidebar) */}
                      <li className="nav-item-new-chat">
                        <Drawer.Close asChild>
                          <button onClick={handleNewChatClick} aria-label={PAGE_NAMES.NEW_TRANSACTION_CHAT}>
                            <Icon name="chat-bubble" variant="mini" size={18} />
                            <span>{PAGE_NAMES.NEW_TRANSACTION_CHAT}</span>
                          </button>
                        </Drawer.Close>
                      </li>
                      <li className={isActive(PAGES.HISTORY.PATH) ? 'active' : ''}>
                        <Drawer.Close asChild>
                          <Link to={PAGES.HISTORY.PATH}>
                            <Icon
                              name="conversation-bubbles"
                              variant={isActive(PAGES.HISTORY.PATH) ? 'solid' : 'outline'}
                              size={18}
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
                              size={18}
                              color={SIDEBAR_INACTIVE_ICON_COLOR}
                            />
                            <span>{PAGE_NAMES.MY_CARDS}</span>
                          </Link>
                        </Drawer.Close>
                      </li>
                      <li className={isActive(PAGES.MY_CREDITS.PATH) ? 'active' : ''}>
                        <Drawer.Close asChild>
                          <Link to={PAGES.MY_CREDITS.PATH}>
                            <Icon 
                              name="banknotes" 
                              variant={isActive(PAGES.MY_CREDITS.PATH) ? 'solid' : 'outline'} 
                              size={18}
                              color={SIDEBAR_INACTIVE_ICON_COLOR}
                            />
                            <span>{PAGE_NAMES.MY_CREDITS}</span>
                          </Link>
                        </Drawer.Close>
                      </li>
                    </ul>
                  </nav>

                  <div className="mobile-drawer-section">
                    <div className="section-title">{TERMINOLOGY.recentSectionTitle}</div>
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

                  <div className="mobile-drawer-section">
                    <div className="section-title">{PAGE_NAMES.MY_CREDITS}</div>
                    <CreditSummary
                      variant="sidebar"
                      monthlyStats={monthlyStats}
                      loading={isLoadingMonthlyStats}
                    />

                    {/* Priority Credits List */}
                    {prioritizedCredits && prioritizedCredits.length > 0 && (
                      <CreditList
                        credits={convertPrioritizedCreditsToUserCredits(prioritizedCredits)}
                        now={new Date()}
                        cardById={new Map(creditCards.map(card => [card.id, card]))}
                        creditByPair={(() => {
                          const map = new Map();
                          for (const credit of credits) {
                            map.set(`${credit.ReferenceCardId}:${credit.id}`, credit);
                          }
                          return map;
                        })()}
                        variant="sidebar"
                        limit={5}
                        displayPeriod={false}
                      />
                    )}
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


