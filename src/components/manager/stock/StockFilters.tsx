import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface StockFiltersProps {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  categoryOptions: string[];
}

export function StockFilters({
  searchTerm, setSearchTerm,
  categoryFilter, setCategoryFilter,
  statusFilter, setStatusFilter,
  categoryOptions
}: StockFiltersProps) {

  const hasActiveFilters = categoryFilter !== "All" || statusFilter !== "All";

  const clearFilters = () => {
    setCategoryFilter("All");
    setStatusFilter("All");
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search items or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm bg-background border border-border/50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Categories</option>
            {categoryOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-background border border-border/50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Statuses</option>
            <option value="Good">Good</option>
            <option value="Low">Low</option>
            <option value="Out of Stock">Out of Stock</option>
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
