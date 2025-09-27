/**
 * ------------------------------------------------------------------------------------------------
 * 
 * SHARED API AND CLIENT TYPES
 * 
 * ------------------------------------------------------------------------------------------------
 */

/**
 * Represents the different credit periods
 */
export const CREDIT_PERIODS = {
    Monthly: 'monthly',
    Quarterly: 'quarterly',
    Semiannually: 'semiannually',
    Annually: 'annually'
} as const;
export type CreditPeriodType = typeof CREDIT_PERIODS[keyof typeof CREDIT_PERIODS];

/**
 * Represents the different credit intervals
 */
export const CREDIT_INTERVALS = {
    Monthly: 12,
    Quarterly: 4,
    Semiannually: 2,
    Annually: 1
} as const;
export type CreditIntervalType = typeof CREDIT_INTERVALS[keyof typeof CREDIT_INTERVALS];

/**
 * Represents the different credit usage types
 */
export const CREDIT_USAGE = {
    USED: 'used',
    NOT_USED: 'not_used',
    PARTIALLY_USED: 'partially_used',
    INACTIVE: 'inactive',
    FUTURE: 'future',
    DISABLED: 'disabled'
} as const;
export type CreditUsageType = typeof CREDIT_USAGE[keyof typeof CREDIT_USAGE];

/**
 * Represents the different credit usage types
 */
export const CREDIT_USAGE_DISPLAY_NAMES = {
    USED: 'Redeemed',
    NOT_USED: 'Not Used',
    PARTIALLY_USED: 'Partially Used',
    INACTIVE: 'Not Tracked',
    FUTURE: 'Future',
    DISABLED: 'Disabled'
} as const;
export type CreditUsageDisplayNameType = typeof CREDIT_USAGE_DISPLAY_NAMES[keyof typeof CREDIT_USAGE_DISPLAY_NAMES];

/**
 * Represents the credit history for a user
 */
export interface CreditHistory {
    UserId: string;
    Credits: CalendarUserCredits[];
}

/**
 * Represents the credit history for a user for a given year
 */
export interface CalendarUserCredits {
    Credits: UserCredit[];
    Year: number;
}

/**
 * Represents the credit history for a user for a given credit
 */
export interface UserCredit {
    CardId: string;
    CreditId: string;
    History: SingleCreditHistory[];
    AssociatedPeriod: CreditPeriodType;
    ActiveMonths?: number[]; // Array of month numbers (1-12) where this credit is active
}

/**
 * Represents the credit history for a user for a given credit with expiring flag
 */
export interface UserCreditWithExpiration extends UserCredit {
    isExpiring: boolean; // True if the credit is close to expiring based on period type
    daysUntilExpiration?: number; // Number of days until the credit expires (only present when includeExpiring is true)
}

/**
 * Represents the credit history for a user for a given credit for a given period
 */
export interface SingleCreditHistory {
    PeriodNumber: number;
    CreditUsage: CreditUsageType;
    ValueUsed: number;
}

/**
 * Represents the different credit tracking preferences. This is correlated to the active/inactive status of the credit.
 */
export const CREDIT_HIDE_PREFERENCE = {
    HIDE_ALL: 'hide',
    DO_NOT_HIDE: 'do_not_hide'
} as const;
export type CreditHidePreferenceType = typeof CREDIT_HIDE_PREFERENCE[keyof typeof CREDIT_HIDE_PREFERENCE];

/**
 * Represents the credit tracking preferences for a user
 */
export interface UserCreditsTrackingPreferences {
    Cards: CardTrackingPreference[];
}

/**
 * Represents the credit tracking preferences for a card
 */
export interface CardTrackingPreference {
    CardId: string;
    Credits: CreditTrackingPreference[];
}

/**
 * Represents the credit tracking preferences for a credit
 */
export interface CreditTrackingPreference {
    CreditId: string;
    HidePreference: CreditHidePreferenceType;
}

/**
 * ------------------------------------------------------------------------------------------------
 *
 * CREDIT HISTORY API TYPES (Request/Response)
 *
 * ------------------------------------------------------------------------------------------------
 */

/**
 * Get Full Credit History API
 * GET /users/cards/credits
 */
export interface GetFullCreditHistoryResponse extends CreditHistory {}

/**
 * Delete Credit History API
 * DELETE /users/cards/credits
 */
export interface DeleteCreditHistoryResponse {
    success: boolean;
}

/**
 * Get Credits for Date Range API
 * GET /users/cards/credits/range
 */
export interface GetCreditsByDateRangeParams {
    start: string; // YYYY-MM format
    end?: string; // YYYY-MM format (optional, defaults to start month)
    cardIds?: string[]; // Optional array of card IDs to filter by
    excludeHidden?: boolean; // Optional flag to exclude hidden credits
}

export interface GetCreditsByDateRangeResponse extends CalendarUserCredits {}

/**
 * Get Credits for Month API
 * GET /users/cards/credits/month/{year}/{month}
 */
export interface GetCreditsForMonthParams {
    year: string;
    month: string; // 1-12
    cardIds?: string[]; // Optional array of card IDs to filter by
    excludeHidden?: boolean; // Optional flag to exclude hidden credits
}

export interface GetCreditsForMonthResponse extends CalendarUserCredits {}

/**
 * Get Credit Details API
 * GET /users/cards/credits/details/{cardId}/{creditId}/{year}
 */
export interface GetCreditDetailsParams {
    cardId: string;
    creditId: string;
    year: string;
    excludeHidden?: boolean; // Optional flag to exclude hidden credits
}

export interface GetCreditDetailsResponse {
    credit: any;
    cardDetails: any;
    yearContext: {
        totalCredits: number;
        yearData: CalendarUserCredits;
    };
}

/**
 * Get Credits for Year API
 * GET /users/cards/credits/year/{year}
 */
export interface GetCreditsForYearParams {
    year: string;
    cardIds?: string[]; // Optional array of card IDs to filter by
    excludeHidden?: boolean; // Optional flag to exclude hidden credits
    includeExpiring?: boolean; // Optional flag to include isExpiring field and daysUntilExpiration
}

export interface GetCreditsForYearResponse {
    Credits: UserCredit[] | UserCreditWithExpiration[]; // Can include expiration data when includeExpiring=true
    Year: number;
}

/**
 * Update Credit Entry API
 * PUT /users/cards/credits/history
 */
export interface UpdateCreditEntryRequest {
    cardId: string;
    creditId: string;
    periodNumber: number;
    creditUsage?: CreditUsageType;
    valueUsed?: number;
}

export interface UpdateCreditEntryResponse extends CreditHistory {}

/**
 * Sync Current Year Credits API
 * POST /users/cards/credits/sync
 */
export interface SyncCurrentYearCreditsParams {
    year?: number; // Optional year to sync (defaults to current year)
    excludeHidden?: boolean; // Optional flag to exclude hidden credits
}

export interface SyncCurrentYearCreditsResponse extends CalendarUserCredits {}

/**
 * Get Credit Tracking Preferences API
 * GET /users/cards/credits/preferences
 */
export interface GetCreditTrackingPreferencesResponse extends UserCreditsTrackingPreferences {}

/**
 * Update Credit Hide Preference API
 * PUT /users/cards/credits/preferences
 */
export interface UpdateCreditHidePreferenceRequest {
    cardId: string;
    creditId: string;
    hidePreference: CreditHidePreferenceType;
}

export interface UpdateCreditHidePreferenceResponse extends UserCreditsTrackingPreferences {}

/**
 * Get Card Credits API
 * GET /users/cards/credits/cards
 */
export interface GetCardCreditsParams {
    cardIds?: string; // Optional comma-separated string of card IDs
}

export type GetCardCreditsResponse = CardCredit[];


/**
 * Card Credit interface for the /cards endpoint
 */
export interface CardCredit {
    CardId: string;
    Credits: any[]; // Credit definitions from the card
}

/**
 * Prioritized Credits List API
 * GET /users/cards/credits/prioritized-list
 */
export interface PrioritizedCredit {
    id: string;
    name: string;
    cardName: string;
    cardId: string;
    totalAmount: number;
    usedAmount: number;
    unusedAmount: number;
    daysUntilExpiration: number;
    expirationDate: string;
    period: CreditPeriodType;
    isExpiring: boolean;
    usageStatus: 'unused' | 'partially_used' | 'redeemed' | 'not_tracked';
    priority: {
        expiration: number;
        unusedAmount: number;
        period: number;
        usageStatus: number;
        alphabetical: string;
    };
    // Required for frontend interactive features
    History: SingleCreditHistory[];
    // Compatibility aliases for existing frontend components
    CardId: string;
    CreditId: string;
    AssociatedPeriod: CreditPeriodType;
}

export interface GetPrioritizedCreditsListParams {
    limit?: number; // Optional limit (default 20, max 100 for full list)
    year?: number; // Optional year (defaults to current year)
    cardId?: string; // Optional card ID filter
    period?: CreditPeriodType; // Optional period filter (monthly, quarterly, etc.)
    onlyExpiring?: boolean; // Optional flag to only include credits where isExpiring=true
    excludeHidden?: boolean; // Optional flag to exclude credits marked as hidden in user preferences
    showRedeemed?: boolean; // Optional flag to show redeemed/fully used credits (default false)
}

export interface GetPrioritizedCreditsListResponse {
    credits: PrioritizedCredit[];
    totalCount: number;
    lastUpdated: string;
}

export interface MonthlyStatsResponse {
    MonthlyCredits: {
        usedValue: number;
        possibleValue: number;
        usedCount: number;
        partiallyUsedCount: number;
        unusedCount: number;
    };
    CurrentCredits: {
        usedValue: number;
        possibleValue: number;
        usedCount: number;
        partiallyUsedCount: number;
        unusedCount: number;
    };
    AllCredits: {
        usedValue: number;
        possibleValue: number;
        usedCount: number;
        partiallyUsedCount: number;
        unusedCount: number;
    };
    ExpiringCredits: {
        Monthly: { count: number; unusedValue: number; };
        Quarterly: { count: number; unusedValue: number; };
        Semiannually: { count: number; unusedValue: number; };
        Annually: { count: number; unusedValue: number; };
        Total: { count: number; unusedValue: number; };
    };
}

/**
 * Monthly Summary API (combines monthly-stats and prioritized-list)
 * GET /users/cards/credits/monthly-summary
 */
export interface GetMonthlySummaryParams {
    includeHidden?: boolean; // Optional flag to include hidden credits (default false)
    limit?: number; // Optional limit for prioritized credits (default 20, max 100)
    year?: number; // Optional year (defaults to current year)
    cardId?: string; // Optional card ID filter for prioritized credits
    period?: CreditPeriodType; // Optional period filter for prioritized credits
    onlyExpiring?: boolean; // Optional flag to only include expiring credits in prioritized list
    showRedeemed?: boolean; // Optional flag to show redeemed credits in prioritized list
    showUntracked?: boolean; // Optional flag to show untracked credits in prioritized list
}

export interface MonthlySummaryResponse extends MonthlyStatsResponse {
    PrioritizedCredits: GetPrioritizedCreditsListResponse;
}

/**
 * ------------------------------------------------------------------------------------------------
 *
 * CLIENT-SPECIFIC TYPES
 *
 * ------------------------------------------------------------------------------------------------
 */

import { COLORS } from './Colors';

/**
 * Represents the different credit usage display colors
 */
export const CREDIT_USAGE_DISPLAY_COLORS = {
    USED: COLORS.PRIMARY_MEDIUM,
    NOT_USED: COLORS.NEUTRAL_BLACK,
    PARTIALLY_USED: COLORS.ACCENT_MEDIUM,
    INACTIVE: COLORS.NEUTRAL_MEDIUM_GRAY,
    FUTURE: COLORS.NEUTRAL_MEDIUM_GRAY,
    DISABLED: COLORS.DISABLED_GRAY
} as const;
export type CreditUsageDisplayColorType = typeof CREDIT_USAGE_DISPLAY_COLORS[keyof typeof CREDIT_USAGE_DISPLAY_COLORS];

/**
 * Represents the different credit usage icon names
 */
export const CREDIT_USAGE_ICON_NAMES = {
    USED: 'used-icon',
    NOT_USED: 'not-used-icon',
    PARTIALLY_USED: 'partially-used-icon',
    INACTIVE: 'inactive',
    FUTURE: 'future-icon',
    DISABLED: 'disabled'
} as const;
export type CreditUsageIconNameType = typeof CREDIT_USAGE_ICON_NAMES[keyof typeof CREDIT_USAGE_ICON_NAMES];

/**
 * Represents the different credit tracking preferences. This is correlated to the active/inactive status of the credit.
 */
export const CREDIT_HIDE_PREFERENCE_DISPLAY_NAMES = {
    HIDE: 'Hide Credit',
    DO_NOT_HIDE: 'Show on Credits Page'
} as const;
export type CreditHidePreferenceDisplayNameType = typeof CREDIT_HIDE_PREFERENCE_DISPLAY_NAMES[keyof typeof CREDIT_HIDE_PREFERENCE_DISPLAY_NAMES];