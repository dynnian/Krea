/**
 * Cliente HTTP para el flujo de comisiones expuesto en `feature/commissions`
 * (CommissionOfferingController, CommissionRequestController, SubmissionController).
 *
 * `axiosClient` usa `VITE_API_BASE_URL` (p. ej. …/api); las rutas aquí son relativas a eso,
 * igual que `/Posts` o `/users/me/profile`.
 *
 * Convención JSON: ASP.NET Core serializa en camelCase por defecto (offeringId, requestId, …).
 */

import axiosClient from "../lib/axios";

const OFFERINGS = "/commission-offerings";
const REQUESTS = "/commission-requests";
const SUBMISSIONS = "/submissions";

// --- Tipos alineados con los records del backend (respuestas en camelCase) ---

export type CreateCommissionOfferingBody = {
  title: string;
  description?: string | null;
  amount: number;
  currency: string;
  maxSlots: number;
};

export type CreateCommissionOfferingResult = {
  offeringId: string;
};

export type CreateCommissionRequestBody = {
  offeringId: string;
  brief: string;
};

export type CreateCommissionRequestResult = {
  requestId: string;
};

export type CreateCommissionPaymentBody = {
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
};

export type CreateCommissionPaymentResult = {
  checkoutUrl: string;
};

export type AddCommissionSubmissionBody = {
  mediaId: string;
};

export type AddSubmissionFeedbackBody = {
  content: string;
};

export type EditSubmissionFeedbackBody = {
  newContent: string;
};

// --- Ofertas (artista autenticado) ---

export async function createCommissionOffering(
  body: CreateCommissionOfferingBody
): Promise<CreateCommissionOfferingResult> {
  const { data } = await axiosClient.post<CreateCommissionOfferingResult>(OFFERINGS, body);
  return data;
}

// --- Solicitudes y flujo (usuarios autenticados; roles según endpoint) ---

export async function createCommissionRequest(
  body: CreateCommissionRequestBody
): Promise<CreateCommissionRequestResult> {
  const { data } = await axiosClient.post<CreateCommissionRequestResult>(REQUESTS, body);
  return data;
}

export async function acceptCommissionRequest(requestId: string): Promise<void> {
  await axiosClient.patch(`${REQUESTS}/${requestId}/accept`, {});
}

export async function createCommissionPayment(
  requestId: string,
  body: CreateCommissionPaymentBody
): Promise<CreateCommissionPaymentResult> {
  const { data } = await axiosClient.post<CreateCommissionPaymentResult>(
    `${REQUESTS}/${requestId}/payments`,
    body
  );
  return data;
}

export async function addCommissionSubmission(
  requestId: string,
  body: AddCommissionSubmissionBody
): Promise<void> {
  await axiosClient.post(`${REQUESTS}/${requestId}/submissions`, body);
}

export async function deliverCommission(requestId: string): Promise<void> {
  await axiosClient.patch(`${REQUESTS}/${requestId}/deliver`, {});
}

export async function approveCommission(requestId: string): Promise<void> {
  await axiosClient.patch(`${REQUESTS}/${requestId}/approve`, {});
}

export async function requestCommissionChanges(requestId: string): Promise<void> {
  await axiosClient.patch(`${REQUESTS}/${requestId}/request-changes`, {});
}

export async function cancelCommissionRequest(requestId: string): Promise<void> {
  await axiosClient.patch(`${REQUESTS}/${requestId}/cancel`, {});
}

// --- Feedback sobre entregas (submissions) ---

export async function addSubmissionFeedback(
  submissionId: string,
  body: AddSubmissionFeedbackBody
): Promise<void> {
  await axiosClient.post(`${SUBMISSIONS}/${submissionId}/feedback`, body);
}

export async function editSubmissionFeedback(
  feedbackId: string,
  body: EditSubmissionFeedbackBody
): Promise<void> {
  await axiosClient.put(`${SUBMISSIONS}/feedback/${feedbackId}`, body);
}

/**
 * Marketplace (listado / detalle público de ofertas):
 * En la rama actual, CommissionOfferingController solo expone POST y el código deja un TODO
 * para listar / activar / desactivar. No hay GET documentado aún.
 *
 * Cuando backend añada algo como:
 *   GET /commission-offerings/active
 *   GET /commission-offerings/{id}
 * conviene mapear esas respuestas en `commissionsRepository.ts` (sustituyendo mocks).
 */
