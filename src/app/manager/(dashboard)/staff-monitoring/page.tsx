"use client";

import * as React from "react";
import { DataTable } from "@/components/manager/ui/DataTable";
import { UserSquare2, UserCheck } from "lucide-react";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { usersApi, type ApiUser } from "@/lib/api";

export default function StaffMonitoringPage() {
  const [staff, setStaff] = React.useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    usersApi
      .listUsers()
      .then((data) => {
        if (mounted) setStaff(data.filter((u) => u.role_id === 4));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleStatusChange = (id: number, status: string) => {
    const previous = staff.find((u) => u.id === id)?.status;
    setStaff((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    usersApi.updateUser(id, { status }).catch(() => {
      setStaff((prev) => prev.map((u) => (u.id === id ? { ...u, status: previous } : u)));
    });
  };

  const handleShiftChange = (id: number, staff_shift: string) => {
    const previous = staff.find((u) => u.id === id)?.staff_shift;
    setStaff((prev) => prev.map((u) => (u.id === id ? { ...u, staff_shift } : u)));
    usersApi.updateUser(id, { staff_shift }).catch(() => {
      setStaff((prev) => prev.map((u) => (u.id === id ? { ...u, staff_shift: previous } : u)));
    });
  };

  const activeCount = staff.filter((u) => u.status === "active").length;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight flex items-center gap-2">
          <UserSquare2 className="w-8 h-8 text-primary" /> Staff Monitoring
        </h1>
        <p className="text-muted-foreground mt-1">Track staff status, shifts, and login activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard title="Total Staff" value={staff.length} icon={UserSquare2} />
        <AnalyticsCard title="Active Staff" value={`${activeCount}/${staff.length}`} icon={UserCheck} />
      </div>

      <DataTable
        title="Staff Monitoring"
        columns={[
          { header: "Staff ID", accessorKey: "id", cell: (row: ApiUser) => `STF-${row.id}` },
          { header: "Name", accessorKey: "name" },
          { header: "Role", accessorKey: "role", cell: (row: ApiUser) => row.role?.name || "Staff" },
          {
            header: "Status",
            accessorKey: "status",
            cell: (row: ApiUser) => (
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                ${row.status === "active" ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}`}
              >
                <select
                  value={row.status || "inactive"}
                  onChange={(e) => handleStatusChange(row.id, e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer capitalize"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </span>
            ),
          },
          {
            header: "Shift",
            accessorKey: "staff_shift",
            cell: (row: ApiUser) => (
              <select
                value={row.staff_shift || "morning"}
                onChange={(e) => handleShiftChange(row.id, e.target.value)}
                className="text-sm bg-background border border-border/50 rounded-lg px-2 py-1 capitalize focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value="morning">Morning</option>
                <option value="night">Night</option>
              </select>
            ),
          },
          {
            header: "Last Login",
            accessorKey: "last_login",
            cell: (row: ApiUser) => (row.last_login ? new Date(row.last_login).toLocaleString("id-ID") : "-"),
          },
        ]}
        data={isLoading ? [] : staff}
        searchPlaceholder="Search staff name or role..."
      />
    </div>
  );
}
