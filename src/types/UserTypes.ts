import { Conversation } from "./ChatTypes";
import { ChatHistoryPreferenceType, SubscriptionPlanType } from "./Constants";

/**
 * ------------------------------------------------------------------------------------------------
 * 
 * SHARED API AND CLIENT TYPES
 * 
 * ------------------------------------------------------------------------------------------------
 */

export type SelectedCards = string[];

export interface UserPreferences {
    chatHistory?: ChatHistoryPreference;
    instructions?: InstructionsPreference;
    showCompletedOnly?: ShowCompletedOnlyPreference;
}

export type ChatHistoryPreference = ChatHistoryPreferenceType;
export type InstructionsPreference = string;
export type ShowCompletedOnlyPreference = boolean;

export type SubscriptionPlan = SubscriptionPlanType;

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

// Params types

/**
 * Interface for history API request parameters
 */
export interface HistoryParams {
    page: number;
    page_size: number;
    month?: string;
    year?: string;
    lastUpdate?: string;
    forceShowAll?: string;
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
    showCompletedOnly?: ShowCompletedOnlyPreference;
    error?: string;
}

export interface SubscriptionPlanResponse {
    success: boolean;
    subscriptionPlan: SubscriptionPlan;
    message?: string;
    error?: string;
}

/**
 * Interface for paginated history response
 */
export interface PagedHistoryResponse {
    hasUpdates: boolean;
    chatHistory: Conversation[];
    pagination: PaginationData;
    filters: {
        month: number | null;
        year: number | null;
    };
    restrictions: {
        message: string;
        upgrade_required: boolean;
    } | null;
}

// History Navigation Types

/**
 * Interface for pagination data returned from the API
 */
export interface PaginationData {
    total_items: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
}

/**
 * ------------------------------------------------------------------------------------------------
 * 
 * CLIENT TYPES
 * 
 * ------------------------------------------------------------------------------------------------
 */