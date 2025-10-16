import { ChatSourceType } from './Constants';

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
}

export interface Conversation {
    chatId: string;
    chatDescription: string;
    timestamp: string;
    conversation: ChatMessage[];
    cardSelection: ChatSolutionSelectedCardId;
    contentBlocks?: MessageContentBlock[];
}

export interface ChatRequestData {
    name: string;
    prompt: string;
    chatHistory: ChatMessage[];
}

export interface OpenAIChatMessage {
    role: ChatSourceType;
    content: string;
}

export interface OpenAIResponse {
    choices: {
        message: OpenAIChatMessage;
    }[];
}

export type ChatSolution = ChatSolutionCard[];
export type ChatSolutionSelectedCardId = string;

export interface ChatSolutionCard {
    id: string;
    cardName: string;
    rewardCategory?: string;
    rewardRate?: string;
}

/**
 * Content block that can be displayed inline after messages
 * Supports multiple content types: solutions, credits, and card details
 */
export interface MessageContentBlock {
    id: string;
    messageId: string;
    contentType: 'solutions' | 'credits' | 'card';
    timestamp: string;
    order?: number;
    content: SolutionContent | CreditContent | CardContent;
}

/**
 * Solution content block - displays card recommendations
 */
export interface SolutionContent {
    type: 'solutions';
    solutions: ChatSolution;
    selectedCardId: string;
}

/**
 * Credit content block - displays credit usage information
 * Structure is prepared for future implementation
 */
export interface CreditContent {
    type: 'credits';
    creditData: {
        usedValue: number;
        totalValue: number;
        period: 'monthly' | 'annual';
        credits: Array<{
            id: string;
            title: string;
            value: number;
            used: boolean;
        }>;
    };
}

/**
 * Card content block - displays single card details
 * Structure is prepared for future implementation
 */
export interface CardContent {
    type: 'card';
    cardId: string;
}

/**
 * ------------------------------------------------------------------------------------------------
 *
 * CLIENT TYPES
 *
 * ------------------------------------------------------------------------------------------------
 */