import { useEffect, useState, type ChangeEvent } from "react";
import { Avatar, Button, Input, Switch, message } from "antd";
import { ImagePlus, User } from "lucide-react";
import { settingsRepository } from "../services/settingsRepository";
import type {
  ProfileSettings,
  SettingsSection,
  SettingsSectionKey,
  SettingsState,
} from "../types/settings";
import "./settings.css";

const settingsSections: SettingsSection[] = [
  { key: "profile", label: "Perfil" },
  { key: "subscription", label: "Suscripción" },
  { key: "commissions", label: "Comisiones" },
  { key: "orders", label: "Pedidos" },
  { key: "portfolio", label: "Portafolios" },
  { key: "security", label: "Seguridad" },
];

const emptyProfileDraft: ProfileSettings = {
  username: "",
  email: "",
  phone: "",
  bio: "",
};

export default function SettingsRoute() {
  const [activeSection, setActiveSection] = useState<SettingsSectionKey>("profile");
  const [settingsState, setSettingsState] = useState<SettingsState | null>(null);
  const [profileDraft, setProfileDraft] = useState<ProfileSettings>(emptyProfileDraft);
  const [isNewTierModalOpen, setIsNewTierModalOpen] = useState(false);
  const [isNewCommissionModalOpen, setIsNewCommissionModalOpen] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await settingsRepository.getSettings();
      setSettingsState(data);
      setProfileDraft(data.profile);
    };
    void loadSettings();
  }, []);

  const handleInputChange =
    (field: keyof ProfileSettings) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setProfileDraft((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleCancelProfile = () => {
    if (!settingsState) return;
    setProfileDraft(settingsState.profile);
  };

  const handleSaveProfile = async () => {
    const next = await settingsRepository.saveProfile(profileDraft);
    setSettingsState(next);
    message.success("Perfil guardado");
  };

  const handleSubscriptionPreviewToggle = async (value: boolean) => {
    if (!settingsState) return;
    const nextSubscription = { ...settingsState.subscription, previewEnabled: value };
    setSettingsState((prev) => (prev ? { ...prev, subscription: nextSubscription } : prev));
    await settingsRepository.saveSubscription(nextSubscription);
  };

  const handleCommissionsEnabledToggle = async (value: boolean) => {
    if (!settingsState) return;
    const nextCommissions = { ...settingsState.commissions, enabled: value };
    setSettingsState((prev) => (prev ? { ...prev, commissions: nextCommissions } : prev));
    await settingsRepository.saveCommissions(nextCommissions);
  };

  const handleCommissionsPreviewToggle = async (value: boolean) => {
    if (!settingsState) return;
    const nextCommissions = { ...settingsState.commissions, previewEnabled: value };
    setSettingsState((prev) => (prev ? { ...prev, commissions: nextCommissions } : prev));
    await settingsRepository.saveCommissions(nextCommissions);
  };

  const handlePortfolioToggle = async (
    field: "imagesEnabled" | "musicEnabled" | "literatureEnabled",
    value: boolean
  ) => {
    if (!settingsState) return;
    const nextPortfolio = { ...settingsState.portfolio, [field]: value };
    setSettingsState((prev) => (prev ? { ...prev, portfolio: nextPortfolio } : prev));
    await settingsRepository.savePortfolio(nextPortfolio);
  };

  const handleSecurityToggle = async (
    field: "email2faEnabled" | "sms2faEnabled",
    value: boolean
  ) => {
    if (!settingsState) return;
    const nextSecurity = { ...settingsState.security, [field]: value };
    setSettingsState((prev) => (prev ? { ...prev, security: nextSecurity } : prev));
    await settingsRepository.saveSecurity(nextSecurity);
  };

  if (!settingsState) {
    return (
      <section className="settings-page">
        <div className="settings-shell">
          <aside className="settings-sidebar">
            <h1 className="settings-title">Configuración</h1>
          </aside>
          <div className="settings-content">Cargando configuración...</div>
        </div>
      </section>
    );
  };

  const renderProfileSection = () => (
    <>
      <h2 className="settings-content-title">Editar perfil</h2>

      <div className="settings-avatar-row">
        <Avatar
          size={74}
          icon={<User size={36} />}
          className="settings-avatar"
        />
        <Button className="settings-avatar-button" type="default">
          Cambiar avatar
        </Button>
      </div>

      <form className="settings-form" onSubmit={(event) => event.preventDefault()}>
        <label className="settings-label" htmlFor="username">
          Nombre de usuario
        </label>
        <Input
          id="username"
          value={profileDraft.username}
          onChange={handleInputChange("username")}
          placeholder="[ Nombre de usuario ]"
          className="settings-input"
        />

        <label className="settings-label" htmlFor="email">
          Correo
        </label>
        <Input
          id="email"
          value={profileDraft.email}
          onChange={handleInputChange("email")}
          placeholder="[ Correo ]"
          className="settings-input"
        />

        <label className="settings-label" htmlFor="phone">
          Teléfono
        </label>
        <Input
          id="phone"
          value={profileDraft.phone}
          onChange={handleInputChange("phone")}
          placeholder="[ Número ]"
          className="settings-input"
        />

        <label className="settings-label" htmlFor="bio">
          Biografía (Opcional)
        </label>
        <Input.TextArea
          id="bio"
          value={profileDraft.bio}
          onChange={handleInputChange("bio")}
          className="settings-textarea"
        />
      </form>

      <div className="settings-actions">
        <Button className="settings-cancel-button" onClick={handleCancelProfile}>
          Cancelar
        </Button>
        <Button className="settings-save-button" type="primary" onClick={() => void handleSaveProfile()}>
          Guardar
        </Button>
      </div>
    </>
  );

  const renderSubscriptionSection = () => (
    <>
      <div className="settings-section-header-row">
        <h2 className="settings-section-title">Suscripción</h2>
      </div>
      <div className="settings-inline-row">
        <p className="settings-inline-label">Niveles de suscripción</p>
        <Button
          size="small"
          className={`settings-pill ${settingsState.subscription.previewEnabled ? "settings-pill--on" : ""}`}
          onClick={() => void handleSubscriptionPreviewToggle(!settingsState.subscription.previewEnabled)}
        >
          Vista previa
        </Button>
      </div>
      <div className="settings-cards-grid">
        {settingsState.subscription.tiers.map((tier) => (
          <article className="settings-media-card" key={tier.id}>
            <div className="settings-media-card-cover" />
            <div className="settings-media-card-body">
              <div className="settings-media-card-head">
                <h3>{tier.name}</h3>
                <Button size="small" className="settings-outline-mini-button">
                  Editar Tier
                </Button>
              </div>
              <p className="settings-media-card-meta">
                <span>{tier.price}</span>
                <span>·</span>
                <span>{tier.membersLabel}</span>
              </p>
              <p className="settings-media-card-description">{tier.description}</p>
            </div>
          </article>
        ))}
      </div>
      <Button className="settings-outline-button" onClick={() => setIsNewTierModalOpen(true)}>
        Crear nuevo tier
      </Button>
    </>
  );

  const renderCommissionsSection = () => (
    <>
      <div className="settings-section-header-row">
        <h2 className="settings-section-title">Comisiones</h2>
      </div>
      <div className="settings-inline-row">
        <p className="settings-inline-label">Activar/Desactivar comisiones</p>
        <Switch
          checked={settingsState.commissions.enabled}
          onChange={(checked) => void handleCommissionsEnabledToggle(checked)}
        />
      </div>
      <div className="settings-inline-row">
        <p className="settings-inline-label">Tus comisiones</p>
        <Button
          size="small"
          className={`settings-pill ${settingsState.commissions.previewEnabled ? "settings-pill--on" : ""}`}
          onClick={() => void handleCommissionsPreviewToggle(!settingsState.commissions.previewEnabled)}
        >
          Vista previa
        </Button>
      </div>
      <div className="settings-cards-grid">
        {settingsState.commissions.items.map((commission) => (
          <article className="settings-media-card" key={commission.id}>
            <div className="settings-media-card-cover" />
            <div className="settings-media-card-body">
              <div className="settings-media-card-head">
                <h3>{commission.name}</h3>
                <Button size="small" className="settings-outline-mini-button">
                  Editar Comisión
                </Button>
              </div>
              <p className="settings-media-card-meta">
                <span>{commission.price}</span>
                <span>·</span>
                <span>{commission.ordersLabel}</span>
              </p>
              <p className="settings-media-card-description">{commission.description}</p>
            </div>
          </article>
        ))}
      </div>
      <Button
        className="settings-outline-button"
        onClick={() => setIsNewCommissionModalOpen(true)}
      >
        Crear nueva comisión
      </Button>
    </>
  );

  const renderOrdersSection = () => (
    <>
      <div className="settings-section-header-row">
        <h2 className="settings-section-title">Pedidos</h2>
      </div>
      <div className="settings-orders-table-wrap">
        <table className="settings-orders-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>Dominio</th>
              <th>Fecha de pedido</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {settingsState.orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.user}</td>
                <td>{order.domain}</td>
                <td>{order.requestDate}</td>
                <td>
                  <Button size="small" className="settings-outline-mini-button">
                    Mensaje directo
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderPortfolioSection = () => (
    <>
      <div className="settings-section-header-row">
        <h2 className="settings-section-title">Portafolios</h2>
      </div>
      <div className="settings-toggle-list">
        <div className="settings-toggle-row">
          <p>Portafolio de imágenes</p>
          <Switch
            checked={settingsState.portfolio.imagesEnabled}
            onChange={(checked) => void handlePortfolioToggle("imagesEnabled", checked)}
          />
        </div>
        <div className="settings-toggle-row">
          <p>Portafolio de música y álbumes</p>
          <Switch
            checked={settingsState.portfolio.musicEnabled}
            onChange={(checked) => void handlePortfolioToggle("musicEnabled", checked)}
          />
        </div>
        <div className="settings-toggle-row">
          <p>Portafolio de literatura</p>
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
        <h2 className="settings-section-title">Seguridad</h2>
      </div>
      <div className="settings-security-wrap">
        <p className="settings-security-label">Cambio de contraseña</p>
        <Button className="settings-avatar-button settings-security-password-button">
          Ir a cambiar contraseña
        </Button>
      </div>
      <div className="settings-security-wrap">
        <p className="settings-security-label">Verificación de 2 factores</p>
        <div className="settings-toggle-list">
          <div className="settings-toggle-row">
            <p>Activar verificación por correo</p>
            <Switch
              checked={settingsState.security.email2faEnabled}
              onChange={(checked) => void handleSecurityToggle("email2faEnabled", checked)}
            />
          </div>
          <div className="settings-toggle-row">
            <p>Activar verificación por SMS</p>
            <Switch
              checked={settingsState.security.sms2faEnabled}
              onChange={(checked) => void handleSecurityToggle("sms2faEnabled", checked)}
            />
          </div>
        </div>
      </div>
    </>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSection();
      case "subscription":
        return renderSubscriptionSection();
      case "commissions":
        return renderCommissionsSection();
      case "orders":
        return renderOrdersSection();
      case "portfolio":
        return renderPortfolioSection();
      case "security":
        return renderSecuritySection();
      default:
        return renderProfileSection();
    }
  };

  const renderNewTierModal = () => {
    if (!isNewTierModalOpen) return null;

    return (
      <div className="settings-modal-backdrop">
        <div className="settings-modal">
          <h3>Nuevo nivel</h3>
          <label>Nombre</label>
          <Input placeholder="Nombre del nivel" className="settings-modal-input" />

          <label>Precio mensual</label>
          <Input prefix="$" placeholder="0.00" className="settings-modal-input" />

          <label>Descripción del nivel (Opcional)</label>
          <Input.TextArea className="settings-modal-textarea" />

          <label>Imagen para la portada (opcional)</label>
          <Button className="settings-outline-button">
            Adjuntar imagen <ImagePlus size={16} />
          </Button>

          <div className="settings-actions">
            <Button className="settings-cancel-button" onClick={() => setIsNewTierModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="settings-save-button"
              type="primary"
              onClick={() => setIsNewTierModalOpen(false)}
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderNewCommissionModal = () => {
    if (!isNewCommissionModalOpen) return null;

    return (
      <div className="settings-modal-backdrop">
        <div className="settings-modal settings-modal--large">
          <h3>Nueva comisión</h3>
          <label>Nombre</label>
          <Input placeholder="Nombre de la comisión" className="settings-modal-input" />

          <label>Descripción del servicio.</label>
          <Input.TextArea className="settings-modal-textarea" />

          <label>Precio</label>
          <Input prefix="$" placeholder="0.00" className="settings-modal-input" />

          <label>Tiempo de entrega aproximado.</label>
          <Input addonAfter="Días" placeholder="Tiempo" className="settings-modal-input" />

          <label>Etiquetas (Opcional)</label>
          <Input placeholder="Agregar etiquetas" className="settings-modal-input" />

          <label>Imagen para la portada (Opcional)</label>
          <Button className="settings-outline-button">
            Adjuntar imagen <ImagePlus size={16} />
          </Button>

          <div className="settings-actions">
            <Button
              className="settings-cancel-button"
              onClick={() => setIsNewCommissionModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="settings-save-button"
              type="primary"
              onClick={() => setIsNewCommissionModalOpen(false)}
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <section className="settings-page">
        <div className="settings-shell">
          <aside className="settings-sidebar">
            <h1 className="settings-title">Configuración</h1>
            <nav aria-label="Secciones de configuración" className="settings-nav">
              {settingsSections.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  className={`settings-nav-item ${
                    activeSection === section.key ? "settings-nav-item--active" : ""
                  }`}
                  onClick={() => setActiveSection(section.key)}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="settings-content">{renderSectionContent()}</div>
        </div>
      </section>
      {renderNewTierModal()}
      {renderNewCommissionModal()}
    </>
  );
}
