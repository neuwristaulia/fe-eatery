"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/useAdminStore";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopNav } from "@/components/admin/TopNav";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated } = useAdminStore();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isAdminAuthenticated) {
      window.location.href = "/admin/login";
    }
  }, [isAdminAuthenticated]);

  if (!isMounted || !isAdminAuthenticated) {
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
