// deno-lint-ignore-file
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router";
import { Grid, Input, Avatar, Drawer, Popover } from "antd";
import {
  Home,
  Search,
  MessageCircle,
  User,
  Menu,
  Bell,
  X,
  LogOut,
  ChevronDown,
  Settings,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.tsx";
import NotificationCenter from "./NotificationCenter.tsx";
import { useNotifications } from "../contexts/NotificationContext.tsx";
import SearchModal from "./SearchModal.tsx";
import { BrandLogoC }  from "./BrandLogo.tsx";

const { useBreakpoint } = Grid;

export default function UserNavbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { unreadCount } = useNotifications();
  const [isMounted, setIsMounted] = useState(false);
  const screens = useBreakpoint();

  // Mobile specific state
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMobile = isMounted && !screens.sm;

  // Active route detection
  const isHomeActive = location.pathname === "/";
  const isExploreActive = location.pathname === "/explore";
  const isProfileActive = location.pathname.startsWith("/profile") || location.pathname.startsWith("/user");
  const isMessagesActive = location.pathname.startsWith("/messages");
  const isSettingsActive = location.pathname === "/settings";

  const handleLogout = async () => {
    await logout();
    setDrawerOpen(false);
    navigate("/");
  };

  const profileMenu = (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden min-w-[200px] shadow-lg">
      <div className="py-1">
        <Link
          to="/profile"
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors border-b border-gray-100"
        >
          <User size={18} className="text-gray-400" />
          <span className="font-medium">{t("navbar.profile")}</span>
        </Link>
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors border-b border-gray-100"
        >
          <Settings size={18} className="text-gray-400" />
          <span className="font-medium">{t("profile.configuration_button")}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left cursor-pointer border-0 transition-colors bg-transparent !text-red-600 hover:bg-red-500 hover:!text-white"
        >
          <LogOut size={18} />
          <span className="font-medium">{t("navbar.logout")}</span>
        </button>
      </div>
    </div>
  );

  if (!isMounted) {
    return <div className="h-16 bg-[#1351AA] w-full" />;
  }

  return (
    <nav className="bg-[#1351AA] border-b-2 border-[#8F8E8A] sticky top-0 z-[1000] w-full ">
      <div className="max-w-screen-2xl mx-auto">
        {isMobile ? (
          /* MOBILE LAYOUT */
          <div className="flex items-center justify-between px-4 py-2">
            <Link to="/">
              <BrandLogoC ariaLabel="Logo" color="#F3F3F1" height={40} className="block" />

            </Link>

            <div className="flex items-center gap-4">
              <button
                type="button"
                className="text-[#F3F3F1] p-1"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                {showMobileSearch ? <X className="text-[#F3F3F1]" size={20} /> : <Search className="text-[#F3F3F1]" size={20} />}
              </button>

              {isAuthenticated && (
                <Link to="/messages" className="text-[#F3F3F1] p-1">
                  <MessageCircle size={20} />
                </Link>
              )}

              <button
                type="button"
                className="p-1"
                onClick={() => setDrawerOpen(true)}
              >
                <Menu className="text-[#F3F3F1]" size={24} />
              </button>
            </div>

            {/* Mobile Search Overlay */}
            {showMobileSearch && (
              <div className="absolute top-full left-0 right-0 bg-[#1351AA] p-2 border-t border-[#8F8E8A] z-50">
                <Input
                  placeholder={t("navbar.search_placeholder")}
                  className="w-full h-10 bg-[#F3F3F1] border-2 border-[#8F8E8A] rounded-lg px-4"
                  prefix={<Search size={18} className="text-gray-400" />}
                  onFocus={() => setIsSearchModalOpen(true)}
                  allowClear
                  autoFocus
                />
              </div>
            )}
          </div>
        ) : (
          /* 💻 DESKTOP LAYOUT */
          <div className="flex items-center justify-between px-6 py-2">
            {/* Left: Logo & Nav */}
            <div className="flex items-center gap-8">
              <Link className="xl:absolute left-[30px] top-[8px] lg:static" to="/">
                <BrandLogoC ariaLabel="Logo" color="#F3F3F1" height={40} className="block" />
              </Link>

              <nav className="flex items-center gap-6">
                <Link to="/" className="group flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <span className={`text-lg font-medium transition-colors ${isHomeActive ? "text-[#8FB78E]" : "text-[#E3E2DE] group-hover:text-white"}`}>
                      {t("navbar.home")}
                    </span>
                    <Home size={20} className={isHomeActive ? "text-[#8FB78E]" : "text-[#E3E2DE] group-hover:text-white"} />
                  </div>
                  {isHomeActive && <div className="w-full h-0.5 bg-[#8FB78E] mt-1" />}
                </Link>

                <Link to="/explore" className="group flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <span className={`text-lg font-medium transition-colors ${isExploreActive ? "text-[#8FB78E]" : "text-[#E3E2DE] group-hover:text-white"}`}>
                      {t("navbar.explore")}
                    </span>
                    <Search size={20} className={isExploreActive ? "text-[#8FB78E]" : "text-[#E3E2DE] group-hover:text-white"} />
                  </div>
                  {isExploreActive && <div className="w-full h-0.5 bg-[#8FB78E] mt-1" />}
                </Link>
              </nav>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-2xl mx-8">
              <Input
                placeholder={t("navbar.search_placeholder")}
                className="h-10 bg-[#F3F3F1] border-2 border-[#8F8E8A] rounded-lg px-4"
                prefix={<Search size={18} className="text-gray-400" />}
                onFocus={() => setIsSearchModalOpen(true)}
                allowClear
              />
            </div>

            {/* Right: Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-6">
                <Link to="/messages" className={`transition-colors ${isMessagesActive ? "text-[#8FB78E]" : "text-[#E3E2DE] hover:text-white"}`}>
                  <MessageCircle size={22} />
                </Link>

              <Popover
                content={<NotificationCenter open={true} />}
                trigger="click"
                placement="bottomRight"
                arrow={false}
                mouseEnterDelay={0}
                mouseLeaveDelay={0}
                overlayInnerStyle={{
                  padding: 0,
                  background: "transparent",
                  boxShadow: "none",
                }}
                align={{
                  offset: [0, -10],
                }}
              >

                  <button
                    type="button"
                    className="relative cursor-pointer bg-transparent border-0 p-0"
                    aria-label="Abrir notificaciones"
                  >
                  <div className="text-[#E3E2DE] hover:text-white">
                    <Bell size={22} />
                  </div>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                </Popover>

                <Popover
                  content={profileMenu}
                  trigger="click"
                  placement="bottomRight"
                  arrow={false}
                  overlayInnerStyle={{
                    padding: 0,
                    background: "transparent",
                    boxShadow: "none",
                  }}
                  align={{
                    offset: [0, 10],
                  }}
                >
                  <button className="flex items-center gap-3 group cursor-pointer bg-transparent border-0 p-1">
                    <Avatar
                      src={user?.profilePictureUrl || undefined}
                      icon={!user?.profilePictureUrl && <User size={20} />}
                      className="border-2 border-[#8F8E8A] group-hover:border-white transition-colors bg-[#0E3D82]"
                    />
                    <div className="hidden lg:flex flex-col items-start max-w-[150px]">
                      <span className={`font-medium text-sm transition-colors truncate w-full text-left ${isProfileActive ? "text-[#8FB78E]" : "text-[#E3E2DE] group-hover:text-white"}`}>
                        {user?.name}
                      </span>
                    </div>
                    <ChevronDown size={16} className="text-[#E3E2DE] group-hover:text-white transition-colors" />
                  </button>
                </Popover>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t("login.sign_in_button")}
              </Link>
            )}
          </div>
        )}
      </div>
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />

      {/* MOBILE DRAWER */}
      <Drawer
        title={<span className="text-[#F3F3F1]">Menú</span>}
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        styles={{
          header: { backgroundColor: "#1351AA", borderBottom: "2px solid #95ACCC" },
          body: { backgroundColor: "#1351AA", padding: 0 },
        }}
        closeIcon={<X size={20} className="text-[#F3F3F1]" />}
      >
        <div className="flex flex-col">
          <Link
            to="/"
            className={`flex items-center gap-4 px-6 py-4 text-lg border-b border-[#95ACCC]  ${isHomeActive ? "bg-blue-800 !text-[#8FB78E]" : "!text-[#F3F3F1]"}`}
            onClick={() => setDrawerOpen(false)}
          >
            <Home size={20} /> {t("navbar.home")}
          </Link>
          <Link
            to="/explore"
            className={`flex items-center gap-4 px-6 py-4 text-lg border-b border-[#95ACCC] ${isExploreActive ? "bg-blue-800 !text-[#8FB78E]" : "!text-[#F3F3F1]"}`}
            onClick={() => setDrawerOpen(false)}
          >
            <Search size={20} /> {t("navbar.explore")}
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className={`flex items-center gap-4 px-6 py-4 text-lg border-b border-[#95ACCC] ${isProfileActive ? "bg-blue-800 !text-[#8FB78E]" : "!text-[#F3F3F1]"}`}
                onClick={() => setDrawerOpen(false)}
              >
                <User size={20} /> {t("navbar.profile")}
              </Link>
              <Link
                to="/settings"
                className={`flex items-center gap-4 px-6 py-4 text-lg border-b border-[#95ACCC] ${isSettingsActive ? "bg-blue-800 !text-[#8FB78E]" : "!text-[#F3F3F1]"}`}
                onClick={() => setDrawerOpen(false)}
              >
                <Settings size={20} /> {t("profile.configuration_button")}
              </Link>
              <button
                className="flex items-center gap-4 px-6 py-4 text-lg text-red-300 w-full text-left"
                onClick={handleLogout}
              >
                <LogOut size={20} /> {t("navbar.logout")}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-4 px-6 py-4 text-lg text-[#F3F3F1]"
              onClick={() => setDrawerOpen(false)}
            >
              <User size={20} /> {t("login.sign_in_button")}
            </Link>
          )}
        </div>
      </Drawer>
    </nav>
  );
}