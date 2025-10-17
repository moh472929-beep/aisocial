import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const languages = {
  en: 'English',
  ar: 'Arabic',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  ru: 'Russian'
};

export const defaultLanguage = 'en';

// Define text direction for each language
export const languageDirections = {
  en: 'ltr',
  ar: 'rtl',
  fr: 'ltr',
  de: 'ltr',
  es: 'ltr',
  ru: 'ltr'
};

// Define chat alignment for each language
export const chatAlignments = {
  en: 'right',
  ar: 'left',
  fr: 'right',
  de: 'right',
  es: 'right',
  ru: 'right'
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(defaultLanguage);

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && languages[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    if (languages[newLanguage]) {
      setLanguage(newLanguage);
      localStorage.setItem('language', newLanguage);
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      changeLanguage, 
      languages,
      direction: languageDirections[language],
      chatAlignment: chatAlignments[language]
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;