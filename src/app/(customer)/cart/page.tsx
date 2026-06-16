"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, discount } =
    useStore();

  const accessToken = useAuthStore((s) => s.accessToken);
  const portal = useAuthStore((s) => s.portal);
  const isBackendCustomer = Boolean(accessToken && portal === "customer");

  const router = useRouter();

  const total = cartTotal();
  const finalTotal = total - discount;

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-48 h-48 bg-primary/5 rounded-full flex items-center justify-center mb-8 relative"
        >
          <div
            className="absolute inset-0 border-4 border-primary/10 rounded-full animate-ping"
            style={{ animationDuration: "3s" }}
          />
          <ShoppingBag className="w-20 h-20 text-primary/40" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-3 tracking-tight">
          Cart is Empty
        </h2>
        <p className="text-muted-foreground mb-10 max-w-[250px] mx-auto text-sm leading-relaxed">
          Looks like you haven't added anything yet. Let's find something
          delicious!
        </p>
        <Link href="/menu" className="w-full">
          <Button
            size="lg"
            className="w-full rounded-2xl h-14 text-lg shadow-lg shadow-primary/20"
          >
            Browse Menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-28 pb-24 px-4 md:px-8 max-w-7xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Cart Items */}
        <div className="flex-1 overflow-visible">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                className="mb-4"
              >
                <Card className="overflow-hidden border-border/50">
                  <CardContent className="p-3 flex items-center gap-4">
                    <div className="w-20 h-20 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between h-20">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm line-clamp-2 pr-2">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => {
                            removeFromCart(item.id);
                            toast.success(`${item.name} removed from cart`);
                          }}
                          className="text-muted-foreground hover:text-destructive p-2 -mr-2 transition-colors rounded-full hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-semibold text-primary text-sm">
                          Rp{" "}
                          {(item.price * item.quantity).toLocaleString("id-ID")}
                        </span>

                        <div className="flex items-center space-x-3 bg-muted px-2 py-1 rounded-full">
                          <button
                            onClick={() => {
                              if (item.quantity > 1)
                                updateQuantity(item.id, item.quantity - 1);
                              else removeFromCart(item.id);
                            }}
                            className="w-6 h-6 flex items-center justify-center bg-background rounded-full shadow-sm text-foreground"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-semibold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground rounded-full shadow-sm"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:w-[400px] shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Bill Details */}
            <Card className="bg-card border-none shadow-md">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold uppercase tracking-wider text-muted-foreground text-sm mb-2">
                  Order Summary
                </h3>
                <div className="flex justify-between text-sm text-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    Rp {total.toLocaleString("id-ID")}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-500 font-medium">
                    <span>Discount</span>
                    <span>- Rp {discount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-foreground">
                  <span>Tax (11%)</span>
                  <span className="font-medium">
                    Rp {(finalTotal * 0.11).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="pt-4 border-t border-border flex justify-between items-center mt-2">
                  <span className="font-bold text-lg">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    Rp {(finalTotal * 1.11).toLocaleString("id-ID")}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full h-14 text-lg rounded-2xl flex justify-between items-center px-6"
              onClick={() => router.push("/checkout")}
            >
              <span>Checkout</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
