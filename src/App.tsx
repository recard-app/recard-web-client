import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { APP_NAME, PAGE_NAMES, PAGE_ICONS, ICON_PRIMARY_MEDIUM, PAGES, PageUtils, MOBILE_BREAKPOINT, UserCreditCard, UserCredit, CreditCardDetails, CardCredit, CardPerk, EnrichedMultiplier } from './types';
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
  ComponentService,
  BootstrapService,
  hasRequiredBootstrapSections
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
import Onboarding from './pages/authentication/Onboarding';
import AuthAction from './pages/authentication/AuthAction';
import History from './pages/history/History';
import MyCards from './pages/my-cards/MyCards';
import MyCredits from './pages/my-credits/MyCredits';
import CreditsPortfolio from './pages/my-credits/history/CreditsPortfolio';
import DesignSystem from './pages/design-system/DesignSystem';
import FullComponents from './pages/design-system/components/FullComponents';
import ButtonsShowcase from './pages/design-system/buttons/ButtonsShowcase';
import LandingPage from './pages/landing/LandingPage';
import { Help } from './pages/help';
import { HelpArticleRenderer } from './pages/help/components';
import { TermsOfService, PrivacyPolicy } from './pages/legal';
import NotFound from './pages/not-found/NotFound';
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
import { ComponentsProvider } from './contexts/ComponentsContext';
import { useComponents } from './contexts/useComponents';
import { CreditDrawerProvider, CreditDrawerBridge } from './contexts/CreditDrawerContext';
import CreditCardDetailView from './components/CreditCardDetailView';
import { CARD_TABS } from './components/CreditCardDetailView/cardTabs';
import type { TabType } from './components/CreditCardDetailView/cardTabs';
import CreditDetailedSummary from './components/CreditSummary/CreditDetailedSummary';
import UniversalContentWrapper from './components/UniversalContentWrapper';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from './components/ui/drawer';
import PageHeader from './components/PageHeader';
import MobileHeader from './components/MobileHeader';
import { InfoDisplay, SearchField, TabBar } from './elements';

// Context
import { useAuth } from './context/useAuth';

// Hooks
import { usePageBackground } from './hooks/usePageBackground';
import { useViewportHeight } from './hooks/useViewportHeight';
import { usePageMeta } from './hooks/usePageMeta';
import { usePWAInstall } from './hooks/usePWAInstall';
import { InstallAppDrawer } from './components/InstallAppDrawer';

// Constants and Types
import {
  GLOBAL_QUICK_HISTORY_SIZE,
  CHAT_HISTORY_PREFERENCE,
  AGENT_MODE_PREFERENCE,
  SUBSCRIPTION_PLAN,
  SUBSCRIPTION_STATUS,
  LOADING_ICON,
  LOADING_ICON_SIZE,
  STREAMING_STATUS,
  Conversation,
  ChatHistoryPreference,
  AgentModePreference,
  InstructionsPreference,
  SubscriptionPlan,
  SubscriptionStatusType,
  MonthlyStatsResponse
} from './types';

// Types
import {
  CreditCard
} from './types/CreditCardTypes';
import { UserComponentTrackingPreferences, PrioritizedCredit } from './types/CardCreditsTypes';
import { FullHeightContext } from './hooks/useFullHeight';
import { ScrollHeightContext } from './hooks/useScrollHeight';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

const DEFERRED_CREDITS_IDLE_TIMEOUT_MS = 2000;
const DEFERRED_CREDITS_TIMEOUT_FALLBACK_MS = 0;
const ENABLE_PROACTIVE_INSTALL_DRAWER = false;
const SIDEBAR_POLL_TIMEOUT_MS = 20 * 1000;
const MONTHLY_SUMMARY_QUERY = {
  showRedeemed: true,
  includeHidden: false,
  limit: 0
} as const;

interface AppContentProps {}

function AppContent({}: AppContentProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesignSystemPage = location.pathname.startsWith('/design');
  const { refetch: refetchComponents, hydrate: hydrateComponents } = useComponents();

  // Enable dynamic page background colors
  usePageBackground();
  // Ensure iOS Safari uses visible viewport height
  useViewportHeight();

  // SEO: dynamic title, meta description, canonical, noindex
  const authPaths = new Set<string>([PAGES.SIGN_IN.PATH, PAGES.SIGN_UP.PATH, PAGES.FORGOT_PASSWORD.PATH, PAGES.AUTH_ACTION.PATH]);
  const isAuthRoute = authPaths.has(location.pathname);
  const isLegalPage = location.pathname === PAGES.TERMS_OF_SERVICE.PATH || location.pathname === PAGES.PRIVACY_POLICY.PATH;
  const isOnboardingRoute = location.pathname === PAGES.ONBOARDING.PATH;
  const isLandingPage = !user && !isAuthRoute && !isLegalPage && location.pathname === '/';
  const pageMeta = usePageMeta(isLandingPage);

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
  const [isLoadingMonthlyStats, setIsLoadingMonthlyStats] = useState<boolean>(false);
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
  const [isLoadingPrioritizedCredits, setIsLoadingPrioritizedCredits] = useState<boolean>(false);
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
  const [isChatScrolled, setIsChatScrolled] = useState(false);
  // State for storing user preferences instructions
  const [preferencesInstructions, setPreferencesInstructions] = useState<InstructionsPreference>('');
  // State for managing chat history preference (keep/clear)
  const [chatHistoryPreference, setChatHistoryPreference] = useState<ChatHistoryPreference>(CHAT_HISTORY_PREFERENCE.KEEP_HISTORY);
  // State for managing agent mode preference (simplified/orchestrated)
  const [agentModePreference, setAgentModePreference] = useState<AgentModePreference>(AGENT_MODE_PREFERENCE.SIMPLIFIED);
  // State for daily digest (persists across chat sessions)
  const [digest, setDigest] = useState<{ title: string; content: string; generatedAt?: string } | null>(null);
  const [digestLoading, setDigestLoading] = useState<boolean>(false);
  const [isRegeneratingDigest, setIsRegeneratingDigest] = useState<boolean>(false);
  const digestFetchedRef = useRef<boolean>(false);
  // State for tracking user's subscription plan and status
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatusType>(SUBSCRIPTION_STATUS.NONE);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);
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
  const [cardDetailActiveTab, setCardDetailActiveTab] = useState<TabType>('overview');
  // Credit drawer controls via ref (populated by CreditDrawerBridge inside the provider)
  const creditDrawerRef = useRef<{
    openDrawer: (params: { cardId: string; creditId: string; year?: number; isLoading?: boolean; initialPeriodNumber?: number; fallbackData?: { userCredit: UserCredit; card: CreditCardDetails; cardCredit: CardCredit | null } }) => void;
    closeDrawer: () => void;
    setLoading: (loading: boolean) => void;
    setFallbackData: (data: { userCredit: UserCredit; card: CreditCardDetails; cardCredit: CardCredit | null }) => void;
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
  const creditCardSelectorRef = useRef<CreditCardSelectorRef>(null);
  // Ref to track if we're intentionally clearing the chat (prevents sync effect from redirecting)
  const isClearingChatRef = useRef<boolean>(false);

  // PWA install state
  const [isInstallDrawerOpen, setIsInstallDrawerOpen] = useState(false);
  const {
    shouldProactiveShow,
    platform: installPlatform,
    promptInstall,
    markDismissed: markInstallDismissed,
    markProactiveShown
  } = usePWAInstall();

  // Effect to reset current chat ID when user changes
  useEffect(() => {
    setCurrentChatId(null);
  }, [user]);

  // Proactive PWA install prompt (one-time, 3s after mount)
  useEffect(() => {
    if (!ENABLE_PROACTIVE_INSTALL_DRAWER || !shouldProactiveShow || isOnboardingRoute || isAuthRoute) return;

    const timer = setTimeout(() => {
      setIsInstallDrawerOpen(true);
      markProactiveShown();
    }, 3000);

    return () => clearTimeout(timer);
  }, [shouldProactiveShow, markProactiveShown, isOnboardingRoute, isAuthRoute]);

  // Effect to fetch daily digest when user is authenticated
  useEffect(() => {
    if (!user) {
      // Reset digest when user logs out
      setDigest(null);
      setDigestLoading(false);
      digestFetchedRef.current = false;
      return;
    }

    // Only fetch once per session
    if (digestFetchedRef.current) return;

    digestFetchedRef.current = true;

    let cancelled = false;
    let hasExecuted = false;
    let idleCallbackId: number | null = null;
    let timeoutId: number | null = null;

    const runDigestFetch = () => {
      if (cancelled || hasExecuted) return;
      hasExecuted = true;

      setDigestLoading(true);

      UserService.fetchDailyDigest()
        .then(response => {
          if (cancelled || !response) return;
          setDigest({
            title: response.data.title,
            content: response.data.content,
            generatedAt: response.data.generatedAt
          });
        })
        .catch(() => {
          // Silent failure - digest is optional
        })
        .finally(() => {
          if (!cancelled) {
            setDigestLoading(false);
          }
        });
    };

    if (typeof window !== 'undefined') {
      const windowWithIdle = window as Window & {
        requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
        cancelIdleCallback?: (handle: number) => void;
      };
      const hasIdleSupport = typeof windowWithIdle.requestIdleCallback === 'function';

      if (hasIdleSupport) {
        idleCallbackId = windowWithIdle.requestIdleCallback(runDigestFetch, {
          timeout: DEFERRED_CREDITS_IDLE_TIMEOUT_MS
        });
      }

      const fallbackDelayMs = hasIdleSupport
        ? DEFERRED_CREDITS_IDLE_TIMEOUT_MS + 100
        : DEFERRED_CREDITS_TIMEOUT_FALLBACK_MS;
      timeoutId = window.setTimeout(runDigestFetch, fallbackDelayMs);
    } else {
      runDigestFetch();
    }

    return () => {
      cancelled = true;
      // Reset ref so a StrictMode re-mount (or re-auth) can re-fetch
      digestFetchedRef.current = false;

      if (typeof window !== 'undefined') {
        const windowWithIdle = window as Window & {
          cancelIdleCallback?: (handle: number) => void;
        };

        if (idleCallbackId !== null && typeof windowWithIdle.cancelIdleCallback === 'function') {
          windowWithIdle.cancelIdleCallback(idleCallbackId);
        }
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }
      }
    };
  }, [user]);

  // Handler to regenerate the daily digest
  const handleRegenerateDigest = async () => {
    if (isRegeneratingDigest) return;

    setIsRegeneratingDigest(true);
    try {
      const response = await UserService.fetchDailyDigest(true); // force refresh
      if (response) {
        setDigest({
          title: response.data.title,
          content: response.data.content,
          generatedAt: response.data.generatedAt
        });
      }
    } catch {
      // Silent failure - user can try again
    } finally {
      setIsRegeneratingDigest(false);
    }
  };

  // Effect to handle navigation when on root path with active chat
  useEffect(() => {
    // Don't redirect if we're intentionally clearing the chat
    // This prevents the race condition where we try to restore a chat we're actively clearing
    if (location.pathname === PAGES.HOME.PATH && currentChatId && !isClearingChatRef.current) {
      navigate(`/chat/${currentChatId}`, { replace: true });
    }
  }, [location.pathname, currentChatId, navigate]);

  
  // Ref to prevent duplicate initial loads
  const isLoadingRef = useRef(false);
  const isSyncingCreditsRef = useRef(false);
  const isFetchingMonthlySummaryRef = useRef(false);
  const activeUserIdRef = useRef<string | null>(user?.uid ?? null);
  const deferredIdleCallbackIdRef = useRef<number | null>(null);
  const deferredTimeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    activeUserIdRef.current = user?.uid ?? null;
  }, [user]);

  const cancelDeferredCreditsTask = (): void => {
    if (typeof window === 'undefined') return;

    const windowWithIdle = window as Window & {
      cancelIdleCallback?: (handle: number) => void;
    };

    if (deferredIdleCallbackIdRef.current !== null && typeof windowWithIdle.cancelIdleCallback === 'function') {
      windowWithIdle.cancelIdleCallback(deferredIdleCallbackIdRef.current);
    }
    if (deferredTimeoutIdRef.current !== null) {
      window.clearTimeout(deferredTimeoutIdRef.current);
    }

    deferredIdleCallbackIdRef.current = null;
    deferredTimeoutIdRef.current = null;
  };

  useEffect(() => {
    return () => {
      cancelDeferredCreditsTask();
    };
  }, []);

  const buildUserCardMetadataMap = (userCardsData: UserCreditCard[]): Map<string, UserCreditCard> => {
    const metadataMap = new Map<string, UserCreditCard>();
    userCardsData.forEach((userCard: UserCreditCard) => {
      metadataMap.set(userCard.cardReferenceId, userCard);
    });
    return metadataMap;
  };

  const fetchMonthlySummary = async ({
    showLoading = false,
    markUpdatingComplete = false,
    force = false
  }: {
    showLoading?: boolean;
    markUpdatingComplete?: boolean;
    force?: boolean;
  } = {}): Promise<void> => {
    if (!user) return;
    if (!force && monthlyStats) return;
    if (isFetchingMonthlySummaryRef.current) return;

    if (showLoading) {
      setIsLoadingMonthlyStats(true);
      setIsLoadingPrioritizedCredits(true);
    }

    isFetchingMonthlySummaryRef.current = true;

    try {
      const summaryData = await UserCreditService.fetchMonthlySummary(MONTHLY_SUMMARY_QUERY);

      setMonthlyStats(summaryData);
      setPrioritizedCredits(summaryData.PrioritizedCredits?.credits ?? []);
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    } finally {
      isFetchingMonthlySummaryRef.current = false;

      if (showLoading) {
        setIsLoadingMonthlyStats(false);
        setIsLoadingPrioritizedCredits(false);
      }

      if (markUpdatingComplete) {
        setIsUpdatingMonthlyStats(false);
        setUpdatingCreditIds(new Set());
      }
    }
  };

  const syncCreditsInBackground = async (): Promise<void> => {
    if (!user || isSyncingCreditsRef.current) return;

    isSyncingCreditsRef.current = true;

    try {
      await UserCreditService.syncCurrentYearCredits();
    } catch (error) {
      console.error('Error syncing current year credits:', error);
    } finally {
      isSyncingCreditsRef.current = false;
    }
  };

  const scheduleDeferredCreditsTasks = ({
    prefetchMonthlySummary = false,
    forceMonthlyRefresh = false
  }: {
    prefetchMonthlySummary?: boolean;
    forceMonthlyRefresh?: boolean;
  } = {}): void => {
    const scheduledUserId = activeUserIdRef.current;
    if (!scheduledUserId) return;

    cancelDeferredCreditsTask();

    const runDeferredWork = async () => {
      if (activeUserIdRef.current !== scheduledUserId) return;
      await syncCreditsInBackground();
      if (activeUserIdRef.current !== scheduledUserId) return;
      if (prefetchMonthlySummary) {
        await fetchMonthlySummary({ showLoading: false, force: forceMonthlyRefresh });
      }
    };

    if (typeof window !== 'undefined') {
      const windowWithIdle = window as Window & {
        requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
        cancelIdleCallback?: (handle: number) => void;
      };
      const hasIdleSupport = typeof windowWithIdle.requestIdleCallback === 'function';
      let hasExecuted = false;
      const execute = () => {
        if (hasExecuted) return;
        hasExecuted = true;

        if (deferredIdleCallbackIdRef.current !== null && typeof windowWithIdle.cancelIdleCallback === 'function') {
          windowWithIdle.cancelIdleCallback(deferredIdleCallbackIdRef.current);
        }
        if (deferredTimeoutIdRef.current !== null) {
          window.clearTimeout(deferredTimeoutIdRef.current);
        }

        deferredIdleCallbackIdRef.current = null;
        deferredTimeoutIdRef.current = null;

        void runDeferredWork();
      };

      if (hasIdleSupport) {
        deferredIdleCallbackIdRef.current = windowWithIdle.requestIdleCallback(execute, {
          timeout: DEFERRED_CREDITS_IDLE_TIMEOUT_MS
        });
      }

      const fallbackDelayMs = hasIdleSupport
        ? DEFERRED_CREDITS_IDLE_TIMEOUT_MS + 100
        : DEFERRED_CREDITS_TIMEOUT_FALLBACK_MS;
      deferredTimeoutIdRef.current = window.setTimeout(execute, fallbackDelayMs);
      return;
    }

    void runDeferredWork();
  };

  // Effect to fetch all initial data in parallel batches when user is authenticated
  useEffect(() => {
    const applyBootstrapData = (
      bootstrapResponse: {
        cards: {
          previews: CreditCard[];
          userCards: UserCreditCard[];
          details: CreditCardDetails[];
        };
        subscription: {
          plan: SubscriptionPlan;
          status: SubscriptionStatusType;
          billingPeriod: string | null;
          expiresAt: string | null;
        };
        preferences: {
          instructions: string;
          chatHistory: ChatHistoryPreference;
          agentMode: AgentModePreference;
        };
        components: {
          perks: CardPerk[];
          credits: CardCredit[];
          multipliers: EnrichedMultiplier[];
        };
        componentPreferences: UserComponentTrackingPreferences;
        history: {
          previews: Conversation[];
          priorityChat?: Conversation | null;
        };
      },
      urlChatId: string | null
    ): void => {
      setCreditCards(bootstrapResponse.cards.previews);
      setSubscriptionPlan(bootstrapResponse.subscription.plan);
      setSubscriptionStatus(bootstrapResponse.subscription.status);
      setSubscriptionExpiresAt(bootstrapResponse.subscription.expiresAt);
      setComponentPreferences(bootstrapResponse.componentPreferences);
      setPreferencesInstructions(bootstrapResponse.preferences.instructions || '');
      setChatHistoryPreference(bootstrapResponse.preferences.chatHistory);
      setAgentModePreference(bootstrapResponse.preferences.agentMode || AGENT_MODE_PREFERENCE.SIMPLIFIED);
      setUserDetailedCardDetails(bootstrapResponse.cards.details);
      setUserCardsMetadata(buildUserCardMetadataMap(bootstrapResponse.cards.userCards));
      hydrateComponents({
        perks: bootstrapResponse.components.perks,
        credits: bootstrapResponse.components.credits,
        multipliers: bootstrapResponse.components.multipliers,
      });

      const chatHistoryList = [...(bootstrapResponse.history.previews || [])];
      const priorityChat = bootstrapResponse.history.priorityChat;

      if (urlChatId && priorityChat) {
        const existingPriorityIndex = chatHistoryList.findIndex(chat => chat.chatId === urlChatId);
        if (existingPriorityIndex >= 0) {
          chatHistoryList[existingPriorityIndex] = priorityChat;
        } else {
          chatHistoryList.unshift(priorityChat);
        }
      }

      setChatHistory(chatHistoryList);
      if (urlChatId) {
        setCurrentChatId(urlChatId);
      }
    };

    const loadLegacyInitialData = async (urlChatId: string | null): Promise<void> => {
      const [
        cards,
        subscriptionData,
        componentPrefs,
        allPreferences,
        detailedInfo,
        userCardsData,
        historyResponse,
        priorityChat,
        componentsData,
      ] = await Promise.all([
        CardService.fetchCreditCards(true).catch(error => {
          console.error('Error fetching credit cards:', error);
          return [];
        }),
        UserService.fetchUserSubscription().catch(error => {
          console.error('Error fetching subscription plan:', error);
          return {
            subscriptionPlan: SUBSCRIPTION_PLAN.FREE as SubscriptionPlan,
            subscriptionStatus: SUBSCRIPTION_STATUS.NONE as SubscriptionStatusType,
            subscriptionBillingPeriod: null,
            subscriptionExpiresAt: null,
          };
        }),
        UserComponentService.fetchComponentTrackingPreferences().catch(error => {
          console.error('Error fetching component tracking preferences:', error);
          return { Cards: [] };
        }),
        UserPreferencesService.loadAllPreferences().catch(error => {
          console.error('Error fetching user preferences:', error);
          return {
            success: false,
            instructions: '',
            chatHistory: CHAT_HISTORY_PREFERENCE.KEEP_HISTORY,
            agentMode: AGENT_MODE_PREFERENCE.SIMPLIFIED,
          };
        }),
        UserCreditCardService.fetchUserCardsDetailedInfo().catch(error => {
          console.error('Error fetching user detailed card info:', error);
          return [];
        }),
        UserCreditCardService.fetchUserCards().catch(error => {
          console.error('Error fetching user cards metadata:', error);
          return [];
        }),
        UserHistoryService.fetchChatHistoryPreview(GLOBAL_QUICK_HISTORY_SIZE).catch(error => {
          console.error('Error fetching chat history preview:', error);
          return { chatHistory: [] };
        }),
        urlChatId
          ? UserHistoryService.fetchChatHistoryById(urlChatId).catch(error => {
              console.error('Error fetching priority chat:', error);
              return null;
            })
          : Promise.resolve(null),
        ComponentService.fetchAllUserCardComponents().catch(error => {
          console.error('Error fetching components:', error);
          return { perks: [], credits: [], multipliers: [] };
        }),
      ]);

      setCreditCards(cards);
      setSubscriptionPlan(subscriptionData.subscriptionPlan);
      setSubscriptionStatus(subscriptionData.subscriptionStatus);
      setSubscriptionExpiresAt(subscriptionData.subscriptionExpiresAt);
      setComponentPreferences(componentPrefs);
      setPreferencesInstructions(allPreferences.instructions || '');
      setChatHistoryPreference(allPreferences.chatHistory);
      setAgentModePreference(allPreferences.agentMode || AGENT_MODE_PREFERENCE.SIMPLIFIED);
      setUserDetailedCardDetails(detailedInfo);
      setUserCardsMetadata(buildUserCardMetadataMap(userCardsData));
      hydrateComponents(componentsData);

      const chatHistoryList: Conversation[] = [...(historyResponse.chatHistory || [])];
      if (urlChatId && priorityChat) {
        const existingPriorityIndex = chatHistoryList.findIndex(chat => chat.chatId === urlChatId);
        if (existingPriorityIndex >= 0) {
          chatHistoryList[existingPriorityIndex] = priorityChat;
        } else {
          chatHistoryList.unshift(priorityChat);
        }
      }

      setChatHistory(chatHistoryList);
      if (urlChatId) {
        setCurrentChatId(urlChatId);
      }
    };

    const loadInitialData = async () => {
      if (!user) {
        // Reset all states when user is not authenticated
        setCreditCards([]);
        setComponentPreferences(null);
        setUserDetailedCardDetails([]);
        setChatHistory([]);
        setSubscriptionPlan(null);
        setSubscriptionStatus(SUBSCRIPTION_STATUS.NONE);
        setSubscriptionExpiresAt(null);
        setPreferencesInstructions('');
        setChatHistoryPreference(CHAT_HISTORY_PREFERENCE.KEEP_HISTORY);
        setAgentModePreference(AGENT_MODE_PREFERENCE.SIMPLIFIED);
        setMonthlyStats(null);
        setPrioritizedCredits([]);
        setIsUpdatingMonthlyStats(false);
        setUpdatingCreditIds(new Set());
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
      setIsLoadingMonthlyStats(false);
      setIsLoadingPrioritizedCredits(false);

      try {
        // Extract chatId from URL if present (priority loading for initial chat hydration)
        const currentPath = location.pathname;
        const urlChatId = PageUtils.getChatIdFromPath(currentPath);
        let bootstrapLoaded = false;

        try {
          const bootstrapResponse = await BootstrapService.fetchBootstrap({
            historySize: GLOBAL_QUICK_HISTORY_SIZE,
            chatId: urlChatId,
          });

          if (!hasRequiredBootstrapSections(bootstrapResponse)) {
            throw new Error('Bootstrap response missing required sections');
          }

          applyBootstrapData(bootstrapResponse, urlChatId);
          bootstrapLoaded = true;
        } catch (bootstrapError) {
          console.warn('Bootstrap load failed, falling back to legacy endpoint fan-out:', bootstrapError);
        }

        if (!bootstrapLoaded) {
          await loadLegacyInitialData(urlChatId);
        }

        setLastUpdateTimestamp(new Date().toISOString());
        scheduleDeferredCreditsTasks({ prefetchMonthlySummary: true, forceMonthlyRefresh: false });
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

    void loadInitialData();
  }, [user]); // Refresh only when user changes

  // Refresh only card-related data when cardsVersion changes (card edits / agent card actions)
  useEffect(() => {
    if (!user || cardsVersion === 0) return;

    const refreshCardData = async () => {
      try {
        const [cards, details, userCardsData, preferences] = await Promise.all([
          CardService.fetchCreditCards(true),
          UserCreditCardService.fetchUserCardsDetailedInfo(),
          UserCreditCardService.fetchUserCards(),
          UserComponentService.fetchComponentTrackingPreferences().catch(error => {
            console.error('Error fetching component tracking preferences after card update:', error);
            return null;
          }),
        ]);

        setCreditCards(cards);
        setUserDetailedCardDetails(details);
        setUserCardsMetadata(buildUserCardMetadataMap(userCardsData));

        if (preferences) {
          setComponentPreferences(preferences);
        }

        await refetchComponents();
        scheduleDeferredCreditsTasks({ prefetchMonthlySummary: true, forceMonthlyRefresh: true });
      } catch (error) {
        console.error('Error refreshing card-related data:', error);
      }
    };

    void refreshCardData();
  }, [cardsVersion, user]);

  // Update current chat ID when URL changes (no API calls here)
  useEffect(() => {
    // Skip if we're intentionally clearing the chat to avoid race conditions
    if (isClearingChatRef.current) return;

    const currentPath = location.pathname;
    const urlChatId = PageUtils.getChatIdFromPath(currentPath);

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

        // Merge server data but prevent the specific race where:
        // local just set 'null' (handleMessageComplete) but server still has 'streaming'
        // because the server-side clear hasn't propagated yet.
        // Allow 'complete' from server to come through (it's a real state transition).
        setChatHistory(prevHistory => {
          const localByChat = new Map<string, Conversation>();
          for (const chat of prevHistory) {
            localByChat.set(chat.chatId, chat);
          }

          // Merge each server entry with local overrides
          const serverChatIds = new Set<string>();
          const merged = response.chatHistory.map(serverChat => {
            serverChatIds.add(serverChat.chatId);
            const local = localByChat.get(serverChat.chatId);
            let entry = serverChat;

            if (local) {
              // Preserve local conversation/componentBlocks when the server
              // returns empty (lightweight preview has no conversation data).
              if ((!entry.conversation || entry.conversation.length === 0)
                  && local.conversation && local.conversation.length > 0) {
                entry = {
                  ...entry,
                  conversation: local.conversation,
                  componentBlocks: local.componentBlocks,
                };
              }

              // Keep local timestamp if newer
              if (local.timestamp > serverChat.timestamp) {
                entry = { ...entry, timestamp: local.timestamp };
              }

              const ls = local.streamingStatus;
              const ss = entry.streamingStatus;

              if (ls === STREAMING_STATUS.STREAMING && !ss) {
                entry = { ...entry, streamingStatus: STREAMING_STATUS.STREAMING };
              } else if ((ls === null || ls === undefined) && ss === STREAMING_STATUS.STREAMING) {
                entry = { ...entry, streamingStatus: null };
              }
            }

            if (entry.chatId === currentChatId
                && entry.streamingStatus === STREAMING_STATUS.COMPLETE) {
              entry = { ...entry, streamingStatus: null };
            }
            return entry;
          });

          // Keep local-only entries that aren't in the server response
          // (e.g. chats that fell out of the 3-entry preview but are still streaming)
          for (const local of prevHistory) {
            if (!serverChatIds.has(local.chatId) && local.streamingStatus === STREAMING_STATUS.STREAMING) {
              merged.push(local);
            }
          }

          return merged;
        });
        setLastUpdateTimestamp(new Date().toISOString());
      } catch (error) {
        console.error('Error refreshing chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    refreshHistory();
  }, [historyRefreshTrigger, chatHistoryPreference]);

  // Poll sidebar when any chat is streaming so the indicator updates
  // when the server finishes (writes 'complete' or null) even if the user
  // is viewing a different page. Stops when no chats are streaming or
  // after 20 seconds to avoid indefinite polling.
  useEffect(() => {
    const hasStreaming = chatHistory.some(c => c.streamingStatus === STREAMING_STATUS.STREAMING);
    if (!hasStreaming || !user) return;

    const interval = setInterval(() => {
      setHistoryRefreshTrigger(prev => prev + 1);
    }, 3000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, SIDEBAR_POLL_TIMEOUT_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [chatHistory, user]);

  // Effect to handle monthly stats refresh triggers (for updates from other components)
  useEffect(() => {
    const refreshMonthlyStats = async () => {
      if (!user || monthlyStatsRefreshTrigger === 0) return;

      // If we already have data, refresh silently in the background.
      // If not, show loading so credits views can render a skeleton.
      const shouldShowLoading = !monthlyStats;
      await fetchMonthlySummary({
        showLoading: shouldShowLoading,
        markUpdatingComplete: true,
        force: true
      });
    };

    void refreshMonthlyStats();
  }, [monthlyStatsRefreshTrigger, user]);

  // Monthly summary is non-critical for first paint; fetch on-demand for credits-focused UI surfaces
  useEffect(() => {
    if (!user) return;

    const isCreditsRoute = location.pathname.startsWith(PAGES.MY_CREDITS.PATH);
    const shouldLoadOnDemand = isDetailedSummaryOpen || isCreditsRoute;

    if (!shouldLoadOnDemand) return;
    if (monthlyStats) return;

    void fetchMonthlySummary({ showLoading: true, force: false });
  }, [isDetailedSummaryOpen, location.pathname, monthlyStats, user]);

  // Function to update credit cards and refresh user card details
  const getCreditCards = async (returnCreditCards: CreditCard[]): Promise<void> => {
    setCreditCards(returnCreditCards);

    // After updating credit cards, fetch fresh user card details and metadata
    if (user) {
      try {
        const [details, userCardsData] = await Promise.all([
          UserCreditCardService.fetchUserCardsDetailedInfo(),
          UserCreditCardService.fetchUserCards(),
        ]);
        setUserDetailedCardDetails(details);
        setUserCardsMetadata(buildUserCardMetadataMap(userCardsData));

        // Refetch components (perks, credits, multipliers) for the updated cards
        await refetchComponents();
        setMonthlyStatsRefreshTrigger(prev => prev + 1);
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
  const getCurrentChatId = useCallback((returnCurrentChatId: string | null): void => {
    setCurrentChatId(returnCurrentChatId);
  }, []);

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
    setAgentModePreference(AGENT_MODE_PREFERENCE.SIMPLIFIED);

    // Perform logout and navigation
    await logout();
    navigate(PAGES.SIGN_IN.PATH);
  };

  // Upsert a chat entry in local history state.
  // `skipRefresh` is used for local status-only updates (for example, clearing
  // streamingStatus) so a stale server fetch does not immediately overwrite
  // the optimistic local value.
  const handleHistoryUpsert = useCallback((
    updatedChat: Conversation,
    skipRefresh: boolean = false
  ): void => {
    if (!updatedChat) return;

    // Check existence synchronously before the state update so the refresh
    // decision doesn't rely on a mutable flag set inside the updater.
    const isExisting = chatHistory.some(chat => chat.chatId === updatedChat.chatId);

    setChatHistory(prevHistory => {
      const existingIndex = prevHistory.findIndex(chat => chat.chatId === updatedChat.chatId);
      if (existingIndex === -1) {
        return [updatedChat, ...prevHistory];
      }

      const existing = prevHistory[existingIndex];
      const merged = {
        ...updatedChat,
        // Keep the existing title if the incoming one is the default placeholder.
        chatDescription: (updatedChat.chatDescription && updatedChat.chatDescription !== 'New Chat')
          ? updatedChat.chatDescription
          : (existing.chatDescription || updatedChat.chatDescription),
        // Preserve whichever timestamp is newer so chat ordering stays stable.
        timestamp: updatedChat.timestamp > existing.timestamp
          ? updatedChat.timestamp
          : existing.timestamp,
      };

      // Move to front if the conversation grew (new message sent/received).
      // This ensures chats with new activity appear at the top of the sidebar.
      const existingMsgCount = existing.conversation?.length ?? 0;
      const updatedMsgCount = updatedChat.conversation?.length ?? 0;
      const hasNewMessages = updatedMsgCount > existingMsgCount;

      if (hasNewMessages && existingIndex > 0) {
        const nextHistory = prevHistory.filter((_, i) => i !== existingIndex);
        return [merged, ...nextHistory];
      }

      const nextHistory = [...prevHistory];
      nextHistory[existingIndex] = merged;
      return nextHistory;
    });

    setLastUpdateTimestamp(new Date().toISOString());

    if (isExisting && !skipRefresh) {
      setHistoryRefreshTrigger(prev => prev + 1);
    }
  }, [chatHistory]);

  // Delete a chat entry and only clear the active prompt if it was the active chat.
  const handleHistoryDelete = async (deletedChatId: string): Promise<void> => {
    if (!deletedChatId) return;

    setChatHistory(prevHistory => (
      prevHistory.filter(chat => chat.chatId !== deletedChatId)
    ));

    if (deletedChatId === currentChatId) {
      handleClearChat();
    }

    setLastUpdateTimestamp(new Date().toISOString());
    setHistoryRefreshTrigger(prev => prev + 1);
  };

  // Trigger a history refetch without mutating local chat list state.
  const handleHistoryRefresh = useCallback(async (): Promise<void> => {
    setLastUpdateTimestamp(new Date().toISOString());
    setHistoryRefreshTrigger(prev => prev + 1);
  }, []);

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
        setCardDetailActiveTab('overview');
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
      setCardDetailActiveTab('overview');
      setIsCardDetailsOpen(true);
    }
  };

  // Function to handle multiplier click - opens card drawer to multipliers tab
  const handleMultiplierClick = (cardId: string, _multiplierId: string) => {
    const details = userDetailedCardDetails.find(detail => detail.id === cardId);
    if (details) {
      setSelectedCardDetails(details);
      setCardDetailActiveTab('multipliers');
      setIsCardDetailsOpen(true);
    }
  };

  // Function to handle credit selection by ID (for chat component clicks)
  // Opens drawer immediately with loading state, then fetches data
  const handleCreditSelect = async (cardId: string, creditId: string) => {
    const drawer = creditDrawerRef.current;
    if (!drawer) return;

    drawer.openDrawer({ cardId, creditId, isLoading: true });

    try {
      const currentYear = new Date().getFullYear();
      const result = await UserCreditService.fetchCreditDetails(cardId, creditId, currentYear);

      drawer.setFallbackData({
        userCredit: result.credit,
        card: result.cardDetails,
        cardCredit: result.creditDetails || null,
      });
      drawer.setLoading(false);
    } catch (error) {
      console.error('Failed to fetch credit details:', error);
      drawer.closeDrawer();
    }
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
      // Trigger card-only refresh effect
      setCardsVersion(v => v + 1);
    } else {
      toast.error(message);
    }
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
              onHistoryUpsert={handleHistoryUpsert}
              clearChatCallback={clearChatCallback}
              setClearChatCallback={setClearChatCallback}
              existingHistoryList={chatHistory}
              chatHistoryPreference={chatHistoryPreference}
              agentModePreference={agentModePreference}
              isLoadingHistory={isLoadingHistory}
              onNewChat={handleClearChat}
              onCardSelect={handleCardSelectById}
              onCreditClick={handleCreditSelect}
              onMultiplierClick={handleMultiplierClick}
              onRefreshCredits={() => setMonthlyStatsRefreshTrigger(prev => prev + 1)}
              onRefreshCards={() => setCardsVersion(v => v + 1)}
              digest={digest}
              digestLoading={digestLoading}
              onRegenerateDigest={handleRegenerateDigest}
              isRegeneratingDigest={isRegeneratingDigest}
              onChatScrolledChange={setIsChatScrolled}
              onHistoryRefresh={handleHistoryRefresh}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <FullHeightContext.Provider value={{ setFullHeight: setNeedsFullHeight }}>
      <ScrollHeightContext.Provider value={{ setScrollHeight: setNeedsScrollHeight }}>
        <CreditDrawerProvider
          prioritizedCredits={prioritizedCredits}
          userDetailedCardDetails={userDetailedCardDetails}
          onUpdateComplete={() => setMonthlyStatsRefreshTrigger(prev => prev + 1)}
          onAddUpdatingCreditId={addUpdatingCreditId}
          onRemoveUpdatingCreditId={removeUpdatingCreditId}
          isCreditUpdating={isCreditUpdating}
        >
        <CreditDrawerBridge drawerRef={creditDrawerRef} />
        <div className="app">
          <Toaster position="top-right" richColors />
          {pageMeta}

          {/* PWA Install Drawer - hidden on auth and onboarding pages */}
          {!isAuthRoute && !isOnboardingRoute && (
            <InstallAppDrawer
              open={isInstallDrawerOpen}
              onOpenChange={setIsInstallDrawerOpen}
              platform={installPlatform}
              onInstall={promptInstall}
              onDismiss={() => {
                markInstallDismissed();
                setIsInstallDrawerOpen(false);
              }}
            />
          )}

          {/* Check if current route is an auth page (no sidebar/nav should show) */}
          {(() => {
            return (
              <>
                {/* Universal Sidebar - shown on all pages when user is authenticated (except auth pages and design system) */}
                {user && !isDesignSystemPage && !isAuthRoute && !isOnboardingRoute && (
            <AppSidebar
              isOpen={isSidePanelOpen}
              onToggle={toggleSidePanel}
              chatHistory={chatHistory}
              currentChatId={currentChatId}
              onCurrentChatIdChange={getCurrentChatId}
              onHistoryDelete={handleHistoryDelete}
              onHistoryRefresh={handleHistoryRefresh}
              subscriptionPlan={subscriptionPlan}
              creditCards={creditCards}
              isLoadingCreditCards={isLoadingCreditCards}
              isLoadingHistory={isLoadingHistory}
              onCardSelect={handleCardSelect}
              quickHistorySize={GLOBAL_QUICK_HISTORY_SIZE}
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
                {user && !isAuthRoute && !isDesignSystemPage && !isOnboardingRoute && (
                  <MobileHeader
                    title={PageUtils.getTitleByPath(location.pathname) || APP_NAME}
                    isChatScrolled={isChatScrolled}
                    onLogout={handleLogout}
                    chatHistory={chatHistory}
                    currentChatId={currentChatId}
                    onCurrentChatIdChange={getCurrentChatId}
                    onHistoryDelete={handleHistoryDelete}
                    onHistoryRefresh={handleHistoryRefresh}
                    subscriptionPlan={subscriptionPlan}
                    creditCards={creditCards}
                    isLoadingCreditCards={isLoadingCreditCards}
                    isLoadingHistory={isLoadingHistory}
                    onCardSelect={handleCardSelect}
                    quickHistorySize={GLOBAL_QUICK_HISTORY_SIZE}
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
                  <DrawerContent className="mobile-card-selector-drawer" fixedHeight="calc(var(--app-vh, 1vh) * 90)">
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
                          className={`button outline ${isSavingCards ? 'disabled' : ''}`}
                          onClick={() => {
                            resetCardSelectorUI();
                            setIsCardSelectorOpen(false);
                          }}
                          disabled={isSavingCards}
                        >
                          Cancel
                        </button>
                        <button
                          className={`button ${isSavingCards ? 'loading icon with-text' : ''}`}
                          onClick={handleSaveCardSelections}
                          disabled={isSavingCards}
                        >
                          {isSavingCards && <LOADING_ICON size={LOADING_ICON_SIZE} />}
                          {isSavingCards ? 'Saving...' : 'Save'}
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
                        className={`button outline ${isSavingCards ? 'disabled' : ''}`}
                        onClick={() => {
                          resetCardSelectorUI();
                          setIsCardSelectorOpen(false);
                        }}
                        disabled={isSavingCards}
                      >
                        Cancel
                      </button>
                      <button
                        className={`button ${isSavingCards ? 'loading icon with-text' : ''}`}
                        onClick={handleSaveCardSelections}
                        disabled={isSavingCards}
                      >
                        {isSavingCards && <LOADING_ICON size={LOADING_ICON_SIZE} />}
                        {isSavingCards ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            );
          })()}

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
                  isFrozen={selectedCardDetails ? userCardsMetadata.get(selectedCardDetails.id)?.isFrozen ?? false : false}
                  hideInlineTabs={true}
                  externalActiveTab={cardDetailActiveTab}
                />
              </div>
              <div className="dialog-footer card-detail-tab-footer">
                <TabBar
                  options={CARD_TABS}
                  activeId={cardDetailActiveTab}
                  onChange={(id) => setCardDetailActiveTab(id as TabType)}
                />
              </div>
            </DrawerContent>
          </Drawer>

          {/* Credits Report Modal */}
          <Dialog open={isDetailedSummaryOpen} onOpenChange={setIsDetailedSummaryOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Credits Report</DialogTitle></DialogHeader>
              <DialogBody>
                <CreditDetailedSummary monthlyStats={monthlyStats} loading={isLoadingMonthlyStats} isUpdating={isUpdatingMonthlyStats} />
              </DialogBody>
            </DialogContent>
          </Dialog>

          {/* Design System Route - rendered outside of normal app wrapper */}
          {isDesignSystemPage ? (
            <Routes>
            <Route path="/design" element={<DesignSystem />} />
              <Route path="/design/components" element={<FullComponents />} />
              <Route path="/design/buttons" element={<ButtonsShowcase />} />
            </Routes>
          ) : (
          (() => {
            const isHelpPage = location.pathname.startsWith(PAGES.HELP_CENTER.PATH);
            const backgroundVariant = (isHelpPage || isLegalPage || isOnboardingRoute) ? 'bg-white' as const : undefined;
            return (
              <UniversalContentWrapper
                isSidePanelOpen={user ? isSidePanelOpen : false}
                fullHeight={isAuthRoute || isOnboardingRoute ? true : needsFullHeight}
                className={[
                  isAuthRoute || isOnboardingRoute ? 'center-content auth-background' : '',
                  isLandingPage ? 'auth-background' : '',
                ].join(' ').trim()}
                disableSidebarMargin={isAuthRoute || !user || isOnboardingRoute}
                backgroundVariant={backgroundVariant}
              >
                <Routes>
                  <Route path="/" element={
                    user ? renderMainContent() : <LandingPage />
                  } />
                  <Route path="/chat/:chatId" element={
                    user ? renderMainContent() : (
                      <ProtectedRoute>{renderMainContent()}</ProtectedRoute>
                    )
                  } />
                  <Route path="/chat" element={<Navigate to="/" replace />} />
                  <Route path={PAGES.PREFERENCES.PATH} element={
                    <ProtectedRoute>
                      <Preferences
                        preferencesInstructions={preferencesInstructions}
                        setPreferencesInstructions={setPreferencesInstructions}
                        chatHistoryPreference={chatHistoryPreference}
                        setChatHistoryPreference={(preference: ChatHistoryPreference) => setChatHistoryPreference(preference)}
                        agentModePreference={agentModePreference}
                        setAgentModePreference={setAgentModePreference}
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
                  <Route path={PAGES.ONBOARDING.PATH} element={
                    <ProtectedRoute>
                      <Onboarding
                        onModalOpen={() => setIsCardSelectorOpen(true)}
                        creditCards={creditCards}
                        prioritizedCredits={prioritizedCredits}
                        isLoadingPrioritizedCredits={isLoadingPrioritizedCredits}
                        onCardClick={handleCardSelectById}
                        onCreditClick={handleCreditSelect}
                      />
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
                        reloadTrigger={cardsVersion + monthlyStatsRefreshTrigger}
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
                      <Account
                        subscriptionPlan={subscriptionPlan}
                        subscriptionStatus={subscriptionStatus}
                        subscriptionExpiresAt={subscriptionExpiresAt}
                        creditCardCount={creditCards.filter(c => c.selected).length}
                      />
                    </ProtectedRoute>
                  } />
                  <Route path={PAGES.HISTORY.PATH} element={
                    <History
                      currentChatId={currentChatId}
                      returnCurrentChatId={getCurrentChatId}
                      onHistoryDelete={handleHistoryDelete}
                      onHistoryRefresh={handleHistoryRefresh}
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
                    <Route index element={<HelpArticleRenderer articleId="getting-started" />} />
                    <Route path="*" element={<HelpArticleRenderer />} />
                  </Route>
                  <Route path={PAGES.TERMS_OF_SERVICE.PATH} element={<TermsOfService />} />
                  <Route path={PAGES.PRIVACY_POLICY.PATH} element={<PrivacyPolicy />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </UniversalContentWrapper>
            );
          })()
          )}
        </div>
        </CreditDrawerProvider>
      </ScrollHeightContext.Provider>
    </FullHeightContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <ComponentsProvider autoFetch={false}>
        <AppContent />
      </ComponentsProvider>
    </Router>
  );
}

export default App;
