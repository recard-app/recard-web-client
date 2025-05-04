import axios from 'axios';
import { CreditCard } from '../types/CreditCardTypes';
import { apiurl, getAuthHeaders } from './index';
import { Conversation } from '../types';

/**
 * Service class for user-related Credit Card API operations
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

export const UserHistoryService = {
    /**
     * Deletes History Entry
     */
    async deleteHistoryEntry(chatId: string): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.delete(`${apiurl}/users/history/${chatId}`, { headers });
    }
};