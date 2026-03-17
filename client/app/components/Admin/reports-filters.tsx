import { Select, Button, Dropdown, message } from "antd"
import { CalendarOutlined, DownloadOutlined, DownOutlined } from "@ant-design/icons"
import { useTranslation } from "react-i18next"
import type { MenuProps } from "antd"
import type { ActivityItemDto } from "@/types/admin"

interface ReportsFiltersProps {
  activities: ActivityItemDto[];
}

export function ReportsFilters({ activities }: ReportsFiltersProps) {
  const { t } = useTranslation()

  const handleExportCSV = () => {
    if (activities.length === 0) {
      message.warning(t("reports.noDataToExport"))
      return
    }

    // Define CSV headers
    const headers = [
      t("reports.type"),
      t("reports.action"),
      t("reports.userSource"),
      t("reports.details"),
      t("reports.timestamp"),
      t("users.status")
    ]

    // Convert activities to CSV rows
    const rows = activities.map(item => [
      item.type,
      item.action,
      item.source,
      item.details,
      new Date(item.occurredAt).toLocaleString(),
      item.status
    ])

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute('download', `reports_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    if (activities.length === 0) {
      message.warning(t("reports.noDataToExport"))
      return
    }
    // Use browser's print dialog – user can save as PDF
    window.print()
  }

  const exportItems: MenuProps["items"] = [
    { 
      key: "csv", 
      label: t("reports.exportCSV"),
      onClick: handleExportCSV
    },
    { 
      key: "pdf", 
      label: t("reports.exportPDF"),
      onClick: handleExportPDF
    },
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