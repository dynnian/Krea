import type { AdminPostModerationReportDto } from "../types/admin.ts";

export const mapNumericStatusToText = (
  status: 1 | 2,
): "Pending" | "Resolved" => {
  return status === 1 ? "Pending" : "Resolved";
};

export const getDisplayStatus = (
  item: AdminPostModerationReportDto,
): { text: string; color: string } => {
  if (item.status === 1) {
    return { text: "Pending", color: "gold" };
  }
  if (item.resolvedAction === "Dismiss")
    return { text: "Dismissed", color: "default" };
  if (item.resolvedAction === "DeletePost")
    return { text: "Post deleted", color: "red" };
  if (item.resolvedAction === "SuspendAuthor")
    return { text: "Author suspended", color: "orange" };
  return { text: "Resolved", color: "blue" };
};