"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Gift, Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { rewardsApi, menusApi } from "@/lib/api";
import type { ApiReward, ApiMenu } from "@/lib/api/types";

const REWARD_TYPES = [
  { value: "discount", label: "Discount" },
  { value: "free_item", label: "Free Item" },
  { value: "cashback", label: "Cashback" },
];

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<ApiReward[]>([]);
  const [menus, setMenus] = useState<ApiMenu[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<ApiReward | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [pointRequired, setPointRequired] = useState("");
  const [rewardType, setRewardType] = useState("discount");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [menuId, setMenuId] = useState("");
  const [freeQty, setFreeQty] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rewardsData, menusData] = await Promise.all([
        rewardsApi.listRewards(),
        menusApi.listMenus(),
      ]);
      setRewards(rewardsData);
      setMenus(menusData);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load rewards",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAddModal = () => {
    setEditingReward(null);
    setName("");
    setPointRequired("");
    setRewardType("discount");
    setValue("");
    setMinOrder("");
    setMenuId("");
    setFreeQty("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (reward: ApiReward) => {
    setEditingReward(reward);
    setName(reward.name);
    setPointRequired(String(reward.point_required));
    setRewardType(reward.reward_type);
    setValue(String(reward.value));
    setMinOrder(reward.min_order != null ? String(reward.min_order) : "");
    setMenuId(reward.menu_id != null ? String(reward.menu_id) : "");
    setFreeQty(reward.free_qty != null ? String(reward.free_qty) : "");
    setIsActive(reward.is_active ?? true);
    setIsModalOpen(true);
  };

  const isFreeItem = rewardType === "free_item";

  const isValid =
    !!name && !!pointRequired && (isFreeItem ? !!menuId && !!freeQty : !!value);

  const handleSave = async () => {
    if (!isValid) return;

    try {
      setSaving(true);
      if (editingReward) {
        const updated = await rewardsApi.updateReward(editingReward.id, {
          name,
          point_required: Number(pointRequired),
          reward_type: rewardType,
          min_order: minOrder ? Number(minOrder) : 0,
          is_active: isActive,
          ...(isFreeItem
            ? { menu_id: Number(menuId), free_qty: Number(freeQty) }
            : { value: Number(value) }),
        });
        setRewards((prev) =>
          prev.map((r) => (r.id === updated.id ? updated : r)),
        );
        toast.success("Reward updated");
      } else {
        const created = await rewardsApi.createReward({
          name,
          point_required: Number(pointRequired),
          reward_type: rewardType,
          value: isFreeItem ? 0 : Number(value),
          min_order: minOrder ? Number(minOrder) : undefined,
          menu_id: isFreeItem ? Number(menuId) : undefined,
          free_qty: isFreeItem ? Number(freeQty) : undefined,
        });
        setRewards((prev) => [created, ...prev]);
        toast.success("Reward created");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save reward");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this reward?")) return;
    try {
      setDeletingId(id);
      await rewardsApi.deleteReward(id);
      setRewards((prev) => prev.filter((r) => r.id !== id));
      toast.success("Reward deleted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete reward",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Rewards Program
          </h1>
          <p className="text-muted-foreground">
            Kelola hadiah penukaran poin loyalitas pelanggan.
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Reward
        </Button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : rewards.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          No rewards yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rewards.map((reward, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={reward.id}
            >
              <Card className="border-none shadow-md bg-card overflow-hidden">
                <div className="h-32 relative overflow-hidden bg-muted flex items-center justify-center">
                  <Gift className="w-10 h-10 text-primary/40" />
                  <div className="absolute top-2 right-2 bg-background/90 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <Gift className="w-3 h-3 text-primary" />{" "}
                    {reward.point_required} pts
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg">{reward.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">
                    {reward.reward_type.replace("_", " ")} &middot;{" "}
                    {reward.reward_type === "discount"
                      ? `${reward.value}%`
                      : reward.reward_type === "cashback"
                        ? `Rp ${reward.value.toLocaleString("id-ID")}`
                        : `${menus.find((m) => m.id === reward.menu_id)?.name || `Menu #${reward.menu_id}`} x${reward.free_qty ?? 1}`}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-bold ${reward.is_active ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-500"}`}
                    >
                      {reward.is_active ? "Active" : "Inactive"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(reward)}
                        className="text-primary hover:underline font-medium text-sm flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(reward.id)}
                        disabled={deletingId === reward.id}
                        className="text-red-500 hover:underline font-medium text-sm flex items-center gap-1 disabled:opacity-50"
                      >
                        {deletingId === reward.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
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
                <h2 className="text-xl font-serif font-bold">
                  {editingReward ? "Edit Reward" : "Add Reward"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto min-h-0">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reward Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Free Kopi Kedai Loman"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Points Required
                    </label>
                    <input
                      value={pointRequired}
                      onChange={(e) =>
                        setPointRequired(e.target.value.replace(/\D/g, ""))
                      }
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reward Type</label>
                    <select
                      value={rewardType}
                      onChange={(e) => setRewardType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {REWARD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {isFreeItem ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Free Menu Item
                      </label>
                      <select
                        value={menuId}
                        onChange={(e) => setMenuId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select menu...</option>
                        {menus.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Free Qty</label>
                      <input
                        value={freeQty}
                        onChange={(e) =>
                          setFreeQty(e.target.value.replace(/\D/g, ""))
                        }
                        type="text"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g. 1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {rewardType === "discount"
                        ? "Discount Value (%)"
                        : "Cashback Amount (Rp)"}
                    </label>
                    <input
                      value={value}
                      onChange={(e) =>
                        setValue(e.target.value.replace(/[^0-9.]/g, ""))
                      }
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder={
                        rewardType === "discount" ? "e.g. 10" : "e.g. 10000"
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Order (Rp)</label>
                  <input
                    value={minOrder}
                    onChange={(e) =>
                      setMinOrder(e.target.value.replace(/\D/g, ""))
                    }
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. 50000"
                  />
                </div>

                {editingReward && (
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                    Active
                  </label>
                )}
              </div>
              <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-muted/20">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full px-6"
                >
                  Cancel
                </Button>
                <Button
                  disabled={!isValid || saving}
                  onClick={handleSave}
                  className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-lg disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Reward"
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
