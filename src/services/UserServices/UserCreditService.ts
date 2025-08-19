import axios from 'axios';
import { apiurl, getAuthHeaders } from '../index';
import { CalendarUserCredits, CreditHistory, CreditUsageType } from '../../types';

export const UserCreditService = {
    /**
     * Generates a CreditHistory for the authenticated user for the current year
     */
    async generateCreditHistory(): Promise<CreditHistory> {
        const headers = await getAuthHeaders();
        const response = await axios.post<CreditHistory>(
            `${apiurl}/users/cards/credits/generate`,
            undefined,
            { headers }
        );
        return response.data;
    },

    /**
     * Deletes the full credit history for the authenticated user
     */
    async deleteCreditHistory(): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.delete(
            `${apiurl}/users/cards/credits`,
            { headers }
        );
    },

    /**
     * Returns the authenticated user's full CreditHistory
     */
    async fetchCreditHistory(): Promise<CreditHistory> {
        const headers = await getAuthHeaders();
        const response = await axios.get<CreditHistory>(
            `${apiurl}/users/cards/credits`,
            { headers }
        );
        return response.data;
    },

    /**
     * Returns the authenticated user's CalendarUserCredits for a given year
     */
    async fetchCreditHistoryForYear(year: number): Promise<CalendarUserCredits> {
        const headers = await getAuthHeaders();
        const response = await axios.get<CalendarUserCredits>(
            `${apiurl}/users/cards/credits/year/${year}`,
            { headers }
        );
        return response.data;
    },

    /**
     * Updates a single credit history entry (usage/value) for the current year
     * Returns the updated CreditHistory
     */
    async updateCreditHistoryEntry(params: {
        cardId: string;
        creditId: string;
        periodNumber: number;
        creditUsage?: CreditUsageType;
        valueUsed?: number;
    }): Promise<CreditHistory> {
        const headers = await getAuthHeaders();
        const response = await axios.put<CreditHistory>(
            `${apiurl}/users/cards/credits/history`,
            params,
            { headers }
        );
        return response.data;
    },

    /**
     * Creates an empty CalendarUserCredits for the given year for the authenticated user
     */
    async createEmptyCalendarForYear(year: number): Promise<CalendarUserCredits> {
        const headers = await getAuthHeaders();
        const response = await axios.post<CalendarUserCredits>(
            `${apiurl}/users/cards/credits/year/${year}`,
            undefined,
            { headers }
        );
        return response.data;
    }
};


