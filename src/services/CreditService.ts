import axios from 'axios';
import { apiurl, getAuthHeaders } from './index';
import { CardCredit } from '../types';

/**
 * Service for credit-related operations for cards
 */
export const CreditService = {
  /**
   * Fetch credits for a single card
   */
  async fetchCardCredits(cardId: string): Promise<CardCredit[]> {
    if (!cardId) throw new Error('cardId is required');
    const headers = await getAuthHeaders();
    const url = `${apiurl}/credit-cards/credits/${encodeURIComponent(cardId)}`;
    const response = await axios.get<CardCredit[]>(url, { headers });
    return response.data;
  },

  /**
   * Fetch credits for multiple cards by IDs
   */
  async fetchCreditsForCardIds(cardIds: string[]): Promise<CardCredit[]> {
    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      throw new Error('cardIds must be a non-empty array');
    }
    const headers = await getAuthHeaders();
    const url = `${apiurl}/credit-cards/credits/list`;
    const response = await axios.post<CardCredit[]>(url, { cardIds }, { headers });
    return response.data;
  },
};

export default CreditService;