"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Receipt, Users, Bike, Armchair, TrendingUp, AlertTriangle, ArrowUpRight, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { title: "Total Revenue", value: "Rp 12.450.000", icon: DollarSign, trend: "+15%", positive: true },
  { title: "Total Orders", value: "156", icon: Receipt, trend: "+8%", positive: true },
  { title: "Total Customers", value: "1,245", icon: Users, trend: "+12%", positive: true },
  { title: "Active Deliveries", value: "12", icon: Bike, trend: "Stable", positive: true },
  { title: "Available Tables", value: "8/20", icon: Armchair, trend: "Busy", positive: false },
  { title: "Low Stock Items", value: "5", icon: AlertTriangle, trend: "Warning", positive: false, alert: true },
];

const recentOrders = [
  { id: "ORD-001", customer: "Budi Santoso", items: "2x Kopi e-Eatery, 1x Kaya Toast", total: "Rp 85.000", status: "ready" },
  { id: "ORD-002", customer: "Siti Aminah", items: "1x Nasi Goreng Spesial", total: "Rp 45.000", status: "created" },
  { id: "ORD-003", customer: "Andi Wijaya", items: "3x Teh Tarik, 2x Roti Bakar", total: "Rp 110.000", status: "completed" },
  { id: "ORD-004", customer: "Dewi Lestari", items: "1x Mie Goreng Seafood", total: "Rp 55.000", status: "confirmed" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-500/10 text-green-600";
    case "ready": return "bg-primary/10 text-primary";
    case "confirmed": return "bg-blue-500/10 text-blue-600";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function AdminDashboardPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview performa e-Eatery hari ini.</p>
        </div>
        <button 
          onClick={() => {
            // Mock download
            const link = document.createElement("a");
            link.href = "data:text/csv;charset=utf-8,Mock Report Data";
            link.download = `report_${new Date().getTime()}.csv`;
            link.click();
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div variants={itemVariants} key={i}>
            <Card className={cn("border-none shadow-md relative overflow-hidden", stat.alert ? "bg-red-500/5" : "bg-card")}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
                  </div>
                  <div className={cn("p-3 rounded-2xl", stat.alert ? "bg-red-500/20 text-red-600" : "bg-primary/10 text-primary")}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className={cn("flex items-center gap-1 font-bold", stat.positive ? "text-green-600" : (stat.alert ? "text-red-600" : "text-orange-500"))}>
                    {stat.positive && <ArrowUpRight className="w-4 h-4" />}
                    {stat.trend}
                  </span>
                  <span className="text-muted-foreground">vs kemarin</span>
                </div>
              </CardContent>
              {/* Decorative graphic */}
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
                <CardTitle className="font-serif text-xl">Revenue Overview</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Pendapatan 7 hari terakhir</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs font-medium"><span className="w-2 h-2 rounded-full bg-primary"></span> Online</span>
                <span className="flex items-center gap-1 text-xs font-medium"><span className="w-2 h-2 rounded-full bg-primary/30"></span> Dine-in</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end pb-4">
              <div className="relative h-64 mt-4 flex items-end justify-between gap-4">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-6 w-full flex flex-col justify-between text-[10px] text-muted-foreground font-mono z-0 pointer-events-none">
                  <div className="flex items-center gap-2 w-full"><span className="w-8 text-right">100M</span><div className="flex-1 border-t border-dashed border-border/50"></div></div>
                  <div className="flex items-center gap-2 w-full"><span className="w-8 text-right">75M</span><div className="flex-1 border-t border-dashed border-border/50"></div></div>
                  <div className="flex items-center gap-2 w-full"><span className="w-8 text-right">50M</span><div className="flex-1 border-t border-dashed border-border/50"></div></div>
                  <div className="flex items-center gap-2 w-full"><span className="w-8 text-right">25M</span><div className="flex-1 border-t border-dashed border-border/50"></div></div>
                  <div className="flex items-center gap-2 w-full"><span className="w-8 text-right">0</span><div className="flex-1 border-t border-solid border-border"></div></div>
                </div>

                {/* Bars */}
                <div className="pl-12 w-full flex justify-between items-end h-[calc(100%-24px)] z-10 relative">
                  {[
                    { day: "Sen", online: 40, dinein: 20 },
                    { day: "Sel", online: 60, dinein: 35 },
                    { day: "Rab", online: 45, dinein: 25 },
                    { day: "Kam", online: 80, dinein: 40 },
                    { day: "Jum", online: 95, dinein: 55 },
                    { day: "Sab", online: 120, dinein: 80 },
                    { day: "Min", online: 110, dinein: 75 },
                  ].map((data, i) => {
                    const totalMax = 200; // max scale
                    const onlineHeight = (data.online / totalMax) * 100;
                    const dineinHeight = (data.dinein / totalMax) * 100;
                    
                    return (
                      <div key={i} className="relative w-full max-w-[40px] flex flex-col items-center group cursor-pointer">
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-14 bg-foreground text-background p-2 rounded-lg shadow-xl text-xs font-medium transition-all transform scale-95 group-hover:scale-100 z-50 whitespace-nowrap pointer-events-none">
                          <p className="font-bold border-b border-background/20 pb-1 mb-1">{data.day}</p>
                          <p>Online: Rp {(data.online * 100000).toLocaleString('id-ID')}</p>
                          <p>Dine-in: Rp {(data.dinein * 100000).toLocaleString('id-ID')}</p>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45"></div>
                        </div>

                        {/* Stacked Bar */}
                        <div className="w-full flex flex-col justify-end items-center h-[200px] gap-0.5">
                          <div 
                            className="w-full bg-primary/40 hover:bg-primary/50 transition-colors rounded-t-sm" 
                            style={{ height: `${dineinHeight}%` }}
                          ></div>
                          <div 
                            className="w-full bg-primary hover:bg-primary/90 transition-colors rounded-b-sm" 
                            style={{ height: `${onlineHeight}%` }}
                          ></div>
                        </div>

                        {/* X-axis label */}
                        <span className="text-[10px] font-bold text-muted-foreground mt-3 group-hover:text-foreground transition-colors">{data.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-none shadow-md bg-card h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-serif text-xl">Recent Orders</CardTitle>
              <a href="/admin/orders" className="text-sm text-primary hover:underline font-medium">View All</a>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {recentOrders.map((order, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-background transition-colors border border-transparent hover:border-border/50">
                  <div>
                    <p className="font-bold text-sm text-foreground">{order.customer}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{order.items}</p>
                    <p className="text-xs font-medium text-primary mt-1">{order.total}</p>
                  </div>
                  <div className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase", getStatusColor(order.status))}>
                    {order.status}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
