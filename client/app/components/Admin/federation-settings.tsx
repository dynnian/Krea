import { Card, Switch, Button, Row, Col } from "antd"
import { SettingOutlined, CheckCircleOutlined, LineChartOutlined, WarningOutlined } from "@ant-design/icons"
import { useTranslation } from "react-i18next"

export function FederationSettings() {
  const { t } = useTranslation()

  return (
    <Card className="border border-[#8F8E8A]/50 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-[#0B5107]/10">
          <SettingOutlined className="text-lg text-[#0B5107]" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-[#1B1C1E]">{t("federation.federationSettings")}</h3>
          <p className="text-sm text-[#8F8E8A]">{t("federation.federationSettingsDesc")}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-[#F3F3F1] border border-[#8F8E8A]/30">
          <div>
            <p className="text-sm font-medium text-[#1B1C1E]">{t("federation.enableFederation")}</p>
            <p className="text-xs text-[#8F8E8A]">{t("federation.enableFederationDesc")}</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-[#F3F3F1] border border-[#8F8E8A]/30">
          <div>
            <p className="text-sm font-medium text-[#1B1C1E]">{t("federation.allowIncoming")}</p>
            <p className="text-xs text-[#8F8E8A]">{t("federation.allowIncomingDesc")}</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-[#F3F3F1] border border-[#8F8E8A]/30">
          <div>
            <p className="text-sm font-medium text-[#1B1C1E]">{t("federation.allowOutgoing")}</p>
            <p className="text-xs text-[#8F8E8A]">{t("federation.allowOutgoingDesc")}</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <div className="border-t border-[#8F8E8A]/30 mt-6 pt-6">
        <h4 className="text-sm font-semibold text-[#1B1C1E] mb-4">{t("federation.systemHealth")}</h4>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[#F3F3F1] border border-[#8F8E8A]/30">
              <div className="p-2.5 rounded-lg bg-[#10b981]/15">
                <CheckCircleOutlined className="text-[#10b981]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1B1C1E]">{t("federation.federationQueue")}</p>
                <p className="text-xs text-[#8F8E8A]">12 {t("federation.pending")}</p>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[#F3F3F1] border border-[#8F8E8A]/30">
              <div className="p-2.5 rounded-lg bg-[#0B5107]/15">
                <LineChartOutlined className="text-[#0B5107]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1B1C1E]">{t("federation.deliverySuccess")}</p>
                <p className="text-xs text-[#8F8E8A]">98.5%</p>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[#F3F3F1] border border-[#8F8E8A]/30">
              <div className="p-2.5 rounded-lg bg-[#f59e0b]/15">
                <WarningOutlined className="text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1B1C1E]">{t("federation.failedAttempts")}</p>
                <p className="text-xs text-[#8F8E8A]">18 {t("federation.in24h")}</p>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          type="primary"
          style={{ 
            background: "#0B5107",
            borderColor: "#0B5107",
          }}
        >
          {t("common.saveSettings")}
        </Button>
      </div>
    </Card>
  )
}
