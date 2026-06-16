import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { apiFetch, getApiUrl } from "../client";
import type { ApiSalesByMenuReport } from "../types";
import { normalizeSalesByMenuReport } from "../normalize";

/**
 * Fetch the sales-by-menu report (quantity sold and revenue per menu item,
 * plus aggregate summary) for completed orders.
 */
export async function getSalesByMenuReport(): Promise<ApiSalesByMenuReport> {
  const raw = await apiFetch<unknown>("/api/reports/sales-by-menu", {
    auth: true,
  });
  return normalizeSalesByMenuReport((raw || {}) as Record<string, unknown>);
}

export interface ReportDownloadOptions {
  startDate?: string;
  endDate?: string;
  month?: string;
  year?: string;
}

/**
 * Download a report from the backend API
 * Handles authentication, error responses, and file downloads
 */
export async function downloadReport(
  endpoint: string,
  filename: string,
): Promise<void> {
  try {
    const token = useAuthStore.getState().accessToken;

    if (!token) {
      toast.error("Your session has expired. Please login again.");
      return;
    }

    const toastId = toast.loading("Generating report...");

    const res = await fetch(getApiUrl(endpoint), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle error responses
    if (!res.ok) {
      toast.dismiss(toastId);

      if (res.status === 401) {
        toast.error("Your session has expired. Please login again.");
        return;
      }

      if (res.status === 403) {
        toast.error("You do not have permission to access reports.");
        return;
      }

      if (res.status === 400) {
        try {
          const errorData = await res.json();
          const message = errorData.message || "Invalid report parameters.";
          toast.error(message);
        } catch {
          toast.error("Invalid report parameters.");
        }
        return;
      }

      if (res.status === 500) {
        toast.error("Failed to generate report. Please try again later.");
        return;
      }

      toast.error("Failed to download report.");
      return;
    }

    // Get the blob and download
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.dismiss(toastId);
    toast.success(`${filename} downloaded successfully!`);
  } catch (error) {
    toast.error("Failed to download report.");
    console.error("Report download error:", error);
  }
}

/**
 * Build query parameters for date-filtered reports
 */
function buildQueryParams(options?: ReportDownloadOptions): string {
  if (!options) return "";

  const params = new URLSearchParams();

  if (options.startDate) {
    params.append("start_date", options.startDate);
  }
  if (options.endDate) {
    params.append("end_date", options.endDate);
  }
  if (options.month) {
    params.append("month", options.month);
  }
  if (options.year) {
    params.append("year", options.year);
  }

  return params.toString();
}

// ===== Sales Report =====
export async function downloadSalesReportPdf(
  options?: ReportDownloadOptions,
): Promise<void> {
  const query = buildQueryParams(options);
  const endpoint = query
    ? `/api/reports/sales/pdf?${query}`
    : "/api/reports/sales/pdf";
  await downloadReport(endpoint, "sales-report.pdf");
}

export async function downloadSalesReportExcel(
  options?: ReportDownloadOptions,
): Promise<void> {
  const query = buildQueryParams(options);
  const endpoint = query
    ? `/api/reports/sales/excel?${query}`
    : "/api/reports/sales/excel";
  await downloadReport(endpoint, "sales-report.xlsx");
}

// ===== Menu Performance Report =====
export async function downloadMenuPerformanceReportPdf(
  options?: ReportDownloadOptions,
): Promise<void> {
  const query = buildQueryParams(options);
  const endpoint = query
    ? `/api/reports/menu-performance/pdf?${query}`
    : "/api/reports/menu-performance/pdf";
  await downloadReport(endpoint, "menu-performance-report.pdf");
}

export async function downloadMenuPerformanceReportExcel(
  options?: ReportDownloadOptions,
): Promise<void> {
  const query = buildQueryParams(options);
  const endpoint = query
    ? `/api/reports/menu-performance/excel?${query}`
    : "/api/reports/menu-performance/excel";
  await downloadReport(endpoint, "menu-performance-report.xlsx");
}

// ===== Inventory Report =====
export async function downloadInventoryReportPdf(): Promise<void> {
  await downloadReport("/api/reports/inventory/pdf", "inventory-report.pdf");
}

export async function downloadInventoryReportExcel(): Promise<void> {
  await downloadReport("/api/reports/inventory/excel", "inventory-report.xlsx");
}

// ===== Customer Loyalty Report =====
export async function downloadCustomerLoyaltyReportPdf(): Promise<void> {
  await downloadReport(
    "/api/reports/customer-loyalty/pdf",
    "customer-loyalty-report.pdf",
  );
}

export async function downloadCustomerLoyaltyReportExcel(): Promise<void> {
  await downloadReport(
    "/api/reports/customer-loyalty/excel",
    "customer-loyalty-report.xlsx",
  );
}

// ===== Reservations Report =====
export async function downloadReservationsReportPdf(
  options?: ReportDownloadOptions,
): Promise<void> {
  const query = buildQueryParams(options);
  const endpoint = query
    ? `/api/reports/reservations/pdf?${query}`
    : "/api/reports/reservations/pdf";
  await downloadReport(endpoint, "reservations-report.pdf");
}

export async function downloadReservationsReportExcel(
  options?: ReportDownloadOptions,
): Promise<void> {
  const query = buildQueryParams(options);
  const endpoint = query
    ? `/api/reports/reservations/excel?${query}`
    : "/api/reports/reservations/excel";
  await downloadReport(endpoint, "reservations-report.xlsx");
}

// ===== Executive Summary Report =====
export async function downloadExecutiveSummaryReportPdf(
  options?: ReportDownloadOptions,
): Promise<void> {
  const query = buildQueryParams(options);
  const endpoint = query
    ? `/api/reports/executive-summary/pdf?${query}`
    : "/api/reports/executive-summary/pdf";
  await downloadReport(endpoint, "executive-summary-report.pdf");
}

export async function downloadExecutiveSummaryReportExcel(
  options?: ReportDownloadOptions,
): Promise<void> {
  const query = buildQueryParams(options);
  const endpoint = query
    ? `/api/reports/executive-summary/excel?${query}`
    : "/api/reports/executive-summary/excel";
  await downloadReport(endpoint, "executive-summary-report.xlsx");
}

// ===== Legacy Reports (kept for backwards compatibility if needed) =====
export async function downloadDailySalesReportPdf(date: string): Promise<void> {
  await downloadReport(
    `/api/reports/daily/pdf?date=${date}`,
    "daily-sales-report.pdf",
  );
}

export async function downloadDailySalesReportExcel(
  date: string,
): Promise<void> {
  await downloadReport(
    `/api/reports/daily/excel?date=${date}`,
    "daily-sales-report.xlsx",
  );
}

export async function downloadMonthlySalesReportPdf(
  month: string,
  year: string,
): Promise<void> {
  await downloadReport(
    `/api/reports/monthly/pdf?month=${month}&year=${year}`,
    "monthly-sales-report.pdf",
  );
}

export async function downloadMonthlySalesReportExcel(
  month: string,
  year: string,
): Promise<void> {
  await downloadReport(
    `/api/reports/monthly/excel?month=${month}&year=${year}`,
    "monthly-sales-report.xlsx",
  );
}

export async function downloadBestSellingMenuReportPdf(): Promise<void> {
  await downloadReport(
    "/api/reports/best-selling/pdf",
    "best-selling-menu-report.pdf",
  );
}

export async function downloadBestSellingMenuReportExcel(): Promise<void> {
  await downloadReport(
    "/api/reports/best-selling/excel",
    "best-selling-menu-report.xlsx",
  );
}

export async function downloadStockUsageReportPdf(): Promise<void> {
  await downloadReport("/api/reports/stock/pdf", "stock-usage-report.pdf");
}

export async function downloadStockUsageReportExcel(): Promise<void> {
  await downloadReport("/api/reports/stock/excel", "stock-usage-report.xlsx");
}

export async function downloadCustomerGrowthReportPdf(): Promise<void> {
  await downloadReport(
    "/api/reports/customer-growth/pdf",
    "customer-growth-report.pdf",
  );
}

export async function downloadCustomerGrowthReportExcel(): Promise<void> {
  await downloadReport(
    "/api/reports/customer-growth/excel",
    "customer-growth-report.xlsx",
  );
}
