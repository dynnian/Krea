import axiosClient from "@/lib/axios";
import type { AdminDashboardDto } from "@/types/admin";

export async function getDashboardStats(): Promise<AdminDashboardDto> {
  const response = await axiosClient.get("/admin/dashboard");
  return response.data;
}
