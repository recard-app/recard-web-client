import axios from 'axios';
import { CreditCard } from '../types/CreditCardTypes';
import { apiurl, getAuthHeaders } from './index';

/**
 * Service class for user-related API operations
 */
export const UserCreditCardService = {
    /**
     * Fetches all credit cards with user's selection status
     */
    async fetchCreditCards(): Promise<CreditCard[]> {
        const headers = await getAuthHeaders();
        const response = await axios.get<CreditCard[]>(
            `${apiurl}/credit-cards/list/previews?includeCardSelection=true`,
            { headers }
        );
        return response.data;
    },

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
    }
};
