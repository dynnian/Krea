import axiosClient from "@/lib/axios";
import type {
  AdminUsersPageDto,
  UpdateUserStatusRequest,
  UpdateUserRoleRequest,
} from "@/types/admin";

export interface UsersQueryParams {
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: "Ascending" | "Descending";
  page?: number;
  pageSize?: number;
}

export async function getUsers(
  params: UsersQueryParams,
): Promise<AdminUsersPageDto> {
  const response = await axiosClient.get("/admin/users", { params });
  return response.data;
}

export async function updateUserStatus(
  userId: string,
  data: UpdateUserStatusRequest,
): Promise<void> {
  // Convert number status to string expected by API
  const statusMap: Record<number, string> = {
    1: "Active",
    2: "Suspended",
    // 3: "Banned" if needed
  };
  const payload = { status: statusMap[data.status] };
  await axiosClient.patch(`/admin/users/${userId}/status`, payload);
}

export async function updateUserRole(
  userId: string,
  data: UpdateUserRoleRequest,
): Promise<void> {
  await axiosClient.patch(`/admin/users/${userId}/role`, data);
}

export async function deleteUser(userId: string): Promise<void> {
  await axiosClient.delete(`/admin/users/${userId}`);
}
