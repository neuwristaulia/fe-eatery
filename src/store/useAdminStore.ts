import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialOrdersData = [
  { id: "ORD-001", customer: "Budi Santoso", phone: "081234567890", address: "Jl. Mawar No. 12", date: "2023-10-27 14:30", items: [{name: "Kopi e-Eatery Signature", qty: 2, price: 50000}, {name: "Kaya Toast", qty: 1, price: 35000}], total: "Rp 85.000", status: "ready", paymentStatus: "paid" },
  { id: "ORD-002", customer: "Siti Aminah", phone: "081298765432", address: "Dine-in (Table 4)", date: "2023-10-27 14:15", items: [{name: "Nasi Goreng Spesial", qty: 1, price: 45000}], total: "Rp 45.000", status: "created", paymentStatus: "pending" },
  { id: "ORD-003", customer: "Andi Wijaya", phone: "081345678901", address: "Jl. Melati No. 5", date: "2023-10-27 13:50", items: [{name: "Teh Tarik", qty: 3, price: 60000}, {name: "Roti Bakar", qty: 2, price: 50000}], total: "Rp 110.000", status: "completed", paymentStatus: "paid" },
  { id: "ORD-004", customer: "Dewi Lestari", phone: "085678901234", address: "Dine-in (Table 1)", date: "2023-10-27 13:20", items: [{name: "Mie Goreng Seafood", qty: 1, price: 55000}], total: "Rp 55.000", status: "confirmed", paymentStatus: "paid" },
];

const initialMenuData = [
  { id: "M01", name: "Kopi e-Eatery Signature", category: "Signatures", price: "Rp 25.000", stock: 45, image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150" },
  { id: "M02", name: "Kaya Toast Premium", category: "Toast", price: "Rp 35.000", stock: 20, image: "https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=150" },
  { id: "M03", name: "Nasi Goreng Spesial", category: "Rice", price: "Rp 45.000", stock: 30, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=150" },
  { id: "M04", name: "Teh Tarik Malaya", category: "Drinks", price: "Rp 20.000", stock: 50, image: "https://images.unsplash.com/photo-1626804475297-4160aeea1a52?w=150" },
];

const initialCategoriesData = [
  { id: "CAT-1", name: "Signatures", items: 12, status: "Active", image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100" },
  { id: "CAT-2", name: "Rice", items: 8, status: "Active", image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=100" },
  { id: "CAT-3", name: "Noodles", items: 6, status: "Active", image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=100" },
  { id: "CAT-4", name: "Toast", items: 5, status: "Active", image: "https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=100" },
  { id: "CAT-5", name: "Drinks", items: 15, status: "Active", image: "https://images.unsplash.com/photo-1626804475297-4160aeea1a52?w=100" },
];

const initialStockData = [
  { id: "STK-01", item: "Biji Kopi Arabica", category: "Raw Material", current: 15, unit: "kg", min: 5, status: "normal" },
  { id: "STK-02", item: "Susu Kental Manis", category: "Raw Material", current: 2, unit: "kaleng", min: 10, status: "low" },
  { id: "STK-03", item: "Roti Tawar Premium", category: "Raw Material", current: 8, unit: "pack", min: 10, status: "low" },
  { id: "STK-04", item: "Beras Wangi", category: "Raw Material", current: 50, unit: "kg", min: 20, status: "normal" },
  { id: "STK-05", item: "Cup Takeaway", category: "Packaging", current: 450, unit: "pcs", min: 100, status: "normal" },
];

const initialCustomersData = [
  { id: "CUST-001", name: "Budi Santoso", email: "budi@example.com", phone: "081234567890", address: "Jl. Mawar No. 12", joined: "12 Jan 2023", orders: 45, points: 2500, tier: "Gold", lifetimeValue: "Rp 3.500.000" },
  { id: "CUST-002", name: "Siti Aminah", email: "siti@example.com", phone: "081298765432", address: "Apartemen Senopati", joined: "05 Mar 2023", orders: 12, points: 600, tier: "Silver", lifetimeValue: "Rp 850.000" },
  { id: "CUST-003", name: "Andi Wijaya", email: "andi@example.com", phone: "081345678901", address: "Jl. Melati No. 5", joined: "20 Oct 2023", orders: 2, points: 100, tier: "Bronze", lifetimeValue: "Rp 150.000" },
  { id: "CUST-004", name: "Dewi Lestari", email: "dewi@example.com", phone: "085678901234", address: "Jl. Sudirman", joined: "15 Aug 2023", orders: 28, points: 1400, tier: "Silver", lifetimeValue: "Rp 1.800.000" },
];

interface Staff {
  id: string;
  name: string;
  role: string;
  shift: string;
  status: string;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  status: string;
  time?: string;
  orderId?: string;
}

interface AdminState {
  isAdminAuthenticated: boolean;
  adminData: any | null;
  orders: any[];
  menus: any[];
  categories: any[];
  stocks: any[];
  customers: any[];
  staff: Staff[];
  tables: Table[];
  login: (adminId: string, password: string) => Promise<boolean>;
  logout: () => void;
  addOrder: (order: any) => void;
  updateOrderStatus: (id: string, status: string) => void;
  updateOrderPaymentStatus: (id: string, paymentStatus: string) => void;
  deleteOrder: (id: string) => void;
  addMenu: (menu: any) => void;
  updateMenu: (id: string, menu: any) => void;
  deleteMenu: (id: string) => void;
  addCategory: (category: any) => void;
  updateCategory: (id: string, category: any) => void;
  deleteCategory: (id: string) => void;
  addStock: (stock: any) => void;
  updateStock: (id: string, stock: any) => void;
  deleteStock: (id: string) => void;
  addCustomer: (customer: any) => void;
  updateCustomerPoints: (id: string, points: number) => void;
  addStaff: (staff: Staff) => void;
  updateStaff: (id: string, staff: Staff) => void;
  deleteStaff: (id: string) => void;
  addTable: (table: Table) => void;
  updateTable: (id: string, table: Table) => void;
  deleteTable: (id: string) => void;
  reduceMenuStock: (items: {name: string, qty: number}[]) => void;
}

const initialStaffData: Staff[] = [
  { id: "EMP-01", name: "Ahmad Rizky", role: "Cashier", shift: "Pagi", status: "Active" },
  { id: "EMP-02", name: "Dina Fitri", role: "Waitress", shift: "Siang", status: "Active" },
  { id: "EMP-04", name: "Joko Anwar", role: "Chef", shift: "Malam", status: "Off" },
];

const initialTablesData: Table[] = [
  { id: "T-01", name: "Table 1", capacity: 4, status: "Available" },
  { id: "T-02", name: "Table 2", capacity: 2, status: "Occupied", orderId: "ORD-051" },
  { id: "T-03", name: "Table 3", capacity: 4, status: "Reserved", time: "18:00" },
  { id: "T-04", name: "Table 4", capacity: 6, status: "Available" },
  { id: "T-05", name: "Table 5", capacity: 2, status: "Occupied", orderId: "ORD-052" },
  { id: "T-06", name: "Table 6", capacity: 2, status: "Available" },
  { id: "T-07", name: "Table 7", capacity: 8, status: "Available" },
  { id: "T-08", name: "Table 8", capacity: 4, status: "Reserved", time: "19:30" },
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAdminAuthenticated: false,
      adminData: null,
      orders: initialOrdersData,
      menus: initialMenuData,
      categories: initialCategoriesData,
      stocks: initialStockData,
      customers: initialCustomersData,
      staff: initialStaffData,
      tables: initialTablesData,
      login: async (adminId, password) => {
        // Dummy authentication
        return new Promise((resolve) => {
          setTimeout(() => {
            if (adminId.toUpperCase() === "ADM001" && password === "admin123") {
              set({ isAdminAuthenticated: true, adminData: { id: "ADM001", name: "Admin Utama", role: "Super Admin" } });
              resolve(true);
            } else {
              resolve(false);
            }
          }, 1500); // simulate network delay
        });
      },
      logout: () => set({ isAdminAuthenticated: false, adminData: null }),
      addOrder: (order) => set((state) => {
        const customerExists = state.customers.find(c => c.name.toLowerCase() === order.customer.toLowerCase());
        let updatedCustomers = state.customers;
        
        if (!customerExists) {
          const newCustomer = {
            id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
            name: order.customer,
            email: "-",
            phone: order.phone || "-",
            address: order.address,
            joined: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            orders: 1,
            points: 10,
            tier: "Bronze",
            lifetimeValue: order.total
          };
          updatedCustomers = [...state.customers, newCustomer];
        } else {
          updatedCustomers = state.customers.map(c => {
            if (c.name.toLowerCase() === order.customer.toLowerCase()) {
              const currentLtvNumber = parseInt(c.lifetimeValue.replace(/\D/g, '')) || 0;
              const newOrderTotalNumber = parseInt(order.total.replace(/\D/g, '')) || 0;
              const newLtv = `Rp ${(currentLtvNumber + newOrderTotalNumber).toLocaleString('id-ID')}`;
              
              const newPoints = c.points + Math.floor(newOrderTotalNumber / 10000);
              let newTier = c.tier;
              if (newPoints >= 2000) newTier = "Gold";
              else if (newPoints >= 500) newTier = "Silver";
              
              return {
                ...c,
                orders: c.orders + 1,
                points: newPoints,
                tier: newTier,
                lifetimeValue: newLtv
              };
            }
            return c;
          });
        }
        
        return { 
          orders: [order, ...state.orders],
          customers: updatedCustomers
        };
      }),
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
      })),
      updateOrderPaymentStatus: (id, paymentStatus) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, paymentStatus } : o)
      })),
      deleteOrder: (id) => set((state) => ({
        orders: state.orders.filter(o => o.id !== id)
      })),
      addMenu: (menu) => set((state) => ({ menus: [menu, ...state.menus] })),
      updateMenu: (id, menu) => set((state) => ({
        menus: state.menus.map(m => m.id === id ? menu : m)
      })),
      deleteMenu: (id) => set((state) => ({
        menus: state.menus.filter(m => m.id !== id)
      })),
      addCategory: (category) => set((state) => ({ categories: [category, ...state.categories] })),
      updateCategory: (id, category) => set((state) => ({
        categories: state.categories.map(c => c.id === id ? category : c)
      })),
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id)
      })),
      addStock: (stock) => set((state) => ({ stocks: [stock, ...state.stocks] })),
      updateStock: (id, stock) => set((state) => ({
        stocks: state.stocks.map(s => s.id === id ? stock : s)
      })),
      deleteStock: (id) => set((state) => ({
        stocks: state.stocks.filter(s => s.id !== id)
      })),
      addCustomer: (customer) => set((state) => ({ customers: [customer, ...state.customers] })),
      updateCustomerPoints: (id, points) => set((state) => ({
        customers: state.customers.map(c => {
          if (c.id === id) {
            const newPoints = c.points + points;
            let newTier = c.tier;
            if (newPoints >= 2000) newTier = "Gold";
            else if (newPoints >= 500) newTier = "Silver";
            else newTier = "Bronze";
            return { ...c, points: newPoints, tier: newTier };
          }
          return c;
        })
      })),
      addStaff: (staff) => set((state) => ({ staff: [staff, ...state.staff] })),
      updateStaff: (id, staff) => set((state) => ({
        staff: state.staff.map(s => s.id === id ? staff : s)
      })),
      deleteStaff: (id) => set((state) => ({
        staff: state.staff.filter(s => s.id !== id)
      })),
      addTable: (table) => set((state) => ({ tables: [table, ...state.tables] })),
      updateTable: (id, table) => set((state) => ({
        tables: state.tables.map(t => t.id === id ? table : t)
      })),
      deleteTable: (id) => set((state) => ({
        tables: state.tables.filter(t => t.id !== id)
      })),
      reduceMenuStock: (items) => set((state) => {
        const updatedMenus = state.menus.map(menu => {
          const orderedItem = items.find(i => i.name.toLowerCase() === menu.name.toLowerCase());
          if (orderedItem) {
            return {
              ...menu,
              stock: Math.max(0, menu.stock - orderedItem.qty)
            };
          }
          return menu;
        });
        return { menus: updatedMenus };
      }),
    }),
    {
      name: "admin-storage",
      partialize: (state) => ({ 
        isAdminAuthenticated: state.isAdminAuthenticated,
        adminData: state.adminData,
        orders: state.orders, 
        menus: state.menus, 
        categories: state.categories, 
        stocks: state.stocks,
        customers: state.customers,
        staff: state.staff,
        tables: state.tables
      }),
    }
  )
);
