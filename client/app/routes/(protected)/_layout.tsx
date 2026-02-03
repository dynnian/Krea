import { Navigate, Outlet } from "react-router";
import { Spin } from "antd";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center mt-24">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
