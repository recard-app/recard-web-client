import { UserCreditsTrackingPreferences } from "./CardCreditsTypes";
import { Conversation } from "./ChatTypes";
import { ChatHistoryPreferenceType, RoleType, SubscriptionPlanType } from "./Constants";

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
    selectedCards?: SelectedCards;
    defaultCard?: DefaultCard;
    preferencesInstructions?: string;
    preferencesChatHistory?: ChatHistoryPreference;
    preferencesShowCompletedOnly?: ShowCompletedOnlyPreference;
    subscriptionPlan: SubscriptionPlan;
    userCreditsTrackingPreferences: UserCreditsTrackingPreferences;
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
    forceShowAll?: string;
}

// Response types

export type ProfileResponse = {
    preferencesInstructions: string;
    preferencesChatHistory: string;
    preferencesShowCompletedOnly: boolean;
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
    showCompletedOnly?: ShowCompletedOnlyPreference;
    error?: string;
}

export interface BatchedPreferencesResponse {
    success: boolean;
    message?: string;
    error?: string;
    instructions: InstructionsPreference;
    chatHistory: ChatHistoryPreference;
    showCompletedOnly: ShowCompletedOnlyPreference;
}

export interface BatchedPreferencesRequest {
    instructions?: InstructionsPreference;
    chatHistory?: ChatHistoryPreference;
    showCompletedOnly?: ShowCompletedOnlyPreference;
}

export interface SubscriptionPlanResponse {
    success: boolean;
    subscriptionPlan: SubscriptionPlan;
    message?: string;
    error?: string;
}

/**
 * Lightweight conversation type for history list (excludes heavy conversation/solutions arrays)
 */
export type LightweightConversation = Pick<Conversation, 'chatId' | 'chatDescription' | 'timestamp' | 'cardSelection'>;

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