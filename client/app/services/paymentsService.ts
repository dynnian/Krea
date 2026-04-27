import axiosClient from "../lib/axios";

export interface PaymentItem {
  paymentId: string;
  paymentType: "Donation" | "Commission" | "Subscription";
  amount: number;
  currency: string;
  status: "Pending" | "Completed" | "Failed";
  paidAt: string | null;
  counterpartyName: string;
  reference: string | null;
  entityId: string | null;
}

export interface PaymentPage {
  items: PaymentItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const paymentsApi = {
  getSentPayments: (params: {
    paymentType?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }) => axiosClient.get<PaymentPage>("/payments/sent", { params }),

  getReceivedPayments: (params: {
    paymentType?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }) => axiosClient.get<PaymentPage>("/payments/received", { params }),
};
