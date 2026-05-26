"use client";

import * as React from "react";
import { DataTable } from "@/components/manager/ui/DataTable";
import { Card, CardContent } from "@/components/ui/Card";
import { ReceiptText, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Mock Data - Added one from yesterday to test 'Today' filter
const mockOrders = [
  { id: "ORD-120", date: "2026-05-24 19:30", customer: "Ahmad", type: "Dine In", table: "T-05", total: "Rp 120.000", status: "Completed" },
  { id: "ORD-121", date: "2026-05-24 19:45", customer: "Sarah", type: "Take Away", table: "-", total: "Rp 85.000", status: "Preparing" },
  { id: "ORD-122", date: "2026-05-24 20:00", customer: "Budi", type: "Dine In", table: "T-12", total: "Rp 210.000", status: "Ready" },
  { id: "ORD-123", date: "2026-05-24 20:15", customer: "Citra", type: "Pickup", table: "-", total: "Rp 150.000", status: "Confirmed" },
  { id: "ORD-124", date: "2026-05-24 20:30", customer: "Deni", type: "Dine In", table: "T-02", total: "Rp 340.000", status: "Completed" },
  { id: "ORD-110", date: "2026-05-23 14:00", customer: "Eka", type: "Dine In", table: "T-01", total: "Rp 150.000", status: "Completed" }, // Kemarin
];

export default function OrderMonitoringPage() {
  const [typeFilter, setTypeFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [selectedDate, setSelectedDate] = React.useState("");
  const [showStatusFilters, setShowStatusFilters] = React.useState(false);

  const filteredOrders = React.useMemo(() => {
    return mockOrders.filter(order => {
      // 1. Filter Type
      const matchType = typeFilter === "All" || order.type === typeFilter;
      
      // 2. Filter Status
      const matchStatus = statusFilter === "All" || order.status === statusFilter;
      
      // 3. Filter by Date (If a date is selected, check if order.date starts with it)
      const matchDate = !selectedDate || order.date.startsWith(selectedDate);

      return matchType && matchStatus && matchDate;
    });
  }, [typeFilter, statusFilter, selectedDate]);

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
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 pb-2 overflow-x-auto hide-scrollbar">
          {["All", "Dine In", "Take Away", "Pickup"].map(f => (
            <Button 
              key={f} 
              variant={typeFilter === f ? "primary" : "outline"}
              className={typeFilter === f ? "bg-primary text-primary-foreground" : "bg-card border-border/50"}
              onClick={() => setTypeFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>

        {showStatusFilters && (
          <div className="flex gap-2 pb-4 overflow-x-auto hide-scrollbar animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium text-muted-foreground self-center mr-2">Status:</span>
            {["All", "Confirmed", "Preparing", "Ready", "Completed"].map(f => (
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
          { header: "Order ID", accessorKey: "id" },
          { header: "Date & Time", accessorKey: "date" },
          { header: "Customer", accessorKey: "customer" },
          { header: "Type", accessorKey: "type" },
          { header: "Table", accessorKey: "table" },
          { header: "Total", accessorKey: "total" },
          { 
            header: "Status", 
            accessorKey: "status",
            cell: (row) => (
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                ${row.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 
                  row.status === 'Preparing' ? 'bg-orange-500/10 text-orange-500' : 
                  row.status === 'Ready' ? 'bg-blue-500/10 text-blue-500' : 
                  'bg-gray-500/10 text-gray-500'}`}
              >
                {row.status}
              </span>
            )
          },
        ]}
        data={filteredOrders}
        searchPlaceholder="Search by ID or Customer..."
        onRowClick={(row) => console.log("View order details:", row.id)}
      />
    </div>
  );
}
