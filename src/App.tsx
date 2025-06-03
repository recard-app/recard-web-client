import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { APP_NAME, PAGE_NAMES, ShowCompletedOnlyPreference } from './types';
// Services
import { 
  CardService, 
  UserService, 
  UserCreditCardService, 
  UserHistoryService, 
  UserPreferencesService 
} from './services';

// Styles
import './App.scss';
import './components/PromptWindow/PromptWindow.scss';

// Pages
import Account from './pages/account/Account';
import Preferences from './pages/preferences/Preferences';
import SignIn from './pages/authentication/SignIn';
import SignUp from './pages/authentication/SignUp';
import ForgotPassword from './pages/authentication/ForgotPassword';
import Welcome from './pages/authentication/Welcome';
import History from './pages/history/History';
import MyCards from './pages/my-cards/MyCards';
// Components
import AppHeader from './components/AppHeader';
import AppSidebar from './components/AppSidebar';
import PromptWindow from './components/PromptWindow';
import CreditCardSelector from './components/CreditCardSelector';
import { Modal, useModal } from './components/Modal';
import ProtectedRoute from './context/ProtectedRoute';
import RedirectIfAuthenticated from './context/RedirectIfAuthenticated';
import CreditCardDetailView from './components/CreditCardDetailView';
import UniversalContentWrapper from './components/UniversalContentWrapper';
import PromptHelpModal from './components/PromptWindow/PromptHelpModal';
import PageHeader from './components/PageHeader';

// Context
import { useAuth } from './context/AuthContext';

// Constants and Types
import { 
  GLOBAL_QUICK_HISTORY_SIZE, 
  CHAT_HISTORY_PREFERENCE, 
  SUBSCRIPTION_PLAN,
  TEMP_ICON,
  Conversation,  
  CardDetailsList, 
  ChatHistoryPreference, 
  InstructionsPreference, 
  PagedHistoryResponse,
  HistoryParams,
  SubscriptionPlan 
} from './types';

// Types
import { 
  CreditCard, 
  CreditCardDetails 
} from './types/CreditCardTypes';
import { FullHeightContext } from './hooks/useFullHeight';
import { ScrollHeightContext } from './hooks/useScrollHeight';

const quick_history_size = GLOBAL_QUICK_HISTORY_SIZE;

interface AppContentProps {}

function AppContent({}: AppContentProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State for managing credit cards in the application
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [isLoadingCreditCards, setIsLoadingCreditCards] = useState<boolean>(true);
  // State for storing user's basic card details (for PromptWindow)
  const [userCardDetails, setUserCardDetails] = useState<CardDetailsList>([]);
  // State for storing user's detailed card details (for modal view)
  const [userDetailedCardDetails, setUserDetailedCardDetails] = useState<CreditCardDetails[]>([]);
  // State for storing selected card details for modal view
  const [selectedCardDetails, setSelectedCardDetails] = useState<CreditCardDetails | null>(null);
  // State for loading card details
  const [isLoadingCardDetails, setIsLoadingCardDetails] = useState<boolean>(false);
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
  const [needsScrollHeight, setNeedsScrollHeight] = useState<boolean>(false);

  const cardSelectorModal = useModal();
  const cardDetailsModal = useModal();
  const helpModal = useModal();

  // Effect to reset current chat ID when user changes
  useEffect(() => {
    setCurrentChatId(null);
  }, [user]);

  // Effect to handle navigation when on root path with active chat
  useEffect(() => {
    if (location.pathname === '/' && currentChatId) {
      navigate(`/${currentChatId}`, { replace: true });
    }
  }, [location.pathname, currentChatId, navigate]);

  // Effect to fetch credit cards when user is authenticated
  useEffect(() => {
    const fetchCreditCards = async () => {
      if (!user) {
        setCreditCards([]);
        setIsLoadingCreditCards(false);
        return;
      }
      
      setIsLoadingCreditCards(true);
      try {
        const cards = await CardService.fetchCreditCards(true);
        setCreditCards(cards);
      } catch (error) {
        console.error('Error fetching credit cards:', error);
      } finally {
        setIsLoadingCreditCards(false);
      }
    };

    fetchCreditCards();
  }, [user]);

  // Effect to fetch show completed only preference
  useEffect(() => {
    const fetchShowCompletedOnlyPreference = async () => {
      if (!user) {
        setShowCompletedOnlyPreference(false);
        return;
      }
      
      try {
        const response = await UserPreferencesService.loadShowCompletedOnlyPreference();
        setShowCompletedOnlyPreference(response.data === 'true');
      } catch (error) {
        console.error('Error fetching show completed only preference:', error);
        setShowCompletedOnlyPreference(false);
      }
    };

    fetchShowCompletedOnlyPreference();
  }, [user, historyRefreshTrigger]);

  // Effect to fetch user preferences instructions
  useEffect(() => {
    const fetchPreferencesInstructions = async () => {
      if (!user) return;
      
      try {
        const response = await UserPreferencesService.loadInstructionsPreferences();
        setPreferencesInstructions(response.instructions || '');
      } catch (error) {
        console.error('Error fetching preferences instructions:', error);
      }
    };

    fetchPreferencesInstructions();
  }, [user]);

  // Effect to fetch chat history preference settings
  useEffect(() => {
    const fetchChatHistoryPreference = async () => {
      if (!user) return;
      
      try {
        const response = await UserPreferencesService.loadChatHistoryPreferences();
        if (response.data) {
          setChatHistoryPreference(response.data as ChatHistoryPreference);
        }
      } catch (error) {
        console.error('Error fetching chat history preference:', error);
      }
    };

    fetchChatHistoryPreference();
  }, [user]);

  // Effect to fetch full chat history with updates
  useEffect(() => {
    const fetchFullHistory = async () => {
      if (!user) return;  // Only check for user authentication
      
      try {
        const params: HistoryParams = {
          lastUpdate: lastUpdateTimestamp || undefined,
          page_size: quick_history_size,
          page: 1,
          forceShowAll: 'true'
        };

        const response: PagedHistoryResponse = await UserHistoryService.fetchPagedHistory(params);
        
        if (response.hasUpdates) {
          // Ensure each chat history entry has all required fields
          const processedHistory = response.chatHistory;
          
          setChatHistory(processedHistory);
          setLastUpdateTimestamp(new Date().toISOString());
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchFullHistory();
  }, [user, historyRefreshTrigger, chatHistoryPreference, showCompletedOnlyPreference]);

  // Effect to fetch user's card details
  useEffect(() => {
    const fetchUserCardDetails = async () => {
      if (!user) {
        setUserCardDetails([]); // Clear details if no user
        setUserDetailedCardDetails([]);
        return;
      }
      
      try {
        // Fetch both basic and detailed card information
        const [basicDetails, detailedInfo] = await Promise.all([
          UserCreditCardService.fetchUserCardDetails(),
          UserCreditCardService.fetchUserCardsDetailedInfo()
        ]);
        
        setUserCardDetails(basicDetails);
        setUserDetailedCardDetails(detailedInfo);
      } catch (error) {
        console.error('Error fetching user card details:', error);
      }
    };

    fetchUserCardDetails();
  }, [user]);

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

  // Effect to fetch user's subscription plan
  useEffect(() => {
    const fetchSubscriptionPlan = async () => {
      if (!user) {
        setSubscriptionPlan(SUBSCRIPTION_PLAN.FREE);
        return;
      }
      
      try {
        const plan = await UserService.fetchUserSubscriptionPlan();
        setSubscriptionPlan(plan);
      } catch (error) {
        console.error('Error fetching subscription plan:', error);
        setSubscriptionPlan(SUBSCRIPTION_PLAN.FREE); // Default to free on error
      }
    };

    fetchSubscriptionPlan();
  }, [user]);

  // Function to update current chat ID
  const getCurrentChatId = (returnCurrentChatId: string | null): void => {
    setCurrentChatId(returnCurrentChatId);
  };

  // Function to handle user logout and reset all states
  const handleLogout = async (): Promise<void> => {
    // Reset all states to their initial values
    setUserCardDetails([]);
    setUserDetailedCardDetails([]);
    setCurrentChatId(null);
    setChatHistory([]);
    setCreditCards([]);
    cardSelectorModal.close();
    cardDetailsModal.close();
    setHistoryRefreshTrigger(0);
    setLastUpdateTimestamp(null);
    setClearChatCallback(0);
    setPreferencesInstructions('');
    setChatHistoryPreference(CHAT_HISTORY_PREFERENCE.KEEP_HISTORY);
    setShowCompletedOnlyPreference(false);
    
    // Perform logout and navigation
    await logout();
    navigate('/signin');
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
        cardDetailsModal.open();
      }
    } catch (error) {
      console.error('Error loading card details:', error);
    } finally {
      setIsLoadingCardDetails(false);
    }
  };

  const createTitle = (suffix?: string) => {
    return suffix ? APP_NAME + ' - ' + suffix : APP_NAME;
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/history') return createTitle('History');
    if (path === '/preferences') return createTitle('Preferences');
    if (path === '/account') return createTitle('Account');
    if (path === '/signin') return createTitle('Sign In');
    if (path === '/signup') return createTitle('Sign Up');
    if (path === '/forgotpassword') return createTitle('Reset Password');
    if (path === '/welcome') return createTitle('Welcome');
    if (path === '/my-cards') return createTitle('My Cards');
    return createTitle();
  };

  // Effect to persist side panel state to localStorage
  useEffect(() => {
    localStorage.setItem('sidePanelOpen', JSON.stringify(isSidePanelOpen));
  }, [isSidePanelOpen]);

  // Function to toggle side panel
  const toggleSidePanel = () => {
    setIsSidePanelOpen(prev => !prev);
  };

  const renderMainContent = () => {
    const headerActions = (
      <>
        <button 
          className="new-transaction-button"
          onClick={handleClearChat}
          aria-label="Start new transaction chat"
        >
          New Transaction Chat
        </button>
        <button 
          className="help-button"
          onClick={helpModal.open}
          aria-label="Open help"
        >
          Help
        </button>
      </>
    );

    return (
      <div className="home-wrapper">
        <PageHeader 
          title={PAGE_NAMES.HOME}
          actions={headerActions}
          withActions={true}
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
            />
          </div>
        </div>

        <Modal isOpen={helpModal.isOpen} onClose={helpModal.close}>
          <PromptHelpModal />
        </Modal>
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
          
          {/* AppHeader for unauthenticated pages */}
          {!user && (
            <AppHeader 
              user={user}
              onLogout={handleLogout}
              isSidePanelOpen={false}
              toggleSidePanel={toggleSidePanel}
            />
          )}
          
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
              onCardSelect={handleCardSelect}
              quickHistorySize={quick_history_size}
              user={user}
              onLogout={handleLogout}
              onNewChat={handleClearChat}
            />
          )}
          
          <Modal 
            isOpen={cardSelectorModal.isOpen} 
            onClose={cardSelectorModal.close}
          >
            <CreditCardSelector 
              returnCreditCards={getCreditCards} 
              existingCreditCards={creditCards}
            />
          </Modal>

          <Modal 
            isOpen={cardDetailsModal.isOpen} 
            onClose={cardDetailsModal.close}
            width="800px"
          >
            <CreditCardDetailView 
              cardDetails={selectedCardDetails}
              isLoading={isLoadingCardDetails}
            />
          </Modal>
          
          <UniversalContentWrapper 
            isSidePanelOpen={user ? isSidePanelOpen : false}
            fullHeight={needsFullHeight}
          >
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  {renderMainContent()}
                </ProtectedRoute>
              } />
              <Route path="/:chatId" element={
                <ProtectedRoute>
                  {renderMainContent()}
                </ProtectedRoute>
              } />
              <Route path="/preferences" element={
                <ProtectedRoute>
                  <Preferences 
                    onModalOpen={cardSelectorModal.open}
                    preferencesInstructions={preferencesInstructions}
                    setPreferencesInstructions={setPreferencesInstructions}
                    chatHistoryPreference={chatHistoryPreference}
                    setChatHistoryPreference={(preference: ChatHistoryPreference) => setChatHistoryPreference(preference)}
                    showCompletedOnlyPreference={showCompletedOnlyPreference}
                    setShowCompletedOnlyPreference={(preference: ShowCompletedOnlyPreference) => setShowCompletedOnlyPreference(preference)}
                  />
                </ProtectedRoute>
              } />
              <Route path="/signin" element={
                <RedirectIfAuthenticated>
                  <SignIn />
                </RedirectIfAuthenticated>
              } />
              <Route path="/forgotpassword" element={
                <RedirectIfAuthenticated>
                  <ForgotPassword />
                </RedirectIfAuthenticated>
              } />
              <Route path="/signup" element={
                <RedirectIfAuthenticated>
                  <SignUp />
                </RedirectIfAuthenticated>
              } />
              <Route path="/welcome" element={
                <ProtectedRoute>
                  <Welcome onModalOpen={cardSelectorModal.open} />
                </ProtectedRoute>
              } />
              <Route path="/account" element={
                <ProtectedRoute>
                  <Account 
                    setChatHistory={setChatHistory}
                    setHistoryRefreshTrigger={setHistoryRefreshTrigger}
                    subscriptionPlan={subscriptionPlan}
                  />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
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
              <Route path="/my-cards" element={
                <ProtectedRoute>
                  <MyCards onCardsUpdate={getCreditCards} />
                </ProtectedRoute>
              } />
            </Routes>
          </UniversalContentWrapper>
        </div>
      </ScrollHeightContext.Provider>
    </FullHeightContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <HelmetProvider>
        <AppContent />
      </HelmetProvider>
    </Router>
  );
}

export default App;
