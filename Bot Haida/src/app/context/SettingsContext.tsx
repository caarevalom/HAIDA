import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../data/translations';

type Theme = 'dark' | 'light';

interface SettingsContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  t: typeof translations.en;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    // Check system preference on mount if no stored preference (mocked here, defaulting to dark)
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  const t = translations[language];

  return (
    <SettingsContext.Provider value={{ theme, language, toggleTheme, toggleLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
