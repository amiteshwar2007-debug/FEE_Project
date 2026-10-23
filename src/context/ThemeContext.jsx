import { createContext, useContext, useEffect, useState } from 'react';

// Context API again: the theme ('light' or 'dark') is read by the navbar toggle and applied to <html>
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('qm_theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme; // CSS switches colours on [data-theme]
    localStorage.setItem('qm_theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
