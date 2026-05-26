"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Gift, Plus } from "lucide-react";

const rewards = [
  { id: "RW-01", name: "Free Kopi e-Eatery", points: 500, status: "Active", image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100" },
  { id: "RW-02", name: "Kaya Toast Gratis", points: 750, status: "Active", image: "https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=100" },
  { id: "RW-03", name: "Diskon 50% All Menu", points: 2000, status: "Inactive", image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=100" },
];

export default function AdminRewardsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Rewards Program</h1>
          <p className="text-muted-foreground">Kelola hadiah penukaran poin loyalitas pelanggan.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Reward
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rewards.map((reward, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={reward.id}>
            <Card className="border-none shadow-md bg-card overflow-hidden">
              <div className="h-32 relative overflow-hidden bg-muted">
                <img src={reward.image} alt={reward.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-background/90 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  <Gift className="w-3 h-3 text-primary" /> {reward.points} pts
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg">{reward.name}</h3>
                <div className="mt-4 flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${reward.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>
                    {reward.status}
                  </span>
                  <button className="text-primary text-sm hover:underline font-medium">Edit</button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
