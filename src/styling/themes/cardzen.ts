import type { Theme } from './types';

export const cardzenTheme: Theme = {
  id: 'cardzen',
  name: 'Cardzen',
  colors: {
    // Primary Color Palette (gold)
    primaryLightest: '#1F1B0E',
    primaryLight: '#2D2515',
    primaryColor: '#C9A84C',
    primaryMedium: '#A08830',
    primaryDark: '#7A6820',
    primaryDarkest: '#4A3F15',

    // Accent Color Palette (gold -- single action color)
    accentLightest: '#D4B85C',
    accentColor: '#C9A84C',
    accentMedium: '#A08830',
    accentDark: '#8A7428',

    // Neutral Color Palette (inverted for dark mode)
    neutralWhite: '#1E1E1E',
    neutralLightestGray: '#252525',
    neutralLightGray: '#111111',
    neutralGray: '#333333',
    neutralMediumGray: '#5C5650',
    neutralDarkGray: '#A09A92',
    neutralBlack: '#E8E4DF',

    // Semantic Colors
    success: '#7BAE7F',
    warningYellow: '#D4935A',
    warning: '#D4935A',
    error: '#C75B5B',
    info: '#6B9EC2',

    // Misc Colors
    borderLightGray: '#333333',
    backgroundLighterGray: '#282828',
    textMediumGray: '#6B6560',
    textDarkGray: '#A09A92',
    borderLighterGray: '#2A2A2A',
    textSubtleGray: '#7A756E',
    textMutedGray: '#8A847C',
    borderMediumGray: '#3D3D3D',
    disabledGray: '#5C5650',

    // Warning and status colors
    warningBadgeBackground: '#D4935A',
    warningBadgeText: '#2A1E10',
    warningBadgeLight: '#D4935A',
    alertRedBackground: '#C75B5B',

    // Info component colors
    infoErrorRed: '#C75B5B',
    infoBlue: '#6B9EC2',
    infoWarningOrange: '#D4935A',
    infoSuccessGreen: '#7BAE7F',
    infoLoadingGray: '#A09A92',

    // Component-specific colors
    creditEntryBorder: '#2E2E2E',
    creditEntryBackground: '#282828',
    dropdownWhite: '#242424',

    // Button colors
    buttonRed: '#C75B5B',
    buttonRedDark: '#A84A4A',
    buttonBlue: '#C9A84C',
    buttonBlueDark: '#A08830',
  },
};
