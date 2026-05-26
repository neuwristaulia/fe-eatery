"use client";

import * as React from "react";
import { Wallet, CreditCard, Banknote, Smartphone, CheckCircle, XCircle } from "lucide-react";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { TransactionTable } from "@/components/manager/payments/TransactionTable";
import { TransactionFilters } from "@/components/manager/payments/TransactionFilters";
import { TransactionDetailModal } from "@/components/manager/payments/TransactionDetailModal";
import { ExportButton } from "@/components/manager/payments/ExportButton";
import { TransactionDetail } from "@/types/payment";

// Extended Mock Data for comprehensive testing
const mockTransactions: TransactionDetail[] = [
  { 
    id: "PAY-901", orderId: "ORD-120", customerName: "Ahmad", orderType: "Dine In", paymentMethod: "QRIS", amount: 120000, status: "Success", date: "2026-05-24 19:35",
    tableNumber: "T-05", subtotal: 109091, tax: 10909, loyaltyPointsEarned: 120,
    items: [{ id: "i1", name: "Kopi e-Eatery Signature", quantity: 2, price: 30000 }, { id: "i2", name: "Kaya Toast", quantity: 1, price: 60000 }],
    timeline: [
      { status: "Pending", timestamp: "2026-05-24 19:30", note: "Order placed" },
      { status: "Success", timestamp: "2026-05-24 19:35", note: "QRIS payment confirmed" }
    ]
  },
  { 
    id: "PAY-902", orderId: "ORD-121", customerName: "Sarah", orderType: "Take Away", paymentMethod: "Cash", amount: 85000, status: "Success", date: "2026-05-24 19:46",
    subtotal: 77273, tax: 7727,
    items: [{ id: "i3", name: "Nasi Goreng Spesial", quantity: 1, price: 85000 }],
    timeline: [
      { status: "Pending", timestamp: "2026-05-24 19:45" },
      { status: "Success", timestamp: "2026-05-24 19:46", note: "Paid at cashier" }
    ]
  },
  { 
    id: "PAY-903", orderId: "ORD-122", customerName: "Budi", orderType: "Dine In", paymentMethod: "Debit/Credit", amount: 210000, status: "Success", date: "2026-05-24 20:05",
    tableNumber: "T-12", subtotal: 190909, tax: 19091, voucherUsed: "WELCOME10",
    items: [{ id: "i4", name: "Ribeye Steak", quantity: 1, price: 210000 }],
    timeline: [
      { status: "Pending", timestamp: "2026-05-24 20:00" },
      { status: "Success", timestamp: "2026-05-24 20:05", note: "Card ending in 4021" }
    ]
  },
  { 
    id: "PAY-904", orderId: "ORD-124", customerName: "Citra", orderType: "Pickup", paymentMethod: "E-Wallet", amount: 340000, status: "Failed", date: "2026-05-24 20:32",
    subtotal: 309091, tax: 30909,
    items: [{ id: "i5", name: "Family Package A", quantity: 1, price: 340000 }],
    timeline: [
      { status: "Pending", timestamp: "2026-05-24 20:30" },
      { status: "Failed", timestamp: "2026-05-24 20:32", note: "Payment gateway timeout" }
    ]
  },
  { 
    id: "PAY-890", orderId: "ORD-099", customerName: "Deni", orderType: "Dine In", paymentMethod: "Cash", amount: 150000, status: "Cancelled", date: "2026-05-23 14:20",
    tableNumber: "T-02", subtotal: 136364, tax: 13636,
    items: [{ id: "i6", name: "Ayam Bakar", quantity: 2, price: 75000 }],
    timeline: [
      { status: "Pending", timestamp: "2026-05-23 14:15" },
      { status: "Cancelled", timestamp: "2026-05-23 14:20", note: "Customer left before paying" }
    ]
  },
];

export default function PaymentMonitoringPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [methodFilter, setMethodFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [typeFilter, setTypeFilter] = React.useState("All");
  const [dateFilter, setDateFilter] = React.useState("");
  
  const [selectedTx, setSelectedTx] = React.useState<TransactionDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Simulate network request
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredTransactions = React.useMemo(() => {
    return mockTransactions.filter(tx => {
      const matchSearch = 
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tx.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchMethod = methodFilter === "All" || tx.paymentMethod === methodFilter;
      const matchStatus = statusFilter === "All" || tx.status === statusFilter;
      const matchType = typeFilter === "All" || tx.orderType === typeFilter;
      const matchDate = !dateFilter || tx.date.startsWith(dateFilter);

      return matchSearch && matchMethod && matchStatus && matchType && matchDate;
    });
  }, [searchTerm, methodFilter, statusFilter, typeFilter, dateFilter]);

  // Analytics Calculations based on filtered data (or all data, depending on requirement)
  // For monitoring, usually summary reflects the *filtered* view to help analysis
  const totalRevenue = filteredTransactions
    .filter(t => t.status === "Success")
    .reduce((sum, t) => sum + t.amount, 0);

  const successCount = filteredTransactions.filter(t => t.status === "Success").length;
  const failedCount = filteredTransactions.filter(t => t.status === "Failed" || t.status === "Cancelled").length;

  // Find most used method
  const methodCounts = filteredTransactions.reduce((acc, t) => {
    if (t.status === "Success") {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const mostUsedMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const getMethodIcon = (method: string) => {
    if (method === "Cash") return Banknote;
    if (method === "Debit/Credit") return CreditCard;
    if (method === "QRIS") return Smartphone;
    return Wallet; // Default / E-Wallet
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight flex items-center gap-2">
            <Wallet className="w-8 h-8 text-primary" /> Payment Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">Advanced analytics and tracking for all cafe transactions.</p>
        </div>
        <ExportButton data={filteredTransactions} filename="eeatery_transactions" />
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard 
          title="Total Filtered Revenue" 
          value={`Rp ${(totalRevenue / 1000000).toFixed(1)}M`} 
          icon={Banknote} 
        />
        <AnalyticsCard 
          title="Successful Transactions" 
          value={successCount} 
          icon={CheckCircle} 
          iconColorClass="text-green-500" 
          iconBgClass="bg-green-500/10" 
        />
        <AnalyticsCard 
          title="Failed / Cancelled" 
          value={failedCount} 
          icon={XCircle} 
          iconColorClass="text-red-500" 
          iconBgClass="bg-red-500/10" 
        />
        <AnalyticsCard 
          title="Most Used Method" 
          value={mostUsedMethod} 
          icon={getMethodIcon(mostUsedMethod)} 
          iconColorClass="text-blue-500" 
          iconBgClass="bg-blue-500/10" 
        />
      </div>

      {/* Filters */}
      <TransactionFilters 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        methodFilter={methodFilter} setMethodFilter={setMethodFilter}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        typeFilter={typeFilter} setTypeFilter={setTypeFilter}
        dateFilter={dateFilter} setDateFilter={setDateFilter}
      />

      {/* Data Table */}
      <TransactionTable 
        data={filteredTransactions} 
        isLoading={isLoading} 
        onViewDetail={(tx) => setSelectedTx(tx as any)} 
      />

      {/* View Detail Modal */}
      <TransactionDetailModal 
        transaction={selectedTx} 
        isOpen={!!selectedTx} 
        onClose={() => setSelectedTx(null)} 
      />
      
    </div>
  );
}
