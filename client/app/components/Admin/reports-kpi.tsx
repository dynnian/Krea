import { Card, Row, Col, Statistic } from "antd"
import { 
  UserOutlined, 
  UserDeleteOutlined, 
  FileTextOutlined, 
  ApiOutlined, 
  SafetyOutlined 
} from "@ant-design/icons"
import { useTranslation } from "react-i18next"

export function ReportsKPI() {
  const { t } = useTranslation()

  const kpis = [
    {
      title: t("reports.activeUsers"),
      value: "12,847",
      change: "+12.5%",
      icon: <UserOutlined className="text-[#10b981]" />,
      bgColor: "bg-[#10b981]/10",
      isPositive: true,
    },
    {
      title: t("reports.suspendedUsers"),
      value: "127",
      change: "-3.2%",
      icon: <UserDeleteOutlined className="text-[#ef4444]" />,
      bgColor: "bg-[#ef4444]/10",
      isPositive: true,
    },
    {
      title: t("reports.totalPosts"),
      value: "145.2K",
      change: "+8.1%",
      icon: <FileTextOutlined className="text-[#1351AA]" />,
      bgColor: "bg-[#1351AA]/10",
      isPositive: true,
    },
    {
      title: t("reports.federationInteractions"),
      value: "8,429",
      change: "+15.7%",
      icon: <ApiOutlined className="text-[#6366F1]" />,
      bgColor: "bg-[#6366F1]/10",
      isPositive: true,
    },
    {
      title: t("reports.moderationActions"),
      value: "342",
      change: "+5.3%",
      icon: <SafetyOutlined className="text-[#f59e0b]" />,
      bgColor: "bg-[#f59e0b]/10",
      isPositive: false,
    },
  ]

  return (
    <Row gutter={[16, 16]}>
      {kpis.map((kpi, index) => (
        <Col xs={24} sm={12} lg={4} xl={Math.floor(24 / 5)} key={index}>
          <Card className="border border-[#8F8E8A]/50 shadow-sm h-full">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-lg ${kpi.bgColor}`}>
                {kpi.icon}
              </div>
            </div>
            <p className="text-sm font-medium text-[#8F8E8A]">{kpi.title}</p>
            <Statistic 
              value={kpi.value} 
              valueStyle={{ fontSize: 24, fontWeight: 600, color: "#1B1C1E" }}
            />
            <p className={`text-xs mt-2 font-medium ${kpi.isPositive ? "text-[#10b981]" : "text-[#f59e0b]"}`}>
              {kpi.change} {t("common.fromLastMonth")}
            </p>
          </Card>
        </Col>
      ))}
    </Row>
  )
}
