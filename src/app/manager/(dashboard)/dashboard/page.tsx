"use client";

import { useManagerStore } from "@/store/useManagerStore";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { RevenueChart } from "@/components/manager/charts/RevenueChart";
import { PopularMenuChart } from "@/components/manager/charts/PopularMenuChart";
import { DataTable } from "@/components/manager/ui/DataTable";
import { DollarSign, ShoppingBag, Users, AlertTriangle, Armchair, Gift } from "lucide-react";

export default function ManagerDashboard() {
  const { metrics, revenueData, popularMenuData } = useManagerStore();

  // Mock data for recent activities
  const recentActivities = [
    { id: "1", time: "10:30 AM", action: "Large Order #ORD-108", details: "Rp 350.000 (Dine-in)" },
    { id: "2", time: "10:15 AM", action: "Low Stock Alert", details: "Espresso Beans below 10%" },
    { id: "3", time: "09:45 AM", action: "Reward Redeemed", details: "Free Coffee by John Doe" },
    { id: "4", time: "09:00 AM", action: "Shift Started", details: "Morning Staff logged in" },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor your cafe's real-time performance and analytics.</p>
      </div>

      {/* High-level metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <AnalyticsCard 
          title="Total Revenue" 
          value={`Rp ${(metrics.totalRevenue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          trend={metrics.revenueGrowth}
        />
        <AnalyticsCard 
          title="Total Orders" 
          value={metrics.totalOrders}
          icon={ShoppingBag}
          trend={metrics.orderGrowth}
        />
        <AnalyticsCard 
          title="Active Tables" 
          value={`${metrics.activeTables}/20`}
          icon={Armchair}
        />
        <AnalyticsCard 
          title="New Customers" 
          value={metrics.newCustomers}
          icon={Users}
          trend={metrics.customerGrowth}
        />
        <AnalyticsCard 
          title="Reward Redemptions" 
          value={metrics.rewardRedemptions}
          icon={Gift}
          trend={12}
        />
        <AnalyticsCard 
          title="Low Stock Items" 
          value={metrics.lowStockItems}
          icon={AlertTriangle}
          trend={-2}
          description="items need restock"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={revenueData} />
        <div className="col-span-1">
           <PopularMenuChart data={popularMenuData} />
        </div>
      </div>

      {/* Recent Activity & Mini Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable 
            title="Recent Significant Orders"
            description="High value orders from the last 24 hours"
            columns={[
              { header: "Order ID", accessorKey: "id" },
              { header: "Type", accessorKey: "type" },
              { header: "Customer", accessorKey: "customer" },
              { header: "Amount", accessorKey: "amount" },
            ]}
            data={[
              { id: "ORD-108", type: "Dine In", customer: "Budi", amount: "Rp 350.000" },
              { id: "ORD-102", type: "Take Away", customer: "Siti", amount: "Rp 210.000" },
              { id: "ORD-095", type: "Dine In", customer: "Andi", amount: "Rp 450.000" },
              { id: "ORD-088", type: "Dine In", customer: "Guest", amount: "Rp 180.000" },
            ]}
          />
        </div>

        <div className="bg-card border-border/50 rounded-2xl shadow-sm p-6 col-span-1 flex flex-col">
          <h3 className="font-semibold leading-none tracking-tight mb-1">Activity Timeline</h3>
          <p className="text-sm text-muted-foreground mb-6">Live updates from the cafe floor</p>
          
          <div className="flex-1 space-y-6">
            {recentActivities.map((activity, i) => (
              <div key={activity.id} className="relative pl-6">
                {/* Timeline line */}
                {i !== recentActivities.length - 1 && (
                  <div className="absolute left-[7px] top-6 bottom-[-24px] w-px bg-border/50"></div>
                )}
                {/* Timeline dot */}
                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-primary/20 border-2 border-primary"></div>
                
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground mb-1">{activity.time}</span>
                  <span className="font-medium text-sm">{activity.action}</span>
                  <span className="text-sm text-muted-foreground">{activity.details}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
