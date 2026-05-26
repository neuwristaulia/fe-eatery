"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { recentOrders, rewards, categories, menuItems } from "@/lib/dummy-data";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronRight, Award, Clock, ArrowRight, Search, Plus, Flame, Sparkles, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const isGuest = status === "unauthenticated";
  
  const addToCart = useStore((state) => state.addToCart);
  
  const bestSellers = menuItems.filter(item => ["kopi-eeatery", "kaya-toast", "nasi-goreng"].includes(item.id));

  const handleAddToCart = (item: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
    toast.success(`Added ${item.name} to cart`, {
      description: "Tap the cart icon to checkout.",
      duration: 2000,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  if (status === "loading") return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-12"
    >
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 lg:px-24 overflow-hidden min-h-[85vh] flex items-center bg-gradient-to-b from-card to-background">
        {/* Asian Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.83-54.628 54.628-.83-.83L54.627 0zM0 54.627l.83.83L.83 55.457 0 54.627zm59.17-54.627l.83.83-59.17 59.17-.83-.83L59.17 0zM0 59.17l.83.83L.83 60 0 59.17z\' fill=\'%23B22222\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>
        
        <div className="container mx-auto max-w-7xl relative z-10 flex flex-col md:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 space-y-8 text-center md:text-left mt-10 md:mt-0">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span>Cita Rasa Hangat Untuk Setiap Momen</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-tight">
              Nikmati Hidangan Hangat Ala <span className="text-primary relative inline-block">
                Kopitiam
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" fill="transparent" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto md:mx-0">
              Good Food, Good Mood. Temukan pengalaman kuliner oriental premium yang hangat dan nyaman, langsung diantarkan ke meja Anda.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-4">
              <Link href="/menu">
                <Button className="rounded-full px-8 py-6 text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Order Sekarang
                </Button>
              </Link>
              <Link href="#promo">
                <Button variant="outline" className="rounded-full px-8 py-6 text-lg border-primary/20 hover:bg-primary/5 text-foreground gap-2">
                  <Flame className="w-5 h-5 text-primary" />
                  Lihat Promo
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div variants={itemVariants} className="flex-1 relative w-full max-w-lg mx-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/40 to-primary/20 rounded-[3rem] blur-3xl -z-10 transform rotate-6"></div>
            <div className="relative rounded-[3rem] overflow-hidden border-8 border-card shadow-2xl bg-card">
              <img src="https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&q=80&w=800" alt="Delicious Asian Food" className="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-700" />
            </div>
            
            {/* Floating Card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -bottom-6 -left-6 bg-card p-4 rounded-2xl shadow-xl border border-border/50 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold">Best Seller</p>
                <p className="text-xs text-muted-foreground">Kaya Toast Premium</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 max-w-7xl space-y-16 pb-20">
        {/* User Points / Greeting (If Logged In) */}
        {!isGuest && (
          <motion.section variants={itemVariants}>
            <Card className="bg-gradient-to-r from-secondary to-[#153428] border-none text-secondary-foreground overflow-hidden relative shadow-lg rounded-3xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              <CardContent className="p-6 md:p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl overflow-hidden border-2 border-white/30 backdrop-blur-sm shrink-0">
                    {user?.image ? (
                      <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{user?.name?.charAt(0) || "C"}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-secondary-foreground/80 text-sm">Welcome back,</p>
                    <h2 className="text-2xl font-bold font-serif">{user?.name || "Customer"}</h2>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-2xl p-4 flex items-center gap-6 w-full md:w-auto backdrop-blur-sm">
                  <div>
                    <p className="text-secondary-foreground/80 text-xs font-medium mb-1">Total Points</p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-bold tracking-tight text-accent">{user?.points || 0}</span>
                      <span className="text-sm text-accent/80">pts</span>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-white/20"></div>
                  <Link href="/rewards">
                    <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white rounded-full">
                      Redeem
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* 2. CATEGORY SECTION */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-serif font-bold">Kategori Menu</h2>
            <Link href="/menu" className="text-primary font-medium hover:underline flex items-center gap-1">
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pb-6 pt-2">
            {categories.map((category, index) => {
              const categoryImages = [
                "1626804475297-4160aeea1a52", // signatures
                "1604908176997-125f25cc6f3d", // rice
                "1610057099443-fde8c4d50f91", // noodles
                "1525268771113-32d9e9021a97", // toast
                "1541167760496-1628856ab772"  // drinks
              ];
              const imgId = categoryImages[index] || categoryImages[0];
              return (
              <Link href={`/menu?category=${category.id}`} key={category.id} className="h-full">
                <Card className="w-full h-full border-none bg-card hover:bg-muted transition-colors rounded-[2rem] overflow-hidden group cursor-pointer shadow-sm hover:shadow-md flex flex-col items-center justify-center">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-3 h-full">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-background p-1 shadow-sm group-hover:scale-110 transition-transform duration-300 shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <img 
                          src={`https://images.unsplash.com/photo-${imgId}?auto=format&fit=crop&q=80&w=200`} 
                          alt={category.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <span className="font-medium text-sm leading-tight">{category.name}</span>
                  </CardContent>
                </Card>
              </Link>
            )})}
          </div>
        </motion.section>

        {/* 3. PROMO BANNER */}
        <motion.section variants={itemVariants} id="promo">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary to-secondary shadow-xl">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
            <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
              <div className="max-w-xl text-center md:text-left space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white font-medium text-xs backdrop-blur-sm">
                  <Flame className="w-3 h-3" />
                  Promo Spesial
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold">Diskon 20% Untuk Member Baru!</h2>
                <p className="text-white/80">Nikmati potongan harga eksklusif untuk pesanan pertama Anda. Daftar sekarang dan rasakan kenikmatannya.</p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button className="bg-white text-primary hover:bg-accent hover:text-accent-foreground rounded-full px-6 shadow-lg border-none font-bold">
                      Klaim Promo
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="w-48 h-48 md:w-64 md:h-64 shrink-0 relative">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl"></div>
                <img src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400" alt="Promo Image" className="w-full h-full object-cover rounded-full border-4 border-white/20 shadow-2xl relative z-10" />
              </div>
            </div>
          </div>
        </motion.section>

        {/* 4. BEST SELLER SECTION */}
        <motion.section variants={itemVariants} className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold flex items-center gap-2">
                Paling Diminati <Flame className="w-6 h-6 text-primary" />
              </h2>
              <p className="text-muted-foreground mt-1">Hidangan favorit pelanggan e-Eatery</p>
            </div>
            <Link href="/menu">
              <Button variant="outline" className="rounded-full border-primary/20 text-foreground hover:bg-primary/5">
                Lihat Semua Menu
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestSellers.map((item) => (
              <Link href={`/menu`} key={item.id}>
                <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group cursor-pointer h-full flex flex-col rounded-3xl bg-card">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="text-yellow-500">★</span>
                      <span className="text-xs font-bold">4.8</span>
                    </div>
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-serif font-bold text-lg leading-tight line-clamp-1">{item.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-lg text-primary">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                      <Button 
                        onClick={(e) => handleAddToCart(item, e)}
                        className="rounded-full w-10 h-10 p-0 shadow-md hover:scale-105 transition-transform"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* 5. ABOUT SECTION */}
        <motion.section variants={itemVariants} id="about" className="pt-8">
          <div className="bg-card rounded-3xl overflow-hidden shadow-md flex flex-col md:flex-row items-center">
            <div className="flex-1 p-8 md:p-12 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-xs">
                <Sparkles className="w-3 h-3" />
                Tentang Kami
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Kisah e-Eatery</h2>
              <p className="text-muted-foreground leading-relaxed">
                Berdiri sejak 2023, e-Eatery hadir untuk membawa kehangatan cita rasa oriental klasik ke meja Anda. Dengan perpaduan rempah pilihan dan resep turun-temurun, kami menyajikan pengalaman kuliner Kopitiam modern yang tak terlupakan.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Kami percaya bahwa makanan yang baik (Good Food) akan membawa suasana hati yang baik pula (Good Mood). Nikmati setiap sajian kami bersama orang tercinta.
              </p>
              <div className="pt-4 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">50+</p>
                  <p className="text-xs text-muted-foreground">Menu Varian</p>
                </div>
                <div className="w-px h-10 bg-border"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">10k+</p>
                  <p className="text-xs text-muted-foreground">Pelanggan</p>
                </div>
              </div>
            </div>
            <div className="flex-1 h-full min-h-[300px] md:min-h-[400px] w-full">
              <img 
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800" 
                alt="e-Eatery Interior" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.section>

      </div>
    </motion.div>
  );
}
