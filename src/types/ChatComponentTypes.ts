/**
 * Chat Component Types
 *
 * Defines all types for the chat thread component system that displays
 * cards, credits, perks, and multipliers inline after chat messages.
 *
 * Note: These types use simplified interfaces that match the backend's
 * hydrated component format, not the full CreditCard/CardCredit/etc types.
 */

import { CreditUsageType } from './CardCreditsTypes';

// =============================================================================
// SIMPLIFIED COMPONENT DATA TYPES (matches backend hydration format)
// =============================================================================

/**
 * Simplified card data for chat component display
 * Contains only the fields returned by backend hydration
 */
export interface ChatComponentCard {
  id: string;
  CardName: string;
  CardIssuer?: string;
  CardNetwork?: string;
  RewardsCurrency?: string;
  CardPrimaryColor: string;
  CardSecondaryColor: string;
  AnnualFee?: number;
  frozen?: boolean;
  preferred?: boolean;
}

/**
 * Simplified credit definition for chat component display
 */
export interface ChatComponentCredit {
  id: string;
  Title: string;
  Value: number;
  TimePeriod: string;
  Description?: string;
}

/**
 * Simplified user credit tracking data for chat component display
 */
export interface ChatComponentUserCredit {
  isAnniversaryBased?: boolean;
  AssociatedPeriod: string;
}

/**
 * Simplified perk data for chat component display
 */
export interface ChatComponentPerk {
  id: string;
  Title: string;
  Description?: string;
}

/**
 * Simplified multiplier data for chat component display
 */
export interface ChatComponentMultiplier {
  id: string;
  Name: string;
  Category: string;
  SubCategory?: string;
  Multiplier: number | null;
  Description?: string;
}

// =============================================================================
// COMPONENT TYPE DISCRIMINATORS
// =============================================================================

export const CHAT_COMPONENT_TYPES = {
  CARD: 'card',
  CREDIT: 'credit',
  PERK: 'perk',
  MULTIPLIER: 'multiplier'
} as const;

export type ChatComponentType = typeof CHAT_COMPONENT_TYPES[keyof typeof CHAT_COMPONENT_TYPES];

// =============================================================================
// ACTION TYPE DISCRIMINATORS
// =============================================================================

// Card Actions
export const CARD_ACTION_TYPES = {
  ADD: 'add',
  REMOVE: 'remove',
  SET_PREFERRED: 'set_preferred',
  FROZEN: 'frozen',
  UNFROZEN: 'unfrozen',
  ACTIVATION: 'activation',
  SET_OPEN_DATE: 'set_open_date'
} as const;

export type CardActionType = typeof CARD_ACTION_TYPES[keyof typeof CARD_ACTION_TYPES];

// Credit Actions
export const CREDIT_ACTION_TYPES = {
  UPDATE_USAGE: 'update_usage'
} as const;

export type CreditActionType = typeof CREDIT_ACTION_TYPES[keyof typeof CREDIT_ACTION_TYPES];

// Perk Actions
export const PERK_ACTION_TYPES = {
  TRACK: 'track',
  UNTRACK: 'untrack'
} as const;

export type PerkActionType = typeof PERK_ACTION_TYPES[keyof typeof PERK_ACTION_TYPES];

// Multiplier Actions
export const MULTIPLIER_ACTION_TYPES = {
  TRACK: 'track',
  UNTRACK: 'untrack'
} as const;

export type MultiplierActionType = typeof MULTIPLIER_ACTION_TYPES[keyof typeof MULTIPLIER_ACTION_TYPES];

// Union of all action types
export type ChatComponentActionType =
  | CardActionType
  | CreditActionType
  | PerkActionType
  | MultiplierActionType;

// =============================================================================
// ACTION DATA INTERFACES
// =============================================================================

/**
 * Base action interface - all actions extend this
 */
interface BaseChatComponentAction {
  id: string;
  timestamp: string;
  isUndone: boolean;
}

/**
 * Card action data
 * - Binary actions: add, remove, set_preferred, frozen, unfrozen, activation
 * - Value action: set_open_date (stores the new date)
 */
export interface CardAction extends BaseChatComponentAction {
  componentType: typeof CHAT_COMPONENT_TYPES.CARD;
  actionType: CardActionType;
  cardId: string;
  /** For set_open_date: the new date value (MM/DD/YYYY format) */
  newValue?: string;
  /** For set_preferred: the previous preferred card ID (null if no card was previously preferred) */
  previousPreferredCardId?: string | null;
  /** For set_open_date: the previous open date value (null if no date was previously set) */
  previousOpenDate?: string | null;
}

/**
 * Credit action data
 * - Non-binary: shows "from $X to $Y" format
 * - Status is derived from value (0 = not_used, max = used)
 *
 * Anniversary-Based Credits:
 * When isAnniversaryBased is true, the credit period is based on the user's card
 * open date rather than calendar year boundaries. Anniversary credits are always annual
 * (one period per year). The anniversaryDate and anniversaryYear fields specify when
 * this credit cycle started.
 */
export interface CreditAction extends BaseChatComponentAction {
  componentType: typeof CHAT_COMPONENT_TYPES.CREDIT;
  actionType: CreditActionType;
  cardId: string;
  creditId: string;
  periodNumber: number;
  /** Year the action applies to (calendar year or anniversaryYear) */
  year: number;
  /** Period type for display formatting (e.g., 'monthly', 'quarterly') */
  periodType?: string;
  /** Previous value before the action */
  fromValue: number;
  /** New value after the action */
  toValue: number;
  /** Previous usage status (derived, for display reference) */
  fromUsage?: CreditUsageType;
  /** New usage status (derived, for display reference) */
  toUsage?: CreditUsageType;
  /** True if this is an anniversary-based credit */
  isAnniversaryBased?: boolean;
  /** For anniversary credits: MM-DD format (e.g., "03-15") */
  anniversaryDate?: string;
}

/**
 * Perk action data - binary track/untrack
 */
export interface PerkAction extends BaseChatComponentAction {
  componentType: typeof CHAT_COMPONENT_TYPES.PERK;
  actionType: PerkActionType;
  cardId: string;
  perkId: string;
}

/**
 * Multiplier action data - binary track/untrack
 */
export interface MultiplierAction extends BaseChatComponentAction {
  componentType: typeof CHAT_COMPONENT_TYPES.MULTIPLIER;
  actionType: MultiplierActionType;
  cardId: string;
  multiplierId: string;
}

/** Discriminated union of all action types */
export type ChatComponentAction =
  | CardAction
  | CreditAction
  | PerkAction
  | MultiplierAction;

// =============================================================================
// COMPONENT ITEM INTERFACES
// =============================================================================

/**
 * Base item interface for a single displayable component
 */
interface BaseChatComponentItem {
  id: string;
  /** Order in which item appears (conversation order) */
  displayOrder: number;
}

/**
 * Card component item
 */
export interface CardComponentItem extends BaseChatComponentItem {
  componentType: typeof CHAT_COMPONENT_TYPES.CARD;
  /** Card data for display (simplified format from backend) */
  card: ChatComponentCard;
  /** Optional action that was performed */
  action?: CardAction;
}

/**
 * Credit component item
 */
export interface CreditComponentItem extends BaseChatComponentItem {
  componentType: typeof CHAT_COMPONENT_TYPES.CREDIT;
  /** User's credit tracking data (simplified format from backend) */
  userCredit: ChatComponentUserCredit;
  /** Credit definition from card (simplified format from backend) */
  cardCredit: ChatComponentCredit;
  /** Parent card for display (simplified format from backend) */
  card: ChatComponentCard;
  /** Maximum value of the credit (for $X / $Y display) */
  creditMaxValue: number;
  /** Current value used */
  currentValueUsed: number;
  /** Optional action that was performed */
  action?: CreditAction;
}

/**
 * Perk component item
 */
export interface PerkComponentItem extends BaseChatComponentItem {
  componentType: typeof CHAT_COMPONENT_TYPES.PERK;
  /** Perk data (simplified format from backend) */
  perk: ChatComponentPerk;
  /** Parent card for display (simplified format from backend) */
  card: ChatComponentCard;
  /** Optional action that was performed */
  action?: PerkAction;
}

/**
 * Multiplier component item
 */
export interface MultiplierComponentItem extends BaseChatComponentItem {
  componentType: typeof CHAT_COMPONENT_TYPES.MULTIPLIER;
  /** Multiplier data with category info (simplified format from backend) */
  multiplier: ChatComponentMultiplier;
  /** Parent card for display (simplified format from backend) */
  card: ChatComponentCard;
  /** Optional action that was performed */
  action?: MultiplierAction;
}

/** Discriminated union of all component item types */
export type ChatComponentItem =
  | CardComponentItem
  | CreditComponentItem
  | PerkComponentItem
  | MultiplierComponentItem;

// =============================================================================
// CONTENT BLOCK INTERFACE
// =============================================================================

/**
 * A chat component block that appears after a message
 * Contains one or more items of potentially mixed types
 */
export interface ChatComponentBlock {
  id: string;
  /** ID of the message this block is associated with */
  messageId: string;
  timestamp: string;
  /** Array of component items in display order */
  items: ChatComponentItem[];
}

// =============================================================================
// ACTION DISPLAY HELPERS
// =============================================================================

/**
 * Human-readable labels for card actions
 */
export const CARD_ACTION_DISPLAY_LABELS: Record<CardActionType, string> = {
  [CARD_ACTION_TYPES.ADD]: 'Added to wallet',
  [CARD_ACTION_TYPES.REMOVE]: 'Removed from wallet',
  [CARD_ACTION_TYPES.SET_PREFERRED]: 'Set as preferred',
  [CARD_ACTION_TYPES.FROZEN]: 'Frozen',
  [CARD_ACTION_TYPES.UNFROZEN]: 'Unfrozen',
  [CARD_ACTION_TYPES.ACTIVATION]: 'Activated',
  [CARD_ACTION_TYPES.SET_OPEN_DATE]: 'Set open date'
};

/**
 * Human-readable labels for perk actions
 */
export const PERK_ACTION_DISPLAY_LABELS: Record<PerkActionType, string> = {
  [PERK_ACTION_TYPES.TRACK]: 'Now tracking',
  [PERK_ACTION_TYPES.UNTRACK]: 'Stopped tracking'
};

/**
 * Human-readable labels for multiplier actions
 */
export const MULTIPLIER_ACTION_DISPLAY_LABELS: Record<MultiplierActionType, string> = {
  [MULTIPLIER_ACTION_TYPES.TRACK]: 'Now tracking',
  [MULTIPLIER_ACTION_TYPES.UNTRACK]: 'Stopped tracking'
};

/**
 * Get month name from period number for monthly credits
 */
function getMonthName(periodNumber: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[periodNumber - 1] || `Period ${periodNumber}`;
}

/**
 * Get quarter name from period number
 */
function getQuarterName(periodNumber: number): string {
  return `Q${periodNumber}`;
}

/**
 * Format anniversary date from MM-DD to display format (e.g., "Mar 15")
 */
function formatAnniversaryDateShort(anniversaryDate: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  try {
    // Handle both MM-DD and MM/DD formats
    const [month, day] = anniversaryDate.includes('-')
      ? anniversaryDate.split('-').map(Number)
      : anniversaryDate.split('/').map(Number);
    if (month >= 1 && month <= 12) {
      return `${months[month - 1]} ${day}`;
    }
  } catch {
    // Fall through to default
  }
  return anniversaryDate;
}

/**
 * Format period display text based on period type
 * @param periodNumber - The period number (1-12 for monthly, 1-4 for quarterly, etc.)
 * @param periodType - The period type (monthly, quarterly, semiannually, annually, anniversary)
 * @param year - The year for the period
 * @param isAnniversaryBased - True if this is an anniversary-based credit
 * @param anniversaryDate - For anniversary credits: MM-DD format (e.g., "03-15")
 */
export function formatPeriodText(
  periodNumber: number,
  periodType?: string,
  year?: number,
  isAnniversaryBased?: boolean,
  anniversaryDate?: string
): string {
  // Handle anniversary-based credits
  if (isAnniversaryBased) {
    // If we have the anniversary date, show a more descriptive format
    if (anniversaryDate && year) {
      const dateDisplay = formatAnniversaryDateShort(anniversaryDate);
      return `${dateDisplay}, ${year}`;
    }
    // Fall back to just the year with "Year" prefix to distinguish from calendar
    if (year) {
      return `Year ${year}`;
    }
    return 'Anniversary';
  }

  let periodText: string;

  switch (periodType?.toLowerCase()) {
    case 'monthly':
      periodText = getMonthName(periodNumber);
      break;
    case 'quarterly':
      periodText = getQuarterName(periodNumber);
      break;
    case 'semiannually':
      periodText = periodNumber === 1 ? 'H1' : 'H2';
      break;
    case 'annually':
      periodText = 'Annual';
      break;
    default:
      periodText = `Period ${periodNumber}`;
  }

  if (year) {
    return `${periodText} ${year}`;
  }
  return periodText;
}

/**
 * Format credit action display text
 * @example "Set from $1 to $6 (Jan 2025)"
 * @example "Set from $0 to $200 (Mar 15, 2024)" for anniversary credits
 */
export function formatCreditActionText(action: CreditAction): string {
  const valueText = `Set from $${action.fromValue} to $${action.toValue}`;
  const periodText = formatPeriodText(
    action.periodNumber,
    action.periodType,
    action.year,
    action.isAnniversaryBased,
    action.anniversaryDate
  );
  return `${valueText} (${periodText})`;
}

/**
 * Format card action display text
 * For set_open_date, includes the date value
 */
export function formatCardActionText(action: CardAction): string {
  if (action.actionType === CARD_ACTION_TYPES.SET_OPEN_DATE && action.newValue) {
    return `${CARD_ACTION_DISPLAY_LABELS[action.actionType]} to ${action.newValue}`;
  }
  return CARD_ACTION_DISPLAY_LABELS[action.actionType];
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isCardComponentItem(item: ChatComponentItem): item is CardComponentItem {
  return item.componentType === CHAT_COMPONENT_TYPES.CARD;
}

export function isCreditComponentItem(item: ChatComponentItem): item is CreditComponentItem {
  return item.componentType === CHAT_COMPONENT_TYPES.CREDIT;
}

export function isPerkComponentItem(item: ChatComponentItem): item is PerkComponentItem {
  return item.componentType === CHAT_COMPONENT_TYPES.PERK;
}

export function isMultiplierComponentItem(item: ChatComponentItem): item is MultiplierComponentItem {
  return item.componentType === CHAT_COMPONENT_TYPES.MULTIPLIER;
}

export function isCardAction(action: ChatComponentAction): action is CardAction {
  return action.componentType === CHAT_COMPONENT_TYPES.CARD;
}

export function isCreditAction(action: ChatComponentAction): action is CreditAction {
  return action.componentType === CHAT_COMPONENT_TYPES.CREDIT;
}

export function isPerkAction(action: ChatComponentAction): action is PerkAction {
  return action.componentType === CHAT_COMPONENT_TYPES.PERK;
}

export function isMultiplierAction(action: ChatComponentAction): action is MultiplierAction {
  return action.componentType === CHAT_COMPONENT_TYPES.MULTIPLIER;
}
