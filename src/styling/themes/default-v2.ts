import type { Theme } from './types';

export const defaultV2Theme: Theme = {
  id: 'default-v2',
  name: 'Default V2',
  colors: {
    // Primary Color Palette (Deep Jade)
    primaryLightest: '#EAF4EF',
    primaryLight:    '#C8E2D4',
    primaryColor:    '#1A9E7A',
    primaryMedium:   '#006B48',
    primaryDark:     '#003E29',
    primaryDarkest:  '#003212',

    // Accent Color Palette
    accentLightest: '#4E81F2',
    accentColor: '#2563EB',
    accentMedium: '#005DCF',
    accentDark: '#0047B3',

    // Neutral Color Palette (green-tinted)
    neutralWhite:        '#FAFCFB',
    neutralLightestGray: '#F6F8F7',
    neutralLightGray:    '#EEF1EF',
    neutralGray:         '#C5CCC8',
    neutralMediumGray:   '#B1B9B4',
    neutralDarkGray:     '#565C59',
    neutralBlack:        '#0B0D0C',

    // Semantic Colors
    success: '#22CC9D',
    warningYellow: '#D4A843',
    warning: '#D4A843',
    error: '#EF4444',
    info: '#2563EB',

    // Misc Colors (green-tinted)
    borderLightGray:       '#D9DDD9',
    backgroundLighterGray: '#F2F4F2',
    textMediumGray:        '#959B95',
    textDarkGray:          '#525854',
    borderLighterGray:     '#EAEEEA',
    textSubtleGray:        '#848B85',
    textMutedGray:         '#636963',
    borderMediumGray:      '#C8CEC8',
    disabledGray:          '#98A19C',

    // Warning and status colors
    warningBadgeBackground: '#D4A843',
    warningBadgeText: '#6B5428',
    warningBadgeLight: '#D4A843',
    alertRedBackground: '#EF4444',

    // Info component colors (text colors match Sonner toast defaults)
    infoErrorRed: 'hsl(360, 100%, 45%)',
    infoBlue: '#2563EB',
    infoWarningOrange: '#D4A843',
    infoSuccessGreen: 'hsl(140, 100%, 27%)',
    infoLoadingGray: '#5A5F66',

    // Info component background colors (match Sonner toast defaults)
    infoErrorBg: 'hsl(359, 100%, 97%)',
    infoBlueBg: 'hsl(208, 100%, 97%)',
    infoWarningBg: 'hsl(40, 80%, 97%)',
    infoSuccessBg: 'hsl(143, 85%, 96%)',

    // Info component border colors (match Sonner toast defaults)
    infoErrorBorder: 'hsl(359, 100%, 94%)',
    infoBlueBorder: 'hsl(221, 91%, 93%)',
    infoWarningBorder: 'hsl(40, 70%, 84%)',
    infoSuccessBorder: 'hsl(145, 92%, 87%)',

    // Component-specific colors (green-tinted)
    creditEntryBorder:     '#E1E5E1',
    creditEntryBackground: '#EFF2EF',
    dropdownWhite:         '#FAFCFB',

    // Button colors
    buttonRed: '#EF4444',
    buttonRedDark: '#c62828',
    buttonBlue: '#2563EB',
    buttonBlueDark: '#005DCF',
  },
};
