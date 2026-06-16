"use client";

import * as React from "react";
import { PackageSearch, AlertTriangle, PackageOpen, Box, Download, FileSpreadsheet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { Button } from "@/components/ui/Button";
import { StockFilters } from "@/components/manager/stock/StockFilters";
import { StockTable } from "@/components/manager/stock/StockTable";
import { ExportStockButton } from "@/components/manager/stock/ExportStockButton";
import { StockItem } from "@/types/stock";
import { stocksApi, type ApiStock } from "@/lib/api";
import { exportToPdf, exportToExcel, type ExportColumn, type ExportRow } from "@/lib/export";

function toStockItem(stock: ApiStock): StockItem {
  let status: StockItem["status"] = "Good";
  if (stock.quantity <= 0) {
    status = "Out of Stock";
  } else if (stock.min_stock != null && stock.quantity <= stock.min_stock) {
    status = "Low";
  }

  return {
    id: `STK-${stock.id}`,
    name: stock.menu?.name || `Menu #${stock.menu_id}`,
    category: stock.menu?.category?.name || "-",
    quantity: String(stock.quantity),
    status,
    lastUpdated: stock.updated_at ? new Date(stock.updated_at).toLocaleString("id-ID") : "-",
  };
}

export default function StockMonitoringPage() {
  const [stockItems, setStockItems] = React.useState<StockItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    stocksApi
      .listStocks()
      .then((data) => {
        if (mounted) setStockItems(data.map(toStockItem));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const categoryOptions = React.useMemo(
    () => Array.from(new Set(stockItems.map((item) => item.category))),
    [stockItems],
  );

  const filteredStock = React.useMemo(() => {
    return stockItems.filter(item => {
      const matchSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchStatus = statusFilter === "All" || item.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [stockItems, searchTerm, categoryFilter, statusFilter]);

  // Analytics
  const totalItems = filteredStock.length;
  const criticalItemsCount = filteredStock.filter(s => s.status === "Low" || s.status === "Out of Stock").length;
  const goodStatusCount = filteredStock.filter(s => s.status === "Good").length;

  const exportColumns: ExportColumn[] = [
    { header: "Item Code", key: "id" },
    { header: "Name", key: "name" },
    { header: "Category", key: "category" },
    { header: "Quantity", key: "quantity" },
    { header: "Status", key: "status" },
    { header: "Last Updated", key: "lastUpdated" },
  ];

  const exportRows: ExportRow[] = filteredStock.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    status: item.status,
    lastUpdated: item.lastUpdated,
  }));

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10 relative">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight flex items-center gap-2">
            <PackageSearch className="w-8 h-8 text-primary" /> Stock Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">Monitor inventory levels and identify low-stock items.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportStockButton data={filteredStock} filename="eeatery_inventory" />
          <Button
            variant="outline"
            className="gap-2 bg-card border-border/50"
            onClick={() => exportToPdf("Stock Monitoring Report", exportColumns, exportRows)}
          >
            <Download className="w-4 h-4" /> Export PDF
          </Button>
          <Button
            variant="outline"
            className="gap-2 bg-card border-border/50"
            onClick={() => exportToExcel("Stock Monitoring Report", exportColumns, exportRows)}
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalyticsCard
          title="Total Monitored Items"
          value={totalItems}
          icon={Box}
          iconColorClass="text-blue-500"
          iconBgClass="bg-blue-500/10"
        />
        <AnalyticsCard
          title="In Good Condition"
          value={goodStatusCount}
          icon={PackageOpen}
          iconColorClass="text-green-500"
          iconBgClass="bg-green-500/10"
        />
        <Card className="bg-red-500/5 border-red-500/20 shadow-sm relative overflow-hidden group">
          <CardContent className="p-6 flex justify-between items-start">
            <div className="space-y-2 z-10 relative">
              <p className="text-sm font-medium text-red-500/80">Critical / Low Stock</p>
              <p className="text-3xl font-bold text-red-500">{criticalItemsCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 z-10 relative group-hover:scale-110 transition-transform duration-300 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            {/* Decorative background element */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors duration-500"></div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <StockFilters
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        categoryOptions={categoryOptions}
      />

      {/* Data Table */}
      <StockTable
        data={filteredStock}
        isLoading={isLoading}
      />

    </div>
  );
}
