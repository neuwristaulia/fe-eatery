"use client";

import * as React from "react";
import { PackageSearch, AlertTriangle, PackageOpen, Box } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { StockFilters } from "@/components/manager/stock/StockFilters";
import { StockTable } from "@/components/manager/stock/StockTable";
import { ExportStockButton } from "@/components/manager/stock/ExportStockButton";
import { StockItem } from "@/types/stock";

const mockStock: StockItem[] = [
  { id: "STK-001", name: "Espresso Beans", category: "Ingredients", quantity: "2.5 kg", status: "Low", lastUpdated: "Today, 08:00 AM" },
  { id: "STK-002", name: "Milk (Fresh)", category: "Ingredients", quantity: "15 liters", status: "Good", lastUpdated: "Today, 08:00 AM" },
  { id: "STK-003", name: "Takeaway Cups (M)", category: "Packaging", quantity: "50 pcs", status: "Low", lastUpdated: "Yesterday, 22:00 PM" },
  { id: "STK-004", name: "Matcha Powder", category: "Ingredients", quantity: "1.2 kg", status: "Good", lastUpdated: "2 Days ago" },
  { id: "STK-005", name: "Napkins", category: "Supplies", quantity: "500 pcs", status: "Good", lastUpdated: "Yesterday, 22:00 PM" },
  { id: "STK-006", name: "Vanilla Syrup", category: "Ingredients", quantity: "0 ml", status: "Out of Stock", lastUpdated: "Today, 10:30 AM" },
  { id: "STK-007", name: "Iced Tea Mix", category: "Beverages", quantity: "5 kg", status: "Good", lastUpdated: "1 Week ago" },
];

export default function StockMonitoringPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [isLoading, setIsLoading] = React.useState(true);

  // Simulate network request
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredStock = React.useMemo(() => {
    return mockStock.filter(item => {
      const matchSearch = 
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchStatus = statusFilter === "All" || item.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [searchTerm, categoryFilter, statusFilter]);

  // Analytics
  const totalItems = filteredStock.length;
  const criticalItemsCount = filteredStock.filter(s => s.status === "Low" || s.status === "Out of Stock").length;
  const goodStatusCount = filteredStock.filter(s => s.status === "Good").length;

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
        <ExportStockButton data={filteredStock} filename="eeatery_inventory" />
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
      />

      {/* Data Table */}
      <StockTable 
        data={filteredStock} 
        isLoading={isLoading} 
      />

    </div>
  );
}
