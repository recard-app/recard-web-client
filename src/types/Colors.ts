/**
 * Color constants for TypeScript/TSX files
 *
 * This file mirrors the colors defined in variables.scss but provides them
 * as TypeScript constants for use in React components and TypeScript files.
 *
 * Usage: COLORS.PRIMARY_LIGHTEST, COLORS.NEUTRAL_WHITE, etc.
 */

export class COLORS {
  // Primary Color Palette
  static readonly PRIMARY_LIGHTEST = '#EBF6EE';
  static readonly PRIMARY_LIGHT = '#D9EDDF';
  static readonly PRIMARY_COLOR = '#22CC9D';
  static readonly PRIMARY_MEDIUM = '#007B53';
  static readonly PRIMARY_DARK = '#003E29';
  static readonly PRIMARY_DARKEST = '#003212';

  // Accent Color Palette
  static readonly ACCENT_LIGHTEST = '#4E81F2';
  static readonly ACCENT_COLOR = '#2563EB';
  static readonly ACCENT_MEDIUM = '#005DCF';
  static readonly ACCENT_DARK = '#0047B3';

  // Neutral Color Palette
  static readonly NEUTRAL_WHITE = '#FFFFFF';
  static readonly NEUTRAL_LIGHTEST_GRAY = '#fbfbfb';
  static readonly NEUTRAL_LIGHT_GRAY = '#F2F4F6';
  static readonly NEUTRAL_GRAY = '#C9CED3';
  static readonly NEUTRAL_MEDIUM_GRAY = '#B5BBC2';
  static readonly NEUTRAL_DARK_GRAY = '#5A5F66';
  static readonly NEUTRAL_BLACK = '#0B0D0F';

  // Semantic Colors
  static readonly SUCCESS = '#22CC9D';
  static readonly WARNING_YELLOW = '#EAB308';
  static readonly WARNING = '#F59E0B';
  static readonly ERROR = '#EF4444';
  static readonly INFO = COLORS.ACCENT_COLOR;

  // Additional grays and neutral colors found in components
  static readonly BORDER_LIGHT_GRAY = '#ddd'; // Used in dropdown borders, form elements, and component separators
  static readonly BACKGROUND_LIGHTER_GRAY = '#f5f5f5'; // Used in background overlays and disabled states
  static readonly TEXT_MEDIUM_GRAY = '#999'; // Used for secondary text and placeholder content
  static readonly TEXT_DARK_GRAY = '#555'; // Used for muted text content
  static readonly BORDER_LIGHTER_GRAY = '#eee'; // Used in light borders and dividers
  static readonly TEXT_SUBTLE_GRAY = '#888'; // Used for subtle text elements
  static readonly TEXT_MUTED_GRAY = '#666'; // Used for muted secondary text
  static readonly BORDER_MEDIUM_GRAY = '#ccc'; // Used for form borders and dividers
  static readonly DISABLED_GRAY = '#9CA3AF'; // Used for disabled form elements and inactive states

  // Warning and status colors
  static readonly WARNING_BADGE_BACKGROUND = COLORS.WARNING_YELLOW; // Used in warning badges and notifications
  static readonly WARNING_BADGE_TEXT = '#8a6d3b'; // Used for warning badge text
  static readonly WARNING_BADGE_LIGHT = COLORS.WARNING_YELLOW; // Used for light warning backgrounds
  static readonly ALERT_RED_BACKGROUND = COLORS.ERROR; // Used for critical error backgrounds

  // Info component colors
  static readonly INFO_ERROR_RED = COLORS.ERROR; // Used in info displays for error states
  static readonly INFO_BLUE = COLORS.INFO; // Used in info displays for informational content
  static readonly INFO_WARNING_ORANGE = COLORS.WARNING; // Used in info displays for warning states
  static readonly INFO_SUCCESS_GREEN = '#4caf50'; // Used in info displays for success states
  static readonly INFO_LOADING_GRAY = COLORS.NEUTRAL_DARK_GRAY; // Used in info displays for loading states

  // Button and action colors
  static readonly BUTTON_RED = COLORS.ERROR; // Used for destructive action buttons
  static readonly BUTTON_RED_DARK = '#c62828'; // Used for destructive button hover states
  static readonly BUTTON_BLUE = COLORS.ACCENT_COLOR; // Used for primary action buttons
  static readonly BUTTON_BLUE_DARK = COLORS.ACCENT_MEDIUM; // Used for primary button hover states

  // Component-specific colors
  static readonly CREDIT_ENTRY_BORDER = '#e5e7eb'; // Used in credit entry components for borders
  static readonly CREDIT_ENTRY_BACKGROUND = '#f3f4f6'; // Used in credit entry components for backgrounds
  static readonly DROPDOWN_WHITE = COLORS.NEUTRAL_WHITE; // Used specifically for dropdown backgrounds (exact white)
}

// Alternative export for individual colors if preferred
export const {
  PRIMARY_LIGHTEST,
  PRIMARY_LIGHT,
  PRIMARY_COLOR,
  PRIMARY_MEDIUM,
  PRIMARY_DARK,
  PRIMARY_DARKEST,
  ACCENT_LIGHTEST,
  ACCENT_COLOR,
  ACCENT_MEDIUM,
  ACCENT_DARK,
  NEUTRAL_WHITE,
  NEUTRAL_LIGHTEST_GRAY,
  NEUTRAL_LIGHT_GRAY,
  NEUTRAL_GRAY,
  NEUTRAL_MEDIUM_GRAY,
  NEUTRAL_DARK_GRAY,
  NEUTRAL_BLACK,
  SUCCESS,
  WARNING_YELLOW,
  WARNING,
  ERROR,
  INFO,
  BORDER_LIGHT_GRAY,
  BACKGROUND_LIGHTER_GRAY,
  TEXT_MEDIUM_GRAY,
  TEXT_DARK_GRAY,
  BORDER_LIGHTER_GRAY,
  TEXT_SUBTLE_GRAY,
  TEXT_MUTED_GRAY,
  BORDER_MEDIUM_GRAY,
  DISABLED_GRAY,
  WARNING_BADGE_BACKGROUND,
  WARNING_BADGE_TEXT,
  WARNING_BADGE_LIGHT,
  ALERT_RED_BACKGROUND,
  INFO_ERROR_RED,
  INFO_BLUE,
  INFO_WARNING_ORANGE,
  INFO_SUCCESS_GREEN,
  INFO_LOADING_GRAY,
  BUTTON_RED,
  BUTTON_RED_DARK,
  BUTTON_BLUE,
  BUTTON_BLUE_DARK,
  CREDIT_ENTRY_BORDER,
  CREDIT_ENTRY_BACKGROUND,
  DROPDOWN_WHITE,
} = COLORS;

export default COLORS;