// components/Admin/users-table.tsx
import { useState } from 'react';
import { Table, Avatar, Tag, Dropdown, Button, Modal, message } from 'antd'; // import Modal and message
import {
  MoreOutlined,
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { EditUserModal } from './edit-user-modal';
import { useTranslation } from 'react-i18next';
import { updateUserStatus, updateUserRole, deleteUser } from '@/services/admin/usersService';
import type { AdminUserListItemDto } from '@/types/admin';
import type { MenuProps } from 'antd';

const statusMap: Record<number, { color: string; text: string }> = {
  1: { color: '#10b981', text: 'active' },
  2: { color: '#f59e0b', text: 'suspended' },
};

const roleColors: Record<string, string> = {
  Artist: 'green',
  Admin: 'blue',
};

interface UsersTableProps {
  data: AdminUserListItemDto[];
  loading: boolean;
  pagination: any; // or proper PaginationProps
  onUserUpdated: () => void;
  availableRoles: string[];
}

export function UsersTable({ data, loading, pagination, onUserUpdated, availableRoles }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<AdminUserListItemDto | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { t } = useTranslation();

  const handleEdit = (user: AdminUserListItemDto) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleStatusChange = async (user: AdminUserListItemDto) => {
    const newStatus = user.status === 1 ? 2 : 1;
    try {
      await updateUserStatus(user.id, { status: newStatus });
      message.success(t('users.statusUpdateSuccess'));
      onUserUpdated();
    } catch (error) {
      console.error('Failed to update status:', error);
      message.error(t('users.statusUpdateError'));
    }
  };

  const handleDelete = (userId: string) => {
    Modal.confirm({
      title: t('users.deleteConfirmTitle'),
      content: t('users.deleteConfirmContent'),
      okText: t('common.delete'),
      cancelText: t('common.cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteUser(userId);
          message.success(t('users.deleteSuccess'));
          onUserUpdated();
        } catch (error) {
          console.error('Failed to delete user:', error);
          message.error(t('users.deleteError'));
        }
      },
    });
  };

  const getMenuItems = (user: AdminUserListItemDto): MenuProps['items'] => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: t('users.editUser'),
      onClick: () => handleEdit(user),
    },
    {
      key: 'status',
      icon: user.status === 1 ? <StopOutlined /> : <CheckCircleOutlined />,
      label: user.status === 1 ? t('users.suspend') : t('users.reactivate'),
      onClick: () => handleStatusChange(user),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: t('users.delete'),
      danger: true,
      onClick: () => handleDelete(user.id),
    },
  ];

  const columns = [
    {
      title: t('users.user'),
      dataIndex: 'username',
      key: 'username',
      render: (_: unknown, record: AdminUserListItemDto) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            className="border-2 border-[#8F8E8A]/30 bg-[#0B5107] text-white"
          >
            {record.displayName?.[0]?.toUpperCase() || record.username[0].toUpperCase()}
          </Avatar>
          <div>
            <div className="font-medium text-[#1B1C1E]">{record.displayName || record.username}</div>
            <div className="text-xs text-[#8F8E8A]">@{record.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: t('users.email'),
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => <span className="text-[#8F8E8A]">{email}</span>,
    },
    {
      title: t('users.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleColors[role] || 'default'} className="rounded-full px-2.5 capitalize">
          {role}
        </Tag>
      ),
    },
    {
      title: t('users.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        const config = statusMap[status] || { color: '#8F8E8A', text: 'unknown' };
        return (
          <Tag
            color={config.color}
            className="rounded-full px-2.5 capitalize text-white border-0"
          >
            {t(`users.${config.text}`)}
          </Tag>
        );
      },
    },
    {
      title: t('users.created'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span className="text-[#8F8E8A]">{new Date(date).toLocaleDateString()}</span>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 70,
      render: (_: unknown, record: AdminUserListItemDto) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
          <Button
            type="text"
            icon={<MoreOutlined className="text-[#8F8E8A]" />}
            className="hover:bg-[#F3F3F1]"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <div className="rounded-lg border border-[#8F8E8A]/50 overflow-hidden bg-white">
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          className="ant-table-users"
        />
      </div>

      <EditUserModal
        user={selectedUser}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={onUserUpdated}
        availableRoles={availableRoles}
      />
    </>
  );
}