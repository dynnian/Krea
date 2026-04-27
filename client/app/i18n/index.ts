import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "./es.json";
import en from "./en.json";

const getSavedLang = () => {
  if (typeof window === "undefined") return "es";
  try {
    return window.localStorage.getItem("lang") || "es";
  } catch (e) {
    return "es";
  }
};

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: getSavedLang(),
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export default i18n;
