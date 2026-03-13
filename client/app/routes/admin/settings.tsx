// routes/admin/settings.tsx
import { Card, Input, Button, Form } from "antd"
import { SettingOutlined, SafetyOutlined } from "@ant-design/icons"
import { useTranslation } from "react-i18next"

const { TextArea } = Input

export default function SettingsPage() {
  const { t } = useTranslation('admin')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1B1C1E]">{t("settings.title")}</h1>
        <p className="text-[#8F8E8A] mt-1">{t("settings.subtitle")}</p>
      </div>

      <Card className="border border-[#8F8E8A]/50 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-[#0B5107]/10">
            <SettingOutlined className="text-lg text-[#0B5107]" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#1B1C1E]">{t("settings.generalSettings")}</h3>
            <p className="text-sm text-[#8F8E8A]">{t("settings.generalSettingsDesc")}</p>
          </div>
        </div>

        <Form layout="vertical">
          <Form.Item 
            label={<span className="text-sm font-medium text-[#1B1C1E]">{t("settings.platformName")}</span>}
          >
            <Input 
              defaultValue="Krea Admin"
              style={{ 
                background: "#F3F3F1", 
                borderColor: "rgba(143, 142, 138, 0.5)",
                borderRadius: 8,
              }} 
            />
          </Form.Item>
          <Form.Item 
            label={<span className="text-sm font-medium text-[#1B1C1E]">{t("settings.description")}</span>}
          >
            <TextArea 
              rows={3}
              defaultValue={t("settings.platformDescription")}
              style={{ 
                background: "#F3F3F1", 
                borderColor: "rgba(143, 142, 138, 0.5)",
                borderRadius: 8,
                resize: "none",
              }} 
            />
          </Form.Item>
          <Form.Item 
            label={<span className="text-sm font-medium text-[#1B1C1E]">{t("settings.adminEmail")}</span>}
          >
            <Input 
              type="email"
              defaultValue="admin@krea.app"
              style={{ 
                background: "#F3F3F1", 
                borderColor: "rgba(143, 142, 138, 0.5)",
                borderRadius: 8,
              }} 
            />
          </Form.Item>
          <div className="flex justify-end pt-4">
            <Button
              type="primary"
              style={{ 
                background: "#0B5107",
                borderColor: "#0B5107",
              }}
            >
              {t("common.saveChanges")}
            </Button>
          </div>
        </Form>
      </Card>

      <Card className="border border-[#8F8E8A]/50 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-[#f59e0b]/10">
            <SafetyOutlined className="text-lg text-[#f59e0b]" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#1B1C1E]">{t("settings.securitySettings")}</h3>
            <p className="text-sm text-[#8F8E8A]">{t("settings.securitySettingsDesc")}</p>
          </div>
        </div>

        <Form layout="vertical">
          <Form.Item 
            label={<span className="text-sm font-medium text-[#1B1C1E]">{t("settings.sessionTimeout")}</span>}
          >
            <Input 
              type="number"
              defaultValue="60"
              style={{ 
                background: "#F3F3F1", 
                borderColor: "rgba(143, 142, 138, 0.5)",
                borderRadius: 8,
              }} 
            />
          </Form.Item>
          <Form.Item 
            label={<span className="text-sm font-medium text-[#1B1C1E]">{t("settings.maxLoginAttempts")}</span>}
          >
            <Input 
              type="number"
              defaultValue="5"
              style={{ 
                background: "#F3F3F1", 
                borderColor: "rgba(143, 142, 138, 0.5)",
                borderRadius: 8,
              }} 
            />
          </Form.Item>
          <div className="flex justify-end pt-4">
            <Button
              type="primary"
              style={{ 
                background: "#0B5107",
                borderColor: "#0B5107",
              }}
            >
              {t("common.saveChanges")}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}