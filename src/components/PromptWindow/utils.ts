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
 * Prepares the data object for API requests.
 * Now simplified to only include essential fields as backend fetches all other data.
 *
 * @param {string} name - User's name or 'Guest'
 * @param {string} promptValue - Current prompt value
 * @param {ChatMessage[]} chatHistory - Current chat history
 * @returns {ChatRequestData} Formatted request data for API calls
 */
export const prepareRequestData = (
    name: string,
    promptValue: string,
    chatHistory: ChatMessage[]
): ChatRequestData => {
    return {
        name,
        prompt: promptValue,
        chatHistory: limitChatHistory(chatHistory)
    };
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
 * @param {ChatSolution} existingSolutions - Current solutions to preserve if new ones are empty
 * @returns {Promise<{updatedHistory: ChatMessage[], solutions: ChatSolution}>} Updated chat history and solutions
 */
export const processChatAndSolutions = async (
    requestData: ChatRequestData,
    userMessage: ChatMessage,
    signal: AbortSignal,
    chatHistory: ChatMessage[],
    setIsLoading: (loading: boolean) => void,
    setIsLoadingSolutions: (loading: boolean) => void,
    setChatHistory: (history: ChatMessage[]) => void,
    existingSolutions: ChatSolution,
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

    const newSolutions = await ChatService.getChatSolution({
        ...requestData,
        chatHistory: limitChatHistory(updatedHistory)
    }, signal);

    if (signal.aborted) throw new Error('Request aborted');
    
    // Always use new solutions when available. Only preserve existing solutions if:
    // 1. New solutions are empty/undefined/null
    // 2. We have valid existing solutions 
    // 3. This is a continuing conversation (has previous chat messages)
    const hasValidNewSolutions = Array.isArray(newSolutions) && newSolutions.length > 0;
    const hasValidExistingSolutions = Array.isArray(existingSolutions) && existingSolutions.length > 0;
    const isContinuingConversation = chatHistory.length > 0;
    
    const solutions = hasValidNewSolutions 
        ? newSolutions 
        : (hasValidExistingSolutions && isContinuingConversation ? existingSolutions : []);
    
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
            cardSelection: '',
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

        const existingChat = existingHistoryList.find(chat => chat.chatId === chatId);
        const updatedChat = {
            chatId: chatId,
            timestamp: new Date().toISOString(),
            conversation: updatedHistory,
            solutions: solutions,
            cardSelection: existingChat?.cardSelection || '',
            chatDescription: existingChat?.chatDescription || DEFAULT_CHAT_NAME
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
