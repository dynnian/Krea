import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Avatar, Button, Input, Select, Switch, Tabs, Grid, message } from "antd";
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

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsRepository.getSettings();
        // Normalizar idioma y zona horaria
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
      // Antes de guardar, convertir la zona horaria al formato que espera el backend (si usa "1")
      const profileToSave = {
        ...profileDraft,
        // Si el backend espera "1" para esta zona, puedes mapear de vuelta:
        // timeZoneId: profileDraft.timeZoneId === "America/Santo_Domingo" ? "1" : profileDraft.timeZoneId,
      };
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

  // Renderizado de secciones (sin cambios)
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

  const renderDonationsSection = () => (
    <>
      <div className="settings-section-header-row">
        <h2 className="settings-section-title">{t("settingsUser.donations.title")}</h2>
      </div>
      <div className="settings-donations-content">
        <p className="settings-description">{t("settingsUser.donations.description")}</p>
        <div className="settings-donations-buttons">
          <Button type="primary" icon={<Heart size={16} />} href="https://www.paypal.com/donate" target="_blank">
            PayPal
          </Button>
          <Button icon={<Heart size={16} />} href="https://www.patreon.com/" target="_blank">
            Patreon
          </Button>
          <Button href="https://ko-fi.com/" target="_blank">
            Ko-fi
          </Button>
        </div>
        <p className="settings-donations-note">{t("settingsUser.donations.note")}</p>
      </div>
    </>
  );

  const renderActiveContent = () => {
    switch (activeSection) {
      case "profile": return renderProfileSection();
      case "portfolio": return renderPortfolioSection();
      case "security": return renderSecuritySection();
      case "donations": return renderDonationsSection();
      default: return renderProfileSection();
    }
  };

  const mobileTabItems = [
    { key: "profile", label: t("settingsUser.sections.profile"), children: renderProfileSection() },
    { key: "portfolio", label: t("settingsUser.sections.portfolio"), children: renderPortfolioSection() },
    { key: "security", label: t("settingsUser.sections.security"), children: renderSecuritySection() },
    { key: "donations", label: t("settingsUser.sections.donations"), children: renderDonationsSection() },
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