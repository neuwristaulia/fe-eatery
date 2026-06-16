import { apiFetch, getApiUrl } from "../client";
import type { ApiDashboard } from "../types";
import { useAuthStore } from "@/store/useAuthStore";

export async function getAdminDashboard() {
  return apiFetch<ApiDashboard>("/api/admin/dashboard", { auth: true });
}

export function getSalesReportPdfUrl(startDate: string, endDate: string) {
  const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
  return getApiUrl(`/api/reports/sales/pdf?${params.toString()}`);
}

export async function downloadSalesReportPdf(
  startDate: string,
  endDate: string,
): Promise<Blob> {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(getSalesReportPdfUrl(startDate, endDate), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error("Failed to download report");
  }
  return res.blob();
}
