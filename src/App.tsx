import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { APP_NAME, PAGE_NAMES, PAGE_ICONS, ICON_PRIMARY_MEDIUM, PAGES, PageUtils, MOBILE_BREAKPOINT, UserCreditCard, UserCredit, CreditCardDetails, CardCredit } from './types';
import { Icon, CardIcon } from './icons';
// Services
import {
  CardService,
  UserService,
  UserCreditCardService,
  UserHistoryService,
  UserPreferencesService,
  UserCreditService,
  UserComponentService,
  ComponentService
} from './services';

// Styles
import './App.scss';
import './components/PromptWindow/PromptWindow.scss';

// Pages
import Account from './pages/account/Account';
import DeleteHistory from './pages/delete-history/DeleteHistory';
import DeleteAccount from './pages/delete-account/DeleteAccount';
import Preferences from './pages/preferences/Preferences';
import SignIn from './pages/authentication/SignIn';
import SignUp from './pages/authentication/SignUp';
import ForgotPassword from './pages/authentication/ForgotPassword';
import Welcome from './pages/authentication/Welcome';
import AuthAction from './pages/authentication/AuthAction';
import History from './pages/history/History';
import MyCards from './pages/my-cards/MyCards';
import MyCredits from './pages/my-credits/MyCredits';
import CreditsHistory from './pages/my-credits/history-legacy/CreditsHistory';
import CreditsPortfolio from './pages/my-credits/history/CreditsPortfolio';
import DesignSystem from './pages/design-system/DesignSystem';
import FullComponents from './pages/design-system/components/FullComponents';
import { Help } from './pages/help';
import {
  GettingStarted,
  AskAI,
  AskAIPrompts,
  AskAITips,
  Cards,
  CardsSettings,
  CardsDetails,
  Credits,
  CreditsDashboard,
  CreditsUpdating,
  CreditsHistory as CreditsHistoryHelp,
  ReferenceColors,
  ReferenceFrequencies,
  Glossary,
  FAQ,
  Troubleshooting
} from './pages/help/sections';
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
import CreditEditModal from './components/CreditPortfolio/CreditEditModal';
import UniversalContentWrapper from './components/UniversalContentWrapper';
import CreditDetailedSummary from './components/CreditSummary/CreditDetailedSummary';
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
  CHAT_MODE,
  DEFAULT_CHAT_MODE,
  SUBSCRIPTION_PLAN,
  LOADING_ICON,
  LOADING_ICON_SIZE,
  Conversation,
  ChatHistoryPreference,
  ChatModePreference,
  InstructionsPreference,
  SubscriptionPlan,
  MonthlyStatsResponse
} from './types';

// Types
import {
  CreditCard
} from './types/CreditCardTypes';
import { UserComponentTrackingPreferences, PrioritizedCredit } from './types/CardCreditsTypes';
import { FullHeightContext } from './hooks/useFullHeight';
import { ScrollHeightContext } from './hooks/useScrollHeight';
import { Toaster, toast } from 'sonner';

const quick_history_size = GLOBAL_QUICK_HISTORY_SIZE;

interface AppContentProps {}

function AppContent({}: AppContentProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesignSystemPage = location.pathname.startsWith('/design');
  const { refetch: refetchComponents } = useComponents();

  // Enable dynamic page background colors
  usePageBackground();
  // Ensure iOS Safari uses visible viewport height
  useViewportHeight();

  useEffect(() => {
    if (!isDesignSystemPage || typeof document === 'undefined') {
      document?.body?.classList.remove('design-system-body');
      return;
    }

    document.body.classList.add('design-system-body');
    return () => {
      document.body.classList.remove('design-system-body');
    };
  }, [isDesignSystemPage]);

  // State for managing credit cards in the application
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [isLoadingCreditCards, setIsLoadingCreditCards] = useState<boolean>(true);
  // State for loading transaction history
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  // State for storing user's basic card details (for PromptWindow)
  // State for storing user's detailed card details (for modal view)
  const [userDetailedCardDetails, setUserDetailedCardDetails] = useState<CreditCardDetails[]>([]);
  // State for storing selected card details for modal view
  const [selectedCardDetails, setSelectedCardDetails] = useState<CreditCardDetails | null>(null);
  // State for loading card details
  const [isLoadingCardDetails, setIsLoadingCardDetails] = useState<boolean>(false);
  // State for storing user's card metadata (openDate, isFrozen, etc.)
  const [userCardsMetadata, setUserCardsMetadata] = useState<Map<string, UserCreditCard>>(new Map());
  // State for storing user's component tracking preferences
  const [componentPreferences, setComponentPreferences] = useState<UserComponentTrackingPreferences | null>(null);
  // State for storing monthly credit stats
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStatsResponse | null>(null);
  const [isLoadingMonthlyStats, setIsLoadingMonthlyStats] = useState<boolean>(true);
  const [isUpdatingMonthlyStats, setIsUpdatingMonthlyStats] = useState<boolean>(false);
  // State for tracking which specific credits are being updated
  const [updatingCreditIds, setUpdatingCreditIds] = useState<Set<string>>(new Set());

  // Helper functions to manage updating credit IDs
  const addUpdatingCreditId = (cardId: string, creditId: string, periodNumber: number) => {
    const creditKey = `${cardId}:${creditId}:${periodNumber}`;
    setUpdatingCreditIds(prev => new Set(prev).add(creditKey));
  };

  const removeUpdatingCreditId = (cardId: string, creditId: string, periodNumber: number) => {
    const creditKey = `${cardId}:${creditId}:${periodNumber}`;
    setUpdatingCreditIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(creditKey);
      return newSet;
    });
  };

  const isCreditUpdating = (cardId: string, creditId: string, periodNumber: number) => {
    const creditKey = `${cardId}:${creditId}:${periodNumber}`;
    return updatingCreditIds.has(creditKey);
  };

  const clearAllUpdatingCredits = () => {
    setUpdatingCreditIds(new Set());
  };

  // State for storing prioritized credits list
  const [prioritizedCredits, setPrioritizedCredits] = useState<PrioritizedCredit[]>([]);
  const [isLoadingPrioritizedCredits, setIsLoadingPrioritizedCredits] = useState<boolean>(true);
  // State for storing chat history/conversations
  const [chatHistory, setChatHistory] = useState<Conversation[]>([]);
  // State for tracking the current active chat ID
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  // State to trigger history refresh when needed
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState<number>(0);
  // State to trigger monthly stats refresh when needed
  const [monthlyStatsRefreshTrigger, setMonthlyStatsRefreshTrigger] = useState<number>(0);
  // State to track the last update timestamp for chat history
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<string | null>(null);
  // State to trigger chat clearing functionality
  const [clearChatCallback, setClearChatCallback] = useState<number>(0);
  // State for storing user preferences instructions
  const [preferencesInstructions, setPreferencesInstructions] = useState<InstructionsPreference>('');
  // State for managing chat history preference (keep/clear)
  const [chatHistoryPreference, setChatHistoryPreference] = useState<ChatHistoryPreference>(CHAT_HISTORY_PREFERENCE.KEEP_HISTORY);
  // State for managing chat mode preference (unified/orchestrated) - stored in localStorage
  const [chatMode, setChatMode] = useState<ChatModePreference>(() => {
    const stored = localStorage.getItem('swipe_chat_mode');
    return (stored as ChatModePreference) || DEFAULT_CHAT_MODE;
  });
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
  const [isDetailedSummaryOpen, setIsDetailedSummaryOpen] = useState(false);
  // State for credit detail modal (opened from chat component clicks)
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isCreditModalLoading, setIsCreditModalLoading] = useState(false);
  const [selectedCreditForModal, setSelectedCreditForModal] = useState<{
    userCredit: UserCredit;
    card: CreditCardDetails;
    cardCredit: CardCredit | null;
  } | null>(null);
  const [cardsVersion, setCardsVersion] = useState<number>(0);
  const [isSavingCards, setIsSavingCards] = useState(false);
  const [cardSelectorSearchTerm, setCardSelectorSearchTerm] = useState<string>('');
  const [selectedCardsForChips, setSelectedCardsForChips] = useState<CreditCard[]>([]);
  const resetCardSelectorUI = () => {
    setCardSelectorSearchTerm('');
    setSelectedCardsForChips([]);
  };
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
  });
  // Local feature flags controlling drawer vs dialog
  const USE_DRAWER_FOR_CARD_DETAILS_DESKTOP = true;
  const USE_DRAWER_FOR_CARD_DETAILS_MOBILE = true;
  
  const creditCardSelectorRef = useRef<CreditCardSelectorRef>(null);
  // Ref to track if we're intentionally clearing the chat (prevents sync effect from redirecting)
  const isClearingChatRef = useRef<boolean>(false);

  // Effect to reset current chat ID when user changes
  useEffect(() => {
    setCurrentChatId(null);
  }, [user]);

  // Effect to handle navigation when on root path with active chat
  useEffect(() => {
    // Don't redirect if we're intentionally clearing the chat
    // This prevents the race condition where we try to restore a chat we're actively clearing
    if (location.pathname === PAGES.HOME.PATH && currentChatId && !isClearingChatRef.current) {
      navigate(`${PAGES.HOME.PATH}${currentChatId}`, { replace: true });
    }
  }, [location.pathname, currentChatId, navigate]);

  
  // Ref to prevent duplicate initial loads
  const isLoadingRef = useRef(false);

  // Effect to fetch all initial data in parallel batches when user is authenticated
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) {
        // Reset all states when user is not authenticated
        setCreditCards([]);
        setComponentPreferences(null);
        setUserDetailedCardDetails([]);
        setChatHistory([]);
        setSubscriptionPlan(SUBSCRIPTION_PLAN.FREE);
        setPreferencesInstructions('');
        setChatHistoryPreference(CHAT_HISTORY_PREFERENCE.KEEP_HISTORY);
        setMonthlyStats(null);
        setPrioritizedCredits([]);
        setIsLoadingCreditCards(false);
        setIsLoadingHistory(false);
        setIsLoadingMonthlyStats(false);
        setIsLoadingPrioritizedCredits(false);
        isLoadingRef.current = false;
        return;
      }

      // Prevent duplicate loads
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

      setIsLoadingCreditCards(true);
      setIsLoadingHistory(true);
      setIsLoadingMonthlyStats(true);
      setIsLoadingPrioritizedCredits(true);

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
        const [componentPrefs, allPreferences] = await Promise.all([
          UserComponentService.fetchComponentTrackingPreferences().catch(error => {
            console.error('Error fetching component tracking preferences:', error);
            return { Cards: [] }; // Return empty preferences if fetch fails
          }),
          UserPreferencesService.loadAllPreferences().catch(error => {
            console.error('Error fetching user preferences:', error);
            return {
              success: false,
              instructions: '',
              chatHistory: 'keep_history' as ChatHistoryPreference
            };
          })
        ]);

        setComponentPreferences(componentPrefs);
        setPreferencesInstructions(allPreferences.instructions || '');
        setChatHistoryPreference(allPreferences.chatHistory);

        // Batch 3: Card details and chat history with priority loading
        const quick_history_size = GLOBAL_QUICK_HISTORY_SIZE;

        // Extract chatId from URL if present (priority loading)
        const currentPath = location.pathname;
        const urlChatId = currentPath !== PAGES.HOME.PATH && PageUtils.isPage(currentPath, 'HOME')
          ? currentPath.slice(1) // Remove leading slash
          : null;

        // Prepare parallel requests
        const requests = [
          UserCreditCardService.fetchUserCardsDetailedInfo().catch(error => {
            console.error('Error fetching user detailed card info:', error);
            return [];
          }),
          UserCreditCardService.fetchUserCards().catch(error => {
            console.error('Error fetching user cards metadata:', error);
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

          const [detailedInfo, userCardsData, priorityChat, historyResponse] = await Promise.all(requests);

          setUserDetailedCardDetails(detailedInfo);

          // Build a map of user card metadata keyed by cardReferenceId
          const metadataMap = new Map<string, UserCreditCard>();
          userCardsData.forEach((uc: UserCreditCard) => {
            metadataMap.set(uc.cardReferenceId, uc);
          });
          setUserCardsMetadata(metadataMap);

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

          const [detailedInfo, userCardsData, historyResponse] = await Promise.all(requests);

          setUserDetailedCardDetails(detailedInfo);

          // Build a map of user card metadata keyed by cardReferenceId
          const metadataMap = new Map<string, UserCreditCard>();
          userCardsData.forEach((uc: UserCreditCard) => {
            metadataMap.set(uc.cardReferenceId, uc);
          });
          setUserCardsMetadata(metadataMap);

          setChatHistory(historyResponse.chatHistory);
        }

        setLastUpdateTimestamp(new Date().toISOString());

        // Batch 4: Sync current year credits to ensure they exist (handles new year rollover)
        // This is critical for ensuring credits are created when a new year starts
        try {
          await UserCreditService.syncCurrentYearCredits();
        } catch (error) {
          console.error('Error syncing current year credits:', error);
          // Continue even if sync fails - user can manually trigger from credits page
        }

        // Batch 5: Monthly credits data (low priority, after core app is loaded)
        try {
          const monthlyStatsData = await UserCreditService.fetchMonthlySummary({
            showRedeemed: true,
            includeHidden: false,
            limit: 0 // Get all credits
          });

          setMonthlyStats(monthlyStatsData);
          if (monthlyStatsData) {
            setPrioritizedCredits(monthlyStatsData.PrioritizedCredits.credits);
          }
        } catch (error) {
          console.error('Error fetching monthly stats (low priority):', error);
        } finally {
          setIsLoadingPrioritizedCredits(false);
        }

      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoadingCreditCards(false);
        setIsLoadingHistory(false);
        setIsLoadingMonthlyStats(false);
        setIsLoadingPrioritizedCredits(false);
        isLoadingRef.current = false;
      }
    };

    loadInitialData();
  }, [user, cardsVersion]); // Refresh when user changes or cards version changes

  // Update current chat ID when URL changes (no API calls here)
  useEffect(() => {
    // Skip if we're intentionally clearing the chat to avoid race conditions
    if (isClearingChatRef.current) return;

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
  }, [historyRefreshTrigger, chatHistoryPreference]);

  // Effect to handle monthly stats refresh triggers (for updates from other components)
  useEffect(() => {
    const refreshMonthlyStats = async () => {
      if (!user || monthlyStatsRefreshTrigger === 0) return;

      // If we already have data, this is an update - don't show loading indicators
      // Just let the data refresh silently in the background
      if (!monthlyStats) {
        setIsLoadingMonthlyStats(true);
        setIsLoadingPrioritizedCredits(true);
      }
      try {
        const summaryData = await UserCreditService.fetchMonthlySummary({
          showRedeemed: true,
          includeHidden: false,
          limit: 0 // Get all credits
        });
        setMonthlyStats(summaryData);
        setPrioritizedCredits(summaryData.PrioritizedCredits.credits);
      } catch (error) {
        console.error('Error refreshing monthly stats:', error);
      } finally {
        setIsLoadingMonthlyStats(false);
        setIsLoadingPrioritizedCredits(false);
        setIsUpdatingMonthlyStats(false);
        // Clear all updating credit indicators after refresh completes
        setUpdatingCreditIds(new Set());
      }
    };

    refreshMonthlyStats();
  }, [monthlyStatsRefreshTrigger]);

  // Function to update credit cards and refresh user card details
  const getCreditCards = async (returnCreditCards: CreditCard[]): Promise<void> => {
    setCreditCards(returnCreditCards);

    // After updating credit cards, fetch fresh user card details
    if (user) {
      try {
        const details = await UserCreditCardService.fetchUserCardsDetailedInfo();
        setUserDetailedCardDetails(details);

        // Refetch components (perks, credits, multipliers) for the updated cards
        await refetchComponents();
      } catch (error) {
        console.error('Error fetching updated user card details:', error);
      }
    }
  };

  // Function to refresh component tracking preferences when they're updated
  const refreshComponentPreferences = async (): Promise<void> => {
    if (!user) return;

    try {
      const preferences = await UserComponentService.fetchComponentTrackingPreferences();
      setComponentPreferences(preferences);

      // Also refresh monthly stats when preferences are updated
      // (hide/show preferences affect monthly stats calculations)
      setMonthlyStatsRefreshTrigger(prev => prev + 1);
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
    setUserDetailedCardDetails([]);
    setComponentPreferences(null);
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
    // Set ref flag to prevent sync effect from redirecting during clear
    isClearingChatRef.current = true;

    // Clear current chat ID FIRST before triggering child component callback
    setCurrentChatId(null);

    // Increment the callback counter to trigger a clear in PromptWindow
    setClearChatCallback(prev => prev + 1);

    // Reset the flag after a short delay to allow navigation to complete
    setTimeout(() => {
      isClearingChatRef.current = false;
    }, 100);
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

  // Function to handle card selection by ID (for chat component clicks)
  const handleCardSelectById = (cardId: string) => {
    const details = userDetailedCardDetails.find(detail => detail.id === cardId);
    if (details) {
      setSelectedCardDetails(details);
      setIsCardDetailsOpen(true);
    }
  };

  // Function to handle credit selection by ID (for chat component clicks)
  // Opens modal immediately with loading state, then fetches data
  const handleCreditSelect = async (cardId: string, creditId: string) => {
    // Open modal immediately with loading state
    setIsCreditModalOpen(true);
    setIsCreditModalLoading(true);
    setSelectedCreditForModal(null);

    try {
      const currentYear = new Date().getFullYear();
      const result = await UserCreditService.fetchCreditDetails(cardId, creditId, currentYear);

      setSelectedCreditForModal({
        userCredit: result.credit,
        card: result.cardDetails,
        cardCredit: result.creditDetails || null,
      });
    } catch (error) {
      console.error('Failed to fetch credit details:', error);
      // Close modal on error
      setIsCreditModalOpen(false);
    } finally {
      setIsCreditModalLoading(false);
    }
  };

  // Handle closing the credit modal
  const handleCloseCreditModal = () => {
    setIsCreditModalOpen(false);
    setSelectedCreditForModal(null);
  };

  // Function to handle saving credit card selections
  const handleSaveCardSelections = async () => {
    if (!creditCardSelectorRef.current) return;

    setIsSavingCards(true);

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
    if (success) {
      toast.success(message);
      // Refresh global cards and bump version to trigger dependents
      (async () => {
        try {
          const cards = await CardService.fetchCreditCards(true);
          setCreditCards(cards);
          setCardsVersion(v => v + 1);
          // Refetch components (perks, credits, multipliers) for new cards
          await refetchComponents();
        } catch (err) {
          console.error('Error refreshing cards after save:', err);
        }
      })();
    } else {
      toast.error(message);
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
        />
        <div className="app-content">
          <div className="prompt-window-container">
            <PromptWindow
              user={user}
              returnCurrentChatId={getCurrentChatId}
              onHistoryUpdate={handleHistoryUpdate}
              clearChatCallback={clearChatCallback}
              setClearChatCallback={setClearChatCallback}
              existingHistoryList={chatHistory}
              chatHistoryPreference={chatHistoryPreference}
              chatMode={chatMode}
              isLoadingHistory={isLoadingHistory}
              onNewChat={handleClearChat}
              onCardSelect={handleCardSelectById}
              onCreditClick={handleCreditSelect}
              onRefreshCredits={() => setMonthlyStatsRefreshTrigger(prev => prev + 1)}
              onRefreshCards={() => setCardsVersion(v => v + 1)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <FullHeightContext.Provider value={{ setFullHeight: setNeedsFullHeight }}>
      <ScrollHeightContext.Provider value={{ setScrollHeight: setNeedsScrollHeight }}>
        <div className="app">
          <Toaster position="top-right" richColors />
          <Helmet>
            <title>{getPageTitle()}</title>
          </Helmet>

          {/* Check if current route is an auth page (no sidebar/nav should show) */}
          {(() => {
            const authPaths = new Set<string>([PAGES.SIGN_IN.PATH, PAGES.SIGN_UP.PATH, PAGES.FORGOT_PASSWORD.PATH, PAGES.AUTH_ACTION.PATH]);
            const isAuthRoute = authPaths.has(location.pathname);

            return (
              <>
                {/* Universal Sidebar - shown on all pages when user is authenticated (except auth pages and design system) */}
                {user && !isDesignSystemPage && !isAuthRoute && (
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
              monthlyStats={monthlyStats}
              isLoadingMonthlyStats={isLoadingMonthlyStats}
              isUpdatingMonthlyStats={isUpdatingMonthlyStats}
              prioritizedCredits={prioritizedCredits}
              onRefreshMonthlyStats={() => setMonthlyStatsRefreshTrigger(prev => prev + 1)}
              onAddUpdatingCreditId={addUpdatingCreditId}
              onRemoveUpdatingCreditId={removeUpdatingCreditId}
              isCreditUpdating={isCreditUpdating}
            />
                )}

                {/* Mobile Header - shown on mobile for authenticated, non-auth routes (except design system) */}
                {user && !isAuthRoute && !isDesignSystemPage && (
                  <MobileHeader
                    title={PageUtils.getTitleByPath(location.pathname) || APP_NAME}
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
                    monthlyStats={monthlyStats}
                    isLoadingMonthlyStats={isLoadingMonthlyStats}
                    isUpdatingMonthlyStats={isUpdatingMonthlyStats}
                    prioritizedCredits={prioritizedCredits}
                    onRefreshMonthlyStats={() => setMonthlyStatsRefreshTrigger(prev => prev + 1)}
                    onAddUpdatingCreditId={addUpdatingCreditId}
                    onRemoveUpdatingCreditId={removeUpdatingCreditId}
                    isCreditUpdating={isCreditUpdating}
                  />
                )}
              </>
            );
          })()}

                    
          {(() => {
            if (isMobileViewport) {
              return (
                <Drawer open={isCardSelectorOpen} onOpenChange={(open) => {
                  if (!open) {
                    resetCardSelectorUI();
                  }
                  setIsCardSelectorOpen(open);
                }} direction="bottom">
                  <DrawerContent className="mobile-card-selector-drawer">
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
                      {selectedCardsForChips.length > 0 && (
                        <div className="selection-chips-container">
                          <div className="selection-chips">
                            {selectedCardsForChips.map(card => (
                              <span
                                key={`chip-${card.id}`}
                                className={`selection-chip ${card.isDefaultCard ? 'selection-chip--preferred' : ''}`}
                              >
                                {card.isDefaultCard && (
                                  <Icon name="star" variant="micro" size={10} />
                                )}
                                <CardIcon
                                  title={card.CardName}
                                  size={16}
                                  primary={card.CardPrimaryColor}
                                  secondary={card.CardSecondaryColor}
                                />
                                <span className="selection-chip__name">{card.CardName}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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
                        hideInternalChips={true}
                        onSelectionChange={setSelectedCardsForChips}
                      />
                    </div>
                    <div className="dialog-footer">
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
                <DialogContent fullHeight>
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
                  <DrawerContent className="card-detail-drawer">
                    <DrawerHeader>
                      <DrawerTitle className="sr-only">
                        {selectedCardDetails ? selectedCardDetails.CardName : 'Card Details'}
                      </DrawerTitle>
                    </DrawerHeader>
                    <div className="dialog-body">
                      <CreditCardDetailView
                        cardDetails={selectedCardDetails}
                        isLoading={isLoadingCardDetails}
                        openDate={selectedCardDetails ? userCardsMetadata.get(selectedCardDetails.id)?.openDate ?? null : null}
                      />
                    </div>
                  </DrawerContent>
                </Drawer>
              );
            }
            return (
              <Dialog open={isCardDetailsOpen} onOpenChange={setIsCardDetailsOpen}>
                <DialogContent fullScreen className="card-detail-dialog">
                  <DialogHeader>
                    <DialogTitle className="sr-only">
                      {selectedCardDetails ? selectedCardDetails.CardName : 'Card Details'}
                    </DialogTitle>
                  </DialogHeader>
                  <DialogBody>
                    <CreditCardDetailView
                      cardDetails={selectedCardDetails}
                      isLoading={isLoadingCardDetails}
                      openDate={selectedCardDetails ? userCardsMetadata.get(selectedCardDetails.id)?.openDate ?? null : null}
                    />
                  </DialogBody>
                </DialogContent>
              </Dialog>
            );
          })()}

          {/* Credits Report Modal */}
          <Dialog open={isDetailedSummaryOpen} onOpenChange={setIsDetailedSummaryOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Credits Report</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <CreditDetailedSummary
                  monthlyStats={monthlyStats}
                  loading={isLoadingMonthlyStats}
                  isUpdating={isUpdatingMonthlyStats}
                />
              </DialogBody>
            </DialogContent>
          </Dialog>

          {/* Credit Detail Modal (opened from chat component clicks) */}
          {/* Credit Detail Modal (opened from chat component clicks) */}
          <CreditEditModal
            isOpen={isCreditModalOpen}
            onClose={handleCloseCreditModal}
            userCredit={selectedCreditForModal?.userCredit || null}
            card={selectedCreditForModal?.card || null}
            cardCredit={selectedCreditForModal?.cardCredit || null}
            year={new Date().getFullYear()}
            isLoading={isCreditModalLoading}
            onUpdateComplete={() => setMonthlyStatsRefreshTrigger(prev => prev + 1)}
          />

          {/* Design System Route - rendered outside of normal app wrapper */}
          {isDesignSystemPage ? (
            <Routes>
            <Route path="/design" element={<DesignSystem />} />
              <Route path="/design/components" element={<FullComponents />} />
            </Routes>
          ) : (
          (() => {
            const authPaths = new Set<string>([PAGES.SIGN_IN.PATH, PAGES.SIGN_UP.PATH, PAGES.FORGOT_PASSWORD.PATH, PAGES.AUTH_ACTION.PATH]);
            const isAuthRoute = authPaths.has(location.pathname);
            const isHelpPage = location.pathname.startsWith(PAGES.HELP_CENTER.PATH);
            return (
              <UniversalContentWrapper
                isSidePanelOpen={user ? isSidePanelOpen : false}
                fullHeight={isAuthRoute ? true : needsFullHeight}
                className={isAuthRoute ? 'center-content auth-background' : ''}
                disableSidebarMargin={isAuthRoute}
                whiteBackground={isHelpPage}
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
                        chatMode={chatMode}
                        setChatMode={setChatMode}
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
                  <Route path={PAGES.AUTH_ACTION.PATH} element={<AuthAction />} />
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
                      <MyCredits
                        monthlyStats={monthlyStats}
                        isLoadingMonthlyStats={isLoadingMonthlyStats}
                        isUpdatingMonthlyStats={isUpdatingMonthlyStats}
                        prioritizedCredits={prioritizedCredits}
                        isLoadingPrioritizedCredits={isLoadingPrioritizedCredits}
                        onRefreshMonthlyStats={() => setMonthlyStatsRefreshTrigger(prev => prev + 1)}
                        onAddUpdatingCreditId={addUpdatingCreditId}
                        onRemoveUpdatingCreditId={removeUpdatingCreditId}
                        isCreditUpdating={isCreditUpdating}
                        onDetailedSummaryClick={() => setIsDetailedSummaryOpen(true)}
                      />
                    </ProtectedRoute>
                  } />
                  <Route path={PAGES.MY_CREDITS_HISTORY.PATH} element={
                    <ProtectedRoute>
                      <CreditsPortfolio
                        userCardDetails={userDetailedCardDetails}
                        reloadTrigger={cardsVersion}
                        onRefreshMonthlyStats={() => setMonthlyStatsRefreshTrigger(prev => prev + 1)}
                        onAddUpdatingCreditId={addUpdatingCreditId}
                        onRemoveUpdatingCreditId={removeUpdatingCreditId}
                        isCreditUpdating={isCreditUpdating}
                        onClearAllUpdatingCredits={clearAllUpdatingCredits}
                      />
                    </ProtectedRoute>
                  } />
                  <Route path={PAGES.MY_CREDITS_HISTORY_LEGACY.PATH} element={
                    <ProtectedRoute>
                      <CreditsHistory
                        userCardDetails={userDetailedCardDetails}
                        reloadTrigger={cardsVersion}
                        onRefreshMonthlyStats={() => setMonthlyStatsRefreshTrigger(prev => prev + 1)}
                        onAddUpdatingCreditId={addUpdatingCreditId}
                        onRemoveUpdatingCreditId={removeUpdatingCreditId}
                        isCreditUpdating={isCreditUpdating}
                        onClearAllUpdatingCredits={clearAllUpdatingCredits}
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
                    />
                  } />
                  <Route path={PAGES.MY_CARDS.PATH} element={
                    <ProtectedRoute>
                      <MyCards 
                        onCardsUpdate={getCreditCards} 
                        onOpenCardSelector={() => setIsCardSelectorOpen(true)} 
                        reloadTrigger={cardsVersion}
                        onPreferencesUpdate={refreshComponentPreferences}
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
                  <Route path={PAGES.DELETE_ACCOUNT.PATH} element={
                    <ProtectedRoute>
                      <DeleteAccount />
                    </ProtectedRoute>
                  } />
                  <Route path={PAGES.HELP_CENTER.PATH} element={
                    <ProtectedRoute>
                      <Help />
                    </ProtectedRoute>
                  }>
                    <Route index element={<GettingStarted />} />
                    <Route path="ask-ai" element={<AskAI />} />
                    <Route path="ask-ai/prompts" element={<AskAIPrompts />} />
                    <Route path="ask-ai/tips" element={<AskAITips />} />
                    <Route path="cards" element={<Cards />} />
                    <Route path="cards/settings" element={<CardsSettings />} />
                    <Route path="cards/details" element={<CardsDetails />} />
                    <Route path="credits" element={<Credits />} />
                    <Route path="credits/dashboard" element={<CreditsDashboard />} />
                    <Route path="credits/updating" element={<CreditsUpdating />} />
                    <Route path="credits/history" element={<CreditsHistoryHelp />} />
                    <Route path="reference/colors" element={<ReferenceColors />} />
                    <Route path="reference/frequencies" element={<ReferenceFrequencies />} />
                    <Route path="glossary" element={<Glossary />} />
                    <Route path="faq" element={<FAQ />} />
                    <Route path="troubleshooting" element={<Troubleshooting />} />
                  </Route>
                </Routes>
              </UniversalContentWrapper>
            );
          })()
          )}
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
