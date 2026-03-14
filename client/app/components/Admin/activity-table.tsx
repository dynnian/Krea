import { Table, Tag, Button } from "antd"
import { LeftOutlined, RightOutlined } from "@ant-design/icons"
import { useTranslation } from "react-i18next"

const activities = [
  {
    id: "1",
    type: "userActivity",
    action: "userRegistration",
    user: "alice_creator",
    details: "newUserCreated",
    timestamp: "2024-12-04 14:32:15",
    status: "success",
  },
  {
    id: "2",
    type: "moderation",
    action: "contentRemoved",
    user: "bob_moderator",
    details: "postFlagged",
    timestamp: "2024-12-04 14:15:42",
    status: "warning",
  },
  {
    id: "3",
    type: "federation",
    action: "incomingPost",
    user: "mastodon.social",
    details: "activityPubReceived",
    timestamp: "2024-12-04 14:08:33",
    status: "info",
  },
  {
    id: "4",
    type: "moderation",
    action: "userSuspended",
    user: "charlie_user",
    details: "multipleViolations",
    timestamp: "2024-12-04 13:45:21",
    status: "error",
  },
  {
    id: "5",
    type: "federation",
    action: "outgoingPost",
    user: "diana_artist",
    details: "contentDelivered",
    timestamp: "2024-12-04 13:22:10",
    status: "success",
  },
]

const statusColors: Record<string, string> = {
  success: "success",
  warning: "warning",
  error: "error",
  info: "processing",
}

export function ActivityTable() {
  const { t } = useTranslation()

  const columns = [
    {
      title: t("reports.type"),
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <span className="font-medium text-[#1B1C1E]">
          {type === "userActivity" ? t("reports.userActivity") : 
           type === "moderation" ? t("reports.moderation") : 
           t("nav.federation")}
        </span>
      ),
    },
    {
      title: t("reports.action"),
      dataIndex: "action",
      key: "action",
      render: (action: string) => (
        <span className="text-[#1B1C1E]">{t(`reports.${action}`)}</span>
      ),
    },
    {
      title: t("reports.userSource"),
      dataIndex: "user",
      key: "user",
      render: (user: string) => <span className="text-[#8F8E8A]">{user}</span>,
    },
    {
      title: t("reports.details"),
      dataIndex: "details",
      key: "details",
      render: (details: string) => (
        <span className="text-[#8F8E8A]">{t(`reports.${details}`)}</span>
      ),
    },
    {
      title: t("reports.timestamp"),
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp: string) => <span className="text-[#8F8E8A]">{timestamp}</span>,
    },
    {
      title: t("users.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status]} className="rounded-full px-2.5 capitalize">
          {t(`reports.${status}`)}
        </Tag>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#8F8E8A]/50 overflow-hidden bg-white">
        <Table
          dataSource={activities}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#8F8E8A]">
          {t("common.showing")} 1 {t("common.to")} 5 {t("common.of")} 50 {t("common.results")}
        </p>
        <div className="flex items-center gap-2">
          <Button
            icon={<LeftOutlined />}
            style={{ 
              background: "#F3F3F1", 
              borderColor: "rgba(143, 142, 138, 0.5)",
              height: 32,
            }}
          >
            {t("common.previous")}
          </Button>
          <Button
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
