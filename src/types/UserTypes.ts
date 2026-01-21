import { UserComponentTrackingPreferences } from "./CardCreditsTypes";
import { Conversation } from "./ChatTypes";
import { ChatHistoryPreferenceType, RoleType, SubscriptionPlanType } from "./Constants";

/**
 * ------------------------------------------------------------------------------------------------
 *
 * SHARED API AND CLIENT TYPES
 *
 * ------------------------------------------------------------------------------------------------
 */

/**
 * Represents a user's credit card in their subcollection
 * Path: users/{userId}/credit_cards/{cardReferenceId}
 */
export interface UserCreditCard {
    cardReferenceId: string;  // Credit card ID (also the doc ID)
    openDate: string | null;  // MM/DD/YYYY format or null
    isDefault: boolean;       // Whether this is the default card
    isFrozen: boolean;        // For future LLM exclusion
}

export interface UserPreferences {
    chatHistory?: ChatHistoryPreference;
    instructions?: InstructionsPreference;
}

export type ChatHistoryPreference = ChatHistoryPreferenceType;
export type InstructionsPreference = string;

export type SubscriptionPlan = SubscriptionPlanType;

export type ChatHistory = Conversation[];

export type CardDetails = string;
export type CardDetailsList = CardDetails[];

export interface User {
    id: string;
    preferencesInstructions?: string;
    preferencesChatHistory?: ChatHistoryPreference;
    subscriptionPlan: SubscriptionPlan;
    userComponentTrackingPreferences: UserComponentTrackingPreferences;
    userWalletHistory: UserWalletHistory;
    role: RoleType;
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
}

// Response types

export type ProfileResponse = {
    preferencesInstructions: string;
    preferencesChatHistory: string;
    subscriptionPlan: SubscriptionPlan;
    role: RoleType;
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

export interface BatchedPreferencesResponse {
    success: boolean;
    message?: string;
    error?: string;
    instructions: InstructionsPreference;
    chatHistory: ChatHistoryPreference;
}

export interface BatchedPreferencesRequest {
    instructions?: InstructionsPreference;
    chatHistory?: ChatHistoryPreference;
}

export interface SubscriptionPlanResponse {
    success: boolean;
    subscriptionPlan: SubscriptionPlan;
    message?: string;
    error?: string;
}

/**
 * Lightweight conversation type for history list (excludes heavy conversation arrays)
 */
export type LightweightConversation = Pick<Conversation, 'chatId' | 'chatDescription' | 'timestamp'>;

/**
 * Interface for paginated history response
 */
export interface PagedHistoryResponse {
    hasUpdates: boolean;
    chatHistory: LightweightConversation[];
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
 * Represents the history of wallet events for a user
 */
export interface UserWalletHistory {
    events: UserWalletEvent[];
  }
  
  /**
   * Represents a wallet event for a user
   */
  export interface UserWalletEvent {
    cardId: string;
    month: string;
    year: string;
    action: string;
  }
  
  /**
   * Represents the type of wallet event
   */
  export const WALLET_EVENT_TYPE = {
    ADD: 'add',
    REMOVE: 'remove'
  } as const;
  export type WalletEventType = typeof WALLET_EVENT_TYPE[keyof typeof WALLET_EVENT_TYPE];

/**
 * ------------------------------------------------------------------------------------------------
 * 
 * CLIENT TYPES
 * 
 * ------------------------------------------------------------------------------------------------
 */