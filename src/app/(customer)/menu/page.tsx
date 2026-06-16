"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMenuCatalog } from "@/hooks/useMenuCatalog";
import { useStore, type CartItem } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MenuContent() {
  const { categories, menuItems, loading, error } = useMenuCatalog();
  const searchParams = useSearchParams();
  const defaultCategory = searchParams.get("category") || categories[0]?.id || "";
  
  const [activeCategory, setActiveCategory] = React.useState(defaultCategory);

  React.useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const addToCart = useStore((state) => state.addToCart);
  const cart = useStore((state) => state.cart);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = item.categoryId === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (searchQuery ? true : matchesCategory);
  });

  const handleAddToCart = (item: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cartItem: CartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    };
    addToCart(cartItem);
    toast.success(`Added ${item.name} to cart`, {
      description: "Tap the cart icon to checkout.",
      duration: 2000,
    });
  };

  const getQuantity = (id: string) => {
    return cart.find(item => item.id === id)?.quantity || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-4 text-center">
        <p className="text-red-600 mb-2">{error}</p>
        <p className="text-sm text-muted-foreground">
          Pastikan backend berjalan di {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-24 pb-20 md:pb-12">
      {/* Sticky Header */}
      <div className="sticky top-20 z-30 bg-background/80 backdrop-blur-xl px-4 md:px-8 py-6 border-b border-border/50">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-serif font-bold text-foreground">Menu <span className="text-primary">Spesial</span></h1>
            
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari kopi, toast, atau menu lainnya..."
                className="w-full pl-12 pr-4 py-3 rounded-full bg-card border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pb-4 pt-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`whitespace-nowrap w-full px-4 py-2.5 rounded-full text-sm font-bold transition-all border ${
                  activeCategory === category.id && !searchQuery
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105"
                    : "bg-card text-muted-foreground border-border/50 hover:border-primary/50 hover:text-primary"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="flex-1 container mx-auto px-4 md:px-8 max-w-7xl mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => {
              const quantity = getQuantity(item.id);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                  className="h-full"
                >
                  <Card className="h-full overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 bg-card rounded-[2rem] flex flex-col group">
                    <div className="relative h-48 sm:h-56 overflow-hidden">
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-lg leading-tight mb-2 text-foreground group-hover:text-primary transition-colors">{item.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                        <span className="font-bold text-xl text-primary">
                          Rp {item.price.toLocaleString('id-ID')}
                        </span>
                        
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleAddToCart(item, e)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 relative transition-colors"
                        >
                          <Plus className="w-6 h-6" />
                          <AnimatePresence>
                            {quantity > 0 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-card shadow-sm"
                              >
                                {quantity}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 w-full flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-serif font-bold">Menu Tidak Ditemukan</h3>
            <p className="text-muted-foreground max-w-sm">Maaf, kami tidak dapat menemukan menu yang Anda cari. Silakan coba kata kunci lain.</p>
            <Button variant="outline" className="mt-4 rounded-full" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
