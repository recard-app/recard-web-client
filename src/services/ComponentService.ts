import axios from 'axios';
import { apiurl, getAuthHeaders } from './index';
import { CardPerk, CardCredit, CardMultiplier, EnrichedMultiplier, AllowedCategoryEntry, UserMultiplierSelections } from '../types';
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
   * Returns enriched multipliers with schedule and selection data
   */
  async fetchUserCardMultipliers(): Promise<EnrichedMultiplier[]> {
    return apiCache.get(CACHE_KEYS.COMPONENTS_MULTIPLIERS, async () => {
      const headers = await getAuthHeaders();
      const url = `${apiurl}/users/cards/components/multipliers`;
      const response = await axios.get<{ multipliers: EnrichedMultiplier[] }>(url, { headers });
      return response.data.multipliers;
    });
  },

  /**
   * Fetch allowed categories for a selectable multiplier
   */
  async fetchAllowedCategories(multiplierId: string): Promise<AllowedCategoryEntry[]> {
    const headers = await getAuthHeaders();
    const url = `${apiurl}/users/cards/components/multipliers/${multiplierId}/allowed-categories`;
    const response = await axios.get<{ multiplierId: string; allowedCategories: AllowedCategoryEntry[] }>(url, { headers });
    return response.data.allowedCategories;
  },

  /**
   * Update user's category selection for a selectable multiplier
   */
  async updateMultiplierSelection(multiplierId: string, selectedCategoryId: string): Promise<{
    success: boolean;
    multiplierId: string;
    selectedCategoryId: string;
    updatedAt: string;
  }> {
    const headers = await getAuthHeaders();
    const url = `${apiurl}/users/cards/components/multipliers/${multiplierId}/selection`;
    const response = await axios.put(url, { selectedCategoryId }, { headers });
    // Invalidate the multipliers cache to refresh data
    apiCache.invalidate(CACHE_KEYS.COMPONENTS_MULTIPLIERS);
    apiCache.invalidate(CACHE_KEYS.COMPONENTS_ALL);
    return response.data;
  },

  /**
   * Fetch all multiplier selections for the user
   */
  async fetchMultiplierSelections(): Promise<UserMultiplierSelections> {
    const headers = await getAuthHeaders();
    const url = `${apiurl}/users/cards/components/multipliers/selections`;
    const response = await axios.get<{ selections: UserMultiplierSelections }>(url, { headers });
    return response.data.selections;
  },

  /**
   * Fetch all components (perks, credits, multipliers) for the user's selected cards
   * Returns a combined object with all three component types
   * @param forceRefresh - If true, bypasses cache and fetches fresh data
   */
  async fetchAllUserCardComponents(forceRefresh: boolean = false): Promise<{
    perks: CardPerk[];
    credits: CardCredit[];
    multipliers: EnrichedMultiplier[];
  }> {
    return apiCache.get(CACHE_KEYS.COMPONENTS_ALL, async () => {
      const headers = await getAuthHeaders();
      const query = new URLSearchParams({
        types: 'perk,credit,multiplier',
        limit: '100',
        onlyActive: 'true',
        excludeDisabled: 'true'
      });
      const v1Url = `${apiurl}/api/v1/users/components?${query.toString()}`;

      const response = await axios.get<{
        data?: {
          perks?: CardPerk[];
          credits?: CardCredit[];
          multipliers?: EnrichedMultiplier[];
        };
      }>(v1Url, { headers });

      const perks = response.data?.data?.perks ?? [];
      const credits = response.data?.data?.credits ?? [];
      let multipliers = response.data?.data?.multipliers ?? [];

      // Transitional safety: if v1 response lacks enriched multiplier fields,
      // fall back to legacy enriched multipliers endpoint to preserve UI behavior.
      const needsLegacyMultiplierFallback = multipliers.some(multiplier => {
        if (multiplier.multiplierType === 'rotating') {
          return !Array.isArray(multiplier.currentSchedules);
        }
        if (multiplier.multiplierType === 'selectable') {
          const hasUserSelectedCategoryField = Object.prototype.hasOwnProperty.call(multiplier, 'userSelectedCategory');
          return !Array.isArray(multiplier.allowedCategories) || !hasUserSelectedCategoryField;
        }
        return false;
      });

      if (needsLegacyMultiplierFallback) {
        const legacyMultipliersUrl = `${apiurl}/users/cards/components/multipliers`;
        const legacyResponse = await axios.get<{ multipliers: EnrichedMultiplier[] }>(legacyMultipliersUrl, { headers });
        multipliers = legacyResponse.data.multipliers;
      }

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
