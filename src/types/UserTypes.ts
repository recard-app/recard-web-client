import { Conversation } from "./ChatTypes";

export type SelectedCards = string[];

export interface UserPreferences {
    chatHistory?: ChatHistoryPreference;
    instructions?: InstructionsPreference;
}

export type ChatHistoryPreference = 'keep_history' | 'do_not_track_history';
export type InstructionsPreference = string;

export type SubscriptionPlan = 'free' | 'premium';

export type ChatHistory = Conversation[];

export type DefaultCard = string;

export type CardDetails = string;
export type CardDetailsList = CardDetails[];

export interface User {
    id: string;
    chatHistory?: ChatHistory;
    selectedCards?: SelectedCards;
    defaultCard?: DefaultCard;
    preferences?: UserPreferences;
    subscriptionPlan?: SubscriptionPlan;
    accountCreatedAt?: string;
    accountUpdatedAt?: string;
    lastLoginAt?: string;
    lastUpdatedAt?: string;
    updatedAt?: string;
}

// Response types

export type ProfileResponse = {
    preferencesInstructions: string;
    preferencesChatHistory: string;
    subscriptionPlan: SubscriptionPlan;
}

export interface StartDateResponse {
    firstEntryDate: string | null;
    message: string;
}

export interface PreferencesResponse {
    success: boolean;
    message?: string;
    data?: string;
    chatHistory?: ChatHistoryPreference;
    instructions?: InstructionsPreference;
    error?: string;
}