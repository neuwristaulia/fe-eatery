"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Search,
  AlertTriangle,
  Package,
  Loader2,
  Plus,
  Minus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { stocksApi } from "@/lib/api";
import type { ApiStock } from "@/lib/api/types";

export default function StaffStockPage() {
  const [stocks, setStocks] = useState<ApiStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [adjusting, setAdjusting] = useState<ApiStock | null>(null);
  const [adjustType, setAdjustType] = useState<"IN" | "OUT">("IN");
  const [adjustAmount, setAdjustAmount] = useState(1);
  const [saving, setSaving] = useState(false);

  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await stocksApi.listStocks();
      setStocks(data);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const isLow = (s: ApiStock) => s.quantity <= s.min_stock;

  const filteredStocks = stocks.filter((s) => {
    const name = s.menu?.name ?? "";
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" ||
      (statusFilter === "Low Stock" && isLow(s)) ||
      (statusFilter === "Normal" && !isLow(s));
    return matchesSearch && matchesStatus;
  });

  const openAdjustModal = (stock: ApiStock) => {
    setAdjusting(stock);
    setAdjustType("IN");
    setAdjustAmount(1);
  };

  const saveAdjustment = async () => {
    if (!adjusting || adjustAmount <= 0) return;
    try {
      setSaving(true);
      const updated = await stocksApi.adjustStock(adjusting.id, {
        type: adjustType,
        quantity: adjustAmount,
      });
      setStocks((prev) =>
        prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)),
      );
      toast.success("Stock updated");
      setAdjusting(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to adjust stock",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Inventory
        </h1>
        <p className="text-muted-foreground">
          Monitor ingredient and packaging stock levels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{stocks.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-red-500">
                {stocks.filter(isLow).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md bg-card overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 text-sm rounded-lg border border-border/50 bg-background outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option>All Status</option>
              <option>Low Stock</option>
              <option>Normal</option>
            </select>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="animate-spin w-8 h-8" />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Item</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Current Stock</th>
                  <th className="px-6 py-4 font-medium">Min Stock</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No items match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 font-bold">
                        {s.menu?.name ?? `Item #${s.menu_id}`}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {s.menu?.category?.name ?? "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "font-bold text-lg",
                            isLow(s) ? "text-red-500" : "text-foreground",
                          )}
                        >
                          {s.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {s.min_stock}
                      </td>
                      <td className="px-6 py-4">
                        {isLow(s) ? (
                          <span className="px-2 py-1 rounded-md bg-red-500/10 text-red-500 text-xs font-bold flex items-center w-max gap-1">
                            <AlertTriangle className="w-3 h-3" /> Low
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-600 text-xs font-bold">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openAdjustModal(s)}
                          className="text-primary hover:underline font-medium text-xs"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {adjusting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-border/50"
            >
              <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/30">
                <h2 className="text-xl font-serif font-bold">Adjust Stock</h2>
                <button
                  onClick={() => setAdjusting(null)}
                  className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground">Item Name</p>
                  <p className="text-lg font-bold">
                    {adjusting.menu?.name ?? `Item #${adjusting.menu_id}`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current stock: {adjusting.quantity}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Adjustment Type
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAdjustType("IN")}
                      className={cn(
                        "px-4 py-2 rounded-xl border font-medium text-sm transition-colors",
                        adjustType === "IN"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border/50 hover:border-primary",
                      )}
                    >
                      Stock In
                    </button>
                    <button
                      onClick={() => setAdjustType("OUT")}
                      className={cn(
                        "px-4 py-2 rounded-xl border font-medium text-sm transition-colors",
                        adjustType === "OUT"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border/50 hover:border-primary",
                      )}
                    >
                      Stock Out
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Quantity
                  </p>
                  <div className="flex items-center gap-4 bg-background p-2 rounded-xl border border-border/50">
                    <button
                      onClick={() =>
                        setAdjustAmount(Math.max(1, adjustAmount - 1))
                      }
                      className="p-3 bg-muted rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <input
                      type="number"
                      value={adjustAmount}
                      onChange={(e) =>
                        setAdjustAmount(Math.max(1, Number(e.target.value) || 1))
                      }
                      className="flex-1 w-full text-center text-2xl font-bold bg-transparent outline-none appearance-none"
                    />
                    <button
                      onClick={() => setAdjustAmount(adjustAmount + 1)}
                      className="p-3 bg-muted rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-muted/20">
                <Button
                  variant="outline"
                  onClick={() => setAdjusting(null)}
                  className="rounded-full px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveAdjustment}
                  disabled={saving}
                  className="rounded-full px-8 shadow-lg"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
