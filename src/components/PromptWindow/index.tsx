import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
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
import { PAGES, TERMINOLOGY } from '../../types';
import { ChatMessage, Conversation } from '../../types';
import { ChatHistoryPreference, ChatModePreference } from '../../types';
import { MAX_CHAT_MESSAGES, CHAT_HISTORY_MESSAGES } from './utils';
import { NO_DISPLAY_NAME_PLACEHOLDER } from '../../types';
import { UserHistoryService } from '../../services';
import { ErrorWithRetry } from '../../elements';
import { classifyError } from '../../types/AgentChatTypes';

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
    chatMode?: ChatModePreference;
    isLoadingHistory?: boolean;
    onNewChat: () => void;
    onCardSelect?: (cardId: string) => void;
    onCreditClick?: (cardId: string, creditId: string) => void;
    /** Callback to refresh credits/monthly stats after AI updates */
    onRefreshCredits?: () => void;
    /** Callback to refresh cards after AI updates */
    onRefreshCards?: () => void;
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
    chatMode,
    isLoadingHistory = false,
    onNewChat,
    onCardSelect,
    onCreditClick,
    onRefreshCredits,
    onRefreshCards,
}: PromptWindowProps) {
    const { chatId: urlChatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    const promptHistoryRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    // Ref to track when we're intentionally clearing the chat (prevents loading effects from restoring)
    const isClearingRef = useRef<boolean>(false);

    // Maintains the array of chat messages between user and AI in the current conversation
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    // Unique identifier for the current chat conversation
    const [chatId, setChatId] = useState<string>('');
    // Tracks whether this is a new chat conversation (true) or loading an existing one (false)
    const [isNewChat, setIsNewChat] = useState<boolean>(false);
    // Indicates whether a new chat creation request is in progress
    const [isNewChatPending, setIsNewChatPending] = useState<boolean>(false);
    // Error state for when loading an existing chat fails
    const [chatLoadError, setChatLoadError] = useState<string | null>(null);

    // Ref to track if we're currently saving to prevent duplicate saves
    const isSavingRef = useRef<boolean>(false);

    // Handler for completed messages - updates chat and generates title
    const handleMessageComplete = useCallback((
        message: ChatMessage
    ) => {
        // Prevent duplicate saves (React strict mode can call this multiple times)
        if (isSavingRef.current) {
            console.log('[handleMessageComplete] Already saving, skipping duplicate call');
            return;
        }
        isSavingRef.current = true;

        // Add assistant message to history
        let historyForStorage: ChatMessage[] = [];

        setChatHistory(prev => {
            const updatedHistory = [...prev, message];
            historyForStorage = updatedHistory;
            return limitChatHistory(updatedHistory);
        });

        // Update the chat with the complete conversation
        // Chat was already created in getPrompt, so we just update it
        setTimeout(async () => {
            try {
                // Skip if user preference is to not track history
                if (!user || chatHistoryPreference === 'do_not_track_history') {
                    setIsNewChatPending(false);
                    return;
                }

                // Filter out error messages before saving
                const historyToSave = historyForStorage.filter(
                    m => m.chatSource !== 'error' && !m.isError
                );

                const componentBlocks = extractComponentBlocks(historyForStorage);

                // Update the existing chat
                await UserHistoryService.updateChatHistory(
                    chatId,
                    historyToSave,
                    componentBlocks
                );

                console.log('[handleMessageComplete] Updated chat:', chatId);

                // Update sidebar with the new conversation
                const existingChat = existingHistoryList.find(chat => chat.chatId === chatId);
                const updatedChat: Conversation = {
                    chatId: chatId,
                    timestamp: new Date().toISOString(),
                    conversation: historyToSave,
                    chatDescription: existingChat?.chatDescription || 'New Chat',
                    componentBlocks: componentBlocks
                };
                onHistoryUpdate(updatedChat);

                // Generate title if chat still has placeholder name
                if (!existingChat?.chatDescription || existingChat.chatDescription === 'New Chat') {
                    try {
                        const newTitle = await UserHistoryService.generateChatTitle(chatId);
                        console.log('[handleMessageComplete] Generated title:', newTitle);

                        // Update sidebar with the new title
                        onHistoryUpdate({
                            ...updatedChat,
                            chatDescription: newTitle
                        });
                    } catch (titleError) {
                        console.error('Failed to generate title:', titleError);
                        // Chat still works, just keeps "New Chat" title
                    }
                }

                setIsNewChatPending(false);
            } catch (error) {
                console.error('Error updating chat history:', error);
            } finally {
                isSavingRef.current = false;
            }
        }, 0);
    }, [user, chatHistoryPreference, chatId, existingHistoryList, onHistoryUpdate]);

    // Handler for stream errors
    const handleStreamError = useCallback((error: string) => {
        const errorInfo = classifyError(new Error(error));
        const errorMessage = createErrorMessage(errorInfo.message);
        setChatHistory(prev => [...prev, errorMessage]);
        setIsNewChatPending(false);
    }, []);

    // Handler for data changes (triggers UI refresh)
    const handleDataChanged = useCallback((dataChanged: { credits?: boolean; cards?: boolean; preferences?: boolean }) => {
        console.log('[PromptWindow] Data changed, triggering refresh:', dataChanged);

        if (dataChanged.credits && onRefreshCredits) {
            onRefreshCredits();
        }

        if (dataChanged.cards && onRefreshCards) {
            onRefreshCards();
        }

        // Note: preferences refresh is handled by the preferences context if needed
    }, [onRefreshCredits, onRefreshCards]);

    // Use the agent chat hook for streaming
    const {
        streamingState,
        sendMessage: sendAgentMessage,
        cancelStream,
        isProcessing,
    } = useAgentChat({
        userName: user?.displayName || NO_DISPLAY_NAME_PLACEHOLDER,
        conversationId: chatId || undefined,
        chatMode,
        onMessageComplete: handleMessageComplete,
        onError: handleStreamError,
        onDataChanged: handleDataChanged,
    });

    // Declare that this component needs full height behavior
    useFullHeight(true);

    /**
     * Retrieves user prompt input and triggers the chat process.
     * For new chats, creates the chat immediately before sending to agent.
     */
    const getPrompt = async (returnPromptStr: string) => {
        if (isNewChat && isNewChatPending) {
            console.log('New chat creation in progress, please wait...');
            return;
        }

        // Don't allow new messages while processing
        if (isProcessing) {
            return;
        }

        // Create user message and add to history
        const userMessage = createUserMessage(returnPromptStr);
        setChatHistory(prev => [...prev, userMessage]);

        // For NEW chats: Create chat immediately with just the user message
        if (isNewChat) {
            setIsNewChatPending(true);
            try {
                // Create chat with skipTitleGeneration - title will be generated after AI responds
                const response = await UserHistoryService.createChatHistory(
                    [userMessage],
                    [],
                    undefined,
                    true  // skipTitleGeneration
                );

                // Store the chatId and mark as no longer new
                setChatId(response.chatId);
                setIsNewChat(false);
                returnCurrentChatId(response.chatId);

                // Add to sidebar immediately with placeholder title
                onHistoryUpdate(response);

                console.log('[getPrompt] Created new chat:', response.chatId);
            } catch (error) {
                console.error('Failed to create chat:', error);
                setIsNewChatPending(false);
                // Remove the user message we added optimistically
                setChatHistory(prev => prev.filter(m => m.id !== userMessage.id));
                return;
            }
        }

        // Send to agent endpoint (hook handles streaming)
        // Note: chatHistory state may not be updated yet, but agent receives prompt directly
        sendAgentMessage(returnPromptStr, chatHistory);
    };

    /**
     * Helper function to set chat states when loading existing chat data.
     */
    const setExistingChatStates = (
        conversation: ChatMessage[],
        newChatId: string
    ) => {
        setChatHistory(limitChatHistory(conversation));
        setChatId(newChatId);
        setIsNewChat(false);
        returnCurrentChatId(newChatId);
    };

    /**
     * Effect hook that synchronizes the URL with the current chat ID.
     */
    useEffect(() => {
        if (chatId && chatId !== urlChatId) {
            returnCurrentChatId(chatId);
            navigate(`/${chatId}`, { replace: true });
        }
    }, [chatId]);

    /**
     * Effect hook that loads chat history when accessing an existing chat.
     */
    useEffect(() => {
        if (user) {
            const loadHistory = async () => {
                if (!user) return;

                // Skip if we're intentionally clearing the chat
                if (isClearingRef.current) return;

                // If there's no urlChatId, we're on the home page - clear everything for a new chat
                if (!urlChatId) {
                    setChatHistory([]);
                    setChatId('');
                    setIsNewChat(true);
                    returnCurrentChatId('');
                    return;
                }

                // Return early if the URL chat ID is the same as the current chat ID
                if (urlChatId === chatId) return;

                // Wait for initial history loading to complete before checking for existing chat
                if (isLoadingHistory) {
                    console.log('Waiting for history to finish loading before loading chat...');
                    return;
                }

                // Always reset state when loading a new chat
                setChatHistory([]);

                const existingChat = existingHistoryList.find(chat => chat.chatId === urlChatId);

                if (existingChat) {
                    // Chat found in pre-loaded history - fast path
                    console.log('Chat found in pre-loaded history - using fast path');
                    setExistingChatStates(existingChat.conversation, urlChatId);
                    return;
                }

                // Fallback: Chat not in pre-loaded history, fetch individually
                console.warn('Chat not found in pre-loaded history, fetching individually:', urlChatId);
                try {
                    setChatLoadError(null);
                    const response = await UserHistoryService.fetchChatHistoryById(urlChatId);
                    setExistingChatStates(response.conversation, urlChatId);
                } catch (error) {
                    console.error('Error loading chat:', error);
                    setChatLoadError('Failed to load chat. Please try again.');
                }
            };
            loadHistory();
        }
    }, [urlChatId, user, isLoadingHistory]);

    // Separate effect to handle when chat becomes available in history
    useEffect(() => {
        if (!urlChatId || !user || chatId === urlChatId) return;

        // Skip if we're intentionally clearing the chat
        if (isClearingRef.current) return;

        const existingChat = existingHistoryList.find(chat => chat.chatId === urlChatId);
        if (existingChat && !chatHistory.length) {
            // Chat just became available and we haven't loaded it yet
            setExistingChatStates(existingChat.conversation, urlChatId);
        }
    }, [existingHistoryList, urlChatId, user, chatId, chatHistory.length]);

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
    }, [chatHistory, streamingState.streamedText, shouldAutoScroll]);

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
        try {
            const response = await UserHistoryService.fetchChatHistoryById(urlChatId);
            setExistingChatStates(response.conversation, urlChatId);
        } catch (error) {
            console.error('Error loading chat:', error);
            setChatLoadError('Failed to load chat. Please try again.');
        }
    };

    /**
     * Cancels ongoing streaming and resets state.
     */
    const handleCancel = () => {
        cancelStream();
        setIsNewChatPending(false);
    };

    /**
     * Resets the chat window to start a new transaction.
     */
    const handleNewTransaction = () => {
        // Cancel any in-progress streaming
        cancelStream();

        // Clear local state
        setChatHistory([]);
        setIsNewChat(true);
        setIsNewChatPending(false);
        setChatId('');

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

    const handlePerkClick = (cardId: string, perkId: string) => {
        // TODO: Implement perk detail modal
        console.log('Perk clicked:', cardId, perkId);
    };

    const handleMultiplierClick = (cardId: string, multiplierId: string) => {
        // TODO: Implement multiplier detail modal
        console.log('Multiplier clicked:', cardId, multiplierId);
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
            <div ref={promptHistoryRef} className="prompt-history-container">
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
                        disabled={chatHistory.length >= MAX_CHAT_MESSAGES}
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
