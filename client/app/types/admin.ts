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

// You may need to define the report item DTOs for post reports
export interface AdminPostModerationReportDto {
  // based on actual response
  id: string;
  postId: string;
  reportedBy: string;
  reason: string;
  status: "Pending" | "Reviewed" | "Dismissed";
  createdAt: string;
  // ...
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
