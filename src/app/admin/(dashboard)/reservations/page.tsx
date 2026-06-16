"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { Button } from "@/components/ui/Button";
import {
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Clock,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { reservationsApi } from "@/lib/api";
import type { ApiReservation } from "@/lib/api/types";

interface Reservation {
  id: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  tableNumber: number;
  capacity: number;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const mapApiReservation = (res: ApiReservation): Reservation => ({
  id: String(res.id),
  customer: res.customer_name ?? "",
  customerEmail: res.customer_email ?? "",
  customerPhone: res.customer_phone ?? "",
  tableNumber: res.table?.table_number ?? res.table_id ?? 0,
  capacity: res.table?.capacity ?? 0,
  reservationDate: res.reservation_date,
  reservationTime: res.reservation_time,
  guestCount: res.guest_count,
  status: res.status,
  createdAt: res.created_at ?? "",
  updatedAt: res.updated_at ?? "",
});

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  confirmed: "bg-green-500/10 text-green-600 border-green-200",
  completed: "bg-blue-500/10 text-blue-600 border-blue-200",
  cancelled: "bg-red-500/10 text-red-600 border-red-200",
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationsApi.listReservations();
      setReservations(data.map(mapApiReservation));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReservations();
  }, [fetchReservations]);

  const handleAction = async (
    reservationId: string,
    action: "confirm" | "complete" | "cancel",
  ) => {
    try {
      setActionLoading(true);
      const status =
        action === "cancel"
          ? "cancelled"
          : action === "confirm"
            ? "confirmed"
            : "completed";
      await reservationsApi.updateReservationStatus(
        Number(reservationId),
        status,
      );

      toast.success(`Reservation ${action}ed successfully`);
      await fetchReservations();
      setSelectedReservation(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update reservation",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const filteredReservations = reservations.filter((res) => {
    const matchesFilter = filter === "all" || res.status === filter;
    const matchesSearch =
      res.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = [
    {
      label: "Pending",
      value: reservations.filter((r) => r.status === "pending").length,
      icon: Clock,
      iconBgClass: "bg-yellow-100 dark:bg-yellow-900/20",
      iconColorClass: "text-yellow-600",
    },
    {
      label: "Confirmed",
      value: reservations.filter((r) => r.status === "confirmed").length,
      icon: CheckCircle2,
      iconBgClass: "bg-green-100 dark:bg-green-900/20",
      iconColorClass: "text-green-600",
    },
    {
      label: "Completed",
      value: reservations.filter((r) => r.status === "completed").length,
      icon: ClipboardCheck,
      iconBgClass: "bg-blue-100 dark:bg-blue-900/20",
      iconColorClass: "text-blue-600",
    },
    {
      label: "Cancelled",
      value: reservations.filter((r) => r.status === "cancelled").length,
      icon: XCircle,
      iconBgClass: "bg-red-100 dark:bg-red-900/20",
      iconColorClass: "text-red-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Reservation Management
          </h1>
          <p className="text-muted-foreground">
            Manage customer table reservations
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <AnalyticsCard
              key={i}
              title={stat.label}
              value={stat.value}
              icon={stat.icon}
              iconBgClass={stat.iconBgClass}
              iconColorClass={stat.iconColorClass}
            />
          ))}
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div variants={itemVariants}>
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">
                  {error}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchReservations}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search and Filter */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "pending", "confirmed", "completed", "cancelled"].map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setFilter(s)}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-all border text-sm",
                        filter === s
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-muted hover:border-primary",
                      )}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ),
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reservations Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-md overflow-hidden">
          {loading ? (
            <CardContent className="p-12 flex justify-center">
              <Loader2 className="animate-spin w-8 h-8" />
            </CardContent>
          ) : filteredReservations.length === 0 ? (
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground font-medium">
                No reservations found
              </p>
            </CardContent>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-3 text-left font-semibold">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left font-semibold">Table</th>
                    <th className="px-6 py-3 text-left font-semibold">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left font-semibold">
                      Guests
                    </th>
                    <th className="px-6 py-3 text-left font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((res) => (
                    <motion.tr
                      key={res.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{res.customer}</p>
                          <p className="text-xs text-muted-foreground">
                            {res.customerEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold">#{res.tableNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {res.capacity} seats
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{res.reservationDate}</p>
                        <p className="text-xs text-muted-foreground">
                          {res.reservationTime}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{res.guestCount} guests</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium border",
                            statusColors[
                              res.status as keyof typeof statusColors
                            ],
                          )}
                        >
                          {res.status.charAt(0).toUpperCase() +
                            res.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedReservation(res)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReservation(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="border-none rounded-none">
                <CardHeader className="border-b flex flex-row items-center justify-between">
                  <CardTitle>
                    Reservation #
                    {selectedReservation.id.slice(0, 8).toUpperCase()}
                  </CardTitle>
                  <button
                    onClick={() => setSelectedReservation(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">
                          {selectedReservation.customer}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-sm">
                          {selectedReservation.customerEmail}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">
                          {selectedReservation.customerPhone || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Guests</p>
                        <p className="font-medium">
                          {selectedReservation.guestCount} people
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reservation Info */}
                  <div className="space-y-3 pt-6 border-t">
                    <h3 className="font-semibold">Reservation Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">
                          {selectedReservation.reservationDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-medium">
                          {selectedReservation.reservationTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Table</p>
                        <p className="font-medium">
                          #{selectedReservation.tableNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Capacity
                        </p>
                        <p className="font-medium">
                          {selectedReservation.capacity} seats
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium">
                          {selectedReservation.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-sm font-medium">
                          {new Date(
                            selectedReservation.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 border-t space-y-3">
                    <h3 className="font-semibold">Actions</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedReservation.status === "pending" && (
                        <>
                          <Button
                            onClick={() =>
                              handleAction(selectedReservation.id, "confirm")
                            }
                            disabled={actionLoading}
                            className="gap-2 bg-green-600 hover:bg-green-700"
                          >
                            {actionLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Confirm Reservation
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() =>
                              handleAction(selectedReservation.id, "cancel")
                            }
                            disabled={actionLoading}
                            variant="destructive"
                            className="gap-2"
                          >
                            {actionLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                Cancel Reservation
                              </>
                            )}
                          </Button>
                        </>
                      )}

                      {selectedReservation.status === "confirmed" && (
                        <>
                          <Button
                            onClick={() =>
                              handleAction(selectedReservation.id, "complete")
                            }
                            disabled={actionLoading}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                          >
                            {actionLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Mark as Completed
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() =>
                              handleAction(selectedReservation.id, "cancel")
                            }
                            disabled={actionLoading}
                            variant="destructive"
                            className="gap-2"
                          >
                            {actionLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                Cancel Reservation
                              </>
                            )}
                          </Button>
                        </>
                      )}

                      {(selectedReservation.status === "completed" ||
                        selectedReservation.status === "cancelled") && (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">
                            This reservation is{" "}
                            {selectedReservation.status === "completed"
                              ? "completed"
                              : "cancelled"}
                            .
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setSelectedReservation(null)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
