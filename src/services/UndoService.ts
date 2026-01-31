import axios from 'axios';
import { apiurl, getAuthHeaders } from './index';
import { apiCache, CACHE_KEYS } from '../utils/ApiCache';
import {
  ChatComponentAction,
  CardAction,
  CreditAction,
  PerkAction,
  MultiplierAction,
  isCardAction,
  isCreditAction,
  isPerkAction,
  isMultiplierAction,
  CARD_ACTION_TYPES,
  CREDIT_ACTION_TYPES,
  PERK_ACTION_TYPES,
  MULTIPLIER_ACTION_TYPES,
  CHAT_COMPONENT_TYPES,
} from '../types/ChatComponentTypes';

/**
 * Result of an undo operation
 */
export interface UndoResult {
  success: boolean;
  action: ChatComponentAction;
  error?: string;
}

/**
 * Service responsible for executing undo operations on chat component actions
 */
export const UndoService = {
  /**
   * Main entry point for undoing an action
   */
  async undoAction(action: ChatComponentAction): Promise<UndoResult> {
    try {
      if (isCardAction(action)) {
        return await this.undoCardAction(action);
      }
      if (isCreditAction(action)) {
        return await this.undoCreditAction(action);
      }
      if (isPerkAction(action)) {
        return await this.undoPerkAction(action);
      }
      if (isMultiplierAction(action)) {
        return await this.undoMultiplierAction(action);
      }

      return {
        success: false,
        action,
        error: 'Unknown action type',
      };
    } catch (error) {
      return {
        success: false,
        action,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Undo a card action
   */
  async undoCardAction(action: CardAction): Promise<UndoResult> {
    const headers = await getAuthHeaders();

    switch (action.actionType) {
      case CARD_ACTION_TYPES.ADD:
        return await this.undoCardAdd(action, headers);
      case CARD_ACTION_TYPES.REMOVE:
        return await this.undoCardRemove(action, headers);
      case CARD_ACTION_TYPES.SET_PREFERRED:
        return await this.undoSetPreferred(action, headers);
      case CARD_ACTION_TYPES.FROZEN:
      case CARD_ACTION_TYPES.UNFROZEN:
        return await this.undoFrozenStatus(action, headers);
      case CARD_ACTION_TYPES.SET_OPEN_DATE:
        return await this.undoSetOpenDate(action, headers);
      case CARD_ACTION_TYPES.ACTIVATION:
        // Activation is typically not undoable
        return {
          success: false,
          action,
          error: 'Activation cannot be undone',
        };
      default:
        return {
          success: false,
          action,
          error: 'Unknown card action type',
        };
    }
  },

  /**
   * Undo card add (remove the card)
   */
  async undoCardAdd(action: CardAction, headers: Record<string, string>): Promise<UndoResult> {
    try {
      // Use V1 endpoint to remove the card
      await axios.delete(
        `${apiurl}/api/v1/users/cards`,
        {
          headers: { ...headers, 'Content-Type': 'application/json' },
          data: { cardIds: [action.cardId] }
        }
      );

      // Invalidate caches
      this.invalidateCardCaches();

      return { success: true, action };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to remove card';
      return {
        success: false,
        action,
        error: errorMessage,
      };
    }
  },

  /**
   * Undo card remove (re-add the card)
   */
  async undoCardRemove(action: CardAction, headers: Record<string, string>): Promise<UndoResult> {
    try {
      // Use V1 endpoint to add the card back
      await axios.post(
        `${apiurl}/api/v1/users/cards`,
        { cardIds: [action.cardId] },
        { headers: { ...headers, 'Content-Type': 'application/json' } }
      );

      // Invalidate caches
      this.invalidateCardCaches();

      return { success: true, action };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to re-add card';
      return {
        success: false,
        action,
        error: errorMessage,
      };
    }
  },

  /**
   * Undo set preferred
   */
  async undoSetPreferred(action: CardAction, headers: Record<string, string>): Promise<UndoResult> {
    try {
      const previousCardId = action.previousPreferredCardId;

      // If previousPreferredCardId is null, unset the current card as preferred
      if (previousCardId === null || previousCardId === undefined) {
        await axios.patch(
          `${apiurl}/api/v1/users/cards/${action.cardId}/preferred`,
          { preferred: false },
          { headers: { ...headers, 'Content-Type': 'application/json' } }
        );
      } else {
        // Set the previous card as preferred
        await axios.patch(
          `${apiurl}/api/v1/users/cards/${previousCardId}/preferred`,
          { preferred: true },
          { headers: { ...headers, 'Content-Type': 'application/json' } }
        );
      }

      // Invalidate caches
      this.invalidateCardCaches();

      return { success: true, action };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to restore preferred card';
      return {
        success: false,
        action,
        error: errorMessage,
      };
    }
  },

  /**
   * Undo frozen/unfrozen status
   */
  async undoFrozenStatus(action: CardAction, headers: Record<string, string>): Promise<UndoResult> {
    try {
      // frozen -> unfreeze, unfrozen -> freeze
      const newFrozenState = action.actionType === CARD_ACTION_TYPES.FROZEN ? false : true;

      // Use V1 endpoint
      await axios.patch(
        `${apiurl}/api/v1/users/cards/${action.cardId}/frozen`,
        { frozen: newFrozenState },
        { headers: { ...headers, 'Content-Type': 'application/json' } }
      );

      // Invalidate caches
      this.invalidateCardCaches();

      return { success: true, action };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to update frozen status';
      return {
        success: false,
        action,
        error: errorMessage,
      };
    }
  },

  /**
   * Undo set open date
   */
  async undoSetOpenDate(action: CardAction, headers: Record<string, string>): Promise<UndoResult> {
    try {
      // Use V1 endpoint
      await axios.patch(
        `${apiurl}/api/v1/users/cards/${action.cardId}/open-date`,
        { openDate: action.previousOpenDate ?? null },
        { headers: { ...headers, 'Content-Type': 'application/json' } }
      );

      // Invalidate caches
      this.invalidateCardCaches();

      return { success: true, action };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to restore open date';
      return {
        success: false,
        action,
        error: errorMessage,
      };
    }
  },

  /**
   * Undo a credit action (usage update or tracking toggle)
   */
  async undoCreditAction(action: CreditAction): Promise<UndoResult> {
    try {
      const headers = await getAuthHeaders();

      // Handle tracking actions (track/untrack)
      if (action.actionType === CREDIT_ACTION_TYPES.TRACK || action.actionType === CREDIT_ACTION_TYPES.UNTRACK) {
        // track -> disabled: true, untrack -> disabled: false
        const disabled = action.actionType === CREDIT_ACTION_TYPES.TRACK;

        await axios.patch(
          `${apiurl}/api/v1/users/components/${action.creditId}/tracking`,
          {
            cardId: action.cardId,
            componentType: CHAT_COMPONENT_TYPES.CREDIT,
            disabled,
          },
          { headers: { ...headers, 'Content-Type': 'application/json' } }
        );

        // Invalidate component preferences cache
        apiCache.invalidate(CACHE_KEYS.COMPONENT_TRACKING_PREFERENCES);

        return { success: true, action };
      }

      // Handle usage update actions
      // Derive status from fromValue (the value we're restoring to)
      // 0 = not_used, partial = partially_used, full = used
      // Note: We can't know the max value here, so we use partially_used for any non-zero value
      // and let the server handle validation
      let status: 'not_used' | 'partially_used' | 'used';
      if (action.fromValue === 0) {
        status = 'not_used';
      } else {
        // Use partially_used with the specific amount
        status = 'partially_used';
      }

      // Use V1 endpoint
      await axios.patch(
        `${apiurl}/api/v1/users/credits/${action.creditId}/usage`,
        {
          year: action.year,
          periodNumber: action.periodNumber,
          status,
          amountUsed: action.fromValue,
        },
        { headers: { ...headers, 'Content-Type': 'application/json' } }
      );

      return { success: true, action };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to restore credit';
      return {
        success: false,
        action,
        error: errorMessage,
      };
    }
  },

  /**
   * Undo a perk action
   */
  async undoPerkAction(action: PerkAction): Promise<UndoResult> {
    try {
      const headers = await getAuthHeaders();

      // track -> disabled: true, untrack -> disabled: false
      const disabled = action.actionType === PERK_ACTION_TYPES.TRACK;

      // Use V1 endpoint
      await axios.patch(
        `${apiurl}/api/v1/users/components/${action.perkId}/tracking`,
        {
          cardId: action.cardId,
          componentType: CHAT_COMPONENT_TYPES.PERK,
          disabled,
        },
        { headers: { ...headers, 'Content-Type': 'application/json' } }
      );

      // Invalidate component preferences cache
      apiCache.invalidate(CACHE_KEYS.COMPONENT_TRACKING_PREFERENCES);

      return { success: true, action };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to update perk tracking';
      return {
        success: false,
        action,
        error: errorMessage,
      };
    }
  },

  /**
   * Undo a multiplier action
   */
  async undoMultiplierAction(action: MultiplierAction): Promise<UndoResult> {
    try {
      const headers = await getAuthHeaders();

      // track -> disabled: true, untrack -> disabled: false
      const disabled = action.actionType === MULTIPLIER_ACTION_TYPES.TRACK;

      // Use V1 endpoint
      await axios.patch(
        `${apiurl}/api/v1/users/components/${action.multiplierId}/tracking`,
        {
          cardId: action.cardId,
          componentType: CHAT_COMPONENT_TYPES.MULTIPLIER,
          disabled,
        },
        { headers: { ...headers, 'Content-Type': 'application/json' } }
      );

      // Invalidate component preferences cache
      apiCache.invalidate(CACHE_KEYS.COMPONENT_TRACKING_PREFERENCES);

      return { success: true, action };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to update multiplier tracking';
      return {
        success: false,
        action,
        error: errorMessage,
      };
    }
  },

  /**
   * Persist the isUndone status to the server
   */
  async markActionAsUndone(
    chatId: string,
    actionId: string,
    isUndone: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const headers = await getAuthHeaders();

      await axios.patch(
        `${apiurl}/users/history/${chatId}/actions/${actionId}`,
        { isUndone },
        { headers: { ...headers, 'Content-Type': 'application/json' } }
      );

      return { success: true };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to mark action as undone';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Invalidate card-related caches
   */
  invalidateCardCaches(): void {
    apiCache.invalidate(CACHE_KEYS.CREDIT_CARDS);
    apiCache.invalidate(CACHE_KEYS.CREDIT_CARDS_PREVIEWS);
    apiCache.invalidate(CACHE_KEYS.CREDIT_CARDS_DETAILS);
    apiCache.invalidate(CACHE_KEYS.USER_CARD_DETAILS);
    apiCache.invalidate(CACHE_KEYS.USER_CARD_DETAILS_FULL);
    apiCache.invalidate(CACHE_KEYS.USER_CARDS);
  },
};
