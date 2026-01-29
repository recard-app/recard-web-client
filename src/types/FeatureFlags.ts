/**
 * ------------------------------------------------------------------------------------------------
 *
 * FEATURE FLAGS
 *
 * Centralized feature flag constants for controlling UI behavior and feature rollouts.
 *
 * ------------------------------------------------------------------------------------------------
 */

// Show subscription-related mentions in the UI
export const SHOW_SUBSCRIPTION_MENTIONS = true;

// Show icons in page headers
export const SHOW_HEADER_ICONS = true;

// Disable the period bar on desktop credits display
export const DISABLE_DESKTOP_PERIOD_BAR = true;

// Disable the sticky footer on mobile credits display
export const DISABLE_MOBILE_CREDITS_STICKY_FOOTER = true;

// Always show the "Expiring Credits" section even when there are none
// If false, expiring credits section only shows when there are credits expiring
// This applies to both the sidebar and the credits page header
export const ALWAYS_SHOW_EXPIRING_CREDITS = false;

// Show the monthly credits stats and usage bar in the sidebar/menu for both mobile and desktop
// If false, only expiring credits will show in sidebar (when they exist)
// The MyCredits page header always shows monthly credits and usage bar regardless of this flag
export const SHOW_USAGE_BAR_IN_SIDEBAR_MENU = false;

// Show/hide the selected card display on history entry preview in the chat history list
export const SHOW_CARD_ON_HISTORY_ENTRY_PREVIEW = false;

// Show card name bubble in credits display
// TRUE: Shows card name in a bubble with period below (existing style)
// FALSE: Shows only card icon with period inline (e.g., "<icon> - Monthly"), no bubble border
export const SHOW_CARD_NAME_BUBBLE_IN_CREDITS = false;

// Move My Cards navigation from sidebar to account dropdown menu
// TRUE: My Cards appears in account dropdown menu (below Account & Settings, above Preferences)
// FALSE: My Cards appears in sidebar navigation (default behavior)
export const MY_CARDS_IN_ACCOUNT_MENU = true;
// Label for "My Cards" when displayed in account dropdown menu (when MY_CARDS_IN_ACCOUNT_MENU is true)
export const MY_CARDS_DROPDOWN_LABEL = 'Manage Cards';
