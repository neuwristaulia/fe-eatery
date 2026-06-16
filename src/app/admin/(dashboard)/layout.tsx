"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminStore } from "@/store/useAdminStore";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopNav } from "@/components/admin/TopNav";

// Modules hidden from the Admin UI (see Sidebar.tsx `hidden` entries). Their routes, pages, and
// APIs remain intact for a future re-enable, but direct navigation is blocked here.
const DISABLED_ADMIN_ROUTES = ["/admin/orders", "/admin/categories", "/admin/payments", "/admin/staff"];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated, fetchAllData } = useAdminStore();
  const [collapsed, setCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    if (!isAdminAuthenticated) {
      window.location.href = "/admin/login";
      return;
    }
    fetchAllData();
  }, [isAdminAuthenticated, fetchAllData]);

  useEffect(() => {
    if (DISABLED_ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
      router.replace("/admin/dashboard");
    }
  }, [pathname, router]);

  const isDisabledRoute = DISABLED_ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (!isMounted || !isAdminAuthenticated || isDisabledRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 flex flex-col min-w-0">
        <TopNav onMenuClick={() => setCollapsed(!collapsed)} />
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
