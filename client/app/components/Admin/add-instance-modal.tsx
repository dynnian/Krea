import { Modal, Input, Select, Form } from "antd"
import { useTranslation } from "react-i18next"

const { TextArea } = Input

interface AddInstanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddInstanceModal({ open, onOpenChange }: AddInstanceModalProps) {
  const { t } = useTranslation()

  return (
    <Modal
      title={<span className="text-lg font-semibold text-[#1B1C1E]">{t("federation.addRemoteInstance")}</span>}
      open={open}
      onCancel={() => onOpenChange(false)}
      onOk={() => onOpenChange(false)}
      okText={t("federation.addInstance")}
      cancelText={t("common.cancel")}
      okButtonProps={{ 
        style: { 
          background: "#0B5107",
          borderColor: "#0B5107",
        } 
      }}
      width={500}
    >
      <p className="text-[#8F8E8A] mb-4">{t("federation.addRemoteInstanceDesc")}</p>
      <Form layout="vertical">
        <Form.Item 
          label={<span className="text-sm font-medium text-[#1B1C1E]">{t("federation.instanceNameLabel")}</span>}
          name="instanceName"
        >
          <Input 
            placeholder={t("federation.instanceNamePlaceholder")}
            style={{ 
              background: "#F3F3F1", 
              borderColor: "rgba(143, 142, 138, 0.5)",
              borderRadius: 8,
            }} 
          />
        </Form.Item>
        <Form.Item 
          label={<span className="text-sm font-medium text-[#1B1C1E]">{t("federation.domain")}</span>}
          name="domain"
        >
          <Input 
            placeholder={t("federation.domainPlaceholder")}
            style={{ 
              background: "#F3F3F1", 
              borderColor: "rgba(143, 142, 138, 0.5)",
              borderRadius: 8,
            }} 
          />
        </Form.Item>
        <Form.Item 
          label={<span className="text-sm font-medium text-[#1B1C1E]">{t("federation.trustLevel")}</span>}
          name="trustLevel"
          initialValue="trusted"
        >
          <Select
            style={{ width: "100%" }}
            options={[
              { value: "verified", label: t("federation.verified") },
              { value: "trusted", label: t("federation.trusted") },
              { value: "untrusted", label: t("federation.untrusted") },
            ]}
          />
        </Form.Item>
        <Form.Item 
          label={<span className="text-sm font-medium text-[#1B1C1E]">{t("federation.reason")}</span>}
          name="reason"
        >
          <TextArea 
            rows={3}
            placeholder={t("federation.reasonPlaceholder")}
            style={{ 
              background: "#F3F3F1", 
              borderColor: "rgba(143, 142, 138, 0.5)",
              borderRadius: 8,
              resize: "none",
            }} 
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
