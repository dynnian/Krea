// app/routes/settings.tsx
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Avatar, Button, Input, Select, Switch, Tabs, Grid, message, Spin, Tag, Table } from "antd";
import { ImagePlus, User, LogOut, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { settingsRepository } from "../services/settingsRepository.ts";
import type {
  ProfileSettings,
  SettingsSectionKey,
  SettingsState,
} from "../types/settings.ts";
import "./settings.css";
import { useAuth } from "../contexts/AuthContext.tsx";
import { useNavigate } from "react-router";
import i18n from "../i18n";
import { reportsApi } from "../services/reportsService.ts";
import { paymentsApi, type PaymentItem } from "../services/paymentsService.ts";

const { useBreakpoint } = Grid;

// Opciones de idioma en formato ISO
const languageOptions = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
];

// Opciones de zona horaria (valor real)
const timeZoneOptions = [
  { value: "America/Santo_Domingo", label: "America/Santo_Domingo" },
  // Se pueden agregar más zonas si el backend las soporta
];

// Secciones
const settingsSections: { key: SettingsSectionKey; label: string }[] = [
  { key: "profile", label: "Perfil" },
  { key: "portfolio", label: "Portafolios" },
  { key: "security", label: "Seguridad" },
  { key: "donations", label: "Donaciones" },
  { key: "reports", label: "Reportes" },
];

const emptyProfileDraft: ProfileSettings = {
  username: "",
  email: "",
  displayName: "",
  biography: "",
  languageCode: "",
  timeZoneId: "",
  profilePictureUrl: null,
  bannerPictureUrl: null,
  profilePictureId: null,
  bannerPictureId: null,
};

// Normalizar código de idioma (1→es, 2→en)
const normalizeLanguageCode = (code: string | undefined): string => {
  if (code === "1") return "es";
  if (code === "2") return "en";
  return code || "es";
};

// Normalizar zona horaria (1→America/Santo_Domingo)
const normalizeTimeZoneId = (tz: string | undefined): string => {
  if (tz === "1") return "America/Santo_Domingo";
  return tz || "America/Santo_Domingo";
};

export default function SettingsRoute() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [activeSection, setActiveSection] = useState<SettingsSectionKey>("profile");
  const [settingsState, setSettingsState] = useState<SettingsState | null>(null);
  const [profileDraft, setProfileDraft] = useState<ProfileSettings>(emptyProfileDraft);
  const [originalProfile, setOriginalProfile] = useState<ProfileSettings | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsHasMore, setReportsHasMore] = useState(true);
  const [sentPayments, setSentPayments] = useState<PaymentItem[]>([]);
  const [receivedPayments, setReceivedPayments] = useState<PaymentItem[]>([]);
  const [sentLoading, setSentLoading] = useState(false);
  const [receivedLoading, setReceivedLoading] = useState(false);
  const [sentPagination, setSentPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [receivedPagination, setReceivedPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // --- Carga inicial de settings ---
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsRepository.getSettings();
        const normalizedProfile = {
          ...data.profile,
          languageCode: normalizeLanguageCode(data.profile.languageCode),
          timeZoneId: normalizeTimeZoneId(data.profile.timeZoneId),
        };
        setSettingsState({ ...data, profile: normalizedProfile });
        setProfileDraft(normalizedProfile);
        setOriginalProfile(normalizedProfile);

        const langCode = normalizedProfile.languageCode;
        if (langCode && langCode !== i18n.language) {
          await i18n.changeLanguage(langCode);
          localStorage.setItem("lang", langCode);
        }
      } catch {
        message.error(t("settingsUser.load_error"));
      }
    };
    void loadSettings();
  }, [t]);

  // --- Cargar reportes al entrar a la pestaña ---
  useEffect(() => {
    if (activeSection === "reports") {
      setReportsPage(1);
      loadReports(1);
    }
  }, [activeSection]);

  // --- Cargar pagos al entrar a la pestaña ---
  useEffect(() => {
    if (activeSection === "donations") {
      loadSentPayments(1, 10);
      loadReceivedPayments(1, 10);
    }
  }, [activeSection]);

  // --- Funciones auxiliares de perfil ---
  const handleInputChange =
    (field: keyof ProfileSettings) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setProfileDraft((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleCancelProfile = () => {
    if (!originalProfile) return;
    setProfileDraft(originalProfile);
  };

  const handleSaveProfile = async () => {
    if (!originalProfile) return;
    try {
      setIsSavingProfile(true);
      const profileToSave = { ...profileDraft };
      const next = await settingsRepository.saveProfile(profileToSave, originalProfile);
      const normalizedNextProfile = {
        ...next.profile,
        languageCode: normalizeLanguageCode(next.profile.languageCode),
        timeZoneId: normalizeTimeZoneId(next.profile.timeZoneId),
      };
      const nextState = { ...next, profile: normalizedNextProfile };
      setSettingsState(nextState);
      setProfileDraft(normalizedNextProfile);
      setOriginalProfile(normalizedNextProfile);

      const newLangCode = normalizedNextProfile.languageCode;
      const oldLangCode = originalProfile.languageCode;
      if (newLangCode !== oldLangCode) {
        await i18n.changeLanguage(newLangCode);
        localStorage.setItem("lang", newLangCode);
      }
      message.success(t("settingsUser.save_success"));
    } catch {
      message.error(t("settingsUser.save_error"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleOpenAvatarPicker = () => fileInputRef.current?.click();
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleProfilePictureSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingAvatar(true);
      const uploaded = await settingsRepository.uploadProfilePicture(file);
      setProfileDraft((prev) => ({
        ...prev,
        profilePictureId: uploaded.mediaId,
        profilePictureUrl: uploaded.url,
      }));
      message.success(t("settingsUser.avatar_upload_success"));
    } catch {
      message.error(t("settingsUser.avatar_upload_error"));
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  };

  // --- Portfolio toggles ---
  const handlePortfolioToggle = async (
    field: "imagesEnabled" | "musicEnabled" | "literatureEnabled",
    value: boolean
  ) => {
    if (!settingsState) return;
    const nextPortfolio = { ...settingsState.portfolio, [field]: value };
    setSettingsState((prev) => (prev ? { ...prev, portfolio: nextPortfolio } : prev));
    await settingsRepository.savePortfolio(nextPortfolio);
    message.success(t("settingsUser.portfolio_toggled"));
  };

  // --- Security toggles ---
  const handleSecurityToggle = async (
    field: "email2faEnabled" | "sms2faEnabled",
    value: boolean
  ) => {
    if (!settingsState) return;
    const nextSecurity = { ...settingsState.security, [field]: value };
    setSettingsState((prev) => (prev ? { ...prev, security: nextSecurity } : prev));
    await settingsRepository.saveSecurity(nextSecurity);
    message.success(t("settingsUser.security_toggled"));
  };

  // --- Carga de reportes (paginar con "cargar más") ---
  const loadReports = async (page: number) => {
    if (reportsLoading) return;
    setReportsLoading(true);
    try {
      const res = await reportsApi.getMyReports(page, 10);
      const items = res.data.items || [];
      setReports(prev => (page === 1 ? items : [...prev, ...items]));
      setReportsHasMore(items.length === 10);
    } catch {
      message.error(t("settingsUser.reports.load_error"));
    } finally {
      setReportsLoading(false);
    }
  };

  // --- Carga de pagos enviados ---
  const loadSentPayments = async (page: number, pageSize: number) => {
    setSentLoading(true);
    try {
      const res = await paymentsApi.getSentPayments({ page, pageSize });
      setSentPayments(res.data.items);
      setSentPagination({
        current: res.data.page,
        pageSize: res.data.pageSize,
        total: res.data.totalCount,
      });
    } catch {
      message.error(t("settingsUser.donations.sent_load_error"));
    } finally {
      setSentLoading(false);
    }
  };

  // --- Carga de pagos recibidos ---
  const loadReceivedPayments = async (page: number, pageSize: number) => {
    setReceivedLoading(true);
    try {
      const res = await paymentsApi.getReceivedPayments({ page, pageSize });
      setReceivedPayments(res.data.items);
      setReceivedPagination({
        current: res.data.page,
        pageSize: res.data.pageSize,
        total: res.data.totalCount,
      });
    } catch {
      message.error(t("settingsUser.donations.received_load_error"));
    } finally {
      setReceivedLoading(false);
    }
  };

  if (!settingsState) {
    return (
      <section className="settings-page">
        <div className="settings-shell">
          <aside className="settings-sidebar">
            <h1 className="settings-title">{t("settingsUser.title")}</h1>
          </aside>
          <div className="settings-content">{t("common.loading")}</div>
        </div>
      </section>
    );
  }

  // --- Renderizadores de secciones ---
  const renderProfileSection = () => (
    <>
      <h2 className="settings-content-title">{t("settingsUser.profile.edit")}</h2>
      <div className="settings-avatar-row">
        <Avatar
          key={profileDraft.profilePictureUrl ?? "empty-avatar"}
          size={74}
          src={profileDraft.profilePictureUrl || undefined}
          icon={<User size={36} />}
          className="settings-avatar"
        />
        <Button
          className="settings-avatar-button"
          type="default"
          loading={isUploadingAvatar}
          onClick={handleOpenAvatarPicker}
        >
          {t("settingsUser.profile.change_avatar")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          style={{ display: "none" }}
          onChange={handleProfilePictureSelected}
        />
      </div>

      <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
        <label className="settings-label" htmlFor="username">
          {t("settingsUser.profile.username")}
        </label>
        <Input id="username" value={profileDraft.username} readOnly className="settings-input" />

        <label className="settings-label" htmlFor="email">
          {t("settingsUser.profile.email")}
        </label>
        <Input id="email" value={profileDraft.email} readOnly className="settings-input" />

        <label className="settings-label" htmlFor="displayName">
          {t("settingsUser.profile.displayName")}
        </label>
        <Input
          id="displayName"
          value={profileDraft.displayName}
          onChange={handleInputChange("displayName")}
          placeholder={t("settingsUser.profile.displayName_placeholder")}
          className="settings-input"
        />

        <label className="settings-label" htmlFor="biography">
          {t("settingsUser.profile.biography")}
        </label>
        <Input.TextArea
          id="biography"
          value={profileDraft.biography}
          onChange={handleInputChange("biography")}
          className="settings-textarea"
          rows={4}
        />

        <label className="settings-label" htmlFor="languageCode">
          {t("settingsUser.profile.language")}
        </label>
        <Select
          id="languageCode"
          value={profileDraft.languageCode}
          onChange={(value) => setProfileDraft((prev) => ({ ...prev, languageCode: value }))}
          options={languageOptions}
          className="settings-input"
        />

        <label className="settings-label" htmlFor="timeZoneId">
          {t("settingsUser.profile.timezone")}
        </label>
        <Select
          id="timeZoneId"
          value={profileDraft.timeZoneId}
          onChange={(value) => setProfileDraft((prev) => ({ ...prev, timeZoneId: value }))}
          options={timeZoneOptions}
          className="settings-input"
        />
      </form>

      <div className="settings-actions">
        <Button className="settings-cancel-button" onClick={handleCancelProfile}>
          {t("common.cancel")}
        </Button>
        <Button
          className="settings-save-button"
          type="primary"
          loading={isSavingProfile}
          onClick={() => void handleSaveProfile()}
        >
          {t("common.save")}
        </Button>
      </div>
    </>
  );

  const renderPortfolioSection = () => (
    <>
      <div className="settings-section-header-row">
        <h2 className="settings-section-title">{t("settingsUser.portfolio.title")}</h2>
      </div>
      <div className="settings-toggle-list">
        <div className="settings-toggle-row">
          <p>{t("settingsUser.portfolio.images")}</p>
          <Switch
            checked={settingsState.portfolio.imagesEnabled}
            onChange={(checked) => void handlePortfolioToggle("imagesEnabled", checked)}
          />
        </div>
        <div className="settings-toggle-row">
          <p>{t("settingsUser.portfolio.music")}</p>
          <Switch
            checked={settingsState.portfolio.musicEnabled}
            onChange={(checked) => void handlePortfolioToggle("musicEnabled", checked)}
          />
        </div>
        <div className="settings-toggle-row">
          <p>{t("settingsUser.portfolio.literature")}</p>
          <Switch
            checked={settingsState.portfolio.literatureEnabled}
            onChange={(checked) => void handlePortfolioToggle("literatureEnabled", checked)}
          />
        </div>
      </div>
    </>
  );

  const renderSecuritySection = () => (
    <>
      <div className="settings-section-header-row">
        <h2 className="settings-section-title">{t("settingsUser.security.title")}</h2>
      </div>
      <div className="settings-security-wrap">
        <p className="settings-security-label">{t("settingsUser.security.change_password")}</p>
        <Button className="settings-avatar-button settings-security-password-button">
          {t("settingsUser.security.go_to_change")}
        </Button>
      </div>
      <div className="settings-security-wrap">
        <p className="settings-security-label">{t("settingsUser.security.two_factor")}</p>
        <div className="settings-toggle-list">
          <div className="settings-toggle-row">
            <p>{t("settingsUser.security.email_2fa")}</p>
            <Switch
              checked={settingsState.security.email2faEnabled}
              onChange={(checked) => void handleSecurityToggle("email2faEnabled", checked)}
            />
          </div>
          <div className="settings-toggle-row">
            <p>{t("settingsUser.security.sms_2fa")}</p>
            <Switch
              checked={settingsState.security.sms2faEnabled}
              onChange={(checked) => void handleSecurityToggle("sms2faEnabled", checked)}
            />
          </div>
        </div>
      </div>
    </>
  );

  // --- Configuración de colores para estados de pago (fuera de la función) ---
  const paymentStatusConfig: Record<string, { color: string; bg: string }> = {
    Pending: { color: "#D48806", bg: "#FFF7E6" },
    Completed: { color: "#0B5107", bg: "#E9FDE8" },
    Failed: { color: "#D4380D", bg: "#FFF2E8" },
    default: { color: "#1B1C1E", bg: "#F3F3F1" },
  };

  // Columnas de la tabla de pagos (usado en renderPaymentsTable)
  const paymentColumns = [
    { title: t("settingsUser.donations.columns.type"), dataIndex: "paymentType", key: "type" },
    { title: t("settingsUser.donations.columns.amount"), dataIndex: "amount", key: "amount", render: (val: number) => `${val} ${t("settingsUser.donations.currency")}` },
    {
      title: t("settingsUser.donations.columns.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const config = paymentStatusConfig[status] || paymentStatusConfig.default;
        return (
          <Tag
            style={{
              backgroundColor: config.bg,
              border: `1px solid ${config.color}`,
              color: config.color,
              borderRadius: "9999px",
              fontWeight: 500,
              fontSize: "12px",
              padding: "2px 12px",
            }}
            className="capitalize"
          >
            {t(`settingsUser.donations.status.${status.toLowerCase()}`)}
          </Tag>
        );
      },
    },
    { title: t("settingsUser.donations.columns.date"), dataIndex: "paidAt", key: "date", render: (date: string) => (date ? new Date(date).toLocaleString() : "—") },
    { title: t("settingsUser.donations.columns.counterparty"), dataIndex: "counterpartyName", key: "counterparty" },
    { title: t("settingsUser.donations.columns.reference"), dataIndex: "reference", key: "reference", render: (ref: string | null) => ref || "—" },
  ];

  // Componente reutilizable de tabla de pagos
  const renderPaymentsTable = (
    data: PaymentItem[],
    loading: boolean,
    pagination: { current: number; pageSize: number; total: number },
    onPageChange: (page: number, pageSize: number) => void
  ) => (
    <Table
      columns={paymentColumns}
      dataSource={data}
      rowKey="paymentId"
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: onPageChange,
        showSizeChanger: true,
        showTotal: (total) => `${t("common.total")} ${total} ${t("common.items")}`,
      }}
      scroll={{ x: "max-content" }}
      components={{
        header: {
          cell: (props: any) => (
            <th {...props} style={{ backgroundColor: "#F9FAFB", color: "#1B1C1E", fontWeight: 600 }} />
          ),
        },
      }}
      className="payments-table"
    />
  );

  // Render de la sección Donaciones
  const renderDonationsSection = () => (
    <>
      <div className="settings-section-header-row">
        <h2 className="settings-section-title">{t("settingsUser.donations.title")}</h2>
      </div>
      <Tabs
        defaultActiveKey="sent"
        items={[
          {
            key: "sent",
            label: t("settingsUser.donations.sent"),
            children: renderPaymentsTable(sentPayments, sentLoading, sentPagination, (page, pageSize) => {
              setSentPagination((prev) => ({ ...prev, current: page, pageSize }));
              loadSentPayments(page, pageSize);
            }),
          },
          {
            key: "received",
            label: t("settingsUser.donations.received"),
            children: renderPaymentsTable(receivedPayments, receivedLoading, receivedPagination, (page, pageSize) => {
              setReceivedPagination((prev) => ({ ...prev, current: page, pageSize }));
              loadReceivedPayments(page, pageSize);
            }),
          },
        ]}
      />
    </>
  );

  // Render de la sección Reportes (lista simple con "cargar más")
  const renderReportsSection = () => (
    <>
      <div className="settings-section-header-row">
        <h2 className="settings-section-title">{t("settingsUser.reports.title")}</h2>
      </div>
      <div className="reports-list">
        {reports.length === 0 && !reportsLoading && (
          <p className="settings-empty">{t("settingsUser.reports.empty")}</p>
        )}
        {reports.map((report) => (
          <div
            key={report.reportId}
            className="report-card settings-toggle-row"
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "8px",
              padding: "12px 0",
              borderBottom: "1px solid #e8e8e8",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <strong>{report.reason}</strong>
              <span className={`report-status-${report.status === 1 ? "pending" : "resolved"}`}>
                {report.status === 1 ? t("settingsUser.reports.pending") : t("settingsUser.reports.resolved")}
              </span>
            </div>
            {report.details && (
              <div style={{ fontSize: "13px", color: "#555" }}>
                <strong>{t("settingsUser.reports.details")}:</strong> {report.details}
              </div>
            )}
            {report.resolvedAction && (
              <div style={{ fontSize: "13px" }}>
                <strong>{t("settingsUser.reports.resolved_action")}:</strong> {report.resolvedAction}
              </div>
            )}
            {report.moderatorNote && (
              <div style={{ fontSize: "13px" }}>
                <strong>{t("settingsUser.reports.moderator_note")}:</strong> {report.moderatorNote}
              </div>
            )}
            <div style={{ fontSize: "12px", color: "#999" }}>{new Date(report.createdAt).toLocaleString()}</div>
          </div>
        ))}
        {reportsLoading && (
          <div className="text-center py-2">
            <Spin />
          </div>
        )}
        {reportsHasMore && !reportsLoading && (
          <Button
            type="link"
            onClick={() => {
              setReportsPage((p) => p + 1);
              loadReports(reportsPage + 1);
            }}
          >
            {t("common.load_more")}
          </Button>
        )}
      </div>
    </>
  );

  const renderActiveContent = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSection();
      case "portfolio":
        return renderPortfolioSection();
      case "security":
        return renderSecuritySection();
      case "donations":
        return renderDonationsSection();
      case "reports":
        return renderReportsSection();
      default:
        return renderProfileSection();
    }
  };

  const mobileTabItems = [
    { key: "profile", label: t("settingsUser.sections.profile"), children: renderProfileSection() },
    { key: "portfolio", label: t("settingsUser.sections.portfolio"), children: renderPortfolioSection() },
    { key: "security", label: t("settingsUser.sections.security"), children: renderSecuritySection() },
    { key: "donations", label: t("settingsUser.sections.donations"), children: renderDonationsSection() },
    { key: "reports", label: t("settingsUser.sections.reports"), children: renderReportsSection() },
  ];

  return (
    <section className="settings-page">
      <div className="settings-shell">
        {!isMobile ? (
          // Desktop: sidebar + content
          <>
            <aside className="settings-sidebar">
              <h1 className="settings-title">{t("settingsUser.title")}</h1>
              <nav aria-label={t("settingsUser.nav_label")} className="settings-nav">
                {settingsSections.map((section) => (
                  <button
                    key={section.key}
                    type="button"
                    className={`settings-nav-item ${
                      activeSection === section.key ? "settings-nav-item--active" : ""
                    }`}
                    onClick={() => setActiveSection(section.key)}
                  >
                    {t(`settingsUser.sections.${section.key}`)}
                  </button>
                ))}
              </nav>
              <div className="settings-logout-wrap">
                <button
                  type="button"
                  className="settings-logout-button"
                  onClick={() => void handleLogout()}
                >
                  <LogOut size={18} />
                  <span>{t("common.logout")}</span>
                </button>
              </div>
            </aside>
            <div className="settings-content">{renderActiveContent()}</div>
          </>
        ) : (
          // Mobile: horizontal scrollable tabs
          <div className="settings-mobile-tabs">
            <h1 className="settings-title">{t("settingsUser.title")}</h1>
            <Tabs
              activeKey={activeSection}
              onChange={(key) => setActiveSection(key as SettingsSectionKey)}
              items={mobileTabItems}
              tabBarStyle={{
                overflowX: "auto",
                whiteSpace: "nowrap",
                scrollbarWidth: "thin",
                marginBottom: 16,
              }}
              className="settings-tabs-mobile"
            />
            <div className="settings-logout-wrap-mobile">
              <button
                type="button"
                className="settings-logout-button"
                onClick={() => void handleLogout()}
              >
                <LogOut size={18} />
                <span>{t("common.logout")}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}