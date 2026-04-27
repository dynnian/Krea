import { createContext, useContext, useState, type ReactNode } from 'react';
import i18n from '../i18n/index.ts';

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState(i18n.language || 'es');

  const setLanguage = (lang: string) => {
    try {
      i18n.changeLanguage(lang);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('lang', lang);
      }
      setLanguageState(lang);
    } catch (error) {
      console.error('Failed to change language or save to localStorage:', error);
    }
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};