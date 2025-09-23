import axios from "axios";
import { apiurl, getAuthHeaders } from "./index";
import { CreditCard } from "../types";
import { apiCache, CACHE_KEYS } from "../utils/ApiCache";

/**
 * Service class for user authentication-related operations
 */
export const CardService = {
    /**
     * Fetches all credit cards with user's selection status
     */
    async fetchCreditCards(includeCardSelection: boolean = true): Promise<CreditCard[]> {
        const cacheKey = includeCardSelection ? CACHE_KEYS.CREDIT_CARDS_PREVIEWS : CACHE_KEYS.CREDIT_CARDS;

        return apiCache.get(cacheKey, async () => {
            const headers = await getAuthHeaders();
            const baseUrl = `${apiurl}/credit-cards/list/previews`;
            const url = includeCardSelection ? `${baseUrl}?includeCardSelection=true` : baseUrl;
            const response = await axios.get<CreditCard[]>(url, { headers });
            return response.data;
        });
    },
};