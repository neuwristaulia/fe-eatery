"use client";

import * as React from "react";
import { useStaffStore } from "@/store/useStaffStore";
import { useMenuCatalog } from "@/hooks/useMenuCatalog";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Flame, CheckCircle, Clock, AlertTriangle, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function KitchenQueue() {
  const { orders, startPreparing, markReady } = useStaffStore();
  const { menuItems } = useMenuCatalog();
  const menus = menuItems.map((m) => ({
    id: m.id,
    name: m.name,
    stock: 0,
  }));

  const queueOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'preparing')
    .sort((a, b) => {
      // Sort preparing first, then confirmed
      if (a.status === 'preparing' && b.status === 'confirmed') return -1;
      if (a.status === 'confirmed' && b.status === 'preparing') return 1;
      return 0;
    });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-background">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Flame className="text-orange-500" /> Active Tickets ({queueOrders.length})
        </h2>
        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> New Order</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div> Cooking</div>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm text-muted-foreground uppercase bg-secondary/30 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-bold">Ticket & Time</th>
                <th className="px-6 py-4 font-bold">Customer & Type</th>
                <th className="px-6 py-4 font-bold min-w-[300px]">Order Items</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {queueOrders.map(order => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`border-b border-border/50 transition-colors ${order.status === 'preparing' ? 'bg-orange-500/5' : 'bg-blue-500/5'}`}
                  >
                    <td className="px-6 py-4 align-top">
                      <div className={`font-bold text-lg ${order.status === 'preparing' ? 'text-orange-600' : 'text-blue-600'}`}>{order.id}</div>
                      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground mt-1">
                        <Clock className="w-4 h-4" /> {order.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-lg">{order.customerName}</div>
                      <div className="text-sm font-bold text-muted-foreground mt-1">
                        {order.type.toUpperCase()} {order.tableNumber ? `(T-${order.tableNumber})` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-3">
                        {order.items.map((item, i) => {
                          const menuItem = menus.find(m => m.name.toLowerCase() === item.name.toLowerCase());
                          return (
                          <div key={i} className="flex gap-3 text-lg">
                            <div className="font-bold text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded h-fit">
                              {item.qty}x
                            </div>
                            <div>
                              <p className="font-bold">{item.name}</p>
                              {item.notes && (
                                <p className="text-sm text-yellow-600 mt-1 flex items-start gap-1">
                                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {item.notes}
                                </p>
                              )}
                              {menuItem && (
                                <div className={`text-xs mt-1 font-bold px-2 py-0.5 rounded w-fit ${menuItem.stock === 0 ? 'bg-red-500/10 text-red-600' : menuItem.stock < 10 ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'}`}>
                                  {menuItem.stock} in stock
                                </div>
                              )}
                            </div>
                          </div>
                        )})}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      {order.status === 'confirmed' ? (
                        <Button 
                          size="lg"
                          className="font-bold bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto" 
                          onClick={() => startPreparing(order.id)}
                        >
                          <Flame className="w-5 h-5 mr-2" /> Start Cooking
                        </Button>
                      ) : (
                        <Button 
                          size="lg"
                          className="font-bold bg-red-600 hover:bg-red-700 text-white animate-pulse hover:animate-none w-full sm:w-auto" 
                          onClick={() => markReady(order.id)}
                        >
                          <CheckCircle className="w-5 h-5 mr-2" /> Mark as Ready
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
      
      {queueOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <ChefHat className="w-24 h-24 mb-4 opacity-20" />
          <h2 className="text-2xl font-bold">Kitchen is clear!</h2>
          <p>Waiting for new orders to arrive...</p>
        </div>
      )}
    </div>
  );
}
