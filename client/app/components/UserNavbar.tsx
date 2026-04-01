import { useEffect, useState, useRef } from "react";
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

  // Refs
  const navbarRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  // States
  const [isSticky, setIsSticky] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Measure height to prevent content "jumping"
  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current) {
        setNavbarHeight(navbarRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // 2. Observe the SENTINEL, not the navbar itself
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // If sentinel is NOT intersecting, the user has scrolled past the top
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  const isMobile = isMounted && !screens.sm;
  const isHomeActive = location.pathname === "/";
  const isExploreActive = location.pathname === "/explore";
  const isProfileActive = location.pathname === "/profile";
  const isMessagesActive = location.pathname === "/messages";

  const handleLogout = async () => {
    await logout();
    setDrawerOpen(false);
    navigate("/");
  };

  if (!isMounted) return <div className="h-16 bg-[#1351AA] animate-pulse" />;

  return (
    <>
      {/* THE SENTINEL: Sits at the very top of the document flow */}
      <div ref={sentinelRef} className="h-px w-full absolute top-0" />

      {/* THE PLACEHOLDER: Prevents layout shift */}
      {isSticky && <div style={{ height: navbarHeight }} />}

      <div
        ref={navbarRef}
        className={`bg-[#1351AA] border-b-2 border-[#8F8E8A] transition-all duration-200 ${
          isSticky ? "fixed top-0 left-0 right-0 z-50 shadow-lg" : "relative"
        }`}
      >
        <div className="max-w-screen-2xl mx-auto">
          {isMobile ? (
            /* MOBILE VERSION */
            <div className="flex items-center justify-between px-4 py-2">
              <Link to="/"><img src={logoImage} alt="Logo" className="h-10 w-auto" /></Link>
              <div className="flex items-center gap-4">
                <button onClick={() => setShowMobileSearch(!showMobileSearch)} className="text-white">
                  {showMobileSearch ? <X size={20} /> : <Search size={20} />}
                </button>
                {isAuthenticated && (
                  <Link to="/messages" className="text-white"><MessageCircle size={20} /></Link>
                )}
                {isAuthenticated ? (
                  <Link to="/profile">
                    <Avatar icon={<User size={18} />} className="bg-white text-gray-800" size={32} />
                  </Link>
                ) : (
                  <Link to="/login" className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">{t("login.sign_in_button")}</Link>
                )}
                <button className="text-white" onClick={() => setDrawerOpen(true)}><Menu size={24} /></button>
              </div>
              {showMobileSearch && (
                <div className="absolute top-full left-0 right-0 bg-[#1351AA] p-2 border-t border-[#8F8E8A]">
                  <Input placeholder={t("navbar.search_placeholder")} className="w-full h-10" prefix={<Search size={18} />} autoFocus />
                </div>
              )}
            </div>
          ) : (
            /* DESKTOP VERSION */
            <div className="flex items-center justify-between px-6 py-2">
              <div className="flex items-center gap-8">
                <Link to="/"><img src={logoImage} alt="Logo" className="h-10 w-auto" /></Link>
                <nav className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <Link to="/" className={`flex items-center gap-1 ${isHomeActive ? "text-[#8FB78E]" : "text-[#E3E2DE]"}`}>
                      <span className="text-lg font-medium">{t("navbar.home")}</span>
                      <Home size={20} />
                    </Link>
                    {isHomeActive && <div className="w-full h-0.5 bg-[#8FB78E] mt-1" />}
                  </div>
                  <div className="flex flex-col items-center">
                    <Link to="/explore" className={`flex items-center gap-1 ${isExploreActive ? "text-[#8FB78E]" : "text-[#E3E2DE]"}`}>
                      <span className="text-lg font-medium">{t("navbar.explore")}</span>
                      <Search size={20} />
                    </Link>
                    {isExploreActive && <div className="w-full h-0.5 bg-[#8FB78E] mt-1" />}
                  </div>
                </nav>
              </div>
              <div className="flex-1 max-w-2xl mx-8">
                <Input placeholder={t("navbar.search_placeholder")} className="h-10 rounded-lg" prefix={<Search size={18} />} />
              </div>
              {isAuthenticated ? (
                <div className="flex items-center gap-6">
                  <Link to="/messages" className="text-[#E3E2DE]"><MessageCircle size={22} /></Link>
                  <Popover content={<NotificationCenter />} trigger="click" placement="bottomRight" arrow={false}>
                    <div className="relative cursor-pointer text-[#E3E2DE]">
                      <Bell size={22} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </Popover>
                  <Link to="/profile" className={`flex items-center gap-1 ${isProfileActive ? "text-[#8FB78E]" : "text-[#E3E2DE]"}`}>
                    <span className="text-lg font-medium">{t("navbar.profile")}</span>
                    <User size={20} />
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium">{t("login.sign_in_button")}</Link>
              )}
            </div>
          )}
        </div>
      </div>

      <Drawer
        title={<span className="text-[#F3F3F1]">Menú</span>}
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        styles={{ header: { backgroundColor: "#1351AA" }, body: { backgroundColor: "#1351AA", padding: 0 } }}
      >
        <div className="flex flex-col">
          <Link to="/" className="px-6 py-4 text-[#F3F3F1] border-b border-[#8F8E8A]" onClick={() => setDrawerOpen(false)}>{t("navbar.home")}</Link>
          <Link to="/explore" className="px-6 py-4 text-[#F3F3F1] border-b border-[#8F8E8A]" onClick={() => setDrawerOpen(false)}>{t("navbar.explore")}</Link>
          {isAuthenticated && (
            <button className="px-6 py-4 text-red-300 w-full text-left" onClick={handleLogout}><LogOut size={20} className="inline mr-2" />{t("navbar.logout")}</button>
          )}
        </div>
      </Drawer>
    </>
  );
}