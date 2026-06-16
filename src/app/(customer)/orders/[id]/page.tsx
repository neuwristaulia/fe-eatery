"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { ordersApi } from "@/lib/api";
import { mapOrderToCustomer, mapOrderToStaff } from "@/lib/api/mappers";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowLeft, CheckCircle2, Clock, ChefHat, PackageCheck, Printer, XCircle, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseNumericId } from "@/lib/api/mappers";
import type { ApiOrder } from "@/lib/api/types";
import { PrintableReceipt } from "@/components/staff/cashier/PrintableReceipt";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const hasAuth = useAuthStore((s) => Boolean(s.accessToken && s.portal === "customer"));
  const authUser = useAuthStore((s) => s.user);

  const [order, setOrder] = React.useState<ReturnType<typeof mapOrderToCustomer> | null>(null);
  const [rawOrder, setRawOrder] = React.useState<ApiOrder | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!hasAuth) {
      setLoading(false);
      return;
    }
    ordersApi
      .getOrder(parseNumericId(id))
      .then((o) => {
        setOrder(mapOrderToCustomer(o));
        setRawOrder(o);
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id, hasAuth]);

  const handlePrint = () => {
    window.print();
  };

  const steps = [
    { status: "order_placed", label: "Order Placed", icon: Clock },
    { status: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { status: "preparing", label: "Preparing", icon: ChefHat },
    { status: "completed", label: "Completed", icon: PackageCheck },
  ];

  if (!hasAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">Login untuk melihat detail pesanan.</p>
        <Button onClick={() => router.push("/login")}>Login</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">Pesanan tidak ditemukan.</p>
        <Button onClick={() => router.back()}>Kembali</Button>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.status === order.status);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-30 bg-background px-4 pt-8 pb-4 flex items-center space-x-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-center">Order #{order.id}</h1>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-lg">
        {order.status === "pending" && (
          <Card className="rounded-3xl mb-8 border-amber-500/40 bg-amber-500/5">
            <CardContent className="p-6 flex items-center gap-4">
              <Clock className="w-8 h-8 text-amber-500 shrink-0" />
              <div>
                <p className="font-bold">Awaiting Payment</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Pesanan Anda akan diproses setelah pembayaran diterima.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {order.status === "cancelled" && (
          <Card className="rounded-3xl mb-8 border-red-500/40 bg-red-500/5">
            <CardContent className="p-6 flex items-center gap-4">
              <XCircle className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <p className="font-bold">Order Cancelled</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Pesanan ini telah dibatalkan dan pembayaran telah dibatalkan/dikembalikan.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {order.status === "refunded" && (
          <Card className="rounded-3xl mb-8 border-red-500/40 bg-red-500/5">
            <CardContent className="p-6 flex items-center gap-4">
              <Undo2 className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <p className="font-bold">Order Refunded</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Pesanan ini telah diselesaikan namun pembayaran telah dikembalikan (refund).
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-3xl border-border/50 mb-8">
          <CardContent className="p-6">
            <h2 className="font-bold text-lg mb-6">Order Status</h2>
            <div className="relative">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.status} className="flex gap-4 mb-8 last:mb-0 relative">
                    {index !== steps.length - 1 && (
                      <div
                        className={cn(
                          "absolute left-[19px] top-10 w-0.5 h-[calc(100%-16px)]",
                          isActive ? "bg-primary" : "bg-border",
                        )}
                      />
                    )}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-colors",
                        isActive
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-muted border-border text-muted-foreground",
                        isCurrent && "ring-4 ring-primary/20",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="pt-2">
                      <p
                        className={cn(
                          "font-bold",
                          isActive ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-primary font-medium mt-1">
                          In progress...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-border/50">
              <span className="text-muted-foreground">Items</span>
              <span className="font-medium text-right max-w-[60%]">{order.items}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-xl text-primary">
                Rp {order.total.toLocaleString("id-ID")}
              </span>
            </div>
          </CardContent>
        </Card>

        {order.status === "completed" && rawOrder && (
          <Button
            variant="outline"
            className="w-full rounded-2xl mt-4 gap-2"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4" />
            Print Bill
          </Button>
        )}
      </div>

      {/* Hidden render for printing */}
      {rawOrder && (
        <div className="hidden print:block">
          <PrintableReceipt
            order={mapOrderToStaff(rawOrder)}
            cashierName={authUser?.name || "Customer"}
          />
        </div>
      )}
    </div>
  );
}
