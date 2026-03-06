export type SettingsSectionKey =
  | "profile"
  | "subscription"
  | "commissions"
  | "orders"
  | "portfolio"
  | "security";

export type SettingsSection = {
  key: SettingsSectionKey;
  label: string;
};

export type ProfileSettings = {
  username: string;
  email: string;
  phone: string;
  bio: string;
};

export type SubscriptionTier = {
  id: string;
  name: string;
  price: string;
  membersLabel: string;
  description: string;
};

export type CommissionItem = {
  id: string;
  name: string;
  price: string;
  ordersLabel: string;
  description: string;
};

export type OrderItem = {
  id: number;
  user: string;
  domain: string;
  requestDate: string;
};

export type SubscriptionSettings = {
  previewEnabled: boolean;
  tiers: SubscriptionTier[];
};

export type CommissionSettings = {
  enabled: boolean;
  previewEnabled: boolean;
  items: CommissionItem[];
};

export type PortfolioSettings = {
  imagesEnabled: boolean;
  musicEnabled: boolean;
  literatureEnabled: boolean;
};

export type SecuritySettings = {
  email2faEnabled: boolean;
  sms2faEnabled: boolean;
};

export type SettingsState = {
  profile: ProfileSettings;
  subscription: SubscriptionSettings;
  commissions: CommissionSettings;
  orders: OrderItem[];
  portfolio: PortfolioSettings;
  security: SecuritySettings;
};
