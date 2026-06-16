"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/Card";
import { Armchair, Users } from "lucide-react";
import { useStaffStore } from "@/store/useStaffStore";

const STATUS_OPTIONS = ["available", "occupied", "reserved"] as const;

export default function StaffTablesPage() {
  const { tables, fetchStaffData, updateTableStatusOnApi } = useStaffStore();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStaffData();
  }, [fetchStaffData]);

  const handleStatusChange = async (
    id: string,
    status: (typeof STATUS_OPTIONS)[number],
  ) => {
    const ok = await updateTableStatusOnApi(id, status);
    if (ok) {
      toast.success("Table status updated");
    } else {
      toast.error("Failed to update table status");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Cafe Tables
        </h1>
        <p className="text-muted-foreground">
          Update the status of each dine-in table.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-sm">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          <span className="text-sm">Reserved</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map((table, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={table.id}
          >
            <Card
              className={`border-none shadow-md overflow-hidden relative ${
                table.status === "available"
                  ? "bg-card"
                  : table.status === "occupied"
                    ? "bg-red-500/10 border-2 border-red-500/50"
                    : table.status === "reserved"
                      ? "bg-orange-500/10 border-2 border-orange-500/50"
                      : "bg-muted"
              }`}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <Armchair
                  className={`w-8 h-8 ${
                    table.status === "available"
                      ? "text-green-500"
                      : table.status === "occupied"
                        ? "text-red-500"
                        : table.status === "reserved"
                          ? "text-orange-500"
                          : "text-muted-foreground"
                  }`}
                />
                <h3 className="font-bold text-lg leading-tight">
                  Table {table.number}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" /> {table.capacity} pax
                </p>
                <select
                  value={table.status}
                  onChange={(e) =>
                    handleStatusChange(
                      table.id,
                      e.target.value as (typeof STATUS_OPTIONS)[number],
                    )
                  }
                  className="w-full text-xs px-2 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 capitalize"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
