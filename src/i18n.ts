import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import de from './locales/de.json';

const defLanguage = localStorage.getItem('appLanguage')
i18n
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: en
      },
      de: {
        translation: de
      }
    },
    lng: defLanguage, // Default language
    fallbackLng: defLanguage, // Fallback language
    interpolation: {
      escapeValue: false // React already escapes by default
    }
  });

export default i18n;
