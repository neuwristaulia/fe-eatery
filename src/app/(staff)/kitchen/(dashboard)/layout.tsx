"use client";

import * as React from "react";
import { KitchenSidebar } from "@/components/staff/kitchen/KitchenSidebar";
import { useStaffStore } from "@/store/useStaffStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LogOut, Bell } from "lucide-react";

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false); // Default expanded for kitchen
  const router = useRouter();
  const { staffAuthenticated, staffData, logout, login } = useStaffStore();

  React.useEffect(() => {
    if (!staffAuthenticated) {
      router.push("/kitchen/login");
    }
  }, [staffAuthenticated, router]);

  if (!staffAuthenticated) return <div className="min-h-screen flex items-center justify-center">Redirecting to login...</div>;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <KitchenSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-serif font-bold">Kitchen Display System (KDS)</h1>
            <p className="text-sm text-muted-foreground">Station: Main Kitchen | {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
              {staffData?.name?.charAt(0) || "K"}
            </div>
            <Button 
              className="rounded-full gap-2 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                logout();
                router.push("/kitchen/login");
              }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Exit KDS</span>
            </Button>
          </div>
        </header>
        
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
