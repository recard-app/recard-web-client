import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import { useFullHeight } from '../../hooks/useFullHeight';
import { useAgentChat } from '../../hooks/useAgentChat';
import { useRegisterScrollContainer } from '@/contexts/PageScrollContext';

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
import { ChatMessage, Conversation } from '../../types';
import { ChatComponentBlock } from '../../types/ChatComponentTypes';

import { AgentModePreference, ChatHistoryPreference } from '../../types';
import { MAX_CHAT_THREAD_MESSAGES, CHAT_HISTORY_MESSAGES } from './utils';
import { NO_DISPLAY_NAME_PLACEHOLDER, DEFAULT_CHAT_NAME_PLACEHOLDER, CHAT_HISTORY_PREFERENCE, CHAT_SOURCE, STREAMING_STATUS } from '../../types';
import { UserHistoryService } from '../../services';
import { ErrorWithRetry } from '../../elements';
import { classifyError } from '../../types/AgentChatTypes';
import { apiCache, CACHE_KEYS } from '../../utils/ApiCache';

const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 60 * 1000;
const TITLE_RETRY_DELAYS_MS = [2000, 5000, 10000];
const NEAR_BOTTOM_THRESHOLD_PX = 400;
const SCROLL_DELAY_MS = 100;

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
    onHistoryRefresh,
}: PromptWindowProps) {
    const { chatId: urlChatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const promptHistoryRef = useRef<HTMLDivElement>(null);
    const registerScrollContainer = useRegisterScrollContainer();

    // Register the chat scroll container with the page scroll context
    useEffect(() => {
        registerScrollContainer(promptHistoryRef.current);
    }, [registerScrollContainer]);
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
    // Ref mirror of existingHistoryList for stable closures (avoids re-creating callbacks
    // on every sidebar refresh). Updated via sync effect below.
    const existingHistoryListRef = useRef<Conversation[]>(existingHistoryList);
    const onHistoryUpsertRef = useRef(onHistoryUpsert);
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
    const titleRefreshTimeoutRef = useRef<number | null>(null);
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


    // Keep existingHistoryListRef in sync with the prop
    useEffect(() => {
        existingHistoryListRef.current = existingHistoryList;
    }, [existingHistoryList]);
    useEffect(() => {
        onHistoryUpsertRef.current = onHistoryUpsert;
    }, [onHistoryUpsert]);

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

    // Handler for completed messages - updates local state only (server handles persistence).
    // `streamChatId` is the conversation ID the stream was started for — used to verify
    // the response belongs to the chat the user is currently viewing.
    const handleMessageComplete = useCallback((message: ChatMessage, _componentBlock?: ChatComponentBlock, streamChatId?: string) => {
        const currentChatId = chatIdRef.current;
        const targetChatId = streamChatId || currentChatId;

        // If the response is for a DIFFERENT chat than the one currently viewed,
        // don't touch local chatHistory — just update the sidebar entry and let
        // hydration pick up the full conversation when the user switches to it.
        if (targetChatId && targetChatId !== currentChatId) {
            const existingChat = existingHistoryListRef.current.find(chat => chat.chatId === targetChatId);
            const snapshot = streamingSnapshotsRef.current.get(targetChatId);
            const baseConversation = snapshot?.conversation?.length
                ? snapshot.conversation
                : (existingChat?.conversation || []);
            const hasAssistantAlready = baseConversation.some(m => m.id === message.id);
            const mergedConversation = hasAssistantAlready
                ? baseConversation
                : [...baseConversation, message];
            const mergedDescription = snapshot?.description
                || existingChat?.chatDescription
                || DEFAULT_CHAT_NAME_PLACEHOLDER;

            // Stream is complete for that chat, so snapshot is no longer needed.
            streamingSnapshotsRef.current.delete(targetChatId);

            onHistoryUpsert({
                chatId: targetChatId,
                timestamp: existingChat?.timestamp || message.timestamp || new Date().toISOString(),
                conversation: mergedConversation,
                chatDescription: mergedDescription,
                componentBlocks: extractComponentBlocks(mergedConversation),
                messageCount: mergedConversation.length,
                streamingStatus: null,
            }, true);
            UserHistoryService.clearStreamingStatus(targetChatId).catch(() => {});
            onHistoryRefresh?.();
            return;
        }

        // Response is for the active chat — apply to local state
        const updatedHistory = [...chatHistoryRef.current, message];
        chatHistoryRef.current = updatedHistory;
        setChatHistory(prev => limitChatHistory([...prev, message]));

        if (currentChatId) {
            // Clean up streaming snapshot -- response is complete
            streamingSnapshotsRef.current.delete(currentChatId);

            const existingChat = existingHistoryListRef.current.find(chat => chat.chatId === currentChatId);
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

            // Refresh sidebar with staggered retries to pick up the server-generated title.
            if (titleRefreshTimeoutRef.current !== null) {
                window.clearTimeout(titleRefreshTimeoutRef.current);
            }
            let retryIndex = 0;
            const scheduleTitleRetry = () => {
                if (retryIndex >= TITLE_RETRY_DELAYS_MS.length) {
                    titleRefreshTimeoutRef.current = null;
                    return;
                }
                const delay = TITLE_RETRY_DELAYS_MS[retryIndex];
                retryIndex++;
                titleRefreshTimeoutRef.current = window.setTimeout(() => {
                    titleRefreshTimeoutRef.current = null;
                    onHistoryRefresh?.();

                    const chat = existingHistoryListRef.current.find(c => c.chatId === currentChatId);
                    if (!chat?.chatDescription || chat.chatDescription === DEFAULT_CHAT_NAME_PLACEHOLDER) {
                        scheduleTitleRetry();
                    }
                }, delay);
            };
            scheduleTitleRetry();
        }

        hasUserSentInCurrentChatRef.current = false;
        setIsNewChatPending(false);
    }, [onHistoryUpsert, onHistoryRefresh]);

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

    // Ref mirrors for isProcessing / streamingState.isStreaming so polling
    // interval reads fresh values without being in the effect dep array.
    const isProcessingRef = useRef(isProcessing);
    const isStreamingRef = useRef(streamingState.isStreaming);
    useEffect(() => { isProcessingRef.current = isProcessing; }, [isProcessing]);
    useEffect(() => { isStreamingRef.current = streamingState.isStreaming; }, [streamingState.isStreaming]);

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

        // Don't allow new messages while processing or waiting for a server response
        if (isProcessing || isWaitingForResponse) {
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
            // Set currentChatId in App immediately so the sidebar highlights
            // this chat as selected. The pageTransitionKey fix ensures "/" and
            // "/chat/:id" share the same Fragment key, so the App-level
            // navigation effect won't cause a remount.
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
            ).then(() => {
                isChatPersistedRef.current = true;
                logMetric('chat_create_latency', {
                    chatId: currentChatId,
                    durationMs: Math.round(performance.now() - createStart),
                    source: 'initial_parallel_create',
                });
                // Don't upsert the create response -- it contains stale data
                // (just the user message + streamingStatus: 'streaming').
                // By the time this resolves, local state may already have
                // a richer snapshot from getPrompt or handleMessageComplete.
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
            const existingChat = existingHistoryListRef.current.find(chat => chat.chatId === currentChatId);
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
            const hasPreviewMessageCount = typeof existingChat.messageCount === 'number';
            const previewMessageCount = hasPreviewMessageCount
                ? existingChat.messageCount
                : null;

            if (previewConversation.length > 0) {
                return attachComponentBlocks(previewConversation, existingChat.componentBlocks);
            }

            // Only trust "empty" when the server explicitly provided messageCount: 0.
            // If messageCount is missing, treat preview as unknown and fetch full history.
            if (previewMessageCount === 0) {
                return [];
            }
        }

        const response = await UserHistoryService.fetchChatHistoryById(targetChatId, signal);
        const messages = Array.isArray(response.conversation) ? response.conversation : [];
        return attachComponentBlocks(messages, response.componentBlocks);
    }, []);

    /**
     * Fetches chat data from preview or server, returning conversation, description,
     * and streaming status. Shared by the main hydration effect and retryLoadChat.
     */
    const fetchChatData = useCallback(async (
        targetChatId: string,
        signal: AbortSignal,
        existingChat?: Conversation
    ): Promise<{ conversation: ChatMessage[]; description?: string; streamingStatus?: string | null }> => {
        if (existingChat) {
            const conversation = await resolveConversationFromPreview(existingChat, targetChatId, signal);
            return { conversation, description: existingChat.chatDescription, streamingStatus: existingChat.streamingStatus };
        }
        const fullChat = await UserHistoryService.fetchChatHistoryById(targetChatId, signal);
        const messages = Array.isArray(fullChat.conversation) ? fullChat.conversation : [];
        const conversation = attachComponentBlocks(messages, fullChat.componentBlocks);
        return { conversation, description: fullChat.chatDescription, streamingStatus: fullChat.streamingStatus };
    }, [resolveConversationFromPreview]);

    /**
     * After fetching and setting chat states, clears streaming status only when
     * the conversation actually contains an assistant response at the end.
     * Shared by the main hydration effect and retryLoadChat.
     */
    const clearStreamingStatusIfDone = useCallback((
        targetChatId: string,
        conversation: ChatMessage[],
        streamingStatus: string | null | undefined,
        description?: string,
        timestamp?: string
    ) => {
        const lastMsg = conversation[conversation.length - 1];
        const hasAssistantTail = lastMsg?.chatSource === CHAT_SOURCE.ASSISTANT;
        const serverDone = (
            streamingStatus === STREAMING_STATUS.STREAMING
            || streamingStatus === STREAMING_STATUS.COMPLETE
        ) && hasAssistantTail;

        if (serverDone) {
            clearCompletedStreamingStatus(
                targetChatId,
                description || DEFAULT_CHAT_NAME_PLACEHOLDER,
                conversation,
                timestamp
            );
        }
    }, [clearCompletedStreamingStatus]);

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
     *
     * For new chats, navigation is deferred until the parallel Firestore create
     * has resolved AND the SSE stream has finished. Navigating earlier would
     * cause React Router to remount this component (different <Route> elements
     * for "/" vs "/chat/:id"), killing the active SSE connection and resetting
     * all refs -- which leads to a "Failed to load chat" error because the
     * hydration effect can no longer detect the in-flight new-chat state.
     */
    useEffect(() => {
        // Only push URL when creating/selecting a chat from the home route.
        // When URL already has /chat/:id, treat URL as source of truth to avoid route snap-back.
        if (chatId && !urlChatId && !isNewChatPending && !isProcessing) {
            returnCurrentChatId(chatId);
            navigate(`/chat/${chatId}`, { replace: true });
        }
    }, [chatId, navigate, returnCurrentChatId, urlChatId, isNewChatPending, isProcessing]);

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

            // Once this chat is hydrated locally, never re-run hydration for it.
            // The polling effect handles fetching the server response independently.
            if (!isSwitchingToDifferentChat && urlChatId === chatIdRef.current && hasHydratedCurrentChatRef.current) {
                setIsSwitchingChats(false);
                return;
            }

            // Wait for initial history loading to complete before checking for existing chat.
            // On route switches, keep switching state active so PromptHistory can show
            // a clean loading surface with no stale content.
            if (isLoadingHistory && !existingHistoryListRef.current.some(chat => chat.chatId === urlChatId)) {
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
                const existingChat = existingHistoryListRef.current.find(chat => chat.chatId === urlChatId);

                // Restore from snapshot if one exists. A snapshot is set in getPrompt
                // and only deleted by handleMessageComplete, so its existence proves
                // the stream was interrupted (user navigated away) before the response
                // arrived.
                const snapshot = streamingSnapshotsRef.current.get(urlChatId);
                if (snapshot) {
                    const localConversation = attachComponentBlocks(
                        snapshot.conversation,
                        snapshot.componentBlocks
                    );
                    const snapshotDescription = snapshot.description || existingChat?.chatDescription || DEFAULT_CHAT_NAME_PLACEHOLDER;
                    const applySnapshotLocally = () => {
                        shouldSnapToBottomOnHydrationRef.current = true;
                        suppressNextSmoothAutoScrollRef.current = true;
                        setExistingChatStates(localConversation, urlChatId, snapshotDescription);
                    };
                    const applySnapshotAsStreaming = () => {
                        applySnapshotLocally();

                        // Re-assert STREAMING on the sidebar entry so the loading
                        // indicator stays visible while polling for completion.
                        onHistoryUpsert({
                            chatId: urlChatId,
                            timestamp: existingChat?.timestamp || new Date().toISOString(),
                            conversation: localConversation,
                            chatDescription: snapshotDescription,
                            componentBlocks: snapshot.componentBlocks || [],
                            streamingStatus: STREAMING_STATUS.STREAMING,
                        }, true);
                    };

                    // Check if the snapshot itself already contains a complete
                    // response (e.g., background sync cached server data into it).
                    const snapshotLastMsg = localConversation[localConversation.length - 1];
                    const snapshotHasAssistantTail = snapshotLastMsg?.chatSource === CHAT_SOURCE.ASSISTANT;

                    if (snapshotHasAssistantTail) {
                        // Snapshot has the full response — apply instantly, no polling needed.
                        applySnapshotLocally();
                        streamingSnapshotsRef.current.delete(urlChatId);
                        clearCompletedStreamingStatus(
                            urlChatId,
                            snapshotDescription,
                            localConversation,
                            existingChat?.timestamp
                        );
                    } else {
                        // Snapshot only has the user message. Always try the server
                        // first — the response may already be persisted regardless
                        // of what sidebar status says (COMPLETE, STREAMING, or null).
                        // This prevents the jarring "user message appears, then
                        // response loads a second later" effect.
                        try {
                            const chatData = await fetchChatData(urlChatId, abortController.signal, existingChat);

                            if (!isHydrationRequestCurrent(requestId, urlChatId)) {
                                return;
                            }

                            const serverConversation = chatData.conversation;
                            const lastServerMessage = serverConversation[serverConversation.length - 1];

                            // Verify the server response actually contains the
                            // user's latest message (same stale-data guard as
                            // the polling effect uses).
                            const lastSnapshotUserMsg = localConversation.findLast?.(
                                (m: ChatMessage) => m.chatSource === CHAT_SOURCE.USER
                            ) || [...localConversation].reverse().find(m => m.chatSource === CHAT_SOURCE.USER);
                            const serverHasUserMsg = !lastSnapshotUserMsg
                                || serverConversation.some((m: ChatMessage) => m.id === lastSnapshotUserMsg.id);
                            const serverHasAssistantResponse = lastServerMessage?.chatSource === CHAT_SOURCE.ASSISTANT;

                            if (serverHasUserMsg && serverHasAssistantResponse) {
                                // Server has the complete response — show it all at once.
                                shouldSnapToBottomOnHydrationRef.current = true;
                                suppressNextSmoothAutoScrollRef.current = true;
                                setExistingChatStates(
                                    serverConversation,
                                    urlChatId,
                                    chatData.description || snapshotDescription
                                );
                                streamingSnapshotsRef.current.delete(urlChatId);
                                clearStreamingStatusIfDone(
                                    urlChatId,
                                    serverConversation,
                                    chatData.streamingStatus,
                                    chatData.description || snapshotDescription,
                                    existingChat?.timestamp
                                );
                            } else {
                                // Server doesn't have the response yet — show snapshot
                                // with loading indicator, polling will pick it up.
                                applySnapshotAsStreaming();
                            }
                        } catch {
                            // Fetch failed — fall back to snapshot + polling
                            if (isHydrationRequestCurrent(requestId, urlChatId)) {
                                applySnapshotAsStreaming();
                            }
                        }
                    }
                } else {
                    // Normal hydration: fetch from server
                    const chatData = await fetchChatData(urlChatId, abortController.signal, existingChat);

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

                    let serverConversation = chatData.conversation;

                    // Defensive: if resolveConversationFromPreview returned empty
                    // (stale preview cache) but we know the chat exists, force a
                    // full server fetch so we don't show a blank screen.
                    if (serverConversation.length === 0 && existingChat) {
                        try {
                            const fullChat = await UserHistoryService.fetchChatHistoryById(urlChatId, abortController.signal);
                            if (!isHydrationRequestCurrent(requestId, urlChatId)) return;
                            const fullMessages = Array.isArray(fullChat.conversation) ? fullChat.conversation : [];
                            if (fullMessages.length > 0) {
                                serverConversation = attachComponentBlocks(fullMessages, fullChat.componentBlocks);
                            }
                        } catch {
                            // Fall through with empty; polling will handle it
                        }
                    }

                    const previewConversation = existingChat
                        ? attachComponentBlocks(
                            Array.isArray(existingChat.conversation) ? existingChat.conversation : [],
                            existingChat.componentBlocks
                        )
                        : [];
                    const usePreviewFallback = previewConversation.length > serverConversation.length;
                    const hydrationConversation = usePreviewFallback ? previewConversation : serverConversation;
                    const hydrationDescription = usePreviewFallback
                        ? (existingChat?.chatDescription || chatData.description)
                        : chatData.description;

                    shouldSnapToBottomOnHydrationRef.current = true;
                    suppressNextSmoothAutoScrollRef.current = true;
                    setExistingChatStates(hydrationConversation, urlChatId, hydrationDescription);

                    clearStreamingStatusIfDone(
                        urlChatId,
                        hydrationConversation,
                        chatData.streamingStatus,
                        hydrationDescription,
                        existingChat?.timestamp
                    );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- existingHistoryList,
    // clearCompletedStreamingStatus, and clearStreamingStatusIfDone intentionally read
    // via refs/stable closures to avoid re-running hydration on every sidebar refresh
    // or onHistoryUpsert identity change.
    }, [
        cancelChatHydration,
        cancelStream,
        isAbortError,
        isHydrationRequestCurrent,
        isLoadingHistory,
        isNewChatPending,
        isProcessing,
        isTransientHydrationMiss,
        getChatSwitchAnimationDurationMs,
        fetchChatData,
        waitForPaintBoundary,
        returnCurrentChatId,
        setExistingChatStates,
        urlChatId,
        user
    ]);

    // Poll for server completion when user returns to a chat that is still processing.
    // Triggered by streamingStatus === 'streaming' in the lightweight history list.
    // Guards (isProcessing, streamingState, existingHistoryList) are read at call-time
    // inside the interval callback via refs so the effect only re-mounts when the
    // active chat or user changes.
    useEffect(() => {
        if (!urlChatId || !user) return;

        let stopped = false;
        let pollInFlight = false;

        const interval = setInterval(async () => {
            if (stopped || pollInFlight) return;

            // Read guards at call-time via refs (not captured at effect-mount time)
            if (isProcessingRef.current || isStreamingRef.current) return;

            const lastLocalMessage = chatHistoryRef.current[chatHistoryRef.current.length - 1];
            const localNeedsAssistant = lastLocalMessage?.chatSource !== CHAT_SOURCE.ASSISTANT;
            if (!localNeedsAssistant) return;

            pollInFlight = true;
            try {
                const response = await UserHistoryService.fetchChatHistoryById(urlChatId);

                // Navigation guard: if user moved to a different chat while the fetch
                // was in flight, discard this stale response.
                if (latestUrlChatIdRef.current !== urlChatId) {
                    stopped = true;
                    clearInterval(interval);
                    return;
                }

                const serverHistory = response.conversation || [];
                const lastServerMsg = serverHistory[serverHistory.length - 1];

                // Verify the server response actually contains our latest user
                // message. Due to limitChatHistory, the server's OLD conversation
                // (before user sent a new message) can be the same length as the
                // local snapshot (after trimming). A pure length check would
                // mistake the old conversation for a completed response.
                const lastLocalUserMsg = chatHistoryRef.current.findLast?.(
                    (m: ChatMessage) => m.chatSource === CHAT_SOURCE.USER
                ) || [...chatHistoryRef.current].reverse().find(m => m.chatSource === CHAT_SOURCE.USER);
                const serverHasOurMessage = !lastLocalUserMsg
                    || serverHistory.some((m: ChatMessage) => m.id === lastLocalUserMsg.id);

                if (!serverHasOurMessage) {
                    // Server still has the old conversation; keep polling
                    return;
                }

                // Server has an assistant response -- it's done
                if (lastServerMsg && lastServerMsg.chatSource === CHAT_SOURCE.ASSISTANT) {
                    stopped = true;
                    clearInterval(interval);

                    // Clean up streaming snapshot
                    streamingSnapshotsRef.current.delete(urlChatId);

                    const hydratedHistory = attachComponentBlocks(serverHistory, response.componentBlocks);
                    chatHistoryRef.current = hydratedHistory;
                    setChatHistory(limitChatHistory(hydratedHistory));
                    setIsSwitchingChats(false);

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
        // Run once immediately so users don't wait for the first interval tick.
        void (async () => {
            if (stopped || pollInFlight) return;

            // Read guards at call-time via refs (not captured at effect-mount time)
            if (isProcessingRef.current || isStreamingRef.current) return;

            const lastLocalMessage = chatHistoryRef.current[chatHistoryRef.current.length - 1];
            const localNeedsAssistant = lastLocalMessage?.chatSource !== CHAT_SOURCE.ASSISTANT;
            if (!localNeedsAssistant) return;

            pollInFlight = true;
            try {
                const response = await UserHistoryService.fetchChatHistoryById(urlChatId);

                if (latestUrlChatIdRef.current !== urlChatId) {
                    stopped = true;
                    clearInterval(interval);
                    return;
                }

                const serverHistory = response.conversation || [];
                const lastServerMsg = serverHistory[serverHistory.length - 1];

                // Same stale-response guard as the interval callback above.
                const lastLocalUserMsgImm = chatHistoryRef.current.findLast?.(
                    (m: ChatMessage) => m.chatSource === CHAT_SOURCE.USER
                ) || [...chatHistoryRef.current].reverse().find(m => m.chatSource === CHAT_SOURCE.USER);
                const serverHasOurMessageImm = !lastLocalUserMsgImm
                    || serverHistory.some((m: ChatMessage) => m.id === lastLocalUserMsgImm.id);

                if (!serverHasOurMessageImm) {
                    return;
                }

                if (lastServerMsg && lastServerMsg.chatSource === CHAT_SOURCE.ASSISTANT) {
                    stopped = true;
                    clearInterval(interval);
                    streamingSnapshotsRef.current.delete(urlChatId);

                    const hydratedHistory = attachComponentBlocks(serverHistory, response.componentBlocks);
                    chatHistoryRef.current = hydratedHistory;
                    setChatHistory(limitChatHistory(hydratedHistory));
                    setIsSwitchingChats(false);

                    onHistoryUpsert({
                        ...response,
                        chatId: urlChatId,
                        streamingStatus: null,
                    }, true);
                    await UserHistoryService.clearStreamingStatus(urlChatId).catch(() => {});
                    onHistoryRefresh?.();
                }
            } catch {
                // Silently continue polling
            } finally {
                pollInFlight = false;
            }
        })();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Guards (isProcessing,
    // streamingState, existingHistoryList, onHistoryUpsert, onHistoryRefresh) are read
    // at call-time inside the interval callback via refs/closures. Only urlChatId and
    // user control when polling starts/stops.
    }, [urlChatId, user]);

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
            if (titleRefreshTimeoutRef.current !== null) {
                window.clearTimeout(titleRefreshTimeoutRef.current);
                titleRefreshTimeoutRef.current = null;
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

        autoScrollTimeoutRef.current = window.setTimeout(scrollToBottom, SCROLL_DELAY_MS);

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
            const isNearBottom = scrollHeight - (scrollTop + clientHeight) < NEAR_BOTTOM_THRESHOLD_PX;
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
            const chatData = await fetchChatData(urlChatId, abortController.signal, existingChat);

            if (!isHydrationRequestCurrent(requestId, urlChatId)) {
                return;
            }

            const previewConversation = existingChat
                ? attachComponentBlocks(
                    Array.isArray(existingChat.conversation) ? existingChat.conversation : [],
                    existingChat.componentBlocks
                )
                : [];
            const serverConversation = chatData.conversation;
            const usePreviewFallback = previewConversation.length > serverConversation.length;
            const hydrationConversation = usePreviewFallback ? previewConversation : serverConversation;
            const hydrationDescription = usePreviewFallback
                ? (existingChat?.chatDescription || chatData.description)
                : chatData.description;

            shouldSnapToBottomOnHydrationRef.current = true;
            suppressNextSmoothAutoScrollRef.current = true;
            setExistingChatStates(hydrationConversation, urlChatId, hydrationDescription);

            clearStreamingStatusIfDone(
                urlChatId,
                hydrationConversation,
                chatData.streamingStatus,
                hydrationDescription,
                existingChat?.timestamp
            );

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
     * Removes the pending user message, clears the sidebar streaming indicator,
     * and restores the user's text to the input field.
     */
    const handleCancel = () => {
        // Capture any partially streamed text BEFORE stopping the stream,
        // because stopAndDiscardStream resets isStreaming which hides the
        // streaming content from the render tree.
        const partialText = streamingState.streamedText || '';

        stopAndDiscardStream();
        setIsNewChatPending(false);
        submitStartedAtRef.current = null;
        hasLoggedFirstTokenRef.current = false;

        // If there was partially streamed text, commit it as an assistant
        // message so it stays visible in the chat history.
        if (partialText.trim()) {
            const partialMessage: ChatMessage = {
                id: `msg-cancelled-${Date.now()}`,
                chatSource: CHAT_SOURCE.ASSISTANT,
                chatMessage: partialText,
                timestamp: new Date().toISOString(),
            };
            chatHistoryRef.current = [...chatHistoryRef.current, partialMessage];
            setChatHistory(prev => [...prev, partialMessage]);
        }

        const cancelledChatId = chatIdRef.current;

        // Clean up streaming snapshot
        if (cancelledChatId) {
            streamingSnapshotsRef.current.delete(cancelledChatId);
        }

        // Clear streamingStatus locally in the sidebar so the avatar stops.
        if (cancelledChatId) {
            const existingChat = existingHistoryListRef.current.find(c => c.chatId === cancelledChatId);
            if (existingChat) {
                onHistoryUpsert({
                    chatId: cancelledChatId,
                    chatDescription: existingChat.chatDescription || chatDescriptionRef.current || DEFAULT_CHAT_NAME_PLACEHOLDER,
                    timestamp: existingChat.timestamp || new Date().toISOString(),
                    conversation: chatHistoryRef.current,
                    streamingStatus: null,
                }, true);
            }
        }

        // If a parallel create is still in flight, wait for it to complete
        // then clear streamingStatus. Without this, the create writes 'streaming'
        // after the cancel endpoint tried to clear it (doc didn't exist yet).
        if (cancelledChatId && pendingChatCreateRef.current) {
            pendingChatCreateRef.current
                .then(() => UserHistoryService.clearStreamingStatus(cancelledChatId))
                .catch(() => {});
        }

        hasUserSentInCurrentChatRef.current = false;
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
    // When welcome screen activates, scroll resets naturally (no content to scroll)

    const currentChatStreamingStatus = existingHistoryList.find(c => c.chatId === chatId)?.streamingStatus;
    const isWaitingForResponse = !isProcessing
        && !streamingState.isStreaming
        && currentChatStreamingStatus === STREAMING_STATUS.STREAMING;

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
                        isWaitingForResponse={isWaitingForResponse}
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
                        disabled={chatHistory.length >= MAX_CHAT_THREAD_MESSAGES || isSwitchingChats}
                        chatLimitReached={chatHistory.length >= MAX_CHAT_THREAD_MESSAGES}
                        isWaitingForResponse={isWaitingForResponse}
                    />
                </div>
                {chatHistory.length >= MAX_CHAT_THREAD_MESSAGES && (
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
