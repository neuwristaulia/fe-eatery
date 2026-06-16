import type {
  ApiCategory,
  ApiMenu,
  ApiOrder,
  ApiOrderItem,
  ApiStock,
  ApiTable,
  ApiUser,
  ApiReward,
  ApiPayment,
} from "./types";

export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function parseNumericId(id: string | number): number {
  if (typeof id === "number") return id;
  const parsed = parseInt(String(id).replace(/\D/g, ""), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** Customer-facing menu item */
export interface CustomerMenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface CustomerCategory {
  id: string;
  name: string;
}

export function mapCategoryToCustomer(cat: ApiCategory): CustomerCategory {
  return { id: String(cat.id), name: cat.name };
}

export function mapMenuToCustomer(menu: ApiMenu): CustomerMenuItem {
  return {
    id: String(menu.id),
    categoryId: menu.category_id ? String(menu.category_id) : "",
    name: menu.name,
    description: menu.description || "",
    price: menu.price,
    image:
      menu.image ||
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=500",
  };
}

/** Admin UI menu row */
export function mapMenuToAdmin(
  menu: ApiMenu,
  categoryName?: string,
  stockQty?: number,
) {
  return {
    id: String(menu.id),
    name: menu.name,
    category: categoryName || menu.category?.name || "Uncategorized",
    categoryId: menu.category_id,
    price: formatRupiah(menu.price),
    priceRaw: menu.price,
    description: menu.description || "",
    stock: stockQty ?? menu.stock?.quantity ?? 0,
    image:
      menu.image ||
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150",
    isActive: menu.is_active !== false,
  };
}

export function mapCategoryToAdmin(cat: ApiCategory, itemCount = 0) {
  return {
    id: String(cat.id),
    name: cat.name,
    description: cat.description || "",
    items: itemCount,
    status: "Active",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100",
  };
}

export function mapStockToAdmin(stock: ApiStock) {
  const menuName = stock.menu?.name || `Menu #${stock.menu_id}`;
  const qty = stock.quantity;
  const min = stock.min_stock;
  let status = "normal";
  if (qty <= 0) status = "out";
  else if (qty <= min) status = "low";

  return {
    id: String(stock.id),
    menuId: stock.menu_id,
    item: menuName,
    category: stock.menu?.category?.name || "Menu",
    current: qty,
    unit: "pcs",
    min,
    status,
  };
}

export function mapTableToAdmin(table: ApiTable) {
  const statusMap: Record<string, string> = {
    available: "Available",
    occupied: "Occupied",
    reserved: "Reserved",
  };
  return {
    id: String(table.id),
    name: `Table ${table.table_number}`,
    tableNumber: table.table_number,
    capacity: table.capacity ?? 4,
    status:
      statusMap[table.status?.toLowerCase()] || table.status || "Available",
    qrCode: table.qr_code,
  };
}

export function mapTableToStaff(table: ApiTable) {
  const status = table.status?.toLowerCase();
  const staffStatus =
    status === "occupied"
      ? "occupied"
      : status === "reserved"
        ? "reserved"
        : status === "unavailable"
          ? "unavailable"
          : "available";

  return {
    id: String(table.id),
    number: String(table.table_number),
    capacity: 4,
    status: staffStatus as
      | "available"
      | "reserved"
      | "occupied"
      | "unavailable",
  };
}

function getOrderItems(order: ApiOrder): ApiOrderItem[] {
  return order.order_items || [];
}

function itemDisplayName(item: ApiOrderItem): string {
  return item.menu?.name || item.menu_name || `Menu #${item.menu_id}`;
}

function orderTotal(order: ApiOrder): number {
  return order.total_price ?? 0;
}

export function mapOrderToAdmin(order: ApiOrder) {
  const items = getOrderItems(order).map((item) => ({
    name: itemDisplayName(item),
    qty: item.quantity,
    price: item.price || 0,
    menuId: item.menu_id,
  }));

  const total = orderTotal(order);
  const customerName = order.user?.name || order.guest_name || "Guest";
  const date = order.created_at
    ? new Date(order.created_at).toLocaleString("id-ID")
    : new Date().toLocaleString("id-ID");

  return {
    id: String(order.id),
    customer: customerName,
    phone: order.user?.phone || order.guest_phone || "-",
    address: order.table_id
      ? `Dine-in (Table ${order.table?.table_number ?? order.table_id})`
      : order.order_type === "takeaway"
        ? "Takeaway"
        : "-",
    date,
    items,
    total: formatRupiah(total),
    totalRaw: total,
    status: order.status,
    paymentStatus: order.payment?.status || "unpaid",
    orderType: order.order_type,
    tableId: order.table_id,
  };
}

export function mapOrderToStaff(order: ApiOrder) {
  const items = getOrderItems(order).map((item) => ({
    id: String(item.menu_id),
    name: itemDisplayName(item),
    qty: item.quantity,
    price: item.price || item.menu?.price || 0,
  }));

  const itemsSubtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const rawTotal = orderTotal(order);
  // total_price from backend already includes 11% tax; fall back to computing it locally
  const total = rawTotal || Math.round(itemsSubtotal * 1.11);
  const subtotal = itemsSubtotal || Math.round(total / 1.11);
  const tax = Math.max(0, total - subtotal);

  const created = order.created_at ? new Date(order.created_at) : new Date();
  const time = `${created.getHours().toString().padStart(2, "0")}:${created.getMinutes().toString().padStart(2, "0")}`;

  const staffStatusMap: Record<string, string> = {
    pending: "pending",
    order_placed: "order_placed",
    confirmed: "confirmed",
    preparing: "preparing",
    completed: "completed",
    cancelled: "cancelled",
    refunded: "refunded",
  };

  return {
    id: String(order.id),
    customerName: order.user?.name || order.guest_name || "Guest",
    customerPhone: order.user?.phone || order.guest_phone,
    type: (order.order_type === "takeaway" ? "takeaway" : "dine-in") as
      | "dine-in"
      | "takeaway"
      | "pickup",
    tableNumber: order.table_id ? String(order.table_id) : undefined,
    time,
    items,
    subtotal,
    tax,
    total,
    status: (staffStatusMap[order.status] || order.status) as
      | "pending"
      | "order_placed"
      | "confirmed"
      | "preparing"
      | "completed"
      | "cancelled"
      | "refunded",
    paymentStatus: (order.payment?.status || "unpaid") as
      | "unpaid"
      | "paid"
      | "refunded"
      | "failed",
    paymentId: order.payment?.id,
    paymentMethod: order.payment?.method,
    midtransOrderId: order.payment?.midtrans_order_id,
    midtransTransactionId: order.payment?.midtrans_transaction_id,
    transactionStatus: order.payment?.transaction_status,
    refundReason: order.payment?.refund_reason,
    refundMethod: order.payment?.refund_method,
    refundedAmount: order.payment?.refunded_amount,
  };
}

export function mapOrderToCustomer(order: ApiOrder) {
  const items = getOrderItems(order);
  const itemNames = items.map((i) => itemDisplayName(i)).join(", ");
  const total = orderTotal(order);

  return {
    id: String(order.id),
    date: order.created_at || new Date().toISOString(),
    status: order.status,
    total,
    items: itemNames || "Order items",
  };
}

export function mapUserToAdminCustomer(
  user: ApiUser,
  points = 0,
  completedOrders = 0,
  tier?: string,
) {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    phone: user.phone || "-",
    address: "-",
    joined: user.created_at
      ? new Date(user.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-",
    orders: completedOrders,
    points,
    tier: tier || (points >= 101 ? "Gold" : points >= 51 ? "Silver" : "Bronze"),
    lifetimeValue: "Rp 0",
  };
}

export function mapRewardToCustomer(reward: ApiReward) {
  return {
    id: String(reward.id),
    name: reward.name,
    pointsRequired: reward.point_required,
  };
}

export function mapPaymentToAdmin(payment: ApiPayment, order?: ApiOrder) {
  return {
    id: String(payment.id),
    orderId: String(payment.order_id),
    customer: order?.user?.name || order?.guest_name || `Order #${payment.order_id}`,
    method: payment.method,
    amount: formatRupiah(payment.total_payment || order?.total_price || 0),
    status: payment.status,
    date: payment.created_at
      ? new Date(payment.created_at).toLocaleString("id-ID")
      : "-",
  };
}
