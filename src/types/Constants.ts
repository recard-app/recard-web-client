/**
 * ------------------------------------------------------------------------------------------------
 * 
 * SHARED CONSTANTS
 * 
 * ------------------------------------------------------------------------------------------------
 */

export const CHAT_DESCRIPTION_MAX_LENGTH = 40;

export const CHAT_SOURCE = {
    USER: 'user',
    ASSISTANT: 'assistant',
    DEVELOPER: 'developer'
} as const;
export type ChatSourceType = typeof CHAT_SOURCE[keyof typeof CHAT_SOURCE];

export const CHAT_HISTORY_PREFERENCE = {
    KEEP_HISTORY: 'keep_history',
    DO_NOT_TRACK_HISTORY: 'do_not_track_history'
} as const;
export type ChatHistoryPreferenceType = typeof CHAT_HISTORY_PREFERENCE[keyof typeof CHAT_HISTORY_PREFERENCE];

export const SUBSCRIPTION_PLAN = {
    FREE: 'free',
    PREMIUM: 'premium'
} as const;
export type SubscriptionPlanType = typeof SUBSCRIPTION_PLAN[keyof typeof SUBSCRIPTION_PLAN];

/**
 * ------------------------------------------------------------------------------------------------
 * 
 * CLIENT CONSTANTS
 * 
 * ------------------------------------------------------------------------------------------------
 */

export const APP_NAME = 'ReCard';
export const PLACEHOLDER_CARD_IMAGE = 'https://placehold.co/20x20';
export const PLACEHOLDER_ASSISTANT_IMAGE = 'https://placehold.co/40x40';
export const HISTORY_PAGE_SIZE = 20;
export const RECOMMENDED_MAX_CHAT_MESSAGES = 20;
export const GLOBAL_QUICK_HISTORY_SIZE = 3;
export const CHAT_MAX_FIELD_HEIGHT = 250;

export const NO_DISPLAY_NAME_PLACEHOLDER = 'Guest';
export const PLACEHOLDER_PROFILE_IMAGE = 'http://localhost:5173/account.png';
export const DEFAULT_CHAT_NAME_PLACEHOLDER = 'New Transaction Chat';

export const TEMP_ICON = 'https://placehold.co/20x20';
export const DROPDOWN_ICON = 'https://placehold.co/16x16';

export interface MonthOption {
    value: number;
    label: string;
}
export const MONTH_OPTIONS: MonthOption[] = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
] as const;

export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const MONTH_ABBREVIATIONS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;