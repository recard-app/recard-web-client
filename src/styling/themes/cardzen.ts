import type { Theme } from './types';

export const cardzenTheme: Theme = {
  id: 'cardzen',
  name: 'Cardzen',
  colors: {
    // Primary Color Palette (gold) -- punchy, reads as "gold" immediately
    primaryLightest: '#28220E',
    primaryLight: '#3D3218',
    primaryColor: '#DABB52',
    primaryMedium: '#C49E34',
    primaryDark: '#9A7E26',
    primaryDarkest: '#6A5A1E',

    // Accent Color Palette (gold -- single action color)
    accentLightest: '#E8CC6A',
    accentColor: '#DABB52',
    accentMedium: '#C49E34',
    accentDark: '#AA8828',

    // Neutral Color Palette (inverted for dark mode)
    // Elevation: page #0D -> surface #1C -> card #26 -> hover #30
    neutralWhite: '#1C1C1C',
    neutralLightestGray: '#272727',
    neutralLightGray: '#0D0D0D',
    neutralGray: '#484848',
    neutralMediumGray: '#5C5650',
    neutralDarkGray: '#BDB7B0',
    neutralBlack: '#F2EFEB',

    // Semantic Colors
    success: '#7BAE7F',
    warningYellow: '#D4935A',
    warning: '#D4935A',
    error: '#E07070',
    info: '#8AC0DE',

    // Misc Colors
    borderLightGray: '#484848',
    backgroundLighterGray: '#262626',
    textMediumGray: '#807A72',
    textDarkGray: '#BDB7B0',
    borderLighterGray: '#383838',
    textSubtleGray: '#908A82',
    textMutedGray: '#9E9890',
    borderMediumGray: '#555555',
    disabledGray: '#5C5650',

    // Warning and status colors
    warningBadgeBackground: '#D4935A',
    warningBadgeText: '#2A1E10',
    warningBadgeLight: '#D4935A',
    alertRedBackground: '#E07070',

    // Info component colors
    infoErrorRed: '#E07070',
    infoBlue: '#8AC0DE',
    infoWarningOrange: '#D4935A',
    infoSuccessGreen: '#7BAE7F',
    infoLoadingGray: '#BDB7B0',

    // Component-specific colors
    creditEntryBorder: '#404040',
    creditEntryBackground: '#262626',
    dropdownWhite: '#272727',

    // Button colors
    buttonRed: '#E07070',
    buttonRedDark: '#C46060',
    buttonBlue: '#DABB52',
    buttonBlueDark: '#C49E34',
  },
};
