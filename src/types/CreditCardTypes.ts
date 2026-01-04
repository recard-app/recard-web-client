/**
 * ------------------------------------------------------------------------------------------------
 * 
 * SHARED API AND CLIENT TYPES
 * 
 * ------------------------------------------------------------------------------------------------
 */

/**
 * Represents a credit card in the system for display purposes.
 */
export interface CreditCard {
    id: string;
    CardName: string;
    CardIssuer: string;
    CardNetwork: string;
    CardDetails: string;
    CardImage?: string;
    CardPrimaryColor?: string;
    CardSecondaryColor?: string;
    selected?: boolean;      // Whether the card is selected by the user (optional, for user context)
    isDefaultCard?: boolean; // Whether this is the user's default card (optional, for user context)
    openDate?: string | null; // User's card open/anniversary date (MM/DD/YYYY format)
    isFrozen?: boolean;      // Whether the card is frozen (excluded from LLM)
}

/**
 * Represents a perk associated with a credit card
 *
 * Date Handling:
 * - EffectiveFrom: ISO date string when perk becomes available (e.g., "2025-01-01")
 * - EffectiveTo: ISO date string when perk expires, or "9999-12-31" for ongoing perks
 *
 * The sentinel value "9999-12-31" represents an ongoing/present perk with no end date.
 * This value is used by the server for better database indexing and queries.
 */
export interface CardPerk {
    id: string;
    ReferenceCardId: string;
    Title: string;
    Category: string;
    SubCategory: string;
    Description: string;
    Requirements: string;
    Details?: string;
    EffectiveFrom: string;   // ISO date: "2025-01-01"
    EffectiveTo: string;      // ISO date: "2025-12-31" or "9999-12-31" for ongoing
    LastUpdated: string;
}

/**
 * Represents a credit/benefit associated with a credit card
 *
 * Date Handling:
 * - EffectiveFrom: ISO date string when credit becomes available (e.g., "2025-01-01")
 * - EffectiveTo: ISO date string when credit expires, or "9999-12-31" for ongoing credits
 *
 * The sentinel value "9999-12-31" represents an ongoing/present credit with no end date.
 * This value is used by the server for better database indexing and queries.
 *
 * Anniversary-Based Credits:
 * - isAnniversaryBased: When true, credit periods are based on user's card open date
 *   rather than calendar year. Anniversary credits are always annual (one year from card
 *   open date to the next anniversary). TimePeriod is ignored for anniversary credits.
 */
export interface CardCredit {
    id: string;
    ReferenceCardId: string;
    Title: string;
    Category: string;
    SubCategory: string;
    Description: string;
    Value: number;
    TimePeriod: string;
    Requirements: string;
    Details?: string;
    EffectiveFrom: string;   // ISO date: "2025-01-01"
    EffectiveTo: string;      // ISO date: "2025-12-31" or "9999-12-31" for ongoing
    LastUpdated: string;

    // Anniversary-based credit fields
    isAnniversaryBased?: boolean;  // true = anniversary-based, false/undefined = calendar
}


/**
 * Multiplier type constants
 */
export const MULTIPLIER_TYPES = {
    STANDARD: 'standard',
    ROTATING: 'rotating',
    SELECTABLE: 'selectable'
} as const;
export type MultiplierType = typeof MULTIPLIER_TYPES[keyof typeof MULTIPLIER_TYPES];

/**
 * Spending cap period constants
 */
export const SPENDING_CAP_PERIODS = {
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    SEMIANNUALLY: 'semiannually',
    ANNUALLY: 'annually'
} as const;
export type SpendingCapPeriod = typeof SPENDING_CAP_PERIODS[keyof typeof SPENDING_CAP_PERIODS];

/**
 * Schedule period type constants (for rotating multipliers)
 */
export const SCHEDULE_PERIOD_TYPES = {
    QUARTER: 'quarter',
    MONTH: 'month',
    HALF_YEAR: 'half_year',
    YEAR: 'year',
    CUSTOM: 'custom'
} as const;
export type SchedulePeriodType = typeof SCHEDULE_PERIOD_TYPES[keyof typeof SCHEDULE_PERIOD_TYPES];

/**
 * Spending cap for display purposes (no tracking)
 */
export interface SpendingCap {
    amount: number;                // e.g., 1500
    period: SpendingCapPeriod;
    currency: string;              // e.g., 'USD'
}

/**
 * Represents a rewards multiplier for specific spending categories
 *
 * Date Handling:
 * - EffectiveFrom: ISO date string when multiplier becomes available (e.g., "2025-01-01")
 * - EffectiveTo: ISO date string when multiplier expires, or "9999-12-31" for ongoing multipliers
 *
 * The sentinel value "9999-12-31" represents an ongoing/present multiplier with no end date.
 * This value is used by the server for better database indexing and queries.
 */
export interface CardMultiplier {
    id: string;
    ReferenceCardId: string;
    Name: string;
    Category: string;              // For standard: the fixed category
    SubCategory: string;           // For standard: the fixed subcategory
    Description: string;
    Multiplier: number | null;
    Requirements: string;
    Details?: string;
    EffectiveFrom: string;         // ISO date: "2025-01-01"
    EffectiveTo: string;           // ISO date: "2025-12-31" or "9999-12-31" for ongoing
    LastUpdated: string;

    // Rotating & Selectable Multiplier Fields
    multiplierType: MultiplierType;  // Required - 'standard' | 'rotating' | 'selectable'
    spendingCap?: SpendingCap;       // Optional - for display only
}

/**
 * Represents a rotating schedule entry for a multiplier
 */
export interface RotatingScheduleEntry {
    id: string;                      // Auto-generated document ID
    category: string;                // Category from taxonomy
    subCategory: string;             // SubCategory from taxonomy
    periodType: SchedulePeriodType;
    periodValue?: number;            // For quarter: 1-4, month: 1-12, half_year: 1-2
    year: number;                    // e.g., 2025
    startDate: string;               // ISO date - calculated or custom
    endDate: string;                 // ISO date - calculated or custom
    isCustomDateRange: boolean;      // True if manually specified dates
    title: string;                   // REQUIRED - Display name for this period (e.g., "Amazon.com purchases")
}

/**
 * Represents an allowed category for a selectable multiplier
 */
export interface AllowedCategoryEntry {
    id: string;                      // Auto-generated document ID
    category: string;                // Category from taxonomy
    subCategory: string;             // SubCategory from taxonomy
    displayName: string;             // User-friendly name (e.g., "Gas Stations")
}

/**
 * User's category selections for selectable multipliers
 */
export interface UserMultiplierSelections {
    [multiplierId: string]: {
        selectedCategoryId: string;    // References AllowedCategoryEntry.id
        updatedAt: string;             // ISO timestamp
    };
}

/**
 * Enriched multiplier type that includes schedule or selection data
 */
export type EnrichedMultiplier = CardMultiplier & {
    currentSchedules?: RotatingScheduleEntry[];    // Populated for rotating type - array for multiple categories per period
    allowedCategories?: AllowedCategoryEntry[];    // Populated for selectable type
    userSelectedCategory?: AllowedCategoryEntry;   // User's current selection
}

/**
 * Type guard for rotating multipliers
 */
export function isRotatingMultiplier(mult: EnrichedMultiplier): mult is EnrichedMultiplier & { currentSchedules?: RotatingScheduleEntry[] } {
    return mult.multiplierType === MULTIPLIER_TYPES.ROTATING;
}

/**
 * Type guard for selectable multipliers
 */
export function isSelectableMultiplier(mult: EnrichedMultiplier): mult is EnrichedMultiplier & { allowedCategories?: AllowedCategoryEntry[]; userSelectedCategory?: AllowedCategoryEntry } {
    return mult.multiplierType === MULTIPLIER_TYPES.SELECTABLE;
}

/**
 * Display names for multiplier types
 */
export const MULTIPLIER_TYPE_DISPLAY_NAMES: Record<MultiplierType, string> = {
    [MULTIPLIER_TYPES.STANDARD]: 'Standard',
    [MULTIPLIER_TYPES.ROTATING]: 'Rotating',
    [MULTIPLIER_TYPES.SELECTABLE]: 'Selectable'
};

/**
 * Display names for schedule periods
 */
export const SCHEDULE_PERIOD_DISPLAY_NAMES: Record<SchedulePeriodType, string> = {
    [SCHEDULE_PERIOD_TYPES.QUARTER]: 'Quarter',
    [SCHEDULE_PERIOD_TYPES.MONTH]: 'Month',
    [SCHEDULE_PERIOD_TYPES.HALF_YEAR]: 'Half Year',
    [SCHEDULE_PERIOD_TYPES.YEAR]: 'Year',
    [SCHEDULE_PERIOD_TYPES.CUSTOM]: 'Custom'
};

/**
 * Display names for spending cap periods
 */
export const SPENDING_CAP_PERIOD_DISPLAY_NAMES: Record<SpendingCapPeriod, string> = {
    [SPENDING_CAP_PERIODS.MONTHLY]: 'month',
    [SPENDING_CAP_PERIODS.QUARTERLY]: 'quarter',
    [SPENDING_CAP_PERIODS.SEMIANNUALLY]: '6 months',
    [SPENDING_CAP_PERIODS.ANNUALLY]: 'year'
};

/**
 * Format a spending cap for display
 */
export function formatSpendingCap(cap: SpendingCap): string {
    const currencySymbol = cap.currency === 'USD' ? '$' : cap.currency;
    const periodLabel = SPENDING_CAP_PERIOD_DISPLAY_NAMES[cap.period];
    return `Up to ${currencySymbol}${cap.amount.toLocaleString()}/${periodLabel}`;
}

/**
 * Get the effective category for a multiplier
 * Returns the current schedule category for rotating (first one if multiple), user selected for selectable, or fixed category for standard
 */
export function getEffectiveCategory(mult: EnrichedMultiplier): { category: string; subCategory: string } {
    if (isRotatingMultiplier(mult) && mult.currentSchedules && mult.currentSchedules.length > 0) {
        return {
            category: mult.currentSchedules[0].category,
            subCategory: mult.currentSchedules[0].subCategory
        };
    }
    if (isSelectableMultiplier(mult) && mult.userSelectedCategory) {
        return {
            category: mult.userSelectedCategory.category,
            subCategory: mult.userSelectedCategory.subCategory
        };
    }
    return {
        category: mult.Category,
        subCategory: mult.SubCategory
    };
}

/**
 * Get all effective categories for a rotating multiplier
 * Returns all current schedule categories for rotating multipliers
 */
export function getAllEffectiveCategories(mult: EnrichedMultiplier): Array<{ category: string; subCategory: string }> {
    if (isRotatingMultiplier(mult) && mult.currentSchedules && mult.currentSchedules.length > 0) {
        return mult.currentSchedules.map(schedule => ({
            category: schedule.category,
            subCategory: schedule.subCategory
        }));
    }
    if (isSelectableMultiplier(mult) && mult.userSelectedCategory) {
        return [{
            category: mult.userSelectedCategory.category,
            subCategory: mult.userSelectedCategory.subCategory
        }];
    }
    return [{
        category: mult.Category,
        subCategory: mult.SubCategory
    }];
}

/**
 * Represents detailed information about a credit card including all benefits and features.
 * This is the standard format for credit card data received from the API.
 *
 * Date Handling:
 * - effectiveFrom: ISO date string when version became active (e.g., "2025-01-01")
 * - effectiveTo: ISO date string when version ended, or "9999-12-31" for current/ongoing versions
 *
 * The sentinel value "9999-12-31" represents an ongoing version with no end date.
 *
 * Note: Components (credits, perks, multipliers) are fetched separately via ComponentService.
 */
export interface CreditCardDetails extends CreditCard {
    AnnualFee: number | null;
    ForeignExchangeFee: string;
    ForeignExchangeFeePercentage: number | null;
    RewardsCurrency: string;
    PointsPerDollar: number | null;
    VersionName: string;        // Name/label for this version
    ReferenceCardId: string;    // Reference to the base card this version belongs to
    IsActive: boolean;          // Whether this version is currently active
    // Versioning fields
    effectiveFrom: string;   // ISO date: "2025-01-01"
    effectiveTo: string;     // ISO date: "2025-12-31" or "9999-12-31" for ongoing
    lastUpdated: string;     // ISO timestamp
}

/**
 * Enhanced version of CreditCardDetails with full component objects embedded.
 * Used when card data with all components is needed in a single object.
 */
export interface CreditCardDetailsEnhanced extends CreditCard {
    AnnualFee: number | null;
    ForeignExchangeFee: string;
    ForeignExchangeFeePercentage: number | null;
    RewardsCurrency: string;
    PointsPerDollar: number | null;
    Perks: CardPerk[];          // Full perk objects with all details
    Credits: CardCredit[];      // Full credit objects with all details
    Multipliers: CardMultiplier[]; // Full multiplier objects with all details
    VersionName: string;        // Name/label for this version
    ReferenceCardId: string;    // Reference to the base card this version belongs to
    IsActive: boolean;          // Whether this version is currently active
    // Versioning fields
    effectiveFrom: string;   // ISO date: "2025-01-01"
    effectiveTo: string;     // ISO date: "2025-12-31" or "9999-12-31" for ongoing
    lastUpdated: string;     // ISO timestamp
}

// Response types

/**
 * Represents the response for a list of credit cards (with selection info).
 */
export type CreditCardListResponse = CreditCard[];

/**
 * Represents the response for a list of credit cards with details (with selection info).
 */
export type CreditCardListDetailsResponse = CreditCardDetails[];

/**
 * Represents the response for a single card details request.
 */
export type CreditCardDetailsResponse = CreditCard;

export interface CardParams {
    cardId: string;
}

/**
 * Response type for the worker credit cards list endpoint
 */
export type CreditCardReferenceListResponse = string[];

/**
 * Request parameters for getting versions of a specific credit card
 */
export interface CreditCardVersionsParams {
    referenceCardId: string;
}

/**
 * Response type for credit card version summary
 */
export interface CreditCardVersionSummary {
    id: string;
    VersionName: string;
    IsActive: boolean;
    effectiveFrom: string;
    effectiveTo: string;
    lastUpdated: string;
}

/**
 * Response type for the worker credit card versions endpoint
 */
export type CreditCardVersionsListResponse = CreditCardVersionSummary[];


/**
 * ------------------------------------------------------------------------------------------------
 *
 * CLIENT TYPES
 *
 * ------------------------------------------------------------------------------------------------
 */

export interface SimpleCardDisplay {
    name: string;
    image: string;
}