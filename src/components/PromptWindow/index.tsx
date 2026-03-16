import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import { useFullHeight } from '../../hooks/useFullHeight';
import { useAgentChat } from '../../hooks/useAgentChat';
import { useScrolledFromTop } from '../../hooks/useScrolledFromTop';

import PromptHistory from './PromptHistory';
import PromptField from './PromptField';
import './PromptWindow.scss';
import {
    limitChatHistory,
    createUserMessage,
    createErrorMessage,
    extractComponentBlocks,
    attachComponentBlocks,
} from './utils';

// Import types
import { PAGES } from '../../types';
import { ChatMessage, Conversation, ChatComponentBlock } from '../../types';

import { AgentModePreference, ChatHistoryPreference } from '../../types';
import { MAX_CHAT_MESSAGES, CHAT_HISTORY_MESSAGES } from './utils';
import { NO_DISPLAY_NAME_PLACEHOLDER, DEFAULT_CHAT_NAME_PLACEHOLDER, CHAT_HISTORY_PREFERENCE, CHAT_SOURCE, STREAMING_STATUS } from '../../types';
import { UserHistoryService } from '../../services';
import { ErrorWithRetry } from '../../elements';
import { classifyError } from '../../types/AgentChatTypes';
import { apiCache, CACHE_KEYS } from '../../utils/ApiCache';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Data structure for daily digest
 */
interface DigestData {
    title: string;
    content: string;
    generatedAt?: string;
}

/**
 * Props for the PromptWindow component.
 */
interface PromptWindowProps {
    user: FirebaseUser | null;
    returnCurrentChatId: (chatId: string) => void;
    onHistoryUpsert: (chat: Conversation, skipRefresh?: boolean) => void;
    clearChatCallback: number;
    setClearChatCallback: (value: number) => void;
    existingHistoryList: Conversation[];
    chatHistoryPreference: ChatHistoryPreference;
    agentModePreference?: AgentModePreference;
    isLoadingHistory?: boolean;
    onNewChat: () => void;
    onCardSelect?: (cardId: string) => void;
    onCreditClick?: (cardId: string, creditId: string) => void;
    onMultiplierClick?: (cardId: string, multiplierId: string) => void;
    /** Callback to refresh credits/monthly stats after AI updates */
    onRefreshCredits?: () => void;
    /** Callback to refresh cards after AI updates */
    onRefreshCards?: () => void;
    /** Daily digest data (fetched at App level to persist across chats) */
    digest?: DigestData | null;
    /** Whether digest is currently loading */
    digestLoading?: boolean;
    /** Callback to regenerate the daily digest */
    onRegenerateDigest?: () => void;
    /** Whether digest is currently being regenerated */
    isRegeneratingDigest?: boolean;
    /** Callback fired when the chat scroll state changes (scrolled from top or not) */
    onChatScrolledChange?: (isScrolled: boolean) => void;
    /** Callback to refresh the sidebar history list (picks up new titles + status) */
    onHistoryRefresh?: () => void;
}

/**
 * Main PromptWindow component that handles chat interactions between user and AI.
 * Manages chat history, streaming responses, and API interactions for credit card recommendations.
 */
function PromptWindow({
    user,
    returnCurrentChatId,
    onHistoryUpsert,
    clearChatCallback,
    setClearChatCallback,
    existingHistoryList,
    chatHistoryPreference,
    agentModePreference,
    isLoadingHistory = false,
    onNewChat,
    onCardSelect,
    onCreditClick,
    onMultiplierClick,
    onRefreshCredits,
    onRefreshCards,
    digest = null,
    digestLoading = false,
    onRegenerateDigest,
    isRegeneratingDigest = false,
    onChatScrolledChange,
    onHistoryRefresh,
}: PromptWindowProps) {
    const { chatId: urlChatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const promptHistoryRef = useRef<HTMLDivElement>(null);
    useScrolledFromTop(promptHistoryRef, onChatScrolledChange);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    // Ref to track when we're intentionally clearing the chat (prevents loading effects from restoring)
    const isClearingRef = useRef<boolean>(false);

    // Maintains the array of chat messages between user and AI in the current conversation
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    // Unique identifier for the current chat conversation
    const [chatId, setChatId] = useState<string>('');
    // Ref to store chatId immediately (synchronous) for use in callbacks
    const chatIdRef = useRef<string>('');
    // Stores the current chat's description so it's available for sidebar upserts
    // even when the chat isn't in the 3-entry sidebar preview (e.g. opened from full history)
    const chatDescriptionRef = useRef<string>('');
    // Snapshots of conversations for chats that are actively streaming.
    // Independent of existingHistoryList (which can be wiped by sidebar refreshes).
    // Keyed by chatId, stores { conversation, componentBlocks, description }.
    const streamingSnapshotsRef = useRef<Map<string, {
        conversation: ChatMessage[];
        componentBlocks?: ChatComponentBlock[];
        description: string;
    }>>(new Map());
    // Ref to store chatHistory immediately (synchronous) for use in callbacks
    // This avoids React state timing issues on mobile Safari
    const chatHistoryRef = useRef<ChatMessage[]>([]);
    // Tracks whether this is a new chat conversation (true) or loading an existing one (false)
    const [isNewChat, setIsNewChat] = useState<boolean>(false);
    // Indicates whether a new chat creation request is in progress
    const [isNewChatPending, setIsNewChatPending] = useState<boolean>(false);
    // Error state for when loading an existing chat fails
    const [chatLoadError, setChatLoadError] = useState<string | null>(null);
    // Tracks loading state while switching between existing chats
    const [isSwitchingChats, setIsSwitchingChats] = useState<boolean>(false);
    const shouldSnapToBottomOnHydrationRef = useRef<boolean>(false);
    const suppressNextSmoothAutoScrollRef = useRef<boolean>(false);
    const autoScrollTimeoutRef = useRef<number | null>(null);
    const clearChatResetTimeoutRef = useRef<number | null>(null);
    const hydratingChatIdRef = useRef<string | null>(null);

    // In-flight create promise for first-message send + parallel persistence
    const pendingChatCreateRef = useRef<Promise<void> | null>(null);
    // Tracks whether the current chat document is known to exist in persistence
    const isChatPersistedRef = useRef<boolean>(false);
    // Tracks whether existing chat history has been hydrated locally
    const hasHydratedCurrentChatRef = useRef<boolean>(false);
    // Tracks if user sent a message on current chat before hydration finished
    const hasUserSentInCurrentChatRef = useRef<boolean>(false);
    // Metrics refs for submit -> first token latency
    const submitStartedAtRef = useRef<number | null>(null);
    const hasLoggedFirstTokenRef = useRef<boolean>(false);
    // Guards async chat hydration so only the latest request can update UI
    const chatHydrationRequestIdRef = useRef<number>(0);
    const chatHydrationAbortControllerRef = useRef<AbortController | null>(null);
    const latestUrlChatIdRef = useRef<string | undefined>(urlChatId);

    const logMetric = useCallback((name: string, metadata: Record<string, unknown> = {}) => {
        console.info('[PromptWindowMetrics]', { name, ...metadata });
    }, []);

    const getCurrentChatContext = useCallback(() => {
        return chatIdRef.current || chatId || urlChatId || '';
    }, [chatId, urlChatId]);

    const isAbortError = useCallback((error: unknown): boolean => {
        const maybeError = error as { name?: string; code?: string };
        return maybeError?.name === 'AbortError'
            || maybeError?.name === 'CanceledError'
            || maybeError?.code === 'ERR_CANCELED';
    }, []);

    const isHydrationRequestCurrent = useCallback((requestId: number, targetChatId: string): boolean => {
        return chatHydrationRequestIdRef.current === requestId && latestUrlChatIdRef.current === targetChatId;
    }, []);

    const isTransientHydrationMiss = useCallback((error: unknown, targetChatId: string): boolean => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        const isPendingNewChatHydration = Boolean(
            targetChatId === chatIdRef.current
            && hasUserSentInCurrentChatRef.current
            && (!isChatPersistedRef.current || pendingChatCreateRef.current !== null)
        );

        return isPendingNewChatHydration && (status === 404 || status === 500);
    }, []);

    const waitForPaintBoundary = useCallback(async (): Promise<void> => {
        // One rAF can still run before the browser paints the fade-out state.
        // Double-rAF guarantees at least one paint with `.is-switching` applied.
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }, []);

    const snapPromptHistoryToBottom = useCallback(() => {
        const container = promptHistoryRef.current;
        if (!container) {
            return;
        }

        const previousInlineScrollBehavior = container.style.scrollBehavior;
        container.style.scrollBehavior = 'auto';
        container.scrollTop = container.scrollHeight;
        container.style.scrollBehavior = previousInlineScrollBehavior;
    }, []);

    const clearAutoScrollTimeout = useCallback(() => {
        if (autoScrollTimeoutRef.current === null) {
            return;
        }

        window.clearTimeout(autoScrollTimeoutRef.current);
        autoScrollTimeoutRef.current = null;
    }, []);

    const parseCssTimeToMs = useCallback((rawValue: string): number => {
        const value = rawValue.trim().toLowerCase();
        if (!value) {
            return 0;
        }

        if (value.endsWith('ms')) {
            const parsed = Number.parseFloat(value.slice(0, -2));
            return Number.isFinite(parsed) ? parsed : 0;
        }

        if (value.endsWith('s')) {
            const parsed = Number.parseFloat(value.slice(0, -1));
            return Number.isFinite(parsed) ? parsed * 1000 : 0;
        }

        return 0;
    }, []);

    const getChatSwitchAnimationDurationMs = useCallback((): number => {
        if (typeof window === 'undefined') {
            return 0;
        }

        const container = promptHistoryRef.current;
        if (!container) {
            return 0;
        }

        const rawTransition = window
            .getComputedStyle(container)
            .getPropertyValue('--chat-switch-transition')
            .trim();

        if (rawTransition) {
            const timeTokenMatch = rawTransition.match(/\d*\.?\d+m?s/i);
            if (timeTokenMatch) {
                return parseCssTimeToMs(timeTokenMatch[0]);
            }
        }

        const promptHistoryNode = container.querySelector('.prompt-history');
        if (!promptHistoryNode) {
            return 0;
        }

        const durationToken = window
            .getComputedStyle(promptHistoryNode)
            .transitionDuration
            .split(',')[0]
            ?.trim() ?? '';

        return parseCssTimeToMs(durationToken);
    }, [parseCssTimeToMs]);

    const cancelChatHydration = useCallback(() => {
        chatHydrationRequestIdRef.current += 1;
        chatHydrationAbortControllerRef.current?.abort();
        chatHydrationAbortControllerRef.current = null;
        hydratingChatIdRef.current = null;
        setIsSwitchingChats(false);
    }, []);

    /**
     * Clears streamingStatus for a completed chat: updates sidebar locally and
     * fires a server-side clear. Used after hydration and retry-hydration.
     */
    const clearCompletedStreamingStatus = useCallback((
        targetChatId: string,
        chatDescription: string,
        conversation: ChatMessage[],
        existingTimestamp?: string
    ) => {
        UserHistoryService.clearStreamingStatus(targetChatId).catch(() => {});
        onHistoryUpsert({
            chatId: targetChatId,
            chatDescription,
            timestamp: existingTimestamp || new Date().toISOString(),
            conversation,
            streamingStatus: null,
        }, true);
    }, [onHistoryUpsert]);

    // Handler for completed messages - updates local state only (server handles persistence)
    const handleMessageComplete = useCallback((message: ChatMessage) => {
        // Update local state only -- server handles persistence
        const updatedHistory = [...chatHistoryRef.current, message];
        chatHistoryRef.current = updatedHistory;
        setChatHistory(prev => limitChatHistory([...prev, message]));

        // Update history panel with new message count and clear streamingStatus.
        // Connected client clears streamingStatus so the sidebar indicator disappears
        // immediately rather than briefly showing 'complete'.
        const currentChatId = chatIdRef.current;
        if (currentChatId) {
            // Clean up streaming snapshot -- response is complete
            streamingSnapshotsRef.current.delete(currentChatId);

            const existingChat = existingHistoryList.find(chat => chat.chatId === currentChatId);
            onHistoryUpsert({
                chatId: currentChatId,
                timestamp: existingChat?.timestamp || new Date().toISOString(),
                conversation: updatedHistory,
                chatDescription: existingChat?.chatDescription || chatDescriptionRef.current || DEFAULT_CHAT_NAME_PLACEHOLDER,
                componentBlocks: extractComponentBlocks(updatedHistory),
                streamingStatus: null,
            }, true);

            // Clear server-side streamingStatus (fire-and-forget)
            UserHistoryService.clearStreamingStatus(currentChatId).catch(() => {});
        }

        hasUserSentInCurrentChatRef.current = false;
        setIsNewChatPending(false);
    }, [onHistoryUpsert, existingHistoryList]);

    // Handler for stream errors
    const handleStreamError = useCallback((error: string) => {
        const errorInfo = classifyError(new Error(error));
        const errorMessage = createErrorMessage(errorInfo.message);
        chatHistoryRef.current = [...chatHistoryRef.current, errorMessage];
        setChatHistory(prev => [...prev, errorMessage]);
        hasUserSentInCurrentChatRef.current = false;
        setIsNewChatPending(false);
        submitStartedAtRef.current = null;
        hasLoggedFirstTokenRef.current = false;
    }, []);

    // Handler for data changes (triggers UI refresh)
    const handleDataChanged = useCallback((dataChanged: { credits?: boolean; cards?: boolean; preferences?: boolean }) => {
        // Invalidate caches BEFORE calling refresh callbacks

        if (dataChanged.credits) {
            // Credits changed: invalidate all component caches
            apiCache.invalidatePattern('^components_');
        }

        if (dataChanged.cards) {
            // Cards changed: invalidate card-related caches
            apiCache.invalidate(CACHE_KEYS.CREDIT_CARDS);
            apiCache.invalidate(CACHE_KEYS.CREDIT_CARDS_PREVIEWS);
            apiCache.invalidate(CACHE_KEYS.CREDIT_CARDS_DETAILS);
            apiCache.invalidate(CACHE_KEYS.USER_CARDS);
            apiCache.invalidate(CACHE_KEYS.USER_CARD_DETAILS);
            apiCache.invalidate(CACHE_KEYS.USER_CARD_DETAILS_FULL);
        }

        if (dataChanged.preferences) {
            // Preferences changed: invalidate tracking preferences AND component caches
            apiCache.invalidate(CACHE_KEYS.COMPONENT_TRACKING_PREFERENCES);
            apiCache.invalidatePattern('^components_');
        }

        // Call refresh callbacks to trigger re-fetch
        if (dataChanged.credits && onRefreshCredits) {
            onRefreshCredits();
        }

        if (dataChanged.cards && onRefreshCards) {
            onRefreshCards();
        }
    }, [onRefreshCredits, onRefreshCards]);

    // Use the agent chat hook for streaming
    const {
        streamingState,
        sendMessage: sendAgentMessage,
        cancelStream,
        stopAndDiscardStream,
        isProcessing,
    } = useAgentChat({
        userName: user?.displayName || NO_DISPLAY_NAME_PLACEHOLDER,
        agentMode: agentModePreference,
        onMessageComplete: handleMessageComplete,
        onError: handleStreamError,
        onDataChanged: handleDataChanged,
    });

    // Declare that this component needs full height behavior
    useFullHeight(true);

    const generateClientChatId = (): string => {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    };

    useEffect(() => {
        if (!isProcessing || hasLoggedFirstTokenRef.current) {
            return;
        }

        if (!streamingState.streamedText) {
            return;
        }

        const startedAt = submitStartedAtRef.current;
        if (startedAt !== null) {
            logMetric('submit_to_first_token', {
                durationMs: Math.round(performance.now() - startedAt),
            });
        }
        hasLoggedFirstTokenRef.current = true;
    }, [isProcessing, streamingState.streamedText, logMetric]);

    useEffect(() => {
        if (!isProcessing) {
            submitStartedAtRef.current = null;
            hasLoggedFirstTokenRef.current = false;
        }
    }, [isProcessing]);

    /**
     * Retrieves user prompt input and triggers the chat process.
     * For new chats, sends immediately and persists in parallel.
     */
    const getPrompt = async (returnPromptStr: string) => {
        if (isNewChat && isNewChatPending) {
            return;
        }

        // Don't allow new messages while processing
        if (isProcessing) {
            return;
        }

        // Create user message and add to history
        const userMessage = createUserMessage(returnPromptStr);
        hasUserSentInCurrentChatRef.current = true;

        // Update ref immediately (synchronous) for use in callbacks
        chatHistoryRef.current = [...chatHistoryRef.current, userMessage];
        setChatHistory(prev => [...prev, userMessage]);
        setShouldAutoScroll(true);

        submitStartedAtRef.current = performance.now();
        hasLoggedFirstTokenRef.current = false;

        let currentChatId = getCurrentChatContext();

        if (
            isNewChat
            && !currentChatId
            && user
            && chatHistoryPreference !== CHAT_HISTORY_PREFERENCE.DO_NOT_TRACK_HISTORY
        ) {
            currentChatId = generateClientChatId();
            chatIdRef.current = currentChatId;
            setChatId(currentChatId);
            setIsNewChat(false);
            returnCurrentChatId(currentChatId);

            setIsNewChatPending(true);
            const createStart = performance.now();
            pendingChatCreateRef.current = UserHistoryService.createChatHistory(
                [userMessage],
                [],
                undefined,
                true,
                currentChatId,
                STREAMING_STATUS.STREAMING
            ).then((response) => {
                isChatPersistedRef.current = true;
                logMetric('chat_create_latency', {
                    chatId: currentChatId,
                    durationMs: Math.round(performance.now() - createStart),
                    source: 'initial_parallel_create',
                });
                onHistoryUpsert(response);
            }).catch((error) => {
                // Server handles persistence via upsert -- parallel create failure is non-critical
                isChatPersistedRef.current = false;
                console.warn('Parallel chat create failed (server will persist):', error);
            }).finally(() => {
                pendingChatCreateRef.current = null;
                setIsNewChatPending(false);
            });
        }

        // Update sidebar immediately: show the user message and set streaming indicator.
        if (currentChatId && user && chatHistoryPreference !== CHAT_HISTORY_PREFERENCE.DO_NOT_TRACK_HISTORY) {
            const existingChat = existingHistoryList.find(chat => chat.chatId === currentChatId);
            const description = existingChat?.chatDescription || chatDescriptionRef.current || DEFAULT_CHAT_NAME_PLACEHOLDER;

            // Save a snapshot so we can restore this conversation if the user
            // navigates away and back. Independent of existingHistoryList which
            // can be wiped by lightweight sidebar refreshes.
            streamingSnapshotsRef.current.set(currentChatId, {
                conversation: [...chatHistoryRef.current],
                componentBlocks: extractComponentBlocks(chatHistoryRef.current),
                description,
            });

            onHistoryUpsert({
                chatId: currentChatId,
                timestamp: new Date().toISOString(),
                conversation: chatHistoryRef.current,
                chatDescription: description,
                componentBlocks: extractComponentBlocks(chatHistoryRef.current),
                streamingStatus: STREAMING_STATUS.STREAMING,
            }, true);
        }

        // Send to agent endpoint (hook handles streaming)
        // Use ref for up-to-date history (React state closure is one render behind)
        sendAgentMessage(
            returnPromptStr,
            chatHistoryRef.current,
            currentChatId || undefined
        );
    };

    /**
     * Helper function to set chat states when loading existing chat data.
     */
    const setExistingChatStates = useCallback((
        conversation: ChatMessage[],
        newChatId: string,
        description?: string
    ) => {
        const limitedHistory = limitChatHistory(conversation);
        chatHistoryRef.current = limitedHistory;
        setChatHistory(limitedHistory);
        chatIdRef.current = newChatId;
        setChatId(newChatId);
        if (description) {
            chatDescriptionRef.current = description;
        }
        setIsNewChat(false);
        isChatPersistedRef.current = true;
        hasHydratedCurrentChatRef.current = true;
        hasUserSentInCurrentChatRef.current = false;
        returnCurrentChatId(newChatId);
    }, [returnCurrentChatId]);

    /**
     * Loads an existing chat from preview data when possible, and falls back to
     * fetching full history when preview payload is metadata-only.
     */
    const resolveConversationFromPreview = useCallback(async (
        existingChat: Conversation,
        targetChatId: string,
        signal: AbortSignal
    ): Promise<ChatMessage[]> => {
        // If the chat has an active streamingStatus, always fetch fresh from
        // the server. The cached preview in existingHistoryList may be stale
        // (e.g. missing the assistant response that the server has now persisted).
        const hasActiveStatus = existingChat.streamingStatus === STREAMING_STATUS.STREAMING
            || existingChat.streamingStatus === STREAMING_STATUS.COMPLETE;

        if (!hasActiveStatus) {
            const previewConversation = Array.isArray(existingChat.conversation)
                ? existingChat.conversation
                : [];
            const previewMessageCount = typeof existingChat.messageCount === 'number'
                ? existingChat.messageCount
                : previewConversation.length;

            if (previewConversation.length > 0) {
                return attachComponentBlocks(previewConversation, existingChat.componentBlocks);
            }

            if (previewMessageCount === 0) {
                return [];
            }
        }

        const response = await UserHistoryService.fetchChatHistoryById(targetChatId, signal);
        const messages = Array.isArray(response.conversation) ? response.conversation : [];
        return attachComponentBlocks(messages, response.componentBlocks);
    }, []);

    // Keep latest URL chat ID in a ref so async hydration can drop stale responses.
    useEffect(() => {
        latestUrlChatIdRef.current = urlChatId;
    }, [urlChatId]);

    /**
     * Seed chat refs from URL as early as possible so submit path is not blocked
     * on history hydration for /chat/:chatId routes.
     */
    useEffect(() => {
        if (!urlChatId) {
            return;
        }

        // Seed refs only when there is no active local chat context yet.
        // If we overwrite this on every URL change, switch detection cannot
        // tell that the user moved from one existing chat to another.
        if (!chatIdRef.current) {
            chatIdRef.current = urlChatId;
            setChatId(urlChatId);
        }
        setIsNewChat(false);
    }, [urlChatId]);

    /**
     * Effect hook that synchronizes the URL with the current chat ID.
     */
    useEffect(() => {
        // Only push URL when creating/selecting a chat from the home route.
        // When URL already has /chat/:id, treat URL as source of truth to avoid route snap-back.
        if (chatId && !urlChatId) {
            returnCurrentChatId(chatId);
            navigate(`/chat/${chatId}`, { replace: true });
        }
    }, [chatId, navigate, returnCurrentChatId, urlChatId]);

    /**
     * Single chat hydration effect with request-id/abort guards.
     */
    useEffect(() => {
        if (!user) return;

        const loadHistory = async () => {
            if (!user) return;

            // Skip if we're intentionally clearing the chat
            if (isClearingRef.current) return;

            // Home/new chat route
            if (!urlChatId) {
                const shouldDeferHomeReset = Boolean(
                    chatIdRef.current
                    && hasUserSentInCurrentChatRef.current
                    && (isNewChatPending || isProcessing || pendingChatCreateRef.current !== null)
                );

                // During the first-message transition we may still be on "/" for a render.
                // Do not wipe refs/state until routing catches up to /chat/:chatId.
                if (shouldDeferHomeReset) {
                    setIsSwitchingChats(false);
                    return;
                }

                cancelChatHydration();
                cancelStream();

                chatHistoryRef.current = [];
                setChatHistory([]);
                chatIdRef.current = '';
                setChatId('');
                setIsNewChat(true);
                setIsNewChatPending(false);
                setChatLoadError(null);

                isChatPersistedRef.current = false;
                hasHydratedCurrentChatRef.current = false;
                hasUserSentInCurrentChatRef.current = false;
                pendingChatCreateRef.current = null;
                returnCurrentChatId('');
                return;
            }

            if (
                hydratingChatIdRef.current === urlChatId
                && chatHydrationAbortControllerRef.current !== null
            ) {
                return;
            }

            const isSwitchingToDifferentChat = urlChatId !== chatIdRef.current;

            if (isSwitchingToDifferentChat) {
                // Prevent stream events from a previous chat leaking into this one.
                cancelStream();
                submitStartedAtRef.current = null;
                hasLoggedFirstTokenRef.current = false;
                hasUserSentInCurrentChatRef.current = false;

                setChatLoadError(null);
                setIsSwitchingChats(true);
            }

            // If user already started sending on this chat, do not overwrite local state with hydration.
            if (!isSwitchingToDifferentChat && urlChatId === chatIdRef.current && hasUserSentInCurrentChatRef.current) {
                setIsSwitchingChats(false);
                return;
            }

            // Return early only when this chat is already hydrated locally.
            if (!isSwitchingToDifferentChat && urlChatId === chatIdRef.current && hasHydratedCurrentChatRef.current) {
                setIsSwitchingChats(false);
                return;
            }

            // Wait for initial history loading to complete before checking for existing chat.
            // On route switches, keep switching state active so PromptHistory can show
            // a clean loading surface with no stale content.
            if (isLoadingHistory && !existingHistoryList.some(chat => chat.chatId === urlChatId)) {
                if (isSwitchingToDifferentChat) {
                    setIsSwitchingChats(true);
                }
                return;
            }

            setChatLoadError(null);
            // For chat-to-chat switches, transition starts immediately (fade out old chat).
            // For cold skeleton hydration, transition starts right before content swap.
            let transitionStartedAt: number | null = isSwitchingToDifferentChat ? performance.now() : null;
            const minimumSwitchAnimationMs = isSwitchingToDifferentChat
                ? getChatSwitchAnimationDurationMs()
                : 0;

            chatHydrationRequestIdRef.current += 1;
            const requestId = chatHydrationRequestIdRef.current;

            chatHydrationAbortControllerRef.current?.abort();
            const abortController = new AbortController();
            chatHydrationAbortControllerRef.current = abortController;
            hydratingChatIdRef.current = urlChatId;

            // Set active context to the target chat while hydration is in flight.
            setChatId(urlChatId);
            setIsNewChat(false);
            hasHydratedCurrentChatRef.current = false;
            hasUserSentInCurrentChatRef.current = false;
            isChatPersistedRef.current = false;

            if (isSwitchingToDifferentChat) {
                // Ensure fade-out is actually painted before swapping messages.
                await waitForPaintBoundary();
                if (chatHydrationRequestIdRef.current !== requestId) {
                    return;
                }
            }

            try {
                const existingChat = existingHistoryList.find(chat => chat.chatId === urlChatId);
                const loadedStreamingStatus = existingChat?.streamingStatus;

                // If the chat is still streaming (server processing), restore from
                // the snapshot ref (stable, not affected by sidebar refreshes).
                // Falls back to existingHistoryList, then server fetch.
                const snapshot = streamingSnapshotsRef.current.get(urlChatId);
                if (loadedStreamingStatus === STREAMING_STATUS.STREAMING && snapshot) {
                    const localConversation = attachComponentBlocks(
                        snapshot.conversation,
                        snapshot.componentBlocks
                    );

                    shouldSnapToBottomOnHydrationRef.current = true;
                    suppressNextSmoothAutoScrollRef.current = true;
                    setExistingChatStates(localConversation, urlChatId, snapshot.description);
                    // Don't clear status -- polling will handle completion
                } else {
                    // Normal hydration: fetch from server
                    let conversation: ChatMessage[];
                    let fetchedDescription: string | undefined;

                    if (existingChat) {
                        conversation = await resolveConversationFromPreview(existingChat, urlChatId, abortController.signal);
                        fetchedDescription = existingChat.chatDescription;
                    } else {
                        const fullChat = await UserHistoryService.fetchChatHistoryById(urlChatId, abortController.signal);
                        const messages = Array.isArray(fullChat.conversation) ? fullChat.conversation : [];
                        conversation = attachComponentBlocks(messages, fullChat.componentBlocks);
                        fetchedDescription = fullChat.chatDescription;
                    }

                    if (!isHydrationRequestCurrent(requestId, urlChatId)) {
                        return;
                    }

                    if (!isSwitchingToDifferentChat && chatHistoryRef.current.length === 0) {
                        setIsSwitchingChats(true);
                        transitionStartedAt = performance.now();
                        await waitForPaintBoundary();

                        if (!isHydrationRequestCurrent(requestId, urlChatId)) {
                            return;
                        }
                    }

                    if (transitionStartedAt !== null) {
                        const minimumAnimationMs = minimumSwitchAnimationMs > 0
                            ? minimumSwitchAnimationMs
                            : getChatSwitchAnimationDurationMs();
                        const elapsedMs = performance.now() - transitionStartedAt;
                        const remainingMs = minimumAnimationMs - elapsedMs;
                        if (remainingMs > 0) {
                            await new Promise<void>((resolve) => {
                                window.setTimeout(() => resolve(), remainingMs);
                            });
                        }

                        if (!isHydrationRequestCurrent(requestId, urlChatId)) {
                            return;
                        }
                    }

                    shouldSnapToBottomOnHydrationRef.current = true;
                    suppressNextSmoothAutoScrollRef.current = true;
                    setExistingChatStates(Array.isArray(conversation) ? conversation : [], urlChatId, fetchedDescription);

                    // Clear 'complete' status (server finished, response is loaded)
                    if (loadedStreamingStatus === STREAMING_STATUS.COMPLETE) {
                        clearCompletedStreamingStatus(
                            urlChatId,
                            existingChat?.chatDescription || DEFAULT_CHAT_NAME_PLACEHOLDER,
                            Array.isArray(conversation) ? conversation : [],
                            existingChat?.timestamp
                        );
                    }
                }

                // Paint once with new content while opacity is still 0, then reveal.
                await waitForPaintBoundary();
                if (!isHydrationRequestCurrent(requestId, urlChatId)) {
                    return;
                }
            } catch (error) {
                if (isAbortError(error) || !isHydrationRequestCurrent(requestId, urlChatId)) {
                    return;
                }

                if (isTransientHydrationMiss(error, urlChatId)) {
                    return;
                }

                console.error('Error loading chat:', error);
                setChatLoadError('Failed to load chat. Please try again.');
            } finally {
                if (chatHydrationRequestIdRef.current === requestId) {
                    chatHydrationAbortControllerRef.current = null;
                    hydratingChatIdRef.current = null;
                    setIsSwitchingChats(false);
                }
            }
        };

        void loadHistory();
    }, [
        cancelChatHydration,
        cancelStream,
        existingHistoryList,
        isAbortError,
        isHydrationRequestCurrent,
        isLoadingHistory,
        isNewChatPending,
        isProcessing,
        isTransientHydrationMiss,
        getChatSwitchAnimationDurationMs,
        resolveConversationFromPreview,
        waitForPaintBoundary,
        clearCompletedStreamingStatus,
        returnCurrentChatId,
        setExistingChatStates,
        urlChatId,
        user
    ]);

    // Poll for server completion when user returns to a chat that is still processing.
    // Triggered by streamingStatus === 'streaming' in the lightweight history list.
    useEffect(() => {
        if (!urlChatId || !user) return;
        if (isProcessing || streamingState.isStreaming) return;

        const existingChat = existingHistoryList?.find(c => c.chatId === urlChatId);
        if (!existingChat?.streamingStatus || existingChat.streamingStatus !== STREAMING_STATUS.STREAMING) return;

        const lastLocalMessage = chatHistoryRef.current[chatHistoryRef.current.length - 1];
        if (lastLocalMessage?.chatSource === CHAT_SOURCE.ASSISTANT) return;

        let stopped = false;
        let pollInFlight = false;

        const interval = setInterval(async () => {
            if (stopped || pollInFlight) return;
            pollInFlight = true;
            try {
                const response = await UserHistoryService.fetchChatHistoryById(urlChatId);
                const serverHistory = response.conversation || [];
                const lastServerMsg = serverHistory[serverHistory.length - 1];

                // Server has an assistant response -- it's done
                if (lastServerMsg && lastServerMsg.chatSource === CHAT_SOURCE.ASSISTANT) {
                    stopped = true;
                    clearInterval(interval);

                    // Clean up streaming snapshot
                    streamingSnapshotsRef.current.delete(urlChatId);

                    const hydratedHistory = attachComponentBlocks(serverHistory, response.componentBlocks);
                    chatHistoryRef.current = hydratedHistory;
                    setChatHistory(limitChatHistory(hydratedHistory));

                    // Clear streamingStatus locally + server-side
                    onHistoryUpsert({
                        ...response,
                        chatId: urlChatId,
                        streamingStatus: null,
                    }, true);
                    await UserHistoryService.clearStreamingStatus(urlChatId).catch(() => {});

                    // Refresh sidebar to pick up new title + cleared status
                    onHistoryRefresh?.();
                }
            } catch {
                // Silently continue polling
            } finally {
                pollInFlight = false;
            }
        }, POLL_INTERVAL_MS);

        // Stop polling after timeout (server should be done by then)
        const timeout = setTimeout(() => {
            stopped = true;
            clearInterval(interval);
        }, POLL_TIMEOUT_MS);

        return () => {
            stopped = true;
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [
        chatHistoryRef,
        existingHistoryList,
        isProcessing,
        onHistoryRefresh,
        onHistoryUpsert,
        streamingState.isStreaming,
        urlChatId,
        user
    ]);

    // Handle initial prompt from onboarding navigation state
    const initialPromptHandledRef = useRef(false);
    useEffect(() => {
        if (initialPromptHandledRef.current) return;
        const state = location.state as { initialPrompt?: string } | null;
        if (state?.initialPrompt && isNewChat) {
            initialPromptHandledRef.current = true;
            // Clear the navigation state to prevent re-submission on refresh
            navigate(location.pathname, { replace: true, state: {} });
            getPrompt(state.initialPrompt);
        }
    }, [isNewChat, location.state]);

    /**
     * Effect hook that handles clearing the chat when triggered externally.
     */
    useEffect(() => {
        if (clearChatCallback > 0) {
            // Set ref flag to prevent loading effects from restoring chat during clear
            isClearingRef.current = true;

            handleNewTransaction();
            setClearChatCallback(0);

            // Reset the flag after navigation completes
            if (clearChatResetTimeoutRef.current !== null) {
                window.clearTimeout(clearChatResetTimeoutRef.current);
            }
            clearChatResetTimeoutRef.current = window.setTimeout(() => {
                isClearingRef.current = false;
                clearChatResetTimeoutRef.current = null;
            }, 150);
        }
    }, [clearChatCallback, setClearChatCallback]);

    useEffect(() => {
        return () => {
            clearAutoScrollTimeout();
            if (clearChatResetTimeoutRef.current !== null) {
                window.clearTimeout(clearChatResetTimeoutRef.current);
                clearChatResetTimeoutRef.current = null;
            }
            chatHydrationRequestIdRef.current += 1;
            chatHydrationAbortControllerRef.current?.abort();
            chatHydrationAbortControllerRef.current = null;
            hydratingChatIdRef.current = null;
        };
    }, [clearAutoScrollTimeout]);

    useLayoutEffect(() => {
        if (!shouldSnapToBottomOnHydrationRef.current) {
            return;
        }

        // Ensure hydrated/switch-loaded chats render at the bottom before paint
        // so users do not see a top->bottom animation on long threads.
        snapPromptHistoryToBottom();
        shouldSnapToBottomOnHydrationRef.current = false;
    }, [chatHistory, snapPromptHistoryToBottom]);

    // Auto-scroll effect
    useEffect(() => {
        clearAutoScrollTimeout();
        if (!promptHistoryRef.current || !shouldAutoScroll) {
            return;
        }

        if (suppressNextSmoothAutoScrollRef.current) {
            suppressNextSmoothAutoScrollRef.current = false;
            snapPromptHistoryToBottom();
            return;
        }

        const scrollToBottom = () => {
            const container = promptHistoryRef.current;
            if (container) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth'
                });
            }
            autoScrollTimeoutRef.current = null;
        };

        // Small delay to ensure content is rendered
        autoScrollTimeoutRef.current = window.setTimeout(scrollToBottom, 100);

        return () => {
            clearAutoScrollTimeout();
        };
    }, [
        chatHistory,
        streamingState.streamedText,
        streamingState.isStreaming,      // Scroll when streaming starts
        streamingState.timeline.nodes,   // Scroll when timeline nodes update
        streamingState.activeNode,       // Scroll when active node changes
        streamingState.activeTool,       // Scroll when active tool changes
        clearAutoScrollTimeout,
        shouldAutoScroll,
        snapPromptHistoryToBottom
    ]);

    // Add scroll event listener to track when user is near bottom
    useEffect(() => {
        const container = promptHistoryRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            // Consider "near bottom" to be within 400px of the bottom
            const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 400;
            setShouldAutoScroll(isNearBottom);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    /**
     * Retries loading chat when initial load fails.
     */
    const retryLoadChat = async () => {
        if (!urlChatId || !user) return;

        setChatLoadError(null);
        setIsSwitchingChats(true);

        chatHydrationRequestIdRef.current += 1;
        const requestId = chatHydrationRequestIdRef.current;

        chatHydrationAbortControllerRef.current?.abort();
        const abortController = new AbortController();
        chatHydrationAbortControllerRef.current = abortController;
        hydratingChatIdRef.current = urlChatId;

        try {
            const existingChat = existingHistoryList.find(chat => chat.chatId === urlChatId);
            let conversation: ChatMessage[];
            let loadedStreamingStatus = existingChat?.streamingStatus;

            if (existingChat) {
                conversation = await resolveConversationFromPreview(existingChat, urlChatId, abortController.signal);
            } else {
                const fullChat = await UserHistoryService.fetchChatHistoryById(urlChatId, abortController.signal);
                const messages = Array.isArray(fullChat.conversation) ? fullChat.conversation : [];
                conversation = attachComponentBlocks(messages, fullChat.componentBlocks);
                loadedStreamingStatus = fullChat.streamingStatus;
            }

            if (!isHydrationRequestCurrent(requestId, urlChatId)) {
                return;
            }

            shouldSnapToBottomOnHydrationRef.current = true;
            suppressNextSmoothAutoScrollRef.current = true;
            setExistingChatStates(Array.isArray(conversation) ? conversation : [], urlChatId, existingChat?.chatDescription);

            // Clear streamingStatus on retry hydration (same logic as main hydration flow)
            const retryLastMsg = conversation[conversation.length - 1];
            const retryServerDone = loadedStreamingStatus === STREAMING_STATUS.STREAMING
                && retryLastMsg?.chatSource === CHAT_SOURCE.ASSISTANT;

            if (loadedStreamingStatus === STREAMING_STATUS.COMPLETE || retryServerDone) {
                clearCompletedStreamingStatus(
                    urlChatId,
                    existingChat?.chatDescription || DEFAULT_CHAT_NAME_PLACEHOLDER,
                    Array.isArray(conversation) ? conversation : [],
                    existingChat?.timestamp
                );
            }

            // Keep reveal ordering consistent with main hydration flow.
            await waitForPaintBoundary();
            if (!isHydrationRequestCurrent(requestId, urlChatId)) {
                return;
            }
        } catch (error) {
            if (isAbortError(error) || !isHydrationRequestCurrent(requestId, urlChatId)) {
                return;
            }

            if (isTransientHydrationMiss(error, urlChatId)) {
                return;
            }

            console.error('Error loading chat:', error);
            setChatLoadError('Failed to load chat. Please try again.');
        } finally {
            if (chatHydrationRequestIdRef.current === requestId) {
                chatHydrationAbortControllerRef.current = null;
                hydratingChatIdRef.current = null;
                setIsSwitchingChats(false);
            }
        }
    };

    /**
     * Cancels ongoing streaming and resets state.
     */
    const handleCancel = () => {
        stopAndDiscardStream();
        setIsNewChatPending(false);
        submitStartedAtRef.current = null;
        hasLoggedFirstTokenRef.current = false;

        // If a parallel create is still in flight, wait for it to complete
        // then clear streamingStatus. Without this, the create writes 'streaming'
        // after the cancel endpoint tried to clear it (doc didn't exist yet).
        const cancelledChatId = chatIdRef.current;
        if (cancelledChatId && pendingChatCreateRef.current) {
            pendingChatCreateRef.current
                .then(() => UserHistoryService.clearStreamingStatus(cancelledChatId))
                .catch(() => {});
        }
    };

    /**
     * Resets the chat window to start a new transaction.
     */
    const handleNewTransaction = () => {
        // Cancel any in-progress streaming
        cancelStream();
        cancelChatHydration();

        // Clear local state
        chatHistoryRef.current = [];
        setChatHistory([]);
        setIsNewChat(true);
        setIsNewChatPending(false);
        chatIdRef.current = '';
        chatDescriptionRef.current = '';
        setChatId('');
        hasHydratedCurrentChatRef.current = false;
        hasUserSentInCurrentChatRef.current = false;
        isChatPersistedRef.current = false;
        pendingChatCreateRef.current = null;
        submitStartedAtRef.current = null;
        hasLoggedFirstTokenRef.current = false;

        // Navigate to home
        navigate(PAGES.HOME.PATH);
    };

    /**
     * Handlers for component clicks - passed to PromptHistory
     */
    const handleCardClick = (cardId: string) => {
        if (onCardSelect) {
            onCardSelect(cardId);
        }
    };

    const handleCreditClick = (cardId: string, creditId: string) => {
        if (onCreditClick) {
            onCreditClick(cardId, creditId);
        }
    };

    const handlePerkClick = (_cardId: string, _perkId: string) => {
        // TODO: Implement perk detail modal
    };

    const handleMultiplierClick = (cardId: string, multiplierId: string) => {
        if (onMultiplierClick) {
            onMultiplierClick(cardId, multiplierId);
        }
    };

    // Add effect to handle initial state
    useEffect(() => {
        // If we have a chatId in the URL, this is not a new chat
        if (urlChatId) {
            setIsNewChat(false);
        }
        // If we're at the root URL and have no chat history, this can be a new chat
        else if (!urlChatId && chatHistory.length === 0) {
            setIsNewChat(true);
        }
    }, [urlChatId, chatHistory.length]);

    // Reset scroll state when welcome screen is active (no scrollable content)
    const isWelcomeActive = isNewChat && chatHistory.length === 0 && !streamingState?.isStreaming && !chatLoadError;
    useEffect(() => {
        if (isWelcomeActive) {
            onChatScrolledChange?.(false);
        }
    }, [isWelcomeActive, onChatScrolledChange]);

    return (
        <div className='prompt-window'>
            <div ref={promptHistoryRef} className={`prompt-history-container${isNewChat && chatHistory.length === 0 && !streamingState?.isStreaming && !chatLoadError ? ' welcome-active' : ''}`}>
                {chatLoadError ? (
                    <ErrorWithRetry
                        message={chatLoadError}
                        onRetry={retryLoadChat}
                        fillContainer
                    />
                ) : (
                    <PromptHistory
                        chatHistory={chatHistory}
                        streamingState={streamingState}
                        isNewChat={isNewChat}
                        isSwitchingChats={isSwitchingChats}
                        chatId={chatId}
                        isWaitingForResponse={
                            !isProcessing
                            && !streamingState.isStreaming
                            && !!existingHistoryList.find(c => c.chatId === chatId)?.streamingStatus
                            && existingHistoryList.find(c => c.chatId === chatId)?.streamingStatus === STREAMING_STATUS.STREAMING
                        }
                        digest={digest}
                        digestLoading={digestLoading}
                        onRegenerateDigest={onRegenerateDigest}
                        isRegeneratingDigest={isRegeneratingDigest}
                        onCardClick={handleCardClick}
                        onCreditClick={handleCreditClick}
                        onPerkClick={handlePerkClick}
                        onMultiplierClick={handleMultiplierClick}
                    />
                )}
            </div>

            <div className="prompt-combined-container">
                <div className="prompt-input-container">
                    <PromptField
                        returnPrompt={getPrompt}
                        isProcessing={isProcessing}
                        onCancel={handleCancel}
                        disabled={chatHistory.length >= MAX_CHAT_MESSAGES || isSwitchingChats}
                        chatLimitReached={chatHistory.length >= MAX_CHAT_MESSAGES}
                    />
                </div>
                {chatHistory.length >= MAX_CHAT_MESSAGES && (
                    <div className="below-prompt-field-text">
                        This chat has reached its message limit. <button onClick={onNewChat} className="inline-button">Create a new chat</button> to continue.
                    </div>
                )}
                {CHAT_HISTORY_MESSAGES[chatHistoryPreference] && (
                    <div className="below-prompt-field-text">
                        {CHAT_HISTORY_MESSAGES[chatHistoryPreference]}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PromptWindow;
