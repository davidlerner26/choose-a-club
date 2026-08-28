import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBR from './locales/pt-BR.json';
import en from './locales/en.json';
import { DEFAULT_LOCALE, LOCALES } from './locales';

i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: ptBR },
    en: { translation: en },
  },
  lng: LOCALES[DEFAULT_LOCALE].language,
  fallbackLng: LOCALES[DEFAULT_LOCALE].language,
  interpolation: { escapeValue: false },
});

export default i18n;
