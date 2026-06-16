"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TicketPercent, Plus, Copy, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { vouchersApi } from "@/lib/api";
import type { ApiVoucher } from "@/lib/api/types";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "used", label: "Used" },
  { value: "expired", label: "Expired" },
];

const STATUS_TABS = [
  { value: "active", label: "Active" },
  { value: "used", label: "Used" },
  { value: "expired", label: "Expired" },
  { value: "", label: "All" },
];

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<ApiVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<ApiVoucher | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("active");
  const [expiredAt, setExpiredAt] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vouchersApi.listVouchers();
      // Only show admin-created vouchers (global: no user_id). Reward-generated
      // vouchers (user_id set) are tied to individual users and belong on the
      // customer-facing rewards page, not here.
      setVouchers(data.filter((v) => v.user_id == null));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load vouchers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayed = activeTab
    ? vouchers.filter((v) => v.status === activeTab)
    : vouchers;

  const openAddModal = () => {
    setEditingVoucher(null);
    setCode("");
    setStatus("active");
    setExpiredAt("");
    setMinOrder("");
    setDiscountPercentage("");
    setIsModalOpen(true);
  };

  const openEditModal = (voucher: ApiVoucher) => {
    setEditingVoucher(voucher);
    setCode(voucher.code);
    setStatus(voucher.status || "active");
    setExpiredAt(voucher.expired_at ? voucher.expired_at.slice(0, 10) : "");
    setMinOrder(voucher.min_order != null ? String(voucher.min_order) : "");
    setDiscountPercentage(
      voucher.discount_percentage != null ? String(voucher.discount_percentage) : "",
    );
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!code || !discountPercentage) return;

    try {
      setSaving(true);
      const payload = {
        code,
        status,
        expired_at: expiredAt ? `${expiredAt}T00:00:00Z` : undefined,
        min_order: minOrder ? Number(minOrder) : undefined,
        discount_percentage: Number(discountPercentage),
      };

      if (editingVoucher) {
        const updated = await vouchersApi.updateVoucher(editingVoucher.id, payload);
        setVouchers((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
        toast.success("Voucher updated");
      } else {
        const created = await vouchersApi.createVoucher(payload);
        setVouchers((prev) => [created, ...prev]);
        toast.success("Voucher created");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save voucher");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return;
    try {
      setDeletingId(id);
      await vouchersApi.deleteVoucher(id);
      setVouchers((prev) => prev.filter((v) => v.id !== id));
      toast.success("Voucher deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete voucher");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Voucher code copied");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Vouchers</h1>
          <p className="text-muted-foreground">Buat dan kelola kode promo diskon restoran.</p>
        </div>
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Voucher
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 border-b border-border">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs bg-muted rounded-full px-1.5 py-0.5">
              {tab.value ? vouchers.filter((v) => v.status === tab.value).length : vouchers.length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">No vouchers.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((voucher, i) => (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} key={voucher.id}>
              <Card className="border-none shadow-md bg-card overflow-hidden relative">
                <div className={`absolute top-0 left-0 bottom-0 w-2 ${voucher.status === "active" ? "bg-primary" : "bg-muted-foreground/40"}`}></div>
                <CardContent className="p-5 pl-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg flex items-center gap-2 font-mono font-bold tracking-wider">
                      <TicketPercent className="w-4 h-4" />
                      {voucher.code}
                      <button onClick={() => handleCopy(voucher.code)} className="ml-2 text-muted-foreground hover:text-primary"><Copy className="w-3 h-3" /></button>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${voucher.status === "active" ? "bg-green-500/10 text-green-600" : voucher.status === "used" ? "bg-orange-500/10 text-orange-600" : "bg-gray-500/10 text-gray-500"}`}>
                      {voucher.status || "active"}
                    </span>
                  </div>
                  <h3 className="font-bold text-2xl mb-1">{voucher.discount_percentage ?? 0}%</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {voucher.expired_at ? `Valid until ${voucher.expired_at.slice(0, 10)}` : "No expiry"}
                    {voucher.min_order ? ` · Min order Rp ${voucher.min_order.toLocaleString("id-ID")}` : ""}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                    <button onClick={() => openEditModal(voucher)} className="text-primary hover:underline font-medium text-sm flex items-center gap-1">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleDelete(voucher.id)} disabled={deletingId === voucher.id} className="text-red-500 hover:underline font-medium text-sm flex items-center gap-1 disabled:opacity-50">
                      {deletingId === voucher.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border/50 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border/50 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-serif font-bold">{editingVoucher ? "Edit Voucher" : "Create Voucher"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto min-h-0">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Voucher Code</label>
                  <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} type="text" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. HEMAT50" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Discount (%)</label>
                    <input value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value.replace(/[^0-9.]/g, ""))} type="text" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. 20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min Order (Rp)</label>
                    <input value={minOrder} onChange={e => setMinOrder(e.target.value.replace(/\D/g, ""))} type="text" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. 50000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expiry Date</label>
                    <input value={expiredAt} onChange={e => setExpiredAt(e.target.value)} type="date" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-muted/20">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-full px-6">Cancel</Button>
                <Button disabled={!code || !discountPercentage || saving} onClick={handleSave} className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-lg disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Voucher"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
