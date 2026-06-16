"use client";

import * as React from "react";
import { useStaffStore, StaffOrder } from "@/store/useStaffStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Wallet,
  CheckCircle,
  Banknote,
  RefreshCw,
  Undo2,
  History,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

// Midtrans transaction_status values that indicate the transaction has reached (or moved past)
// settlement, where Midtrans only allows Refund. Any other status (capture, authorize, pending,
// or unknown) is pre-settlement, where Midtrans only allows Cancel. This is used purely to label
// the button correctly - the backend independently verifies the live status and falls back to
// the other action if this guess turns out to be wrong.
const MIDTRANS_REFUNDABLE_STATUSES = ["settlement", "refund", "partial_refund"];

function isMidtransRefundable(order: StaffOrder): boolean {
  return (
    !!order.transactionStatus &&
    MIDTRANS_REFUNDABLE_STATUSES.includes(order.transactionStatus)
  );
}

export default function StaffPayments() {
  const {
    orders,
    markCashPaid,
    refundPayment,
    syncMidtransStatus,
    cancelOrRefundPayment,
  } = useStaffStore();
  const [busyId, setBusyId] = React.useState<number | null>(null);

  const pendingCashOrders = orders.filter(
    (o) => o.paymentMethod === "cash" && o.paymentStatus === "unpaid",
  );
  const pendingMidtransOrders = orders.filter(
    (o) => o.paymentMethod === "midtrans" && o.paymentStatus === "unpaid",
  );
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const refundedOrders = orders.filter((o) => o.paymentStatus === "refunded");

  const handleMarkCashPaid = async (order: StaffOrder) => {
    if (!order.paymentId) return;
    setBusyId(order.paymentId);
    const ok = await markCashPaid(order.paymentId);
    setBusyId(null);
    if (ok) {
      toast.success(`Payment for ${order.id} marked as paid`);
    } else {
      toast.error("Failed to mark payment as paid");
    }
  };

  const handleRefund = async (order: StaffOrder) => {
    if (!order.paymentId) return;
    const reason = window.prompt("Enter refund reason:");
    if (!reason) return;
    setBusyId(order.paymentId);
    const ok = await refundPayment(order.paymentId, reason);
    setBusyId(null);
    if (ok) {
      toast.success(`Payment for ${order.id} refunded`);
    } else {
      toast.error("Failed to refund payment");
    }
  };

  const handleCancelOrRefund = async (order: StaffOrder) => {
    if (!order.paymentId) return;
    const refundable = isMidtransRefundable(order);
    const reason = window.prompt(
      refundable ? "Enter refund reason:" : "Enter cancellation reason:",
    );
    if (!reason) return;
    setBusyId(order.paymentId);
    const result = await cancelOrRefundPayment(order.paymentId, reason);
    setBusyId(null);
    if (result.success) {
      toast.success(
        result.action === "refunded"
          ? `Payment for ${order.id} refunded`
          : `Payment for ${order.id} cancelled`,
      );
    } else {
      toast.error(result.message || "Failed to cancel/refund payment");
    }
  };

  const handleSyncMidtrans = async (order: StaffOrder) => {
    if (!order.paymentId) return;
    setBusyId(order.paymentId);
    const ok = await syncMidtransStatus(order.paymentId);
    setBusyId(null);
    if (ok) {
      toast.success(`Status synced for ${order.id}`);
    } else {
      toast.error("Failed to sync Midtrans status");
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-serif font-bold">Payments</h2>
        <p className="text-muted-foreground">
          Confirm cash payments, refunds, and sync Midtrans transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Cash Payments */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <Wallet className="w-5 h-5 text-yellow-500" /> Pending Cash Payments
          </h3>
          {pendingCashOrders.map((order) => (
            <Card key={order.id} className="bg-card border-none shadow-sm h-fit block">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{order.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName}
                    </p>
                  </div>
                  <span className="font-bold text-xl text-primary">
                    Rp {order.total.toLocaleString("id-ID")}
                  </span>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                  disabled={busyId === order.paymentId}
                  onClick={() => handleMarkCashPaid(order)}
                >
                  <Banknote className="w-4 h-4" /> Mark As Paid
                </Button>
              </CardContent>
            </Card>
          ))}
          {pendingCashOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">
              No pending cash payments.
            </div>
          )}

          {/* Pending Midtrans Payments — shown when webhook hasn't fired yet */}
          {pendingMidtransOrders.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border/50">
              <h4 className="font-semibold text-base flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" /> Midtrans — Awaiting Confirmation
              </h4>
              {pendingMidtransOrders.map((order) => (
                <Card key={order.id} className="bg-blue-500/5 border border-blue-500/20 shadow-sm h-fit block">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold">{order.id}</h3>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      </div>
                      <span className="font-bold text-primary">
                        Rp {order.total.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Payment may be completed in Midtrans but not yet confirmed here. Click to sync the latest status.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      disabled={busyId === order.paymentId}
                      onClick={() => handleSyncMidtrans(order)}
                    >
                      <RefreshCw className="w-4 h-4" /> Check Midtrans Status
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Paid Payments */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" /> Paid Payments
          </h3>
          {paidOrders.map((order) => (
            <Card
              key={order.id}
              className="bg-green-500/5 border border-green-500/20 shadow-sm h-fit block"
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{order.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg text-primary block">
                      Rp {order.total.toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded">
                      PAID VIA {(order.paymentMethod || "-").toUpperCase()}
                    </span>
                  </div>
                </div>

                {order.paymentMethod === "midtrans" && (
                  <div className="text-xs text-muted-foreground mb-3 space-y-0.5">
                    {order.transactionStatus && (
                      <div>
                        Midtrans status:{" "}
                        <span className="font-medium uppercase">
                          {order.transactionStatus}
                        </span>
                      </div>
                    )}
                    {order.midtransOrderId && (
                      <div>Order ref: {order.midtransOrderId}</div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 mt-2">
                  {order.paymentMethod === "midtrans" && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      disabled={busyId === order.paymentId}
                      onClick={() => handleSyncMidtrans(order)}
                    >
                      <RefreshCw className="w-4 h-4" /> Sync Midtrans Status
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="gap-2 text-red-500 hover:bg-red-500/10 hover:text-red-600 border-red-500/20"
                    disabled={busyId === order.paymentId}
                    onClick={() =>
                      order.paymentMethod === "midtrans"
                        ? handleCancelOrRefund(order)
                        : handleRefund(order)
                    }
                  >
                    <Undo2 className="w-4 h-4" />{" "}
                    {order.paymentMethod === "midtrans"
                      ? isMidtransRefundable(order)
                        ? "Refund Payment"
                        : "Cancel Payment"
                      : "Cash Refund"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {paidOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">
              No paid payments.
            </div>
          )}
        </div>

        {/* Refund History */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" /> Refund History
          </h3>
          {refundedOrders.map((order) => (
            <Card key={order.id} className="bg-card border-none shadow-sm h-fit block">
              <CardContent className="p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{order.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName}
                    </p>
                  </div>
                  <span className="font-bold text-lg text-muted-foreground">
                    Rp {(order.refundedAmount ?? order.total).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    Method:{" "}
                    <span className="font-medium uppercase">
                      {order.refundMethod || "-"}
                    </span>
                  </div>
                  <div>
                    Reason:{" "}
                    <span className="font-medium">{order.refundReason || "-"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {refundedOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">
              No refunds yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
