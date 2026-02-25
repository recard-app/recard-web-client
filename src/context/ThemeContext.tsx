import React, { createContext, useState, useContext, useLayoutEffect, useEffect, ReactNode } from 'react';
import type { Theme, ThemeColors } from '../styling/themes';
import { THEME_REGISTRY, defaultTheme, applyThemeToDocument } from '../styling/themes';

const STORAGE_KEY = 'recard-theme';

interface ThemeContextType {
  theme: Theme;
  themeId: string;
  setThemeId: (id: string) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && THEME_REGISTRY[stored] ? stored : 'default';
  });

  const theme = THEME_REGISTRY[themeId] ?? defaultTheme;

  useLayoutEffect(() => {
    applyThemeToDocument(theme);
    document.documentElement.dataset.theme = theme.id;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, themeId);
  }, [themeId]);

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
