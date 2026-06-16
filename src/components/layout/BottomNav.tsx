"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Coffee,
  ShoppingBag,
  ReceiptText,
  User,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/store/useAuthStore";

export function BottomNav() {
  const pathname = usePathname();
  const { status } = useSession();
  const apiUser = useAuthStore((state) => state.user);
  const apiPortal = useAuthStore((state) => state.portal);
  const apiAccessToken = useAuthStore((state) => state.accessToken);
  const isLoggedIn =
    status === "authenticated" ||
    Boolean(apiUser && apiPortal === "customer" && apiAccessToken);
  const isGuest = !isLoggedIn;
  const cart = useStore((state) => state.cart);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Menu", href: "/menu", icon: Coffee },
    { name: "Cart", href: "/cart", icon: ShoppingBag },
    { name: "Orders", href: "/orders", icon: ReceiptText },
    { name: "Reservasi", href: "/reservations", icon: CalendarDays },
  ];

  if (!isGuest) {
    navItems.push({ name: "Profile", href: "/profile", icon: User });
  } else {
    navItems.push({ name: "Sign In", href: "/login", icon: User });
  }

  // Do not show bottom nav on login page or checkout flow
  if (pathname === "/login" || pathname.startsWith("/checkout")) return null;

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 pointer-events-none">
      <nav className="flex justify-around items-center h-16 px-2 bg-card/90 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/5 rounded-3xl pointer-events-auto max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href) && item.href !== "/dashboard");
          const Icon = item.icon;
          const isCart = item.name === "Cart";

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full space-y-1 text-[10px] transition-colors rounded-2xl",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative">
                <Icon
                  className={cn(
                    "w-6 h-6 transition-transform",
                    isActive && "scale-110",
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isCart && cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
