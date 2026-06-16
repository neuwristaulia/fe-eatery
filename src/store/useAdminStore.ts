import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  useAuthStore,
  roleName,
  validatePortalRole,
} from "@/store/useAuthStore";
import {
  fetchAdminCatalog,
  fetchAdminOperations,
  fetchAdminCustomers,
  fetchAdminStaff,
  fetchAdminReservations,
  createMenuOnApi,
  updateMenuOnApi,
  deleteMenuOnApi,
  createCategoryOnApi,
  updateCategoryOnApi,
  deleteCategoryOnApi,
  updateOrderStatusOnApi,
  deleteOrderOnApi,
  createTableOnApi,
  updateTableOnApi,
  deleteTableOnApi,
  updateStockOnApi,
  adjustStockOnApi,
  createReservationOnApi,
  updateReservationOnApi,
  deleteReservationOnApi,
  mapReservationToAdmin,
} from "@/lib/api/adminSync";
import { tablesApi, ordersApi, usersApi } from "@/lib/api";
import { mapOrderToAdmin, parseNumericId } from "@/lib/api/mappers";

export interface AdminStaffRow {
  id: string;
  name: string;
  role: string;
  shift: string;
  status: string;
  email?: string;
  phone?: string;
}

export interface AdminTableRow {
  id: string;
  name: string;
  tableNumber?: number;
  capacity: number;
  status: string;
  qrCode?: string;
  time?: string;
  orderId?: string;
}

export interface AdminReservationRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  table: string;
  tableId: string;
  capacity: number;
  date: string;
  time: string;
  status: string;
}

interface AdminState {
  isAdminAuthenticated: boolean;
  adminData: { id: string; name: string; role: string } | null;
  isDataLoading: boolean;
  dataError: string | null;
  orders: any[];
  menus: any[];
  categories: any[];
  stocks: any[];
  customers: any[];
  staff: AdminStaffRow[];
  tables: AdminTableRow[];
  reservations: AdminReservationRow[];

  login: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchAllData: () => Promise<void>;

  addOrder: (order: any) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  updateOrderPaymentStatus: (id: string, paymentStatus: string) => void;
  deleteOrder: (id: string) => Promise<void>;

  addMenu: (menu: any) => Promise<void>;
  updateMenu: (id: string, menu: any) => Promise<void>;
  deleteMenu: (id: string) => Promise<void>;
  addCategory: (category: {
    name: string;
    description?: string;
  }) => Promise<void>;
  updateCategory: (
    id: string,
    category: { name: string; description?: string },
  ) => Promise<void>;
  deleteCategory: (id: string, reassignTo?: string) => Promise<void>;

  updateStock: (
    id: string,
    data: { current?: number; min?: number },
  ) => Promise<void>;
  adjustStock: (
    id: string,
    type: "IN" | "OUT",
    quantity: number,
    note?: string,
  ) => Promise<void>;

  addStaff: (staff: AdminStaffRow) => Promise<void>;
  updateStaff: (id: string, staff: AdminStaffRow) => void;
  deleteStaff: (id: string) => void;

  updateCustomer: (
    id: string,
    customer: { name?: string; email?: string; phone?: string },
  ) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  addTable: (table: AdminTableRow) => Promise<void>;
  updateTable: (id: string, table: AdminTableRow) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;

  addReservation: (
    reservation: Omit<AdminReservationRow, "id" | "tableId"> & {
      table_id?: number;
      tableId?: string;
    },
  ) => Promise<void>;
  updateReservation: (
    id: string,
    reservation: AdminReservationRow,
  ) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAdminAuthenticated: false,
      adminData: null,
      isDataLoading: false,
      dataError: null,
      orders: [],
      menus: [],
      categories: [],
      stocks: [],
      customers: [],
      staff: [],
      tables: [],
      reservations: [],

      login: async (name, password) => {
        try {
          if (!name || !password) return false;

          const user = await useAuthStore
            .getState()
            .loginWithCredentials(name, password, "admin");

          if (!validatePortalRole("admin", user.role_id)) {
            useAuthStore.getState().clearAuth();
            return false;
          }

          set({
            isAdminAuthenticated: true,
            adminData: {
              id: String(user.id),
              name: user.name,
              role: roleName(user.role_id),
            },
          });

          await get().fetchAllData();
          return true;
        } catch {
          return false;
        }
      },

      logout: async () => {
        await useAuthStore.getState().logout();
        set({ isAdminAuthenticated: false, adminData: null });
      },

      fetchAllData: async () => {
        set({ isDataLoading: true, dataError: null });
        try {
          const [catalog, operations, customers, staff, reservations] =
            await Promise.all([
              fetchAdminCatalog(),
              fetchAdminOperations(),
              fetchAdminCustomers().catch(() => []),
              fetchAdminStaff().catch(() => []),
              fetchAdminReservations().catch(() => []),
            ]);

          set({
            menus: catalog.menus,
            categories: catalog.categories,
            stocks: catalog.stocks,
            orders: operations.orders,
            tables: operations.tables,
            customers,
            staff,
            reservations,
            isDataLoading: false,
          });
        } catch (e) {
          set({
            isDataLoading: false,
            dataError: e instanceof Error ? e.message : "Gagal memuat data",
          });
        }
      },

      addOrder: async (order) => {
        const items: { menu_id: number; quantity: number }[] = (
          order.items || []
        ).map(
          (item: {
            id?: string;
            menuId?: number;
            qty?: number;
            quantity?: number;
          }) => ({
            menu_id: parseNumericId(item.id ?? item.menuId ?? 0),
            quantity: item.qty ?? item.quantity ?? 1,
          }),
        );

        const tableMatch = String(order.address || "").match(/Table\s*(\d+)/i);
        const tables = await tablesApi.listTables();
        const table = tableMatch
          ? tables.find((t) => String(t.table_number) === tableMatch[1])
          : undefined;

        const created = await ordersApi.createOrder({
          order_type:
            order.address?.toLowerCase().includes("takeaway") ||
            order.orderType === "takeaway"
              ? "takeaway"
              : "dine-in",
          table_id: table?.id,
          items: items.filter((i) => i.menu_id > 0),
        });

        const mapped = mapOrderToAdmin(created);
        set((state) => ({
          orders: [
            { ...mapped, customer: order.customer, phone: order.phone },
            ...state.orders,
          ],
        }));
      },

      updateOrderStatus: async (id, status) => {
        const updated = await updateOrderStatusOnApi(id, status);
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? updated : o)),
        }));
      },

      updateOrderPaymentStatus: (id, paymentStatus) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, paymentStatus } : o,
          ),
        })),

      deleteOrder: async (id) => {
        await deleteOrderOnApi(id);
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
        }));
      },

      addMenu: async (menu) => {
        const created = await createMenuOnApi({
          name: menu.name as string,
          categoryName: menu.category as string,
          categories: get().categories,
          price:
            (menu.priceRaw as number) ??
            (parseInt(String(menu.price).replace(/\D/g, ""), 10) || 0),
          description: menu.description as string | undefined,
          image: menu.image as string | undefined,
        });
        set((state) => ({ menus: [created, ...state.menus] }));
      },

      updateMenu: async (id, menu) => {
        const updated = await updateMenuOnApi(id, {
          name: menu.name as string,
          categoryName: menu.category as string,
          categories: get().categories,
          price:
            (menu.priceRaw as number) ??
            (parseInt(String(menu.price).replace(/\D/g, ""), 10) || 0),
          description: menu.description as string | undefined,
          image: menu.image as string | undefined,
          isActive: menu.isActive as boolean | undefined,
        });
        set((state) => ({
          menus: state.menus.map((m) => (m.id === id ? updated : m)),
        }));
      },

      deleteMenu: async (id) => {
        await deleteMenuOnApi(id);
        set((state) => ({
          menus: state.menus.filter((m) => m.id !== id),
        }));
      },

      addCategory: async (category) => {
        const created = await createCategoryOnApi(
          category.name,
          category.description,
        );
        set((state) => ({ categories: [created, ...state.categories] }));
      },

      updateCategory: async (id, category) => {
        const updated = await updateCategoryOnApi(id, category);
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? updated : c)),
        }));
      },

      deleteCategory: async (id, reassignTo) => {
        await deleteCategoryOnApi(id, reassignTo);
        if (reassignTo) {
          // Reassignment moved menus to another category, so refresh the
          // whole catalog to pick up the updated category/menu associations.
          const catalog = await fetchAdminCatalog();
          set({
            categories: catalog.categories,
            menus: catalog.menus,
            stocks: catalog.stocks,
          });
        } else {
          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
          }));
        }
      },

      updateStock: async (id, data) => {
        const updated = await updateStockOnApi(id, {
          quantity: data.current,
          min_stock: data.min,
        });
        set((state) => ({
          stocks: state.stocks.map((s) => (s.id === id ? updated : s)),
        }));
      },

      adjustStock: async (id, type, quantity, note) => {
        const updated = await adjustStockOnApi(id, { type, quantity, note });
        set((state) => ({
          stocks: state.stocks.map((s) => (s.id === id ? updated : s)),
        }));
      },

      addStaff: async () => {
        const staff = await fetchAdminStaff();
        set({ staff });
      },

      updateStaff: (id, staff) =>
        set((state) => ({
          staff: state.staff.map((s) => (s.id === id ? staff : s)),
        })),

      deleteStaff: (id) =>
        set((state) => ({
          staff: state.staff.filter((s) => s.id !== id),
        })),

      updateCustomer: async (id, customer) => {
        const updated = await usersApi.updateUser(parseNumericId(id), customer);
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id
              ? { ...c, name: updated.name, email: updated.email, phone: updated.phone || "-" }
              : c,
          ),
        }));
      },

      deleteCustomer: async (id) => {
        await usersApi.deleteUser(parseNumericId(id));
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }));
      },

      addTable: async (table) => {
        const tableNumber =
          table.tableNumber ??
          (parseInt(String(table.name).replace(/\D/g, ""), 10) || 1);
        const created = await createTableOnApi(
          tableNumber,
          table.capacity,
          table.qrCode,
        );
        set((state) => ({ tables: [created, ...state.tables] }));
      },

      updateTable: async (id, table) => {
        const updated = await updateTableOnApi(id, {
          status: table.status,
          table_number: table.tableNumber,
          capacity: table.capacity,
          qr_code: table.qrCode,
        });
        set((state) => ({
          tables: state.tables.map((t) => (t.id === id ? updated : t)),
        }));
      },

      deleteTable: async (id) => {
        await deleteTableOnApi(id);
        set((state) => ({
          tables: state.tables.filter((t) => t.id !== id),
        }));
      },

      addReservation: async (reservation) => {
        const tableId =
          reservation.table_id ??
          parseInt(reservation.tableId?.replace(/\D/g, "") || "0", 10);
        const created = await createReservationOnApi({
          customer_name: reservation.name,
          customer_email: reservation.email,
          customer_phone: reservation.phone,
          table_id: tableId,
          reservation_date: reservation.date,
          reservation_time: reservation.time.includes(":")
            ? reservation.time.length === 5
              ? `${reservation.time}:00`
              : reservation.time
            : `${reservation.time}:00`,
          guest_count: reservation.capacity,
          status: reservation.status?.toLowerCase() || "pending",
        });
        const tables = await tablesApi.listTables();
        const label = tables.find((t) => t.id === created.table_id);
        const row = mapReservationToAdmin(
          created,
          label ? `Table ${label.table_number}` : undefined,
        );
        set((state) => ({ reservations: [row, ...state.reservations] }));
      },

      updateReservation: async (id, reservation) => {
        const tableId = parseInt(
          reservation.tableId?.replace(/\D/g, "") ||
            String(reservation.table).replace(/\D/g, ""),
          10,
        );
        const updated = await updateReservationOnApi(id, {
          customer_name: reservation.name,
          customer_email: reservation.email,
          customer_phone: reservation.phone,
          table_id: tableId || undefined,
          reservation_date: reservation.date,
          reservation_time: reservation.time,
          guest_count: reservation.capacity,
          status: reservation.status?.toLowerCase(),
        });
        const row = mapReservationToAdmin(updated);
        set((state) => ({
          reservations: state.reservations.map((r) => (r.id === id ? row : r)),
        }));
      },

      deleteReservation: async (id) => {
        await deleteReservationOnApi(id);
        set((state) => ({
          reservations: state.reservations.filter((r) => r.id !== id),
        }));
      },
    }),
    {
      name: "admin-storage",
      partialize: (state) => ({
        isAdminAuthenticated: state.isAdminAuthenticated,
        adminData: state.adminData,
      }),
    },
  ),
);
