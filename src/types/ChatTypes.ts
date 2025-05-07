import { ChatSourceType } from './Constants';
import { CreditCard } from './CreditCardTypes';
import { CardDetailsList, InstructionsPreference } from './UserTypes';

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
    preferencesInstructions: InstructionsPreference;
    userCardDetails: CardDetailsList;
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

export interface ChatSolutionCard {
    id: string;
    cardName: string;
    rewardCategory?: string;
    rewardRate?: string;
}

export interface ChatRequestData {
    name: string;
    prompt: string;
    chatHistory: ChatMessage[];
    creditCards: CreditCard[];
    currentDate: string;
    preferencesInstructions: InstructionsPreference;
    userCardDetails?: CardDetailsList;
}