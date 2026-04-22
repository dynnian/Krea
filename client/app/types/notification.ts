export enum NotificationType {
  Follow = 1,
  PostLiked = 2,
  PostReplied = 3,
}

export enum NotificationEntityType {
  User = 1,
  Post = 2,
}

export interface NotificationDto {
  id: string;
  userId: string;
  actorUserId?: string | null;
  content: string;
  type: NotificationType;
  entityId?: string | null;
  entityType?: NotificationEntityType | null;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

export interface NotificationPreferenceItemDto {
  type: NotificationType;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  isPaused: boolean;
}

export interface NotificationPreferencesDto {
  allNotificationsPaused: boolean;
  preferences: NotificationPreferenceItemDto[];
}

export interface UpdateNotificationPreferencesRequest {
  allNotificationsPaused: boolean;
  preferences: NotificationPreferenceItemDto[];
}