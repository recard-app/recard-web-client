import axios from 'axios';
import { apiurl, getAuthHeaders } from './index';
import { CardPerk, CardCredit, CardMultiplier } from '../types';
import { apiCache, CACHE_KEYS } from '../utils/ApiCache';

/**
 * Service for fetching credit card components (perks, credits, multipliers)
 * for the authenticated user's selected cards
 */
export const ComponentService = {
  /**
   * Fetch all perks for the user's selected credit cards
   */
  async fetchUserCardPerks(): Promise<CardPerk[]> {
    return apiCache.get(CACHE_KEYS.COMPONENTS_PERKS, async () => {
      const headers = await getAuthHeaders();
      const url = `${apiurl}/users/cards/components/perks`;
      const response = await axios.get<{ perks: CardPerk[] }>(url, { headers });
      return response.data.perks;
    });
  },

  /**
   * Fetch all credits for the user's selected credit cards
   */
  async fetchUserCardCredits(): Promise<CardCredit[]> {
    return apiCache.get(CACHE_KEYS.COMPONENTS_CREDITS, async () => {
      const headers = await getAuthHeaders();
      const url = `${apiurl}/users/cards/components/credits`;
      const response = await axios.get<{ credits: CardCredit[] }>(url, { headers });
      return response.data.credits;
    });
  },

  /**
   * Fetch all multipliers for the user's selected credit cards
   */
  async fetchUserCardMultipliers(): Promise<CardMultiplier[]> {
    return apiCache.get(CACHE_KEYS.COMPONENTS_MULTIPLIERS, async () => {
      const headers = await getAuthHeaders();
      const url = `${apiurl}/users/cards/components/multipliers`;
      const response = await axios.get<{ multipliers: CardMultiplier[] }>(url, { headers });
      return response.data.multipliers;
    });
  },

  /**
   * Fetch all components (perks, credits, multipliers) for the user's selected cards
   * Returns a combined object with all three component types
   * @param forceRefresh - If true, bypasses cache and fetches fresh data
   */
  async fetchAllUserCardComponents(forceRefresh: boolean = false): Promise<{
    perks: CardPerk[];
    credits: CardCredit[];
    multipliers: CardMultiplier[];
  }> {
    return apiCache.get(CACHE_KEYS.COMPONENTS_ALL, async () => {
      // Execute all three requests in parallel for better performance
      const [perks, credits, multipliers] = await Promise.all([
        apiCache.get(CACHE_KEYS.COMPONENTS_PERKS, async () => {
          const headers = await getAuthHeaders();
          const url = `${apiurl}/users/cards/components/perks`;
          const response = await axios.get<{ perks: CardPerk[] }>(url, { headers });
          return response.data.perks;
        }, { forceRefresh }),
        apiCache.get(CACHE_KEYS.COMPONENTS_CREDITS, async () => {
          const headers = await getAuthHeaders();
          const url = `${apiurl}/users/cards/components/credits`;
          const response = await axios.get<{ credits: CardCredit[] }>(url, { headers });
          return response.data.credits;
        }, { forceRefresh }),
        apiCache.get(CACHE_KEYS.COMPONENTS_MULTIPLIERS, async () => {
          const headers = await getAuthHeaders();
          const url = `${apiurl}/users/cards/components/multipliers`;
          const response = await axios.get<{ multipliers: CardMultiplier[] }>(url, { headers });
          return response.data.multipliers;
        }, { forceRefresh })
      ]);

      return {
        perks,
        credits,
        multipliers
      };
    }, { forceRefresh });
  },

  /**
   * Clear all component caches - useful when user's card selection changes
   */
  clearCache(): void {
    apiCache.invalidatePattern('components_');
  }
};

export default ComponentService;