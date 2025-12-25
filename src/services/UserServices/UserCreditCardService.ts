import axios from 'axios';
import { apiurl, getAuthHeaders } from '../index';
import { CardDetailsList, UserWalletHistory, UserCreditCard } from '../../types';
import { CreditCardDetails } from '../../types/CreditCardTypes';
import { apiCache, CACHE_KEYS } from '../../utils/ApiCache';

export const UserCreditCardService = {
    /**
     * Updates user's selected credit cards
     */
    async updateUserCards(selectedCards: { cardId: string; isDefaultCard: boolean; openDate?: string | null }[]): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.post(
            `${apiurl}/users/cards/update`,
            { returnCreditCards: selectedCards },
            { headers }
        );

        // Invalidate all card-related caches to ensure fresh data on next fetch
        apiCache.invalidate(CACHE_KEYS.CREDIT_CARDS);
        apiCache.invalidate(CACHE_KEYS.CREDIT_CARDS_PREVIEWS);
        apiCache.invalidate(CACHE_KEYS.CREDIT_CARDS_DETAILS);
        apiCache.invalidate(CACHE_KEYS.USER_CARD_DETAILS);
        apiCache.invalidate(CACHE_KEYS.USER_CARD_DETAILS_FULL);
        apiCache.invalidate(CACHE_KEYS.USER_CARDS);
    },

    /**
     * Fetches all user's credit cards with metadata from subcollection
     * @returns Promise containing the user's cards with openDate, isDefault, isFrozen
     */
    async fetchUserCards(): Promise<UserCreditCard[]> {
        return apiCache.get(CACHE_KEYS.USER_CARDS, async () => {
            const headers = await getAuthHeaders();
            const response = await axios.get<UserCreditCard[]>(
                `${apiurl}/users/cards`,
                { headers }
            );
            return response.data;
        });
    },

    /**
     * Updates a specific user card's metadata (openDate, isFrozen)
     */
    async updateUserCard(cardId: string, updates: { openDate?: string | null; isFrozen?: boolean }): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.patch(
            `${apiurl}/users/cards/${cardId}`,
            updates,
            { headers }
        );

        // Invalidate caches
        apiCache.invalidate(CACHE_KEYS.USER_CARDS);
        apiCache.invalidate(CACHE_KEYS.USER_CARD_DETAILS);
        apiCache.invalidate(CACHE_KEYS.USER_CARD_DETAILS_FULL);
        apiCache.invalidate(CACHE_KEYS.CREDIT_CARDS);
        apiCache.invalidate(CACHE_KEYS.CREDIT_CARDS_PREVIEWS);
    },

    /**
     * Removes a card from user's collection
     */
    async removeCard(cardId: string): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.delete(
            `${apiurl}/users/cards/${cardId}`,
            { headers }
        );

        // Invalidate caches
        apiCache.invalidate(CACHE_KEYS.USER_CARDS);
        apiCache.invalidate(CACHE_KEYS.USER_CARD_DETAILS);
        apiCache.invalidate(CACHE_KEYS.USER_CARD_DETAILS_FULL);
        apiCache.invalidate(CACHE_KEYS.CREDIT_CARDS);
        apiCache.invalidate(CACHE_KEYS.CREDIT_CARDS_PREVIEWS);
    },

    /**
     * Fetches user's credit card details
     * @returns Promise containing the user's card details
     */
    async fetchUserCardDetails(): Promise<CardDetailsList> {
        return apiCache.get(CACHE_KEYS.USER_CARD_DETAILS, async () => {
            const headers = await getAuthHeaders();
            const response = await axios.get<CardDetailsList>(
                `${apiurl}/users/cards/details`,
                { headers }
            );
            return response.data;
        });
    },
    
    /**
     * Fetches detailed information for all user's selected credit cards
     * @returns Promise containing the detailed credit card information for user's cards
     */
    async fetchUserCardsDetailedInfo(): Promise<CreditCardDetails[]> {
        return apiCache.get(CACHE_KEYS.USER_CARD_DETAILS_FULL, async () => {
            const headers = await getAuthHeaders();
            const response = await axios.get<CreditCardDetails[]>(
                `${apiurl}/credit-cards/list/details`,
                {
                    headers,
                    params: { userCardsOnly: true }
                }
            );
            return response.data;
        });
    },

    /**
     * Fetches the user's wallet history (card add/remove events)
     * @returns Promise containing the user's wallet history
     */
    async fetchUserWalletHistory(): Promise<UserWalletHistory> {
        const headers = await getAuthHeaders();
        const response = await axios.get<UserWalletHistory>(
            `${apiurl}/users/cards/wallet-history`,
            { headers }
        );
        return response.data;
    }
};


