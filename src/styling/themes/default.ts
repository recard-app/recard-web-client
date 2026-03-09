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

    // Info component colors (text colors match Sonner toast defaults)
    infoErrorRed: 'hsl(360, 100%, 45%)',
    infoBlue: '#2563EB',
    infoWarningOrange: '#F59E0B',
    infoSuccessGreen: 'hsl(140, 100%, 27%)',
    infoLoadingGray: '#5A5F66',

    // Info component background colors (match Sonner toast defaults)
    infoErrorBg: 'hsl(359, 100%, 97%)',
    infoBlueBg: 'hsl(208, 100%, 97%)',
    infoWarningBg: 'hsl(49, 100%, 97%)',
    infoSuccessBg: 'hsl(143, 85%, 96%)',

    // Info component border colors (match Sonner toast defaults)
    infoErrorBorder: 'hsl(359, 100%, 94%)',
    infoBlueBorder: 'hsl(221, 91%, 93%)',
    infoWarningBorder: 'hsl(49, 91%, 84%)',
    infoSuccessBorder: 'hsl(145, 92%, 87%)',

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
