import type { Theme } from './types';

export const defaultTheme: Theme = {
  id: 'default',
  name: 'Default',
  colors: {
    // Primary Color Palette
    primaryLightest: '#EBF6EE',
    primaryLight: '#D9EDDF',
    primaryColor: '#22CC9D',
    primaryMedium: '#007B53',
    primaryDark: '#003E29',
    primaryDarkest: '#003212',

    // Accent Color Palette
    accentLightest: '#4E81F2',
    accentColor: '#2563EB',
    accentMedium: '#005DCF',
    accentDark: '#0047B3',

    // Neutral Color Palette
    neutralWhite: '#FFFFFF',
    neutralLightestGray: '#fbfbfb',
    neutralLightGray: '#F2F4F6',
    neutralGray: '#C9CED3',
    neutralMediumGray: '#B5BBC2',
    neutralDarkGray: '#5A5F66',
    neutralBlack: '#0B0D0F',

    // Semantic Colors
    success: '#22CC9D',
    warningYellow: '#EAB308',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#2563EB',

    // Misc Colors
    borderLightGray: '#dddddd',
    backgroundLighterGray: '#f5f5f5',
    textMediumGray: '#999999',
    textDarkGray: '#555555',
    borderLighterGray: '#eeeeee',
    textSubtleGray: '#888888',
    textMutedGray: '#666666',
    borderMediumGray: '#cccccc',
    disabledGray: '#9CA3AF',

    // Warning and status colors
    warningBadgeBackground: '#EAB308',
    warningBadgeText: '#8a6d3b',
    warningBadgeLight: '#EAB308',
    alertRedBackground: '#EF4444',

    // Info component colors
    infoErrorRed: '#EF4444',
    infoBlue: '#2563EB',
    infoWarningOrange: '#F59E0B',
    infoSuccessGreen: '#4caf50',
    infoLoadingGray: '#5A5F66',

    // Component-specific colors
    creditEntryBorder: '#e5e7eb',
    creditEntryBackground: '#f3f4f6',
    dropdownWhite: '#FFFFFF',

    // Button colors
    buttonRed: '#EF4444',
    buttonRedDark: '#c62828',
    buttonBlue: '#2563EB',
    buttonBlueDark: '#005DCF',
  },
};
