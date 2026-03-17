import axiosClient from "@/lib/axios.ts";
import type { AdminInstanceConfigurationDto } from "@/types/admin";

export async function getConfiguration(): Promise<AdminInstanceConfigurationDto> {
  const response = await axiosClient.get("/admin/configuration");
  return response.data;
}

export async function updateConfiguration(
  data: AdminInstanceConfigurationDto,
): Promise<void> {
  await axiosClient.put("/admin/configuration", data);
}
