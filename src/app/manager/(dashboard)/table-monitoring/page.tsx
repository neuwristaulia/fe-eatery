"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Armchair,
  Users,
  CalendarDays,
  Loader2,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { reservationsApi, tablesApi, type ApiTable } from "@/lib/api";

interface TodayReservation {
  id: string;
  customerName: string;
  tableNumber: number;
  capacity: number;
  reservationTime: string;
  guestCount: number;
  status: string;
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  confirmed: "bg-green-500/10 text-green-600 border-green-200",
  completed: "bg-blue-500/10 text-blue-600 border-blue-200",
  cancelled: "bg-red-500/10 text-red-600 border-red-200",
};

const TABLE_STATUSES = ["available", "occupied", "reserved"];

export default function TableMonitoringPage() {
  const [reservations, setReservations] = useState<TodayReservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [reservationError, setReservationError] = useState<string | null>(null);

  const [tables, setTables] = useState<ApiTable[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editCapacity, setEditCapacity] = useState("");

  const fetchTables = useCallback(async () => {
    try {
      setIsLoadingTables(true);
      setTableError(null);
      const data = await tablesApi.listTables();
      setTables(data.sort((a, b) => a.table_number - b.table_number));
    } catch (err) {
      setTableError(err instanceof Error ? err.message : "Failed to load tables");
    } finally {
      setIsLoadingTables(false);
    }
  }, []);

  const fetchTodayReservations = useCallback(async () => {
    try {
      setLoadingReservations(true);
      setReservationError(null);
      const data = await reservationsApi.listReservations();

      const today = new Date().toISOString().split("T")[0];
      const todayReservations = data
        .filter(
          (res) => res.reservation_date === today && res.status !== "cancelled",
        )
        .sort((a, b) => a.reservation_time.localeCompare(b.reservation_time))
        .map((res) => ({
          id: String(res.id),
          customerName: res.customer_name,
          tableNumber: res.table?.table_number ?? res.table_id ?? 0,
          capacity: res.table?.capacity ?? 0,
          reservationTime: res.reservation_time,
          guestCount: res.guest_count,
          status: res.status,
        }));

      setReservations(todayReservations);
    } catch (err) {
      setReservationError(
        err instanceof Error ? err.message : "Failed to load reservations",
      );
    } finally {
      setLoadingReservations(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTables();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTodayReservations();
  }, [fetchTables, fetchTodayReservations]);

  const handleStatusChange = async (table: ApiTable, status: string) => {
    setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, status } : t)));
    try {
      await tablesApi.updateTableStatus(table.id, status);
    } catch {
      setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, status: table.status } : t)));
    }
  };

  const handleCreate = async () => {
    const tableNumber = parseInt(newTableNumber, 10);
    const capacity = parseInt(newCapacity, 10);
    if (!tableNumber || !capacity || capacity < 1) return;

    setIsSaving(true);
    try {
      const created = await tablesApi.createTable({ table_number: tableNumber, capacity });
      setTables((prev) => [...prev, created].sort((a, b) => a.table_number - b.table_number));
      setNewTableNumber("");
      setNewCapacity("");
      setShowAddForm(false);
    } catch (err) {
      setTableError(err instanceof Error ? err.message : "Failed to create table");
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (table: ApiTable) => {
    setEditingId(table.id);
    setEditNumber(String(table.table_number));
    setEditCapacity(String(table.capacity ?? ""));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNumber("");
    setEditCapacity("");
  };

  const handleSaveEdit = async (id: number) => {
    const tableNumber = parseInt(editNumber, 10);
    const capacity = parseInt(editCapacity, 10);
    if (!tableNumber || !capacity || capacity < 1) return;

    setIsSaving(true);
    try {
      const updated = await tablesApi.updateTable(id, { table_number: tableNumber, capacity });
      setTables((prev) =>
        prev.map((t) => (t.id === id ? updated : t)).sort((a, b) => a.table_number - b.table_number),
      );
      cancelEdit();
    } catch (err) {
      setTableError(err instanceof Error ? err.message : "Failed to update table");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (table: ApiTable) => {
    if (!confirm(`Delete table T-${table.table_number}? This cannot be undone.`)) return;
    try {
      await tablesApi.deleteTable(table.id);
      setTables((prev) => prev.filter((t) => t.id !== table.id));
    } catch (err) {
      setTableError(err instanceof Error ? err.message : "Failed to delete table");
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight flex items-center gap-2">
            <Armchair className="w-8 h-8 text-primary" /> Table Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Live overview of cafe seating and table turnover.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddForm((v) => !v)}>
          <Plus className="w-4 h-4" /> Add Table
        </Button>
      </div>

      {tableError && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-900 dark:text-red-100">{tableError}</p>
          </CardContent>
        </Card>
      )}

      {showAddForm && (
        <Card className="bg-card border-border/50 shadow-sm">
          <CardContent className="p-4 flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Table Number</label>
              <input
                type="number"
                min={1}
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                className="w-32 px-3 py-2 rounded-lg border border-border/50 bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="e.g. 13"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Capacity</label>
              <input
                type="number"
                min={1}
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                className="w-32 px-3 py-2 rounded-lg border border-border/50 bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="e.g. 4"
              />
            </div>
            <Button onClick={handleCreate} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" /> Save
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)} className="gap-2 bg-card border-border/50">
              <X className="w-4 h-4" /> Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div> Available
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div> Occupied
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div> Reserved
        </div>
      </div>

      <Card className="bg-card/50 border-border/50 shadow-sm p-6">
        {isLoadingTables ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : tables.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No tables found. Add one to get started.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
            {tables.map((table) => {
              const isEditing = editingId === table.id;
              return (
                <div
                  key={table.id}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center space-y-2 transition-transform
                    ${
                      table.status === "available"
                        ? "border-green-500/30 bg-green-500/5"
                        : table.status === "occupied"
                          ? "border-red-500/50 bg-red-500/10"
                          : "border-yellow-500/50 bg-yellow-500/10"
                    }
                  `}
                >
                  {isEditing ? (
                    <div className="w-full space-y-2">
                      <input
                        type="number"
                        min={1}
                        value={editNumber}
                        onChange={(e) => setEditNumber(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-border/50 bg-background text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                      <input
                        type="number"
                        min={1}
                        value={editCapacity}
                        onChange={(e) => setEditCapacity(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-border/50 bg-background text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                      <div className="flex gap-1 justify-center">
                        <Button size="sm" disabled={isSaving} onClick={() => handleSaveEdit(table.id)} className="gap-1 px-2">
                          <Save className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit} className="gap-1 px-2 bg-card border-border/50">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold">T-{table.table_number}</h3>
                      <Users
                        className={`w-8 h-8 opacity-50 ${table.status === "occupied" ? "text-red-500" : ""}`}
                      />
                      <div className="text-center">
                        {table.capacity != null && (
                          <p className="text-xs text-muted-foreground mb-1">{table.capacity} seats</p>
                        )}
                        <select
                          value={table.status}
                          onChange={(e) => handleStatusChange(table, e.target.value)}
                          className={`text-xs font-bold uppercase tracking-wider bg-transparent border-none outline-none cursor-pointer text-center
                            ${
                              table.status === "available"
                                ? "text-green-500"
                                : table.status === "occupied"
                                  ? "text-red-500"
                                  : "text-yellow-500"
                            }`}
                        >
                          {TABLE_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(table)} className="gap-1 px-2 bg-card border-border/50">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(table)} className="gap-1 px-2 bg-card border-border/50 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Today's Reservations Section */}
      <div>
        <h2 className="text-2xl font-serif font-bold tracking-tight flex items-center gap-2 mb-4">
          <CalendarDays className="w-6 h-6 text-primary" /> Today&apos;s
          Reservations
        </h2>

        {reservationError && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 mb-4">
            <CardContent className="p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-900 dark:text-red-100">
                {reservationError}
              </p>
            </CardContent>
          </Card>
        )}

        {loadingReservations ? (
          <Card className="bg-card/50 border-border/50 shadow-sm">
            <CardContent className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </CardContent>
          </Card>
        ) : reservations.length === 0 ? (
          <Card className="bg-card/50 border-border/50 shadow-sm border-dashed">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground font-medium">
                No reservations for today
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/50 border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-6 py-3 text-left font-semibold">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Table
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Capacity
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Guests
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((res) => (
                      <tr
                        key={res.id}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium">
                          {res.reservationTime}
                        </td>
                        <td className="px-6 py-4">{res.customerName}</td>
                        <td className="px-6 py-4 font-semibold">
                          #{res.tableNumber}
                        </td>
                        <td className="px-6 py-4">{res.capacity} seats</td>
                        <td className="px-6 py-4">{res.guestCount} guests</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
