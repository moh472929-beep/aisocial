import { useContext } from 'react';
import LanguageContext from '../contexts/LanguageContext';
import translations from '../translations';

export const useTranslation = () => {
  const { language } = useContext(LanguageContext);
  
  const t = (key) => {
    // Return translated string if available, otherwise return the key
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };
  
  return { t, language };
};