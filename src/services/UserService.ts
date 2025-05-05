import axios from 'axios';
import { CreditCard } from '../types/CreditCardTypes';
import { apiurl, getAuthHeaders } from './index';
import { Conversation, StartDateResponse, HistoryParams, PagedHistoryResponse } from '../types';

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

/**
 * Service class for user history-related operations
 */
export const UserHistoryService = {
    /**
     * Deletes History Entry
     * @param chatId ID of the chat to delete
     */
    async deleteHistoryEntry(chatId: string): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.delete(`${apiurl}/users/history/${chatId}`, { headers });
    },

    /**
     * Fetches paginated history entries
     * @param params Pagination and filter parameters
     * @returns Paginated history data
     */
    async fetchPagedHistory(params: HistoryParams): Promise<PagedHistoryResponse> {
        const headers = await getAuthHeaders();
        const response = await axios.get<PagedHistoryResponse>(
            `${apiurl}/users/history`,
            { headers, params }
        );
        return response.data;
    },

    /**
     * Fetches the date of the first history entry
     * @returns Response containing the first entry date
     */
    async fetchFirstEntryDate(): Promise<StartDateResponse> {
        const headers = await getAuthHeaders();
        const response = await axios.get<StartDateResponse>(
            `${apiurl}/users/history/start_date`,
            { headers }
        );
        return response.data;
    }
};