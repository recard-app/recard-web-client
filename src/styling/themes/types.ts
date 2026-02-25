export interface ThemeColors {
  // Primary Color Palette
  primaryLightest: string;
  primaryLight: string;
  primaryColor: string;
  primaryMedium: string;
  primaryDark: string;
  primaryDarkest: string;

  // Accent Color Palette
  accentLightest: string;
  accentColor: string;
  accentMedium: string;
  accentDark: string;

  // Neutral Color Palette
  neutralWhite: string;
  neutralLightestGray: string;
  neutralLightGray: string;
  neutralGray: string;
  neutralMediumGray: string;
  neutralDarkGray: string;
  neutralBlack: string;

  // Semantic Colors
  success: string;
  warningYellow: string;
  warning: string;
  error: string;
  info: string;

  // Misc Colors
  borderLightGray: string;
  backgroundLighterGray: string;
  textMediumGray: string;
  textDarkGray: string;
  borderLighterGray: string;
  textSubtleGray: string;
  textMutedGray: string;
  borderMediumGray: string;
  disabledGray: string;

  // Warning and status colors
  warningBadgeBackground: string;
  warningBadgeText: string;
  warningBadgeLight: string;
  alertRedBackground: string;

  // Info component colors
  infoErrorRed: string;
  infoBlue: string;
  infoWarningOrange: string;
  infoSuccessGreen: string;
  infoLoadingGray: string;

  // Component-specific colors
  creditEntryBorder: string;
  creditEntryBackground: string;
  dropdownWhite: string;

  // Button colors
  buttonRed: string;
  buttonRedDark: string;
  buttonBlue: string;
  buttonBlueDark: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
}

function camelToKebab(key: string): string {
  return key.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function cssVarName(key: keyof ThemeColors): string {
  return `--color-${camelToKebab(key)}`;
}

export function applyThemeToDocument(theme: Theme): void {
  const root = document.documentElement;
  const entries = Object.entries(theme.colors) as [keyof ThemeColors, string][];
  for (const [key, value] of entries) {
    root.style.setProperty(cssVarName(key), value);
  }
}
