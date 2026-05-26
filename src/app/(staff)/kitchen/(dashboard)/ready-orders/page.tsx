"use client";

import * as React from "react";
import { useStaffStore } from "@/store/useStaffStore";
import { useAdminStore } from "@/store/useAdminStore";
import { Card, CardContent } from "@/components/ui/Card";
import { CheckCircle, BellRing, ChevronRight } from "lucide-react";

export default function KitchenReadyOrders() {
  const { orders } = useStaffStore();
  const { menus } = useAdminStore();

  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto bg-background min-h-screen">
      <div>
        <h2 className="text-3xl font-serif font-bold text-green-600 flex items-center gap-2">
          <CheckCircle className="w-8 h-8" /> Ready Orders
        </h2>
        <p className="text-muted-foreground">Waiting for cashier/waiter to serve or customer to pickup.</p>
      </div>

      <div className="space-y-4">
        {readyOrders.map(order => (
          <Card key={order.id} className="bg-card border-l-4 border-l-green-500 border-t-border/50 border-r-border/50 border-b-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-0 flex flex-col md:flex-row">
              <div className="p-6 md:w-1/3 bg-green-500/5 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/50">
                <h3 className="text-2xl font-bold text-green-600 mb-1">{order.id}</h3>
                <p className="text-muted-foreground">Customer: <span className="text-foreground font-medium">{order.customerName}</span></p>
                <div className="mt-4 flex items-center gap-2 text-sm font-bold bg-muted/50 w-fit px-3 py-1 rounded text-muted-foreground">
                  {order.type.toUpperCase()} {order.tableNumber ? `• ${order.tableNumber}` : ''}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-center space-y-2">
                {order.items.map((item, i) => {
                  const menuItem = menus.find(m => m.name.toLowerCase() === item.name.toLowerCase());
                  return (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="font-bold">{item.qty}x</span>
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      {menuItem && (
                        <div className={`text-xs mt-1 font-bold px-2 py-0.5 rounded w-fit ${menuItem.stock === 0 ? 'bg-red-500/10 text-red-600' : menuItem.stock < 10 ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'}`}>
                          {menuItem.stock} in stock
                        </div>
                      )}
                    </div>
                  </div>
                )})}
              </div>
              
              <div className="p-6 bg-muted/30 flex items-center justify-center md:w-48 shrink-0">
                <div className="text-center space-y-2">
                  <BellRing className="w-8 h-8 text-green-500 mx-auto animate-bounce" />
                  <p className="text-xs text-green-600 font-bold">NOTIFIED CASHIER</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {readyOrders.length === 0 && (
          <div className="text-center py-24 bg-card rounded-2xl border border-border/50 text-muted-foreground shadow-sm">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold">No ready orders</h3>
            <p>All prepared orders have been served.</p>
          </div>
        )}
      </div>
    </div>
  );
}
