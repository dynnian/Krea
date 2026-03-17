import { Link, useLocation, useNavigate } from "react-router"
import { Menu, Button, Drawer } from "antd"
import {
  LayoutDashboard,
  Users,
  FileText,
  Globe,
  Settings,
  Menu as MenuIcon,
  X as CloseIcon
} from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMediaQuery } from "@/lib/hooks/useMediaQuery.ts" // adjust path

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { t } = useTranslation() // no namespace

  const isMobile = useMediaQuery('(max-width: 1023px)')
  const currentPath = location.pathname.replace(/\/$/, '')

  const menuItems = [
    { key: "/admin", icon: <LayoutDashboard color="white" />, label: t("nav.dashboard") },
    { key: "/admin/users", icon: <Users color="white" />, label: t("nav.users") },
    { key: "/admin/reports", icon: <FileText color="white" />, label: t("nav.reports") },
    // { key: "/admin/federation", icon: <Globe color="white" />, label: t("nav.federation") },
    { key: "/admin/settings", icon: <Settings color="white" />, label: t("nav.settings") },
  ]

  const handleMenuClick = (key: string) => {
    navigate(key)
    setIsMobileOpen(false)
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#1351AA]">
      <div className="flex h-16 items-center gap-3 border-b border-white/20 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
          <Globe color="white" />
        </div>
        <span className="text-xl font-semibold text-white tracking-tight">Krea Admin</span>
      </div>
      <Menu
        mode="inline"
        theme="dark"  // ← This is the key!
        selectedKeys={[currentPath]}
        className="flex-1 border-none bg-transparent px-2 py-4"
        items={menuItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => handleMenuClick(item.key),
        }))}
        style={{ background: "transparent" }}
      />
            <div className="p-4 border-t border-white/20">
        <p className="text-xs text-white/60">{t("version")}</p>
      </div>
    </div>
  )

  return (
    <>
      {isMobile && (
        <Button
          type="text"
          icon={isMobileOpen ? <CloseIcon color="white" /> : <MenuIcon color="white" />}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-50 flex items-center justify-center"
          style={{
            background: "#1351AA",
            color: "white",
            width: 40,
            height: 40,
            borderRadius: 8,
          }}
        />
      )}

      <Drawer
        placement="left"
        open={isMobileOpen && isMobile}
        onClose={() => setIsMobileOpen(false)}
        size="default"
        style={{ width: 256 }}
        closable={false}
        className="lg:hidden"
        styles={{ body: { padding: 0 } }}
      >
        <SidebarContent />
      </Drawer>

      <aside className="hidden lg:block w-64 h-screen">
        <SidebarContent />
      </aside>
    </>
  )
}