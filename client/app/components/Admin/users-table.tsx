import { useState } from "react"
import { Table, Avatar, Tag, Dropdown, Button } from "antd"
import { MoreOutlined, EyeOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, SafetyOutlined } from "@ant-design/icons"
import { EditUserModal } from "./edit-user-modal.tsx"
import { useTranslation } from "react-i18next"
import type { MenuProps } from "antd"

const users = [
  {
    id: "1",
    username: "alice_creator",
    email: "alice@example.com",
    role: "artist",
    status: "active",
    created: "2024-01-15",
    avatar: "/diverse-woman-portrait.png",
  },
  {
    id: "2",
    username: "bob_moderator",
    email: "bob@example.com",
    role: "mod",
    status: "active",
    created: "2024-02-20",
    avatar: "/man.jpg",
  },
  {
    id: "3",
    username: "charlie_user",
    email: "charlie@example.com",
    role: "user",
    status: "suspended",
    created: "2024-03-10",
    avatar: "/diverse-group.png",
  },
  {
    id: "4",
    username: "diana_artist",
    email: "diana@example.com",
    role: "artist",
    status: "active",
    created: "2024-04-05",
    avatar: "/diverse-artists-studio.png",
  },
  {
    id: "5",
    username: "eve_admin",
    email: "eve@example.com",
    role: "admin",
    status: "active",
    created: "2023-12-01",
    avatar: "/admin-interface.png",
  },
]

const roleColors: Record<string, string> = {
  user: "default",
  artist: "green",
  mod: "purple",
  admin: "blue",
}

const statusColors: Record<string, string> = {
  active: "success",
  suspended: "error",
}

export function UsersTable() {
  const [selectedUser, setSelectedUser] = useState<(typeof users)[0] | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { t } = useTranslation()

  const handleEdit = (user: (typeof users)[0]) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const getMenuItems = (user: (typeof users)[0]): MenuProps["items"] => [
    {
      key: "view",
      icon: <EyeOutlined />,
      label: t("users.viewDetails"),
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: t("users.editUser"),
      onClick: () => handleEdit(user),
    },
    {
      key: "role",
      icon: <SafetyOutlined />,
      label: t("users.assignRole"),
    },
    {
      key: "suspend",
      icon: user.status === "active" ? <StopOutlined /> : <CheckCircleOutlined />,
      label: user.status === "active" ? t("users.suspend") : t("users.reactivate"),
      danger: user.status === "active",
    },
  ]

  const columns = [
    {
      title: t("users.user"),
      dataIndex: "username",
      key: "username",
      render: (_: unknown, record: (typeof users)[0]) => (
        <div className="flex items-center gap-3">
          <Avatar 
            src={record.avatar} 
            size={40}
            className="border-2 border-[#8F8E8A]/30"
          >
            {record.username.slice(0, 2).toUpperCase()}
          </Avatar>
          <span className="font-medium text-[#1B1C1E]">{record.username}</span>
        </div>
      ),
    },
    {
      title: t("users.email"),
      dataIndex: "email",
      key: "email",
      render: (email: string) => <span className="text-[#8F8E8A]">{email}</span>,
    },
    {
      title: t("users.role"),
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={roleColors[role]} className="rounded-full px-2.5 capitalize">
          {role}
        </Tag>
      ),
    },
    {
      title: t("users.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status]} className="rounded-full px-2.5 capitalize">
          {status}
        </Tag>
      ),
    },
    {
      title: t("users.created"),
      dataIndex: "created",
      key: "created",
      render: (created: string) => <span className="text-[#8F8E8A]">{created}</span>,
    },
    {
      title: t("common.actions"),
      key: "actions",
      width: 70,
      render: (_: unknown, record: (typeof users)[0]) => (
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
      <div className="rounded-lg border border-[#8F8E8A]/50 overflow-hidden bg-white">
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          pagination={false}
          className="ant-table-users"
        />
      </div>

      <EditUserModal 
        user={selectedUser} 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen} 
      />
    </>
  )
}
