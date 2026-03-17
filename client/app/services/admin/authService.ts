import axiosClient from "@/lib/axios";
import type { ChangePasswordCommand } from "@/types/admin";

export async function changePassword(
  data: ChangePasswordCommand,
): Promise<void> {
  await axiosClient.post("/Auth/change-password", data);
}
