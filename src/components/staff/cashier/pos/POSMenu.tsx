import { useState } from "react";
import { usePOSStore } from "@/store/usePOSStore";
import { useAdminStore } from "@/store/useAdminStore";
import { Search, ArrowLeft, Trash2, Edit3, CheckCircle, ShoppingBag, Gift, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PaymentModal } from "./PaymentModal";
import { RedeemModal } from "./RedeemModal";

export function POSMenu() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [tempNote, setTempNote] = useState("");

  const [showRedeem, setShowRedeem] = useState(false);

  const { 
    orderType, selectedTable, customerInfo, cart, 
    subtotal, discount, discountName, tax, service, grandTotal, 
    addToCart, removeFromCart, updateQty, updateNotes, removeDiscount, resetPOS, setOrderType, setSelectedTable, setCustomerInfo
  } = usePOSStore();

  const { menus, categories } = useAdminStore();
  const menuCategories = ["All", ...categories.map(c => c.name)];

  const filteredMenu = menus.filter((item) => {
    const matchesCat = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddItem = (item: any) => {
    if (item.stock <= 0) {
      toast.error(`${item.name} is out of stock`);
      return;
    }
    const numPrice = Number(item.price.replace(/[^0-9]/g, ''));
    addToCart({ id: item.id, name: item.name, price: numPrice, qty: 1 });
    toast.success(`Added ${item.name}`, { duration: 1000 });
  };

  const handleSaveNote = (index: number) => {
    updateNotes(index, tempNote);
    setEditingNoteIndex(null);
  };

  return (
    <div className="flex w-full h-[calc(100vh-80px)] overflow-hidden bg-background">
      
      {/* Left & Center: Menu Section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-border">
        {/* Top Bar */}
        <div className="p-4 border-b border-border bg-card flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => {
                if (orderType === "dine-in" && selectedTable) {
                  setSelectedTable(null);
                } else if (orderType !== "dine-in" && customerInfo) {
                  setCustomerInfo(null);
                } else {
                  setOrderType(null);
                }
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary font-medium rounded-full text-sm uppercase">
              {orderType?.replace("-", " ")}
            </span>
            {selectedTable && (
              <span className="px-3 py-1 bg-secondary text-secondary-foreground font-medium rounded-full text-sm">
                Table {selectedTable.replace("T-", "")}
              </span>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 p-4 overflow-x-auto hide-scrollbar bg-card border-b border-border">
          {menuCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full whitespace-nowrap font-medium transition-colors",
                activeCategory === cat 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMenu.map((item) => {
              const numPrice = Number(item.price.replace(/[^0-9]/g, ''));
              let stockColor = "text-green-500";
              let stockBg = "bg-green-500/10";
              if (item.stock === 0) {
                stockColor = "text-red-500";
                stockBg = "bg-red-500/10";
              } else if (item.stock < 10) {
                stockColor = "text-yellow-500";
                stockBg = "bg-yellow-500/10";
              }

              return (
              <button
                key={item.id}
                onClick={() => handleAddItem(item)}
                disabled={item.stock <= 0}
                className={cn(
                  "flex flex-col bg-card rounded-2xl border p-4 text-left transition-all active:scale-95",
                  item.stock > 0 ? "hover:border-primary/50 cursor-pointer shadow-sm" : "opacity-50 cursor-not-allowed grayscale"
                )}
              >
                <div className="w-full aspect-square bg-muted rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                  {item.image.length > 5 ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">{item.image}</span>
                  )}
                </div>
                <h4 className="font-bold mb-1 line-clamp-2 min-h-[40px]">{item.name}</h4>
                <div className="flex items-center justify-between w-full mt-auto">
                  <span className="text-primary font-bold">Rp {numPrice.toLocaleString("id-ID")}</span>
                  {item.stock > 0 ? (
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", stockColor, stockBg)}>
                      {item.stock} left
                    </span>
                  ) : (
                    <span className="text-xs text-red-500 bg-red-500/10 font-bold px-2 py-0.5 rounded-full">Out of Stock</span>
                  )}
                </div>
              </button>
            )})}
          </div>
        </div>
      </div>

      {/* Right Sidebar: Cart */}
      <div className="w-full md:w-[350px] lg:w-[400px] flex flex-col h-full bg-card shrink-0">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold font-serif">Current Order</h2>
          <p className="text-sm text-muted-foreground">
            {cart.length} {cart.length === 1 ? 'item' : 'items'} in cart
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="m-auto text-center text-muted-foreground flex flex-col items-center">
              <ShoppingBag className="w-12 h-12 mb-2 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex flex-col gap-2 p-3 rounded-xl border border-border bg-background">
                <div className="flex justify-between gap-2">
                  <div className="flex-1 font-medium">{item.name}</div>
                  <div className="font-bold">Rp {(item.price * item.qty).toLocaleString("id-ID")}</div>
                </div>
                
                {/* Notes section */}
                {editingNoteIndex === index ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      className="flex-1 text-sm px-2 py-1 rounded border border-border outline-none focus:border-primary bg-background"
                      placeholder="Add note (e.g. Less ice)"
                      autoFocus
                    />
                    <button onClick={() => handleSaveNote(index)} className="text-green-500 p-1">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <button onClick={() => { setEditingNoteIndex(index); setTempNote(item.notes || ""); }} className="hover:text-primary flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> {item.notes ? item.notes : "Add note"}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
                    <button onClick={() => updateQty(index, -1)} className="w-8 h-8 flex items-center justify-center rounded-md bg-background shadow-sm hover:text-primary">-</button>
                    <span className="font-bold w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(index, 1)} className="w-8 h-8 flex items-center justify-center rounded-md bg-background shadow-sm hover:text-primary">+</button>
                  </div>
                  <button onClick={() => removeFromCart(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border bg-muted/30">
          
          <button 
            onClick={() => setShowRedeem(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-dashed border-primary/50 bg-primary/5 text-primary hover:bg-primary/10 transition-colors mb-4"
          >
            <span className="font-medium flex items-center gap-2">
              <Gift className="w-4 h-4" /> Apply Voucher / Redeem Points
            </span>
            <span className="text-lg leading-none">+</span>
          </button>

          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                <div className="flex items-center gap-2">
                  <span>Discount</span>
                  {discountName && <span className="text-xs bg-green-500/20 px-2 rounded-full">{discountName}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span>-Rp {discount.toLocaleString("id-ID")}</span>
                  <button onClick={removeDiscount} className="text-red-500 hover:bg-red-500/20 p-1 rounded">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span className="font-medium">Rp {tax.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service (5%)</span>
              <span className="font-medium">Rp {service.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">Rp {grandTotal.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <Button 
            className="w-full py-6 text-lg rounded-xl shadow-lg"
            disabled={cart.length === 0}
            onClick={() => setShowPayment(true)}
          >
            Proceed Payment
          </Button>
        </div>
      </div>

      {showPayment && (
        <PaymentModal onClose={() => setShowPayment(false)} />
      )}
      {showRedeem && (
        <RedeemModal onClose={() => setShowRedeem(false)} />
      )}
    </div>
  );
}
