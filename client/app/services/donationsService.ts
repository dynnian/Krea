import axiosClient from "@/lib/axios.ts";

export type CreateDonationRequest = {
  recipientId: string;
  amount: number;
  currency: string;
  message?: string;
  successUrl: string;
  cancelUrl: string;
};

export type CreateDonationResponse = {
  donationId: string;
  checkoutUrl: string;
};

export const createDonation = async (
  data: CreateDonationRequest
): Promise<CreateDonationResponse> => {
  const response = await axiosClient.post("/donations", data);
  return response.data;
};