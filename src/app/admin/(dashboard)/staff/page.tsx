"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, UserCog, Search, X, Trash2 } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";

export default function AdminStaffPage() {
  const { staff, addStaff, updateStaff, deleteStaff } = useAdminStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [role, setRole] = useState("Waitress");
  const [shift, setShift] = useState("Pagi");
  const [status, setStatus] = useState("Active");

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingStaff(null);
    setName("");
    setRole("Waitress");
    setShift("Pagi");
    setStatus("Active");
    setIsModalOpen(true);
  };

  const openEditModal = (s: any) => {
    setEditingStaff(s);
    setName(s.name);
    setRole(s.role);
    setShift(s.shift);
    setStatus(s.status);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name) return;

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        ...editingStaff,
        name,
        role,
        shift,
        status
      });
    } else {
      const newStaff = {
        id: `EMP-${Math.floor(10 + Math.random() * 90)}`,
        name,
        role,
        shift,
        status
      };
      addStaff(newStaff);
    }
    setIsModalOpen(false);
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      deleteStaff(id);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground">Kelola data karyawan dan jadwal shift.</p>
        </div>
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Staff
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by name or role..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {filteredStaff.length === 0 ? (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            No staff found matching "{searchQuery}"
          </div>
        ) : filteredStaff.map((s, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={s.id}>
            <Card className="border-none shadow-md bg-card overflow-hidden text-center relative group h-full flex flex-col justify-between">
              <div className="h-20 bg-primary/5"></div>
              <div className="absolute top-8 left-1/2 -translate-x-1/2">
                <div className="w-20 h-20 rounded-full bg-white border-4 border-card flex items-center justify-center shadow-sm">
                  <UserCog className="w-10 h-10 text-muted-foreground" />
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDeleteStaff(s.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <CardContent className="pt-12 pb-6 px-4 flex flex-col flex-1">
                <h3 className="font-bold text-lg">{s.name}</h3>
                <p className="text-primary font-medium text-sm">{s.role}</p>
                
                <div className="mt-4 flex justify-between items-center text-sm border-t border-border/50 pt-4 w-full">
                  <span className="text-muted-foreground">Shift: <strong className="text-foreground">{s.shift}</strong></span>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${s.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>
                    {s.status}
                  </span>
                </div>
                
                <div className="mt-4">
                  <Button onClick={() => openEditModal(s)} variant="outline" size="sm" className="w-full rounded-full">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add / Edit Staff Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border/50"
            >
              <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/30">
                <h2 className="text-xl font-serif font-bold">{editingStaff ? "Edit Staff" : "Add New Staff"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} type="text" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option>Cashier</option>
                    <option>Waitress</option>
                    <option>Chef</option>
                    <option>Manager</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Shift</label>
                    <select value={shift} onChange={e => setShift(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option>Pagi</option>
                      <option>Siang</option>
                      <option>Malam</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option>Active</option>
                      <option>Off</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-muted/20">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-full px-6">Cancel</Button>
                <Button disabled={!name} onClick={handleSave} className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-lg disabled:opacity-50">
                  {editingStaff ? "Save Changes" : "Add Staff"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
