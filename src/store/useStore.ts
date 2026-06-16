import { create } from "zustand";

export type User = {
  id: string;
  name: string;
  points: number;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

interface AppState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;

  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;

  discount: number;
  voucherCode: string;
  voucherId: number | null;
  applyVoucher: (
    code: string,
    discountAmount: number,
    voucherId?: number,
  ) => void;
  removeVoucher: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  login: (user) => set({ user }),
  // Do not clear cart on logout so unfinished orders remain accessible
  logout: () => set({ user: null }),

  cart: [],
  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.find((c) => c.id === item.id);
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.id === item.id
              ? { ...c, quantity: c.quantity + item.quantity }
              : c,
          ),
        };
      }
      return { cart: [...state.cart, item] };
    }),
  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((c) => c.id !== id),
    })),
  updateQuantity: (id, quantity) =>
    set((state) => ({
      cart: state.cart.map((c) => (c.id === id ? { ...c, quantity } : c)),
    })),
  clearCart: () =>
    set({ cart: [], discount: 0, voucherCode: "", voucherId: null }),

  discount: 0,
  voucherCode: "",
  voucherId: null,
  applyVoucher: (code, discountAmount, voucherId) =>
    set({
      voucherCode: code,
      discount: discountAmount,
      voucherId: voucherId || null,
    }),
  removeVoucher: () => set({ voucherCode: "", discount: 0, voucherId: null }),

  cartTotal: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
