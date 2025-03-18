'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import * as RippleHook from 'use-ripple-hook';
import { colorsUtils } from '@/lib/color-util';

// Define theme types
type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const setFavicon = (url: string) => {
  if (typeof document === 'undefined') return;
  let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'shortcut icon';
    document.head.appendChild(link);
  }
  link.href = url;
};

const THEME_COLORS = {
  light: {
    primary: '#4F46E5', // Indigo-600
    primaryLight: '#6366F1', // Indigo-500
    primaryDark: '#4338CA', // Indigo-700
    background: '#FFFFFF',
    text: '#111827',
  },
  dark: {
    primary: '#6366F1', // Indigo-500
    primaryLight: '#818CF8', // Indigo-400
    primaryDark: '#4F46E5', // Indigo-600
    background: '#1F2937', // Gray-800
    text: '#F9FAFB', // Gray-50
  },
};

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ap-ui-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    setTheme(storedTheme || defaultTheme);
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    const root = document.documentElement;
    const resolvedTheme = theme === 'system' ? 'light' : theme;
    const colors = THEME_COLORS[resolvedTheme];

    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    
    document.documentElement.style.setProperty('--primary', colorsUtils.hexToHslString(colors.primary));
    document.documentElement.style.setProperty('--primary-100', colorsUtils.hexToHslString(colors.primaryLight));
    document.documentElement.style.setProperty('--primary-300', colorsUtils.hexToHslString(colors.primaryDark));
    document.documentElement.style.setProperty('--background', colors.background);
    document.documentElement.style.setProperty('--text', colors.text);
    
    setFavicon('/favicon.ico'); // Change to actual favicon path if needed
  }, [theme]);

  const updateTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setTheme(newTheme);
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const useApRipple = () => {
  const { theme } = useTheme();
  return RippleHook.default({
    color: theme === 'dark' ? 'rgba(233, 233, 233, 0.2)' : 'rgba(155, 155, 155, 0.2)',
    cancelAutomatically: true,
  });
};