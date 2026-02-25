/**
 * Color constants for TypeScript/TSX files
 *
 * This file mirrors the colors defined in variables.scss but provides them
 * as TypeScript constants for use in React components and TypeScript files.
 * Values are CSS custom property references, set at runtime by ThemeProvider.
 *
 * Usage: COLORS.PRIMARY_LIGHTEST, COLORS.NEUTRAL_WHITE, etc.
 */

export class COLORS {
  // Primary Color Palette
  static readonly PRIMARY_LIGHTEST = 'var(--color-primary-lightest)';
  static readonly PRIMARY_LIGHT = 'var(--color-primary-light)';
  static readonly PRIMARY_COLOR = 'var(--color-primary-color)';
  static readonly PRIMARY_MEDIUM = 'var(--color-primary-medium)';
  static readonly PRIMARY_DARK = 'var(--color-primary-dark)';
  static readonly PRIMARY_DARKEST = 'var(--color-primary-darkest)';

  // Accent Color Palette
  static readonly ACCENT_LIGHTEST = 'var(--color-accent-lightest)';
  static readonly ACCENT_COLOR = 'var(--color-accent-color)';
  static readonly ACCENT_MEDIUM = 'var(--color-accent-medium)';
  static readonly ACCENT_DARK = 'var(--color-accent-dark)';

  // Neutral Color Palette
  static readonly NEUTRAL_WHITE = 'var(--color-neutral-white)';
  static readonly NEUTRAL_LIGHTEST_GRAY = 'var(--color-neutral-lightest-gray)';
  static readonly NEUTRAL_LIGHT_GRAY = 'var(--color-neutral-light-gray)';
  static readonly NEUTRAL_GRAY = 'var(--color-neutral-gray)';
  static readonly NEUTRAL_MEDIUM_GRAY = 'var(--color-neutral-medium-gray)';
  static readonly NEUTRAL_DARK_GRAY = 'var(--color-neutral-dark-gray)';
  static readonly NEUTRAL_BLACK = 'var(--color-neutral-black)';

  // Semantic Colors
  static readonly SUCCESS = 'var(--color-success)';
  static readonly WARNING_YELLOW = 'var(--color-warning-yellow)';
  static readonly WARNING = 'var(--color-warning)';
  static readonly ERROR = 'var(--color-error)';
  static readonly INFO = 'var(--color-info)';

  // Additional grays and neutral colors found in components
  static readonly BORDER_LIGHT_GRAY = 'var(--color-border-light-gray)';
  static readonly BACKGROUND_LIGHTER_GRAY = 'var(--color-background-lighter-gray)';
  static readonly TEXT_MEDIUM_GRAY = 'var(--color-text-medium-gray)';
  static readonly TEXT_DARK_GRAY = 'var(--color-text-dark-gray)';
  static readonly BORDER_LIGHTER_GRAY = 'var(--color-border-lighter-gray)';
  static readonly TEXT_SUBTLE_GRAY = 'var(--color-text-subtle-gray)';
  static readonly TEXT_MUTED_GRAY = 'var(--color-text-muted-gray)';
  static readonly BORDER_MEDIUM_GRAY = 'var(--color-border-medium-gray)';
  static readonly DISABLED_GRAY = 'var(--color-disabled-gray)';

  // Warning and status colors
  static readonly WARNING_BADGE_BACKGROUND = 'var(--color-warning-badge-background)';
  static readonly WARNING_BADGE_TEXT = 'var(--color-warning-badge-text)';
  static readonly WARNING_BADGE_LIGHT = 'var(--color-warning-badge-light)';
  static readonly ALERT_RED_BACKGROUND = 'var(--color-alert-red-background)';

  // Info component colors
  static readonly INFO_ERROR_RED = 'var(--color-info-error-red)';
  static readonly INFO_BLUE = 'var(--color-info-blue)';
  static readonly INFO_WARNING_ORANGE = 'var(--color-info-warning-orange)';
  static readonly INFO_SUCCESS_GREEN = 'var(--color-info-success-green)';
  static readonly INFO_LOADING_GRAY = 'var(--color-info-loading-gray)';

  // Button and action colors
  static readonly BUTTON_RED = 'var(--color-button-red)';
  static readonly BUTTON_RED_DARK = 'var(--color-button-red-dark)';
  static readonly BUTTON_BLUE = 'var(--color-button-blue)';
  static readonly BUTTON_BLUE_DARK = 'var(--color-button-blue-dark)';

  // Component-specific colors
  static readonly CREDIT_ENTRY_BORDER = 'var(--color-credit-entry-border)';
  static readonly CREDIT_ENTRY_BACKGROUND = 'var(--color-credit-entry-background)';
  static readonly DROPDOWN_WHITE = 'var(--color-dropdown-white)';

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
