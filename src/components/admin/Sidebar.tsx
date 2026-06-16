"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ReceiptText,
  UtensilsCrossed,
  Tags,
  PackageSearch,
  Wallet,
  Users,
  UserSquare2,
  Bike,
  Armchair,
  Gift,
  TicketPercent,
  BarChart3,
  ChevronLeft,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

// `hidden: true` entries are intentionally not rendered in the sidebar (modules disabled from the
// Admin UI but kept here, including routes/icons, so they can be re-enabled later by flipping the flag).
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: ReceiptText, label: "Orders", href: "/admin/orders", hidden: true },
  { icon: UtensilsCrossed, label: "Menu Management", href: "/admin/menu" },
  { icon: Tags, label: "Categories", href: "/admin/categories", hidden: true },
  { icon: PackageSearch, label: "Stock", href: "/admin/stock" },
  { icon: Wallet, label: "History", href: "/admin/payments", hidden: true },
  { icon: Users, label: "Customers", href: "/admin/customers" },
  { icon: UserSquare2, label: "Staff", href: "/admin/staff", hidden: true },
  { icon: Armchair, label: "Cafe Tables", href: "/admin/tables" },
  { icon: CalendarDays, label: "Reservations", href: "/admin/reservations" },
  { icon: Gift, label: "Rewards", href: "/admin/rewards" },
  { icon: TicketPercent, label: "Vouchers", href: "/admin/vouchers" },
];

export function Sidebar({
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
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center p-1 overflow-hidden">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <span className="font-serif font-bold text-xl whitespace-nowrap">
              Kedai Loman
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 mx-auto bg-white/10 rounded-xl flex items-center justify-center p-1 overflow-hidden">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
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
        {menuItems
          .filter((item) => !item.hidden)
          .map((item) => {
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

                  {/* Active Indicator Line */}
                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="sidebar-active"
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
