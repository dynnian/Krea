// pages/admin/reports.tsx (actualizado)
import { Card, Spin, Alert, Tabs } from "antd";
import { ReportsKPI } from "@/components/Admin/reports-kpi";
import { ReportsFilters } from "@/components/Admin/reports-filters";
import { ActivityTable } from "@/components/Admin/activity-table";
import { ReportsModerationTable } from "@/components/Admin/reports-moderation-table";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getReportsOverview } from "@/services/admin/reportsService";
import type { AdminReportsOverviewDto } from "@/types/admin";

export default function ReportsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminReportsOverviewDto | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getReportsOverview();
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError(t("reports.fetchError") || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message={t("common.error")}
        description={error}
        type="error"
        showIcon
        className="mb-6"
      />
    );
  }

  const tabItems = [
    {
      key: "activity",
      label: t("reports.activityLogs"),
      children: (
        <Card className="border border-[#8F8E8A]/50 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-medium text-[#1B1C1E]">{t("reports.activityLogs")}</h2>
              <p className="text-sm text-[#8F8E8A]">{t("reports.activityLogsDesc")}</p>
            </div>
            <ReportsFilters activities={data?.activity || []} />
          </div>
          {data && <ActivityTable activities={data.activity} />}
        </Card>
      ),
    },
    {
      key: "moderation",
      label: t("reports.moderationReports"),
      children: (
        <Card className="border border-[#8F8E8A]/50 shadow-sm">
          <h2 className="text-lg font-medium text-[#1B1C1E] mb-4">{t("reports.moderationReports")}</h2>
          <ReportsModerationTable />
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1B1C1E]">{t("reports.title")}</h1>
        <p className="text-[#8F8E8A] mt-1">{t("reports.subtitle")}</p>
      </div>

      {data && <ReportsKPI data={data} />}

      <Tabs defaultActiveKey="activity" items={tabItems} />
    </div>
  );
}