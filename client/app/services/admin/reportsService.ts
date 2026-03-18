import axiosClient from "@/lib/axios";
import type {
  AdminReportsOverviewDto,
  AdminPostModerationReportsPageDto,
} from "@/types/admin";

export async function getReportsOverview(): Promise<AdminReportsOverviewDto> {
  const response = await axiosClient.get("/admin/reports");
  return response.data;
}

export interface PostReportsQueryParams {
  status?: string;
  page?: number;
  pageSize?: number;
}

export async function getPostReports(
  params: PostReportsQueryParams,
): Promise<AdminPostModerationReportsPageDto> {
  const response = await axiosClient.get("/admin/reports/posts", { params });
  return response.data;
}

export async function evaluatePostReport(
  reportId: string,
  decision: any,
): Promise<void> {
  await axiosClient.patch(
    `/admin/reports/posts/${reportId}/evaluate`,
    decision,
  );
}
