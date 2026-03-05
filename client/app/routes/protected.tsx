import { Navigate, Outlet, useLocation } from "react-router";
import { Spin } from "antd";
import { useAuth } from "../contexts/AuthContext.tsx";

/**
 * Guardián de rutas privadas.
 *
 * ¿Por qué existe?
 * - Evita que usuarios no autenticados entren a pantallas protegidas.
 * - Centraliza esta validación en un solo lugar para no repetir lógica en cada ruta.
 *
 * ¿Cómo se usa?
 * - En `routes.ts`, este archivo envuelve rutas hijas que requieren sesión.
 * - Si el usuario está autenticado, renderiza esas rutas hijas (`<Outlet />`).
 * - Si no, redirige a `/login`.
 */
export default function ProtectedLayout() {
  // Estado global de autenticación (AuthContext).
  // `loading` indica que aún se está resolviendo la sesión inicial.
  const { isAuthenticated, loading } = useAuth();
  // URL actual que el usuario intentó visitar.
  // Se guarda para poder volver a ella después del login.
  const location = useLocation();

  // Mientras la sesión se valida, mostramos loader para evitar parpadeos
  // o redirecciones prematuras.
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 96 }}>
        <Spin size="large" />
      </div>
    );
  }

  // Si no hay sesión activa:
  // - redirige a login
  // - `replace` evita que el usuario vuelva con "atrás" a una ruta prohibida
  // - `state.from` conserva la ruta original para redirigir post-login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Usuario autenticado: renderiza la ruta hija solicitada.
  return <Outlet />;
}
