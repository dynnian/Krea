import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { Grid, Input, Avatar } from "antd";
import {
  Home,
  Search,
  MessageCircle,
  User,
  Menu,
  Bell,
} from "lucide-react";

const { useBreakpoint } = Grid;

// Imagen del logo (misma que en login)
const logoImage = "/assets/Logotipo 1.png";

export default function UserNavbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  const screens = useBreakpoint();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMobile = isMounted && !screens.sm;
  const isDesktop = isMounted && screens.lg;
  const isTablet = isMounted && screens.sm && !screens.lg;

  // Determinar ruta activa
  const isHomeActive = location.pathname === "/";
  const isExploreActive = location.pathname === "/explore";
  const isProfileActive = location.pathname === "/profile";

  // Evitar hidratación incorrecta (SSR)
  if (!isMounted) {
    return (
      <div className="h-16 bg-[#1351AA] animate-pulse">
        <div className="container mx-auto h-full flex items-center px-4" />
      </div>
    );
  }

  // ------------------------------------------------------------
  // 📱 VERSIÓN MÓVIL
  // ------------------------------------------------------------
  if (isMobile) {
    return (
      <nav className="bg-[#1351AA] border-b-2 border-[#8F8E8A]">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <Link to="/">
            <img src={logoImage} alt="Logo" className="h-10 w-auto" />
          </Link>

          {/* Acciones derecha */}
          <div className="flex items-center gap-4">
            <button className="text-white text-xl">
              <Search size={20} />
            </button>
            <button className="text-white text-xl">
              <MessageCircle size={20} />
            </button>
            <Avatar
              icon={<User size={20} />}
              className="bg-white text-gray-800 border border-gray-800"
              size={36}
            />
            <button className="text-white text-2xl">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // ------------------------------------------------------------
  // 💻 VERSIÓN DESKTOP / TABLET
  // ------------------------------------------------------------
  return (
    <nav className="bg-[#1351AA] border-b-2 border-[#8F8E8A] px-6 py-2">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* SECCIÓN IZQUIERDA: Logo + Navegación */}
        <div className="flex items-center gap-8">
          <Link to="/">
            <img src={logoImage} alt="Logo" className="h-10 w-auto" />
          </Link>

          <div className="flex items-center gap-6">
            {/* Inicio - Activo */}
            <div className="flex flex-col items-center">
              <Link to='/' className="flex items-center gap-1">
                <span
                  className={`text-lg font-medium ${
                    isHomeActive ? "text-[#8FB78E]" : "text-[#E3E2DE]"
                  }`}
                >
                  {t("navbar.home")}
                </span>
                <Home
                  size={20}
                  className={isHomeActive ? "text-[#8FB78E]" : "text-[#E3E2DE]"}
                />
              </Link>
              {isHomeActive && (
                <div className="w-full h-0.5 bg-[#8FB78E] mt-1" />
              )}
            </div>

            {/* Explora - Inactivo por defecto */}
            <Link to="/explore">
              <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span
                className={`text-lg font-medium ${
                  isExploreActive ? "text-[#8FB78E]" : "text-[#E3E2DE]"
                }`}
                >
                {t("navbar.explore")}
                </span>
                <Search
                size={20}
                className={isExploreActive ? "text-[#8FB78E]" : "text-[#E3E2DE]"}
                />
              </div>
              {isExploreActive && (
                <div className="w-full h-0.5 bg-[#8FB78E] mt-1" />
              )}
              </div>
            </Link>
          </div>
        </div>

        {/* SECCIÓN CENTRAL: Buscador */}
        <div className="flex-1 max-w-2xl mx-8">
          <Input
            placeholder={t("navbar.search_placeholder")}
            className="h-10 bg-[#F3F3F1] border-2 border-[#8F8E8A] rounded-lg px-4 text-sm"
            prefix={<Search size={18} className="text-gray-400" />}
            allowClear
          />
        </div>

        {/* SECCIÓN DERECHA: Mensajes + Avatar */}
        <div className="flex items-center gap-6">
          {/* Link para Notificaciones */}
          <Link
            to="/notifications"
            className="flex items-center gap-2 text-[#E3E2DE] hover:text-white transition-colors"
          >
            <Bell size={20} />
          </Link>

          {/* Link para el Perfil (Avatar) */}
          {/* Explora - Inactivo por defecto */}
            <Link to="/profile">
              <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span
                className={`text-lg font-medium ${
                  isProfileActive ? "text-[#8FB78E]" : "text-[#E3E2DE]"
                }`}
                >
                {t("navbar.profile")}
                </span>
                <User
                size={20}
                className={isProfileActive ? "text-[#8FB78E]" : "text-[#E3E2DE]"}
                />
              </div>
              {isProfileActive && (
                <div className="w-full h-0.5 bg-[#8FB78E] mt-1" />
              )}
              </div>
            </Link>
        </div>
      </div>
    </nav>
  );
}