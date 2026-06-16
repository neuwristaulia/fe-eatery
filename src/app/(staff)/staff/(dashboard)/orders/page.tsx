"use client";

import * as React from "react";
import { useStaffStore } from "@/store/useStaffStore";
import { Button } from "@/components/ui/Button";
import { Check, X, ChefHat, CheckCircle, Clock } from "lucide-react";

export default function StaffOrders() {
  const { orders, confirmOrder, startPreparing, completeOrder, cancelOrder } =
    useStaffStore();
  const [filter, setFilter] = React.useState("all");

  const activeOrders = orders.filter(
    (o) => o.status !== "completed" && o.status !== "cancelled",
  );

  const filteredOrders = activeOrders.filter((o) => {
    if (filter === "all") return true;
    return o.type === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 bg-gray-500/20 text-gray-600 rounded text-xs font-bold">
            AWAITING PAYMENT
          </span>
        );
      case "order_placed":
        return (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded text-xs font-bold">
            NEW
          </span>
        );
      case "confirmed":
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-600 rounded text-xs font-bold">
            CONFIRMED
          </span>
        );
      case "preparing":
        return (
          <span className="px-2 py-1 bg-orange-500/20 text-orange-600 rounded text-xs font-bold">
            PREPARING
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold">Orders</h2>
          <p className="text-muted-foreground">
            Manage incoming orders through the kitchen workflow.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "primary" : "outline"}
            onClick={() => setFilter("all")}
            className="rounded-full"
          >
            All
          </Button>
          <Button
            variant={filter === "dine-in" ? "primary" : "outline"}
            onClick={() => setFilter("dine-in")}
            className="rounded-full"
          >
            Dine In
          </Button>
          <Button
            variant={filter === "takeaway" ? "primary" : "outline"}
            onClick={() => setFilter("takeaway")}
            className="rounded-full"
          >
            Takeaway
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer & Type</th>
                <th className="px-6 py-4 font-medium min-w-[200px]">Items</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold">{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.customerName}</div>
                      {order.customerPhone && (
                        <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {order.type}{" "}
                        {order.tableNumber ? `(${order.tableNumber})` : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="text-xs">
                            <span className="font-medium">{item.qty}x</span>{" "}
                            {item.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-primary whitespace-nowrap">
                      Rp {order.total.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      {order.status === "pending" && (
                        <Button size="sm" disabled variant="secondary">
                          <Clock className="w-4 h-4 sm:mr-2" />{" "}
                          <span className="hidden sm:inline">Waiting for payment</span>
                        </Button>
                      )}

                      {order.status === "order_placed" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => confirmOrder(order.id)}
                          >
                            <Check className="w-4 h-4 sm:mr-2" />{" "}
                            <span className="hidden sm:inline">Confirm Order</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:bg-red-500/10 hover:text-red-600 px-2"
                            onClick={() => cancelOrder(order.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      {order.status === "confirmed" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={() => startPreparing(order.id)}
                          >
                            <ChefHat className="w-4 h-4 sm:mr-2" />{" "}
                            <span className="hidden sm:inline">Start Preparing</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:bg-red-500/10 hover:text-red-600 px-2"
                            onClick={() => cancelOrder(order.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      {order.status === "preparing" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white"
                            onClick={() => completeOrder(order.id)}
                          >
                            <CheckCircle className="w-4 h-4 sm:mr-2" />{" "}
                            <span className="hidden sm:inline">Complete Order</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:bg-red-500/10 hover:text-red-600 px-2"
                            onClick={() => cancelOrder(order.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No active orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
