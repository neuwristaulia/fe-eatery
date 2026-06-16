"use client";

import * as React from "react";
import { Wallet, Banknote, CheckCircle, XCircle, Download } from "lucide-react";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { Button } from "@/components/ui/Button";
import { TransactionTable } from "@/components/manager/payments/TransactionTable";
import { TransactionFilters } from "@/components/manager/payments/TransactionFilters";
import { TransactionDetailModal } from "@/components/manager/payments/TransactionDetailModal";
import { ExportButton } from "@/components/manager/payments/ExportButton";
import { TransactionDetail } from "@/types/payment";
import { paymentsApi, type ApiPayment } from "@/lib/api";
import { formatRupiah } from "@/lib/api/mappers";
import { exportToPdf, type ExportColumn, type ExportRow } from "@/lib/export";

function formatOrderType(type?: string): string {
  if (type === "dine-in") return "Dine In";
  if (type === "takeaway") return "Take Away";
  return type || "-";
}

function formatPaymentMethod(payment: ApiPayment): string {
  if (payment.method === "cash") return "Cash";
  const type = payment.payment_type;
  if (!type) return "Midtrans";
  if (type === "qris") return "QRIS";
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function toTransactionDetail(payment: ApiPayment): TransactionDetail {
  const order = payment.order;
  const items = (order?.order_items ?? []).map((item, i) => ({
    id: String(item.id ?? i),
    name: item.menu_name || item.menu?.name || `Menu #${item.menu_id}`,
    quantity: item.quantity,
    price: item.price ?? item.menu?.price ?? 0,
  }));

  const amount = payment.total_payment ?? order?.total_price ?? 0;
  const createdAt = payment.created_at ?? order?.created_at;

  const timeline: TransactionDetail["timeline"] = [];
  if (createdAt) {
    timeline.push({
      status: "pending",
      timestamp: new Date(createdAt).toLocaleString("id-ID"),
      note: "Payment created",
    });
  }
  if (payment.paid_at) {
    timeline.push({
      status: payment.status,
      timestamp: new Date(payment.paid_at).toLocaleString("id-ID"),
      note: `Payment ${payment.status}`,
    });
  } else if (payment.status !== "pending" && payment.status !== "unpaid") {
    timeline.push({
      status: payment.status,
      timestamp: createdAt ? new Date(createdAt).toLocaleString("id-ID") : "-",
    });
  }

  return {
    id: `PAY-${payment.id}`,
    orderId: `ORD-${payment.order_id}`,
    customerName: order?.user?.name || "Guest",
    orderType: formatOrderType(order?.order_type),
    paymentMethod: formatPaymentMethod(payment),
    amount,
    status: payment.status,
    date: createdAt ? new Date(createdAt).toLocaleString("id-ID") : "-",
    items,
    tableNumber: order?.table?.table_number != null ? `T-${order.table.table_number}` : undefined,
    subtotal: amount,
    tax: 0,
    timeline,
  };
}

export default function PaymentMonitoringPage() {
  const [transactions, setTransactions] = React.useState<TransactionDetail[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [methodFilter, setMethodFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [typeFilter, setTypeFilter] = React.useState("All");
  const [dateFilter, setDateFilter] = React.useState("");

  const [selectedTx, setSelectedTx] = React.useState<TransactionDetail | null>(null);

  React.useEffect(() => {
    let mounted = true;
    paymentsApi
      .listPayments()
      .then((data) => {
        if (mounted) setTransactions(data.map(toTransactionDetail));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const typeOptions = React.useMemo(
    () => Array.from(new Set(transactions.map((t) => t.orderType))),
    [transactions],
  );
  const methodOptions = React.useMemo(
    () => Array.from(new Set(transactions.map((t) => t.paymentMethod))),
    [transactions],
  );
  const statusOptions = React.useMemo(
    () => Array.from(new Set(transactions.map((t) => t.status))),
    [transactions],
  );

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
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
  }, [transactions, searchTerm, methodFilter, statusFilter, typeFilter, dateFilter]);

  const totalRevenue = filteredTransactions
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const successCount = filteredTransactions.filter((t) => t.status === "paid").length;
  const failedCount = filteredTransactions.filter(
    (t) => t.status === "failed" || t.status === "cancelled" || t.status === "refunded",
  ).length;

  const exportColumns: ExportColumn[] = [
    { header: "Payment ID", key: "id" },
    { header: "Order ID", key: "orderId" },
    { header: "Date", key: "date" },
    { header: "Customer", key: "customerName" },
    { header: "Type", key: "orderType" },
    { header: "Method", key: "paymentMethod" },
    { header: "Amount", key: "amount" },
    { header: "Status", key: "status" },
  ];

  const exportRows: ExportRow[] = filteredTransactions.map((tx) => ({
    id: tx.id,
    orderId: tx.orderId,
    date: tx.date,
    customerName: tx.customerName,
    orderType: tx.orderType,
    paymentMethod: tx.paymentMethod,
    amount: formatRupiah(tx.amount),
    status: tx.status,
  }));

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
        <div className="flex items-center gap-3">
          <ExportButton data={filteredTransactions} filename="eeatery_transactions" />
          <Button
            variant="outline"
            className="gap-2 bg-card border-border/50"
            onClick={() => exportToPdf("Payment Monitoring Report", exportColumns, exportRows)}
          >
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalyticsCard
          title="Total Filtered Revenue"
          value={formatRupiah(totalRevenue)}
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
      </div>

      {/* Filters */}
      <TransactionFilters
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        methodFilter={methodFilter} setMethodFilter={setMethodFilter}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        typeFilter={typeFilter} setTypeFilter={setTypeFilter}
        dateFilter={dateFilter} setDateFilter={setDateFilter}
        typeOptions={typeOptions}
        methodOptions={methodOptions}
        statusOptions={statusOptions}
      />

      {/* Data Table */}
      <TransactionTable
        data={filteredTransactions}
        isLoading={isLoading}
        onViewDetail={(tx) => setSelectedTx(tx as TransactionDetail)}
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
