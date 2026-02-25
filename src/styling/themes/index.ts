export type { ThemeColors, Theme } from './types';
export { cssVarName, applyThemeToDocument } from './types';
export { defaultTheme } from './default';
export { cardzenTheme } from './cardzen';

import type { Theme } from './types';
import { defaultTheme } from './default';
import { cardzenTheme } from './cardzen';

export const THEME_REGISTRY: Record<string, Theme> = {
  default: defaultTheme,
  cardzen: cardzenTheme,
};

export const THEME_IDS = Object.keys(THEME_REGISTRY);
