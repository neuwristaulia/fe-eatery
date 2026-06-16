"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Armchair, Users, Plus, Trash2, X, Edit2 } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";

export default function AdminTablesPage() {
  const { tables, addTable, updateTable, deleteTable, fetchAllData } = useAdminStore();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllData();
  }, [fetchAllData]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [status, setStatus] = useState("Available");

  const openAddModal = () => {
    setEditingTable(null);
    setName(`Table ${tables.length + 1}`);
    setCapacity(4);
    setStatus("Available");
    setIsModalOpen(true);
  };

  const openEditModal = (t: any) => {
    setEditingTable(t);
    setName(t.name);
    setCapacity(t.capacity);
    setStatus(t.status);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name) return;

    if (editingTable) {
      updateTable(editingTable.id, {
        ...editingTable,
        name,
        capacity: Number(capacity),
        status
      });
    } else {
      const newTable = {
        id: `T-${Math.floor(10 + Math.random() * 90)}`,
        name,
        capacity: Number(capacity),
        status
      };
      addTable(newTable);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Cafe Tables</h1>
          <p className="text-muted-foreground">Manajemen meja makan restoran (Dine-in).</p>
        </div>
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Table
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> <span className="text-sm">Available</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> <span className="text-sm">Occupied</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> <span className="text-sm">Reserved</span></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map((table, i) => (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} key={table.id}>
            <Card className={`border-none shadow-md overflow-hidden relative group ${
              table.status === 'Available' ? 'bg-card' :
              table.status === 'Occupied' ? 'bg-red-500/10 border-2 border-red-500/50' :
              'bg-orange-500/10 border-2 border-orange-500/50'
            }`}>
              
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => openEditModal(table)} className="p-1.5 bg-background/80 hover:bg-primary hover:text-white rounded-full transition-colors">
                  <Edit2 className="w-3 h-3 text-muted-foreground hover:text-white" />
                </button>
                <button onClick={() => deleteTable(table.id)} className="p-1.5 bg-background/80 hover:bg-red-500 hover:text-white rounded-full transition-colors text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-32 relative">
                <Armchair className={`w-8 h-8 mb-2 ${
                  table.status === 'Available' ? 'text-green-500' :
                  table.status === 'Occupied' ? 'text-red-500' :
                  'text-orange-500'
                }`} />
                <h3 className="font-bold text-lg leading-tight">{table.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3" /> {table.capacity} pax
                </p>
                {table.status === 'Reserved' && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded">
                    {table.time || "Reserved"}
                  </span>
                )}
                {table.status === 'Occupied' && table.orderId && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">
                    {table.orderId}
                  </span>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add / Edit Table Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-border/50"
            >
              <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/30">
                <h2 className="text-xl font-serif font-bold">{editingTable ? "Edit Table" : "Add New Table"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Table Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} type="text" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Table 1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Capacity (Pax)</label>
                    <input value={capacity} onChange={e => setCapacity(Number(e.target.value))} type="number" min="1" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option>Available</option>
                      <option>Reserved</option>
                      <option>Occupied</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-muted/20">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-full px-6">Cancel</Button>
                <Button disabled={!name} onClick={handleSave} className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-lg disabled:opacity-50">
                  {editingTable ? "Save Changes" : "Save Table"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
