"use client";

import { useManagerStore } from "@/store/useManagerStore";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { RevenueChart } from "@/components/manager/charts/RevenueChart";
import { PopularMenuChart } from "@/components/manager/charts/PopularMenuChart";
import { DataTable } from "@/components/manager/ui/DataTable";
import { formatRupiah } from "@/lib/api/mappers";
import { DollarSign, ShoppingBag, Users, UserCog, Armchair, Gift } from "lucide-react";

export default function ManagerDashboard() {
  const { metrics, revenueData, popularMenuData, recentOrders } = useManagerStore();

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor your cafe's real-time performance and analytics.</p>
      </div>

      {/* High-level metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <AnalyticsCard
          title="Total Orders"
          value={metrics.totalOrders}
          icon={ShoppingBag}
          trend={metrics.orderGrowth}
        />
        <AnalyticsCard
          title="Total Revenue"
          value={formatRupiah(metrics.totalRevenue)}
          icon={DollarSign}
          trend={metrics.revenueGrowth}
        />
        <AnalyticsCard
          title="Total Customers"
          value={metrics.totalCustomers}
          icon={Users}
          trend={metrics.customerGrowth}
        />
        <AnalyticsCard
          title="Total Staff"
          value={metrics.totalStaff}
          icon={UserCog}
        />
        <AnalyticsCard
          title="Active Tables"
          value={`${metrics.activeTables}/${metrics.totalTables}`}
          icon={Armchair}
        />
        <AnalyticsCard
          title="Active Rewards"
          value={metrics.activeRewards}
          icon={Gift}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={revenueData} />
        <div className="col-span-1">
           <PopularMenuChart data={popularMenuData} />
        </div>
      </div>

      {/* Recent Orders */}
      <DataTable
        title="Recent Orders"
        description="The most recently placed orders"
        columns={[
          { header: "Order ID", accessorKey: "orderId", cell: (item) => `#${item.orderId}` },
          { header: "Customer", accessorKey: "customerName" },
          { header: "Items", accessorKey: "items" },
          { header: "Amount", accessorKey: "totalPrice", cell: (item) => formatRupiah(item.totalPrice) },
          { header: "Status", accessorKey: "status" },
        ]}
        data={recentOrders}
      />
    </div>
  );
}
