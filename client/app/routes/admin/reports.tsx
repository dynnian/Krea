// routes/admin/reports.tsx
import { Card } from "antd"
import { ReportsKPI } from "@/components/Admin/reports-kpi.tsx"
import { ReportsFilters } from "@/components/Admin/reports-filters.tsx"
import { ActivityTable } from "@/components/Admin/activity-table.tsx"
import { useTranslation } from "react-i18next"
import { useEffect } from "react";

export default function ReportsPage() {
  const { t } = useTranslation()
  useEffect(() => {
    console.log("ReportsPage mounted");
  }, []);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1B1C1E]">{t("reports.title")}</h1>
        <p className="text-[#8F8E8A] mt-1">{t("reports.subtitle")}</p>
      </div>

      <ReportsKPI />

      <Card className="border border-[#8F8E8A]/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-medium text-[#1B1C1E]">{t("reports.activityLogs")}</h2>
            <p className="text-sm text-[#8F8E8A]">{t("reports.activityLogsDesc")}</p>
          </div>
          <ReportsFilters />
        </div>
        <ActivityTable />
      </Card>
    </div>
  )
}