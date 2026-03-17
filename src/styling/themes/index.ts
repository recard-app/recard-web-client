export type { ThemeColors, Theme } from './types';
export { cssVarName, applyThemeToDocument } from './types';
export { defaultV2Theme as defaultTheme } from './default-v2';

import type { Theme } from './types';
import { defaultV2Theme } from './default-v2';

export const THEME_REGISTRY: Record<string, Theme> = {
  default: defaultV2Theme,
};

export const THEME_IDS = Object.keys(THEME_REGISTRY);
