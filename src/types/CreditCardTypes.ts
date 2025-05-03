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
    selected?: boolean;      // Whether the card is selected by the user (optional, for user context)
    isDefaultCard?: boolean; // Whether this is the user's default card (optional, for user context)
}

// Response types

/**
 * Represents the response for a list of credit cards (with selection info).
 */
export type CreditCardListResponse = CreditCard[];

/**
 * Represents the response for a single card details request.
 */
export type CreditCardDetailsResponse = CreditCard;

export interface CardParams {
    cardId: string;
}