import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAdminStore } from "./useAdminStore";

export type OrderStatus = 'created' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed';
export type OrderType = 'dine-in' | 'takeaway' | 'pickup';

export interface OrderItem {
  id?: string;
  name: string;
  qty: number;
  price: number;
  notes?: string;
}

export interface StaffOrder {
  id: string;
  customerName: string;
  type: OrderType;
  tableNumber?: string;
  time: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  stockReduced?: boolean;
}

export interface CafeTable {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'reserved' | 'occupied' | 'unavailable';
  currentOrderId?: string;
}

export interface StaffState {
  staffAuthenticated: boolean;
  staffData: any | null;
  orders: StaffOrder[];
  tables: CafeTable[];
  
  // Auth
  login: (staffId: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Orders
  createOrder: (order: Omit<StaffOrder, 'id' | 'time'>) => string;
  confirmOrder: (id: string) => void;
  startPreparing: (id: string) => void;
  markReady: (id: string) => void;
  serveOrder: (id: string) => void;
  completeOrder: (id: string) => void;
  cancelOrder: (id: string) => void;
  
  // Payments
  processPayment: (id: string, method: string) => void;
  
  // Tables
  updateTableStatus: (id: string, status: CafeTable['status'], orderId?: string) => void;
}

const initialOrders: StaffOrder[] = [
  {
    id: "ORD-101",
    customerName: "Budi Santoso",
    type: "dine-in",
    tableNumber: "T-02",
    time: "10:15",
    items: [
      { name: "Kopi e-Eatery Signature", qty: 2, price: 25000, notes: "Kurang manis" },
      { name: "Kaya Toast Premium", qty: 1, price: 35000 }
    ],
    subtotal: 85000,
    tax: 8500,
    total: 93500,
    status: "created",
    paymentStatus: "unpaid"
  },
  {
    id: "ORD-102",
    customerName: "Siti Aminah",
    type: "takeaway",
    time: "10:20",
    items: [
      { name: "Nasi Goreng Spesial", qty: 1, price: 45000 }
    ],
    subtotal: 45000,
    tax: 4500,
    total: 49500,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "qris"
  },
  {
    id: "ORD-103",
    customerName: "Andi Wijaya",
    type: "dine-in",
    tableNumber: "T-05",
    time: "10:05",
    items: [
      { name: "Teh Tarik Malaya", qty: 2, price: 20000 },
      { name: "Mie Goreng Spesial", qty: 1, price: 40000 }
    ],
    subtotal: 80000,
    tax: 8000,
    total: 88000,
    status: "preparing",
    paymentStatus: "paid",
    paymentMethod: "card"
  },
  {
    id: "ORD-104",
    customerName: "Dewi Lestari",
    type: "dine-in",
    tableNumber: "T-01",
    time: "09:45",
    items: [
      { name: "Kopi Hitam", qty: 1, price: 15000 }
    ],
    subtotal: 15000,
    tax: 1500,
    total: 16500,
    status: "ready",
    paymentStatus: "paid",
    paymentMethod: "cash"
  }
];

const initialTables: CafeTable[] = [
  { id: "T-01", number: "1", capacity: 4, status: "occupied", currentOrderId: "ORD-104" },
  { id: "T-02", number: "2", capacity: 2, status: "reserved" },
  { id: "T-03", number: "3", capacity: 4, status: "available" },
  { id: "T-04", number: "4", capacity: 6, status: "available" },
  { id: "T-05", number: "5", capacity: 2, status: "occupied", currentOrderId: "ORD-103" },
  { id: "T-06", number: "6", capacity: 2, status: "available" },
  { id: "T-07", number: "7", capacity: 8, status: "available" },
  { id: "T-08", number: "8", capacity: 4, status: "unavailable" },
];

export const useStaffStore = create<StaffState>()(
  persist(
    (set) => ({
      staffAuthenticated: false,
      staffData: null,
      orders: initialOrders,
      tables: initialTables,
      
      login: async (staffId, password) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (password === "staff123") {
              const isCashier = staffId.toUpperCase().startsWith("CASHIER");
              const isKitchen = staffId.toUpperCase().startsWith("CHEF");
              
              if (isCashier || isKitchen) {
                const role = isCashier ? "cashier" : "kitchen";
                set({ 
                  staffAuthenticated: true, 
                  staffData: { id: staffId, role: role, name: isCashier ? "Ahmad Cashier" : "Chef Budi" } 
                });
                resolve(true);
                return;
              }
            }
            resolve(false);
          }, 800);
        });
      },
      
      logout: () => set({ staffAuthenticated: false, staffData: null }),
      
      createOrder: (orderData) => {
        const id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const newOrder: StaffOrder = {
          id,
          time,
          ...orderData
        };

        set((state) => {
          const updatedOrders = [newOrder, ...state.orders];
          let updatedTables = state.tables;
          
          if (newOrder.type === 'dine-in' && newOrder.tableNumber) {
            updatedTables = state.tables.map(t => 
              t.id === newOrder.tableNumber ? { ...t, status: 'occupied', currentOrderId: id } : t
            );
          }
          
          return { orders: updatedOrders, tables: updatedTables };
        });
        
        return id;
      },
      
      confirmOrder: (id) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, status: 'confirmed' } : o)
      })),
      
      startPreparing: (id) => {
        set((state) => {
          let updatedOrders = state.orders.map(o => o.id === id ? { ...o, status: 'preparing' as OrderStatus } : o);
          const order = updatedOrders.find(o => o.id === id);
          if (order && order.paymentStatus === 'paid' && !order.stockReduced) {
            useAdminStore.getState().reduceMenuStock(order.items);
            updatedOrders = updatedOrders.map(o => o.id === id ? { ...o, stockReduced: true } : o);
          }
          return { orders: updatedOrders };
        });
      },
      
      markReady: (id) => {
        set((state) => {
          let updatedOrders = state.orders.map(o => o.id === id ? { ...o, status: 'ready' as OrderStatus } : o);
          const order = updatedOrders.find(o => o.id === id);
          if (order && order.paymentStatus === 'paid' && !order.stockReduced) {
            useAdminStore.getState().reduceMenuStock(order.items);
            updatedOrders = updatedOrders.map(o => o.id === id ? { ...o, stockReduced: true } : o);
          }
          return { orders: updatedOrders };
        });
      },
      
      serveOrder: (id) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, status: 'served' } : o)
      })),
      
      completeOrder: (id) => set((state) => {
        const updatedOrders = state.orders.map(o => o.id === id ? { ...o, status: 'completed' } : o);
        const order = state.orders.find(o => o.id === id);
        
        // If it was dine-in, free the table
        let updatedTables = state.tables;
        if (order && order.tableNumber) {
          updatedTables = state.tables.map(t => 
            t.id === order.tableNumber ? { ...t, status: 'available', currentOrderId: undefined } : t
          );
        }
        
        return { orders: updatedOrders, tables: updatedTables };
      }),
      
      cancelOrder: (id) => set((state) => {
        const updatedOrders = state.orders.map(o => o.id === id ? { ...o, status: 'cancelled' } : o);
        const order = state.orders.find(o => o.id === id);
        
        let updatedTables = state.tables;
        if (order && order.tableNumber) {
          updatedTables = state.tables.map(t => 
            t.id === order.tableNumber ? { ...t, status: 'available', currentOrderId: undefined } : t
          );
        }
        
        return { orders: updatedOrders, tables: updatedTables };
      }),
      
      processPayment: (id, method) => {
        set((state) => {
          let updatedOrders = state.orders.map(o => o.id === id ? { ...o, paymentStatus: 'paid' as PaymentStatus, paymentMethod: method } : o);
          const order = updatedOrders.find(o => o.id === id);
          const kitchenProcessed = ['preparing', 'ready', 'served', 'completed'].includes(order?.status || '');
          if (order && kitchenProcessed && !order.stockReduced) {
            useAdminStore.getState().reduceMenuStock(order.items);
            updatedOrders = updatedOrders.map(o => o.id === id ? { ...o, stockReduced: true } : o);
          }
          return { orders: updatedOrders };
        });
      },
      
      updateTableStatus: (id, status, orderId) => set((state) => ({
        tables: state.tables.map(t => t.id === id ? { ...t, status, currentOrderId: orderId } : t)
      }))
    }),
    {
      name: "staff-storage",
    }
  )
);
