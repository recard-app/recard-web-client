import axios from 'axios';
import { apiurl, getAuthHeaders } from '../index';
import { CalendarUserCredits, CreditHistory, CreditUsageType, UserCreditsTrackingPreferences, CreditHidePreferenceType } from '../../types';

let syncTimeout: NodeJS.Timeout | null = null;
let pendingSyncResolvers: ((value: { changed: boolean; creditHistory?: CreditHistory }) => void)[] = [];
let pendingSyncRejectors: ((reason: any) => void)[] = [];

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
     * @param year - The year to fetch
     * @param options - Optional filtering parameters
     */
    async fetchCreditHistoryForYear(year: number, options?: {
        cardIds?: string[];
        excludeHidden?: boolean;
    }): Promise<CalendarUserCredits> {
        const headers = await getAuthHeaders();

        // Build query parameters
        const params = new URLSearchParams();
        if (options?.cardIds && options.cardIds.length > 0) {
            options.cardIds.forEach(cardId => params.append('cardIds[]', cardId));
        }
        if (options?.excludeHidden) {
            params.set('excludeHidden', 'true');
        }

        const queryString = params.toString();
        const url = `${apiurl}/users/cards/credits/year/${year}${queryString ? `?${queryString}` : ''}`;

        const response = await axios.get<CalendarUserCredits>(url, { headers });
        return response.data;
    },

    /**
     * Fetches detailed credit information for CreditEntryDetails modal
     * Returns enriched data with full metadata and complete usage history
     */
    async fetchCreditDetails(cardId: string, creditId: string, year: number, options?: {
        excludeHidden?: boolean;
    }): Promise<{
        credit: any;
        cardDetails: any;
        yearContext: {
            totalCredits: number;
            yearData: CalendarUserCredits;
        };
    }> {
        const headers = await getAuthHeaders();

        // Build query parameters
        const params = new URLSearchParams();
        if (options?.excludeHidden) {
            params.set('excludeHidden', 'true');
        }

        const queryString = params.toString();
        const url = `${apiurl}/users/cards/credits/details/${cardId}/${creditId}/${year}${queryString ? `?${queryString}` : ''}`;

        const response = await axios.get(url, { headers });
        return response.data;
    },

    /**
     * Returns credits for a specific month, including all credits that apply to that month (monthly, quarterly, semiannual, annual)
     * @param year - The year to fetch
     * @param month - The month to fetch (1-12)
     * @param options - Optional filtering parameters
     */
    async fetchCreditHistoryForMonth(year: number, month: number, options?: {
        cardIds?: string[];
        excludeHidden?: boolean;
    }): Promise<CalendarUserCredits> {
        const headers = await getAuthHeaders();
        
        // Build query parameters
        const params = new URLSearchParams();
        if (options?.cardIds && options.cardIds.length > 0) {
            options.cardIds.forEach(cardId => params.append('cardIds[]', cardId));
        }
        if (options?.excludeHidden) {
            params.set('excludeHidden', 'true');
        }
        
        const queryString = params.toString();
        const url = `${apiurl}/users/cards/credits/month/${year}/${month}${queryString ? `?${queryString}` : ''}`;
        
        const response = await axios.get<CalendarUserCredits>(url, { headers });
        return response.data;
    },

    /**
     * Returns credit data for a specific month range with optional filtering
     * @param start - Start date in YYYY-MM format (e.g., "2024-01")
     * @param end - End date in YYYY-MM format (optional, defaults to start month)
     * @param options - Optional filtering parameters
     */
    async fetchCreditHistoryForRange(start: string, end?: string, options?: {
        cardIds?: string[];
        excludeHidden?: boolean;
    }): Promise<CalendarUserCredits> {
        const headers = await getAuthHeaders();
        
        // Build query parameters
        const params = new URLSearchParams();
        params.set('start', start);
        if (end) {
            params.set('end', end);
        }
        if (options?.cardIds && options.cardIds.length > 0) {
            options.cardIds.forEach(cardId => params.append('cardIds[]', cardId));
        }
        if (options?.excludeHidden) {
            params.set('excludeHidden', 'true');
        }
        
        const response = await axios.get<CalendarUserCredits>(
            `${apiurl}/users/cards/credits/range?${params.toString()}`,
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
    },

    /**
     * Background reconciliation for current-year credits: ensures all selected cards and their credits
     * exist in the user's current year's CalendarUserCredits. Returns { changed, creditHistory? }.
     */
    async syncCurrentYearCredits(): Promise<{ changed: boolean; creditHistory?: CreditHistory }> {
        const headers = await getAuthHeaders();
        const response = await axios.post<{ changed: boolean; creditHistory?: CreditHistory }>(
            `${apiurl}/users/cards/credits/sync`,
            undefined,
            { headers }
        );
        return response.data;
    },

    /**
     * Debounced version of syncCurrentYearCredits that prevents multiple rapid calls.
     * Multiple calls within 500ms will be batched into a single API request.
     */
    async syncCurrentYearCreditsDebounced(): Promise<{ changed: boolean; creditHistory?: CreditHistory }> {
        return new Promise((resolve, reject) => {
            // Add this promise's resolve/reject to the pending queue
            pendingSyncResolvers.push(resolve);
            pendingSyncRejectors.push(reject);

            // Clear any existing timeout
            if (syncTimeout) {
                clearTimeout(syncTimeout);
            }

            // Set a new timeout
            syncTimeout = setTimeout(async () => {
                // Execute the actual sync call
                try {
                    const result = await this.syncCurrentYearCredits();

                    // Resolve all pending promises with the same result
                    const resolvers = [...pendingSyncResolvers];
                    pendingSyncResolvers = [];
                    pendingSyncRejectors = [];

                    resolvers.forEach(resolver => resolver(result));
                } catch (error) {
                    // Reject all pending promises with the same error
                    const rejectors = [...pendingSyncRejectors];
                    pendingSyncResolvers = [];
                    pendingSyncRejectors = [];

                    rejectors.forEach(rejector => rejector(error));
                }

                syncTimeout = null;
            }, 500); // 500ms debounce delay
        });
    },

    /**
     * Returns the authenticated user's credit tracking preferences
     */
    async fetchCreditTrackingPreferences(): Promise<UserCreditsTrackingPreferences> {
        const headers = await getAuthHeaders();
        const response = await axios.get<UserCreditsTrackingPreferences>(
            `${apiurl}/users/cards/credits/preferences`,
            { headers }
        );
        return response.data;
    },

    /**
     * Updates the hide preference for a specific credit
     * Returns the updated UserCreditsTrackingPreferences
     */
    async updateCreditHidePreference(params: {
        cardId: string;
        creditId: string;
        hidePreference: CreditHidePreferenceType;
    }): Promise<UserCreditsTrackingPreferences> {
        const headers = await getAuthHeaders();
        const response = await axios.put<UserCreditsTrackingPreferences>(
            `${apiurl}/users/cards/credits/preferences`,
            params,
            { headers }
        );
        return response.data;
    }
};


