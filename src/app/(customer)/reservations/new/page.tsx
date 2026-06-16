"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  Users,
  Armchair,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { reservationsApi, tablesApi } from "@/lib/api";
import type { ApiTable } from "@/lib/api/types";
import { useAuthStore } from "@/store/useAuthStore";

type Table = ApiTable;

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

export default function NewReservationPage() {
  const { status } = useSession();
  const router = useRouter();
  const apiUser = useAuthStore((state) => state.user);
  const apiPortal = useAuthStore((state) => state.portal);
  const apiAccessToken = useAuthStore((state) => state.accessToken);
  const isLoggedIn =
    status === "authenticated" ||
    Boolean(apiUser && apiPortal === "customer" && apiAccessToken);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [time, setTime] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  const fetchAvailableTables = useCallback(async () => {
    if (!date || !time) return;

    try {
      setLoading(true);
      setError(null);
      const data = await tablesApi.listAvailableTables(date, time, guestCount);
      setAvailableTables(data);
      setSelectedTable(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to load available tables");
    } finally {
      setLoading(false);
    }
  }, [date, time, guestCount]);

  const goToStep = async (nextStep: number) => {
    if (nextStep === 4) {
      await fetchAvailableTables();
    }
    setStep(nextStep);
  };

  const handleCreateReservation = async () => {
    if (!selectedTable) {
      toast.error("Please select a table");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        table_id: Number(selectedTable),
        reservation_date: date,
        reservation_time: time,
        guest_count: guestCount,
        customer_name: apiUser?.name || "",
        customer_email: apiUser?.email || "",
        customer_phone: apiUser?.phone || "",
      };

      console.log("Selected table", selectedTable);
      console.log("Reservation payload", payload);

      // Ensure table_id is an integer (backend expects integer TableID)
      if (!Number.isInteger(payload.table_id)) {
        console.warn(
          "table_id is not an integer, coercing to integer:",
          payload.table_id,
        );
        payload.table_id = Number(payload.table_id);
      }

      await reservationsApi.createReservation(payload);

      toast.success("Reservation created successfully!");
      setStep(6); // Show success screen
      setTimeout(() => {
        router.push("/reservations");
      }, 2000);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create reservation",
      );
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 max-w-2xl mx-auto"
      >
        {/* Back Button */}
        {step < 6 && (
          <motion.div variants={itemVariants}>
            <Link href="/reservations">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Progress Indicator */}
        {step < 6 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                      s === step
                        ? "bg-primary text-primary-foreground"
                        : s < step
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {s < step ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 5 && (
                    <div
                      className={cn(
                        "w-8 h-1 transition-all",
                        s < step ? "bg-green-500" : "bg-muted",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Select Date */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={itemVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    Select Date
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                  />
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!date}
                    className="w-full gap-2"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Select Time */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={itemVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Select Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setTime(slot)}
                        className={cn(
                          "py-2 px-3 rounded-lg border font-medium transition-all",
                          time === slot
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-muted hover:border-primary",
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!time}
                      className="flex-1 gap-2"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Select Guest Count */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={itemVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Number of Guests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      className="rounded-full w-12 h-12"
                    >
                      −
                    </Button>
                    <span className="text-4xl font-bold w-16 text-center">
                      {guestCount}
                    </span>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setGuestCount(guestCount + 1)}
                      className="rounded-full w-12 h-12"
                    >
                      +
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button
                      onClick={() => {
                        void goToStep(4);
                      }}
                      className="flex-1 gap-2"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Select Table */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={itemVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Armchair className="w-5 h-5" />
                    Select Table
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Available tables for {guestCount} guests on {date} at {time}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin w-8 h-8" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-red-600 font-medium">{error}</p>
                    </div>
                  ) : availableTables.length === 0 ? (
                    <div className="text-center py-8">
                      <Armchair className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground font-medium">
                        No tables available for this time
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="mt-4"
                      >
                        Change Time
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableTables.map((table) => (
                          <button
                            key={table.id}
                            onClick={() => setSelectedTable(table.id)}
                            className={cn(
                              "p-4 rounded-lg border-2 transition-all text-left",
                              selectedTable === table.id
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-primary",
                            )}
                          >
                            <p className="font-semibold">
                              Table #{table.table_number}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Capacity: {table.capacity ?? "—"} seats
                            </p>
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setStep(3)}
                          className="flex-1"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <Button
                          onClick={() => setStep(5)}
                          disabled={!selectedTable}
                          className="flex-1 gap-2"
                        >
                          Next <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 5: Confirm */}
          {step === 5 && (
            <motion.div
              key="step5"
              variants={itemVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Confirm Reservation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-semibold">{date}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-semibold">{time}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Guests</span>
                      <span className="font-semibold">{guestCount} people</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Table</span>
                      <span className="font-semibold">
                        #
                        {
                          availableTables.find((t) => t.id === selectedTable)
                            ?.table_number
                        }
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      Your reservation is free! It will be pending confirmation
                      from our staff.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(4)}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button
                      onClick={handleCreateReservation}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Reserve Table"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 6: Success */}
          {step === 6 && (
            <motion.div
              key="step6"
              variants={itemVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              <Card>
                <CardContent className="p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Reservation Created!</h2>
                  <p className="text-muted-foreground">
                    Your reservation has been submitted successfully.
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-4 text-left">
                    <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                      Status: Pending
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Please wait for confirmation from our staff. You will be
                      notified once your reservation is confirmed.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push("/reservations")}
                    className="w-full"
                  >
                    View My Reservations
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
