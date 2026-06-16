"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, AlertTriangle, Package, X, Plus, Minus } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";

export default function AdminStockPage() {
  const { stocks, updateStock } = useAdminStore();

  // Modals state
  const [editingStock, setEditingStock] = useState<any>(null);
  const [updateAmount, setUpdateAmount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const openUpdateModal = (item: any) => {
    setEditingStock(item);
    setUpdateAmount(item.current);
  };

  const saveUpdate = () => {
    if (!editingStock) return;

    updateStock(editingStock.id, {
      current: updateAmount,
      min: editingStock.min,
    });
    setEditingStock(null);
  };

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.item.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          stock.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || 
                         (statusFilter === "Low Stock" && stock.status === "low") || 
                         (statusFilter === "Normal" && stock.status === "normal");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Stock Management</h1>
          <p className="text-muted-foreground">Pantau ketersediaan bahan baku dan packaging.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
              <p className="text-2xl font-bold text-red-500">{stocks.filter(s => s.status === 'low').length}</p>
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
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" 
              />
            </div>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 text-sm rounded-lg border border-border/50 bg-background outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option>All Status</option>
              <option>Low Stock</option>
              <option>Normal</option>
            </select>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Item Code</th>
                <th className="px-6 py-4 font-medium">Item Name</th>
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
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No items match your filter.</td>
                </tr>
              ) : filteredStocks.map((item, i) => (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} key={item.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-mono text-xs">{item.id}</td>
                  <td className="px-6 py-4 font-bold">{item.item}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.category}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold text-lg ${item.status === 'low' ? 'text-red-500' : 'text-foreground'}`}>
                      {item.current} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{item.min} {item.unit}</td>
                  <td className="px-6 py-4">
                    {item.status === 'low' ? (
                      <span className="px-2 py-1 rounded-md bg-red-500/10 text-red-500 text-xs font-bold flex items-center w-max gap-1">
                        <AlertTriangle className="w-3 h-3" /> Low
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-600 text-xs font-bold">Normal</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openUpdateModal(item)} className="text-primary hover:underline font-medium text-xs">Update</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Update Stock Modal */}
      <AnimatePresence>
        {editingStock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-border/50"
            >
              <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/30">
                <h2 className="text-xl font-serif font-bold">Update Stock</h2>
                <button onClick={() => setEditingStock(null)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground">Item Name</p>
                  <p className="text-lg font-bold">{editingStock.item}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Adjust Quantity ({editingStock.unit})</p>
                  <div className="flex items-center gap-4 bg-background p-2 rounded-xl border border-border/50">
                    <button onClick={() => setUpdateAmount(Math.max(0, updateAmount - 1))} className="p-3 bg-muted rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                      <Minus className="w-5 h-5" />
                    </button>
                    <input 
                      type="number" 
                      value={updateAmount} 
                      onChange={(e) => setUpdateAmount(Number(e.target.value) || 0)}
                      className="flex-1 w-full text-center text-2xl font-bold bg-transparent outline-none appearance-none"
                    />
                    <button onClick={() => setUpdateAmount(updateAmount + 1)} className="p-3 bg-muted rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-muted/20">
                <Button variant="outline" onClick={() => setEditingStock(null)} className="rounded-full px-6">Cancel</Button>
                <Button onClick={saveUpdate} className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-lg">Save</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
