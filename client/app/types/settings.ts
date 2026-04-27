export type SettingsSectionKey = "profile" | "security"  | "donations" | "portfolio" | "reports";

export type SettingsSection = {
  key: SettingsSectionKey;
  label: string;
};

export interface ProfileSettings {
  username: string;
  email: string;
  displayName: string;
  biography: string;
  languageCode: string;
  timeZoneId: string;
  profilePictureUrl: string | null;
  bannerPictureUrl: string | null;
  profilePictureId: string | null;
  bannerPictureId: string | null;
}

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
