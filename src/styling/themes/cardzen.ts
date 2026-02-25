import type { Theme } from './types';

export const cardzenTheme: Theme = {
  id: 'cardzen',
  name: 'Cardzen',
  colors: {
    // Primary Color Palette (gold)
    primaryLightest: '#1A1608',
    primaryLight: '#2A2010',
    primaryColor: '#D4B04A',
    primaryMedium: '#B8952E',
    primaryDark: '#8A7020',
    primaryDarkest: '#5A4C18',

    // Accent Color Palette (gold -- single action color)
    accentLightest: '#DFC060',
    accentColor: '#D4B04A',
    accentMedium: '#B8952E',
    accentDark: '#9A7E22',

    // Neutral Color Palette (inverted for dark mode)
    neutralWhite: '#1A1A1A',
    neutralLightestGray: '#222222',
    neutralLightGray: '#0F0F0F',
    neutralGray: '#383838',
    neutralMediumGray: '#5C5650',
    neutralDarkGray: '#B0AAA2',
    neutralBlack: '#ECE8E3',

    // Semantic Colors
    success: '#7BAE7F',
    warningYellow: '#D4935A',
    warning: '#D4935A',
    error: '#D46A6A',
    info: '#7EB3D4',

    // Misc Colors
    borderLightGray: '#383838',
    backgroundLighterGray: '#242424',
    textMediumGray: '#706A64',
    textDarkGray: '#B0AAA2',
    borderLighterGray: '#2E2E2E',
    textSubtleGray: '#807A74',
    textMutedGray: '#908A82',
    borderMediumGray: '#444444',
    disabledGray: '#5C5650',

    // Warning and status colors
    warningBadgeBackground: '#D4935A',
    warningBadgeText: '#2A1E10',
    warningBadgeLight: '#D4935A',
    alertRedBackground: '#D46A6A',

    // Info component colors
    infoErrorRed: '#D46A6A',
    infoBlue: '#7EB3D4',
    infoWarningOrange: '#D4935A',
    infoSuccessGreen: '#7BAE7F',
    infoLoadingGray: '#B0AAA2',

    // Component-specific colors
    creditEntryBorder: '#333333',
    creditEntryBackground: '#242424',
    dropdownWhite: '#222222',

    // Button colors
    buttonRed: '#D46A6A',
    buttonRedDark: '#B85858',
    buttonBlue: '#D4B04A',
    buttonBlueDark: '#B8952E',
  },
};
