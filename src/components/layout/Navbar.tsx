"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const cart = useStore((state) => state.cart);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { scrollY } = useScroll();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  const navLinks = [
    { name: "Home", href: "/dashboard" },
    { name: "Menu", href: "/menu" },
    { name: "Promo", href: "#promo" },
    { name: "About", href: "#about" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
          isScrolled 
            ? "bg-background/90 backdrop-blur-md border-border/50 shadow-sm py-3" 
            : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center group">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition-transform border-2 border-transparent group-hover:border-primary/20">
                <img src="/logo.png" alt="e-Eatery Logo" className="w-full h-full object-cover" />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/dashboard");
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors group"
                  >
                    <span className={cn(
                      "relative z-10",
                      isActive ? "text-primary font-bold" : "text-foreground/80 group-hover:text-primary"
                    )}>
                      {link.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-primary/10 rounded-full -z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full text-foreground/80 hover:text-primary hover:bg-primary/10">
                <Search className="w-5 h-5" />
              </Button>
              
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative rounded-full text-foreground/80 hover:text-primary hover:bg-primary/10">
                  <ShoppingBag className="w-5 h-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              </Link>

              {status === "authenticated" ? (
                <Link href="/profile" className="hidden sm:block">
                  <Button variant="ghost" size="icon" className="rounded-full text-foreground/80 hover:text-primary hover:bg-primary/10 overflow-hidden">
                    {session?.user?.image ? (
                      <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </Button>
                </Link>
              ) : (
                <Link href="/login" className="hidden sm:block">
                  <Button className="rounded-full font-medium px-6 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all">
                    Sign In
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden rounded-full text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-24 px-6 md:hidden"
          >
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-serif font-bold text-foreground hover:text-primary transition-colors py-2 border-b border-border/50"
                >
                  {link.name}
                </Link>
              ))}
              
              {!session ? (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="mt-8">
                  <Button className="w-full rounded-full py-6 text-lg shadow-sm">
                    Sign In to Order
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full rounded-full mt-8 py-6 text-lg border-primary text-primary"
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
