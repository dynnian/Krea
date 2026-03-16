import { Select, Button, Dropdown } from "antd"
import { CalendarOutlined, DownloadOutlined, DownOutlined } from "@ant-design/icons"
import { useTranslation } from "react-i18next"
import type { MenuProps } from "antd"

export function ReportsFilters() {
  const { t } = useTranslation()

  const exportItems: MenuProps["items"] = [
    { key: "csv", label: t("reports.exportCSV") },
    { key: "pdf", label: t("reports.exportPDF") },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-between">
      <Select
        defaultValue="7days"
        suffixIcon={<CalendarOutlined />}
        style={{ width: 160, height: 40 }}
        options={[
          { value: "7days", label: t("reports.last7Days") },
          { value: "30days", label: t("reports.last30Days") },
          { value: "90days", label: t("reports.last90Days") },
          { value: "custom", label: t("reports.customRange") },
        ]}
      />

      <Dropdown menu={{ items: exportItems }} trigger={["click"]}>
        <Button
          icon={<DownloadOutlined />}
          style={{ 
            background: "#0B5107",
            borderColor: "#0B5107",
            color: "white",
            height: 40,
          }}
        >
          {t("reports.export")} <DownOutlined />
        </Button>
      </Dropdown>
    </div>
  )
}
