import { Search, Filter, Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TransactionFiltersProps {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  methodFilter: string;
  setMethodFilter: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  typeFilter: string;
  setTypeFilter: (s: string) => void;
  dateFilter: string;
  setDateFilter: (s: string) => void;
  typeOptions: string[];
  methodOptions: string[];
  statusOptions: string[];
}

export function TransactionFilters({
  searchTerm, setSearchTerm,
  methodFilter, setMethodFilter,
  statusFilter, setStatusFilter,
  typeFilter, setTypeFilter,
  dateFilter, setDateFilter,
  typeOptions, methodOptions, statusOptions
}: TransactionFiltersProps) {

  const hasActiveFilters = methodFilter !== "All" || statusFilter !== "All" || typeFilter !== "All" || dateFilter !== "";

  const clearFilters = () => {
    setMethodFilter("All");
    setStatusFilter("All");
    setTypeFilter("All");
    setDateFilter("");
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Payment ID, Order ID, or Customer Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Date Filter */}
        <div className="relative w-full md:w-auto">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full md:w-[200px] pl-10 pr-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none min-h-[44px]"
          />
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filters:</span>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm bg-background border border-border/50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Order Types</option>
            {typeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-sm bg-background border border-border/50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Payment Methods</option>
            {methodOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-background border border-border/50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Statuses</option>
            {statusOptions.map((opt) => (
              <option key={opt} value={opt} className="capitalize">{opt}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-red-500 gap-1 h-8 px-2">
            <X className="w-4 h-4" /> Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
