"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Trophy, Medal, Award, X, Mail, Phone, MapPin, Calendar, CreditCard, Plus, Minus, Edit2, Trash2, Save } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";

const getTierIcon = (tier: string) => {
  switch (tier) {
    case "Gold": return <Trophy className="w-4 h-4 text-yellow-500" />;
    case "Silver": return <Medal className="w-4 h-4 text-gray-400" />;
    case "Bronze": return <Award className="w-4 h-4 text-amber-700" />;
    default: return null;
  }
};

export default function AdminCustomersPage() {
  const { customers, updateCustomerPoints, updateCustomer, deleteCustomer } = useAdminStore();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdjustingPoints, setIsAdjustingPoints] = useState(false);
  const [pointAdjustment, setPointAdjustment] = useState("");

  const handleDeleteCustomer = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomer(id);
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }
    }
  };

  const filteredCustomers = customers.filter(cust => 
    cust.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cust.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdjustPoints = () => {
    if (!selectedCustomer || !pointAdjustment) return;
    const amount = parseInt(pointAdjustment);
    if (isNaN(amount)) return;
    
    updateCustomerPoints(selectedCustomer.id, amount);
    
    // Update local state for immediate UI reflection
    const newPoints = selectedCustomer.points + amount;
    let newTier = selectedCustomer.tier;
    if (newPoints >= 2000) newTier = "Gold";
    else if (newPoints >= 500) newTier = "Silver";
    else newTier = "Bronze";
    
    setSelectedCustomer({
      ...selectedCustomer,
      points: newPoints,
      tier: newTier
    });
    
    setIsAdjustingPoints(false);
    setPointAdjustment("");
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Database pelanggan dan program loyalitas.</p>
        </div>
      </div>

      <Card className="border-none shadow-md bg-card overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/50">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by name, email, or phone..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" 
              />
            </div>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Customer Info</th>
                <th className="px-6 py-4 font-medium">Joined Date</th>
                <th className="px-6 py-4 font-medium">Total Orders</th>
                <th className="px-6 py-4 font-medium">Points</th>
                <th className="px-6 py-4 font-medium">Tier</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No customers found.</td>
                </tr>
              ) : filteredCustomers.map((cust, i) => (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} key={cust.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold">{cust.name}</p>
                        <p className="text-xs text-muted-foreground">{cust.email === "-" ? cust.phone : cust.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{cust.joined}</td>
                  <td className="px-6 py-4 font-bold">{cust.orders}</td>
                  <td className="px-6 py-4 font-bold text-primary">{cust.points} pts</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-medium">
                      {getTierIcon(cust.tier)} {cust.tier}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button onClick={() => { setSelectedCustomer(cust); setIsAdjustingPoints(false); }} variant="ghost" size="sm" className="h-8 text-primary">View Profile</Button>
                      <Button onClick={() => setEditingCustomer(cust)} variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"><Edit2 className="w-4 h-4" /></Button>
                      <Button onClick={() => handleDeleteCustomer(cust.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-border/50"
            >
              <div className="p-6 border-b border-border/50 flex justify-between items-start bg-muted/30 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-serif font-bold text-primary border border-primary/20 shadow-inner">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-foreground">{selectedCustomer.name}</h2>
                    <p className="text-sm font-mono text-muted-foreground">{selectedCustomer.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground z-10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-background">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" /> <span>{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" /> <span>{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" /> <span className="line-clamp-1">{selectedCustomer.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" /> <span>Joined {selectedCustomer.joined}</span>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 relative">
                    <div>
                      <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Loyalty Tier</p>
                      <div className="flex items-center gap-2 text-xl font-bold">
                        {getTierIcon(selectedCustomer.tier)} {selectedCustomer.tier} Member
                      </div>
                    </div>
                    <div className="flex justify-between items-end border-t border-primary/10 pt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Points</p>
                        <p className="font-bold text-2xl text-primary">{selectedCustomer.points}</p>
                      </div>
                      <Button onClick={() => setIsAdjustingPoints(!isAdjustingPoints)} size="sm" variant="outline" className="h-7 text-xs rounded-full border-primary text-primary hover:bg-primary hover:text-white">
                        {isAdjustingPoints ? "Cancel" : "Adjust"}
                      </Button>
                    </div>

                    {/* Quick Adjust Input */}
                    <AnimatePresence>
                      {isAdjustingPoints && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-3 border-t border-primary/10 mt-3 flex items-center gap-2"
                        >
                          <input 
                            type="number" 
                            placeholder="e.g. 50 or -20" 
                            value={pointAdjustment}
                            onChange={(e) => setPointAdjustment(e.target.value)}
                            className="flex-1 px-3 py-1 text-sm rounded-lg border border-primary/30 bg-background outline-none focus:ring-1 focus:ring-primary/50" 
                          />
                          <Button onClick={handleAdjustPoints} size="sm" className="h-7 px-3 bg-primary text-white rounded-lg">Save</Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border/50 bg-background flex flex-col items-center justify-center text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                    <p className="text-3xl font-bold">{selectedCustomer.orders}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-background flex flex-col items-center justify-center text-center">
                    <p className="text-sm text-muted-foreground mb-1">Lifetime Value</p>
                    <p className="text-2xl font-bold text-green-600">{selectedCustomer.lifetimeValue}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Customer Modal */}
      <AnimatePresence>
        {editingCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border/50"
            >
              <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/30">
                <h2 className="text-xl font-serif font-bold text-foreground">Edit Customer</h2>
                <button onClick={() => setEditingCustomer(null)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input 
                    type="text" 
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border/50 bg-background outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input 
                    type="email" 
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border/50 bg-background outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <input 
                    type="text" 
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border/50 bg-background outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <textarea 
                    value={editingCustomer.address}
                    onChange={(e) => setEditingCustomer({...editingCustomer, address: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border/50 bg-background outline-none focus:ring-2 focus:ring-primary/20 resize-none h-20" 
                  />
                </div>

                <div className="pt-4 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setEditingCustomer(null)}>Cancel</Button>
                  <Button className="bg-primary text-white" onClick={() => {
                    updateCustomer(editingCustomer.id, editingCustomer);
                    setEditingCustomer(null);
                    if (selectedCustomer?.id === editingCustomer.id) {
                      setSelectedCustomer(editingCustomer);
                    }
                  }}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
