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
    solutions: ChatSolution;
    cardSelection: ChatSolutionSelectedCardId;
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
 * ------------------------------------------------------------------------------------------------
 * 
 * CLIENT TYPES
 * 
 * ------------------------------------------------------------------------------------------------
 */