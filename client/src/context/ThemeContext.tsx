'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem('dms_theme') as Theme | null;
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setThemeState(savedTheme);
      applyTheme(savedTheme, pathname);
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme: Theme = systemDark ? 'dark' : 'dark'; // Default to dark as requested
      setThemeState(initialTheme);
      applyTheme(initialTheme, pathname);
    }
    setMounted(true);
  }, []);

  // Re-apply theme whenever the route changes
  useEffect(() => {
    if (mounted) {
      applyTheme(theme, pathname);
    }
  }, [pathname, theme, mounted]);

  const applyTheme = (newTheme: Theme, currentPath: string = pathname) => {
    const root = document.documentElement;
    if (currentPath && currentPath.startsWith('/user')) {
      if (newTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    } else {
      // Force light mode on all non-user routes (landing, admin, auth)
      root.classList.remove('dark');
      root.classList.add('light');
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('dms_theme', newTheme);
    applyTheme(newTheme, pathname);
  };

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
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
