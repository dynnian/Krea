import axiosClient from "../lib/axios";

import type {
  SettingsState,
  ProfileSettings,
  SubscriptionSettings,
  CommissionSettings,
  PortfolioSettings,
  SecuritySettings,
} from "../types/settings";

import type {
  UserProfileResponse,
  PatchUserProfileRequest,
  UploadUserProfilePictureResponse,
} from "../types/api";

const STORAGE_KEY = "krea_settings_draft_v1";

const defaultSettings: SettingsState = {
  profile: {
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

function mapProfileResponseToSettings(profile: UserProfileResponse): ProfileSettings {
  return {
    username: profile.username ?? "",
    email: profile.email ?? "",
    displayName: profile.displayName ?? "",
    biography: profile.biography ?? "",
    languageCode: profile.languageCode ?? "",
    timeZoneId: profile.timeZoneId ?? "",
    profilePictureUrl: profile.profilePictureUrl ?? null,
    bannerPictureUrl: profile.bannerPictureUrl ?? null,
    profilePictureId: null,
    bannerPictureId: null,
  };
}

function buildPatchPayload(
  current: ProfileSettings,
  original: ProfileSettings
): PatchUserProfileRequest {
  const displayNameChanged = current.displayName !== original.displayName;
  const biographyChanged = current.biography !== original.biography;
  const languageCodeChanged = current.languageCode !== original.languageCode;
  const timeZoneIdChanged = current.timeZoneId !== original.timeZoneId;
  const profilePictureChanged = current.profilePictureId !== original.profilePictureId;
  const bannerPictureChanged = current.bannerPictureId !== original.bannerPictureId;

  return {
    displayName: displayNameChanged ? current.displayName || null : undefined,
    displayNameIsSet: displayNameChanged,

    biography: biographyChanged ? current.biography || null : undefined,
    biographyIsSet: biographyChanged,

    languageCode: languageCodeChanged ? current.languageCode || null : undefined,
    languageCodeIsSet: languageCodeChanged,

    timeZoneId: timeZoneIdChanged ? current.timeZoneId || null : undefined,
    timeZoneIdIsSet: timeZoneIdChanged,

    profilePictureId: profilePictureChanged ? current.profilePictureId || null : undefined,
    profilePictureIdIsSet: profilePictureChanged,

    bannerPictureId: bannerPictureChanged ? current.bannerPictureId || null : undefined,
    bannerPictureIdIsSet: bannerPictureChanged,
  };
}

export const settingsRepository = {
  async getProfile(): Promise<ProfileSettings> {
    const { data } = await axiosClient.get<UserProfileResponse>("/users/me/profile");
    return mapProfileResponseToSettings(data);
  },

  async patchProfile(
    current: ProfileSettings,
    original: ProfileSettings
  ): Promise<ProfileSettings> {
    const payload = buildPatchPayload(current, original);

    await axiosClient.patch("/users/me/profile", payload);

    return await this.getProfile();
  },

  async uploadProfilePicture(file: File): Promise<UploadUserProfilePictureResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axiosClient.post<UploadUserProfilePictureResponse>(
      "/users/me/profile-picture",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return data;
  },

  async getSettings(): Promise<SettingsState> {
    const current = readStorage();
    const profile = await this.getProfile();
    return { ...current, profile };
  },

  async saveProfile(
    profile: ProfileSettings,
    original: ProfileSettings
  ): Promise<SettingsState> {
    const updatedProfile = await this.patchProfile(profile, original);

    const current = readStorage();
    const next = { ...current, profile: updatedProfile };
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