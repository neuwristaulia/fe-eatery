"use client";

import * as React from "react";
import { BarChart3, Download, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { DataTable } from "@/components/manager/ui/DataTable";
import { reportsApi, type ApiSalesByMenuItem, type ApiSalesByMenuSummary } from "@/lib/api";
import { formatRupiah } from "@/lib/api/mappers";
import { exportToCsv, exportToExcel, exportToPdf, type ExportColumn, type ExportRow, type ExportSummaryLine } from "@/lib/export";

const REPORT_TITLE = "Sales Report";

export default function ReportsPage() {
  const [items, setItems] = React.useState<ApiSalesByMenuItem[]>([]);
  const [summary, setSummary] = React.useState<ApiSalesByMenuSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    reportsApi
      .getSalesByMenuReport()
      .then((data) => {
        if (!mounted) return;
        setItems(data.items);
        setSummary(data.summary);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const exportColumns: ExportColumn[] = [
    { header: "Menu Name", key: "menu_name" },
    { header: "Qty Sold", key: "qty_sold" },
    { header: "Revenue", key: "revenue" },
  ];

  const exportRows: ExportRow[] = items.map((item) => ({
    menu_name: item.menu_name,
    qty_sold: item.qty_sold,
    revenue: formatRupiah(item.revenue),
  }));

  const exportSummary: ExportSummaryLine[] = summary
    ? [
        { label: "Total Revenue", value: formatRupiah(summary.total_revenue) },
        { label: "Total Orders", value: summary.total_orders },
        { label: "Average Order Value", value: formatRupiah(summary.average_order_value) },
      ]
    : [];

  return (
    <div className="space-y-8 max-w-400 mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" /> {REPORT_TITLE}
          </h1>
          <p className="text-muted-foreground mt-1">
            Quantity sold and revenue per menu item for completed orders.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => exportToPdf(REPORT_TITLE, exportColumns, exportRows, exportSummary)}
          >
            <Download className="w-4 h-4" /> Export PDF
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => exportToCsv(REPORT_TITLE, exportColumns, exportRows, exportSummary)}
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => exportToExcel(REPORT_TITLE, exportColumns, exportRows, exportSummary)}
          >
            <Download className="w-4 h-4" /> Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalyticsCard
          title="Total Revenue"
          value={formatRupiah(summary?.total_revenue ?? 0)}
          icon={DollarSign}
        />
        <AnalyticsCard
          title="Total Orders"
          value={summary?.total_orders ?? 0}
          icon={ShoppingBag}
        />
        <AnalyticsCard
          title="Average Order Value"
          value={formatRupiah(summary?.average_order_value ?? 0)}
          icon={TrendingUp}
        />
      </div>

      <DataTable
        title={REPORT_TITLE}
        description="Per-menu quantity sold and revenue for completed orders"
        columns={[
          { header: "Menu Name", accessorKey: "menu_name" },
          { header: "Qty Sold", accessorKey: "qty_sold" },
          {
            header: "Revenue",
            accessorKey: "revenue",
            cell: (row: ApiSalesByMenuItem) => formatRupiah(row.revenue),
          },
        ]}
        data={isLoading ? [] : items}
      />
    </div>
  );
}
