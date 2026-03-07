// Enums globales
export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
  CANCELLED = "cancelled",
}

export enum CommissionRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum PostType {
  PLAIN = "plain",   // 0
  TEXT = "text",     // 1
  IMAGE = "image",   // 2
  MUSIC = "music",   // 3
}

export enum LikeTargetType {
  POST = "post",
  COMMENT = "comment", // si se añade en el futuro
}

export enum NotificationType {
  FOLLOW = "follow",
  LIKE = "like",
  COMMENT = "comment",
  DONATION = "donation",
  SUBSCRIPTION = "subscription",
  COMMISSION_UPDATE = "commission_update",
  MESSAGE = "message",
  REPORT_RESOLVED = "report_resolved",
}

export enum NotificationStatus {
  UNREAD = "unread",
  READ = "read",
  ARCHIVED = "archived",
}

export enum GenreType {
  MUSIC = "music",
  LITERATURE = "literature",
  VISUAL = "visual",
}

export enum ModerationActionType {
  WARNING = "warning",
  SUSPENSION = "suspension",
  BAN = "ban",
  CONTENT_REMOVAL = "content_removal",
}

// Tipos base
export type Timestamp = string; // ISO 8601
