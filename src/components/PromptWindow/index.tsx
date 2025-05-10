import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';

import PromptHistory from './PromptHistory';
import PromptField from './PromptField';
import PromptSolution from './PromptSolution';
import PromptHelpModal from './PromptHelpModal';
import { Modal, useModal } from '../Modal';
import './PromptWindow.scss';
import {
    prepareRequestData,
    processChatAndSolutions,
    handleHistoryStorage,
    limitChatHistory,
    getCurrentDateString
} from './utils';

import axios from 'axios';

// Import types
import { CreditCard } from '../../types';
import { ChatMessage, ChatSolution, ChatSolutionSelectedCardId, Conversation } from '../../types';
import { ChatHistoryPreference, InstructionsPreference } from '../../types';
import { aiClient, userClient, MAX_CHAT_MESSAGES, CHAT_HISTORY_MESSAGES } from './utils';
import { NO_DISPLAY_NAME_PLACEHOLDER } from '../../types';
import { UserHistoryService } from '../../services';

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
    const [isNewChat, setIsNewChat] = useState<boolean>(true);
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

    // Modal for displaying error messages
    const errorModal = useModal();
    // Modal for displaying help information
    const helpModal = useModal();

    /**
     * Handles closing the error modal and clearing the error message.
     */
    const handleErrorModalClose = () => {
        errorModal.close();
        setErrorMessage('');
    };

    /**
     * Retrieves user prompt input and triggers the chat process.
     * Prevents new chat creation if one is already pending.
     * 
     * @param {string} returnPromptStr - The prompt text received from the input field
     */
    const getPrompt = (returnPromptStr: string) => {
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
                if (!user || !urlChatId) return;
                
                // Return early if the URL chat ID is the same as the current chat ID
                if (urlChatId === chatId) return;
                
                // Always reset selectedCardId when loading a new chat
                setSelectedCardId('');
                // Reset solutions when changing chats
                setPromptSolutions([]);

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
                    errorModal.open();
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

    const callServer = async (): Promise<void> => {
        setIsProcessing(true);
        setIsLoading(true);
        
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const currentDate = getCurrentDateString();
        const name = user?.displayName || NO_DISPLAY_NAME_PLACEHOLDER;
        const userMessage: ChatMessage = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            chatSource: userClient,
            chatMessage: promptValue
        };

        try {
            const requestData = prepareRequestData(
                name,
                currentDate,
                promptValue,
                chatHistory,
                creditCards,
                preferencesInstructions,
                user,
                userCardDetails
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
            setErrorMessage('Error processing request, please try again.');
            errorModal.open();
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
        navigate('/');
    };

    const handleHelpModalOpen = helpModal.open;
    const handleHelpModalClose = helpModal.close;

    return (
        <div className='prompt-window'>
            <div className="prompt-window-header">
                <button onClick={handleNewTransaction}>New Transaction Chat</button>
                <button onClick={handleHelpModalOpen}>Help</button>
            </div>
            
            <Modal isOpen={errorModal.isOpen} onClose={handleErrorModalClose}>
                <div className="error-content">
                    {errorMessage}
                </div>
            </Modal>

            <Modal isOpen={helpModal.isOpen} onClose={handleHelpModalClose}>
                <PromptHelpModal />
            </Modal>

            <PromptHistory chatHistory={chatHistory} />
            {isLoading && <div className="loading-indicator">...</div>}
            {isLoadingSolutions && <div className="loading-indicator">Looking for Card Recommendations...</div>}
            <PromptSolution 
                promptSolutions={promptSolutions} 
                creditCards={creditCards} 
                chatId={chatId}
                selectedCardId={selectedCardId}
                onHistoryUpdate={onHistoryUpdate}
            />
            <PromptField 
                returnPrompt={getPrompt} 
                isProcessing={isProcessing} 
                onCancel={handleCancel} 
            />
            {chatHistory.length >= MAX_CHAT_MESSAGES && (
                <div className="below-prompt-field-text">
                    Remember to <button onClick={handleNewTransaction} className="inline-button">create a new transaction chat</button> for best results.
                </div>
            )}
            {CHAT_HISTORY_MESSAGES[chatHistoryPreference] && (
                <div className="below-prompt-field-text">
                    {CHAT_HISTORY_MESSAGES[chatHistoryPreference]}
                </div>
            )}
        </div>
    );
}

export default PromptWindow;