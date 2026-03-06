import type { SubscriptionsPageState } from "../types/subscriptions";

const STORAGE_KEY = "krea_subscriptions_page_draft_v1";

const defaultSubscriptionsPageState: SubscriptionsPageState = {
  // TODO(i18n): estos textos mock están en español temporalmente; luego deben salir de traducciones/backend.
  items: [
    {
      id: "subscription-card-1",
      title: "Título del tier",
      priceLabel: "XS",
      recurrenceLabel: "/ mes",
      summary:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis, olor sit amet.",
      benefits: ["Acceso anticipado", "Contenido exclusivo", "Soporte prioritario"],
      deliveryNote: "Entrega de beneficios cada mes.",
      renewalNote: "Renovación automática. Puedes cancelar cuando quieras.",
    },
    {
      id: "subscription-card-2",
      title: "Título del tier",
      priceLabel: "XS",
      recurrenceLabel: "/ mes",
      summary:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis, olor sit amet.",
      benefits: ["Acceso anticipado", "Contenido exclusivo", "Soporte prioritario"],
      deliveryNote: "Entrega de beneficios cada mes.",
      renewalNote: "Renovación automática. Puedes cancelar cuando quieras.",
    },
    {
      id: "subscription-card-3",
      title: "Título del tier",
      priceLabel: "XS",
      recurrenceLabel: "/ mes",
      summary:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis, olor sit amet.",
      benefits: ["Acceso anticipado", "Contenido exclusivo", "Soporte prioritario"],
      deliveryNote: "Entrega de beneficios cada mes.",
      renewalNote: "Renovación automática. Puedes cancelar cuando quieras.",
    },
  ],
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readStorage(): SubscriptionsPageState {
  if (!isBrowser()) return defaultSubscriptionsPageState;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultSubscriptionsPageState;

  try {
    return JSON.parse(raw) as SubscriptionsPageState;
  } catch {
    return defaultSubscriptionsPageState;
  }
}

function writeStorage(state: SubscriptionsPageState): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const subscriptionsRepository = {
  // TODO(frontend-integration): reemplazar por GET /api/subscriptions/me cuando backend lo exponga.
  async getSubscriptionsPageState(): Promise<SubscriptionsPageState> {
    return readStorage();
  },

  // TODO(frontend-integration): reemplazar por PATCH/PUT cuando la edición se conecte a backend.
  async saveSubscriptionsPageState(
    nextState: SubscriptionsPageState
  ): Promise<SubscriptionsPageState> {
    writeStorage(nextState);
    return nextState;
  },
};
