import React from 'react';
import { ChatMessage, ChatSolution, ChatRequestData, Conversation } from '../../types/ChatTypes';
import { InstructionsPreference } from '../../types/UserTypes';
import { CreditCard } from '../../types/CreditCardTypes';
import { CHAT_SOURCE, RECOMMENDED_MAX_CHAT_MESSAGES, CHAT_HISTORY_PREFERENCE, ChatHistoryPreferenceType, DEFAULT_CHAT_NAME_PLACEHOLDER } from '../../types';
import { UserHistoryService, ChatService } from '../../services';

// Constants
export const aiClient = CHAT_SOURCE.ASSISTANT;
export const userClient = CHAT_SOURCE.USER;
export const MAX_CHAT_MESSAGES = RECOMMENDED_MAX_CHAT_MESSAGES;
export const DEFAULT_CHAT_NAME = DEFAULT_CHAT_NAME_PLACEHOLDER;

export const CHAT_HISTORY_MESSAGES: Record<ChatHistoryPreferenceType, string> = {
    [CHAT_HISTORY_PREFERENCE.DO_NOT_TRACK_HISTORY]: 'Your chat history is not being stored. Messages will vanish when you leave or refresh the page.',
    [CHAT_HISTORY_PREFERENCE.KEEP_HISTORY]: ''
};

/**
 * Handles closing the error modal and clearing the error message.
 * 
 * @param {Object} errorModal - The error modal object with close method
 * @param {Function} setErrorMessage - Function to set the error message state
 */
export const handleErrorModalClose = (
    errorModal: { close: () => void },
    setErrorMessage: (message: string) => void
) => {
    errorModal.close();
    setErrorMessage('');
};

/**
 * Retrieves user prompt input and triggers the chat process.
 * Prevents new chat creation if one is already pending.
 * 
 * @param {string} returnPrompt - The prompt text received from the input field
 * @param {boolean} isNewChat - Whether this is a new chat session
 * @param {boolean} isNewChatPending - Whether a new chat creation is pending
 * @param {Function} setPromptValue - Function to set the prompt value state
 * @param {Function} setTriggerCall - Function to increment the trigger call counter
 */
export const getPrompt = (
    returnPrompt: string,
    isNewChat: boolean,
    isNewChatPending: boolean,
    setPromptValue: (value: string) => void,
    setTriggerCall: React.Dispatch<React.SetStateAction<number>>
) => {
    if (isNewChat && isNewChatPending) {
        console.log('New chat creation in progress, please wait...');
        return;
    }
    setPromptValue(returnPrompt);
    setTriggerCall(prev => prev + 1);
};

/**
 * Adds a new message to the chat history with a unique ID.
 * Limits the chat history to the maximum allowed messages.
 * 
 * @param {typeof userClient | typeof aiClient} source - The source of the message (user or AI)
 * @param {string} message - The message content to add
 * @param {Function} setChatHistory - Function to update the chat history state
 */
export const addChatHistory = (
    source: typeof userClient | typeof aiClient,
    message: string,
    setChatHistory: (callback: (prev: ChatMessage[]) => ChatMessage[]) => void
): void => {
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
 * @param {Function} setChatHistory - Function to update chat history state
 * @param {Function} setPromptSolutions - Function to update prompt solutions state
 * @param {Function} setChatId - Function to update chat ID state
 * @param {Function} setIsNewChat - Function to update new chat state
 * @param {Function} returnCurrentChatId - Callback to return current chat ID
 */
export const setExistingChatStates = (
    conversation: ChatMessage[],
    solutions: ChatSolution,
    newChatId: string,
    setChatHistory: (history: ChatMessage[]) => void,
    setPromptSolutions: (solutions: ChatSolution) => void,
    setChatId: (id: string) => void,
    setIsNewChat: (isNew: boolean) => void,
    returnCurrentChatId: (id: string) => void
): void => {
    setChatHistory(limitChatHistory(conversation));
    setPromptSolutions(solutions);
    setChatId(newChatId);
    setIsNewChat(false);
    returnCurrentChatId(newChatId);
};

/**
 * Loads chat history when accessing an existing chat.
 * Handles loading from existing history list (in-memory) or fetching from API.
 * 
 * @param {any} user - Current user object
 * @param {string} urlChatId - Chat ID from URL parameters
 * @param {string} chatId - Current chat ID
 * @param {Conversation[]} existingHistoryList - List of existing chat histories
 * @param {Function} setExistingChatStatesCallback - Callback to set chat states
 * @param {Function} setErrorMessage - Function to set error message state
 * @param {Object} errorModal - Error modal object with open method
 */
export const loadChatHistory = async (
    user: any,
    urlChatId: string | undefined,
    chatId: string,
    existingHistoryList: Conversation[],
    setExistingChatStatesCallback: (
        conversation: ChatMessage[],
        solutions: ChatSolution,
        newChatId: string
    ) => void,
    setErrorMessage: (message: string) => void,
    errorModal: { open: () => void }
) => {
    if (!user || !urlChatId || urlChatId === chatId) return;

    const existingChat = existingHistoryList.find(chat => chat.chatId === urlChatId);
    
    if (existingChat) {
        setExistingChatStatesCallback(existingChat.conversation, existingChat.solutions, urlChatId);
        return;
    }

    try {
        const response = await UserHistoryService.fetchChatHistoryById(urlChatId);
        setExistingChatStatesCallback(response.conversation, response.solutions, urlChatId);
    } catch (error) {
        console.error('Error loading chat:', error);
        setErrorMessage('Error loading chat history');
        errorModal.open();
    }
};

/**
 * Prepares the data object for API requests.
 * Includes chat history, selected credit cards, and user preferences.
 * 
 * @param {string} name - User's name or 'Guest'
 * @param {string} currentDate - Current timestamp string
 * @param {string} promptValue - Current prompt value
 * @param {ChatMessage[]} chatHistory - Current chat history
 * @param {CreditCard[]} creditCards - Available credit cards
 * @param {InstructionsPreference} preferencesInstructions - User preferences
 * @param {any} user - Current user object
 * @param {string[]} userCardDetails - User's card details
 * @returns {ChatRequestData} Formatted request data for API calls
 */
export const prepareRequestData = (
    name: string,
    currentDate: string,
    promptValue: string,
    chatHistory: ChatMessage[],
    creditCards: CreditCard[],
    preferencesInstructions: InstructionsPreference,
    user: any,
    userCardDetails: string[]
): ChatRequestData => {
    const selectedCreditCards = creditCards.filter(card => card.selected);
    const requestData: ChatRequestData = {
        name,
        prompt: promptValue,
        chatHistory: limitChatHistory(chatHistory),
        creditCards: selectedCreditCards,
        currentDate,
        preferencesInstructions
    };

    if (user && userCardDetails?.length > 0) {
        requestData.userCardDetails = userCardDetails;
    }

    return requestData;
};

/**
 * Processes the chat interaction and generates solutions.
 * Handles both AI response generation and card recommendations.
 * 
 * @param {ChatRequestData} requestData - Data for the API request
 * @param {ChatMessage} userMessage - The user's message
 * @param {AbortSignal} signal - Signal for request cancellation
 * @param {ChatMessage[]} chatHistory - Current chat history
 * @param {Function} setIsLoading - Function to update loading state
 * @param {Function} setIsLoadingSolutions - Function to update solutions loading state
 * @param {Function} setChatHistory - Function to update chat history state
 * @returns {Promise<{updatedHistory: ChatMessage[], solutions: ChatSolution}>} Updated chat history and solutions
 */
export const processChatAndSolutions = async (
    requestData: ChatRequestData,
    userMessage: ChatMessage,
    signal: AbortSignal,
    chatHistory: ChatMessage[],
    setIsLoading: (loading: boolean) => void,
    setIsLoadingSolutions: (loading: boolean) => void,
    setChatHistory: (history: ChatMessage[]) => void
): Promise<{ updatedHistory: ChatMessage[], solutions: ChatSolution }> => {
    const aiResponse = await ChatService.getChatResponse(requestData, signal);
    const updatedHistory = [...chatHistory, userMessage, {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        chatSource: aiClient,
        chatMessage: aiResponse
    }];
    
    setIsLoading(false);
    setIsLoadingSolutions(true);

    setChatHistory(limitChatHistory(updatedHistory));

    const solutions = await ChatService.getChatSolution({
        ...requestData,
        chatHistory: limitChatHistory(updatedHistory)
    }, signal);

    if (signal.aborted) throw new Error('Request aborted');
    
    return { updatedHistory, solutions };
};

/**
 * Handles the storage and updating of chat history.
 * Creates new chat sessions or updates existing ones based on user preferences.
 * 
 * @param {ChatMessage[]} updatedHistory - The new chat history to store
 * @param {ChatSolution} solutions - The generated solutions
 * @param {AbortSignal} signal - Signal for request cancellation
 * @param {any} user - Current user object
 * @param {string} chatHistoryPreference - User's chat history preference
 * @param {boolean} isNewChat - Whether this is a new chat session
 * @param {string} chatId - Current chat ID
 * @param {Conversation[]} existingHistoryList - List of existing chat histories
 * @param {Function} setIsNewChatPending - Function to update new chat pending state
 * @param {Function} onHistoryUpdate - Callback for history updates
 * @param {Function} setChatId - Function to update chat ID state
 * @param {Function} returnCurrentChatId - Callback to return current chat ID
 * @param {Function} setIsNewChat - Function to update new chat state
 */
export const handleHistoryStorage = async (
    updatedHistory: ChatMessage[],
    solutions: ChatSolution,
    signal: AbortSignal,
    user: any,
    chatHistoryPreference: string,
    isNewChat: boolean,
    chatId: string,
    existingHistoryList: Conversation[],
    setIsNewChatPending: (pending: boolean) => void,
    onHistoryUpdate: (chat: Conversation) => void,
    setChatId: (id: string) => void,
    returnCurrentChatId: (id: string) => void,
    setIsNewChat: (isNew: boolean) => void
): Promise<void> => {
    if (!user || chatHistoryPreference === CHAT_HISTORY_PREFERENCE.DO_NOT_TRACK_HISTORY) {
        setIsNewChatPending(false);
        return;
    }

    if (isNewChat) {
        const response = await UserHistoryService.createChatHistory(
            updatedHistory,
            solutions,
            signal
        );

        const newChat = {
            chatId: response.chatId,
            timestamp: new Date().toISOString(),
            conversation: updatedHistory,
            solutions: solutions,
            chatDescription: response.chatDescription || DEFAULT_CHAT_NAME
        };
        onHistoryUpdate(newChat);

        setChatId(response.chatId);
        returnCurrentChatId(response.chatId);

        setIsNewChat(false);
        setIsNewChatPending(false);
    } else {
        await UserHistoryService.updateChatHistory(
            chatId,
            updatedHistory,
            solutions,
            signal
        );

        const updatedChat = {
            chatId: chatId,
            timestamp: new Date().toISOString(),
            conversation: updatedHistory,
            solutions: solutions,
            chatDescription: existingHistoryList.find(chat => chat.chatId === chatId)?.chatDescription || DEFAULT_CHAT_NAME
        };
        onHistoryUpdate(updatedChat);
    }
};

/**
 * Limits the chat history to the maximum allowed messages.
 * 
 * @param {ChatMessage[]} chatHistory - The chat history to limit
 * @returns {ChatMessage[]} Limited chat history array
 */
export const limitChatHistory = (chatHistory: ChatMessage[]): ChatMessage[] => {
    return Array.isArray(chatHistory) ? chatHistory.slice(-MAX_CHAT_MESSAGES) : [];
};

/**
 * Generates a formatted current date string.
 * Format: YYYY-MM-DD HH:mm:ss
 * 
 * @returns {string} Formatted current date and time
 */
export const getCurrentDateString = (): string => {
    const now = new Date();
  
    // Format the date components
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
  
    // Format the time components
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    // Combine into a single string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
