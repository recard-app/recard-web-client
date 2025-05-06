export const PLACEHOLDER_CARD_IMAGE = 'https://placehold.co/20x20';
export const PLACEHOLDER_ASSISTANT_IMAGE = 'https://placehold.co/40x40';
export const HISTORY_PAGE_SIZE = 20;
export const RECOMMENDED_MAX_CHAT_MESSAGES = 20;

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