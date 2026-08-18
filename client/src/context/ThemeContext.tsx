'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

export interface ThemeColors {
  primary_color: string;
  secondary_color: string;
  background_color: string;
  sidebar_color: string;
  header_color: string;
  card_color: string;
  text_color: string;
  border_color: string;
  hover_color: string;
  button_color: string;
  button_text_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
}

export interface CustomTheme extends ThemeColors {
  id: number;
  theme_name: string;
  is_active?: number;
}

interface ThemeContextType {
  themeMode: 'light' | 'dark' | 'system';
  theme: 'light' | 'dark' | 'system';
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark' | 'system') => void;
  customTheme: CustomTheme | null;
  setCustomTheme: (theme: CustomTheme | null) => void;
  saveUserTheme: (themeId: number | null, customColors?: Partial<ThemeColors>) => Promise<void>;
  applyThemeVariables: (colors: Partial<ThemeColors>) => void;
  resetToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>('light');
  const [customTheme, setCustomThemeState] = useState<CustomTheme | null>(null);
  const [mounted, setMounted] = useState(false);

  // Apply CSS variables to :root
  const applyThemeVariables = (colors: Partial<ThemeColors>) => {
    const root = document.documentElement;
    if (colors.primary_color) root.style.setProperty('--theme-primary', colors.primary_color);
    if (colors.secondary_color) root.style.setProperty('--theme-secondary', colors.secondary_color);
    if (colors.background_color) root.style.setProperty('--theme-bg', colors.background_color);
    if (colors.sidebar_color) root.style.setProperty('--theme-sidebar', colors.sidebar_color);
    if (colors.header_color) root.style.setProperty('--theme-header', colors.header_color);
    if (colors.card_color) root.style.setProperty('--theme-card', colors.card_color);
    if (colors.text_color) root.style.setProperty('--theme-text', colors.text_color);
    if (colors.border_color) root.style.setProperty('--theme-border', colors.border_color);
    if (colors.hover_color) root.style.setProperty('--theme-hover', colors.hover_color);
    if (colors.button_color) root.style.setProperty('--theme-button', colors.button_color);
    if (colors.button_text_color) root.style.setProperty('--theme-button-text', colors.button_text_color);
    if (colors.success_color) root.style.setProperty('--theme-success', colors.success_color);
    if (colors.warning_color) root.style.setProperty('--theme-warning', colors.warning_color);
    if (colors.error_color) root.style.setProperty('--theme-error', colors.error_color);
  };

  const clearThemeVariables = () => {
    const root = document.documentElement;
    const vars = [
      '--theme-primary', '--theme-secondary', '--theme-bg', '--theme-sidebar', 
      '--theme-header', '--theme-card', '--theme-text', '--theme-border', 
      '--theme-hover', '--theme-button', '--theme-button-text', 
      '--theme-success', '--theme-warning', '--theme-error'
    ];
    vars.forEach(v => root.style.removeProperty(v));
  };

  const setCustomTheme = (theme: CustomTheme | null) => {
    setCustomThemeState(theme);
    if (theme) {
      applyThemeVariables(theme);
      localStorage.setItem('dms_custom_theme', JSON.stringify(theme));
    } else {
      clearThemeVariables();
      localStorage.removeItem('dms_custom_theme');
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('dms_theme_updated'));
    }
  };

  const resetToDefault = () => {
    setCustomTheme(null);
  };

  const saveUserTheme = async (themeId: number | null, customColors?: Partial<ThemeColors>) => {
    try {
      await api.put('/themes/preference', {
        theme_id: themeId,
        is_custom: !!customColors,
        ...customColors
      });
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  const fetchUserTheme = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dms_token') : null;

    try {
      if (token) {
        const res = await api.get('/themes/preference');
        if (res.data?.success && res.data?.theme) {
          setCustomTheme(res.data.theme);
          return;
        } else if (res.data?.preference?.is_custom) {
          const pref = res.data.preference;
          applyThemeVariables(pref);
          return;
        }
      }

      // If no custom preference, load the Admin's default theme from backend DB
      const themesRes = await api.get('/themes');
      if (themesRes.data?.success && Array.isArray(themesRes.data.themes)) {
        const activeThemes = themesRes.data.themes;
        const defaultTheme = activeThemes.find((t: any) => t.is_default === 1) || activeThemes[0];
        if (defaultTheme) {
          setCustomThemeState(defaultTheme);
          applyThemeVariables(defaultTheme);
        }
      }
    } catch (error) {
      console.error('Error fetching theme preference', error);
    }
  };

  const setThemeMode = (mode: 'light' | 'dark' | 'system') => {
    setThemeModeState(mode);
    localStorage.setItem('docvault-theme', mode);
    localStorage.setItem('dms_theme_mode', mode);
    localStorage.setItem('dms_theme', mode);
    
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('dms_theme_updated'));
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('dms_custom_theme');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCustomThemeState(parsed);
        applyThemeVariables(parsed);
      } catch(e) {}
    }
    
    const storedMode = (localStorage.getItem('docvault-theme') || localStorage.getItem('dms_theme_mode') || localStorage.getItem('dms_theme')) as 'light' | 'dark' | 'system' | null;
    if (storedMode === 'dark') {
      setThemeMode('dark');
    } else {
      setThemeMode('light');
    }
    
    fetchUserTheme();
    setMounted(true);

    const handleThemeSync = () => {
      const current = localStorage.getItem('docvault-theme') || localStorage.getItem('dms_theme_mode') || localStorage.getItem('dms_theme');
      if (current === 'dark') {
        document.documentElement.classList.add('dark');
        setThemeModeState('dark');
      } else {
        document.documentElement.classList.remove('dark');
        setThemeModeState('light');
      }
    };
    window.addEventListener('dms_theme_updated', handleThemeSync);
    return () => window.removeEventListener('dms_theme_updated', handleThemeSync);
  }, []);

  const toggleTheme = () => {
    const isCurrentlyDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    setThemeMode(isCurrentlyDark ? 'light' : 'dark');
  };

  const isDarkActive = themeMode === 'dark';
  const effectiveTheme: 'light' | 'dark' = isDarkActive ? 'dark' : 'light';

  return (
    <ThemeContext.Provider value={{ theme: effectiveTheme, themeMode, toggleTheme, setTheme: setThemeMode, customTheme, setCustomTheme, saveUserTheme, applyThemeVariables, resetToDefault }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
