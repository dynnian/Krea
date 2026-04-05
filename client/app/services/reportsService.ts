import axiosClient from '../lib/axios';

export interface ReportPostData {
  reason: string;
  details?: string | null;
}

export const reportsApi = {
  reportPost: (postId: string, data: ReportPostData) =>
    axiosClient.post(`/posts/${postId}/reports`, data),
};