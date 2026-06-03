"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Plus, Calendar as CalendarIcon, Clock, Users, X, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";

export default function AdminReservationsPage() {
  const { reservations, addReservation, updateReservation, deleteReservation, tables } = useAdminStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [table, setTable] = useState("");
  const [capacity, setCapacity] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("Pending");

  const filteredReservations = reservations?.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phone.includes(searchQuery)
  ) || [];

  const openAddModal = () => {
    setEditingReservation(null);
    setName("");
    setPhone("");
    setEmail("");
    setTable(tables[0]?.name || "");
    setCapacity(2);
    setDate("");
    setTime("");
    setStatus("Pending");
    setIsModalOpen(true);
  };

  const openEditModal = (r: any) => {
    setEditingReservation(r);
    setName(r.name);
    setPhone(r.phone);
    setEmail(r.email);
    setTable(r.table);
    setCapacity(r.capacity);
    setDate(r.date);
    setTime(r.time);
    setStatus(r.status);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name || !phone || !date || !time) return;

    if (editingReservation) {
      updateReservation(editingReservation.id, {
        ...editingReservation,
        name,
        phone,
        email,
        table,
        capacity: Number(capacity),
        date,
        time,
        status
      });
    } else {
      const newReservation = {
        id: `RES-${Math.floor(100 + Math.random() * 900)}`,
        name,
        phone,
        email,
        table,
        capacity: Number(capacity),
        date,
        time,
        status
      };
      addReservation(newReservation);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this reservation?")) {
      deleteReservation(id);
    }
  };

  const markConfirmed = (r: any) => {
    updateReservation(r.id, { ...r, status: "Confirmed" });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground">Kelola reservasi meja pelanggan.</p>
        </div>
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Reservation
        </Button>
      </div>

      <Card className="border-none shadow-md bg-card overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/50">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by customer name or phone..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" 
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Reservation Info</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No reservations found.</td>
                  </tr>
                ) : filteredReservations.map((r, i) => (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} key={r.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p>{r.phone}</p>
                        <p className="text-xs text-muted-foreground">{r.email || "-"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <CalendarIcon className="w-3.5 h-3.5 text-primary" /> {r.date}
                          <Clock className="w-3.5 h-3.5 text-primary ml-2" /> {r.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary w-fit px-2 py-0.5 rounded">
                          <Users className="w-3.5 h-3.5" /> {r.table} ({r.capacity} pax)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        r.status === 'Confirmed' ? 'bg-green-500/10 text-green-600' :
                        r.status === 'Pending' ? 'bg-orange-500/10 text-orange-600' :
                        r.status === 'Cancelled' ? 'bg-red-500/10 text-red-600' :
                        'bg-gray-500/10 text-gray-600'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-1">
                        {r.status === 'Pending' && (
                          <Button onClick={() => markConfirmed(r)} variant="ghost" size="icon" title="Confirm" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button onClick={() => openEditModal(r)} variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleDelete(r.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Reservation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border/50 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/30 shrink-0">
                <h2 className="text-xl font-serif font-bold">{editingReservation ? "Edit Reservation" : "Add Reservation"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="font-semibold border-b pb-2">Customer Info</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <input value={name} onChange={e => setName(e.target.value)} type="text" className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Customer Name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone <span className="text-red-500">*</span></label>
                      <input value={phone} onChange={e => setPhone(e.target.value)} type="text" className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. 0812..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email (Optional)</label>
                      <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Email address" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="font-semibold border-b pb-2">Reservation Info</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Table <span className="text-red-500">*</span></label>
                      <select value={table} onChange={e => setTable(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                        {tables.map(t => (
                          <option key={t.id} value={t.name}>{t.name} (Max {t.capacity} pax)</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Capacity (Pax) <span className="text-red-500">*</span></label>
                      <input value={capacity} onChange={e => setCapacity(Number(e.target.value))} type="number" min="1" className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date <span className="text-red-500">*</span></label>
                      <input value={date} onChange={e => setDate(e.target.value)} type="date" className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Time <span className="text-red-500">*</span></label>
                      <input value={time} onChange={e => setTime(e.target.value)} type="time" className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-muted/20 shrink-0">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button disabled={!name || !phone || !date || !time} onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white shadow-lg disabled:opacity-50">
                  {editingReservation ? "Save Changes" : "Create Reservation"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
