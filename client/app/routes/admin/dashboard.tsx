import { Card, Row, Col, Statistic } from "antd"
import { 
  UserOutlined, 
  TeamOutlined, 
  ApiOutlined, 
  FileTextOutlined,
  SafetyOutlined,
  ArrowUpOutlined
} from "@ant-design/icons"
import { Link } from "react-router" 
import { useTranslation } from "react-i18next"

export default function DashboardPage() {
  const { t } = useTranslation() 

  const stats = [
    { label: t("dashboard.totalUsers"), value: "12,847", change: "+12.5%", icon: <UserOutlined /> },
    { label: t("dashboard.activeToday"), value: "3,291", change: "+8.2%", icon: <TeamOutlined /> },
    { label: t("dashboard.federatedInstances"), value: "84", change: "+3", icon: <ApiOutlined /> },
    { label: t("dashboard.pendingReports"), value: "7", change: "-2", icon: <SafetyOutlined /> },
  ]

  const quickActions = [
    {
      title: t("dashboard.userManagement"),
      description: t("dashboard.userManagementDesc"),
      icon: <UserOutlined className="text-xl text-[#0B5107]" />,
      href: "/admin/users", // ✅ updated
      bgColor: "bg-[#0B5107]/10",
    },
    {
      title: t("dashboard.reportsAnalytics"),
      description: t("dashboard.reportsAnalyticsDesc"),
      icon: <FileTextOutlined className="text-xl text-[#6366F1]" />,
      href: "/admin/reports", // ✅ updated
      bgColor: "bg-[#6366F1]/10",
    },
    {
      title: t("dashboard.federationSettings"),
      description: t("dashboard.federationSettingsDesc"),
      icon: <ApiOutlined className="text-xl text-[#1351AA]" />,
      href: "/admin/federation", // ✅ updated
      bgColor: "bg-[#1351AA]/10",
    },
  ]

  const recentActivity = [
    { action: t("activity.newUserRegistration"), user: "alice_creator", time: `2 ${t("activity.minutesAgo")}`, type: "user" },
    { action: t("activity.contentFlagged"), user: "bob_moderator", time: `15 ${t("activity.minutesAgo")}`, type: "moderation" },
    { action: t("activity.federationRequest"), user: "mastodon.social", time: `1 ${t("activity.hourAgo")}`, type: "federation" },
    { action: t("activity.userRoleUpdated"), user: "diana_artist", time: `3 ${t("activity.hoursAgo")}`, type: "admin" },
  ]

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user": return "bg-[#10b981]"
      case "moderation": return "bg-[#f59e0b]"
      case "federation": return "bg-[#6366F1]"
      default: return "bg-[#0B5107]"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1B1C1E]">{t("dashboard.title")}</h1>
        <p className="text-[#8F8E8A] mt-1">{t("dashboard.welcome")}</p>
      </div>

      {/* Stats Grid */}
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="border border-[#8F8E8A]/50 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8F8E8A]">{stat.label}</p>
                  <Statistic 
                    value={stat.value} 
                    valueStyle={{ fontSize: 24, fontWeight: 600, color: "#1B1C1E" }}
                  />
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpOutlined className="text-xs text-[#10b981]" />
                    <span className="text-xs font-medium text-[#10b981]">{stat.change}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0B5107]/10">
                  <span className="text-[#0B5107] text-lg">{stat.icon}</span>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-[#1B1C1E] mb-4">{t("dashboard.quickActions")}</h2>
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} md={12} lg={8} key={index}>
              <Link to={action.href}>
                <Card 
                  hoverable 
                  className="border border-[#8F8E8A]/50 shadow-sm hover:border-[#0B5107]/50 h-full"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${action.bgColor}`}>
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-[#1B1C1E]">{action.title}</h3>
                      <p className="text-sm text-[#8F8E8A] mt-1">{action.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </div>

      {/* Recent Activity */}
      <Card 
        title={<span className="text-lg font-medium text-[#1B1C1E]">{t("dashboard.recentActivity")}</span>}
        className="border border-[#8F8E8A]/50 shadow-sm"
        extra={<span className="text-sm text-[#8F8E8A]">{t("dashboard.latestActions")}</span>}
      >
        <div className="space-y-4">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-[#8F8E8A]/30 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${getActivityColor(item.type)}`} />
                <div>
                  <p className="text-sm font-medium text-[#1B1C1E]">{item.action}</p>
                  <p className="text-xs text-[#8F8E8A]">{item.user}</p>
                </div>
              </div>
              <span className="text-xs text-[#8F8E8A]">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}