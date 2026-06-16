"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  CalendarCheck,
  Armchair,
  Boxes,
  BarChart3,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/staff/dashboard" },
  { icon: Receipt, label: "Orders", href: "/staff/orders" },
  { icon: Wallet, label: "Payments", href: "/staff/payments" },
  { icon: CalendarCheck, label: "Reservations", href: "/staff/reservations" },
  { icon: Armchair, label: "Tables", href: "/staff/tables" },
  { icon: Boxes, label: "Inventory", href: "/staff/stock" },
  { icon: BarChart3, label: "Reports", href: "/staff/reports" },
];

export function StaffSidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="bg-secondary text-secondary-foreground min-h-screen sticky top-0 flex flex-col border-r border-secondary/20 shadow-xl overflow-hidden z-20 shrink-0"
    >
      <div className="h-20 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center p-1 overflow-hidden">
              <span className="font-bold text-primary text-xl">S</span>
            </div>
            <span className="font-serif font-bold text-xl whitespace-nowrap">
              Staff Portal
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 mx-auto bg-primary/20 rounded-xl flex items-center justify-center p-1 overflow-hidden">
            <span className="font-bold text-primary text-xl">S</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/10 text-white/70 transition-colors hidden md:block",
            collapsed && "mx-auto",
          )}
        >
          <ChevronLeft
            className={cn(
              "w-5 h-5 transition-transform",
              collapsed && "rotate-180",
            )}
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar py-6 flex flex-col gap-1 px-3">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}

                {isActive && !collapsed && (
                  <motion.div
                    layoutId="staff-sidebar-active"
                    className="absolute left-0 w-1 h-8 bg-white rounded-r-full"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </motion.aside>
  );
}
