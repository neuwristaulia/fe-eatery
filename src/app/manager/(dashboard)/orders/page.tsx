"use client";

import * as React from "react";
import { DataTable } from "@/components/manager/ui/DataTable";
import { ReceiptText, Filter, Calendar, Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ordersApi, type ApiOrder } from "@/lib/api";
import { formatRupiah } from "@/lib/api/mappers";
import { exportToCsv, exportToPdf, type ExportColumn, type ExportRow } from "@/lib/export";

const TYPE_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "All" },
  { label: "Dine In", value: "dine-in" },
  { label: "Take Away", value: "takeaway" },
];

function statusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-500/10 text-green-500";
    case "preparing":
    case "processing":
      return "bg-orange-500/10 text-orange-500";
    case "confirmed":
    case "order_placed":
    case "paid":
      return "bg-blue-500/10 text-blue-500";
    case "cancelled":
    case "refunded":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
}

export default function OrderMonitoringPage() {
  const [orders, setOrders] = React.useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [typeFilter, setTypeFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [selectedDate, setSelectedDate] = React.useState("");
  const [showStatusFilters, setShowStatusFilters] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    ordersApi
      .listOrders()
      .then((data) => {
        if (mounted) setOrders(data);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const statusOptions = React.useMemo(() => {
    const unique = Array.from(new Set(orders.map((o) => o.status)));
    return ["All", ...unique];
  }, [orders]);

  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const matchType = typeFilter === "All" || order.order_type === typeFilter;
      const matchStatus = statusFilter === "All" || order.status === statusFilter;
      const matchDate = !selectedDate || (order.created_at ?? "").startsWith(selectedDate);
      return matchType && matchStatus && matchDate;
    });
  }, [orders, typeFilter, statusFilter, selectedDate]);

  const tableRows = React.useMemo(
    () =>
      filteredOrders.map((order) => ({
        id: order.id,
        date: order.created_at ? new Date(order.created_at).toLocaleString("id-ID") : "-",
        customer: order.user?.name || "Guest",
        type: order.order_type === "dine-in" ? "Dine In" : order.order_type === "takeaway" ? "Take Away" : order.order_type,
        table: order.table?.table_number != null ? `T-${order.table.table_number}` : "-",
        total: order.total_price,
        status: order.status,
      })),
    [filteredOrders],
  );

  const exportColumns: ExportColumn[] = [
    { header: "Order ID", key: "id" },
    { header: "Date & Time", key: "date" },
    { header: "Customer", key: "customer" },
    { header: "Type", key: "type" },
    { header: "Table", key: "table" },
    { header: "Total", key: "total" },
    { header: "Status", key: "status" },
  ];

  const exportRows: ExportRow[] = tableRows.map((row) => ({
    id: row.id,
    date: row.date,
    customer: row.customer,
    type: row.type,
    table: row.table,
    total: formatRupiah(row.total),
    status: row.status,
  }));

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight flex items-center gap-2">
            <ReceiptText className="w-8 h-8 text-primary" /> Order Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">Track and analyze all incoming and historical orders.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-lg border border-border/50 bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-foreground cursor-pointer appearance-none min-h-[40px]"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          <Button
            variant={showStatusFilters ? "primary" : "outline"}
            className={`gap-2 ${showStatusFilters ? "bg-primary text-primary-foreground" : "bg-card border-border/50"}`}
            onClick={() => setShowStatusFilters(!showStatusFilters)}
          >
            <Filter className="w-4 h-4" /> Filters
          </Button>
          <Button
            variant="outline"
            className="gap-2 bg-card border-border/50"
            onClick={() => exportToCsv("Order Monitoring Report", exportColumns, exportRows)}
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </Button>
          <Button
            variant="outline"
            className="gap-2 bg-card border-border/50"
            onClick={() => exportToPdf("Order Monitoring Report", exportColumns, exportRows)}
          >
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 pb-2 overflow-x-auto hide-scrollbar">
          {TYPE_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={typeFilter === f.value ? "primary" : "outline"}
              className={typeFilter === f.value ? "bg-primary text-primary-foreground" : "bg-card border-border/50"}
              onClick={() => setTypeFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {showStatusFilters && (
          <div className="flex gap-2 pb-4 overflow-x-auto hide-scrollbar animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium text-muted-foreground self-center mr-2">Status:</span>
            {statusOptions.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={statusFilter === f ? "primary" : "outline"}
                className={statusFilter === f ? "bg-secondary text-secondary-foreground" : "bg-card border-border/50"}
                onClick={() => setStatusFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        )}
      </div>

      <DataTable
        columns={[
          { header: "Order ID", accessorKey: "id", cell: (row) => `#${row.id}` },
          { header: "Date & Time", accessorKey: "date" },
          { header: "Customer", accessorKey: "customer" },
          { header: "Type", accessorKey: "type" },
          { header: "Table", accessorKey: "table" },
          { header: "Total", accessorKey: "total", cell: (row) => formatRupiah(row.total) },
          {
            header: "Status",
            accessorKey: "status",
            cell: (row) => (
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusBadgeClass(row.status)}`}>
                {row.status}
              </span>
            ),
          },
        ]}
        data={isLoading ? [] : tableRows}
        searchPlaceholder="Search by ID or Customer..."
      />
    </div>
  );
}
