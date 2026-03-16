import { ChatMessage } from '../../types/ChatTypes';
import { ChatComponentBlock } from '../../types/ChatComponentTypes';
import { CHAT_SOURCE, MAX_CHAT_MESSAGES, MAX_CHAT_THREAD_MESSAGES, CHAT_HISTORY_PREFERENCE, ChatHistoryPreferenceType, DEFAULT_CHAT_NAME_PLACEHOLDER } from '../../types';

// Constants
export const aiClient = CHAT_SOURCE.ASSISTANT;
export const userClient = CHAT_SOURCE.USER;
export { MAX_CHAT_MESSAGES, MAX_CHAT_THREAD_MESSAGES };
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
    timestamp: new Date().toISOString(),
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
 * Re-attach component blocks from the conversation-level array onto their
 * corresponding ChatMessage objects (matched by messageId).
 * Server stores componentBlocks separately; the client needs them on each message.
 */
export const attachComponentBlocks = (
    messages: ChatMessage[],
    componentBlocks?: ChatComponentBlock[]
): ChatMessage[] => {
    if (!componentBlocks || componentBlocks.length === 0) return messages;

    const blocksByMessageId = new Map<string, ChatComponentBlock>();
    for (const block of componentBlocks) {
        blocksByMessageId.set(block.messageId, block);
    }

    return messages.map(msg => {
        if (msg.componentBlock) return msg; // Already has one
        const block = blocksByMessageId.get(msg.id);
        if (block) {
            return { ...msg, componentBlock: block };
        }
        return msg;
    });
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

