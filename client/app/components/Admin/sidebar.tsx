import { Link, useLocation } from "react-router"
import { Menu, Button, Drawer } from "antd"
import { 
  DashboardOutlined, 
  UserOutlined, 
  FileTextOutlined, 
  ApiOutlined, 
  SettingOutlined,
  MenuOutlined,
  CloseOutlined
} from "@ant-design/icons"
import { useState } from "react"
import { useTranslation } from "react-i18next"

export function Sidebar() {
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { t } = useTranslation('admin') // use admin namespace

  // Menu items with paths relative to /admin
  const menuItems = [
    { key: "/admin", icon: <DashboardOutlined />, label: t("nav.dashboard") },
    { key: "/admin/users", icon: <UserOutlined />, label: t("nav.users") },
    { key: "/admin/reports", icon: <FileTextOutlined />, label: t("nav.reports") },
    { key: "/admin/federation", icon: <ApiOutlined />, label: t("nav.federation") },
    { key: "/admin/settings", icon: <SettingOutlined />, label: t("nav.settings") },
  ]

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#1351AA]">
      <div className="flex h-16 items-center gap-3 border-b border-white/20 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
          <ApiOutlined className="text-lg text-white" />
        </div>
        <span className="text-xl font-semibold text-white tracking-tight">Krea Admin</span>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]} // use current path from React Router
        className="flex-1 border-none bg-transparent px-2 py-4"
        items={menuItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: (
            <Link to={item.key} onClick={() => setIsMobileOpen(false)}>
              {item.label}
            </Link>
          ),
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
      {/* Mobile menu button */}
      <Button
        type="text"
        icon={isMobileOpen ? <CloseOutlined /> : <MenuOutlined />}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center"
        style={{ 
          background: "#1351AA", 
          color: "white",
          width: 40,
          height: 40,
          borderRadius: 8,
        }}
      />

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        open={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        width={256}
        closable={false}
        className="lg:hidden"
        styles={{ body: { padding: 0 } }}
      >
        <SidebarContent />
      </Drawer>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen">
        <SidebarContent />
      </aside>
    </>
  )
}