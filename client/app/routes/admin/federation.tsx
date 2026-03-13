import { Row, Col } from "antd"
import { InstanceInfo } from "client/app/components/Admin/instance-info.tsx"          
import { FederationSettings } from "client/app/components/Admin/federation-settings.tsx" 
import { RemoteInstancesList } from "client/app/components/Admin/remote-instances-list.tsx" 
import { useTranslation } from "react-i18next"

export default function FederationPage() {
  const { t } = useTranslation('admin') // use admin namespace

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1B1C1E]">{t("federation.title")}</h1>
        <p className="text-[#8F8E8A] mt-1">{t("federation.subtitle")}</p>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <InstanceInfo />
        </Col>
        <Col xs={24} lg={12}>
          <FederationSettings />
        </Col>
      </Row>

      <RemoteInstancesList />
    </div>
  )
}