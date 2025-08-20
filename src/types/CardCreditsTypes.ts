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