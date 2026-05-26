"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TicketPercent, Plus, Copy } from "lucide-react";

const vouchers = [
  { id: "VCH-01", code: "EEATERYBARU", discount: "20%", maxUsage: 100, used: 45, expiry: "31 Dec 2023", status: "Active" },
  { id: "VCH-02", code: "HEMAT50", discount: "Rp 50.000", maxUsage: 50, used: 50, expiry: "15 Nov 2023", status: "Fully Used" },
];

export default function AdminVouchersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Vouchers</h1>
          <p className="text-muted-foreground">Buat dan kelola kode promo diskon restoran.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Voucher
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vouchers.map((voucher, i) => (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={voucher.id}>
            <Card className="border-none shadow-md bg-card overflow-hidden relative">
              <div className="absolute top-0 left-0 bottom-0 w-2 bg-primary"></div>
              <CardContent className="p-5 pl-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg flex items-center gap-2 font-mono font-bold tracking-wider">
                    <TicketPercent className="w-4 h-4" />
                    {voucher.code}
                    <button className="ml-2 text-muted-foreground hover:text-primary"><Copy className="w-3 h-3" /></button>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${voucher.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>
                    {voucher.status}
                  </span>
                </div>
                <h3 className="font-bold text-2xl mb-1">{voucher.discount}</h3>
                <p className="text-sm text-muted-foreground mb-4">Valid until {voucher.expiry}</p>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Usage</span>
                    <span className="font-bold">{voucher.used} / {voucher.maxUsage}</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${(voucher.used / voucher.maxUsage) * 100}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
