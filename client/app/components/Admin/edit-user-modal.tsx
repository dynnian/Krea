import { Modal, Input, Select, Form, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { updateUserRole } from '@/services/admin/usersService';
import type { AdminUserListItemDto } from '@/types/admin';
import { useEffect, useState } from 'react';

interface EditUserModalProps {
  user: AdminUserListItemDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  availableRoles: string[];
}

export function EditUserModal({ user, open, onOpenChange, onSuccess, availableRoles }: EditUserModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && open) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status.toString(),
      });
    }
  }, [user, open, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!user) return;

      setLoading(true);
      await updateUserRole(user.id, { role: values.role });

      message.success(t('users.updateSuccess'));
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to update user:', error);
      message.error(t('users.updateError'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      title={<span className="text-lg font-semibold text-[#1B1C1E]">{t('users.editUserTitle')}</span>}
      open={open}
      onCancel={() => onOpenChange(false)}
      onOk={handleSave}
      okText={t('common.saveChanges')}
      cancelText={t('common.cancel')}
      okButtonProps={{
        loading,
        disabled: loading,
        style: {
          background: '#0B5107',
          borderColor: '#0B5107',
        },
      }}
      width={500}
    >
      <p className="text-[#8F8E8A] mb-4">{t('users.editUserDesc')}</p>
      <Form form={form} layout="vertical">
        <Form.Item
          label={<span className="text-sm font-medium text-[#1B1C1E]">{t('users.username')}</span>}
          name="username"
        >
          <Input
            disabled
            style={{
              background: '#F3F3F1',
              borderColor: 'rgba(143, 142, 138, 0.5)',
              borderRadius: 8,
            }}
          />
        </Form.Item>
        <Form.Item
          label={<span className="text-sm font-medium text-[#1B1C1E]">{t('users.email')}</span>}
          name="email"
        >
          <Input
            disabled
            style={{
              background: '#F3F3F1',
              borderColor: 'rgba(143, 142, 138, 0.5)',
              borderRadius: 8,
            }}
          />
        </Form.Item>
        <Form.Item
          label={<span className="text-sm font-medium text-[#1B1C1E]">{t('users.role')}</span>}
          name="role"
          rules={[{ required: true, message: t('users.roleRequired') }]}
        >
          <Select
            style={{ width: '100%' }}
            options={availableRoles.map((role) => ({
              value: role,
              label: role === 'Artist' ? t('users.artist') : role === 'Admin' ? t('users.admin') : role,
            }))}
          />
        </Form.Item>
        <Form.Item
          label={<span className="text-sm font-medium text-[#1B1C1E]">{t('users.status')}</span>}
          name="status"
        >
          <Select
            disabled
            style={{ width: '100%' }}
            options={[
              { value: '1', label: t('users.active') },
              { value: '0', label: t('users.suspended') },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}