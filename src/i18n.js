// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend) // Load translations from the server
  .use(initReactI18next) // Pass the i18n instance to react-i18next.
  .init({
    lng: localStorage.getItem('language') || 'en', // Default language
    fallbackLng: 'en',
    debug: false,
    backend: {
      // Path where resources get loaded from.
      loadPath: '/locales/{{lng}}/translation.json',
    },
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;
