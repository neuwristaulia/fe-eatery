import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  useAuthStore,
  roleName,
  validatePortalRole,
  type AuthPortal,
} from "@/store/useAuthStore";
import {
  fetchStaffData,
  createStaffOrderOnApi,
  updateStaffOrderStatusOnApi,
  processStaffPaymentOnApi,
} from "@/lib/api/staffSync";
import * as paymentsApi from "@/lib/api/services/payments";
import * as tablesApi from "@/lib/api/services/tables";
import { ApiError } from "@/lib/api/client";

// "created" | "ready" | "served" are legacy values kept only so the cashier/kitchen portals
// (which still set/compare against them) continue to type-check; the new /staff portal never
// produces or expects them.
export type OrderStatus =
  | "pending"
  | "order_placed"
  | "confirmed"
  | "preparing"
  | "completed"
  | "cancelled"
  | "refunded"
  | "created"
  | "ready"
  | "served";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";
export type OrderType = "dine-in" | "takeaway" | "pickup";

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
  customerPhone?: string;
  type: OrderType;
  tableNumber?: string;
  time: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentId?: number;
  paymentMethod?: string;
  midtransOrderId?: string;
  midtransTransactionId?: string;
  transactionStatus?: string;
  refundReason?: string;
  refundMethod?: string;
  refundedAmount?: number;
  stockReduced?: boolean;
}

export interface CafeTable {
  id: string;
  number: string;
  capacity: number;
  status: "available" | "reserved" | "occupied" | "unavailable";
  currentOrderId?: string;
}

export interface StaffState {
  staffAuthenticated: boolean;
  staffData: any | null;
  orders: StaffOrder[];
  tables: CafeTable[];

  isDataLoading: boolean;
  // Auth
  login: (
    name: string,
    password?: string,
    portal?: AuthPortal,
  ) => Promise<boolean>;
  logout: () => void;
  fetchStaffData: () => Promise<void>;

  // Orders
  createOrder: (order: Omit<StaffOrder, "id" | "time">) => string;
  confirmOrder: (id: string) => void;
  startPreparing: (id: string) => void;
  markReady: (id: string) => void;
  serveOrder: (id: string) => void;
  completeOrder: (id: string) => void;
  cancelOrder: (id: string) => void;

  // Payments
  processPayment: (id: string, method: string) => void;
  markCashPaid: (paymentId: number) => Promise<boolean>;
  refundPayment: (paymentId: number, reason: string) => Promise<boolean>;
  syncMidtransStatus: (paymentId: number) => Promise<boolean>;
  cancelMidtransPayment: (paymentId: number) => Promise<boolean>;
  cancelOrRefundPayment: (
    paymentId: number,
    reason: string,
  ) => Promise<{ success: boolean; action?: "cancelled" | "refunded"; message?: string }>;

  // Tables
  updateTableStatus: (
    id: string,
    status: CafeTable["status"],
    orderId?: string,
  ) => void;
  updateTableStatusOnApi: (
    id: string,
    status: "available" | "occupied" | "reserved",
  ) => Promise<boolean>;
}

export const useStaffStore = create<StaffState>()(
  persist(
    (set, get) => ({
      staffAuthenticated: false,
      staffData: null,
      isDataLoading: false,
      orders: [],
      tables: [],

      login: async (name, password = "", portal = "cashier") => {
        try {
          if (!name || !password) return false;

          const user = await useAuthStore
            .getState()
            .loginWithCredentials(name, password, portal);

          if (!validatePortalRole(portal, user.role_id)) {
            useAuthStore.getState().clearAuth();
            return false;
          }

          set({
            staffAuthenticated: true,
            staffData: {
              id: String(user.id),
              role: portal,
              name: user.name,
              roleLabel: roleName(user.role_id),
            },
          });

          await get().fetchStaffData();
          return true;
        } catch {
          return false;
        }
      },

      logout: async () => {
        await useAuthStore.getState().logout();
        set({ staffAuthenticated: false, staffData: null });
      },

      fetchStaffData: async () => {
        set({ isDataLoading: true });
        try {
          const data = await fetchStaffData();
          set({
            orders: data.orders,
            tables: data.tables,
            isDataLoading: false,
          });
        } catch {
          set({ isDataLoading: false });
        }
      },

      createOrder: (orderData) => {
        let localId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        const newOrder: StaffOrder = {
          id: localId,
          time,
          ...orderData,
        };

        set((state) => {
          let updatedTables = state.tables;
          if (newOrder.type === "dine-in" && newOrder.tableNumber) {
            updatedTables = state.tables.map((t) =>
              t.id === newOrder.tableNumber
                ? { ...t, status: "occupied" as const, currentOrderId: localId }
                : t,
            );
          }
          return { orders: [newOrder, ...state.orders], tables: updatedTables };
        });

        createStaffOrderOnApi(orderData)
          .then((apiOrder) => {
            set((state) => ({
              orders: state.orders.map((o) =>
                o.id === localId ? apiOrder : o,
              ),
            }));
            localId = apiOrder.id;
          })
          .catch(() => {});

        return localId;
      },

      confirmOrder: (id) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status: "confirmed" as OrderStatus } : o,
          ),
        }));
        updateStaffOrderStatusOnApi(id, "confirmed")
          .then((updated) => {
            set((state) => ({
              orders: state.orders.map((o) => (o.id === id ? updated : o)),
            }));
          })
          .catch(() => {});
      },

      startPreparing: (id) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status: "preparing" as OrderStatus } : o,
          ),
        }));
        updateStaffOrderStatusOnApi(id, "preparing").catch(() => {});
      },

      markReady: (id) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status: "ready" as OrderStatus } : o,
          ),
        }));
        updateStaffOrderStatusOnApi(id, "ready").catch(() => {});
      },

      serveOrder: (id) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status: "served" } : o,
          ),
        })),

      completeOrder: (id) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status: "completed" as OrderStatus } : o,
          ),
        }));
        updateStaffOrderStatusOnApi(id, "completed")
          .then((updated) => {
            set((state) => ({
              orders: state.orders.map((o) => (o.id === id ? updated : o)),
            }));
          })
          .catch(() => {});
        get().fetchStaffData();
      },

      cancelOrder: (id) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status: "cancelled" as OrderStatus } : o,
          ),
        }));
        updateStaffOrderStatusOnApi(id, "cancelled").catch(() => {});
        get().fetchStaffData();
      },

      processPayment: (id, method) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  paymentStatus: "paid" as PaymentStatus,
                  paymentMethod: method,
                }
              : o,
          ),
        }));
        processStaffPaymentOnApi(id, method)
          .then((updated) => {
            set((state) => ({
              orders: state.orders.map((o) => (o.id === id ? updated : o)),
            }));
          })
          .catch(() => {});
      },

      markCashPaid: async (paymentId) => {
        try {
          await paymentsApi.markCashPaid(paymentId);
          await get().fetchStaffData();
          return true;
        } catch {
          return false;
        }
      },

      refundPayment: async (paymentId, reason) => {
        try {
          await paymentsApi.refundPayment(paymentId, reason);
          await get().fetchStaffData();
          return true;
        } catch {
          return false;
        }
      },

      syncMidtransStatus: async (paymentId) => {
        try {
          await paymentsApi.syncMidtransStatus(paymentId);
          await get().fetchStaffData();
          return true;
        } catch {
          return false;
        }
      },

      cancelMidtransPayment: async (paymentId) => {
        try {
          await paymentsApi.cancelMidtransPayment(paymentId);
          await get().fetchStaffData();
          return true;
        } catch {
          return false;
        }
      },

      cancelOrRefundPayment: async (paymentId, reason) => {
        try {
          const result = await paymentsApi.cancelOrRefundPayment(
            paymentId,
            reason,
          );
          await get().fetchStaffData();
          return { success: true, action: result.action };
        } catch (e) {
          const message =
            e instanceof ApiError
              ? e.message
              : e instanceof Error
                ? e.message
                : "Unknown error";
          return { success: false, message };
        }
      },

      updateTableStatus: (id, status, orderId) =>
        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === id ? { ...t, status, currentOrderId: orderId } : t,
          ),
        })),

      updateTableStatusOnApi: async (id, status) => {
        try {
          await tablesApi.updateTableStatus(Number(id), status);
          set((state) => ({
            tables: state.tables.map((t) =>
              t.id === id ? { ...t, status } : t,
            ),
          }));
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "staff-storage",
      partialize: (state) => ({
        staffAuthenticated: state.staffAuthenticated,
        staffData: state.staffData,
      }),
    },
  ),
);
