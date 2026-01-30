import React from 'react';
import ReactDOM from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import { HistoryPanelPreview } from '../HistoryPanel';
import CreditCardPreviewList from '../CreditCardPreviewList';
import CreditSummary from '../CreditSummary';
import CreditList from '../CreditsDisplay/CreditList';
import { convertPrioritizedCreditsToUserCredits } from '../../utils/creditTransformers';
import { useCredits } from '../../contexts/ComponentsContext';
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
  APP_NAME,
  PLAN_DISPLAY_TEXT,
  PAGE_NAMES,
  PAGE_ICONS,
  DROPDOWN_ICONS,
  SIDEBAR_TOGGLE_ICON_COLOR,
  ICON_GRAY,
  TERMINOLOGY,
  PAGES,
  MY_CARDS_IN_ACCOUNT_MENU,
  MY_CARDS_DROPDOWN_LABEL,
  SUBSCRIPTION_PLAN,
  COLORS
} from '../../types';
import { CreditCard } from '../../types/CreditCardTypes';
import { MonthlyStatsResponse, PrioritizedCredit } from '../../types/CardCreditsTypes';
import Icon from '../../icons';
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
  monthlyStats: MonthlyStatsResponse | null;
  isLoadingMonthlyStats: boolean;
  isUpdatingMonthlyStats?: boolean;
  prioritizedCredits: PrioritizedCredit[];
  onRefreshMonthlyStats?: () => void;
  onAddUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  onRemoveUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  isCreditUpdating?: (cardId: string, creditId: string, periodNumber: number) => boolean;
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
  onNewChat,
  monthlyStats,
  isLoadingMonthlyStats,
  isUpdatingMonthlyStats,
  onAddUpdatingCreditId,
  onRemoveUpdatingCreditId,
  isCreditUpdating,
  prioritizedCredits,
  onRefreshMonthlyStats
}) => {
  // Get current location for active state
  const location = useLocation();
  const navigate = useNavigate();

  // Get credits data from context for proper credit matching
  const credits = useCredits();
  
  // Helper function to determine if current path is home or chat route
  const isHomeOrChatRoute = (pathname: string) => {
    // Matches home route
    if (pathname === PAGES.HOME.PATH) return true;
    
    // Matches "/:chatId" route using currentChatId state
    if (currentChatId && pathname === `${PAGES.HOME.PATH}${currentChatId}`) return true;
    
    return false;
  };

  // Helper function to check if a route is active
  const isRouteActive = (routePath: string) => {
    if (routePath === PAGES.HOME.PATH) {
      return isHomeOrChatRoute(location.pathname);
    }
    // Special handling for MY_CREDITS - highlight for all my-credits/* pages
    if (routePath === PAGES.MY_CREDITS.PATH) {
      return location.pathname.startsWith(PAGES.MY_CREDITS.PATH);
    }
    return location.pathname === routePath;
  };

  // Helper function to get the appropriate icon variant based on active state
  const getIconVariant = (iconVariants: any, routePath: string) => {
    if (!iconVariants) {
      // Fallback to a no-op icon renderer to avoid runtime errors during HMR or missing config
      return () => null;
    }
    return isRouteActive(routePath) ? iconVariants.ACTIVE : iconVariants.INACTIVE;
  };

  // Check if current chat has messages to determine if new chat button should be visible
  const shouldShowNewChatButton = () => {
    if (!currentChatId) {
      // No current chat selected, so we're in a "new" state - hide button
      return false;
    }
    
    // Find the current chat in history
    const currentChat = chatHistory.find(chat => chat.chatId === currentChatId);
    if (!currentChat) {
      // Current chat not found in history (new chat) - hide button
      return false;
    }
    
    // Show button if current chat has messages
    return currentChat.conversation && currentChat.conversation.length > 0;
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
    {
      to: PAGES.HOME.PATH,
      name: PAGE_NAMES.HOME,
      icon: () => getIconVariant(PAGE_ICONS.HOME, PAGES.HOME.PATH)({ size: 20 })
    },
    {
      to: PAGES.HISTORY.PATH,
      name: PAGE_NAMES.TRANSACTION_HISTORY,
      icon: () => getIconVariant(PAGE_ICONS.TRANSACTION_HISTORY, PAGES.HISTORY.PATH)({ size: 20 })
    },
    // Only include My Cards in sidebar navigation if not moved to account menu
    ...(!MY_CARDS_IN_ACCOUNT_MENU ? [{
      to: PAGES.MY_CARDS.PATH,
      name: PAGE_NAMES.MY_CARDS,
      icon: () => getIconVariant(PAGE_ICONS.MY_CARDS, PAGES.MY_CARDS.PATH)({ size: 20 })
    }] : []),
    {
      to: PAGES.MY_CREDITS.PATH,
      name: PAGE_NAMES.MY_CREDITS,
      icon: () => getIconVariant(PAGE_ICONS.MY_CREDITS, PAGES.MY_CREDITS.PATH)({ size: 20 })
    }
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
      navigate(PAGES.HOME.PATH);
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
            <Link to={PAGES.HOME.PATH}>
              <img src={PAGE_ICONS.LOGO} alt="Logo" />
              {APP_NAME}
            </Link>
          </h1>
        )}
        {!isOpen && (
          <div className="sidebar-logo">
            <Link 
              to={PAGES.HOME.PATH} 
              className="logo-icon"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <img src={PAGE_ICONS.LOGO} alt="Logo" />
            </Link>
          </div>
        )}
        <div className="sidebar-toggle">
          <button 
            className="button no-outline small icon-gray-hover"
            onClick={onToggle}
            aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <Icon name="sidebar" variant={isOpen ? 'close' : 'open'} color={SIDEBAR_TOGGLE_ICON_COLOR} size={20} />
          </button>
        </div>
      </div>

      {/* Scrollable Middle Section */}
      <div className="sidebar-middle">
        {isOpen ? (
          <>
            {/* Left column - Mini nav icons (always visible and fixed) */}
            <div className="mini-nav-column">
              {/* New Chat Plus Button - Always show in sidebar */}
              <button
                className="button no-outline new-chat-button"
                onClick={handleNewChat}
                onMouseEnter={handleNewChatHover}
                onMouseLeave={() => hideTooltip()}
                aria-label={PAGE_NAMES.NEW_TRANSACTION_CHAT}
              >
                <Icon name="plus-circle" variant="solid" color={COLORS.PRIMARY_COLOR} size={24} />
              </button>

              {miniMiddleNavItems.map((item, index) => {
                const isActive = isRouteActive(item.to);
                return (
                  <Link 
                    key={index}
                    to={item.to} 
                    className={`mini-nav-icon ${isActive ? 'active' : ''}`}
                    onMouseEnter={(e) => handleMiniNavHover(e, item.name)}
                    onMouseLeave={() => hideTooltip()}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {item.icon()}
                  </Link>
                );
              })}
            </div>

            {/* Right column - Expanded content (scrollable) */}
            <div className="expanded-content-column">
              {/* Recent Chats/Transactions (expanded sidebar) */}
              <SidebarItem 
                icon={PAGE_ICONS.TRANSACTION_HISTORY.INACTIVE}
                name={TERMINOLOGY.recentSectionTitle} 
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

              {/* My Cards as SidebarItem - always show card list, navigation icon controlled by MY_CARDS_IN_ACCOUNT_MENU */}
              <SidebarItem
                icon={PAGE_ICONS.MY_CARDS.INACTIVE}
                name={PAGE_NAMES.MY_CARDS}
                isDropdown={true}
              >
                <CreditCardPreviewList
                  cards={creditCards}
                  loading={isLoadingCreditCards}
                  showOnlySelected={true}
                  onCardSelect={onCardSelect}
                  variant="sidebar"
                />
              </SidebarItem>

              {/* My Credits as SidebarItem */}
              <SidebarItem
                icon={PAGE_ICONS.MY_CREDITS.INACTIVE}
                name={PAGE_NAMES.MY_CREDITS}
                isDropdown={true}
              >
                <CreditSummary
                  variant="sidebar"
                  monthlyStats={monthlyStats}
                  loading={isLoadingMonthlyStats}
                  isUpdating={isUpdatingMonthlyStats}
                />

                {/* Priority Credits List */}
                {prioritizedCredits && prioritizedCredits.length > 0 && (
                  (() => {
                    const convertedCredits = convertPrioritizedCreditsToUserCredits(prioritizedCredits);

                    // Create the cardById map from creditCards array
                    const cardById = new Map(creditCards.map(card => [card.id, card]));

                    // Create creditByPair map using the same logic as CreditsDisplay
                    const creditByPair = new Map();
                    for (const credit of credits) {
                      // Use ReferenceCardId to map credits to cards
                      creditByPair.set(`${credit.ReferenceCardId}:${credit.id}`, credit);
                    }

                    return (
                      <CreditList
                        credits={convertedCredits}
                        now={new Date()}
                        cardById={cardById}
                        creditByPair={creditByPair}
                        variant="sidebar"
                        limit={5}
                        displayPeriod={false}
                        onUpdateComplete={onRefreshMonthlyStats}
                        isUpdating={isUpdatingMonthlyStats}
                        onAddUpdatingCreditId={onAddUpdatingCreditId}
                        onRemoveUpdatingCreditId={onRemoveUpdatingCreditId}
                        isCreditUpdating={isCreditUpdating}
                      />
                    );
                  })()
                )}
              </SidebarItem>
            </div>
          </>
        ) : (
          <>
            {/* Collapsed mini-nav content - just icons */}
            <div className="mini-nav-icons">
              {/* New Chat Plus Button - Always show in sidebar */}
              <button
                className="button no-outline new-chat-button"
                onClick={handleNewChat}
                onMouseEnter={handleNewChatHover}
                onMouseLeave={() => hideTooltip()}
                aria-label={PAGE_NAMES.NEW_TRANSACTION_CHAT}
              >
                <Icon name="plus-circle" variant="solid" color={COLORS.PRIMARY_COLOR} size={24} />
              </button>

              {miniMiddleNavItems.map((item, index) => {
                const isActive = isRouteActive(item.to);
                return (
                  <Link 
                    key={index}
                    to={item.to} 
                    className={`mini-nav-icon ${isActive ? 'active' : ''}`}
                    onMouseEnter={(e) => handleMiniNavHover(e, item.name)}
                    onMouseLeave={() => hideTooltip()}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {item.icon()}
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
                          {subscriptionPlan === SUBSCRIPTION_PLAN.FREE ? PLAN_DISPLAY_TEXT.FREE : PLAN_DISPLAY_TEXT.PREMIUM}
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
                <DropdownMenuContent align="end" side="right" sideOffset={20} className="sidebar-profile-dropdown">
                  <Link to={PAGES.ACCOUNT.PATH}>
                    <DropdownMenuItem icon={DROPDOWN_ICONS.MY_ACCOUNT.NORMAL}>
                      {PAGE_NAMES.MY_ACCOUNT}
                    </DropdownMenuItem>
                  </Link>
                  {MY_CARDS_IN_ACCOUNT_MENU && (
                    <Link to={PAGES.MY_CARDS.PATH}>
                      <DropdownMenuItem icon={DROPDOWN_ICONS.MY_CARDS.NORMAL}>
                        {MY_CARDS_DROPDOWN_LABEL}
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <Link to={PAGES.PREFERENCES.PATH}>
                    <DropdownMenuItem icon={DROPDOWN_ICONS.PREFERENCES.NORMAL}>
                      {PAGE_NAMES.PREFERENCES}
                    </DropdownMenuItem>
                  </Link>
                  <Link to={PAGES.HELP_CENTER.PATH}>
                    <DropdownMenuItem icon={DROPDOWN_ICONS.HELP_CENTER.NORMAL}>
                      {PAGE_NAMES.HELP_CENTER}
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={onLogout} className="signout-action" icon={DROPDOWN_ICONS.SIGN_OUT.RED}>
                    {PAGE_NAMES.SIGN_OUT}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="mini-nav-profile">
              {user.photoURL && (
                <>
                  <Link 
                    to={PAGES.PREFERENCES.PATH} 
                    className={`mini-nav-icon ${location.pathname === PAGES.PREFERENCES.PATH ? 'active' : ''}`}
                    onMouseEnter={(e) => handleMiniNavHover(e, PAGE_NAMES.PREFERENCES)}
                    onMouseLeave={() => hideTooltip()}
                    style={{ textDecoration: 'none', color: 'inherit'}}
                  >
                    {getIconVariant(PAGE_ICONS.PREFERENCES, PAGES.PREFERENCES.PATH)({ size: 20 })}
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
                      <Link to={PAGES.ACCOUNT.PATH}>
                        <DropdownMenuItem icon={DROPDOWN_ICONS.MY_ACCOUNT.NORMAL}>
                          {PAGE_NAMES.MY_ACCOUNT}
                        </DropdownMenuItem>
                      </Link>
                      {MY_CARDS_IN_ACCOUNT_MENU && (
                        <Link to={PAGES.MY_CARDS.PATH}>
                          <DropdownMenuItem icon={DROPDOWN_ICONS.MY_CARDS.NORMAL}>
                            Manage Cards
                          </DropdownMenuItem>
                        </Link>
                      )}
                      <Link to={PAGES.HELP_CENTER.PATH}>
                        <DropdownMenuItem icon={DROPDOWN_ICONS.HELP_CENTER.NORMAL}>
                          {PAGE_NAMES.HELP_CENTER}
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem onClick={onLogout} className="signout-action" icon={DROPDOWN_ICONS.SIGN_OUT.RED}>
                        {PAGE_NAMES.SIGN_OUT}
                      </DropdownMenuItem>
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
