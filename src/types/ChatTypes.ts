import { ChatSourceType } from './Constants';
import { CreditCard } from './CreditCardTypes';

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
}

export interface ChatRequestBody {
    name: string;
    prompt: string;
    chatHistory: ChatMessage[];
    creditCards: CreditCard[];
    currentDate: string;
    preferencesInstructions: string;
    userCardDetails: string[];
}

export interface OpenAIChatMessage {
    role: 'user' | 'assistant' | 'developer';
    content: string;
}

export interface OpenAIResponse {
    choices: {
        message: OpenAIChatMessage;
    }[];
}

export type ChatSolution = ChatSolutionCard[];

export interface ChatSolutionCard {
    id: string;
    cardName: string;
    rewardCategory?: string;
    rewardRate?: string;
}