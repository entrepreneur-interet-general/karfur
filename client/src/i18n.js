import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import backend from "i18next-xhr-backend";
import { initReactI18next } from "react-i18next";

import { available_languages } from "./locales/available_languages.js";

// the translations
const resources = available_languages;

i18n
  .use(detector)
  .use(backend)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,

    debug: process.env.NODE_ENV === "development",
    saveMissing: false,

    lng: "fr",
    fallbackLng: ["fr", "en"], // use en if detected lng is not available

    interpolation: {
      escapeValue: true, // react already safes from xss
    },
  });

export default i18n;
