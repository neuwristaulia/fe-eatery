"use client";

import * as React from "react";
import { DataTable } from "@/components/manager/ui/DataTable";
import { Users, Award, Medal, Filter } from "lucide-react";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { usersApi, type ApiCustomerLoyalty } from "@/lib/api";

export default function CustomerLoyaltyPage() {
  const [customers, setCustomers] = React.useState<ApiCustomerLoyalty[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [levelFilter, setLevelFilter] = React.useState("All");

  React.useEffect(() => {
    let mounted = true;
    usersApi
      .getCustomerLoyaltyList()
      .then((data) => {
        if (mounted) setCustomers(data);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredCustomers = React.useMemo(() => {
    if (levelFilter === "All") return customers;
    return customers.filter((c) => c.tier === levelFilter);
  }, [customers, levelFilter]);

  const goldCount = customers.filter((c) => c.tier === "Gold").length;
  const silverCount = customers.filter((c) => c.tier === "Silver").length;
  const bronzeCount = customers.filter((c) => c.tier === "Bronze").length;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" /> Customer Loyalty
        </h1>
        <p className="text-muted-foreground mt-1">Track customer points, membership tiers, and order activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard title="Total Members" value={customers.length} icon={Users} />
        <AnalyticsCard title="Gold Members" value={goldCount} icon={Award} iconColorClass="text-yellow-600" iconBgClass="bg-yellow-500/10" />
        <AnalyticsCard title="Silver Members" value={silverCount} icon={Medal} iconColorClass="text-slate-500" iconBgClass="bg-slate-300/20" />
        <AnalyticsCard title="Bronze Members" value={bronzeCount} icon={Medal} iconColorClass="text-orange-700" iconBgClass="bg-orange-700/10" />
      </div>

      <DataTable
        title="Customer Loyalty"
        description="Customers sorted by total points"
        actionNode={
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="text-sm bg-background border border-border/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
            >
              <option value="All">All Tiers</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
            </select>
          </div>
        }
        columns={[
          { header: "Customer", accessorKey: "name" },
          { header: "Points", accessorKey: "points" },
          {
            header: "Tier",
            accessorKey: "tier",
            cell: (row: ApiCustomerLoyalty) => (
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold
                ${row.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-600' :
                  row.tier === 'Silver' ? 'bg-slate-300/20 text-slate-500' :
                  'bg-orange-700/20 text-orange-700'}`}
              >
                {row.tier}
              </span>
            )
          },
          { header: "Total Orders", accessorKey: "total_orders" },
        ]}
        data={isLoading ? [] : filteredCustomers}
      />
    </div>
  );
}
