import axiosClient from "../lib/axios";

export interface SendDirectMessageRequest {
  senderId: string;
  receiverId: string;
  content: string;
}

export const directMessagesApi = {
  sendMessage: (data: SendDirectMessageRequest) =>
    axiosClient.post("/DirectMessages", data),
};