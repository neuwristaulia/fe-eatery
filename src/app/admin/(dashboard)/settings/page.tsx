"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Store, Clock, Receipt, Save } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Konfigurasi sistem restoran e-Eatery.</p>
      </div>

      <Card className="border-none shadow-md bg-card">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" /> Store Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Restaurant Name</label>
              <input type="text" defaultValue="e-Eatery" className="w-full px-4 py-2 rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <input type="text" defaultValue="+62 812 3456 7890" className="w-full px-4 py-2 rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <textarea defaultValue="Jl. Sudirman No. 123, Jakarta Selatan" className="w-full px-4 py-2 rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" rows={3} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md bg-card">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" /> Tax & Service Charge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tax Rate (%)</label>
              <input type="number" defaultValue="11" className="w-full px-4 py-2 rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Charge (%)</label>
              <input type="number" defaultValue="5" className="w-full px-4 py-2 rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg flex items-center gap-2 shadow-lg">
          <Save className="w-5 h-5" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
