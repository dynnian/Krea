import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router";
import { Grid, Input, Avatar, Drawer, Space, Popover } from "antd";
import {
  Home,
  Search,
  MessageCircle,
  User,
  Menu,
  Bell,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import NotificationCenter from "./NotificationCenter";
import { useNotifications } from "../contexts/NotificationContext";

const { useBreakpoint } = Grid;

const logoImage = "/assets/Logotipo 1.png";

export default function UserNavbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [isMounted, setIsMounted] = useState(false);
  const screens = useBreakpoint();

  // Mobile specific state
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMobile = isMounted && !screens.sm;
  const isDesktop = isMounted && screens.lg;
  const isTablet = isMounted && screens.sm && !screens.lg;

  // Active route detection
  const isHomeActive = location.pathname === "/";
  const isExploreActive = location.pathname === "/explore";
  const isProfileActive = location.pathname === "/profile";
  const isMessagesActive = location.pathname === "/messages";
  const isNotificationsActive = location.pathname === "/notifications";



  // Handle logout from drawer
  const handleLogout = async () => {
    await logout();
    setDrawerOpen(false);
    navigate("/");
  };

  if (!isMounted) {
    return (
      <div className="h-16 bg-[#1351AA] animate-pulse">
        <div className="container mx-auto h-full flex items-center px-4" />
      </div>
    );
  }

  // ------------------------------------------------------------
  // 📱 VERSIÓN MÓVIL (con búsqueda desplegable y drawer)
  // ------------------------------------------------------------
  if (isMobile) {
    return (
      <>
        <nav className="bg-[#1351AA] border-b-2 border-[#8F8E8A] relative">
          {/* Barra principal */}
          <div className="flex items-center justify-between px-4 py-2">
            {/* Logo */}
            <Link to="/">
              <img src={logoImage} alt="Logo" className="h-10 w-auto" />
            </Link>

            {/* Acciones derecha */}
            <div className="flex items-center gap-4">
              {/* Search icon - toggles search input */}
              <button
                className="text-white text-xl"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                {showMobileSearch ? <X size={20} /> : <Search size={20} />}
              </button>

              {/* Messages (only if authenticated) */}
              {isAuthenticated && (
                <Link to="/messages" className="text-white text-xl">
                  <MessageCircle size={20} />
                </Link>
              )}

              {/* Avatar / Profile (only if authenticated) */}
              {isAuthenticated ? (
                <Link to="/profile">
                  <Avatar
                    icon={<User size={20} />}
                    className="bg-white text-gray-800 border border-gray-800"
                    size={36}
                  />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium"
                >
                  {t("login.sign_in_button")}
                </Link>
              )}

              {/* Menu button - opens drawer */}
              <button
                className="text-white text-2xl"
                onClick={() => setDrawerOpen(true)}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>

          {/* Search input overlay (conditionally visible) */}
          {showMobileSearch && (
            <div className="absolute top-full left-0 right-0 bg-[#1351AA] p-2 border-t border-[#8F8E8A] z-50">
              <Input
                placeholder={t("navbar.search_placeholder")}
                className="w-full h-10 bg-[#F3F3F1] border-2 border-[#8F8E8A] rounded-lg px-4 text-sm"
                prefix={<Search size={18} className="text-gray-400" />}
                allowClear
                autoFocus
                onPressEnter={() => {
                  // Perform search logic here
                  setShowMobileSearch(false);
                }}
                onBlur={() => setShowMobileSearch(false)}
              />
            </div>
          )}
        </nav>

        {/* Drawer de navegación */}
        <Drawer
          title="Menú"
          placement="right"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          styles={{
            section: { backgroundColor: '#1351AA' },
            header: {
              backgroundColor: '#1351AA',
              color: '#F3F3F1',
              borderBottom: '2px solid #8F8E8A',
            },
            body: {
              backgroundColor: '#1351AA',
              color: '#F3F3F1',
              padding: 0,
            },
            mask: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
          }}
          closeIcon={<X size={20} className="text-[#F3F3F1]" />}
        >
          <div className="flex flex-col">
            {/* Home */}
            <Link
              to="/"
              className={`flex items-center gap-4 px-6 py-4 text-lg border-b border-[#8F8E8A] ${
                isHomeActive ? 'bg-blue-700 text-[#8FB78E]' : 'text-[#F3F3F1]'
              }`}
              onClick={() => setDrawerOpen(false)}
            >
              <Home size={20} className={isHomeActive ? 'text-[#8FB78E]' : 'text-[#F3F3F1]'} />
              <span className="text-white">{t('navbar.home')}</span>
            </Link>

            {/* Explore */}
            <Link
              to="/explore"
              className={`flex items-center gap-4 px-6 py-4 text-lg border-b border-[#8F8E8A] ${
                isExploreActive ? 'bg-blue-700 text-[#8FB78E]' : 'text-[#F3F3F1]'
              }`}
              onClick={() => setDrawerOpen(false)}
            >
              <Search size={20} className={isExploreActive ? 'text-[#8FB78E]' : 'text-[#F3F3F1]'} />
              <span className="text-white">{t('navbar.explore')}</span>
            </Link>

            {isAuthenticated && (
              <>
                {/* Messages */}
                <Link
                  to="/messages"
                  className={`flex items-center gap-4 px-6 py-4 text-lg border-b border-[#8F8E8A] ${
                    isMessagesActive ? 'bg-blue-700 text-[#8FB78E]' : 'text-[#F3F3F1]'
                  }`}
                  onClick={() => setDrawerOpen(false)}
                >
                  <MessageCircle size={20} className={isMessagesActive ? 'text-[#8FB78E]' : 'text-[#F3F3F1]'} />
                  <span className="text-white">{t('navbar.messages')}</span>
                </Link>

                {/* Notifications */}
                {isAuthenticated && (
                <Popover
                  content={<NotificationCenter />}
                  trigger="click"
                  placement="bottomRight"
                  overlayClassName="notification-popover"
                  arrow={false}
                >
                  <div className="relative cursor-pointer text-white text-xl">
                    <Bell size={20} />
                    {unreadCount > 0 ? (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount} Notifications
                      </span>
                    ):(
                      <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
                    )}
                  </div>
                </Popover>
              )}

                {/* Profile */}
                <Link
                  to="/profile"
                  className={`flex items-center gap-4 px-6 py-4 text-lg border-b border-[#8F8E8A] ${
                    isProfileActive ? 'bg-blue-700 text-[#8FB78E]' : 'text-[#F3F3F1]'
                  }`}
                  onClick={() => setDrawerOpen(false)}
                >
                  <User size={20} className={isProfileActive ? 'text-[#8FB78E]' : 'text-[#F3F3F1]'} />
                  <span className="text-white">{t('navbar.profile')}</span>
                </Link>

                {/* Logout */}
                <button
                  className="flex items-center gap-4 px-6 py-4 text-lg text-[#F3F3F1] border-b border-[#8F8E8A] w-full text-left hover:bg-blue-700"
                  onClick={handleLogout}
                >
                  <X size={20} className="text-[#F3F3F1]" />
                  <span className="text-white">{t('navbar.logout')}</span>
                </button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-4 px-6 py-4 text-lg text-[#F3F3F1] border-b border-[#8F8E8A] hover:bg-blue-700"
                  onClick={() => setDrawerOpen(false)}
                >
                  <User size={20} className="text-[#F3F3F1]" />
                  <span className="text-white">{t('login.title')}</span>
                </Link>
                
              </>
            )}
          </div>
        </Drawer>
      </>
    );
  }

  // ------------------------------------------------------------
  // 💻 VERSIÓN DESKTOP / TABLET (sin cambios funcionales, solo agregamos enlaces)
  // ------------------------------------------------------------
  return (
    <nav className="bg-[#1351AA] border-b-2 border-[#8F8E8A] px-6 py-2">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Left section: Logo + navigation */}
        <div className="flex items-center gap-8">
          <Link to="/">
            <img src={logoImage} alt="Logo" className="h-10 w-auto" />
          </Link>

          <div className="flex items-center gap-6">
            {/* Home */}
            <div className="flex flex-col items-center">
              <Link to="/" className="flex items-center gap-1">
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

            {/* Explore */}
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

        {/* Center: Search */}
        <div className="flex-1 max-w-2xl mx-8">
          <Input
            placeholder={t("navbar.search_placeholder")}
            className="h-10 bg-[#F3F3F1] border-2 border-[#8F8E8A] rounded-lg px-4 text-sm"
            prefix={<Search size={18} className="text-gray-400" />}
            allowClear
          />
        </div>

        {/* Right section: Authenticated icons or Login button */}
        {isAuthenticated ? (
          <div className="flex items-center gap-6">
            {/* Messages */}
            <Link
              to="/messages"
              className="flex items-center gap-2 text-[#E3E2DE] hover:text-white transition-colors"
            >
              <MessageCircle size={20} />
            </Link>
            {/* Notifications */}
             <Popover
              content={<NotificationCenter />}
              trigger="click"
              placement="bottomRight"
              overlayClassName="notification-popover"
              arrow={false}
            >
              <div className="relative cursor-pointer flex items-center gap-2 text-[#E3E2DE] hover:text-white transition-colors">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
            </Popover>
            {/* Profile */}
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
        ) : (
          <Link
            to="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {t("login.sign_in_button")}
          </Link>
        )}
      </div>
    </nav>
  );
}