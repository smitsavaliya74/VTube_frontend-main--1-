import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const getInitialTheme = () => {
    const saved = localStorage.getItem('vtube-theme');
    if (saved) return saved; // 'dark' | 'light' | 'system'
    return 'dark'; // default
  };

  const [theme, setThemeState] = useState(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState('dark');

  const applyTheme = useCallback((t) => {
    const resolved = t === 'system'
      ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      : t;
    document.documentElement.setAttribute('data-theme', resolved);
    setResolvedTheme(resolved);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('vtube-theme', theme);
  }, [theme, applyTheme]);

  // Listen for OS preference changes when in 'system' mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => { if (theme === 'system') applyTheme('system'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, applyTheme]);

  const setTheme = (t) => setThemeState(t);

  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === 'dark')   return 'light';
      if (prev === 'light')  return 'system';
      return 'dark';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
