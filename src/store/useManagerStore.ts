import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  useAuthStore,
  roleName,
  validatePortalRole,
} from "@/store/useAuthStore";
import { dashboardApi } from "@/lib/api";

interface ManagerData {
  id: string;
  name: string;
  role: string;
}

interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  orderGrowth: number;
  activeTables: number;
  totalTables: number;
  lowStockItems: number;
  newCustomers: number;
  totalCustomers: number;
  customerGrowth: number;
  rewardRedemptions: number;
  totalStaff: number;
  activeRewards: number;
}

interface RevenueDataPoint {
  date: string;
  revenue: number;
}

interface PopularMenuItem {
  name: string;
  value: number;
}

export interface RecentOrder {
  orderId: number;
  customerName: string;
  items: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface ManagerState {
  managerData: ManagerData | null;
  isAuthenticated: boolean;
  isDataLoading: boolean;
  metrics: DashboardMetrics;
  revenueData: RevenueDataPoint[];
  popularMenuData: PopularMenuItem[];
  recentOrders: RecentOrder[];

  login: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchDashboard: () => Promise<void>;
}

const defaultMetrics: DashboardMetrics = {
  totalRevenue: 0,
  revenueGrowth: 0,
  totalOrders: 0,
  orderGrowth: 0,
  activeTables: 0,
  totalTables: 0,
  lowStockItems: 0,
  newCustomers: 0,
  totalCustomers: 0,
  customerGrowth: 0,
  rewardRedemptions: 0,
  totalStaff: 0,
  activeRewards: 0,
};

export const useManagerStore = create<ManagerState>()(
  persist(
    (set) => ({
      managerData: null,
      isAuthenticated: false,
      isDataLoading: false,
      metrics: defaultMetrics,
      revenueData: [],
      popularMenuData: [],
      recentOrders: [],

      login: async (name, password) => {
        try {
          if (!name || !password) return false;

          const user = await useAuthStore
            .getState()
            .loginWithCredentials(name, password, "manager");

          if (!validatePortalRole("manager", user.role_id)) {
            useAuthStore.getState().clearAuth();
            return false;
          }

          set({
            isAuthenticated: true,
            managerData: {
              id: String(user.id),
              name: user.name,
              role: roleName(user.role_id),
            },
          });

          await useManagerStore.getState().fetchDashboard();
          return true;
        } catch {
          return false;
        }
      },

      logout: async () => {
        await useAuthStore.getState().logout();
        set({ managerData: null, isAuthenticated: false });
      },

      fetchDashboard: async () => {
        set({ isDataLoading: true });
        try {
          const data = await dashboardApi.getAdminDashboard();
          set({
            metrics: {
              totalRevenue: data.total_revenue ?? 0,
              revenueGrowth: data.revenue_growth ?? 0,
              totalOrders: data.total_orders ?? 0,
              orderGrowth: data.order_growth ?? 0,
              activeTables: data.active_tables ?? 0,
              totalTables: data.total_tables ?? 0,
              lowStockItems: data.low_stock_items ?? 0,
              newCustomers: data.new_customers ?? 0,
              totalCustomers: data.total_customers ?? 0,
              customerGrowth: data.customer_growth ?? 0,
              rewardRedemptions: data.reward_redemptions ?? 0,
              totalStaff: data.total_staff ?? 0,
              activeRewards: data.active_rewards ?? 0,
            },
            revenueData: data.revenue_chart ?? [],
            popularMenuData: (data.top_menus ?? []).map((m) => ({
              name: m.name,
              value: m.quantity,
            })),
            recentOrders: (data.recent_orders ?? []).map((o) => ({
              orderId: o.order_id,
              customerName: o.customer_name,
              items: o.items,
              totalPrice: o.total_price,
              status: o.status,
              createdAt: o.created_at,
            })),
            isDataLoading: false,
          });
        } catch {
          set({ isDataLoading: false });
        }
      },
    }),
    {
      name: "manager-storage",
      partialize: (state) => ({
        managerData: state.managerData,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
