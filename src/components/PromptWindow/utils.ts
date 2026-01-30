import { ChatMessage, Conversation } from '../../types/ChatTypes';
import { ChatComponentBlock } from '../../types/ChatComponentTypes';
import { CHAT_SOURCE, MAX_CHAT_MESSAGES, CHAT_HISTORY_PREFERENCE, ChatHistoryPreferenceType, DEFAULT_CHAT_NAME_PLACEHOLDER } from '../../types';
import { UserHistoryService } from '../../services';

// Constants
export const aiClient = CHAT_SOURCE.ASSISTANT;
export const userClient = CHAT_SOURCE.USER;
export { MAX_CHAT_MESSAGES };
export const DEFAULT_CHAT_NAME = DEFAULT_CHAT_NAME_PLACEHOLDER;

export const CHAT_HISTORY_MESSAGES: Record<ChatHistoryPreferenceType, string> = {
    [CHAT_HISTORY_PREFERENCE.DO_NOT_TRACK_HISTORY]: 'Your chat history is not being stored. Messages will vanish when you leave or refresh the page.',
    [CHAT_HISTORY_PREFERENCE.KEEP_HISTORY]: ''
};

// ============================================
// NEW: Agent Chat Utilities
// ============================================

/**
 * Create a user message object
 */
export const createUserMessage = (content: string): ChatMessage => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    chatSource: CHAT_SOURCE.USER,
    chatMessage: content,
});

/**
 * Create an error message object (not persisted to database)
 */
export const createErrorMessage = (errorText: string): ChatMessage => ({
    id: `error-${Date.now()}`,
    chatSource: CHAT_SOURCE.ERROR,
    chatMessage: errorText,
    isError: true,
});

/**
 * Extract component blocks from messages for storage
 */
export const extractComponentBlocks = (messages: ChatMessage[]): ChatComponentBlock[] => {
    return messages
        .filter(msg => msg.componentBlock)
        .map(msg => msg.componentBlock!)
        .filter(Boolean);
};

/**
 * Handles the storage and updating of chat history.
 * Creates new chat sessions or updates existing ones based on user preferences.
 *
 * @param {ChatMessage[]} updatedHistory - The new chat history to store
 * @param {ChatComponentBlock[]} componentBlocks - The component blocks to store
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
    componentBlocks: ChatComponentBlock[],
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

    // Filter out error messages and failed user messages before saving
    const historyToSave = getSuccessfulMessages(updatedHistory);

    // Debug logging for chat history issues
    console.log('[handleHistoryStorage] Saving chat:', {
        isNewChat,
        updatedHistoryLength: updatedHistory.length,
        historyToSaveLength: historyToSave.length,
        messageSources: updatedHistory.map(m => m.chatSource),
        filteredSources: historyToSave.map(m => m.chatSource)
    });

    if (isNewChat) {
        const response = await UserHistoryService.createChatHistory(
            historyToSave,
            componentBlocks,
            signal
        );

        const newChat: Conversation = {
            chatId: response.chatId,
            timestamp: new Date().toISOString(),
            conversation: historyToSave,
            chatDescription: response.chatDescription || DEFAULT_CHAT_NAME,
            componentBlocks: componentBlocks
        };
        onHistoryUpdate(newChat);

        setChatId(response.chatId);
        returnCurrentChatId(response.chatId);

        setIsNewChat(false);
        setIsNewChatPending(false);
    } else {
        await UserHistoryService.updateChatHistory(
            chatId,
            historyToSave,
            componentBlocks,
            signal
        );

        const existingChat = existingHistoryList.find(chat => chat.chatId === chatId);
        const updatedChat: Conversation = {
            chatId: chatId,
            timestamp: new Date().toISOString(),
            conversation: historyToSave,
            chatDescription: existingChat?.chatDescription || DEFAULT_CHAT_NAME,
            componentBlocks: componentBlocks
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
 * Filters chat history to only include successful exchanges.
 * Removes error messages and user messages that didn't get a successful assistant response.
 * This ensures only successful user+assistant pairs are saved to the database.
 *
 * @param {ChatMessage[]} history - The full chat history including errors
 * @returns {ChatMessage[]} Filtered chat history with only successful exchanges
 */
export const getSuccessfulMessages = (history: ChatMessage[]): ChatMessage[] => {
    const result: ChatMessage[] = [];

    for (let i = 0; i < history.length; i++) {
        const msg = history[i];

        // Skip error messages entirely
        if (msg.chatSource === CHAT_SOURCE.ERROR || msg.isError) continue;

        // For user messages, only include if followed by assistant response (not error)
        if (msg.chatSource === CHAT_SOURCE.USER) {
            const nextMsg = history[i + 1];
            if (nextMsg && nextMsg.chatSource === CHAT_SOURCE.ASSISTANT) {
                result.push(msg);
            }
            // Skip user messages followed by error or nothing
            continue;
        }

        // Include assistant messages (they only exist for successful responses)
        if (msg.chatSource === CHAT_SOURCE.ASSISTANT) {
            result.push(msg);
        }
    }

    return result;
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
