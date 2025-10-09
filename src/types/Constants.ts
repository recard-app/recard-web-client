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

export const ROLE_TYPE = {
    ADMIN: 'admin',
    WORKER: 'worker',
    USER: 'user'
} as const;
export type RoleType = typeof ROLE_TYPE[keyof typeof ROLE_TYPE];

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

export const MONTH_LABEL_ABBREVIATIONS: { value: number; label: string }[] = [
    { value: 1, label: 'Jan' },
    { value: 2, label: 'Feb' },
    { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' },
    { value: 5, label: 'May' },
    { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' },
    { value: 8, label: 'Aug' },
    { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' },
    { value: 11, label: 'Nov' },
    { value: 12, label: 'Dec' }
] as const;

/**
 * Credit expiration warning thresholds (in days before period ends)
 */
export const CREDIT_EXPIRATION_THRESHOLDS = {
    MONTHLY: 10,        // Within last 10 days of month
    QUARTERLY: 30,      // Within last 30 days of quarter
    SEMIANNUALLY: 45,   // Within last 45 days of half-year
    ANNUALLY: 60        // Within last 60 days of year
} as const;

/**
 * ------------------------------------------------------------------------------------------------
 *
 * CLIENT CONSTANTS
 *
 * ------------------------------------------------------------------------------------------------
 */

export const APP_NAME = 'ReCard';
export const APP_LOGO = '/temp_logo.png';
export const PLACEHOLDER_CARD_IMAGE = 'https://placehold.co/20x20';
export const PLACEHOLDER_ASSISTANT_IMAGE = '/temp_avatar.png';
export const HISTORY_PAGE_SIZE = 20;
export const RECOMMENDED_MAX_CHAT_MESSAGES = 20;
export const GLOBAL_QUICK_HISTORY_SIZE = 3;
export const CHAT_MAX_FIELD_HEIGHT = 250;
export const SHOW_SUBSCRIPTION_MENTIONS = true;
export const SHOW_HEADER_ICONS = true;
export const FREE_PLAN_HISTORY_DAYS = 90;
export const MOBILE_BREAKPOINT = 780;

// Feature flags
export const DISABLE_DESKTOP_PERIOD_BAR = true;
export const DISABLE_MOBILE_CREDITS_STICKY_FOOTER = true;

export const NO_DISPLAY_NAME_PLACEHOLDER = 'Guest';
export const PLACEHOLDER_PROFILE_IMAGE = '/temp_account.png';
// Terminology toggle: set to 'chat' for Chat-centric wording, or 'transaction' for Transaction-centric wording
export type TerminologyMode = 'chat' | 'transaction';
export const TERMINOLOGY_MODE: TerminologyMode = 'chat';

export const TERMINOLOGY = {
    mode: TERMINOLOGY_MODE,
    nounSingular: TERMINOLOGY_MODE === 'chat' ? 'chat' : 'transaction',
    nounPlural: TERMINOLOGY_MODE === 'chat' ? 'chats' : 'transactions',
    historyTitle: TERMINOLOGY_MODE === 'chat' ? 'Previous Chats' : 'Transaction History',
    newChatButton: TERMINOLOGY_MODE === 'chat' ? 'New Chat' : 'New Transaction Chat',
    newChatAria: TERMINOLOGY_MODE === 'chat' ? 'Start new chat' : 'Start new transaction chat',
    recentSectionTitle: TERMINOLOGY_MODE === 'chat' ? 'Recent Chats' : 'Recent Transactions',
    loadingHistory: TERMINOLOGY_MODE === 'chat' ? 'Loading chat history...' : 'Loading transaction history...',
    emptyHistory: TERMINOLOGY_MODE === 'chat' ? 'No chat history available' : 'No transaction history available',
    emptyHistoryForPeriod: TERMINOLOGY_MODE === 'chat' ? 'No chat history available for this period' : 'No transaction history available for this period',
    promptHistoryLoading: TERMINOLOGY_MODE === 'chat' ? 'Loading chat history...' : 'Loading transaction chat history...',
    inlineNewChatReminder: TERMINOLOGY_MODE === 'chat' ? 'create a new chat' : 'create a new transaction chat',
} as const;

export const DEFAULT_CHAT_NAME_PLACEHOLDER = TERMINOLOGY.newChatButton;

export const TEMP_ICON = 'https://placehold.co/20x20';
export const DROPDOWN_ICON = 'https://placehold.co/16x16';
export const STAR_OUTLINE_ICON = 'https://placehold.co/16x16';
export const STAR_FILLED_ICON = 'https://placehold.co/16x16';

import { createIconVariant, Icon } from '../icons';
import React from 'react';
import { COLORS } from './Colors';

// Loading icon configuration
export const LOADING_ICON = (props: any = {}) => React.createElement(Icon, { name: 'spinner', variant: 'default', size: 12, ...props });
export const LOADING_ICON_SIZE = 12;

// Page names and navigation constants
export const PAGE_NAMES = {
    HOME: 'Home',
    TRANSACTION_HISTORY: TERMINOLOGY.historyTitle,
    MY_CARDS: 'My Cards', 
    MY_CREDITS: 'My Credits',
    NEW_TRANSACTION_CHAT: TERMINOLOGY.newChatButton,
    PREFERENCES: 'Preferences',
    MY_ACCOUNT: 'My Account',
    SIGN_OUT: 'Sign Out'
} as const;
export type PageNameType = typeof PAGE_NAMES[keyof typeof PAGE_NAMES];

export const ICON_WHITE = COLORS.NEUTRAL_WHITE;
export const ICON_GRAY = COLORS.NEUTRAL_MEDIUM_GRAY;
export const ICON_GRAY_DARK = COLORS.NEUTRAL_DARK_GRAY;
export const ICON_PRIMARY = COLORS.PRIMARY_COLOR;
export const ICON_PRIMARY_MEDIUM = COLORS.PRIMARY_MEDIUM;
export const ICON_PRIMARY_DARK = COLORS.PRIMARY_DARK;
export const ICON_RED = COLORS.ERROR;

export const SIDEBAR_TOGGLE_ICON_COLOR = ICON_GRAY;
export const SIDEBAR_TOGGLE_ICON_COLOR_HOVER = ICON_GRAY_DARK;

export const SIDEBAR_ACTIVE_ICON_COLOR = ICON_PRIMARY;
export const SIDEBAR_INACTIVE_ICON_COLOR = ICON_GRAY;

// Page icons with variant and color support
export const PAGE_ICONS = {
    HOME: {
        ACTIVE: (props: any = {}) => createIconVariant('home', 'solid', SIDEBAR_ACTIVE_ICON_COLOR, props.size),
        INACTIVE: (props: any = {}) => createIconVariant('home', 'outline', SIDEBAR_INACTIVE_ICON_COLOR, props.size),
        MINI: (props: any = {}) => createIconVariant('home', 'mini', ICON_PRIMARY, props.size)
    },
    TRANSACTION_HISTORY: {
        ACTIVE: (props: any = {}) => createIconVariant('conversation-bubbles', 'solid', SIDEBAR_ACTIVE_ICON_COLOR, props.size),
        INACTIVE: (props: any = {}) => createIconVariant('conversation-bubbles', 'outline', SIDEBAR_INACTIVE_ICON_COLOR, props.size),
        MINI: (props: any = {}) => createIconVariant('conversation-bubbles', 'mini', ICON_PRIMARY, props.size)
    },
    MY_CARDS: {
        ACTIVE: (props: any = {}) => createIconVariant('card', 'solid', SIDEBAR_ACTIVE_ICON_COLOR, props.size),
        INACTIVE: (props: any = {}) => createIconVariant('card', 'outline', SIDEBAR_INACTIVE_ICON_COLOR, props.size),
        MINI: (props: any = {}) => createIconVariant('card', 'mini', ICON_PRIMARY, props.size)
    },
    MY_CREDITS: {
        ACTIVE: (props: any = {}) => createIconVariant('banknotes', 'solid', SIDEBAR_ACTIVE_ICON_COLOR, props.size),
        INACTIVE: (props: any = {}) => createIconVariant('banknotes', 'outline', SIDEBAR_INACTIVE_ICON_COLOR, props.size),
        MINI: (props: any = {}) => createIconVariant('banknotes', 'mini', ICON_PRIMARY, props.size)
    },
    NEW_TRANSACTION_CHAT: TEMP_ICON,
    PREFERENCES: {
        ACTIVE: (props: any = {}) => createIconVariant('preferences', 'solid', SIDEBAR_ACTIVE_ICON_COLOR, props.size),
        INACTIVE: (props: any = {}) => createIconVariant('preferences', 'outline', SIDEBAR_INACTIVE_ICON_COLOR, props.size),
        MINI: (props: any = {}) => createIconVariant('preferences', 'mini', ICON_PRIMARY, props.size)
    },
    MY_ACCOUNT: {
        ACTIVE: (props: any = {}) => createIconVariant('account', 'solid', SIDEBAR_ACTIVE_ICON_COLOR, props.size),
        INACTIVE: (props: any = {}) => createIconVariant('account', 'outline', SIDEBAR_INACTIVE_ICON_COLOR, props.size),
        MINI: (props: any = {}) => createIconVariant('account', 'mini', ICON_PRIMARY, props.size)
    },
    SIGN_OUT: {
        ACTIVE: (props: any = {}) => createIconVariant('sign-out', 'solid', SIDEBAR_ACTIVE_ICON_COLOR, props.size),
        INACTIVE: (props: any = {}) => createIconVariant('sign-out', 'outline', SIDEBAR_INACTIVE_ICON_COLOR, props.size),
        MINI: (props: any = {}) => createIconVariant('sign-out', 'mini', ICON_GRAY, props.size)
    },
    DELETE_HISTORY: {
        ACTIVE: (props: any = {}) => createIconVariant('delete', 'solid', SIDEBAR_ACTIVE_ICON_COLOR, props.size),
        INACTIVE: (props: any = {}) => createIconVariant('delete', 'outline', SIDEBAR_INACTIVE_ICON_COLOR, props.size),
        MINI: (props: any = {}) => createIconVariant('delete', 'mini', ICON_PRIMARY, props.size)
    },
    LOGO: APP_LOGO,
    NEW_CHAT_PLUS: {
        NORMAL: (props: any = {}) => createIconVariant('plus-circle', 'solid', SIDEBAR_ACTIVE_ICON_COLOR, props.size),
        HOVERED: (props: any = {}) => createIconVariant('plus-circle', 'solid', ICON_PRIMARY_MEDIUM, props.size)
    }
} as const;

export type PageIconType = typeof PAGE_ICONS[keyof typeof PAGE_ICONS];

export const DROPDOWN_NORMAL_ICON_COLOR = ICON_GRAY;
export const DROPDOWN_RED_ICON_COLOR = ICON_RED;

// Dropdown icons with normal and red variants
export const DROPDOWN_ICONS = {
    PREFERENCES: {
        NORMAL: (props: any = {}) => createIconVariant('preferences', 'mini', DROPDOWN_NORMAL_ICON_COLOR, props.size),
        RED: (props: any = {}) => createIconVariant('preferences', 'mini', DROPDOWN_RED_ICON_COLOR, props.size)
    },
    MY_ACCOUNT: {
        NORMAL: (props: any = {}) => createIconVariant('account', 'mini', DROPDOWN_NORMAL_ICON_COLOR, props.size),
        RED: (props: any = {}) => createIconVariant('account', 'mini', DROPDOWN_RED_ICON_COLOR, props.size)
    },
    SIGN_OUT: {
        NORMAL: (props: any = {}) => createIconVariant('sign-out', 'mini', DROPDOWN_NORMAL_ICON_COLOR, props.size),
        RED: (props: any = {}) => createIconVariant('sign-out', 'mini', DROPDOWN_RED_ICON_COLOR, props.size)
    }
} as const;

export type DropdownIconType = typeof DROPDOWN_ICONS[keyof typeof DROPDOWN_ICONS];

export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const MONTH_ABBREVIATIONS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;

export const MONTH_LETTERS = [
    'J', 'F', 'M', 'A', 'M', 'J',
    'J', 'A', 'S', 'O', 'N', 'D'
] as const;

// Info component constants
export const INFO_COLORS = {
    DEFAULT: ICON_GRAY,
    ERROR: COLORS.INFO_ERROR_RED,
    INFO: COLORS.INFO_BLUE, 
    WARNING: COLORS.INFO_WARNING_ORANGE,
    SUCCESS: COLORS.INFO_SUCCESS_GREEN,
    LOADING: COLORS.INFO_LOADING_GRAY
} as const;

export const INFO_ICONS = {
    DEFAULT: '',
    ERROR: (props: any = {}) => createIconVariant('exclamation-triangle', 'mini', INFO_COLORS.ERROR, props.size),
    INFO: (props: any = {}) => createIconVariant('info-circle', 'mini', INFO_COLORS.INFO, props.size),
    WARNING: (props: any = {}) => createIconVariant('exclamation-triangle', 'mini', INFO_COLORS.WARNING, props.size),
    SUCCESS: (props: any = {}) => createIconVariant('check-circle', 'mini', INFO_COLORS.SUCCESS, props.size),
    LOADING: 'loading-spinner' // Special marker for component
} as const;

export const INFO_TITLES = {
    DEFAULT: '',
    ERROR: 'Error',
    INFO: 'Info',
    WARNING: 'Warning',
    SUCCESS: 'Success',
    LOADING: 'Loading'
} as const;

export const PLAN_DISPLAY_TEXT = {
    FREE: 'Free Plan',
    PREMIUM: 'Premium Plan'
} as const;