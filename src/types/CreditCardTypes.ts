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
 */
export interface CardCredit {
    id: string;
    ReferenceCardId: string;
    Title: string;
    Category: string;
    SubCategory: string;
    Description: string;
    Value: string;
    TimePeriod: string;
    Requirements: string;
    Details?: string;
    EffectiveFrom: string;   // ISO date: "2025-01-01"
    EffectiveTo: string;      // ISO date: "2025-12-31" or "9999-12-31" for ongoing
    LastUpdated: string;
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
    Category: string;
    SubCategory: string;
    Description: string;
    Multiplier: number | null;
    Requirements: string;
    Details?: string;
    EffectiveFrom: string;   // ISO date: "2025-01-01"
    EffectiveTo: string;      // ISO date: "2025-12-31" or "9999-12-31" for ongoing
    LastUpdated: string;
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