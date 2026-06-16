"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { Ticket, Gift, ChevronLeft, Sparkles, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/store/useAuthStore";
import { rewardsApi, usersApi, vouchersApi } from "@/lib/api";
import type { ApiReward, ApiVoucher } from "@/lib/api/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function PromoPage() {
  const authUser = useAuthStore((s) => s.user);
  const isBackendCustomer = useAuthStore((s) =>
    Boolean(s.accessToken && s.portal === "customer"),
  );
  const { status } = useSession();

  const [availableVouchers, setAvailableVouchers] = React.useState<
    ApiVoucher[]
  >([]);
  const [redeemedRewards, setRedeemedRewards] = React.useState<ApiReward[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isBackendCustomer) {
        if (isMounted) {
          setAvailableVouchers([]);
          setRedeemedRewards([]);
          setLoading(false);
        }
        return;
      }

      try {
        const vouchersList = await vouchersApi.listVouchers();
        if (isMounted) {
          setAvailableVouchers(vouchersList);
        }

        if (authUser?.id) {
          const rewardsList = await rewardsApi.listAvailableRewards();
          if (isMounted) {
            setRedeemedRewards(
              rewardsList.filter((r) => r.is_active !== false),
            );
          }
        }
      } catch (error) {
        toast.error("Gagal memuat data promo.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isBackendCustomer, authUser]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isBackendCustomer) {
    return (
      <div className="container mx-auto px-4 md:px-8 max-w-3xl py-16 pb-24 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto">
          <Ticket className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-serif font-bold">
          Promo hanya untuk pengguna terdaftar
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Anda perlu masuk sebagai customer untuk melihat voucher dan promo yang
          tersedia.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/login">
            <Button className="rounded-full px-8 py-4">Login</Button>
          </Link>
          <Link href="/rewards">
            <Button variant="outline" className="rounded-full px-8 py-4">
              Lihat Rewards
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-3xl py-8 pb-24 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold">
            Promo Spesial
          </h1>
          <p className="text-sm text-muted-foreground">
            Voucher dan hadiah eksklusif untuk Anda
          </p>
        </div>
      </div>

      {/* Available Vouchers Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-serif font-bold flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" />
          Voucher Tersedia
        </h2>

        {availableVouchers.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="p-8 text-center text-muted-foreground">
              Belum ada voucher yang tersedia saat ini.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {availableVouchers.map((voucher, i) => (
              <motion.div
                key={voucher.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="rounded-2xl border-dashed border-primary/30 hover:border-primary/50 transition-colors">
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
                      <span className="text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
                        {voucher.discount_percentage}% off
                      </span>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Redeemed Rewards Section */}
      {isBackendCustomer && redeemedRewards.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Hadiah Tersedia
          </h2>

          <div className="space-y-3">
            {redeemedRewards.map((reward, i) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="rounded-2xl border-border/60 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg">{reward.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {reward.reward_type.replace(/_/g, " ")}
                        {reward.min_order
                          ? ` · Min. order Rp ${reward.min_order.toLocaleString("id-ID")}`
                          : null}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-primary/10 text-primary rounded-full shrink-0">
                      {reward.point_required} pts
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Button to Rewards Page */}
      <div className="pt-8 border-t border-border">
        <Link href="/rewards">
          <Button className="w-full rounded-2xl py-6 text-base h-auto gap-2 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
            Lihat Lebih Banyak Rewards
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
