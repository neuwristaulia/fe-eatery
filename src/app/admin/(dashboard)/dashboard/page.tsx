"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Receipt,
  Users,
  UtensilsCrossed,
  Armchair,
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  Gift,
  Loader2,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardApi } from "@/lib/api";
import type { ApiDashboard } from "@/lib/api/types";

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500/10 text-green-600";
    case "preparing":
      return "bg-primary/10 text-primary";
    case "confirmed":
      return "bg-blue-500/10 text-blue-600";
    case "order_placed":
      return "bg-indigo-500/10 text-indigo-600";
    case "cancelled":
      return "bg-red-500/10 text-red-600";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<ApiDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await dashboardApi.getAdminDashboard();
        if (mounted) setDashboard(data);
      } catch (err) {
        if (mounted)
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard",
          );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      const blob = await dashboardApi.downloadSalesReportPdf(
        fmt(start),
        fmt(end),
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sales_report_${fmt(start)}_${fmt(end)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // best-effort download; ignore failures
    } finally {
      setDownloading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalRevenue = dashboard?.total_revenue ?? 0;
  const totalOrders = dashboard?.total_orders ?? 0;
  const completedOrders = dashboard?.completed_orders ?? 0;
  const cancelledOrders = dashboard?.cancelled_orders ?? 0;
  const totalCustomers = dashboard?.total_customers ?? 0;
  const totalMenus = dashboard?.total_menus ?? 0;
  const activeTables = dashboard?.active_tables ?? 0;
  const totalTables = dashboard?.total_tables ?? 0;
  const lowStockItems = dashboard?.low_stock_items ?? 0;
  const rewardRedemptions = dashboard?.reward_redemptions ?? 0;
  const topMenus = dashboard?.top_menus ?? [];
  const revenueChart = dashboard?.revenue_chart ?? [];
  const recentOrders = dashboard?.recent_orders ?? [];

  const stats = [
    {
      title: "Total Revenue",
      value: `Rp ${totalRevenue.toLocaleString("id-ID")}`,
      icon: DollarSign,
      sub: "Semua pesanan yang masuk",
    },
    {
      title: "Total Orders",
      value: String(totalOrders),
      icon: Receipt,
      sub: `${completedOrders} completed, ${cancelledOrders} cancelled`,
    },
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString("id-ID"),
      icon: Users,
      sub: "Akun customer terdaftar",
    },
    {
      title: "Total Menus",
      value: String(totalMenus),
      icon: UtensilsCrossed,
      sub: "Menu aktif tersedia",
    },
    {
      title: "Active Tables",
      value: `${activeTables}/${totalTables}`,
      icon: Armchair,
      sub: "Meja sedang digunakan",
    },
    {
      title: "Reward Redemptions",
      value: String(rewardRedemptions),
      icon: Gift,
      sub: "Total penukaran reward",
    },
    {
      title: "Low Stock Items",
      value: String(lowStockItems),
      icon: AlertTriangle,
      sub: lowStockItems > 0 ? "Perlu restock segera" : "Stok aman",
      alert: lowStockItems > 0,
    },
  ];

  const maxRevenue = Math.max(1, ...revenueChart.map((r) => r.revenue));
  const maxMenuQty = Math.max(1, ...topMenus.map((m) => m.quantity));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 h-full flex flex-col"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview performa Kedai Loman hari ini.
          </p>
        </div>
        <button
          onClick={handleDownloadReport}
          disabled={downloading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Download Report
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div variants={itemVariants} key={i}>
            <Card
              className={cn(
                "border-none shadow-md relative overflow-hidden",
                stat.alert ? "bg-red-500/5" : "bg-card",
              )}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </h3>
                  </div>
                  <div
                    className={cn(
                      "p-3 rounded-2xl",
                      stat.alert
                        ? "bg-red-500/20 text-red-600"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "text-xs",
                      stat.alert
                        ? "text-red-600 font-bold"
                        : "text-muted-foreground",
                    )}
                  >
                    {stat.sub}
                  </span>
                </div>
              </CardContent>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-2xl"></div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-none shadow-md bg-card h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="font-serif text-xl">
                  Revenue Overview
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Pendapatan 7 hari terakhir
                </p>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end pb-4">
              {revenueChart.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                  Belum ada data pendapatan.
                </div>
              ) : (
                <div className="relative h-64 mt-4 flex items-end justify-between gap-4">
                  <div className="pl-2 w-full flex justify-between items-end h-[calc(100%-24px)] z-10 relative">
                    {revenueChart.map((point, i) => {
                      const heightPct = (point.revenue / maxRevenue) * 100;
                      const dayLabel = new Date(
                        `${point.date}T00:00:00`,
                      ).toLocaleDateString("id-ID", { weekday: "short" });

                      return (
                        <div
                          key={i}
                          className="relative w-full max-w-[40px] flex flex-col items-center group cursor-pointer"
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-14 bg-foreground text-background p-2 rounded-lg shadow-xl text-xs font-medium transition-all transform scale-95 group-hover:scale-100 z-50 whitespace-nowrap pointer-events-none">
                            <p className="font-bold border-b border-background/20 pb-1 mb-1">
                              {point.date}
                            </p>
                            <p>Rp {point.revenue.toLocaleString("id-ID")}</p>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45"></div>
                          </div>

                          <div className="w-full flex flex-col justify-end items-center h-[200px] gap-0.5">
                            <div
                              className="w-full bg-primary hover:bg-primary/90 transition-colors rounded-t-sm"
                              style={{
                                height: `${Math.max(heightPct, point.revenue > 0 ? 2 : 0)}%`,
                              }}
                            ></div>
                          </div>

                          <span className="text-[10px] font-bold text-muted-foreground mt-3 group-hover:text-foreground transition-colors">
                            {dayLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-none shadow-md bg-card h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-serif text-xl">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Belum ada pesanan.
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-background transition-colors border border-transparent hover:border-border/50"
                  >
                    <div>
                      <p className="font-bold text-sm text-foreground">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {order.items || "-"}
                      </p>
                      <p className="text-xs font-medium text-primary mt-1">
                        Rp {order.total_price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                        getStatusColor(order.status),
                      )}
                    >
                      {order.status.replace("_", " ")}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Popular Menus */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-md bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-xl">Popular Menus</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Menu paling banyak dipesan
            </p>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {topMenus.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada data penjualan menu.
              </p>
            ) : (
              topMenus.map((menu, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-40 shrink-0 text-sm font-medium text-foreground truncate">
                    {menu.name}
                  </div>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${(menu.quantity / maxMenuQty) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="w-20 shrink-0 text-right text-sm font-bold text-foreground flex items-center justify-end gap-1">
                    {menu.quantity}
                    <ArrowUpRight className="w-3 h-3 text-primary" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
