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
    USER: 'user'
} as const;
export type RoleType = typeof ROLE_TYPE[keyof typeof ROLE_TYPE];

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
export const SHOW_SUBSCRIPTION_MENTIONS = true;
export const SHOW_HEADER_ICONS = true;
export const FREE_PLAN_HISTORY_DAYS = 90;

export const NO_DISPLAY_NAME_PLACEHOLDER = 'Guest';
export const PLACEHOLDER_PROFILE_IMAGE = 'http://localhost:5173/account.png';
export const DEFAULT_CHAT_NAME_PLACEHOLDER = 'New Transaction Chat';

export const TEMP_ICON = 'https://placehold.co/20x20';
export const DROPDOWN_ICON = 'https://placehold.co/16x16';
export const STAR_OUTLINE_ICON = 'https://placehold.co/16x16';
export const STAR_FILLED_ICON = 'https://placehold.co/16x16';

import { createIconVariant, Icon } from '../icons';
import React from 'react';

// Loading icon configuration
export const LOADING_ICON = (props: any = {}) => React.createElement(Icon, { name: 'spinner', variant: 'default', size: 12, ...props });
export const LOADING_ICON_SIZE = 12;

// Page names and navigation constants
export const PAGE_NAMES = {
    HOME: 'Home',
    TRANSACTION_HISTORY: 'Transaction History',
    MY_CARDS: 'My Cards', 
    NEW_TRANSACTION_CHAT: 'New Transaction Chat',
    PREFERENCES: 'Preferences',
    MY_ACCOUNT: 'My Account',
    SIGN_OUT: 'Sign Out'
} as const;
export type PageNameType = typeof PAGE_NAMES[keyof typeof PAGE_NAMES];

export const SIDEBAR_ACTIVE_ICON_COLOR = '#FFFFFF';
export const SIDEBAR_INACTIVE_ICON_COLOR = '#22CC9D';

// Page icons with variant and color support
export const PAGE_ICONS = {
    HOME: {
        ACTIVE: (props: any = {}) => createIconVariant('home', 'solid', SIDEBAR_ACTIVE_ICON_COLOR, props.size),
        INACTIVE: (props: any = {}) => createIconVariant('home', 'outline', SIDEBAR_INACTIVE_ICON_COLOR, props.size),
        MINI: (props: any = {}) => createIconVariant('home', 'mini', SIDEBAR_INACTIVE_ICON_COLOR, props.size)
    },
    TRANSACTION_HISTORY: {
        ACTIVE: (props: any = {}) => createIconVariant('history', 'solid', SIDEBAR_ACTIVE_ICON_COLOR, props.size),
        INACTIVE: (props: any = {}) => createIconVariant('history', 'outline', SIDEBAR_INACTIVE_ICON_COLOR, props.size),
        MINI: (props: any = {}) => createIconVariant('history', 'mini', SIDEBAR_INACTIVE_ICON_COLOR, props.size)
    },
    MY_CARDS: {
        ACTIVE: (props: any = {}) => createIconVariant('card', 'solid', SIDEBAR_ACTIVE_ICON_COLOR, props.size),
        INACTIVE: (props: any = {}) => createIconVariant('card', 'outline', SIDEBAR_INACTIVE_ICON_COLOR, props.size),
        MINI: (props: any = {}) => createIconVariant('card', 'mini', SIDEBAR_INACTIVE_ICON_COLOR, props.size)
    },
    NEW_TRANSACTION_CHAT: TEMP_ICON,
    PREFERENCES: {
        ACTIVE: (props: any = {}) => createIconVariant('preferences', 'solid', SIDEBAR_ACTIVE_ICON_COLOR, props.size),
        INACTIVE: (props: any = {}) => createIconVariant('preferences', 'outline', SIDEBAR_INACTIVE_ICON_COLOR, props.size),
        MINI: (props: any = {}) => createIconVariant('preferences', 'mini', SIDEBAR_INACTIVE_ICON_COLOR, props.size)
    },
    MY_ACCOUNT: {
        ACTIVE: (props: any = {}) => createIconVariant('account', 'solid', SIDEBAR_ACTIVE_ICON_COLOR, props.size),
        INACTIVE: (props: any = {}) => createIconVariant('account', 'outline', SIDEBAR_INACTIVE_ICON_COLOR, props.size),
        MINI: (props: any = {}) => createIconVariant('account', 'mini', SIDEBAR_INACTIVE_ICON_COLOR, props.size)
    },
    SIGN_OUT: {
        ACTIVE: (props: any = {}) => createIconVariant('sign-out', 'solid', SIDEBAR_ACTIVE_ICON_COLOR, props.size),
        INACTIVE: (props: any = {}) => createIconVariant('sign-out', 'outline', SIDEBAR_INACTIVE_ICON_COLOR, props.size),
        MINI: (props: any = {}) => createIconVariant('sign-out', 'mini', SIDEBAR_INACTIVE_ICON_COLOR, props.size)
    },
    LOGO: TEMP_ICON
} as const;

export type PageIconType = typeof PAGE_ICONS[keyof typeof PAGE_ICONS];

export const DROPDOWN_NORMAL_ICON_COLOR = '#5A5F66';
export const DROPDOWN_RED_ICON_COLOR = '#EF4444';

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

// Info component constants
export const INFO_COLORS = {
    ERROR: '#ff4444',
    INFO: '#2196F3', 
    WARNING: '#ff9800',
    SUCCESS: '#4caf50',
    LOADING: '#6b7280'
} as const;

export const INFO_ICONS = {
    ERROR: TEMP_ICON,
    INFO: TEMP_ICON,
    WARNING: TEMP_ICON,
    SUCCESS: TEMP_ICON,
    LOADING: 'loading-spinner' // Special marker for component
} as const;

export const INFO_TITLES = {
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