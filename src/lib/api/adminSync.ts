import {
  categoriesApi,
  menusApi,
  ordersApi,
  stocksApi,
  tablesApi,
  usersApi,
  reservationsApi,
  paymentsApi,
} from "@/lib/api";
import {
  mapCategoryToAdmin,
  mapMenuToAdmin,
  mapOrderToAdmin,
  mapStockToAdmin,
  mapTableToAdmin,
  mapUserToAdminCustomer,
  mapPaymentToAdmin,
  parseNumericId,
} from "@/lib/api/mappers";
import { ROLE } from "@/lib/api/types";
import type { ApiReservation } from "@/lib/api/types";

export async function fetchAdminCatalog() {
  const [categories, menus, stocks] = await Promise.all([
    categoriesApi.listCategories(),
    menusApi.listMenus(),
    stocksApi.listStocks().catch(() => []),
  ]);

  const stockByMenuId = new Map(stocks.map((s) => [s.menu_id, s.quantity]));

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const menuCountByCategory = menus.reduce<Record<number, number>>((acc, m) => {
    if (m.category_id) {
      acc[m.category_id] = (acc[m.category_id] || 0) + 1;
    }
    return acc;
  }, {});

  return {
    categories: categories.map((c) =>
      mapCategoryToAdmin(c, menuCountByCategory[c.id] || 0),
    ),
    menus: menus
      .filter((m) => m.is_active !== false)
      .map((m) =>
        mapMenuToAdmin(
          m,
          categoryMap.get(m.category_id || 0),
          stockByMenuId.get(m.id),
        ),
      ),
    stocks: stocks.map(mapStockToAdmin),
  };
}

export async function fetchAdminOperations() {
  const [orders, tables] = await Promise.all([
    ordersApi.listOrders(),
    tablesApi.listTables(),
  ]);

  return {
    orders: orders.map(mapOrderToAdmin),
    tables: tables.map(mapTableToAdmin),
  };
}

export async function fetchAdminCustomers() {
  const [users, orders] = await Promise.all([
    usersApi.listUsers(),
    ordersApi.listOrders().catch(() => []),
  ]);
  const customers = users.filter(
    (u) => u.role_id === ROLE.CUSTOMER && u.status !== "inactive",
  );

  const completedOrdersByUser = orders.reduce<Record<number, number>>(
    (acc, o) => {
      if (o.status === "completed" && o.user_id != null) {
        acc[o.user_id] = (acc[o.user_id] || 0) + 1;
      }
      return acc;
    },
    {},
  );

  return Promise.all(
    customers.map(async (user) => {
      const completedOrders = completedOrdersByUser[user.id] || 0;
      try {
        const pointsData = await usersApi.getUserPoints(user.id);
        return mapUserToAdminCustomer(
          user,
          pointsData.total_point,
          completedOrders,
          pointsData.tier,
        );
      } catch {
        return mapUserToAdminCustomer(user, 0, completedOrders);
      }
    }),
  );
}

export async function fetchAdminStaff() {
  const users = await usersApi.listUsers();
  return users
    .filter(
      (u) =>
        u.role_id === ROLE.CASHIER ||
        u.role_id === ROLE.MANAGER ||
        u.role_id === ROLE.SUPER_ADMIN,
    )
    .map((u) => ({
      id: String(u.id),
      name: u.name,
      role:
        u.role?.name ||
        (u.role_id === ROLE.CASHIER
          ? "Cashier"
          : u.role_id === ROLE.MANAGER
            ? "Manager"
            : "SuperAdmin"),
      shift: "-",
      status: u.status === "active" ? "Active" : "Inactive",
      email: u.email,
      phone: u.phone || "-",
    }));
}

export function mapReservationToAdmin(
  r: ApiReservation,
  tableLabel?: string,
) {
  return {
    id: String(r.id),
    name: r.customer_name,
    phone: r.customer_phone,
    email: r.customer_email || "-",
    table: tableLabel || `Table ${r.table?.table_number ?? r.table_id}`,
    tableId: String(r.table_id),
    capacity: r.guest_count,
    date: r.reservation_date,
    time: r.reservation_time,
    status:
      r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase(),
  };
}

export async function fetchAdminReservations() {
  const [reservations, tables] = await Promise.all([
    reservationsApi.listReservations().catch(() => []),
    tablesApi.listTables(),
  ]);
  const tableMap = new Map(
    tables.map((t) => [t.id, `Table ${t.table_number}`]),
  );
  return reservations.map((r) =>
    mapReservationToAdmin(r, tableMap.get(r.table_id)),
  );
}

export async function fetchAdminPayments() {
  const payments = await paymentsApi.listPayments().catch(() => []);
  return payments.map((p) => mapPaymentToAdmin(p));
}

export async function createMenuOnApi(data: {
  name: string;
  categoryName: string;
  categories: { id: string; name: string }[];
  price: number;
  description?: string;
  image?: string;
}) {
  const category = data.categories.find((c) => c.name === data.categoryName);
  const created = await menusApi.createMenu({
    name: data.name,
    price: data.price,
    category_id: category ? parseNumericId(category.id) : undefined,
    description: data.description,
    image: data.image,
  });
  return mapMenuToAdmin(created, data.categoryName, 0);
}

export async function updateMenuOnApi(
  id: string,
  data: {
    name: string;
    categoryName: string;
    categories: { id: string; name: string }[];
    price: number;
    description?: string;
    image?: string;
    isActive?: boolean;
  },
) {
  const category = data.categories.find((c) => c.name === data.categoryName);
  const updated = await menusApi.updateMenu(parseNumericId(id), {
    name: data.name,
    price: data.price,
    category_id: category ? parseNumericId(category.id) : undefined,
    description: data.description,
    image: data.image,
    is_active: data.isActive,
  });
  return mapMenuToAdmin(updated, data.categoryName);
}

export async function deleteMenuOnApi(id: string) {
  await menusApi.deleteMenu(parseNumericId(id));
}

export async function createCategoryOnApi(name: string, description?: string) {
  const created = await categoriesApi.createCategory({ name, description });
  return mapCategoryToAdmin(created, 0);
}

export async function updateCategoryOnApi(
  id: string,
  data: { name: string; description?: string },
) {
  const updated = await categoriesApi.updateCategory(parseNumericId(id), data);
  return mapCategoryToAdmin(updated);
}

export async function deleteCategoryOnApi(id: string, reassignTo?: string) {
  await categoriesApi.deleteCategory(
    parseNumericId(id),
    reassignTo !== undefined ? parseNumericId(reassignTo) : undefined,
  );
}

export async function updateStockOnApi(
  id: string,
  data: { quantity?: number; min_stock?: number },
) {
  const updated = await stocksApi.updateStock(parseNumericId(id), data);
  return mapStockToAdmin(updated);
}

export async function adjustStockOnApi(
  id: string,
  data: { type: "IN" | "OUT"; quantity: number; note?: string },
) {
  const updated = await stocksApi.adjustStock(parseNumericId(id), data);
  return mapStockToAdmin(updated);
}

export async function updateOrderStatusOnApi(id: string, status: string) {
  const updated = await ordersApi.updateOrderStatus(parseNumericId(id), status);
  return mapOrderToAdmin(updated);
}

export async function deleteOrderOnApi(id: string) {
  await ordersApi.deleteOrder(parseNumericId(id));
}

export async function createTableOnApi(
  tableNumber: number,
  capacity?: number,
  qrCode?: string,
) {
  const created = await tablesApi.createTable({
    table_number: tableNumber,
    capacity: capacity && capacity > 0 ? capacity : 4,
    qr_code: qrCode,
  });
  return mapTableToAdmin(created);
}

export async function updateTableOnApi(
  id: string,
  data: {
    status?: string;
    table_number?: number;
    capacity?: number;
    qr_code?: string;
  },
) {
  const payload: {
    status?: string;
    table_number?: number;
    capacity?: number;
    qr_code?: string;
  } = {};
  if (data.status) payload.status = data.status.toLowerCase();
  if (data.table_number !== undefined) payload.table_number = data.table_number;
  if (data.capacity !== undefined) payload.capacity = data.capacity;
  if (data.qr_code) payload.qr_code = data.qr_code;
  const updated = await tablesApi.updateTable(parseNumericId(id), payload);
  return mapTableToAdmin(updated);
}

export async function deleteTableOnApi(id: string) {
  await tablesApi.deleteTable(parseNumericId(id));
}

export async function createReservationOnApi(data: {
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  table_id: number;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  status?: string;
}) {
  const created = await reservationsApi.createReservation(data);
  return created;
}

export async function updateReservationOnApi(
  id: string,
  data: Partial<{
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    table_id: number;
    reservation_date: string;
    reservation_time: string;
    guest_count: number;
    status: string;
  }>,
) {
  return reservationsApi.updateReservation(parseNumericId(id), data);
}

export async function deleteReservationOnApi(id: string) {
  await reservationsApi.deleteReservation(parseNumericId(id));
}
