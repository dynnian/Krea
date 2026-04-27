import dayjs from "dayjs";
import "dayjs/locale/es";
import "dayjs/locale/en";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(relativeTime);

// Función para establecer el locale basado en localStorage
export const setDayjsLocale = () => {
  // Asegúrate de que coincida con los nombres de archivo ('es', 'en')
  const lang = localStorage.getItem("lang") || "es";
  dayjs.locale(lang);
};

// Inicializar
setDayjsLocale();

// Escuchar cambios en localStorage
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "lang") {
      setDayjsLocale();
    }
  });
}

export default dayjs;
