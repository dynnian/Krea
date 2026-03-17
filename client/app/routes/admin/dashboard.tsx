import { Card, Row, Col, Statistic, Spin, Alert } from "antd"
import { 
  UserOutlined, 
  TeamOutlined, 
  ApiOutlined, 
  FileTextOutlined,
  SafetyOutlined,
  ArrowUpOutlined,
  SettingOutlined
} from "@ant-design/icons"
import { Link } from "react-router"
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import { getDashboardStats } from "@/services/admin/dashboardService"
import type { AdminDashboardDto } from "@/types/admin"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export default function DashboardPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AdminDashboardDto | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await getDashboardStats()
        setData(result)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err)
        setError(t("dashboard.fetchError") || "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [t])

  // Format stats from API
  const stats = data ? [
    { label: t("dashboard.totalUsers"), value: data.totalUsers.toLocaleString(), change: "+12.5%", icon: <UserOutlined /> }, // change not from API, keep mock for now
    { label: t("dashboard.activeToday"), value: data.activeToday.toLocaleString(), change: "+8.2%", icon: <TeamOutlined /> },
    { label: t("dashboard.federatedInstances"), value: data.federatedInstances.toLocaleString(), change: "+3", icon: <ApiOutlined /> },
    { label: t("dashboard.pendingReports"), value: data.pendingReports.toLocaleString(), change: "-2", icon: <SafetyOutlined /> },
  ] : []

  const quickActions = [
    {
      title: t("dashboard.userManagement"),
      description: t("dashboard.userManagementDesc"),
      icon: <UserOutlined className="text-xl text-[#0B5107]" />,
      href: "/admin/users",
      bgColor: "bg-[#0B5107]/10",
    },
    {
      title: t("dashboard.reportsAnalytics"),
      description: t("dashboard.reportsAnalyticsDesc"),
      icon: <FileTextOutlined className="text-xl text-[#6366F1]" />,
      href: "/admin/reports",
      bgColor: "bg-[#6366F1]/10",
    },
    {
      title: t("dashboard.Settings"),
      description: t("dashboard.configurationDesc"),
      icon: <SettingOutlined className="text-xl text-[#1351AA]" />,
      href: "/admin/settings",
      bgColor: "bg-[#1351AA]/10",
    },
  ]

  // Format recent activity from API
  const getActivityColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "user": return "bg-[#10b981]"
      case "moderation": return "bg-[#f59e0b]"
      case "federation": return "bg-[#6366F1]"
      default: return "bg-[#0B5107]"
    }
  }

  const formatRelativeTime = (date: string) => {
    return dayjs(date).fromNow()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        message={t("dashboard.errorTitle") || "Error"}
        description={error}
        type="error"
        showIcon
        className="mb-6"
      />
    )
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
          {data?.recentActivity && data.recentActivity.length > 0 ? (
            data.recentActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-[#8F8E8A]/30 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${getActivityColor(item.type)}`} />
                  <div>
                    <p className="text-sm font-medium text-[#1B1C1E]">{item.action}</p>
                    <p className="text-xs text-[#8F8E8A]">{item.source}</p>
                  </div>
                </div>
                <span className="text-xs text-[#8F8E8A]">{formatRelativeTime(item.occurredAt)}</span>
              </div>
            ))
          ) : (
            <p className="text-[#8F8E8A] text-sm">{t("dashboard.noRecentActivity")}</p>
          )}
        </div>
      </Card>
    </div>
  )
}