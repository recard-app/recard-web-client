import { ChatSourceType } from './Constants';
import { ChatComponentBlock } from './ChatComponentTypes';

/**
 * ------------------------------------------------------------------------------------------------
 *
 * SHARED API AND CLIENT TYPES
 *
 * ------------------------------------------------------------------------------------------------
 */

export interface ChatMessage {
    id: string;
    chatSource: ChatSourceType;
    chatMessage: string;
    isError?: boolean;  // Flag to identify error messages (not saved to database)
    componentBlock?: ChatComponentBlock;  // Agent response component block (cards, credits, perks, multipliers)
    timestamp?: string;  // Message timestamp (ISO format)
}

export interface Conversation {
    chatId: string;
    chatDescription: string;
    timestamp: string;
    conversation: ChatMessage[];
    componentBlocks?: ChatComponentBlock[];  // Agent component blocks
}

/**
 * ------------------------------------------------------------------------------------------------
 *
 * CLIENT TYPES
 *
 * ------------------------------------------------------------------------------------------------
 */
