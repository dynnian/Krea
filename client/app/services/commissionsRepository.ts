import type { CommissionDetail, CommissionsPageState } from "../types/commissions";

/**
 * Listado y detalle de la UI siguen en mock/localStorage hasta que existan GET en API.
 * Flujo real de creación de ofertas, solicitudes, pagos (Stripe) y entregas: `commissionsApi.ts`
 * (alineado con `feature/commissions`: commission-offerings, commission-requests, submissions).
 */
const STORAGE_KEY = "krea_commissions_page_draft_v1";

const defaultCommissionsPageState: CommissionsPageState = {
  // TODO(i18n): estos textos mock están en español temporalmente; luego deben salir de traducciones/backend.
  items: [
    {
      id: "commission-card-1",
      title: "Título de la comisión",
      priceLabel: "XS",
      deliveryLabel: "X días",
      summary:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis, olor sit amet.",
    },
    {
      id: "commission-card-2",
      title: "Título de la comisión",
      priceLabel: "XS",
      deliveryLabel: "X días",
      summary:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis, olor sit amet.",
    },
    {
      id: "commission-card-3",
      title: "Título de la comisión",
      priceLabel: "XS",
      deliveryLabel: "X días",
      summary:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis, olor sit amet.",
    },
  ],
};

const defaultCommissionDetails: Record<string, CommissionDetail> = {
  // TODO(i18n): mantener contenido seed desacoplado de idioma cuando se integre multilenguaje real.
  "commission-card-1": {
    id: "commission-card-1",
    title: "Título de la comisión",
    priceLabel: "X$",
    deliveryEstimate: "Entrega en X días aproximadamente.",
    about:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis, olor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["Ilustración", "OC", "Diseño de personaje"],
    author: {
      name: "Usuario",
      handle: "@Dominio",
      verified: true,
    },
    gallery: [],
    comments: [
      {
        id: "comment-1",
        author: "Usuario",
        handle: "@Dominio",
        dateLabel: "15 oct.",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis.",
      },
      {
        id: "comment-2",
        author: "Usuario",
        handle: "@Dominio",
        dateLabel: "15 oct.",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis.",
      },
      {
        id: "comment-3",
        author: "Usuario",
        handle: "@Dominio",
        dateLabel: "15 oct.",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis.",
      },
    ],
  },
  "commission-card-2": {
    id: "commission-card-2",
    title: "Título de la comisión",
    priceLabel: "X$",
    deliveryEstimate: "Entrega en X días aproximadamente.",
    about:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis, olor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["Ilustración", "OC", "Diseño de personaje"],
    author: {
      name: "Usuario",
      handle: "@Dominio",
      verified: true,
    },
    gallery: [],
    comments: [
      {
        id: "comment-4",
        author: "Usuario",
        handle: "@Dominio",
        dateLabel: "15 oct.",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis.",
      },
      {
        id: "comment-5",
        author: "Usuario",
        handle: "@Dominio",
        dateLabel: "15 oct.",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis.",
      },
      {
        id: "comment-6",
        author: "Usuario",
        handle: "@Dominio",
        dateLabel: "15 oct.",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis.",
      },
    ],
  },
  "commission-card-3": {
    id: "commission-card-3",
    title: "Título de la comisión",
    priceLabel: "X$",
    deliveryEstimate: "Entrega en X días aproximadamente.",
    about:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis, olor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["Ilustración", "OC", "Diseño de personaje"],
    author: {
      name: "Usuario",
      handle: "@Dominio",
      verified: true,
    },
    gallery: [],
    comments: [
      {
        id: "comment-7",
        author: "Usuario",
        handle: "@Dominio",
        dateLabel: "15 oct.",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis.",
      },
      {
        id: "comment-8",
        author: "Usuario",
        handle: "@Dominio",
        dateLabel: "15 oct.",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis.",
      },
      {
        id: "comment-9",
        author: "Usuario",
        handle: "@Dominio",
        dateLabel: "15 oct.",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis.",
      },
    ],
  },
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readStorage(): CommissionsPageState {
  if (!isBrowser()) return defaultCommissionsPageState;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultCommissionsPageState;

  try {
    return JSON.parse(raw) as CommissionsPageState;
  } catch {
    return defaultCommissionsPageState;
  }
}

function writeStorage(state: CommissionsPageState): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const commissionsRepository = {
  // TODO(frontend-integration): reemplazar por GET /api/commissions/me cuando backend lo exponga.
  async getCommissionsPageState(): Promise<CommissionsPageState> {
    return readStorage();
  },

  // TODO(frontend-integration): reemplazar por PATCH/PUT cuando la edición se conecte a backend.
  async saveCommissionsPageState(nextState: CommissionsPageState): Promise<CommissionsPageState> {
    writeStorage(nextState);
    return nextState;
  },

  // TODO(frontend-integration): reemplazar por GET /api/commissions/:id cuando backend entregue detalle.
  async getCommissionDetail(commissionId: string): Promise<CommissionDetail | null> {
    return defaultCommissionDetails[commissionId] ?? null;
  },
};
