// routes/admin/settings.tsx
import { useState, useEffect } from 'react';
import { Card, Input, Button, Form, Spin, Alert, message } from 'antd';
import { SettingOutlined, SafetyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { getConfiguration, updateConfiguration } from '@/services/admin/configurationService';
import { changePassword } from '@/services/admin/authService';
import type { AdminInstanceConfigurationDto } from '@/types/admin';

const { TextArea } = Input;

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AdminInstanceConfigurationDto | null>(null);
  const [generalForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const data = await getConfiguration();
        setConfig(data);
        generalForm.setFieldsValue(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch configuration:', err);
        setError(t('settings.fetchError') || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [t, generalForm]);

  const handleGeneralSave = async (values: AdminInstanceConfigurationDto) => {
    try {
      setSaving(true);
      await updateConfiguration(values);
      setConfig(values);
      message.success(t('settings.updateSuccess'));
    } catch (err) {
      console.error('Failed to update configuration:', err);
      message.error(t('settings.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (!user) return;
    if (values.newPassword !== values.confirmPassword) {
      message.error(t('settings.passwordsDoNotMatch'));
      return;
    }
    try {
      setChangingPassword(true);
      await changePassword({
        userId: user.id,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success(t('settings.passwordChangeSuccess'));
      passwordForm.resetFields();
    } catch (err) {
      console.error('Failed to change password:', err);
      message.error(t('settings.passwordChangeError'));
    } finally {
      setChangingPassword(false);
    }
  };

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
        message={t('common.error')}
        description={error}
        type="error"
        showIcon
        className="mb-6"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1B1C1E]">{t('settings.title')}</h1>
        <p className="text-[#8F8E8A] mt-1">{t('settings.subtitle')}</p>
      </div>

      {/* General Settings Card */}
      <Card className="border border-[#8F8E8A]/50 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-[#0B5107]/10">
            <SettingOutlined className="text-lg text-[#0B5107]" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#1B1C1E]">{t('settings.generalSettings')}</h3>
            <p className="text-sm text-[#8F8E8A]">{t('settings.generalSettingsDesc')}</p>
          </div>
        </div>

        <Form
          form={generalForm}
          layout="vertical"
          onFinish={handleGeneralSave}
          initialValues={config || {}}
        >
          <Form.Item
            label={<span className="text-sm font-medium text-[#1B1C1E]">{t('settings.platformName')}</span>}
            name="platformName"
            rules={[{ required: true, message: t('settings.platformNameRequired') }]}
          >
            <Input
              style={{
                background: '#F3F3F1',
                borderColor: 'rgba(143, 142, 138, 0.5)',
                borderRadius: 8,
              }}
            />
          </Form.Item>
          <Form.Item
            label={<span className="text-sm font-medium text-[#1B1C1E]">{t('settings.description')}</span>}
            name="description"
            rules={[{ required: true, message: t('settings.descriptionRequired') }]}
          >
            <TextArea
              rows={3}
              style={{
                background: '#F3F3F1',
                borderColor: 'rgba(143, 142, 138, 0.5)',
                borderRadius: 8,
                resize: 'none',
              }}
            />
          </Form.Item>
          <Form.Item
            label={<span className="text-sm font-medium text-[#1B1C1E]">{t('settings.adminEmail')}</span>}
            name="administratorEmail"
            rules={[
              { required: true, message: t('settings.emailRequired') },
              { type: 'email', message: t('settings.emailInvalid') }
            ]}
          >
            <Input
              type="email"
              style={{
                background: '#F3F3F1',
                borderColor: 'rgba(143, 142, 138, 0.5)',
                borderRadius: 8,
              }}
            />
          </Form.Item>
          <div className="flex justify-end pt-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              style={{
                background: '#0B5107',
                borderColor: '#0B5107',
              }}
            >
              {t('common.saveChanges')}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}