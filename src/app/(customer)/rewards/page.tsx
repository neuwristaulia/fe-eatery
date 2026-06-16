"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { Award, Gift, Ticket, ChevronLeft, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { rewardsApi, usersApi, vouchersApi } from "@/lib/api";
import type { ApiReward, ApiVoucher } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function rewardDescription(reward: ApiReward) {
  switch (reward.reward_type) {
    case "discount":
      return `Diskon ${reward.value}%`;
    case "free_item":
      return `Gratis ${reward.free_qty ?? 1} item`;
    default:
      return reward.reward_type.replace(/_/g, " ");
  }
}

export default function CustomerRewardsPage() {
  const authUser = useAuthStore((s) => s.user);
  const isBackendCustomer = useAuthStore(
    (s) => Boolean(s.accessToken && s.portal === "customer"),
  );

  const [points, setPoints] = React.useState(0);
  const [rewards, setRewards] = React.useState<ApiReward[]>([]);
  const [vouchers, setVouchers] = React.useState<ApiVoucher[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [redeemingId, setRedeemingId] = React.useState<number | null>(null);

  const loadData = React.useCallback(async () => {
    if (!authUser?.id) return;
    setLoading(true);
    try {
      const [pointsData, rewardsList, vouchersList] = await Promise.all([
        usersApi.getUserPoints(authUser.id),
        rewardsApi.listAvailableRewards(),
        vouchersApi.listVouchers().catch(() => [] as ApiVoucher[]),
      ]);
      setPoints(pointsData.total_point);
      setRewards(rewardsList.filter((r) => r.is_active !== false));
      setVouchers(vouchersList);
    } catch {
      toast.error("Gagal memuat data rewards.");
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  React.useEffect(() => {
    if (isBackendCustomer && authUser?.id) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isBackendCustomer, authUser?.id, loadData]);

  const handleRedeem = async (reward: ApiReward) => {
    if (points < reward.point_required) {
      toast.error("Poin tidak cukup untuk menukar reward ini.");
      return;
    }

    setRedeemingId(reward.id);
    try {
      await rewardsApi.redeemReward(reward.id);
      toast.success(`Berhasil menukar: ${reward.name}`);
      await loadData();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Penukaran gagal. Coba lagi.",
      );
    } finally {
      setRedeemingId(null);
    }
  };

  if (!isBackendCustomer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <Award className="w-16 h-16 text-primary/40 mb-6" />
        <h2 className="text-2xl font-bold mb-3">Login Diperlukan</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Masuk dengan akun customer untuk melihat poin dan menukar rewards.
        </p>
        <Link href="/login">
          <Button size="lg" className="rounded-2xl">
            Login
          </Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-3xl py-8 pb-24 space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Rewards</h1>
          <p className="text-sm text-muted-foreground">
            Tukar poin dengan voucher & hadiah
          </p>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-secondary to-[#153428] border-none text-secondary-foreground rounded-3xl overflow-hidden shadow-lg">
        <CardContent className="p-6 md:p-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-accent" />
            </div>
            <div>
              <p className="text-secondary-foreground/80 text-sm">Total Poin</p>
              <p className="text-3xl font-bold text-accent">{points}</p>
            </div>
          </div>
          <p className="text-xs text-secondary-foreground/70 text-right max-w-[140px]">
            Kumpulkan poin dari setiap pesanan selesai
          </p>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-serif font-bold flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Tukar Poin
        </h2>

        {rewards.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="p-8 text-center text-muted-foreground">
              Belum ada reward yang tersedia.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rewards.map((reward, i) => {
              const canRedeem = points >= reward.point_required;
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="rounded-2xl border-border/60">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg">{reward.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {rewardDescription(reward)}
                          {reward.min_order
                            ? ` · Min. order Rp ${reward.min_order.toLocaleString("id-ID")}`
                            : null}
                        </p>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                            canRedeem
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Award className="w-3 h-3" />
                          {reward.point_required} pts
                        </span>
                      </div>
                      <Button
                        className="rounded-xl shrink-0"
                        disabled={!canRedeem || redeemingId === reward.id}
                        isLoading={redeemingId === reward.id}
                        onClick={() => handleRedeem(reward)}
                      >
                        {canRedeem ? "Tukar" : "Poin kurang"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {vouchers.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            Voucher Saya
          </h2>
          <div className="space-y-3">
            {vouchers.map((voucher) => (
              <Card key={voucher.id} className="rounded-2xl border-dashed border-primary/30">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono font-bold text-lg tracking-wider">
                      {voucher.code}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {voucher.status || "active"}
                      {voucher.expired_at
                        ? ` · Berlaku sampai ${new Date(voucher.expired_at).toLocaleDateString("id-ID")}`
                        : null}
                    </p>
                  </div>
                  {voucher.discount_percentage != null && (
                    <span className="text-sm font-bold text-primary">
                      {voucher.discount_percentage}% off
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
