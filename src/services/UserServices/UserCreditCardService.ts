import axios from 'axios';
import { apiurl, getAuthHeaders } from '../index';
import { CardDetailsList, UserWalletHistory } from '../../types';
import { CreditCardDetails } from '../../types/CreditCardTypes';
import { apiCache, CACHE_KEYS } from '../../utils/ApiCache';

export const UserCreditCardService = {
    /**
     * Updates user's selected credit cards
     */
    async updateUserCards(selectedCards: { cardId: string; isDefaultCard: boolean }[]): Promise<void> {
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


