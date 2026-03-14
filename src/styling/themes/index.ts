export type { ThemeColors, Theme } from './types';
export { cssVarName, applyThemeToDocument } from './types';
export { defaultTheme } from './default';

import type { Theme } from './types';
import { defaultTheme } from './default';

export const THEME_REGISTRY: Record<string, Theme> = {
  default: defaultTheme,
};

export const THEME_IDS = Object.keys(THEME_REGISTRY);
