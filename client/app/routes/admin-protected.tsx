import { Navigate, Outlet } from "react-router";
import { Spin } from "antd";
import { useAuth } from "../contexts/AuthContext.tsx";

export default function AdminProtectedLayout() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 96 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "Admin") {
    // Si no es admin, redirigir al home (o a una página de acceso denegado)
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}