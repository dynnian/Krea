import { Input, Select, Button } from "antd"
import { SearchOutlined, FilterOutlined, CalendarOutlined } from "@ant-design/icons"
import { useTranslation } from "react-i18next"

export function UsersFilters() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder={t("users.searchPlaceholder")}
        prefix={<SearchOutlined className="text-[#8F8E8A]" />}
        className="flex-1"
        style={{ 
          background: "#F3F3F1", 
          borderColor: "rgba(143, 142, 138, 0.5)",
          borderRadius: 8,
          height: 40,
        }}
      />

      <Select
        defaultValue="all-roles"
        style={{ width: 140, height: 40 }}
        options={[
          { value: "all-roles", label: t("users.allRoles") },
          { value: "user", label: t("users.user") },
          { value: "artist", label: t("users.artist") },
          { value: "mod", label: t("users.moderator") },
          { value: "admin", label: t("users.admin") },
        ]}
      />

      <Select
        defaultValue="all-status"
        style={{ width: 140, height: 40 }}
        options={[
          { value: "all-status", label: t("users.allStatus") },
          { value: "active", label: t("users.active") },
          { value: "suspended", label: t("users.suspended") },
        ]}
      />

      <Select
        defaultValue="all-dates"
        suffixIcon={<CalendarOutlined />}
        style={{ width: 140, height: 40 }}
        options={[
          { value: "all-dates", label: t("users.allDates") },
          { value: "today", label: t("users.today") },
          { value: "week", label: t("users.thisWeek") },
          { value: "month", label: t("users.thisMonth") },
          { value: "year", label: t("users.thisYear") },
        ]}
      />

      <Button
        icon={<FilterOutlined />}
        style={{ 
          background: "#F3F3F1", 
          borderColor: "rgba(143, 142, 138, 0.5)",
          height: 40,
          width: 40,
        }}
      />
    </div>
  )
}
