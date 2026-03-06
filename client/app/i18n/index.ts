import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "./es.json" with { type: "json" };
import en from "./en.json" with { type: "json" };

const savedLang =
  typeof window !== "undefined" ? window.localStorage.getItem("lang") || "es" : "es";

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export default i18n;
