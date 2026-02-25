import React, { createContext, useState, useContext, useLayoutEffect, ReactNode } from 'react';
import type { Theme, ThemeColors } from '../styling/themes';
import { THEME_REGISTRY, defaultTheme, applyThemeToDocument } from '../styling/themes';
import { DEFAULT_THEME_ID } from '../types/Constants';

interface ThemeContextType {
  theme: Theme;
  themeId: string;
  setThemeId: (id: string) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME_ID);

  const theme = THEME_REGISTRY[themeId] ?? defaultTheme;

  useLayoutEffect(() => {
    applyThemeToDocument(theme);
    document.documentElement.dataset.theme = theme.id;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId, colors: theme.colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
