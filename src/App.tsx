import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { APP_NAME, PAGE_NAMES, PAGE_ICONS, ShowCompletedOnlyPreference, ICON_PRIMARY_MEDIUM, PAGES, PageUtils, MOBILE_BREAKPOINT } from './types';
import { Icon } from './icons';
// Services
import {
  CardService,
  UserService,
  UserCreditCardService,
  UserHistoryService,
  UserPreferencesService,
  UserCreditService,
  ComponentService
} from './services';

// Styles
import './App.scss';
import './components/PromptWindow/PromptWindow.scss';

// Pages
import Account from './pages/account/Account';
import DeleteHistory from './pages/delete-history/DeleteHistory';
import Preferences from './pages/preferences/Preferences';
import SignIn from './pages/authentication/SignIn';
import SignUp from './pages/authentication/SignUp';
import ForgotPassword from './pages/authentication/ForgotPassword';
import Welcome from './pages/authentication/Welcome';
import History from './pages/history/History';
import MyCards from './pages/my-cards/MyCards';
import HistoryHelpModal from './pages/history/HistoryHelpModal';
import MyCardsHelpModal from './pages/my-cards/MyCardsHelpModal';
import PreferencesHelpModal from './pages/preferences/PreferencesHelpModal';
import MyCreditsHelpModal from './pages/my-credits/MyCreditsHelpModal';
import MyCredits from './pages/my-credits/MyCredits';
import CreditsHistory from './pages/my-credits/history/CreditsHistory';
// Components

import AppSidebar from './components/AppSidebar';
import PromptWindow from './components/PromptWindow';
import CreditCardSelector, { CreditCardSelectorRef } from './components/CreditCardSelector';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from './components/ui/dialog/dialog';
import ProtectedRoute from './context/ProtectedRoute';
import RedirectIfAuthenticated from './context/RedirectIfAuthenticated';
import { ComponentsProvider, useComponents } from './contexts/ComponentsContext';
import CreditCardDetailView from './components/CreditCardDetailView';
import UniversalContentWrapper from './components/UniversalContentWrapper';
import PromptHelpModal from './components/PromptWindow/PromptHelpModal';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from './components/ui/drawer';
import PageHeader from './components/PageHeader';
import MobileHeader from './components/MobileHeader';
import { InfoDisplay, SearchField } from './elements';

// Context
import { useAuth } from './context/AuthContext';

// Hooks
import { usePageBackground } from './hooks/usePageBackground';
import { useViewportHeight } from './hooks/useViewportHeight';

// Constants and Types
import { 
  GLOBAL_QUICK_HISTORY_SIZE, 
  CHAT_HISTORY_PREFERENCE, 
  SUBSCRIPTION_PLAN,
  LOADING_ICON,
  LOADING_ICON_SIZE,
  Conversation,  
  CardDetailsList, 
  ChatHistoryPreference,
  InstructionsPreference,
  SubscriptionPlan 
} from './types';

// Types
import { 
  CreditCard, 
  CreditCardDetails 
} from './types/CreditCardTypes';
import { UserCreditsTrackingPreferences } from './types/CardCreditsTypes';
import { FullHeightContext } from './hooks/useFullHeight';
import { ScrollHeightContext } from './hooks/useScrollHeight';

const quick_history_size = GLOBAL_QUICK_HISTORY_SIZE;

interface AppContentProps {}

function AppContent({}: AppContentProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Enable dynamic page background colors
  usePageBackground();
  // Ensure iOS Safari uses visible viewport height
  useViewportHeight();

  // State for managing credit cards in the application
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [isLoadingCreditCards, setIsLoadingCreditCards] = useState<boolean>(true);
  // State for loading transaction history
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  // State for storing user's basic card details (for PromptWindow)
  const [userCardDetails, setUserCardDetails] = useState<CardDetailsList>([]);
  // State for storing user's detailed card details (for modal view)
  const [userDetailedCardDetails, setUserDetailedCardDetails] = useState<CreditCardDetails[]>([]);
  // State for storing selected card details for modal view
  const [selectedCardDetails, setSelectedCardDetails] = useState<CreditCardDetails | null>(null);
  // State for loading card details
  const [isLoadingCardDetails, setIsLoadingCardDetails] = useState<boolean>(false);
  // State for storing user's credit tracking preferences
  const [trackingPreferences, setTrackingPreferences] = useState<UserCreditsTrackingPreferences | null>(null);
  // State for storing chat history/conversations
  const [chatHistory, setChatHistory] = useState<Conversation[]>([]);
  // State for tracking the current active chat ID
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  // State to trigger history refresh when needed
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState<number>(0);
  // State to track the last update timestamp for chat history
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<string | null>(null);
  // State to trigger chat clearing functionality
  const [clearChatCallback, setClearChatCallback] = useState<number>(0);
  // State for storing user preferences instructions
  const [preferencesInstructions, setPreferencesInstructions] = useState<InstructionsPreference>('');
  // State for managing chat history preference (keep/clear)
  const [chatHistoryPreference, setChatHistoryPreference] = useState<ChatHistoryPreference>(CHAT_HISTORY_PREFERENCE.KEEP_HISTORY);
  // State for managing show completed only preference
  const [showCompletedOnlyPreference, setShowCompletedOnlyPreference] = useState<ShowCompletedOnlyPreference>(false);
  // State for tracking user's subscription plan
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLAN.FREE);
  // State for managing side panel visibility with localStorage persistence
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem('sidePanelOpen');
    return stored !== null ? JSON.parse(stored) : true; // Default to open
  });
  // State for managing full height behavior
  const [needsFullHeight, setNeedsFullHeight] = useState<boolean>(false);
  // State for managing scroll height behavior
  const [_needsScrollHeight, setNeedsScrollHeight] = useState<boolean>(false);

  const [isCardSelectorOpen, setIsCardSelectorOpen] = useState(false);
  const [isCardDetailsOpen, setIsCardDetailsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [cardSelectorSaveStatus, setCardSelectorSaveStatus] = useState<string>('');
  const [cardSelectorSaveSuccess, setCardSelectorSaveSuccess] = useState<boolean>(false);
  const [cardsVersion, setCardsVersion] = useState<number>(0);
  const [isSavingCards, setIsSavingCards] = useState(false);
  const [cardSelectorSearchTerm, setCardSelectorSearchTerm] = useState<string>('');
  const resetCardSelectorUI = () => {
    setCardSelectorSearchTerm('');
    setCardSelectorSaveStatus('');
    setCardSelectorSaveSuccess(false);
  };
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
  });
  // Local feature flags controlling drawer vs dialog
  const USE_DRAWER_FOR_CARD_DETAILS_DESKTOP = true;
  const USE_DRAWER_FOR_CARD_DETAILS_MOBILE = true;
  
  const creditCardSelectorRef = useRef<CreditCardSelectorRef>(null);

  // Effect to reset current chat ID when user changes
  useEffect(() => {
    setCurrentChatId(null);
  }, [user]);

  // Effect to handle navigation when on root path with active chat
  useEffect(() => {
    if (location.pathname === PAGES.HOME.PATH && currentChatId) {
      navigate(`${PAGES.HOME.PATH}${currentChatId}`, { replace: true });
    }
  }, [location.pathname, currentChatId, navigate]);

  // Close Help dialog on route change for better UX
  useEffect(() => {
    if (isHelpOpen) {
      setIsHelpOpen(false);
    }
  }, [location.pathname]);

  // Ref to prevent duplicate initial loads
  const isLoadingRef = useRef(false);

  // Effect to fetch all initial data in parallel batches when user is authenticated
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) {
        // Reset all states when user is not authenticated
        setCreditCards([]);
        setTrackingPreferences(null);
        setUserCardDetails([]);
        setUserDetailedCardDetails([]);
        setChatHistory([]);
        setSubscriptionPlan(SUBSCRIPTION_PLAN.FREE);
        setPreferencesInstructions('');
        setChatHistoryPreference(CHAT_HISTORY_PREFERENCE.KEEP_HISTORY);
        setShowCompletedOnlyPreference(false);
        setIsLoadingCreditCards(false);
        setIsLoadingHistory(false);
        isLoadingRef.current = false;
        return;
      }

      // Prevent duplicate loads
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

      setIsLoadingCreditCards(true);
      setIsLoadingHistory(true);

      try {
        // Batch 1: Critical data that's needed immediately (parallel)
        const [cards, subscriptionPlan] = await Promise.all([
          CardService.fetchCreditCards(true),
          UserService.fetchUserSubscriptionPlan().catch(error => {
            console.error('Error fetching subscription plan:', error);
            return SUBSCRIPTION_PLAN.FREE; // Default to free on error
          })
        ]);

        setCreditCards(cards);
        setSubscriptionPlan(subscriptionPlan);

        // Batch 2: User preferences and tracking data (parallel)
        const [trackingPrefs, allPreferences] = await Promise.all([
          UserCreditService.fetchCreditTrackingPreferences().catch(error => {
            console.error('Error fetching credit tracking preferences:', error);
            return { Cards: [] }; // Return empty preferences if fetch fails
          }),
          UserPreferencesService.loadAllPreferences().catch(error => {
            console.error('Error fetching user preferences:', error);
            return {
              success: false,
              instructions: '',
              chatHistory: 'keep_history' as ChatHistoryPreference,
              showCompletedOnly: false
            };
          })
        ]);

        setTrackingPreferences(trackingPrefs);
        setPreferencesInstructions(allPreferences.instructions || '');
        setChatHistoryPreference(allPreferences.chatHistory);
        setShowCompletedOnlyPreference(allPreferences.showCompletedOnly);

        // Batch 3: Card details and chat history with priority loading
        const quick_history_size = GLOBAL_QUICK_HISTORY_SIZE;

        // Extract chatId from URL if present (priority loading)
        const currentPath = location.pathname;
        const urlChatId = currentPath !== PAGES.HOME.PATH && PageUtils.isPage(currentPath, 'HOME')
          ? currentPath.slice(1) // Remove leading slash
          : null;

        // Prepare parallel requests
        const requests = [
          UserCreditCardService.fetchUserCardDetails().catch(error => {
            console.error('Error fetching user card details:', error);
            return [];
          }),
          UserCreditCardService.fetchUserCardsDetailedInfo().catch(error => {
            console.error('Error fetching user detailed card info:', error);
            return [];
          })
        ];

        // If there's a specific chat in the URL, prioritize loading it
        if (urlChatId) {
          requests.push(
            UserHistoryService.fetchChatHistoryById(urlChatId).catch(error => {
              console.error('Error fetching priority chat:', error);
              return null;
            }),
            UserHistoryService.fetchChatHistoryPreview(quick_history_size).catch(error => {
              console.error('Error fetching chat history preview:', error);
              return { chatHistory: [] };
            })
          );

          const [basicDetails, detailedInfo, priorityChat, historyResponse] = await Promise.all(requests);

          setUserCardDetails(basicDetails);
          setUserDetailedCardDetails(detailedInfo);

          // Build chat history with priority chat first
          const chatHistoryList = historyResponse.chatHistory || [];
          if (priorityChat && !chatHistoryList.find(chat => chat.chatId === urlChatId)) {
            chatHistoryList.unshift(priorityChat);
          }

          setChatHistory(chatHistoryList);
          // Set the current chat ID immediately for faster loading
          setCurrentChatId(urlChatId);
        } else {
          // Regular loading without priority chat
          requests.push(
            UserHistoryService.fetchChatHistoryPreview(quick_history_size).catch(error => {
              console.error('Error fetching chat history preview:', error);
              return { chatHistory: [] };
            })
          );

          const [basicDetails, detailedInfo, historyResponse] = await Promise.all(requests);

          setUserCardDetails(basicDetails);
          setUserDetailedCardDetails(detailedInfo);
          setChatHistory(historyResponse.chatHistory);
        }

        setLastUpdateTimestamp(new Date().toISOString());

      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoadingCreditCards(false);
        setIsLoadingHistory(false);
        isLoadingRef.current = false;
      }
    };

    loadInitialData();
  }, [user, cardsVersion]); // Refresh when user changes or cards version changes

  // Update current chat ID when URL changes (no API calls here)
  useEffect(() => {
    const currentPath = location.pathname;
    const urlChatId = currentPath !== PAGES.HOME.PATH && PageUtils.isPage(currentPath, 'HOME')
      ? currentPath.slice(1) // Remove leading slash
      : null;

    setCurrentChatId(urlChatId);
  }, [location.pathname]);

  // Track viewport size to decide drawer vs dialog flags
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      // Support initial call with MediaQueryList and subsequent events
      const matches = 'matches' in e ? e.matches : (e as MediaQueryList).matches;
      setIsMobileViewport(matches);
    };
    // Initial
    handleChange(mediaQuery);
    // Subscribe
    try {
      mediaQuery.addEventListener('change', handleChange as (ev: Event) => void);
    } catch {
      // Safari
      // @ts-ignore
      mediaQuery.addListener(handleChange);
    }
    return () => {
      try {
        mediaQuery.removeEventListener('change', handleChange as (ev: Event) => void);
      } catch {
        // Safari
        // @ts-ignore
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Effect to handle history refresh triggers (for updates from other components)
  useEffect(() => {
    const refreshHistory = async () => {
      if (!user || historyRefreshTrigger === 0) return;

      setIsLoadingHistory(true);
      try {
        const response = await UserHistoryService.fetchChatHistoryPreview(GLOBAL_QUICK_HISTORY_SIZE);

        setChatHistory(response.chatHistory);
        setLastUpdateTimestamp(new Date().toISOString());
      } catch (error) {
        console.error('Error refreshing chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    refreshHistory();
  }, [historyRefreshTrigger, chatHistoryPreference, showCompletedOnlyPreference]);

  // Function to update credit cards and refresh user card details
  const getCreditCards = async (returnCreditCards: CreditCard[]): Promise<void> => {
    setCreditCards(returnCreditCards);
    
    // After updating credit cards, fetch fresh user card details
    if (user) {
      try {
        const details = await UserCreditCardService.fetchUserCardsDetailedInfo();
        setUserDetailedCardDetails(details);
      } catch (error) {
        console.error('Error fetching updated user card details:', error);
      }
    }
  };

  // Function to refresh tracking preferences when they're updated
  const refreshTrackingPreferences = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const preferences = await UserCreditService.fetchCreditTrackingPreferences();
      setTrackingPreferences(preferences);
    } catch (error) {
      console.error('Error refreshing credit tracking preferences:', error);
    }
  };


  // Function to update current chat ID
  const getCurrentChatId = (returnCurrentChatId: string | null): void => {
    setCurrentChatId(returnCurrentChatId);
  };

  // Function to handle user logout and reset all states
  const handleLogout = async (): Promise<void> => {
    // Reset all states to their initial values
    setUserCardDetails([]);
    setUserDetailedCardDetails([]);
    setTrackingPreferences(null);
    setCurrentChatId(null);
    setChatHistory([]);
    setCreditCards([]);
    setIsLoadingCreditCards(false);
    setIsLoadingHistory(false);
    setIsCardSelectorOpen(false);
    setIsCardDetailsOpen(false);
    setHistoryRefreshTrigger(0);
    setLastUpdateTimestamp(null);
    setClearChatCallback(0);
    setPreferencesInstructions('');
    setChatHistoryPreference(CHAT_HISTORY_PREFERENCE.KEEP_HISTORY);
    setShowCompletedOnlyPreference(false);
    
    // Perform logout and navigation
    await logout();
    navigate(PAGES.SIGN_IN.PATH);
  };

  // Function to handle chat history updates and deletions
  const handleHistoryUpdate = async (updatedChat: Conversation | ((prevHistory: Conversation[]) => Conversation[])): Promise<void> => {
    // Return early if updatedChat is undefined
    if (!updatedChat) return;

    // If updatedChat is a function, it's a delete operation
    if (typeof updatedChat === 'function') {
      setChatHistory(updatedChat);  // Apply the filter function directly
      handleClearChat();
    } else {
      // Handle normal chat updates
      setChatHistory(prevHistory => {
        const newHistory = [...prevHistory];
        const existingIndex = newHistory.findIndex(chat => chat.chatId === updatedChat.chatId);

        if (existingIndex !== -1) {
          newHistory[existingIndex] = {
            ...updatedChat,
            chatDescription: updatedChat.chatDescription || newHistory[existingIndex].chatDescription,
          };
        } else {
          newHistory.unshift(updatedChat);
        }

        return newHistory;
      });
    }

    setLastUpdateTimestamp(new Date().toISOString());
    setHistoryRefreshTrigger(prev => prev + 1);
  };

  // Function to trigger chat clearing
  const handleClearChat = (): void => {
    // Increment the callback counter to trigger a clear
    setClearChatCallback(prev => prev + 1);
  };

  // Function to handle card selection for details view
  const handleCardSelect = async (card: CreditCard) => {
    setIsLoadingCardDetails(true);
    try {
      const details = userDetailedCardDetails.find(detail => detail.id === card.id);
      if (details) {
        setSelectedCardDetails(details);
        setIsCardDetailsOpen(true);
      }
    } catch (error) {
      console.error('Error loading card details:', error);
    } finally {
      setIsLoadingCardDetails(false);
    }
  };

  // Function to handle saving credit card selections
  const handleSaveCardSelections = async () => {
    if (!creditCardSelectorRef.current) return;
    
    setIsSavingCards(true);
    setCardSelectorSaveStatus('');
    setCardSelectorSaveSuccess(false);
    
    try {
      await creditCardSelectorRef.current.handleSave();
    } catch (error) {
      console.error('Error saving card selections:', error);
    } finally {
      setIsSavingCards(false);
    }
  };

  // Function to handle save completion from CreditCardSelector
  const handleCardSelectorSaveComplete = (success: boolean, message: string) => {
    setCardSelectorSaveStatus(message);
    setCardSelectorSaveSuccess(success);
    if (success) {
      // Refresh global cards and bump version to trigger dependents
      (async () => {
        try {
          const cards = await CardService.fetchCreditCards(true);
          setCreditCards(cards);
          setCardsVersion(v => v + 1);
        } catch (err) {
          console.error('Error refreshing cards after save:', err);
        }
      })();
    }
  };

  const createTitle = (suffix?: string) => {
    return suffix ? APP_NAME + ' - ' + suffix : APP_NAME;
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const pageTitle = PageUtils.getTitleByPath(path);
    return pageTitle ? createTitle(pageTitle) : createTitle();
  };

  // Effect to persist side panel state to localStorage
  useEffect(() => {
    localStorage.setItem('sidePanelOpen', JSON.stringify(isSidePanelOpen));
  }, [isSidePanelOpen]);

  // Function to toggle side panel
  const toggleSidePanel = () => {
    setIsSidePanelOpen(prev => !prev);
  };

  const shouldShowMobileHelp = (): boolean => {
    const path = location.pathname;
    if (PageUtils.isPage(path, 'HOME')) return true;
    if (path === PAGES.HISTORY.PATH) return true;
    if (path === PAGES.MY_CARDS.PATH) return true;
    if (path === PAGES.PREFERENCES.PATH) return true;
    if (path === PAGES.MY_CREDITS.PATH) return true;
    return false;
  };

  const renderGlobalHelpContent = (): React.ReactNode => {
    const path = location.pathname;
    if (PageUtils.isPage(path, 'HOME')) {
      return <PromptHelpModal />;
    }
    if (path === PAGES.HISTORY.PATH) {
      return <HistoryHelpModal />;
    }
    if (path === PAGES.MY_CARDS.PATH) {
      return <MyCardsHelpModal />;
    }
    if (path === PAGES.PREFERENCES.PATH) {
      return <PreferencesHelpModal />;
    }
    if (path === PAGES.MY_CREDITS.PATH) {
      return <MyCreditsHelpModal />;
    }
    return null;
  };

  const renderMainContent = () => {
    const hasSelectedCards = Array.isArray(creditCards)
      ? creditCards.some((c: any) => c && c.selected === true)
      : false;
    const isNewChat = !currentChatId;

    // Button logic:
    // - No cards + new chat = Add Cards
    // - No cards + not new chat = Add Cards
    // - Has cards + new chat = No button
    // - Has cards + not new chat = New Chat
    const shouldShowAddCards = !hasSelectedCards;
    const shouldShowNewChat = hasSelectedCards && !isNewChat;

    const headerActions = (
      <>
        {shouldShowAddCards ? (
          <button
            className="button ghost small icon with-text"
            onClick={() => setIsCardSelectorOpen(true)}
            aria-label="Add cards"
          >
            <Icon name="card" variant="mini" color={ICON_PRIMARY_MEDIUM} size={16} />
            Add Cards
          </button>
        ) : shouldShowNewChat ? (
          <button
            className="button ghost small icon with-text"
            onClick={handleClearChat}
            aria-label={PAGE_NAMES.NEW_TRANSACTION_CHAT}
          >
            <Icon name="chat-bubble" variant="micro" color={ICON_PRIMARY_MEDIUM} size={16} />
            {PAGE_NAMES.NEW_TRANSACTION_CHAT}
          </button>
        ) : null}
      </>
    );

    return (
      <div className="home-wrapper">
        <PageHeader 
          title={PAGE_NAMES.HOME}
          icon={PAGE_ICONS.HOME.MINI}
          actions={headerActions}
          withActions={true}
          showHelpButton={true}
          onHelpClick={() => setIsHelpOpen(true)}
        />
        <div className="app-content">
          <div className="prompt-window-container">
            <PromptWindow
              creditCards={creditCards}
              userCardDetails={userCardDetails}
              user={user}
              returnCurrentChatId={getCurrentChatId}
              onHistoryUpdate={handleHistoryUpdate}
              clearChatCallback={clearChatCallback}
              setClearChatCallback={setClearChatCallback}
              existingHistoryList={chatHistory}
              preferencesInstructions={preferencesInstructions}
              chatHistoryPreference={chatHistoryPreference}
              isLoadingHistory={isLoadingHistory}
            />
          </div>
        </div>

        {/* Home help handled by global help dialog below */}
      </div>
    );
  };

  return (
    <FullHeightContext.Provider value={{ setFullHeight: setNeedsFullHeight }}>
      <ScrollHeightContext.Provider value={{ setScrollHeight: setNeedsScrollHeight }}>
        <div className="app">
          <Helmet>
            <title>{getPageTitle()}</title>
          </Helmet>
          
          
          {/* Universal Sidebar - shown on all pages when user is authenticated */}
          {user && (
            <AppSidebar 
              isOpen={isSidePanelOpen}
              onToggle={toggleSidePanel}
              chatHistory={chatHistory}
              currentChatId={currentChatId}
              onCurrentChatIdChange={getCurrentChatId}
              onHistoryUpdate={handleHistoryUpdate}
              subscriptionPlan={subscriptionPlan}
              creditCards={creditCards}
              historyRefreshTrigger={historyRefreshTrigger}
              isLoadingCreditCards={isLoadingCreditCards}
              isLoadingHistory={isLoadingHistory}
              onCardSelect={handleCardSelect}
              quickHistorySize={quick_history_size}
              user={user}
              onLogout={handleLogout}
              onNewChat={handleClearChat}
            />
          )}
          {(() => {
            const authPaths = new Set<string>([PAGES.SIGN_IN.PATH, PAGES.SIGN_UP.PATH, PAGES.FORGOT_PASSWORD.PATH]);
            const isAuthRoute = authPaths.has(location.pathname);
            const mobileHeaderTitle = PageUtils.getTitleByPath(location.pathname) || APP_NAME;
            // Render mobile header for authenticated, non-auth routes. CSS shows it only under ${MOBILE_BREAKPOINT}px.
            return user && !isAuthRoute ? (
              <MobileHeader 
                title={mobileHeaderTitle}
                showHelpButton={shouldShowMobileHelp()}
                onHelpClick={() => setIsHelpOpen(true)}
                onLogout={handleLogout}
                chatHistory={chatHistory}
                currentChatId={currentChatId}
                onCurrentChatIdChange={getCurrentChatId}
                onHistoryUpdate={handleHistoryUpdate}
                subscriptionPlan={subscriptionPlan}
                creditCards={creditCards}
                isLoadingCreditCards={isLoadingCreditCards}
                isLoadingHistory={isLoadingHistory}
                onCardSelect={handleCardSelect}
                quickHistorySize={quick_history_size}
                user={user}
                onNewChat={handleClearChat}
                onOpenCardSelector={() => setIsCardSelectorOpen(true)}
              />
            ) : null;
          })()}

          {/* Global contextual Help Dialog for mobile and desktop */}
          <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Help</DialogTitle>
              </DialogHeader>
              <DialogBody>
                {renderGlobalHelpContent()}
              </DialogBody>
            </DialogContent>
          </Dialog>
          
          {(() => {
            if (isMobileViewport) {
              return (
                <Drawer open={isCardSelectorOpen} onOpenChange={(open) => {
                  if (!open) {
                    resetCardSelectorUI();
                  }
                  setIsCardSelectorOpen(open);
                }} direction="bottom">
                  <DrawerContent className="mobile-card-selector-drawer" fitContent maxHeight="80vh">
                    <DrawerTitle className="sr-only">Select Your Credit Cards</DrawerTitle>
                    <div className="dialog-header drawer-sticky-header">
                      <h2>Select Your Credit Cards</h2>
                      <div className="search-container" style={{ marginTop: 6 }}>
                        <SearchField
                          type="text"
                          placeholder="Search cards..."
                          value={cardSelectorSearchTerm}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardSelectorSearchTerm(e.target.value)}
                          disabled={isSavingCards}
                        />
                      </div>
                    </div>
                    <div className="dialog-body" style={{ overflowY: 'auto', minHeight: 0 }}>
                      <CreditCardSelector
                        ref={creditCardSelectorRef}
                        returnCreditCards={getCreditCards}
                        existingCreditCards={creditCards}
                        showSaveButton={false}
                        onSaveComplete={handleCardSelectorSaveComplete}
                        isSaving={isSavingCards}
                        hideInternalSearch={true}
                        externalSearchTerm={cardSelectorSearchTerm}
                        onExternalSearchTermChange={setCardSelectorSearchTerm}
                      />
                    </div>
                    <div className="dialog-footer">
                      {cardSelectorSaveStatus && (
                        <InfoDisplay
                          type={cardSelectorSaveSuccess ? 'success' : 'error'}
                          message={cardSelectorSaveStatus}
                        />
                      )}
                      <div className="button-group">
                        <button
                          className={`button ${isSavingCards ? 'loading icon with-text' : ''}`}
                          onClick={handleSaveCardSelections}
                          disabled={isSavingCards}
                        >
                          {isSavingCards && <LOADING_ICON size={LOADING_ICON_SIZE} />}
                          {isSavingCards ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          className={`button outline ${isSavingCards ? 'disabled' : ''}`}
                          onClick={() => {
                            resetCardSelectorUI();
                            setIsCardSelectorOpen(false);
                          }}
                          disabled={isSavingCards}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              );
            }
            return (
              <Dialog open={isCardSelectorOpen} onOpenChange={(open) => {
                if (!open) {
                  resetCardSelectorUI();
                }
                setIsCardSelectorOpen(open);
              }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select Your Credit Cards</DialogTitle>
                  </DialogHeader>
                  <DialogBody>
                    <CreditCardSelector 
                      ref={creditCardSelectorRef}
                      returnCreditCards={getCreditCards} 
                      existingCreditCards={creditCards}
                      showSaveButton={false}
                      onSaveComplete={handleCardSelectorSaveComplete}
                      isSaving={isSavingCards}
                    />
                  </DialogBody>
                  <DialogFooter>
                    {cardSelectorSaveStatus && (
                      <InfoDisplay
                        type={cardSelectorSaveSuccess ? 'success' : 'error'}
                        message={cardSelectorSaveStatus}
                      />
                    )}
                    <div className="button-group">
                      <button
                        className={`button ${isSavingCards ? 'loading icon with-text' : ''}`}
                        onClick={handleSaveCardSelections}
                        disabled={isSavingCards}
                      >
                        {isSavingCards && <LOADING_ICON size={LOADING_ICON_SIZE} />}
                        {isSavingCards ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        className={`button outline ${isSavingCards ? 'disabled' : ''}`}
                        onClick={() => {
                          resetCardSelectorUI();
                          setIsCardSelectorOpen(false);
                        }}
                        disabled={isSavingCards}
                      >
                        Cancel
                      </button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            );
          })()}

          {(() => {
            const useDrawerForCardDetails = isMobileViewport
              ? USE_DRAWER_FOR_CARD_DETAILS_MOBILE
              : USE_DRAWER_FOR_CARD_DETAILS_DESKTOP;
            if (useDrawerForCardDetails) {
              return (
                <Drawer open={isCardDetailsOpen} onOpenChange={setIsCardDetailsOpen} direction="bottom">
                  <DrawerContent fitContent maxHeight="80vh">
                    <DrawerHeader>
                      <DrawerTitle className="sr-only">
                        {selectedCardDetails ? selectedCardDetails.CardName : 'Card Details'}
                      </DrawerTitle>
                    </DrawerHeader>
                    <div className="dialog-body">
                      <CreditCardDetailView 
                        cardDetails={selectedCardDetails}
                        isLoading={isLoadingCardDetails}
                      />
                    </div>
                  </DrawerContent>
                </Drawer>
              );
            }
            return (
              <Dialog open={isCardDetailsOpen} onOpenChange={setIsCardDetailsOpen}>
                <DialogContent fullScreen>
                  <DialogHeader>
                    <DialogTitle className="sr-only">
                      {selectedCardDetails ? selectedCardDetails.CardName : 'Card Details'}
                    </DialogTitle>
                  </DialogHeader>
                  <DialogBody>
                    <CreditCardDetailView 
                      cardDetails={selectedCardDetails}
                      isLoading={isLoadingCardDetails}
                    />
                  </DialogBody>
                </DialogContent>
              </Dialog>
            );
          })()}
          
          {(() => {
            const authPaths = new Set<string>([PAGES.SIGN_IN.PATH, PAGES.SIGN_UP.PATH, PAGES.FORGOT_PASSWORD.PATH]);
            const isAuthRoute = authPaths.has(location.pathname);
            return (
              <UniversalContentWrapper 
                isSidePanelOpen={user ? isSidePanelOpen : false}
                fullHeight={isAuthRoute ? true : needsFullHeight}
                className={isAuthRoute ? 'center-content' : ''}
                disableSidebarMargin={isAuthRoute}
              >
                <Routes>
                  <Route path={PAGES.HOME.PATH} element={
                    <ProtectedRoute>
                      {renderMainContent()}
                    </ProtectedRoute>
                  } />
                  <Route path={PAGES.HOME.DYNAMIC_PATH} element={
                    <ProtectedRoute>
                      {renderMainContent()}
                    </ProtectedRoute>
                  } />
                  <Route path={PAGES.PREFERENCES.PATH} element={
                    <ProtectedRoute>
                      <Preferences 
                        preferencesInstructions={preferencesInstructions}
                        setPreferencesInstructions={setPreferencesInstructions}
                        chatHistoryPreference={chatHistoryPreference}
                        setChatHistoryPreference={(preference: ChatHistoryPreference) => setChatHistoryPreference(preference)}
                        showCompletedOnlyPreference={showCompletedOnlyPreference}
                        setShowCompletedOnlyPreference={(preference: ShowCompletedOnlyPreference) => setShowCompletedOnlyPreference(preference)}
                      />
                    </ProtectedRoute>
                  } />
                  <Route path={PAGES.SIGN_IN.PATH} element={
                    <RedirectIfAuthenticated>
                      <SignIn />
                    </RedirectIfAuthenticated>
                  } />
                  <Route path={PAGES.FORGOT_PASSWORD.PATH} element={
                    <RedirectIfAuthenticated>
                      <ForgotPassword />
                    </RedirectIfAuthenticated>
                  } />
                  <Route path={PAGES.SIGN_UP.PATH} element={
                    <RedirectIfAuthenticated>
                      <SignUp />
                    </RedirectIfAuthenticated>
                  } />
                  <Route path={PAGES.WELCOME.PATH} element={
                    <ProtectedRoute>
                      <Welcome onModalOpen={() => setIsCardSelectorOpen(true)} />
                    </ProtectedRoute>
                  } />
                  <Route path={PAGES.MY_CREDITS.PATH} element={
                    <ProtectedRoute>
                      <MyCredits />
                    </ProtectedRoute>
                  } />
                  <Route path={PAGES.MY_CREDITS_HISTORY.PATH} element={
                    <ProtectedRoute>
                      <CreditsHistory
                        userCardDetails={userDetailedCardDetails}
                        reloadTrigger={cardsVersion}
                      />
                    </ProtectedRoute>
                  } />
                  <Route path={PAGES.ACCOUNT.PATH} element={
                    <ProtectedRoute>
                      <Account subscriptionPlan={subscriptionPlan}
                      />
                    </ProtectedRoute>
                  } />
                  <Route path={PAGES.HISTORY.PATH} element={
                    <History 
                      existingHistoryList={chatHistory}
                      currentChatId={currentChatId}
                      returnCurrentChatId={getCurrentChatId}
                      onHistoryUpdate={handleHistoryUpdate}
                      subscriptionPlan={subscriptionPlan}
                      creditCards={creditCards}
                      historyRefreshTrigger={historyRefreshTrigger}
                      showCompletedOnlyPreference={showCompletedOnlyPreference}
                    />
                  } />
                  <Route path={PAGES.MY_CARDS.PATH} element={
                    <ProtectedRoute>
                      <MyCards 
                        onCardsUpdate={getCreditCards} 
                        onOpenCardSelector={() => setIsCardSelectorOpen(true)} 
                        reloadTrigger={cardsVersion}
                        onPreferencesUpdate={refreshTrackingPreferences}
                      />
                    </ProtectedRoute>
                  } />
                  <Route path={PAGES.DELETE_HISTORY.PATH} element={
                    <ProtectedRoute>
                      <DeleteHistory 
                        setChatHistory={setChatHistory}
                        setHistoryRefreshTrigger={setHistoryRefreshTrigger}
                      />
                    </ProtectedRoute>
                  } />
                </Routes>
              </UniversalContentWrapper>
            );
          })()}
        </div>
      </ScrollHeightContext.Provider>
    </FullHeightContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <HelmetProvider>
        <ComponentsProvider autoFetch={true}>
          <AppContent />
        </ComponentsProvider>
      </HelmetProvider>
    </Router>
  );
}

export default App;
