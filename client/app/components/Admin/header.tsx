import { Input, Badge, Avatar, Dropdown, Button, Select } from "antd"
import { SearchOutlined, BellOutlined, GlobalOutlined } from "@ant-design/icons"
import { useTranslation } from "react-i18next"
import { useI18n } from "@/contexts/I18nContext.tsx"
import { useAuth } from "@/contexts/AuthContext.tsx"
import { useNavigate } from "react-router"
import type { MenuProps } from "antd"

export function Header() {
  const { t, i18n } = useTranslation()
  const { setLanguage } = useI18n()
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const dropdownItems: MenuProps["items"] = [
    {
      key: "header",
      label: (
        <div className="flex flex-col py-1">
          <span className="text-sm font-medium text-[#1B1C1E]">
            {user?.name || t("header.adminUser")}
          </span>
          <span className="text-xs text-[#8F8E8A]">{user?.email || "admin@krea.app"}</span>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "profile",
      label: t("header.profileSettings"),
      onClick: () => navigate("/admin/settings"), // or a dedicated profile page later
    },
    { type: "divider" },
    {
      key: "signout",
      label: <span className="text-red-500">{t("header.signOut")}</span>,
      onClick: handleLogout,
    },
  ]

  return (
    <header className="flex h-16 items-center gap-4 border-b border-[#8F8E8A]/40 bg-white px-6 shadow-sm pl-16 lg:pl-6">
      <div className="flex-1 flex items-center gap-4">
      </div>

      <div className="flex items-center gap-3">
        {/* Language Selector */}
        <Select
          value={i18n.language}
          onChange={(value) => setLanguage(value)}
          style={{ width: 90 }}
          suffixIcon={<GlobalOutlined />}
          options={[
            { value: "en", label: "EN" },
            { value: "es", label: "ES" },
          ]}
        />

        {/* Profile Dropdown */}
        <Dropdown menu={{ items: dropdownItems }} trigger={["click"]} placement="bottomRight">
          <Avatar
            src="/admin-interface.png"
            size={40}
            className="cursor-pointer border-2 border-[#8F8E8A]/40 hover:border-[#0B5107]/50"
            style={{ background: "#0B5107" }}
          >
            {user?.name?.charAt(0) || "AD"}
          </Avatar>
        </Dropdown>
      </div>
    </header>
  )
}