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
}

/**
 * Represents a perk associated with a credit card
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
    EffectiveFrom: string;
    EffectiveTo: string;
    LastUpdated: string;
}

export interface CardPerkPointer {
    id: string;
}

/**
 * Represents a credit/benefit associated with a credit card
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
    EffectiveFrom: string;
    EffectiveTo: string;
    LastUpdated: string;
}

export interface CardCreditPointer {
    id: string;
}


/**
 * Represents a rewards multiplier for specific spending categories
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
    EffectiveFrom: string;
    EffectiveTo: string;
    LastUpdated: string;
}

export interface CardMultiplierPointer {
    id: string;
}

/**
 * Represents detailed information about a credit card including all benefits and features
 */
export interface CreditCardDetails extends CreditCard {
    AnnualFee: number | null;
    ForeignExchangeFee: string;
    ForeignExchangeFeePercentage: number | null;
    RewardsCurrency: string;
    PointsPerDollar: number | null;
    Perks: CardPerkPointer[];
    Credits: CardCreditPointer[];
    Multipliers: CardMultiplierPointer[];
    VersionName: string;        // Name/label for this version
    ReferenceCardId: string;    // Reference to the base card this version belongs to
    IsActive: boolean;          // Whether this version is currently active
    // Versioning fields
    effectiveFrom: string;   // ISO date string when this version became active
    effectiveTo: string;    // ISO date string when this version ended (optional, missing for current version)
    lastUpdated: string;     // ISO date string when this record was created/modified
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