import axios from 'axios';
import { apiurl, getAuthHeaders } from './index';
import { CardPerk, CardCredit, CardMultiplier } from '../types';

/**
 * Service for fetching credit card components (perks, credits, multipliers)
 * for the authenticated user's selected cards
 */
export const ComponentService = {
  /**
   * Fetch all perks for the user's selected credit cards
   */
  async fetchUserCardPerks(): Promise<CardPerk[]> {
    const headers = await getAuthHeaders();
    const url = `${apiurl}/users/cards/components/perks`;
    const response = await axios.get<{ perks: CardPerk[] }>(url, { headers });
    return response.data.perks;
  },

  /**
   * Fetch all credits for the user's selected credit cards
   */
  async fetchUserCardCredits(): Promise<CardCredit[]> {
    const headers = await getAuthHeaders();
    const url = `${apiurl}/users/cards/components/credits`;
    const response = await axios.get<{ credits: CardCredit[] }>(url, { headers });
    return response.data.credits;
  },

  /**
   * Fetch all multipliers for the user's selected credit cards
   */
  async fetchUserCardMultipliers(): Promise<CardMultiplier[]> {
    const headers = await getAuthHeaders();
    const url = `${apiurl}/users/cards/components/multipliers`;
    const response = await axios.get<{ multipliers: CardMultiplier[] }>(url, { headers });
    return response.data.multipliers;
  },

  /**
   * Fetch all components (perks, credits, multipliers) for the user's selected cards
   * Returns a combined object with all three component types
   */
  async fetchAllUserCardComponents(): Promise<{
    perks: CardPerk[];
    credits: CardCredit[];
    multipliers: CardMultiplier[];
  }> {
    // Execute all three requests in parallel for better performance
    const [perks, credits, multipliers] = await Promise.all([
      this.fetchUserCardPerks(),
      this.fetchUserCardCredits(),
      this.fetchUserCardMultipliers()
    ]);

    return {
      perks,
      credits,
      multipliers
    };
  }
};

export default ComponentService;