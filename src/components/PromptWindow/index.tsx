import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import { useFullHeight } from '../../hooks/useFullHeight';

import PromptHistory from './PromptHistory';
import PromptField from './PromptField';
import PromptSolution from './PromptSolution';
import './PromptWindow.scss';
import {
    prepareRequestData,
    processChatAndSolutions,
    handleHistoryStorage,
    limitChatHistory
} from './utils';

import axios from 'axios';

// Import types
import { CreditCard, PAGES, TERMINOLOGY } from '../../types';
import { ChatMessage, ChatSolution, ChatSolutionSelectedCardId, Conversation } from '../../types';
import { ChatHistoryPreference, InstructionsPreference } from '../../types';
import { aiClient, userClient, MAX_CHAT_MESSAGES, CHAT_HISTORY_MESSAGES } from './utils';
import { NO_DISPLAY_NAME_PLACEHOLDER } from '../../types';
import { UserHistoryService } from '../../services';
import { InfoDisplay } from '../../elements';

/**
 * Props for the PromptWindow component.
 * @param {CreditCard[]} creditCards - An array of credit cards.
 * @param {string[]} userCardDetails - An array of user card details.
 * @param {FirebaseUser | null} user - The current user.
 * @param {function} returnCurrentChatId - A function to return the current chat ID.
 * @param {function} onHistoryUpdate - A function to update the history.
 * @param {number} clearChatCallback - A callback to clear the chat.
 * @param {function} setClearChatCallback - A function to set the clear chat callback.
 * @param {Conversation[]} existingHistoryList - An array of existing history.
 * @param {string} preferencesInstructions - The preferences instructions.
 * @param {ChatHistoryPreference} chatHistoryPreference - The chat history preference.
 */
interface PromptWindowProps {
    creditCards: CreditCard[];
    userCardDetails: string[];
    user: FirebaseUser | null;
    returnCurrentChatId: (chatId: string) => void;
    onHistoryUpdate: (chat: Conversation) => void;
    clearChatCallback: number;
    setClearChatCallback: (value: number) => void;
    existingHistoryList: Conversation[];
    preferencesInstructions: InstructionsPreference;
    chatHistoryPreference: ChatHistoryPreference;
}

/**
 * Main PromptWindow component that handles chat interactions between user and AI.
 * Manages chat history, solutions, and API interactions for credit card recommendations.
 * 
 * @param {PromptWindowProps} props - Component props including credit cards, user details, and callbacks
 * @returns {JSX.Element} Rendered PromptWindow component
 */
function PromptWindow({ 
    creditCards, 
    userCardDetails,
    user, 
    returnCurrentChatId, 
    onHistoryUpdate, 
    clearChatCallback,
    setClearChatCallback,
    existingHistoryList,
    preferencesInstructions,
    chatHistoryPreference,
}: PromptWindowProps) {
    const { chatId: urlChatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    const promptHistoryRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    
    // Stores the current input value in the prompt field
    const [promptValue, setPromptValue] = useState<string>('');
    // Maintains the array of chat messages between user and AI in the current conversation
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    // Stores the AI's credit card recommendations and solutions for the current conversation
    const [promptSolutions, setPromptSolutions] = useState<ChatSolution>([]);
    // Stores the selected card ID for the current conversation
    const [selectedCardId, setSelectedCardId] = useState<ChatSolutionSelectedCardId>('');
    // Unique identifier for the current chat conversation
    const [chatId, setChatId] = useState<string>('');
    // Tracks whether this is a new chat conversation (true) or loading an existing one (false)
    const [isNewChat, setIsNewChat] = useState<boolean>(false);
    // Indicates whether the initial AI response is being loaded
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // Indicates whether the AI is generating card recommendations/solutions
    const [isLoadingSolutions, setIsLoadingSolutions] = useState<boolean>(false);
    // Overall processing state that covers both chat response and solutions generation
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    // Reference to AbortController for cancelling ongoing API requests
    const abortControllerRef = useRef<AbortController | null>(null);
    // Counter used to trigger new API calls when prompt is submitted
    const [triggerCall, setTriggerCall] = useState<number>(0);
    // Indicates whether a new chat creation request is in progress
    const [isNewChatPending, setIsNewChatPending] = useState<boolean>(false);
    // Stores error messages to display to the user
    const [errorMessage, setErrorMessage] = useState<string>('');
    // Controls whether to show the error message
    const [showError, setShowError] = useState<boolean>(false);
    // Indicates if the error is a rate limiting error
    const [isRateLimitError, setIsRateLimitError] = useState<boolean>(false);
    // Indicates if the error is a daily rate limiting error
    const [isDailyRateLimitError, setIsDailyRateLimitError] = useState<boolean>(false);

    // Declare that this component needs full height behavior
    useFullHeight(true);

    /**
     * Retrieves user prompt input and triggers the chat process.
     * Prevents new chat creation if one is already pending.
     * 
     * @param {string} returnPromptStr - The prompt text received from the input field
     */
    const getPrompt = (returnPromptStr: string) => {
        // Clear any previous errors
        setShowError(false);
        setIsRateLimitError(false);
        setIsDailyRateLimitError(false);
        
        if (isNewChat && isNewChatPending) {
            console.log('New chat creation in progress, please wait...');
            return;
        }
        setPromptValue(returnPromptStr);
        setTriggerCall(prev => prev + 1);
    };

    /**
     * Adds a new message to the chat history with a unique ID.
     * Limits the chat history to the maximum allowed messages.
     * 
     * @param {typeof userClient | typeof aiClient} source - The source of the message (user or AI)
     * @param {string} message - The message content to add
     */
    const addChatHistory = (source: typeof userClient | typeof aiClient, message: string) => {
        const newEntry: ChatMessage = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            chatSource: source,
            chatMessage: message,
        };

        setChatHistory((prevChatHistory) => {
            const updatedHistory = [...prevChatHistory, newEntry];
            return limitChatHistory(updatedHistory);
        });
    };

    /**
     * Helper function to set chat states when loading existing chat data.
     * Updates chat history, solutions, chat ID, and related states.
     * 
     * @param {ChatMessage[]} conversation - The chat conversation history
     * @param {ChatSolution} solutions - The chat solutions
     * @param {string} newChatId - The chat ID to set
     * @param {ChatSolutionSelectedCardId} cardSelection - The selected card ID
     */
    const setExistingChatStates = (
        conversation: ChatMessage[],
        solutions: ChatSolution,
        newChatId: string,
        cardSelection: ChatSolutionSelectedCardId
    ) => {
        setChatHistory(limitChatHistory(conversation));
        setPromptSolutions(solutions);
        setChatId(newChatId);
        setIsNewChat(false);
        returnCurrentChatId(newChatId);
        setSelectedCardId(cardSelection || '');
    };

    /**
     * Effect hook that triggers when a new prompt is submitted.
     * Handles the initial processing of a new chat message:
     * - Sets pending state for new chats
     * - Adds the user's message to chat history
     * - Initiates the server call for AI response
     * 
     * @dependency {triggerCall} - Incremented when a new prompt is submitted
     */
    useEffect(() => {
        if (promptValue !== '') {
            if (isNewChat) {
                setIsNewChatPending(true);
            }
            addChatHistory(userClient, promptValue);
            callServer();
        }
    }, [triggerCall]);

    /**
     * Effect hook that synchronizes the URL with the current chat ID.
     * Updates the URL and notifies parent component when chat ID changes.
     * 
     * @dependency {chatId} - The current chat ID
     */
    useEffect(() => {
        if (chatId && chatId !== urlChatId) {
            returnCurrentChatId(chatId);
            navigate(`/${chatId}`, { replace: true });
        }
    }, [chatId]);

    /**
     * Effect hook that loads chat history when accessing an existing chat.
     * Handles loading from existing history list (in-memory) or fetching from API.
     * 
     * @dependency {urlChatId} - Chat ID from URL parameters
     * @dependency {user} - Current user object
     * @dependency {existingHistoryList} - List of existing chat histories
     */
    useEffect(() => {
        if (user) {
            const loadHistory = async () => {
                if (!user) return;
                
                // If there's no urlChatId, we're on the home page - clear everything for a new chat
                if (!urlChatId) {
                    setSelectedCardId('');
                    setPromptSolutions([]);
                    setChatHistory([]);
                    setChatId('');
                    setIsNewChat(true);
                    returnCurrentChatId('');
                    return;
                }
                
                // Return early if the URL chat ID is the same as the current chat ID
                if (urlChatId === chatId) return;
                
                // Always reset state when loading a new chat - do this first before any async operations
                setSelectedCardId('');
                setPromptSolutions([]);
                setChatHistory([]);

                const existingChat = existingHistoryList.find(chat => chat.chatId === urlChatId);
                
                if (existingChat) {
                    setExistingChatStates(existingChat.conversation, existingChat.solutions, urlChatId, existingChat.cardSelection);
                    return;
                }

                try {
                    const response = await UserHistoryService.fetchChatHistoryById(urlChatId);
                    setExistingChatStates(response.conversation, response.solutions, urlChatId, response.cardSelection);
                } catch (error) {
                    console.error('Error loading chat:', error);
                    setErrorMessage('Error loading chat history');
                    setShowError(true);
                }
            };
            loadHistory();
        }
    }, [urlChatId, user, existingHistoryList]);

    /**
     * Effect hook that handles clearing the chat when triggered externally.
     * Resets the chat window when clearChatCallback is incremented.
     * 
     * @dependency {clearChatCallback} - External trigger to clear chat
     * @dependency {setClearChatCallback} - Function to reset the clear chat trigger
     */
    useEffect(() => {
        if (clearChatCallback > 0) {
            handleNewTransaction();
            setClearChatCallback(0);
        }
    }, [clearChatCallback, setClearChatCallback]);

    /**
     * Effect hook that ensures selectedCardId is reset when chatId changes
     * This helps maintain state consistency when switching between chats
     * 
     * @dependency {chatId} - The current chat ID
     */
    useEffect(() => {
        if (!chatId) {
            setSelectedCardId('');
        }
    }, [chatId]);

    // Modified auto-scroll effect
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
    }, [chatHistory, shouldAutoScroll]);

    // Add scroll event listener to track when user is near bottom
    useEffect(() => {
        const container = promptHistoryRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            // Consider "near bottom" to be within 100px of the bottom
            const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 400;
            setShouldAutoScroll(isNearBottom);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const callServer = async (): Promise<void> => {
        setIsProcessing(true);
        setIsLoading(true);
        
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const name = user?.displayName || NO_DISPLAY_NAME_PLACEHOLDER;
        const userMessage: ChatMessage = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            chatSource: userClient,
            chatMessage: promptValue
        };

        try {
            const requestData = prepareRequestData(
                name,
                promptValue,
                chatHistory
            );
            
            const { updatedHistory, solutions } = await processChatAndSolutions(
                requestData,
                userMessage,
                signal,
                chatHistory,
                setIsLoading,
                setIsLoadingSolutions,
                setChatHistory,
                promptSolutions
            );
            
            setPromptSolutions(solutions);
            setIsLoadingSolutions(false);
            
            setChatHistory(limitChatHistory(updatedHistory));
            
            await handleHistoryStorage(
                updatedHistory,
                solutions,
                signal,
                user,
                chatHistoryPreference,
                isNewChat,
                chatId,
                existingHistoryList,
                setIsNewChatPending,
                onHistoryUpdate,
                setChatId,
                returnCurrentChatId,
                setIsNewChat
            );
            
            // Clear any errors on success
            setShowError(false);
            setIsRateLimitError(false);
            setIsDailyRateLimitError(false);
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request cancelled');
                setIsNewChatPending(false);
                resetLoading();
                abortControllerRef.current = null;
                return;
            }
            console.error(error);
            setIsNewChatPending(false);

            // Check if this is a rate limiting error (429 status)
            if (axios.isAxiosError(error) && error.response?.status === 429) {
                // Check if it's specifically a daily rate limit error
                const errorCode = error.response?.data?.error?.code;

                if (errorCode === 'DAILY_RATE_LIMIT_EXCEEDED') {
                    setErrorMessage('You\'ve run out of messages for the day. Your limit will reset in 24 hours.');
                    setIsDailyRateLimitError(true);
                    setIsRateLimitError(false);
                } else {
                    setErrorMessage('You\'re sending messages too quickly. Please wait before trying again.');
                    setIsRateLimitError(true);
                    setIsDailyRateLimitError(false);
                }
            } else {
                setErrorMessage('Error processing request, please try again.');
                setIsRateLimitError(false);
                setIsDailyRateLimitError(false);
            }
            setShowError(true);
        } finally {
            resetLoading();
            abortControllerRef.current = null;
        }
    };

    /**
     * Resets all loading states to their default values.
     */
    const resetLoading = () => {
        setIsProcessing(false);
        setIsLoading(false);
        setIsLoadingSolutions(false);
    };

    /**
     * Cancels ongoing API requests and resets loading states.
     */
    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        resetLoading();
    };

    /**
     * Resets the chat window to start a new transaction.
     * Clears history, solutions, and navigates to root.
     */
    const handleNewTransaction = () => {
        setChatHistory([]);
        setPromptSolutions([]);
        setSelectedCardId('');
        setIsNewChat(true);
        setIsNewChatPending(false);
        setChatId('');
        returnCurrentChatId('');
        navigate(PAGES.HOME.PATH);
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

                <PromptHistory 
                    chatHistory={chatHistory} 
                    isNewChat={isNewChat} 
                    isLoading={isLoading}
                    isLoadingSolutions={isLoadingSolutions}
                />
            </div>

            {showError && (
                <div className="error-container">
                    <InfoDisplay
                        type={isDailyRateLimitError || isRateLimitError ? "warning" : "error"}
                        message={errorMessage}
                        transparent={true}
                        showTitle={!isDailyRateLimitError}
                    />
                </div>
            )}
            
            <div className="prompt-combined-container">
                <div className="prompt-solutions-container">
                    <PromptSolution 
                        promptSolutions={promptSolutions} 
                        creditCards={creditCards} 
                        chatId={chatId}
                        selectedCardId={selectedCardId}
                        onHistoryUpdate={onHistoryUpdate}
                        chatHistory={chatHistory}
                    />
                </div>
                <div className="prompt-input-container">
                    <PromptField 
                        returnPrompt={getPrompt} 
                        isProcessing={isProcessing} 
                        onCancel={handleCancel} 
                    />
                </div>
                {chatHistory.length >= MAX_CHAT_MESSAGES && (
                    <div className="below-prompt-field-text">
                        Remember to <button onClick={handleNewTransaction} className="inline-button">{TERMINOLOGY.inlineNewChatReminder}</button> for best results.
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