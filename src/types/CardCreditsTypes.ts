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
    INACTIVE: 'inactive'
} as const;
export type CreditUsageType = typeof CREDIT_USAGE[keyof typeof CREDIT_USAGE];

/**
 * Represents the different credit usage types
 */
export const CREDIT_USAGE_DISPLAY_NAMES = {
    USED: 'Redeemed',
    NOT_USED: 'Not Used',
    PARTIALLY_USED: 'Partially Used',
    INACTIVE: 'Not Tracked'
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
 * CLIENT-SPECIFIC TYPES
 * 
 * ------------------------------------------------------------------------------------------------
 */

/**
 * Represents the different credit usage display colors
 */
export const CREDIT_USAGE_DISPLAY_COLORS = {
    USED: '#007B53',
    NOT_USED: '#0B0D0F',
    PARTIALLY_USED: '#005DCF',
    INACTIVE: '#B5BBC2'
} as const;
export type CreditUsageDisplayColorType = typeof CREDIT_USAGE_DISPLAY_COLORS[keyof typeof CREDIT_USAGE_DISPLAY_COLORS];

/**
 * Represents the different credit tracking preferences. This is correlated to the active/inactive status of the credit.
 */
export const CREDIT_HIDE_PREFERENCE_DISPLAY_NAMES = {
    HIDE: 'Hide Credit',
    DO_NOT_HIDE: 'Show on Credits Page'
} as const;
export type CreditHidePreferenceDisplayNameType = typeof CREDIT_HIDE_PREFERENCE_DISPLAY_NAMES[keyof typeof CREDIT_HIDE_PREFERENCE_DISPLAY_NAMES];