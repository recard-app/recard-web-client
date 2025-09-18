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
    // Versioning fields
    effectiveFrom: string;   // ISO date string when this version became active
    effectiveTo?: string;    // ISO date string when this version ended (optional, missing for current version)
    lastUpdated: string;     // ISO date string when this record was created/modified
}

/**
 * Represents a perk associated with a credit card
 */
export interface CardPerk {
    id: string;
    Title: string;
    Category: string;
    SubCategory: string;
    Description: string;
    Requirements: string;
    Details?: string;
}

/**
 * Represents a credit/benefit associated with a credit card
 */
export interface CardCredit {
    id: string;
    Title: string;
    Category: string;
    SubCategory: string;
    Description: string;
    Value: string;
    TimePeriod: string;
    Requirements: string;
    Details?: string;
}

/**
 * Represents a rewards multiplier for specific spending categories
 */
export interface CardMultiplier {
    id: string;
    Name: string;
    Category: string;
    SubCategory: string;
    Description: string;
    Multiplier: number | null;
    Requirements: string;
    Details?: string;
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
    Perks: CardPerk[];
    Credits: CardCredit[];
    Multipliers: CardMultiplier[];
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
 * Represents a historical version of a credit card for versioning system
 */
export interface CreditCardVersion extends CreditCardDetails {
    cardId: string;         // Reference to the card this version belongs to
    effectiveFrom: string;  // ISO date string when this version became active
    effectiveTo?: string;   // ISO date string when this version ended (optional, missing for current version)
    lastUpdated: string;    // ISO date string when this record was created/modified
}

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