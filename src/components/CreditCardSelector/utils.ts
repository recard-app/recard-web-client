import axios from 'axios';
import { CreditCard } from '../../types/CreditCardTypes';
import { CardService, UserCreditCardService, UserCreditService } from '../../services';

/**
 * Sorts credit cards: frozen last, preferred (default) card first, then alphabetically by name.
 */
export const sortCards = (cards: CreditCard[]): CreditCard[] => {
    return [...cards].sort((a, b) => {
        const aFrozen = a.isFrozen ?? false;
        const bFrozen = b.isFrozen ?? false;
        if (aFrozen !== bFrozen) return aFrozen ? 1 : -1;
        if (a.isDefaultCard && !b.isDefaultCard) return -1;
        if (!a.isDefaultCard && b.isDefaultCard) return 1;
        return a.CardName.localeCompare(b.CardName);
    });
};

/**
 * Filters cards based on search term
 * Matches against card name and issuer
 */
export const filterCards = (cards: CreditCard[], searchTerm: string): CreditCard[] => {
    return cards.filter(card => 
        card.CardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.CardIssuer.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

/**
 * Formats selected cards for API submission
 */
export const formatCardsForSubmission = (cards: CreditCard[]) => {
    return cards
        .filter(card => card.selected)
        .map(card => ({
            cardId: card.id,
            isDefaultCard: card.isDefaultCard || false
        }));
};

/**
 * Fetches credit cards and handles errors
 * @param existingCreditCards The existing credit cards array to use as fallback
 * @param includeSelectedInfo Whether to include selection info in the response
 * @returns An array of credit cards
 */
export const fetchUserCards = async (
    existingCreditCards: CreditCard[], 
    includeSelectedInfo: boolean = true
): Promise<CreditCard[]> => {
    try {
        const cards = await CardService.fetchCreditCards(includeSelectedInfo);
        return sortCards(cards);
    } catch (error) {
        console.error('Error fetching cards:', error);
        return sortCards(existingCreditCards);
    }
};

/**
 * Updates card selection state
 */
export const toggleCardSelection = (cards: CreditCard[], cardId: string): CreditCard[] => {
    return cards.map(card => {
        if (card.id === cardId) {
            const newSelected = !card.selected;
            return {
                ...card,
                selected: newSelected,
                ...(newSelected ? {} : { isDefaultCard: false })
            };
        }
        return card;
    });
};

/**
 * Updates default card state
 */
export const setDefaultCard = (cards: CreditCard[], cardId: string): CreditCard[] => {
    return cards.map(card => ({
        ...card,
        isDefaultCard: card.id === cardId
    }));
};

const getSaveCardsErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data as { error?: unknown } | undefined;
        const apiMessage = typeof responseData?.error === 'string' ? responseData.error : null;

        if (!status) {
            return 'Network error while saving cards. Please check your connection and try again.';
        }

        if (status === 401) {
            return 'Your session expired. Please sign in again and retry.';
        }

        if (status === 429) {
            return 'Too many requests. Please wait a moment and try again.';
        }

        if (apiMessage) {
            return apiMessage;
        }

        return 'Failed to save cards. Please try again.';
    }

    return 'Failed to save cards. Please try again.';
};

/**
 * Saves user card selections and returns updated list
 */
export const saveUserCardSelections = async (cards: CreditCard[]): Promise<{
    success: boolean;
    message: string;
    updatedCards?: CreditCard[];
}> => {
    try {
        const cardsToSubmit = formatCardsForSubmission(cards);
        await UserCreditCardService.updateUserCards(cardsToSubmit);

        // Sync credit history after card selection changes
        try {
            await UserCreditService.syncCurrentYearCreditsDebounced();
        } catch (syncError) {
            console.warn('Failed to sync credit history after card selection:', syncError);
        }

        // Refresh from API when possible, but don't report a failed save if
        // persistence succeeded and only the post-save refresh failed.
        let updatedCards: CreditCard[];
        try {
            updatedCards = await CardService.fetchCreditCards(true);
        } catch (refreshError) {
            console.warn('Cards saved but refresh failed; using local selection state:', refreshError);
            updatedCards = cards.map(card => ({
                ...card,
                selected: cardsToSubmit.some(submitted => submitted.cardId === card.id),
                isDefaultCard: cardsToSubmit.some(
                    submitted => submitted.cardId === card.id && submitted.isDefaultCard
                )
            }));
        }

        return {
            success: true,
            message: 'Cards saved successfully!',
            updatedCards: sortCards(updatedCards)
        };
    } catch (error) {
        console.error('Error saving cards:', error);
        return {
            success: false,
            message: getSaveCardsErrorMessage(error)
        };
    }
};
