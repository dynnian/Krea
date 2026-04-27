import axiosClient from '../lib/axios';
import type {
  NotificationDto,
  NotificationPreferencesDto,
  UpdateNotificationPreferencesRequest,
} from '../types/notification';

const BASE_URL = '/notifications';

export const notificationsService = {
  async getMyNotifications(page = 1, pageSize = 20): Promise<NotificationDto[]> {
    const response = await axiosClient.get<NotificationDto[]>(BASE_URL, {
      params: { page, pageSize },
    });
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await axiosClient.get<number>(`${BASE_URL}/unread-count`);
    return response.data;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await axiosClient.patch(`${BASE_URL}/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await axiosClient.patch(`${BASE_URL}/read-all`);
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/${notificationId}`);
  },

  async getPreferences(): Promise<NotificationPreferencesDto> {
    const response = await axiosClient.get<NotificationPreferencesDto>(`${BASE_URL}/preferences`);
    return response.data;
  },

  async updatePreferences(payload: UpdateNotificationPreferencesRequest): Promise<void> {
    await axiosClient.put(`${BASE_URL}/preferences`, payload);
  },
};