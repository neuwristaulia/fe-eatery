"use client";

import * as React from "react";
import { CashierSidebar } from "@/components/staff/cashier/CashierSidebar";
import { useStaffStore } from "@/store/useStaffStore";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LogOut, Bell } from "lucide-react";

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const router = useRouter();
  const { staffAuthenticated, staffData, logout, login } = useStaffStore();

  const pathname = usePathname();

  React.useEffect(() => {
    if (!staffAuthenticated) {
      router.push("/cashier/login");
    }
  }, [staffAuthenticated, router]);



  if (!staffAuthenticated) return <div className="min-h-screen flex items-center justify-center">Redirecting to login...</div>;

  return (
    <div className="flex min-h-screen bg-background relative">
      <CashierSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-serif font-bold">Welcome, {staffData?.name}</h1>
            <p className="text-sm text-muted-foreground">Cashier Shift: Morning</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"></span>
            </Button>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
              {staffData?.name?.charAt(0) || "C"}
            </div>
            <Button 
              variant="outline" 
              className="rounded-full gap-2 border-primary/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
              onClick={() => {
                logout();
                router.push("/cashier/login");
              }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Exit POS</span>
            </Button>
          </div>
        </header>
        
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Floating Action Button for Tablet Mode */}
      {!pathname?.includes('/order/new') && (
        <Button
          onClick={() => router.push('/cashier/order/new')}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-white flex items-center justify-center z-50 md:hidden"
        >
          <span className="text-3xl font-light mb-1">+</span>
        </Button>
      )}
    </div>
  );
}
