import axios from 'axios';
import { apiurl, getAuthHeaders } from '../index';
import { CalendarUserCredits, CreditHistory, CreditUsageType, UserCreditsTrackingPreferences, CreditHidePreferenceType, UserCreditWithExpiration, PrioritizedCredit, GetPrioritizedCreditsListParams, GetPrioritizedCreditsListResponse, CreditPeriodType, MonthlyStatsResponse, GetMonthlySummaryParams, MonthlySummaryResponse, HistoricalMonthlySummaryResponse } from '../../types';
import { apiCache, CACHE_KEYS } from '../../utils/ApiCache';

let syncTimeout: NodeJS.Timeout | null = null;
let pendingSyncResolvers: ((value: CalendarUserCredits) => void)[] = [];
let pendingSyncRejectors: ((reason: any) => void)[] = [];

// Separate debouncing for year-specific syncs
let yearSyncTimeouts: Map<number, NodeJS.Timeout> = new Map();
let pendingYearSyncResolvers: Map<number, ((value: CalendarUserCredits) => void)[]> = new Map();
let pendingYearSyncRejectors: Map<number, ((reason: any) => void)[]> = new Map();

export const UserCreditService = {

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
        includeExpiring?: boolean;
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
        if (options?.includeExpiring) {
            params.set('includeExpiring', 'true');
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
     * Background reconciliation for current-year credits: ensures all selected cards and their credits
     * exist in the user's current year's CalendarUserCredits. Returns CalendarUserCredits.
     */
    async syncCurrentYearCredits(): Promise<CalendarUserCredits> {
        const headers = await getAuthHeaders();

        try {
            const response = await axios.post<CalendarUserCredits>(
                `${apiurl}/users/cards/credits/sync`,
                undefined,
                { headers }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Background reconciliation for specified year credits: ensures all selected cards and their credits
     * exist in the user's specified year's CalendarUserCredits. Returns CalendarUserCredits.
     */
    async syncYearCredits(year: number, options?: {
        excludeHidden?: boolean;
    }): Promise<CalendarUserCredits> {
        const headers = await getAuthHeaders();

        // Build query parameters
        const params = new URLSearchParams();
        params.set('year', year.toString());
        if (options?.excludeHidden) {
            params.set('excludeHidden', 'true');
        }

        try {
            const response = await axios.post<CalendarUserCredits>(
                `${apiurl}/users/cards/credits/sync?${params.toString()}`,
                undefined,
                { headers }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Debounced version of syncCurrentYearCredits that prevents multiple rapid calls.
     * Multiple calls within 500ms will be batched into a single API request.
     */
    async syncCurrentYearCreditsDebounced(): Promise<CalendarUserCredits> {
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
     * Debounced version of syncYearCredits that prevents multiple rapid calls for the same year.
     * Multiple calls within 500ms for the same year will be batched into a single API request.
     */
    async syncYearCreditsDebounced(year: number, options?: {
        excludeHidden?: boolean;
    }): Promise<CalendarUserCredits> {
        return new Promise((resolve, reject) => {
            // Initialize arrays for this year if they don't exist
            if (!pendingYearSyncResolvers.has(year)) {
                pendingYearSyncResolvers.set(year, []);
            }
            if (!pendingYearSyncRejectors.has(year)) {
                pendingYearSyncRejectors.set(year, []);
            }

            // Add this promise's resolve/reject to the pending queue for this year
            pendingYearSyncResolvers.get(year)!.push(resolve);
            pendingYearSyncRejectors.get(year)!.push(reject);

            // Clear any existing timeout for this year
            if (yearSyncTimeouts.has(year)) {
                clearTimeout(yearSyncTimeouts.get(year)!);
            }

            // Set a new timeout for this year
            const timeout = setTimeout(async () => {
                // Execute the actual sync call
                try {
                    const result = await this.syncYearCredits(year, options);

                    // Resolve all pending promises for this year with the same result
                    const resolvers = [...(pendingYearSyncResolvers.get(year) || [])];
                    pendingYearSyncResolvers.set(year, []);
                    pendingYearSyncRejectors.set(year, []);

                    resolvers.forEach(resolver => resolver(result));
                } catch (error) {
                    // Reject all pending promises for this year with the same error
                    const rejectors = [...(pendingYearSyncRejectors.get(year) || [])];
                    pendingYearSyncResolvers.set(year, []);
                    pendingYearSyncRejectors.set(year, []);

                    rejectors.forEach(rejector => rejector(error));
                }

                yearSyncTimeouts.delete(year);
            }, 500); // 500ms debounce delay

            yearSyncTimeouts.set(year, timeout);
        });
    },

    /**
     * Returns the authenticated user's credit tracking preferences
     */
    async fetchCreditTrackingPreferences(): Promise<UserCreditsTrackingPreferences> {
        return apiCache.get(CACHE_KEYS.CREDIT_TRACKING_PREFERENCES, async () => {
            const headers = await getAuthHeaders();
            const response = await axios.get<UserCreditsTrackingPreferences>(
                `${apiurl}/users/cards/credits/preferences`,
                { headers }
            );
            return response.data;
        });
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
    },

    /**
     * Returns prioritized credits list for sidebar display
     * Sorts credits by expiration urgency and unused value
     */
    async fetchPrioritizedCreditsList(options?: GetPrioritizedCreditsListParams): Promise<GetPrioritizedCreditsListResponse> {
        const headers = await getAuthHeaders();

        // Build query parameters
        const params = new URLSearchParams();
        if (options?.limit !== undefined) {
            params.set('limit', options.limit.toString());
        }
        if (options?.year !== undefined) {
            params.set('year', options.year.toString());
        }
        if (options?.cardId) {
            params.set('cardId', options.cardId);
        }
        if (options?.period) {
            params.set('period', options.period);
        }
        if (options?.onlyExpiring) {
            params.set('onlyExpiring', 'true');
        }
        if (options?.excludeHidden) {
            params.set('excludeHidden', 'true');
        }
        if (options?.showRedeemed) {
            params.set('showRedeemed', 'true');
        }

        const queryString = params.toString();
        const url = `${apiurl}/users/cards/credits/prioritized-list${queryString ? `?${queryString}` : ''}`;

        const response = await axios.get<GetPrioritizedCreditsListResponse>(url, { headers });
        return response.data;
    },

    /**
     * Fetches monthly credits statistics including current month usage, full year stats, and expiring credits by period
     */
    async fetchMonthlyStats(): Promise<MonthlyStatsResponse> {
        const headers = await getAuthHeaders();
        const response = await axios.get<MonthlyStatsResponse>(
            `${apiurl}/users/cards/credits/monthly-stats`,
            { headers }
        );
        return response.data;
    },

    /**
     * Fetches combined monthly stats and prioritized credits in a single API call
     * Returns both monthly statistics and prioritized credits list
     */
    async fetchMonthlySummary(options?: GetMonthlySummaryParams): Promise<MonthlySummaryResponse> {
        const headers = await getAuthHeaders();

        // Build query parameters
        const params = new URLSearchParams();
        if (options?.includeHidden !== undefined) {
            params.set('includeHidden', options.includeHidden.toString());
        }
        if (options?.limit !== undefined) {
            params.set('limit', options.limit.toString());
        }
        if (options?.year !== undefined) {
            params.set('year', options.year.toString());
        }
        if (options?.cardId) {
            params.set('cardId', options.cardId);
        }
        if (options?.period) {
            params.set('period', options.period);
        }
        if (options?.onlyExpiring) {
            params.set('onlyExpiring', 'true');
        }
        if (options?.showRedeemed) {
            params.set('showRedeemed', 'true');
        }
        if (options?.showUntracked) {
            params.set('showUntracked', 'true');
        }

        const queryString = params.toString();
        const url = `${apiurl}/users/cards/credits/monthly-summary${queryString ? `?${queryString}` : ''}`;

        const response = await axios.get<MonthlySummaryResponse>(url, { headers });
        return response.data;
    },

    /**
     * Fetches historical monthly statistics for a specific month/year
     * Returns MonthlyCredits and CurrentCredits for that point in time
     */
    async fetchHistoricalMonthlySummary(year: number, month: number, includeHidden: boolean = false): Promise<HistoricalMonthlySummaryResponse> {
        const headers = await getAuthHeaders();

        const params = new URLSearchParams();
        params.set('year', year.toString());
        params.set('month', month.toString());
        if (includeHidden) {
            params.set('includeHidden', 'true');
        }

        const queryString = params.toString();
        const url = `${apiurl}/users/cards/credits/historical-monthly-summary?${queryString}`;

        const response = await axios.get<HistoricalMonthlySummaryResponse>(url, { headers });
        return response.data;
    },

};


