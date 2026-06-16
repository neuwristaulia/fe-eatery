"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { recommendationsApi } from "@/lib/api";
import type { ApiRecommendation } from "@/lib/api/types";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Sparkles } from "lucide-react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=500";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export function RecommendationSection() {
  const [recommendations, setRecommendations] = React.useState<
    ApiRecommendation[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const addToCart = useStore((state) => state.addToCart);

  React.useEffect(() => {
    recommendationsApi
      .getMyRecommendations({ limit: 6 })
      .then(setRecommendations)
      .catch(() => setRecommendations([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (item: ApiRecommendation, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: String(item.menu_id),
      name: item.menu_name,
      price: item.price,
      quantity: 1,
      image: item.image || FALLBACK_IMAGE,
    });
    toast.success(`Added ${item.menu_name} to cart`, {
      description: "Tap the cart icon to checkout.",
      duration: 2000,
    });
  };

  if (loading || recommendations.length === 0) return null;

  return (
    <motion.section variants={itemVariants} className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold flex items-center gap-2">
            Rekomendasi Untuk Anda <Sparkles className="w-6 h-6 text-primary" />
          </h2>
          <p className="text-muted-foreground mt-1">
            Pilihan menu yang disesuaikan dengan kebiasaan Anda
          </p>
        </div>
        <Link href="/menu">
          <Button
            variant="outline"
            className="rounded-full border-primary/20 text-foreground hover:bg-primary/5"
          >
            Lihat Semua Menu
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((item) => (
          <Card
            key={item.menu_id}
            className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group h-full flex flex-col rounded-3xl bg-card"
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={item.image || FALLBACK_IMAGE}
                alt={item.menu_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                <span className="text-xs font-bold">{item.category}</span>
              </div>
            </div>
            <CardContent className="p-5 flex-1 flex flex-col justify-between">
              <h3 className="font-serif font-bold text-lg leading-tight line-clamp-1 mb-4">
                {item.menu_name}
              </h3>
              <div className="flex items-center justify-between mt-auto gap-3">
                <span className="font-bold text-lg text-primary">
                  Rp {item.price.toLocaleString("id-ID")}
                </span>
                <div className="flex items-center gap-2">
                  <Link href="/menu">
                    <Button
                      variant="outline"
                      className="rounded-full border-primary/20 text-foreground hover:bg-primary/5"
                    >
                      View Menu
                    </Button>
                  </Link>
                  <Button
                    onClick={(e) => handleAddToCart(item, e)}
                    className="rounded-full w-10 h-10 p-0 shadow-md hover:scale-105 transition-transform"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.section>
  );
}
