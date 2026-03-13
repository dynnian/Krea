import { Input, Badge, Avatar, Dropdown, Button, Select } from "antd"
import { SearchOutlined, BellOutlined, GlobalOutlined } from "@ant-design/icons"
import { useTranslation } from "react-i18next"
import { useI18n } from "client/app/contexts/I18nContext.tsx";
import type { MenuProps } from "antd"

export function Header() {
  const { t, i18n } = useTranslation('admin') // use admin namespace
  const { setLanguage } = useI18n()           // language switcher from your context

  const dropdownItems: MenuProps["items"] = [
    {
      key: "header",
      label: (
        <div className="flex flex-col py-1">
          <span className="text-sm font-medium text-[#1B1C1E]">{t("header.adminUser")}</span>
          <span className="text-xs text-[#8F8E8A]">admin@krea.app</span>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    { key: "profile", label: t("header.profileSettings") },
    { key: "preferences", label: t("header.systemPreferences") },
    { type: "divider" },
    { key: "signout", label: <span className="text-red-500">{t("header.signOut")}</span> },
  ]

  return (
    <header className="flex h-16 items-center gap-4 border-b border-[#8F8E8A]/40 bg-white px-6 shadow-sm pl-16 lg:pl-6">
      <div className="flex-1 flex items-center gap-4">
        <Input
          placeholder={t("header.searchPlaceholder")}
          prefix={<SearchOutlined className="text-[#8F8E8A]" />}
          className="max-w-md"
          style={{ 
            background: "#F3F3F1", 
            borderColor: "rgba(143, 142, 138, 0.5)",
            borderRadius: 8,
          }}
        />
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

        {/* Notifications */}
        <Badge count={3} size="small">
          <Button
            type="text"
            icon={<BellOutlined className="text-lg text-[#8F8E8A]" />}
            className="flex items-center justify-center hover:bg-[#F3F3F1]"
            style={{ width: 40, height: 40 }}
          />
        </Badge>

        {/* Profile Dropdown */}
        <Dropdown menu={{ items: dropdownItems }} trigger={["click"]} placement="bottomRight">
          <Avatar
            src="/admin-interface.png"
            size={40}
            className="cursor-pointer border-2 border-[#8F8E8A]/40 hover:border-[#0B5107]/50"
            style={{ background: "#0B5107" }}
          >
            AD
          </Avatar>
        </Dropdown>
      </div>
    </header>
  )
}