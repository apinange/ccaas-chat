import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from './locales/en.json';
import ptBRTranslations from './locales/pt-BR.json';
import esUSTranslations from './locales/es-US.json';

const resources = {
  en: {
    translation: enTranslations
  },
  'pt-BR': {
    translation: ptBRTranslations
  },
  'es-US': {
    translation: esUSTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt-BR', // Default language to Portuguese (Brazil)
    fallbackLng: 'pt-BR',
    debug: false, // Disable debug mode
    
    interpolation: {
      escapeValue: false // React already does escaping
    }
  });

export default i18n;
