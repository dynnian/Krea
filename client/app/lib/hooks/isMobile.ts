import { useState, useEffect } from "react";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    // Lectura síncrona de window.innerWidth en el cliente
    if (typeof window !== "undefined") {
      return window.innerWidth <= breakpoint;
    }
    // Valor por defecto para servidor (aunque no haya SSR)
    return false;
  });

  useEffect(() => {
    const updateSize = () => setIsMobile(window.innerWidth <= breakpoint);
    // Actualizar por si el tamaño cambió entre la inicialización y este efecto
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [breakpoint]);

  return isMobile;
}
