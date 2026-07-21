import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    // If stored theme is colorful, fallback to light/dark
    let activeTheme = theme;
    if (!['dark', 'light'].includes(activeTheme)) {
      activeTheme = 'dark';
      setThemeState('dark');
    }
    // Set theme attribute on root HTML document
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem('theme', activeTheme);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (['dark', 'light'].includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
