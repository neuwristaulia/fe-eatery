"use client";

import * as React from "react";
import { useStaffStore, StaffOrder } from "@/store/useStaffStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Wallet, CreditCard, Banknote, CheckCircle, Smartphone, Printer } from "lucide-react";
import { toast } from "sonner";
import { PrintableReceipt } from "@/components/staff/cashier/PrintableReceipt";

export default function CashierPayments() {
  const { orders, processPayment, completeOrder, staffData } = useStaffStore();
  const [printingOrder, setPrintingOrder] = React.useState<StaffOrder | null>(null);
  
  // Only show orders that are unpaid or just paid but not completed
  const unpaidOrders = orders.filter(o => o.paymentStatus === 'unpaid' && o.status !== 'cancelled');
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid' && o.status !== 'completed' && o.status !== 'cancelled');

  const handlePayment = (id: string, method: string) => {
    processPayment(id, method);
    toast.success(`Payment processed for ${id} via ${method}`);
  };

  const handleComplete = (id: string) => {
    completeOrder(id);
    toast.success(`Order ${id} completed`);
  };

  const handlePrint = (order: StaffOrder) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-serif font-bold">Payments</h2>
        <p className="text-muted-foreground">Process transactions and close orders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Unpaid Orders */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <Wallet className="w-5 h-5 text-yellow-500" /> Pending Payments
          </h3>
          {unpaidOrders.map(order => (
            <Card key={order.id} className="bg-card border-none shadow-sm h-fit block">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{order.id}</h3>
                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                  </div>
                  <span className="font-bold text-xl text-primary">Rp {order.total.toLocaleString('id-ID')}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button variant="outline" className="flex items-center gap-2 h-12" onClick={() => handlePayment(order.id, 'Cash')}>
                    <Banknote className="w-4 h-4 text-green-600" /> Cash
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 h-12" onClick={() => handlePayment(order.id, 'Debit/Credit')}>
                    <CreditCard className="w-4 h-4 text-blue-600" /> Card
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 h-12 col-span-2" onClick={() => handlePayment(order.id, 'QRIS')}>
                    <Smartphone className="w-4 h-4 text-purple-600" /> QRIS / E-Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {unpaidOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">
              No pending payments.
            </div>
          )}
        </div>

        {/* Paid but uncompleted */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" /> Paid Orders
          </h3>
          {paidOrders.map(order => (
            <Card key={order.id} className="bg-green-500/5 border border-green-500/20 shadow-sm h-fit block">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{order.id}</h3>
                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg text-primary block">Rp {order.total.toLocaleString('id-ID')}</span>
                    <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded">PAID VIA {order.paymentMethod?.toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button variant="outline" className="flex items-center gap-2 border-primary/20 hover:bg-primary/5 text-primary" onClick={() => handlePrint(order)}>
                    <Printer className="w-4 h-4" /> Print Bill
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleComplete(order.id)}>
                    Complete Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {paidOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">
              No recent paid orders to close.
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden render for printing */}
      <div className="hidden print:block">
        {printingOrder && <PrintableReceipt order={printingOrder} cashierName={staffData?.name || "Cashier"} />}
      </div>
    </div>
  );
}
