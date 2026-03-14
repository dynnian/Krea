// routes/admin/users.tsx
import { Card } from "antd"
import { UsersTable } from "@/components/Admin/users-table.tsx"
import { UsersFilters } from "@/components/Admin/users-filters.tsx"
import { useTranslation } from "react-i18next"

export default function UsersPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1B1C1E]">{t("users.title")}</h1>
        <p className="text-[#8F8E8A] mt-1">{t("users.subtitle")}</p>
      </div>

      <Card 
        title={<span className="text-lg font-medium text-[#1B1C1E]">{t("users.allUsers")}</span>}
        extra={<span className="text-sm text-[#8F8E8A]">{t("users.allUsersDesc")}</span>}
        className="border border-[#8F8E8A]/50 shadow-sm"
      >
        <UsersFilters />
        <div className="mt-6">
          <UsersTable />
        </div>
      </Card>
    </div>
  )
}