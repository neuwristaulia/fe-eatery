"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useCustomerOrders } from "@/hooks/useCustomerOrders";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent } from "@/components/ui/Card";
import { ReceiptText, ChevronRight, Clock, ShoppingBag, Printer } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { mapOrderToStaff } from "@/lib/api/mappers";
import type { StaffOrder } from "@/store/useStaffStore";
import { PrintableReceipt } from "@/components/staff/cashier/PrintableReceipt";
import { ordersApi } from "@/lib/api";
import { toast } from "sonner";

export default function OrdersPage() {
  const { status } = useSession();
  const isGuest = status === "unauthenticated";
  const isBackendCustomer = useAuthStore(
    (s) => Boolean(s.accessToken && s.portal === "customer"),
  );
  const authUser = useAuthStore((s) => s.user);
  const { orders: recentOrders, rawOrders, loading, reload } = useCustomerOrders();
  const [printingOrder, setPrintingOrder] = React.useState<StaffOrder | null>(null);
  const [pendingGuestIds, setPendingGuestIds] = React.useState<number[]>([]);
  const [claiming, setClaiming] = React.useState(false);

  React.useEffect(() => {
    if (!isBackendCustomer) return;
    try {
      const stored = JSON.parse(localStorage.getItem("guest_order_ids") ?? "[]") as number[];
      if (stored.length > 0) setPendingGuestIds(stored);
    } catch {
      // ignore
    }
  }, [isBackendCustomer]);

  const handleClaimGuestOrders = async () => {
    setClaiming(true);
    try {
      await ordersApi.claimGuestOrders(pendingGuestIds);
      localStorage.removeItem("guest_order_ids");
      setPendingGuestIds([]);
      await reload();
      toast.success(`${pendingGuestIds.length} guest order(s) added to your account!`);
    } catch {
      toast.error("Failed to claim guest orders. They may have already been claimed.");
    } finally {
      setClaiming(false);
    }
  };

  const handlePrint = (orderId: string) => {
    const rawOrder = rawOrders.find((o) => String(o.id) === orderId);
    if (!rawOrder) return;
    setPrintingOrder(mapOrderToStaff(rawOrder));
    setTimeout(() => {
      window.print();
    }, 100);
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500";
      case "preparing": return "bg-primary/10 text-primary";
      case "confirmed": return "bg-blue-500/10 text-blue-500";
      case "order_placed": return "bg-blue-500/10 text-blue-500";
      case "pending": return "bg-amber-500/10 text-amber-500";
      case "cancelled": return "bg-red-500/10 text-red-500";
      case "refunded": return "bg-red-500/10 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "pending") return "Awaiting Payment";
    return status.replace("_", " ");
  };

  if (!isBackendCustomer && isGuest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <h2 className="text-2xl font-bold mb-3">Login Diperlukan</h2>
        <p className="text-muted-foreground mb-6">
          Masuk dengan email customer untuk melihat riwayat pesanan dari backend.
        </p>
        <Link href="/login">
          <Button size="lg" className="rounded-2xl">Login</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (recentOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-48 h-48 bg-primary/5 rounded-full flex items-center justify-center mb-8 relative"
        >
          <div className="absolute inset-0 border-4 border-primary/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <ReceiptText className="w-20 h-20 text-primary/40" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-3 tracking-tight">No Orders Yet</h2>
        <p className="text-muted-foreground mb-10 max-w-[250px] mx-auto text-sm leading-relaxed">
          You haven't placed any orders. Taste the best Kopitiam right now!
        </p>
        <Link href="/menu" className="w-full">
          <Button size="lg" className="w-full rounded-2xl h-14 text-lg shadow-lg shadow-primary/20">
            Start Ordering
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 p-4 md:p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

      {isBackendCustomer && pendingGuestIds.length > 0 && (
        <Card className="mb-6 bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-amber-700 dark:text-amber-400">Guest Orders Found</h3>
              <p className="text-sm text-muted-foreground">
                You placed {pendingGuestIds.length} order{pendingGuestIds.length > 1 ? "s" : ""} as a guest. Add {pendingGuestIds.length > 1 ? "them" : "it"} to your account?
              </p>
            </div>
            <Button
              size="sm"
              className="whitespace-nowrap rounded-full"
              disabled={claiming}
              isLoading={claiming}
              onClick={handleClaimGuestOrders}
            >
              Claim Orders
            </Button>
          </CardContent>
        </Card>
      )}

      {!isBackendCustomer && (
        <Card className="mb-6 bg-primary/10 border-primary/20">
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-primary">Guest Mode</h3>
              <p className="text-sm text-muted-foreground">Sign in to view your full order history across all devices.</p>
            </div>
            <Link href="/login">
              <Button variant="outline" size="sm" className="whitespace-nowrap rounded-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {recentOrders.map((order) => (
          <motion.div variants={itemVariants} key={order.id}>
            <Link href={`/orders/${order.id}`}>
              <Card className="hover:border-primary/50 transition-colors border-border/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-muted p-2 rounded-full">
                        <ReceiptText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold">{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase", getStatusColor(order.status))}>
                      {getStatusLabel(order.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                    <p className="text-sm text-muted-foreground line-clamp-1 flex-1 pr-4">
                      {order.items}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm">Rp {order.total.toLocaleString('id-ID')}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  {order.status === "completed" && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl gap-2"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePrint(order.id);
                        }}
                      >
                        <Printer className="w-4 h-4" />
                        Print Bill
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Hidden render for printing */}
      <div className="hidden print:block">
        {printingOrder && (
          <PrintableReceipt
            order={printingOrder}
            cashierName={authUser?.name || "Customer"}
          />
        )}
      </div>
    </div>
  );
}
