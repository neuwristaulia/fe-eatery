"use client";

import { useState } from "react";
import { BarChart3, Download, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  downloadSalesReportPdf,
  downloadSalesReportExcel,
  // downloadMenuPerformanceReportPdf,
  // downloadMenuPerformanceReportExcel,
  // downloadInventoryReportPdf,
  // downloadInventoryReportExcel,
  // downloadCustomerLoyaltyReportPdf,
  // downloadCustomerLoyaltyReportExcel,
  // downloadReservationsReportPdf,
  // downloadReservationsReportExcel,
  // downloadExecutiveSummaryReportPdf,
  // downloadExecutiveSummaryReportExcel,
} from "@/lib/api/services/reports";

export default function AdminReportsPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const reports = [
    {
      id: "sales",
      title: "Sales Report",
      desc: "Revenue, orders, and payment methods across time periods.",
      requiresDateFilter: true,
      downloadPdf: () => downloadSalesReportPdf({ startDate, endDate }),
      downloadExcel: () => downloadSalesReportExcel({ startDate, endDate }),
    },
    // {
    //   id: "menu-performance",
    //   title: "Menu Performance Report",
    //   desc: "Analyze item popularity, revenue contribution, and sales trends.",
    //   requiresDateFilter: true,
    //   downloadPdf: () =>
    //     downloadMenuPerformanceReportPdf({ startDate, endDate }),
    //   downloadExcel: () =>
    //     downloadMenuPerformanceReportExcel({ startDate, endDate }),
    // },
    // {
    //   id: "inventory",
    //   title: "Inventory Report",
    //   desc: "Current stock levels, usage rates, and item tracking.",
    //   requiresDateFilter: false,
    //   downloadPdf: () => downloadInventoryReportPdf(),
    //   downloadExcel: () => downloadInventoryReportExcel(),
    // },
    // {
    //   id: "customer-loyalty",
    //   title: "Customer Loyalty Report",
    //   desc: "Loyalty program members, rewards redeemed, and member activity.",
    //   requiresDateFilter: false,
    //   downloadPdf: () => downloadCustomerLoyaltyReportPdf(),
    //   downloadExcel: () => downloadCustomerLoyaltyReportExcel(),
    // },
    // {
    //   id: "reservations",
    //   title: "Reservations Report",
    //   desc: "Booking patterns, occupancy rates, and reservation analytics.",
    //   requiresDateFilter: true,
    //   downloadPdf: () => downloadReservationsReportPdf({ startDate, endDate }),
    //   downloadExcel: () =>
    //     downloadReservationsReportExcel({ startDate, endDate }),
    // },
    // {
    //   id: "executive-summary",
    //   title: "Executive Summary Report",
    //   desc: "High-level business overview with key performance indicators.",
    //   requiresDateFilter: true,
    //   downloadPdf: () =>
    //     downloadExecutiveSummaryReportPdf({ startDate, endDate }),
    //   downloadExcel: () =>
    //     downloadExecutiveSummaryReportExcel({ startDate, endDate }),
    // },
  ];

  const canDownload = (report: (typeof reports)[0]) =>
    !report.requiresDateFilter || (startDate && endDate);

  return (
    <div className="space-y-8 max-w-400 mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-primary" /> Reports & Exports
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate and export business intelligence reports.
        </p>
      </div>

      {/* Date Range Filter */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Date Range Filter:
              </span>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="flex flex-col gap-1">
                <label htmlFor="start-date" className="text-xs font-medium">
                  Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="end-date" className="text-xs font-medium">
                  End Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground ml-auto">
              Used by: Sales, Menu Performance, Reservations, Executive Summary
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="bg-card border-border/50 hover:border-primary/50 transition-colors"
          >
            <CardContent className="p-6 flex flex-col h-full">
              <FileText className="w-8 h-8 text-primary/70 mb-4" />
              <h3 className="text-xl font-bold mb-2">{report.title}</h3>
              <p className="text-sm text-muted-foreground mb-6 grow">
                {report.desc}
              </p>

              {report.requiresDateFilter && !startDate && (
                <p className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-950 p-2 rounded mb-4">
                  Select start and end dates to download this report.
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-2"
                  variant="outline"
                  onClick={report.downloadPdf}
                  disabled={!canDownload(report)}
                >
                  <Download className="w-4 h-4" /> PDF
                </Button>
                <Button
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={report.downloadExcel}
                  disabled={!canDownload(report)}
                >
                  <Download className="w-4 h-4" /> Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
