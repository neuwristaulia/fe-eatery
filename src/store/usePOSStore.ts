import { create } from "zustand";
import { OrderItem, OrderType } from "./useStaffStore";

export interface POSCustomerInfo {
  name: string;
  phone?: string;
  address?: string;
}

export interface POSState {
  // Step 1 & 2
  orderType: OrderType | null;
  selectedTable: string | null;
  customerInfo: POSCustomerInfo | null;
  
  // Step 3
  cart: OrderItem[];
  subtotal: number;
  discount: number;
  discountName: string | null;
  tax: number;
  service: number;
  grandTotal: number;
  
  // Actions
  setOrderType: (type: OrderType | null) => void;
  setSelectedTable: (tableId: string | null) => void;
  setCustomerInfo: (info: POSCustomerInfo | null) => void;
  
  addToCart: (item: Omit<OrderItem, 'qty'> & { qty?: number }) => void;
  removeFromCart: (index: number) => void;
  updateQty: (index: number, delta: number) => void;
  updateNotes: (index: number, notes: string) => void;
  applyDiscount: (amount: number, name: string) => void;
  removeDiscount: () => void;
  clearCart: () => void;
  resetPOS: () => void;
}

const TAX_RATE = 0.10;
const SERVICE_RATE = 0.05;

const calculateTotals = (cart: OrderItem[], discount: number = 0) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const subtotalAfterDiscount = Math.max(0, subtotal - discount);
  const tax = Math.round(subtotalAfterDiscount * TAX_RATE);
  const service = Math.round(subtotalAfterDiscount * SERVICE_RATE);
  return {
    subtotal,
    discount,
    tax,
    service,
    grandTotal: subtotalAfterDiscount + tax + service
  };
};

export const usePOSStore = create<POSState>((set) => ({
  orderType: null,
  selectedTable: null,
  customerInfo: null,
  
  cart: [],
  subtotal: 0,
  discount: 0,
  discountName: null,
  tax: 0,
  service: 0,
  grandTotal: 0,
  
  setOrderType: (type) => set({ orderType: type }),
  setSelectedTable: (tableId) => set({ selectedTable: tableId }),
  setCustomerInfo: (info) => set({ customerInfo: info }),
  
  addToCart: (item) => set((state) => {
    const existingIndex = state.cart.findIndex(
      (cartItem) => cartItem.id === item.id && cartItem.notes === item.notes
    );
    
    let newCart = [...state.cart];
    if (existingIndex >= 0) {
      newCart[existingIndex].qty += (item.qty || 1);
    } else {
      newCart.push({ ...item, qty: item.qty || 1 });
    }
    
    return { cart: newCart, ...calculateTotals(newCart, state.discount) };
  }),
  
  removeFromCart: (index) => set((state) => {
    const newCart = [...state.cart];
    newCart.splice(index, 1);
    const newDiscount = newCart.length === 0 ? 0 : state.discount;
    const newDiscountName = newCart.length === 0 ? null : state.discountName;
    return {
      cart: newCart,
      discountName: newDiscountName,
      ...calculateTotals(newCart, newDiscount),
    };
  }),
  
  updateQty: (index, delta) => set((state) => {
    const newCart = [...state.cart];
    const newQty = newCart[index].qty + delta;
    if (newQty <= 0) {
      newCart.splice(index, 1);
    } else {
      newCart[index].qty = newQty;
    }
    const newDiscount = newCart.length === 0 ? 0 : state.discount;
    const newDiscountName = newCart.length === 0 ? null : state.discountName;
    return {
      cart: newCart,
      discountName: newDiscountName,
      ...calculateTotals(newCart, newDiscount),
    };
  }),

  updateNotes: (index, notes) => set((state) => {
    const newCart = [...state.cart];
    newCart[index].notes = notes;
    return { cart: newCart, ...calculateTotals(newCart, state.discount) };
  }),
  
  applyDiscount: (amount, name) => set((state) => ({
    discountName: name,
    ...calculateTotals(state.cart, amount)
  })),

  removeDiscount: () => set((state) => ({
    discountName: null,
    ...calculateTotals(state.cart, 0)
  })),
  
  clearCart: () => set({ cart: [], subtotal: 0, discount: 0, discountName: null, tax: 0, service: 0, grandTotal: 0 }),
  
  resetPOS: () => set({
    orderType: null,
    selectedTable: null,
    customerInfo: null,
    cart: [],
    subtotal: 0,
    discount: 0,
    discountName: null,
    tax: 0,
    service: 0,
    grandTotal: 0
  })
}));
