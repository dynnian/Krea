import { useState } from "react"
import { Card, Table, Tag, Button, Dropdown } from "antd"
import { PlusOutlined, MoreOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, ApiOutlined } from "@ant-design/icons"
import { AddInstanceModal } from "./add-instance-modal.tsx"
import { useTranslation } from "react-i18next"
import type { MenuProps } from "antd"

const instances = [
  {
    id: "1",
    name: "Mastodon Social",
    domain: "mastodon.social",
    trustLevel: "trusted",
    status: "allowed",
    users: "1.2M",
    lastSync: "2 min ago",
  },
  {
    id: "2",
    name: "Pixelfed",
    domain: "pixelfed.social",
    trustLevel: "trusted",
    status: "allowed",
    users: "450K",
    lastSync: "5 min ago",
  },
  {
    id: "3",
    name: "Spam Instance",
    domain: "spam.example",
    trustLevel: "untrusted",
    status: "blocked",
    users: "Unknown",
    lastSync: "Never",
  },
  {
    id: "4",
    name: "Art Community",
    domain: "art.community",
    trustLevel: "verified",
    status: "allowed",
    users: "89K",
    lastSync: "1 min ago",
  },
]

const trustColors: Record<string, string> = {
  verified: "success",
  trusted: "processing",
  untrusted: "error",
}

const statusColors: Record<string, string> = {
  allowed: "success",
  blocked: "error",
}

export function RemoteInstancesList() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { t } = useTranslation()

  const getMenuItems = (instance: (typeof instances)[0]): MenuProps["items"] => [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: t("federation.editSettings"),
    },
    {
      key: "block",
      icon: instance.status === "allowed" ? <StopOutlined /> : <CheckCircleOutlined />,
      label: instance.status === "allowed" ? t("federation.blockInstance") : t("federation.unblockInstance"),
      danger: instance.status === "allowed",
    },
  ]

  const columns = [
    {
      title: t("federation.instance"),
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span className="font-medium text-[#1B1C1E]">{name}</span>,
    },
    {
      title: t("federation.domain"),
      dataIndex: "domain",
      key: "domain",
      render: (domain: string) => <span className="font-mono text-sm text-[#8F8E8A]">{domain}</span>,
    },
    {
      title: t("federation.trustLevel"),
      dataIndex: "trustLevel",
      key: "trustLevel",
      render: (trustLevel: string) => (
        <Tag color={trustColors[trustLevel]} className="rounded-full px-2.5 capitalize">
          {t(`federation.${trustLevel}`)}
        </Tag>
      ),
    },
    {
      title: t("users.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status]} className="rounded-full px-2.5 capitalize">
          {t(`federation.${status}`)}
        </Tag>
      ),
    },
    {
      title: t("federation.users"),
      dataIndex: "users",
      key: "users",
      render: (users: string) => <span className="text-[#8F8E8A]">{users}</span>,
    },
    {
      title: t("federation.lastSync"),
      dataIndex: "lastSync",
      key: "lastSync",
      render: (lastSync: string) => <span className="text-[#8F8E8A]">{lastSync}</span>,
    },
    {
      title: t("common.actions"),
      key: "actions",
      width: 70,
      render: (_: unknown, record: (typeof instances)[0]) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={["click"]}>
          <Button 
            type="text" 
            icon={<MoreOutlined className="text-[#8F8E8A]" />}
            className="hover:bg-[#F3F3F1]"
          />
        </Dropdown>
      ),
    },
  ]

  return (
    <>
      <Card className="border border-[#8F8E8A]/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#6366F1]/10">
              <ApiOutlined className="text-lg text-[#6366F1]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[#1B1C1E]">{t("federation.remoteInstances")}</h3>
              <p className="text-sm text-[#8F8E8A]">{t("federation.remoteInstancesDesc")}</p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddModalOpen(true)}
            style={{ 
              background: "#0B5107",
              borderColor: "#0B5107",
            }}
          >
            {t("federation.addInstance")}
          </Button>
        </div>

        <div className="rounded-lg border border-[#8F8E8A]/50 overflow-hidden">
          <Table
            dataSource={instances}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        </div>
      </Card>

      <AddInstanceModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </>
  )
}
