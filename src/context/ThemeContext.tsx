import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'obsidian' | 'light';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'suomigrc_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'obsidian') {
        return saved;
      }
    }
    return 'obsidian'; // Default to Obsidian tactical theme
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'obsidian' ? 'light' : 'obsidian');
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'light') {
      root.classList.remove('theme-obsidian');
      root.classList.add('theme-light');
      root.setAttribute('data-theme', 'light');
      body.classList.remove('bg-[#070B14]', 'text-slate-100');
      body.classList.add('bg-slate-50', 'text-slate-900');
    } else {
      root.classList.remove('theme-light');
      root.classList.add('theme-obsidian');
      root.setAttribute('data-theme', 'obsidian');
      body.classList.remove('bg-slate-50', 'text-slate-900');
      body.classList.add('bg-[#070B14]', 'text-slate-100');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
