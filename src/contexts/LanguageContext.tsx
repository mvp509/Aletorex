/**
 * ALETOREX - Language Context & Hook
 * Provides reactive translation strings and language changing functionality.
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Language,
  LanguageSetting,
  resolveActiveLanguage,
  detectSystemLanguage,
  TRANSLATIONS,
  TranslationKey,
  formatTemplate,
} from '../utils/i18n';
import { getStoredLanguageSetting, saveStoredLanguageSetting } from '../utils/storage';

interface LanguageContextValue {
  languageSetting: LanguageSetting;
  activeLanguage: Language;
  systemLanguage: Language;
  setLanguageSetting: (setting: LanguageSetting) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [languageSetting, setLanguageSettingState] = useState<LanguageSetting>(() =>
    getStoredLanguageSetting()
  );
  const [systemLanguage, setSystemLanguage] = useState<Language>(() => detectSystemLanguage());

  // Listen to system language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setSystemLanguage(detectSystemLanguage());
    };
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  const activeLanguage = useMemo<Language>(() => {
    return resolveActiveLanguage(languageSetting);
  }, [languageSetting, systemLanguage]);

  const setLanguageSetting = useCallback((setting: LanguageSetting) => {
    saveStoredLanguageSetting(setting);
    setLanguageSettingState(setting);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const dictionary = TRANSLATIONS[activeLanguage] || TRANSLATIONS.fr;
      const template = dictionary[key] || TRANSLATIONS.fr[key] || String(key);
      return formatTemplate(template, params);
    },
    [activeLanguage]
  );

  const value = useMemo(
    () => ({
      languageSetting,
      activeLanguage,
      systemLanguage,
      setLanguageSetting,
      t,
    }),
    [languageSetting, activeLanguage, systemLanguage, setLanguageSetting, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
