// components/Admin/activity-table.tsx
import { Table, Tag, Button } from "antd"
import { LeftOutlined, RightOutlined } from "@ant-design/icons"
import { useTranslation } from "react-i18next"
import type { ActivityItemDto } from "@/types/admin"
import { useState } from "react"

interface ActivityTableProps {
  activities: ActivityItemDto[];
}

const statusColors: Record<string, string> = {
  success: "success",
  warning: "warning",
  error: "error",
  info: "processing",
}

export function ActivityTable({ activities }: ActivityTableProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const pageSize = 10

  const paginatedData = activities.slice((page - 1) * pageSize, page * pageSize)

  const columns = [
    {
      title: t("reports.type"),
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <span className="font-medium text-[#1B1C1E]">
          {type === "userActivity" ? t("reports.userActivity") :
           type === "moderation" ? t("reports.moderation") :
           type === "federation" ? t("nav.federation") : type}
        </span>
      ),
    },
    {
      title: t("reports.action"),
      dataIndex: "action",
      key: "action",
      render: (action: string) => (
        <span className="text-[#1B1C1E]">{action}</span>
      ),
    },
    {
      title: t("reports.userSource"),
      dataIndex: "source",
      key: "source",
      render: (source: string) => <span className="text-[#8F8E8A]">{source}</span>,
    },
    {
      title: t("reports.details"),
      dataIndex: "details",
      key: "details",
      render: (details: string) => (
        <span className="text-[#8F8E8A]">{details}</span>
      ),
    },
    {
      title: t("reports.timestamp"),
      dataIndex: "occurredAt",
      key: "occurredAt",
      render: (timestamp: string) => (
        <span className="text-[#8F8E8A]">{new Date(timestamp).toLocaleString()}</span>
      ),
    },
    {
      title: t("users.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status] || "default"} className="rounded-full px-2.5 capitalize">
          {status}
        </Tag>
      ),
    },
  ]

  const totalPages = Math.ceil(activities.length / pageSize)

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#8F8E8A]/50 overflow-hidden bg-white">
        <Table
          dataSource={paginatedData}
          columns={columns}
          rowKey={(record) => `${record.type}-${record.occurredAt}`}
          pagination={false}
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#8F8E8A]">
          {t("common.showing")} {Math.min((page - 1) * pageSize + 1, activities.length)} {t("common.to")}{" "}
          {Math.min(page * pageSize, activities.length)} {t("common.of")} {activities.length}{" "}
          {t("common.results")}
        </p>
        <div className="flex items-center gap-2">
          <Button
            icon={<LeftOutlined />}
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            style={{
              background: "#F3F3F1",
              borderColor: "rgba(143, 142, 138, 0.5)",
              height: 32,
            }}
          >
            {t("common.previous")}
          </Button>
          <Button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => p + 1)}
            style={{
              background: "#F3F3F1",
              borderColor: "rgba(143, 142, 138, 0.5)",
              height: 32,
            }}
          >
            {t("common.next")} <RightOutlined />
          </Button>
        </div>
      </div>
    </div>
  )
}