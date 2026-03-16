import { Card, Tag, Button, Typography } from "antd"
import { ApiOutlined, CopyOutlined } from "@ant-design/icons"
import { useTranslation } from "react-i18next"

const { Text } = Typography

export function InstanceInfo() {
  const { t } = useTranslation()

  return (
    <Card className="border border-[#8F8E8A]/50 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-[#0B5107]/10">
          <ApiOutlined className="text-lg text-[#0B5107]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-[#1B1C1E]">{t("federation.instanceInfo")}</h3>
          <p className="text-sm text-[#8F8E8A]">{t("federation.instanceInfoDesc")}</p>
        </div>
        <Tag color="success" className="rounded-full px-3">{t("federation.online")}</Tag>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-[#F3F3F1] border border-[#8F8E8A]/30">
          <div>
            <p className="text-xs text-[#8F8E8A] uppercase tracking-wider">{t("federation.instanceName")}</p>
            <p className="text-sm font-medium text-[#1B1C1E] mt-1">Krea Platform</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-[#F3F3F1] border border-[#8F8E8A]/30">
          <div>
            <p className="text-xs text-[#8F8E8A] uppercase tracking-wider">{t("federation.domain")}</p>
            <p className="text-sm font-mono text-[#1B1C1E] mt-1">krea.app</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-[#F3F3F1] border border-[#8F8E8A]/30">
          <div>
            <p className="text-xs text-[#8F8E8A] uppercase tracking-wider">{t("federation.description")}</p>
            <p className="text-sm text-[#1B1C1E] mt-1">{t("federation.instanceDescription")}</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#F3F3F1] border border-[#8F8E8A]/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#8F8E8A] uppercase tracking-wider">{t("federation.publicKey")}</p>
            <Button 
              type="text" 
              icon={<CopyOutlined />} 
              size="small"
              className="text-[#8F8E8A] hover:text-[#0B5107]"
            >
              {t("federation.copy")}
            </Button>
          </div>
          <Text code className="text-xs break-all">
            MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
          </Text>
        </div>
      </div>
    </Card>
  )
}
