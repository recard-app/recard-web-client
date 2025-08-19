import { CreditCard } from '../../types/CreditCardTypes';
import { CardService, UserCreditCardService, UserCreditService } from '../../services';

/**
 * Sorts credit cards by priority:
 * 1. Default card first
 * 2. Selected cards next
 * 3. Alphabetically by name
 */
export const sortCards = (cards: CreditCard[]): CreditCard[] => {
    return [...cards].sort((a, b) => {
        if (a.isDefaultCard !== b.isDefaultCard) {
            return a.isDefaultCard ? -1 : 1;
        }
        if (a.selected !== b.selected) {
            return a.selected ? -1 : 1;
        }
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

/**
 * Saves user card selections and returns updated list
 */
export const saveUserCardSelections = async (cards: CreditCard[], previouslySelectedIds: string[] = []): Promise<{
    success: boolean;
    message: string;
    updatedCards?: CreditCard[];
}> => {
    try {
        const cardsToSubmit = formatCardsForSubmission(cards);
        await UserCreditCardService.updateUserCards(cardsToSubmit);
        
        const updatedCards = await CardService.fetchCreditCards(true);

        // Determine newly added cards by comparing updated selected IDs to previously saved selected IDs
        const updatedSelectedIds = (updatedCards || []).filter(c => c.selected).map(c => c.id);
        const addedIds = updatedSelectedIds.filter(id => !previouslySelectedIds.includes(id));

        if (addedIds.length > 0) {
            // Fire-and-forget: add credits for each newly added card to current year
            // Do not block UI if any call fails; log errors for debugging
            void Promise.allSettled(
                addedIds.map(cardId => UserCreditService.addCardToCurrentYear(cardId))
            ).then(results => {
                results.forEach((r, idx) => {
                    if (r.status === 'rejected') {
                        console.error(`Failed to add credits for card ${addedIds[idx]}:`, r.reason);
                    }
                });
            });
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
            message: 'Error saving cards. Please try again.'
        };
    }
};