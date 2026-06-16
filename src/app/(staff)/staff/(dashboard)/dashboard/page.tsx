"use client";

import * as React from "react";
import { useStaffStore } from "@/store/useStaffStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Receipt,
  Clock,
  CheckCircle,
  Wallet,
  ChefHat,
  LayoutGrid,
} from "lucide-react";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";

export default function StaffDashboard() {
  const { orders, tables } = useStaffStore();

  const totalOrders = orders.length;
  const activeOrders = orders.filter(
    (o) => o.status !== "completed" && o.status !== "cancelled",
  ).length;
  const pendingPayments = orders.filter(
    (o) => o.paymentStatus === "unpaid",
  ).length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  const newOrders = orders.filter((o) => o.status === "order_placed").length;
  const inPreparation = orders.filter(
    (o) => o.status === "confirmed" || o.status === "preparing",
  ).length;

  const availableTables = tables.filter((t) => t.status === "available").length;
  const occupiedTables = tables.filter((t) => t.status === "occupied").length;

  const statusStyles: Record<string, string> = {
    completed: "bg-green-500/10 text-green-500",
    cancelled: "bg-red-500/10 text-red-500",
    pending: "bg-gray-500/10 text-gray-500",
    order_placed: "bg-yellow-500/10 text-yellow-600",
    confirmed: "bg-blue-500/10 text-blue-500",
    preparing: "bg-orange-500/10 text-orange-500",
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-serif font-bold">Overview</h2>
        <p className="text-muted-foreground">Today's operational metrics.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Orders"
          value={totalOrders}
          icon={Receipt}
          iconColorClass="text-primary"
          iconBgClass="bg-primary/10"
        />
        <AnalyticsCard
          title="Active Orders"
          value={activeOrders}
          icon={Clock}
          iconColorClass="text-blue-500"
          iconBgClass="bg-blue-500/10"
        />
        <AnalyticsCard
          title="Pending Payment"
          value={pendingPayments}
          icon={Wallet}
          iconColorClass="text-yellow-500"
          iconBgClass="bg-yellow-500/10"
        />
        <AnalyticsCard
          title="Completed"
          value={completedOrders}
          icon={CheckCircle}
          iconColorClass="text-green-500"
          iconBgClass="bg-green-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kitchen Status */}
        <Card className="bg-card border-none shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              Kitchen Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-xl">
              <div>
                <p className="font-medium text-yellow-700 dark:text-yellow-400">
                  New Orders
                </p>
                <p className="text-sm text-yellow-600/70 dark:text-yellow-500/70">
                  Awaiting confirmation
                </p>
              </div>
              <div className="text-3xl font-bold text-yellow-500">{newOrders}</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium">In Preparation</p>
                <p className="text-sm text-muted-foreground">
                  Confirmed & preparing
                </p>
              </div>
              <div className="text-3xl font-bold text-orange-500">{inPreparation}</div>
            </div>
          </CardContent>
        </Card>

        {/* Table Status */}
        <Card className="bg-card border-none shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-primary" />
              Table Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium">Available Tables</p>
                <p className="text-sm text-muted-foreground">Ready for walk-ins</p>
              </div>
              <div className="text-3xl font-bold text-primary">{availableTables}</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium">Occupied Tables</p>
                <p className="text-sm text-muted-foreground">Currently seated</p>
              </div>
              <div className="text-3xl font-bold">{occupiedTables}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <div className="mt-8">
        <h3 className="text-xl font-serif font-bold mb-4">Recent Orders</h3>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{order.id}</td>
                    <td className="px-6 py-4 capitalize">
                      <div className="flex flex-col">
                        <span>{order.type.replace("-", " ")}</span>
                        {order.tableNumber && (
                          <span className="text-xs text-muted-foreground">
                            Table {order.tableNumber.replace("T-", "")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                          statusStyles[order.status] || "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{order.time}</td>
                    <td className="px-6 py-4 text-right font-bold text-primary">
                      Rp {order.total.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
