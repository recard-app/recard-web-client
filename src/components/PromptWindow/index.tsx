import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import { toast } from 'sonner';
import { useFullHeight } from '../../hooks/useFullHeight';
import { useAgentChat } from '../../hooks/useAgentChat';

import PromptHistory from './PromptHistory';
import PromptField from './PromptField';
import './PromptWindow.scss';
import {
    limitChatHistory,
    createUserMessage,
    createErrorMessage,
    extractComponentBlocks,
} from './utils';

// Import types
import { PAGES } from '../../types';
import { ChatMessage, Conversation } from '../../types';
import { ChatComponentBlock } from '../../types/ChatComponentTypes';
import { AgentModePreference, ChatHistoryPreference } from '../../types';
import { MAX_CHAT_MESSAGES, CHAT_HISTORY_MESSAGES } from './utils';
import { NO_DISPLAY_NAME_PLACEHOLDER, DEFAULT_CHAT_NAME_PLACEHOLDER, CHAT_HISTORY_PREFERENCE, CHAT_SOURCE } from '../../types';
import { UserHistoryService } from '../../services';
import { ErrorWithRetry, InfoDisplay } from '../../elements';
import { classifyError } from '../../types/AgentChatTypes';
import { apiCache, CACHE_KEYS } from '../../utils/ApiCache';

const PERSIST_RETRY_DELAYS_MS = [1000, 3000, 10000] as const;
const PERSIST_FAILURE_TOAST_MESSAGE = 'We could not save this chat yet. Your messages are still visible in this session.';

interface PendingPersistState {
    chatId: string;
    historyToSave: ChatMessage[];
    componentBlocks: ChatComponentBlock[];
    retryIndex: number;
    timeoutId: number | null;
    notifiedFailure: boolean;
}

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
    onHistoryUpdate: (chat: Conversation) => void;
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
}

/**
 * Main PromptWindow component that handles chat interactions between user and AI.
 * Manages chat history, streaming responses, and API interactions for credit card recommendations.
 */
function PromptWindow({
    user,
    returnCurrentChatId,
    onHistoryUpdate,
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
}: PromptWindowProps) {
    const { chatId: urlChatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const promptHistoryRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    // Ref to track when we're intentionally clearing the chat (prevents loading effects from restoring)
    const isClearingRef = useRef<boolean>(false);

    // Maintains the array of chat messages between user and AI in the current conversation
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    // Unique identifier for the current chat conversation
    const [chatId, setChatId] = useState<string>('');
    // Ref to store chatId immediately (synchronous) for use in callbacks
    const chatIdRef = useRef<string>('');
    // Ref to store chatHistory immediately (synchronous) for use in callbacks
    // This avoids React state timing issues on mobile Safari
    const chatHistoryRef = useRef<ChatMessage[]>([]);
    // Tracks whether this is a new chat conversation (true) or loading an existing one (false)
    const [isNewChat, setIsNewChat] = useState<boolean>(false);
    // Indicates whether a new chat creation request is in progress
    const [isNewChatPending, setIsNewChatPending] = useState<boolean>(false);
    // Error state for when loading an existing chat fails
    const [chatLoadError, setChatLoadError] = useState<string | null>(null);
    // Shows a loading overlay while switching between existing chats
    const [isSwitchingChats, setIsSwitchingChats] = useState<boolean>(false);

    // Ref to track if we're currently saving to prevent duplicate saves
    const isSavingRef = useRef<boolean>(false);
    // In-flight create promise for first-message send + parallel persistence
    const pendingChatCreateRef = useRef<Promise<void> | null>(null);
    // Tracks whether the current chat document is known to exist in persistence
    const isChatPersistedRef = useRef<boolean>(false);
    // Retry state for failed persistence (create/update)
    const pendingPersistRef = useRef<PendingPersistState | null>(null);
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

    const clearPendingPersistTimeout = useCallback(() => {
        const pendingPersist = pendingPersistRef.current;
        if (!pendingPersist || pendingPersist.timeoutId === null) {
            return;
        }

        window.clearTimeout(pendingPersist.timeoutId);
        pendingPersist.timeoutId = null;
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

    const cancelChatHydration = useCallback(() => {
        chatHydrationRequestIdRef.current += 1;
        chatHydrationAbortControllerRef.current?.abort();
        chatHydrationAbortControllerRef.current = null;
        setIsSwitchingChats(false);
    }, []);

    const mergeHistoryWithServerIfNeeded = useCallback(async (
        currentChatId: string,
        historyToSave: ChatMessage[],
        componentBlocks: ChatComponentBlock[]
    ): Promise<{ mergedHistory: ChatMessage[]; mergedBlocks: ChatComponentBlock[] }> => {
        const shouldMergeExistingChat = Boolean(
            urlChatId
            && currentChatId === urlChatId
            && !hasHydratedCurrentChatRef.current
        );

        if (!shouldMergeExistingChat) {
            return {
                mergedHistory: historyToSave,
                mergedBlocks: componentBlocks,
            };
        }

        try {
            const existingChat = await UserHistoryService.fetchChatHistoryById(currentChatId);
            const existingConversation = Array.isArray(existingChat.conversation)
                ? existingChat.conversation
                : [];
            const existingMessageIds = new Set(existingConversation.map(message => message.id));
            const unsavedMessages = historyToSave.filter(message => !existingMessageIds.has(message.id));
            const mergedHistory = limitChatHistory([...existingConversation, ...unsavedMessages]);

            const existingBlocks = Array.isArray(existingChat.componentBlocks)
                ? existingChat.componentBlocks
                : [];
            const existingBlockIds = new Set(existingBlocks.map(block => block.id));
            const mergedBlocks = [
                ...existingBlocks,
                ...componentBlocks.filter(block => !existingBlockIds.has(block.id)),
            ];

            // Once merged, local state becomes authoritative and we avoid losing context.
            chatHistoryRef.current = mergedHistory;
            setChatHistory(mergedHistory);
            hasHydratedCurrentChatRef.current = true;

            return { mergedHistory, mergedBlocks };
        } catch (error) {
            const status = (error as { response?: { status?: number } })?.response?.status;

            // If the URL references a chat that does not exist, treat it as a new persisted chat.
            if (status === 404) {
                console.warn('History merge source not found; persisting local conversation as a new chat:', currentChatId);
                return {
                    mergedHistory: historyToSave,
                    mergedBlocks: componentBlocks,
                };
            }

            // Any non-404 merge failure is potentially transient and unsafe to overwrite with local-only state.
            throw error;
        }
    }, [urlChatId]);

    const persistConversation = useCallback(async (
        currentChatId: string,
        historyToSave: ChatMessage[],
        componentBlocks: ChatComponentBlock[]
    ): Promise<void> => {
        if (!user || chatHistoryPreference === CHAT_HISTORY_PREFERENCE.DO_NOT_TRACK_HISTORY) {
            return;
        }

        if (!currentChatId) {
            return;
        }

        const { mergedHistory, mergedBlocks } = await mergeHistoryWithServerIfNeeded(
            currentChatId,
            historyToSave,
            componentBlocks
        );

        if (!isChatPersistedRef.current) {
            const createStart = performance.now();
            const createdChat = await UserHistoryService.createChatHistory(
                mergedHistory,
                mergedBlocks,
                undefined,
                true,
                currentChatId
            );
            isChatPersistedRef.current = true;

            logMetric('chat_create_latency', {
                chatId: currentChatId,
                durationMs: Math.round(performance.now() - createStart),
                source: 'persist_flow',
            });

            onHistoryUpdate(createdChat);

            // Always follow create with update to guarantee persistence when create is idempotent.
            await UserHistoryService.updateChatHistory(
                currentChatId,
                mergedHistory,
                mergedBlocks
            );
        } else {
            await UserHistoryService.updateChatHistory(
                currentChatId,
                mergedHistory,
                mergedBlocks
            );
        }

        const existingChat = existingHistoryList.find(chat => chat.chatId === currentChatId);
        const updatedChat: Conversation = {
            chatId: currentChatId,
            timestamp: new Date().toISOString(),
            conversation: mergedHistory,
            chatDescription: existingChat?.chatDescription || DEFAULT_CHAT_NAME_PLACEHOLDER,
            componentBlocks: mergedBlocks
        };
        onHistoryUpdate(updatedChat);

        if (!existingChat?.chatDescription || existingChat.chatDescription === DEFAULT_CHAT_NAME_PLACEHOLDER) {
            try {
                const newTitle = await UserHistoryService.generateChatTitle(currentChatId);
                onHistoryUpdate({
                    ...updatedChat,
                    chatDescription: newTitle
                });
            } catch (titleError) {
                console.error('Failed to generate title:', titleError);
            }
        }
    }, [
        user,
        chatHistoryPreference,
        mergeHistoryWithServerIfNeeded,
        logMetric,
        onHistoryUpdate,
        existingHistoryList
    ]);

    const runPersistRetryAttempt = useCallback(async () => {
        const pendingPersist = pendingPersistRef.current;
        if (!pendingPersist) {
            return;
        }

        pendingPersist.timeoutId = null;
        const retryAttempt = pendingPersist.retryIndex + 1;

        logMetric('persistence_retry_attempt', {
            chatId: pendingPersist.chatId,
            retryAttempt,
        });

        try {
            await persistConversation(
                pendingPersist.chatId,
                pendingPersist.historyToSave,
                pendingPersist.componentBlocks
            );

            pendingPersistRef.current = null;
            setIsNewChatPending(false);
        } catch (error) {
            pendingPersist.retryIndex += 1;

            logMetric('persistence_retry_failure', {
                chatId: pendingPersist.chatId,
                retryAttempt,
                error: error instanceof Error ? error.message : String(error),
            });

            if (pendingPersist.retryIndex >= PERSIST_RETRY_DELAYS_MS.length) {
                if (!pendingPersist.notifiedFailure) {
                    pendingPersist.notifiedFailure = true;
                    toast.error(PERSIST_FAILURE_TOAST_MESSAGE);
                }

                logMetric('persistence_terminal_failure', {
                    chatId: pendingPersist.chatId,
                    retries: pendingPersist.retryIndex,
                });
                setIsNewChatPending(false);
                return;
            }

            const delayMs = PERSIST_RETRY_DELAYS_MS[pendingPersist.retryIndex];
            pendingPersist.timeoutId = window.setTimeout(() => {
                void runPersistRetryAttempt();
            }, delayMs);
        }
    }, [logMetric, persistConversation]);

    const schedulePersistRetry = useCallback((
        payload: Pick<PendingPersistState, 'chatId' | 'historyToSave' | 'componentBlocks'>,
        error: unknown
    ) => {
        const existingPending = pendingPersistRef.current;

        if (!existingPending) {
            pendingPersistRef.current = {
                ...payload,
                retryIndex: 0,
                timeoutId: null,
                notifiedFailure: false,
            };
        } else {
            existingPending.chatId = payload.chatId;
            existingPending.historyToSave = payload.historyToSave;
            existingPending.componentBlocks = payload.componentBlocks;

            // After a terminal failure, a new failed persist attempt should start a fresh retry window.
            if (
                existingPending.timeoutId === null
                && existingPending.retryIndex >= PERSIST_RETRY_DELAYS_MS.length
            ) {
                existingPending.retryIndex = 0;
                existingPending.notifiedFailure = false;
            }
        }

        const pendingPersist = pendingPersistRef.current;
        if (!pendingPersist) {
            return;
        }

        logMetric('persistence_retry_scheduled', {
            chatId: pendingPersist.chatId,
            retryAttempt: pendingPersist.retryIndex + 1,
            error: error instanceof Error ? error.message : String(error),
        });

        if (pendingPersist.timeoutId !== null) {
            return;
        }

        if (pendingPersist.retryIndex >= PERSIST_RETRY_DELAYS_MS.length) {
            if (!pendingPersist.notifiedFailure) {
                pendingPersist.notifiedFailure = true;
                toast.error(PERSIST_FAILURE_TOAST_MESSAGE);
            }
            return;
        }

        const delayMs = PERSIST_RETRY_DELAYS_MS[pendingPersist.retryIndex];
        pendingPersist.timeoutId = window.setTimeout(() => {
            void runPersistRetryAttempt();
        }, delayMs);
    }, [logMetric, runPersistRetryAttempt]);

    // Handler for completed messages - updates chat and generates title
    const handleMessageComplete = useCallback((
        message: ChatMessage
    ) => {
        if (isSavingRef.current) {
            return;
        }
        isSavingRef.current = true;

        const historyForStorage = [...chatHistoryRef.current, message];
        chatHistoryRef.current = historyForStorage;
        setChatHistory(prev => limitChatHistory([...prev, message]));

        (async () => {
            const currentChatId = getCurrentChatContext();

            try {
                if (!user || chatHistoryPreference === CHAT_HISTORY_PREFERENCE.DO_NOT_TRACK_HISTORY) {
                    setIsNewChatPending(false);
                    return;
                }

                if (!currentChatId) {
                    setIsNewChatPending(false);
                    return;
                }

                if (pendingChatCreateRef.current) {
                    try {
                        await pendingChatCreateRef.current;
                    } catch (createError) {
                        console.warn('Initial chat create failed, continuing with persistence retry flow:', createError);
                    } finally {
                        pendingChatCreateRef.current = null;
                    }
                }

                const historyToSave = historyForStorage.filter(
                    m => m.chatSource !== CHAT_SOURCE.ERROR && !m.isError
                );
                const componentBlocks = extractComponentBlocks(historyForStorage);

                await persistConversation(
                    currentChatId,
                    historyToSave,
                    componentBlocks
                );

                clearPendingPersistTimeout();
                pendingPersistRef.current = null;
                setIsNewChatPending(false);
            } catch (error) {
                const historyToSave = historyForStorage.filter(
                    m => m.chatSource !== CHAT_SOURCE.ERROR && !m.isError
                );
                const componentBlocks = extractComponentBlocks(historyForStorage);

                schedulePersistRetry(
                    {
                        chatId: currentChatId,
                        historyToSave,
                        componentBlocks,
                    },
                    error
                );
            } finally {
                isSavingRef.current = false;
            }
        })();
    }, [
        user,
        chatHistoryPreference,
        getCurrentChatContext,
        persistConversation,
        clearPendingPersistTimeout,
        schedulePersistRetry
    ]);

    // Handler for stream errors
    const handleStreamError = useCallback((error: string) => {
        const errorInfo = classifyError(new Error(error));
        const errorMessage = createErrorMessage(errorInfo.message);
        chatHistoryRef.current = [...chatHistoryRef.current, errorMessage];
        setChatHistory(prev => [...prev, errorMessage]);
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
                currentChatId
            ).then((response) => {
                isChatPersistedRef.current = true;
                logMetric('chat_create_latency', {
                    chatId: currentChatId,
                    durationMs: Math.round(performance.now() - createStart),
                    source: 'initial_parallel_create',
                });
                onHistoryUpdate(response);
            }).catch((error) => {
                isChatPersistedRef.current = false;
                schedulePersistRetry(
                    {
                        chatId: currentChatId,
                        historyToSave: [userMessage],
                        componentBlocks: [],
                    },
                    error
                );
            }).finally(() => {
                setIsNewChatPending(false);
            });
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
        newChatId: string
    ) => {
        const limitedHistory = limitChatHistory(conversation);
        chatHistoryRef.current = limitedHistory;
        setChatHistory(limitedHistory);
        chatIdRef.current = newChatId;
        setChatId(newChatId);
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
        const previewConversation = Array.isArray(existingChat.conversation)
            ? existingChat.conversation
            : [];
        const previewMessageCount = typeof existingChat.messageCount === 'number'
            ? existingChat.messageCount
            : previewConversation.length;

        if (previewConversation.length > 0) {
            return previewConversation;
        }

        if (previewMessageCount === 0) {
            return [];
        }

        const response = await UserHistoryService.fetchChatHistoryById(targetChatId, signal);
        return Array.isArray(response.conversation) ? response.conversation : [];
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

        if (chatIdRef.current !== urlChatId) {
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
                clearPendingPersistTimeout();
                pendingPersistRef.current = null;
                returnCurrentChatId('');
                return;
            }

            const isSwitchingToDifferentChat = urlChatId !== chatIdRef.current;
            const isPendingFirstMessageTransition = Boolean(
                isSwitchingToDifferentChat
                && hasUserSentInCurrentChatRef.current
                && (!isChatPersistedRef.current || pendingChatCreateRef.current !== null)
                && (isNewChatPending || isProcessing || pendingChatCreateRef.current !== null)
            );

            if (isPendingFirstMessageTransition) {
                chatIdRef.current = urlChatId;
                setChatId(urlChatId);
                setIsNewChat(false);
                setIsSwitchingChats(false);
                return;
            }

            if (isSwitchingToDifferentChat) {
                // Prevent stream events from a previous chat leaking into this one.
                cancelStream();
                submitStartedAtRef.current = null;
                hasLoggedFirstTokenRef.current = false;
                hasUserSentInCurrentChatRef.current = false;
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
            // Only show the switching overlay when there is already chat content on screen
            // (i.e. user is navigating between chats). On initial page load the
            // PromptHistory component already displays its own loading message, so the
            // overlay would just stack on top and cause overlapping text.
            if (isLoadingHistory && !existingHistoryList.some(chat => chat.chatId === urlChatId)) {
                if (chatHistoryRef.current.length > 0) {
                    setIsSwitchingChats(true);
                }
                return;
            }

            setChatLoadError(null);
            setIsSwitchingChats(true);

            chatHydrationRequestIdRef.current += 1;
            const requestId = chatHydrationRequestIdRef.current;

            chatHydrationAbortControllerRef.current?.abort();
            const abortController = new AbortController();
            chatHydrationAbortControllerRef.current = abortController;

            // Keep previous chat content visible until target chat is loaded.
            chatIdRef.current = urlChatId;
            setChatId(urlChatId);
            setIsNewChat(false);
            hasHydratedCurrentChatRef.current = false;
            hasUserSentInCurrentChatRef.current = false;
            isChatPersistedRef.current = false;

            try {
                const existingChat = existingHistoryList.find(chat => chat.chatId === urlChatId);
                const conversation = existingChat
                    ? await resolveConversationFromPreview(existingChat, urlChatId, abortController.signal)
                    : (await UserHistoryService.fetchChatHistoryById(urlChatId, abortController.signal)).conversation;

                if (!isHydrationRequestCurrent(requestId, urlChatId)) {
                    return;
                }

                setExistingChatStates(Array.isArray(conversation) ? conversation : [], urlChatId);
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
                    setIsSwitchingChats(false);
                }
            }
        };

        void loadHistory();
    }, [
        cancelChatHydration,
        cancelStream,
        clearPendingPersistTimeout,
        existingHistoryList,
        isAbortError,
        isHydrationRequestCurrent,
        isLoadingHistory,
        isNewChatPending,
        isProcessing,
        isTransientHydrationMiss,
        resolveConversationFromPreview,
        returnCurrentChatId,
        setExistingChatStates,
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
            setTimeout(() => {
                isClearingRef.current = false;
            }, 150);
        }
    }, [clearChatCallback, setClearChatCallback]);

    useEffect(() => {
        return () => {
            clearPendingPersistTimeout();
            chatHydrationRequestIdRef.current += 1;
            chatHydrationAbortControllerRef.current?.abort();
            chatHydrationAbortControllerRef.current = null;
        };
    }, [clearPendingPersistTimeout]);

    // Auto-scroll effect
    useEffect(() => {
        if (promptHistoryRef.current && shouldAutoScroll) {
            const scrollToBottom = () => {
                const container = promptHistoryRef.current;
                if (container) {
                    container.scrollTo({
                        top: container.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            };

            // Small delay to ensure content is rendered
            setTimeout(scrollToBottom, 100);
        }
    }, [
        chatHistory,
        streamingState.streamedText,
        streamingState.isStreaming,      // Scroll when streaming starts
        streamingState.timeline.nodes,   // Scroll when timeline nodes update
        streamingState.activeNode,       // Scroll when active node changes
        streamingState.activeTool,       // Scroll when active tool changes
        shouldAutoScroll
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

        try {
            const existingChat = existingHistoryList.find(chat => chat.chatId === urlChatId);
            const conversation = existingChat
                ? await resolveConversationFromPreview(existingChat, urlChatId, abortController.signal)
                : (await UserHistoryService.fetchChatHistoryById(urlChatId, abortController.signal)).conversation;

            if (!isHydrationRequestCurrent(requestId, urlChatId)) {
                return;
            }

            setExistingChatStates(Array.isArray(conversation) ? conversation : [], urlChatId);
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
                setIsSwitchingChats(false);
            }
        }
    };

    /**
     * Cancels ongoing streaming and resets state.
     */
    const handleCancel = () => {
        cancelStream();
        setIsNewChatPending(false);
        submitStartedAtRef.current = null;
        hasLoggedFirstTokenRef.current = false;
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
        setChatId('');
        hasHydratedCurrentChatRef.current = false;
        hasUserSentInCurrentChatRef.current = false;
        isChatPersistedRef.current = false;
        pendingChatCreateRef.current = null;
        clearPendingPersistTimeout();
        pendingPersistRef.current = null;
        submitStartedAtRef.current = null;
        hasLoggedFirstTokenRef.current = false;

        // Reset saving flag for the new chat
        isSavingRef.current = false;

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
                        chatId={chatId}
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
                {isSwitchingChats && !chatLoadError && (
                    <div className="chat-switch-loading-overlay">
                        <InfoDisplay
                            type="loading"
                            message={'Loading chat...'}
                            showTitle={false}
                            transparent={true}
                            centered
                        />
                    </div>
                )}
            </div>

            <div className="prompt-combined-container">
                <div className="prompt-input-container">
                    <PromptField
                        returnPrompt={getPrompt}
                        isProcessing={isProcessing}
                        onCancel={handleCancel}
                        disabled={chatHistory.length >= MAX_CHAT_MESSAGES || isSwitchingChats}
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
