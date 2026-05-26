"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Gift, Ticket, Award } from "lucide-react";

export default function CashierRewards() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-serif font-bold">Rewards & Vouchers</h2>
        <p className="text-muted-foreground">Validate customer points and redeem vouchers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Check Customer Points */}
        <Card className="bg-card border-none shadow-sm">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Check Customer Points
            </h3>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Enter Phone Number or Member ID" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/50 bg-background focus:outline-none focus:border-primary"
                />
              </div>
              <Button className="h-auto rounded-xl px-6">Search</Button>
            </div>

            <div className="p-4 bg-muted/30 rounded-xl space-y-4">
              <p className="text-sm text-muted-foreground text-center py-4">Enter a customer ID to view points.</p>
            </div>
          </CardContent>
        </Card>

        {/* Validate Voucher */}
        <Card className="bg-card border-none shadow-sm">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <Ticket className="w-5 h-5 text-orange-500" /> Validate Voucher
            </h3>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Enter Voucher Code (e.g. EEATERY20)" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/50 bg-background focus:outline-none focus:border-orange-500"
                />
              </div>
              <Button className="h-auto rounded-xl px-6 bg-orange-500 hover:bg-orange-600">Validate</Button>
            </div>

            <div className="p-4 bg-muted/30 rounded-xl space-y-4">
              <p className="text-sm text-muted-foreground text-center py-4">Enter a code to check validity.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
