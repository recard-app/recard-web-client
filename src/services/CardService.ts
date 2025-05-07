import axios from "axios";
import { apiurl, getAuthHeaders } from "./index";
import { CreditCard } from "../types";

/**
 * Service class for user authentication-related operations
 */
export const CardService = {
    /**
     * Fetches all credit cards with user's selection status
     */
    async fetchCreditCards(includeCardSelection: boolean = true): Promise<CreditCard[]> {
        const headers = await getAuthHeaders();
        const baseUrl = `${apiurl}/credit-cards/list/previews`;
        const url = includeCardSelection ? `${baseUrl}?includeCardSelection=true` : baseUrl;
        const response = await axios.get<CreditCard[]>(url, { headers });
        return response.data;
    },
};