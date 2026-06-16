"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  ArrowLeft,
  Utensils,
  ShoppingBag,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// removed unused useSession import
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import type { ApiVoucher, PaymentMethod } from "@/lib/api/types";
import { ordersApi, paymentsApi, tablesApi, vouchersApi } from "@/lib/api";
import { parseNumericId } from "@/lib/api/mappers";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    clearCart,
    cartTotal,
    discount,
    cart,
    voucherId,
    voucherCode,
    applyVoucher,
    removeVoucher,
  } = useStore();
  const accessToken = useAuthStore((s) => s.accessToken);
  const portal = useAuthStore((s) => s.portal);
  const isBackendCustomer = Boolean(accessToken && portal === "customer");

  const [userVouchers, setUserVouchers] = React.useState<ApiVoucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = React.useState(false);
  const selectedVoucher = userVouchers.find((v) => v.id === voucherId) || null;

  React.useEffect(() => {
    async function loadUserVouchers() {
      if (!isBackendCustomer) return;
      setLoadingVouchers(true);
      try {
        const list = await vouchersApi.listVouchers();
        setUserVouchers(list);
      } catch {
        setUserVouchers([]);
      } finally {
        setLoadingVouchers(false);
      }
    }

    loadUserVouchers();
  }, [isBackendCustomer]);

  const handleSelectVoucher = async (voucher: ApiVoucher) => {
    if (!voucher?.id) return;

    try {
      const validated = await vouchersApi.validateVoucher(voucher.code);
      let discountAmount = 0;

      if (validated.discount_percentage) {
        discountAmount = (cartTotal() * validated.discount_percentage) / 100;
      } else if (validated.cashback_amount) {
        discountAmount = Math.min(validated.cashback_amount, cartTotal());
      } else if (validated.free_menu_id) {
        const freeItem = cart.find(
          (item) => parseNumericId(item.id) === validated.free_menu_id,
        );
        if (!freeItem) {
          toast.error(
            `Tambahkan ${validated.free_menu_name ?? "menu gratis"} ke keranjang untuk menggunakan voucher ini`,
          );
          return;
        }
        const freeQty = Math.min(
          validated.free_item_qty ?? 1,
          freeItem.quantity,
        );
        discountAmount = freeItem.price * freeQty;
      }

      applyVoucher(validated.code, discountAmount, validated.id);
      toast.success(`Voucher ${validated.code} berhasil diterapkan`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menerapkan voucher",
      );
    }
  };

  const [step, setStep] = React.useState(1);
  const [orderType, setOrderType] = React.useState<
    "dine_in" | "take_away" | ""
  >("");
  const [tableNo, setTableNo] = React.useState("");
  const [paymentMethod, setPaymentMethod] =
    React.useState<PaymentMethod>("midtrans");
  const [orderNumber] = React.useState(
    () => Math.floor(Math.random() * 9000) + 1000,
  );

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [guestName, setGuestName] = React.useState("");
  const [guestPhone, setGuestPhone] = React.useState("");
  const [guestOrderId, setGuestOrderId] = React.useState<number | null>(null);
  const [guestTotal, setGuestTotal] = React.useState<number>(0);

  /** Drives the persistent payment-status panel shown while waiting for Midtrans confirmation. */
  type PaymentPanelStatus =
    | "idle"
    | "waiting"
    | "verifying"
    | "success"
    | "failed"
    | "timeout";
  const [paymentPanelStatus, setPaymentPanelStatus] =
    React.useState<PaymentPanelStatus>("idle");

  const handleNext = () => {
    if (step === 1 && !orderType) {
      toast.error("Please select an order type");
      return;
    }
    if (step === 2) {
      if (orderType === "dine_in" && !tableNo) {
        toast.error("Please enter a table number");
        return;
      }
      if (!isBackendCustomer && (!guestName.trim() || !guestPhone.trim())) {
        toast.error("Please enter your name and phone number");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 1) router.back();
    else setStep((s) => s - 1);
  };

  const applyVoucherIfAny = async (orderId: number) => {
    if (voucherId && voucherCode) {
      try {
        await vouchersApi.applyVoucher(voucherCode, orderId);
      } catch (err: unknown) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Gagal menerapkan voucher setelah pembayaran",
        );
      }
    }
  };

  /**
   * Polls payment status until it resolves to "paid"/"failed" or the timeout elapses.
   * Reports "verifying" while a status check is in flight and "waiting" between checks, so the
   * caller can drive a persistent status panel.
   */
  const pollPaymentStatus = async (
    paymentId: number,
    onTick: (state: "waiting" | "verifying") => void,
    intervalMs = 3000,
    timeoutMs = 120000,
  ): Promise<string> => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      onTick("verifying");
      try {
        const result = await paymentsApi.getPaymentStatus(paymentId);
        if (result.status === "paid" || result.status === "failed") {
          return result.status;
        }
      } catch {
        // ignore transient errors and keep polling
      }
      onTick("waiting");
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    return "timeout";
  };

  const pollGuestPaymentStatus = async (
    paymentId: number,
    onTick: (state: "waiting" | "verifying") => void,
    intervalMs = 3000,
    timeoutMs = 120000,
  ): Promise<string> => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      onTick("verifying");
      try {
        const result = await paymentsApi.getGuestPaymentStatus(paymentId);
        if (result.status === "paid" || result.status === "failed") {
          return result.status;
        }
      } catch {
        // ignore transient errors and keep polling
      }
      onTick("waiting");
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    return "timeout";
  };

  const handleComplete = async () => {
    if (cart.length === 0) {
      toast.error("Keranjang kosong");
      return;
    }

    setIsProcessing(true);
    try {
      let tableId: number | undefined;
      if (orderType === "dine_in" && tableNo) {
        const tables = await tablesApi.listTables();
        const match = tables.find(
          (t) => String(t.table_number) === String(tableNo).trim(),
        );
        tableId = match?.id;
      }

      if (!isBackendCustomer) {
        // GUEST CHECKOUT PATH
        const order = await ordersApi.createGuestOrder({
          guest_name: guestName.trim(),
          guest_phone: guestPhone.trim(),
          order_type: orderType === "take_away" ? "takeaway" : "dine-in",
          table_id: tableId,
          items: cart.map((item) => ({
            menu_id: parseNumericId(item.id),
            quantity: item.quantity,
          })),
        });

        setGuestOrderId(order.id);
        setGuestTotal(order.total_price ?? cartTotal());

        // Persist so the user can claim this order after signing in
        try {
          const stored = JSON.parse(localStorage.getItem("guest_order_ids") ?? "[]") as number[];
          if (!stored.includes(order.id)) stored.push(order.id);
          localStorage.setItem("guest_order_ids", JSON.stringify(stored));
        } catch {
          // localStorage may be unavailable in some environments
        }

        if (paymentMethod === "cash") {
          await paymentsApi.createGuestPayment({
            order_id: order.id,
            method: "cash",
          });
          clearCart();
          setStep(4);
          return;
        }

        const payment = await paymentsApi.createGuestPayment({
          order_id: order.id,
          method: "midtrans",
        });

        const snapToken = payment.snap_token;
        const snapWindowGuest = window as Window & {
          snap?: {
            pay: (
              token: string,
              opts: {
                onSuccess?: () => void;
                onPending?: () => void;
                onError?: () => void;
                onClose?: () => void;
              },
            ) => void;
          };
        };
        const snapGuest = snapWindowGuest.snap;

        if (!snapToken || !snapGuest?.pay) {
          toast.error(
            "Tidak dapat membuka popup Midtrans. Silakan muat ulang halaman.",
          );
          return;
        }

        if (payment.payment_mode === "sandbox") {
          let settledGuest = false;
          const handleAfterGuestPopup = async () => {
            if (settledGuest) return;
            settledGuest = true;
            setPaymentPanelStatus("waiting");
            const finalStatus = await pollGuestPaymentStatus(payment.id, (state) =>
              setPaymentPanelStatus(state),
            );
            if (finalStatus === "paid") {
              setPaymentPanelStatus("success");
              clearCart();
              setTimeout(() => {
                setPaymentPanelStatus("idle");
                setStep(4);
              }, 1500);
            } else if (finalStatus === "failed") {
              setPaymentPanelStatus("failed");
            } else {
              setPaymentPanelStatus("timeout");
            }
          };

          snapGuest.pay(snapToken, {
            onSuccess: () => { handleAfterGuestPopup(); },
            onPending: () => { toast("Pembayaran sedang diproses."); },
            onError: () => { toast.error("Gagal memproses pembayaran Midtrans."); },
            onClose: () => { handleAfterGuestPopup(); },
          });
          return;
        }

        // Guest mock mode
        snapGuest.pay(snapToken, {
          onSuccess: () => { clearCart(); setStep(4); },
          onPending: () => { toast("Pembayaran sedang ditunggu. Silakan cek kembali nanti."); },
          onError: () => { toast.error("Gagal memproses pembayaran Midtrans."); },
          onClose: () => { clearCart(); setStep(4); },
        });
        return;
      }

      // AUTHENTICATED CHECKOUT PATH
      const order = await ordersApi.createOrder({
        order_type: orderType === "take_away" ? "takeaway" : "dine-in",
        table_id: tableId,
        voucher_id: voucherId || undefined,
        items: cart.map((item) => ({
          menu_id: parseNumericId(item.id),
          quantity: item.quantity,
        })),
      });

      if (paymentMethod === "cash") {
        await paymentsApi.createPayment({
          order_id: order.id,
          method: "cash",
          amount: order.total_price ?? cartTotal(),
        });

        await applyVoucherIfAny(order.id);

        clearCart();
        router.push("/orders");
        toast.success("Pesanan berhasil dibuat! Silakan bayar di kasir.");
        return;
      }

      const payment = await paymentsApi.createPayment({
        order_id: order.id,
        method: "midtrans",
        amount: order.total_price ?? cartTotal(),
      });

      const snapToken = payment.snap_token;
      const snapWindow = window as Window & {
        snap?: {
          pay: (
            token: string,
            opts: {
              onSuccess?: () => void;
              onPending?: () => void;
              onError?: () => void;
              onClose?: () => void;
            },
          ) => void;
        };
      };
      const snap = snapWindow.snap;

      if (!snapToken || !snap?.pay) {
        toast.error(
          "Tidak dapat membuka popup Midtrans. Silakan muat ulang halaman.",
        );
        return;
      }

      if (payment.payment_mode === "sandbox") {
        let settled = false;
        const handleAfterPopup = async () => {
          if (settled) return;
          settled = true;
          setPaymentPanelStatus("waiting");
          const finalStatus = await pollPaymentStatus(payment.id, (state) =>
            setPaymentPanelStatus(state),
          );
          if (finalStatus === "paid") {
            setPaymentPanelStatus("success");
            await applyVoucherIfAny(order.id);
            clearCart();
            setTimeout(() => router.push("/orders"), 1500);
          } else if (finalStatus === "failed") {
            setPaymentPanelStatus("failed");
            setTimeout(() => {
              clearCart();
              router.push("/orders");
            }, 2000);
          } else {
            setPaymentPanelStatus("timeout");
            setTimeout(() => {
              clearCart();
              router.push("/orders");
            }, 2000);
          }
        };

        snap.pay(snapToken, {
          onSuccess: () => {
            handleAfterPopup();
          },
          onPending: () => {
            toast("Pembayaran sedang diproses.");
          },
          onError: () => {
            toast.error("Gagal memproses pembayaran Midtrans.");
          },
          onClose: () => {
            handleAfterPopup();
          },
        });
        return;
      }

      // Mock mode: simulate payment confirmation via the testing endpoint.
      let markPaymentPromise: Promise<void> | null = null;
      let refreshedOrder = null as Awaited<
        ReturnType<typeof ordersApi.getOrder>
      > | null;

      const markPaymentPaid = async () => {
        if (markPaymentPromise) return markPaymentPromise;

        markPaymentPromise = (async () => {
          await paymentsApi.markPaidTesting(payment.id);
          refreshedOrder = await ordersApi.getOrder(order.id);
        })();

        return markPaymentPromise;
      };

      const completeOrderFlow = async () => {
        try {
          await markPaymentPaid();
          await applyVoucherIfAny(order.id);
          clearCart();
          router.push("/orders");
          toast.success(
            "Pesanan berhasil dibuat! Mengarahkan ke halaman proses.",
          );
        } catch (err: unknown) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Gagal menandai pembayaran sebagai paid",
          );
        }
      };

      snap.pay(snapToken, {
        onSuccess: async () => {
          await completeOrderFlow();
        },
        onPending: () => {
          toast("Pembayaran sedang ditunggu. Silakan cek kembali nanti.");
        },
        onError: () => {
          toast.error("Gagal memproses pembayaran Midtrans.");
        },
        onClose: async () => {
          try {
            await markPaymentPaid();

            const fresh =
              refreshedOrder ?? (await ordersApi.getOrder(order.id));

            if (fresh.status === "order_placed") {
              await applyVoucherIfAny(order.id);
              clearCart();
              router.push("/orders");
              toast.success(
                "Pembayaran terkonfirmasi. Mengarahkan ke halaman proses.",
              );
              return;
            }
          } catch {
            // ignore network errors and show default message below
          }

          toast("Pembayaran ditutup. Silakan coba lagi.");
        },
      });

      try {
        await markPaymentPaid();
      } catch (err: unknown) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Gagal menandai pembayaran sebagai paid",
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memproses pesanan");
    } finally {
      setIsProcessing(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const paymentPanelCopy: Record<
    Exclude<PaymentPanelStatus, "idle">,
    { title: string; description: string }
  > = {
    waiting: {
      title: "Waiting for payment confirmation",
      description:
        "Pembayaran Anda sedang diproses oleh Midtrans. Mohon jangan menutup halaman ini.",
    },
    verifying: {
      title: "Verifying payment with Midtrans",
      description: "Sedang memeriksa status pembayaran Anda...",
    },
    success: {
      title: "Payment successful",
      description: "Pembayaran berhasil! Mengarahkan ke halaman pesanan.",
    },
    failed: {
      title: "Payment failed",
      description:
        "Pembayaran tidak berhasil. Anda dapat mencoba lagi dari halaman Orders.",
    },
    timeout: {
      title: "Payment timeout",
      description:
        "Konfirmasi pembayaran membutuhkan waktu lebih lama. Anda dapat mengecek status terbaru di halaman Orders.",
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Persistent payment status panel */}
      <AnimatePresence>
        {paymentPanelStatus !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm"
            >
              <Card className="border-none shadow-xl">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  {(paymentPanelStatus === "waiting" ||
                    paymentPanelStatus === "verifying") && (
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  )}
                  {paymentPanelStatus === "success" && (
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  )}
                  {(paymentPanelStatus === "failed" ||
                    paymentPanelStatus === "timeout") && (
                    <XCircle className="w-12 h-12 text-red-500" />
                  )}
                  <div>
                    <h3 className="font-bold text-lg mb-1">
                      {paymentPanelCopy[paymentPanelStatus].title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {paymentPanelCopy[paymentPanelStatus].description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      {step < 4 && (
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 pt-8 pb-4 flex items-center space-x-4 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-xl font-bold">Checkout</h1>
              <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Step {step} of 3
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="bg-primary h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          <div className="w-6" /> {/* Spacer */}
        </div>
      )}

      <div className="flex-1 p-4 md:p-8 overflow-hidden relative max-w-3xl mx-auto w-full">
        <AnimatePresence custom={1} mode="wait">
          {/* STEP 1: ORDER TYPE */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="space-y-8 w-full"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  How would you like your order?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Select your preferred dining option.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      id: "dine_in",
                      label: "Dine In",
                      icon: Utensils,
                      desc: "Eat at our Kopitiam",
                    },
                    {
                      id: "take_away",
                      label: "Take Away",
                      icon: ShoppingBag,
                      desc: "Pick up yourself",
                    },
                  ].map((type) => {
                    const Icon = type.icon;
                    const isSelected = orderType === type.id;
                    return (
                      <Card
                        key={type.id}
                        className={`cursor-pointer transition-all border-2 h-full ${isSelected ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"}`}
                        onClick={() =>
                          setOrderType(type.id as "dine_in" | "take_away")
                        }
                      >
                        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                          <div
                            className={`p-4 rounded-full ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                          >
                            <Icon className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg mb-1">
                              {type.label}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {type.desc}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <Button
                className="w-full mt-8"
                size="lg"
                disabled={!orderType}
                onClick={handleNext}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6 w-full"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {orderType === "dine_in"
                    ? "Where are you seated?"
                    : "Pickup Details"}
                </h2>

                {orderType === "dine_in" && (
                  <div className="mt-6 space-y-4">
                    <label className="block text-sm font-semibold text-muted-foreground">
                      Table Number
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 12"
                      value={tableNo}
                      onChange={(e) => setTableNo(e.target.value)}
                      className="w-full px-4 py-4 rounded-2xl bg-muted border-none text-xl outline-none focus:ring-2 focus:ring-primary text-center font-bold"
                    />
                  </div>
                )}

                {orderType === "take_away" && (
                  <div className="mt-6 p-6 bg-muted rounded-2xl text-center">
                    <ShoppingBag className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-bold mb-2">Pickup at Counter</h3>
                    <p className="text-muted-foreground text-sm">
                      We&apos;ll notify you when your order is ready for pickup.
                    </p>
                  </div>
                )}
              </div>

              {!isBackendCustomer && (
                <div className="mt-6 space-y-4 border border-border/50 rounded-2xl p-4 bg-muted/30">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    Guest Information
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-muted border-none outline-none focus:ring-2 focus:ring-primary font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 08123456789"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-muted border-none outline-none focus:ring-2 focus:ring-primary font-medium"
                    />
                  </div>
                </div>
              )}

              <Button
                className="w-full mt-8"
                size="lg"
                disabled={orderType === "dine_in" && !tableNo}
                onClick={handleNext}
              >
                Review & Confirm
              </Button>
            </motion.div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6 w-full"
            >
              <div>
                <Card className="bg-muted border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                          Voucher
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Pilih voucher Anda untuk menurunkan total pembayaran.
                        </p>
                      </div>
                      {voucherId && selectedVoucher && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVoucher()}
                        >
                          Hapus
                        </Button>
                      )}
                    </div>
                    {!isBackendCustomer ? (
                      <div className="text-sm text-muted-foreground">
                        <Link href="/login" className="text-primary underline">
                          Masuk
                        </Link>{" "}
                        untuk menggunakan voucher.
                      </div>
                    ) : loadingVouchers ? (
                      <div className="text-sm text-muted-foreground">
                        Memuat voucher...
                      </div>
                    ) : userVouchers.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        Tidak ada voucher tersedia.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {userVouchers.map((voucher) => {
                          const isSelected = voucher.id === voucherId;
                          return (
                            <div
                              key={voucher.id}
                              className="flex items-center justify-between bg-muted/70 p-3 rounded-lg"
                            >
                              <div>
                                <div className="font-mono font-bold">
                                  {voucher.code}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {voucher.expired_at
                                    ? `Berlaku sampai ${new Date(
                                        voucher.expired_at,
                                      ).toLocaleDateString("id-ID")}`
                                    : "Tidak ada tanggal kadaluarsa"}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant={isSelected ? "secondary" : "outline"}
                                onClick={() => handleSelectVoucher(voucher)}
                              >
                                {isSelected ? "Terpilih" : "Pilih"}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="mt-8 bg-muted border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                          Rewards
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Rewards are managed in the Rewards page and can be
                          redeemed during checkout.
                        </p>
                      </div>
                      {isBackendCustomer ? (
                        <Link href="/rewards">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                          >
                            Lihat Rewards
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/login">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                          >
                            Masuk untuk Rewards
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-8 bg-muted border-none shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wider">
                      Payment Method
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("midtrans")}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          paymentMethod === "midtrans"
                            ? "border-primary bg-primary/5"
                            : "border-border/50 hover:border-primary/50"
                        }`}
                      >
                        <div className="font-bold mb-1">Pay Online</div>
                        <div className="text-xs text-muted-foreground">
                          Credit card, e-wallet, or QRIS via Midtrans
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cash")}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          paymentMethod === "cash"
                            ? "border-primary bg-primary/5"
                            : "border-border/50 hover:border-primary/50"
                        }`}
                      >
                        <div className="font-bold mb-1">Pay at Cashier</div>
                        <div className="text-xs text-muted-foreground">
                          Pay with cash when your order arrives
                        </div>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-8 bg-muted border-none shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wider">
                      Order Summary
                    </h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Subtotal</span>
                      <span className="text-sm font-medium">
                        Rp {cartTotal().toLocaleString("id-ID")}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center mb-2 text-green-500">
                        <span className="text-sm">Discount</span>
                        <span className="text-sm font-medium">
                          - Rp {discount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Tax (11%)</span>
                      <span className="text-sm font-medium">
                        Rp {Math.round((cartTotal() - discount) * 0.11).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
                      <span className="font-bold">Total Payment</span>
                      <span className="text-xl font-bold text-primary">
                        Rp{" "}
                        {Math.round((cartTotal() - discount) * 1.11).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button
                className="w-full mt-4 h-14 text-lg rounded-2xl"
                size="lg"
                disabled={!paymentMethod || isProcessing}
                isLoading={isProcessing}
                onClick={handleComplete}
              >
                {paymentMethod === "cash"
                  ? "Place Order"
                  : `Confirm & Pay Rp ${Math.round((cartTotal() - discount) * 1.11).toLocaleString("id-ID")}`}
              </Button>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.2,
                }}
                className="mb-8 text-green-500"
              >
                <CheckCircle2 className="w-32 h-32" />
              </motion.div>

              {isBackendCustomer ? (
                <>
                  <h2 className="text-3xl font-bold mb-4">Order Received!</h2>
                  <p className="text-muted-foreground mb-2">
                    Order #ORD-{orderNumber}
                  </p>
                  <p className="text-muted-foreground mb-8">
                    We&apos;re preparing your food right now.
                  </p>
                  <Button
                    className="w-full max-w-xs"
                    size="lg"
                    onClick={() => router.push("/orders")}
                  >
                    Track Order
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-4">Order Placed!</h2>
                  <p className="text-muted-foreground mb-2">
                    Order #{guestOrderId}
                  </p>
                  <p className="text-muted-foreground mb-2">
                    {paymentMethod === "cash"
                      ? "Please pay at the cashier."
                      : "Payment confirmed!"}
                  </p>
                  {guestTotal > 0 && (
                    <p className="font-bold text-primary text-xl mb-2">
                      Total: Rp {guestTotal.toLocaleString("id-ID")}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                    Save your order number for reference. Sign in to earn loyalty points and track orders.
                  </p>
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    <Button
                      size="lg"
                      onClick={() => router.push("/menu")}
                    >
                      Back to Menu
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => router.push("/login")}
                    >
                      Sign In
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
