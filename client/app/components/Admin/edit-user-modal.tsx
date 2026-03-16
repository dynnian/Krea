import { Modal, Input, Select, Form } from "antd"
import { useTranslation } from "react-i18next"

interface User {
  id: string
  username: string
  email: string
  role: string
  status: string
}

interface EditUserModalProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditUserModal({ user, open, onOpenChange }: EditUserModalProps) {
  const { t } = useTranslation()

  if (!user) return null

  return (
    <Modal
      title={<span className="text-lg font-semibold text-[#1B1C1E]">{t("users.editUserTitle")}</span>}
      open={open}
      onCancel={() => onOpenChange(false)}
      onOk={() => onOpenChange(false)}
      okText={t("common.saveChanges")}
      cancelText={t("common.cancel")}
      okButtonProps={{ 
        style: { 
          background: "#0B5107",
          borderColor: "#0B5107",
        } 
      }}
      width={500}
    >
      <p className="text-[#8F8E8A] mb-4">{t("users.editUserDesc")}</p>
      <Form layout="vertical" initialValues={user}>
        <Form.Item 
          label={<span className="text-sm font-medium text-[#1B1C1E]">{t("users.username")}</span>}
          name="username"
        >
          <Input 
            style={{ 
              background: "#F3F3F1", 
              borderColor: "rgba(143, 142, 138, 0.5)",
              borderRadius: 8,
            }} 
          />
        </Form.Item>
        <Form.Item 
          label={<span className="text-sm font-medium text-[#1B1C1E]">{t("users.email")}</span>}
          name="email"
        >
          <Input 
            type="email"
            style={{ 
              background: "#F3F3F1", 
              borderColor: "rgba(143, 142, 138, 0.5)",
              borderRadius: 8,
            }} 
          />
        </Form.Item>
        <Form.Item 
          label={<span className="text-sm font-medium text-[#1B1C1E]">{t("users.role")}</span>}
          name="role"
        >
          <Select
            style={{ width: "100%" }}
            options={[
              { value: "user", label: t("users.user") },
              { value: "artist", label: t("users.artist") },
              { value: "mod", label: t("users.moderator") },
              { value: "admin", label: t("users.admin") },
            ]}
          />
        </Form.Item>
        <Form.Item 
          label={<span className="text-sm font-medium text-[#1B1C1E]">{t("users.status")}</span>}
          name="status"
        >
          <Select
            style={{ width: "100%" }}
            options={[
              { value: "active", label: t("users.active") },
              { value: "suspended", label: t("users.suspended") },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
