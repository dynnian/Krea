import type {
  SettingsState,
  ProfileSettings,
  SubscriptionSettings,
  CommissionSettings,
  PortfolioSettings,
  SecuritySettings,
} from "../types/settings";

const STORAGE_KEY = "krea_settings_draft_v1";

const defaultSettings: SettingsState = {
  profile: {
    username: "",
    email: "",
    phone: "",
    bio: "",
  },
  subscription: {
    previewEnabled: true,
    tiers: [
      {
        id: "tier-1",
        name: "Nombre del Tier",
        price: "X$ / mes",
        membersLabel: "X Miembros",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis, olor sit amet.",
      },
      {
        id: "tier-2",
        name: "Nombre del Tier",
        price: "X$ / mes",
        membersLabel: "X Miembros",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis, olor sit amet.",
      },
    ],
  },
  commissions: {
    enabled: true,
    previewEnabled: true,
    items: [
      {
        id: "commission-1",
        name: "Nombre de Comisión",
        price: "X$",
        ordersLabel: "X Pedidos",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis, olor sit amet.",
      },
      {
        id: "commission-2",
        name: "Nombre de Comisión",
        price: "X$",
        ordersLabel: "X Pedidos",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis, olor sit amet.",
      },
    ],
  },
  orders: [
    { id: 1, user: "Username", domain: "@Dominio", requestDate: "XX/XX/XXXX" },
    { id: 2, user: "Username", domain: "@Dominio", requestDate: "XX/XX/XXXX" },
    { id: 3, user: "Username", domain: "@Dominio", requestDate: "XX/XX/XXXX" },
    { id: 4, user: "Username", domain: "@Dominio", requestDate: "XX/XX/XXXX" },
    { id: 5, user: "Username", domain: "@Dominio", requestDate: "XX/XX/XXXX" },
    { id: 6, user: "Username", domain: "@Dominio", requestDate: "XX/XX/XXXX" },
    { id: 7, user: "Username", domain: "@Dominio", requestDate: "XX/XX/XXXX" },
  ],
  portfolio: {
    imagesEnabled: true,
    musicEnabled: true,
    literatureEnabled: true,
  },
  security: {
    email2faEnabled: true,
    sms2faEnabled: true,
  },
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readStorage(): SettingsState {
  if (!isBrowser()) return defaultSettings;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(raw) } as SettingsState;
  } catch {
    return defaultSettings;
  }
}

function writeStorage(data: SettingsState): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const settingsRepository = {
  async getSettings(): Promise<SettingsState> {
    return readStorage();
  },

  async saveProfile(profile: ProfileSettings): Promise<SettingsState> {
    const current = readStorage();
    const next = { ...current, profile };
    writeStorage(next);
    return next;
  },

  async saveSubscription(subscription: SubscriptionSettings): Promise<SettingsState> {
    const current = readStorage();
    const next = { ...current, subscription };
    writeStorage(next);
    return next;
  },

  async saveCommissions(commissions: CommissionSettings): Promise<SettingsState> {
    const current = readStorage();
    const next = { ...current, commissions };
    writeStorage(next);
    return next;
  },

  async savePortfolio(portfolio: PortfolioSettings): Promise<SettingsState> {
    const current = readStorage();
    const next = { ...current, portfolio };
    writeStorage(next);
    return next;
  },

  async saveSecurity(security: SecuritySettings): Promise<SettingsState> {
    const current = readStorage();
    const next = { ...current, security };
    writeStorage(next);
    return next;
  },
};
