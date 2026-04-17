// client/app/types/admin.ts
export interface AdminDashboardDto {
  totalUsers: number;
  activeToday: number;
  federatedInstances: number;
  pendingReports: number;
  suspendedUsers: number;
  moderationActions: number;
  recentActivity: ActivityItemDto[];
}

export interface ActivityItemDto {
  type: string;
  action: string;
  source: string;
  details: string;
  occurredAt: string; // ISO date
  status: string;
}

// User management
export interface AdminUserListItemDto {
  id: string; // uuid
  username: string;
  email: string;
  displayName: string;
  role: "Admin" | "Artist"; // or string
  status: number; // 0 = active, 1 = suspended etc. (define enum)
  createdAt: string;
}

export interface AdminUsersPageDto {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  sortBy?: string;
  sortDirection?: "Ascending" | "Descending";
  availableRoles: string[];
  items: AdminUserListItemDto[];
}

export interface UpdateUserStatusRequest {
  status: number; // or enum
}

export interface UpdateUserRoleRequest {
  role: string; // e.g., "Admin" or "Artist"
}

// Reports
export interface AdminReportsOverviewDto {
  activeUsers: number;
  suspendedUsers: number;
  totalPublications: number;
  federationInteractions: number;
  moderationActions: number;
  activity: ActivityItemDto[];
}

export interface AdminPostModerationReportsPageDto {
  page: number;
  pageSize: number;
  totalCount: number;
  items: AdminPostModerationReportDto[];
}

// Configuration
export interface AdminInstanceConfigurationDto {
  platformName: string;
  description: string;
  administratorEmail: string;
}

// Change password
export interface ChangePasswordCommand {
  userId: string; // the current user's ID (can be taken from auth)
  currentPassword: string;
  newPassword: string;
}

export type PostModerationReportStatusNumber = 1 | 2; // 1: Pending, 2: Resolved
export type PostModerationDecisionAction =
  | "Dismiss"
  | "DeletePost"
  | "SuspendAuthor";

export interface AdminPostModerationReportDto {
  id: string;
  postId: string;
  postTitle: string;
  reporterUserId: string;
  reporterDisplayName: string; // en lugar de reportedByUsername
  reason: string;
  details?: string | null;
  status: PostModerationReportStatusNumber; // 1 o 2
  createdAt: string;
  resolvedAt: string | null;
  resolvedAction: PostModerationDecisionAction; // solo presente si status === 2
  resolvedByUserId: string | null;
  moderatorNote: string | null;
}

export interface AdminPostModerationReportsPageDto {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  status: number; // posiblemente el filtro aplicado? pero no lo usamos
  items: AdminPostModerationReportDto[];
}

export interface PostReportsQueryParams {
  status?: "Pending" | "Resolved"; // strings para el query param
  page?: number;
  pageSize?: number;
}

export interface EvaluateReportRequest {
  action: PostModerationDecisionAction; // ← cambiar de 'decision' a 'action'
  moderatorNote?: string | null;
}

export interface AdminPostModerationReportsPageDto {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: AdminPostModerationReportDto[];
}

