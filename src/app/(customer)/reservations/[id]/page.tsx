"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Users,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { reservationsApi } from "@/lib/api";
import type { ApiReservation } from "@/lib/api/types";
import { useAuthStore } from "@/store/useAuthStore";

type Reservation = ApiReservation;

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  confirmed: "bg-green-500/10 text-green-600 border-green-200",
  completed: "bg-blue-500/10 text-blue-600 border-blue-200",
  cancelled: "bg-red-500/10 text-red-600 border-red-200",
};

export default function ReservationDetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id as string;
  const apiUser = useAuthStore((state) => state.user);
  const apiPortal = useAuthStore((state) => state.portal);
  const apiAccessToken = useAuthStore((state) => state.accessToken);
  const isLoggedIn =
    status === "authenticated" ||
    Boolean(apiUser && apiPortal === "customer" && apiAccessToken);

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchReservation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationsApi.getReservation(reservationId);
      setReservation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to load reservation");
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (isLoggedIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchReservation();
    }
  }, [isLoggedIn, router, reservationId, fetchReservation]);

  const handleCancel = async () => {
    if (
      !reservation ||
      (reservation.status !== "pending" && reservation.status !== "confirmed")
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this reservation?",
    );
    if (!confirmed) return;

    try {
      setCancelling(true);
      await reservationsApi.cancelReservation(reservationId);
      toast.success("Reservation cancelled successfully");
      await fetchReservation();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to cancel reservation",
      );
    } finally {
      setCancelling(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <motion.div className="space-y-6 max-w-2xl mx-auto">
          <Link href="/reservations">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Reservations
            </Button>
          </Link>
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">
                  {error || "Reservation not found"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="mt-2"
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const canCancel =
    reservation.status === "pending" || reservation.status === "confirmed";

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 max-w-2xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Link href="/reservations">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Reservations
            </Button>
          </Link>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>
                    Reservation #
                    {String(reservation.id).slice(0, 8).toUpperCase()}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Created{" "}
                    {reservation.created_at
                      ? new Date(reservation.created_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium border",
                    statusColors[
                      reservation.status as keyof typeof statusColors
                    ],
                  )}
                >
                  {reservation.status.charAt(0).toUpperCase() +
                    reservation.status.slice(1)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Table Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Table Number
                  </p>
                  <p className="text-3xl font-bold">
                    #{reservation.table?.table_number ?? reservation.table_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Capacity</p>
                  <p className="text-3xl font-bold">
                    {reservation.table?.capacity != null
                      ? `${reservation.table.capacity} Seats`
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Reservation Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Reservation Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {reservation.reservation_date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">
                        {reservation.reservation_time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Guests</p>
                      <p className="font-medium">
                        {reservation.guest_count} people
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-semibold text-lg">Customer Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{reservation.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-blue-600">
                      {reservation.customer_email}
                    </p>
                  </div>
                  {reservation.customer_phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">
                        {reservation.customer_phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Message */}
              {reservation.status === "completed" && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Reservation Completed
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Thank you for visiting our cafe! We hope you had a great
                      experience.
                    </p>
                  </div>
                </div>
              )}

              {reservation.status === "pending" && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-900 dark:text-yellow-100">
                    Your reservation is pending confirmation. Please wait for
                    our staff to confirm.
                  </p>
                </div>
              )}

              {reservation.status === "confirmed" && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    Your reservation has been confirmed. We look forward to
                    serving you!
                  </p>
                </div>
              )}

              {reservation.status === "cancelled" && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-900 dark:text-red-100">
                    This reservation has been cancelled.
                  </p>
                </div>
              )}

              {/* Actions */}
              {canCancel && (
                <div className="flex gap-3 pt-6 border-t">
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="flex-1"
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Reservation"
                    )}
                  </Button>
                  <Link href="/reservations" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Back to List
                    </Button>
                  </Link>
                </div>
              )}

              {!canCancel && (
                <div className="pt-6 border-t">
                  <Link href="/reservations" className="block">
                    <Button variant="outline" className="w-full">
                      Back to Reservations
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
