/**
 * Maps API/JSON payloads to canonical shapes (supports GORM `id` or DB column names).
 */

import type {
  ApiCategory,
  ApiMenu,
  ApiOrder,
  ApiOrderItem,
  ApiPayment,
  ApiStock,
  ApiTable,
  ApiUser,
  ApiReward,
  ApiVoucher,
  ApiPoint,
  ApiCustomerLoyalty,
  ApiSalesByMenuReport,
} from "./types";

type Raw = Record<string, unknown>;

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isNaN(n) ? fallback : n;
  }
  return fallback;
}

function str(v: unknown, fallback = ""): string {
  return v != null ? String(v) : fallback;
}

function bool(v: unknown, fallback = true): boolean {
  if (typeof v === "boolean") return v;
  return fallback;
}

export function normalizeUser(raw: Raw): ApiUser {
  const role = raw.role as Raw | undefined;
  return {
    id: num(raw.user_id ?? raw.id),
    name: str(raw.name),
    email: str(raw.email),
    phone: raw.phone != null ? str(raw.phone) : undefined,
    role_id: num(raw.role_id),
    status: raw.status != null ? str(raw.status) : undefined,
    staff_shift: raw.staff_shift != null ? str(raw.staff_shift) : undefined,
    last_login: raw.last_login != null ? str(raw.last_login) : undefined,
    created_at: raw.created_at != null ? str(raw.created_at) : undefined,
    role: role
      ? {
          id: num(role.role_id ?? role.id),
          name: str(role.role_name ?? role.name),
        }
      : undefined,
  };
}

export function normalizeCategory(raw: Raw): ApiCategory {
  return {
    id: num(raw.category_id ?? raw.id),
    name: str(raw.name),
    description: raw.description != null ? str(raw.description) : undefined,
  };
}

export function normalizeMenu(raw: Raw): ApiMenu {
  const cat = raw.category as Raw | undefined;
  return {
    id: num(raw.menu_id ?? raw.id),
    category_id: raw.category_id != null ? num(raw.category_id) : undefined,
    name: str(raw.name),
    price: num(raw.price),
    description: raw.description != null ? str(raw.description) : undefined,
    image: raw.image != null ? str(raw.image) : undefined,
    is_active: bool(raw.is_active, true),
    category: cat ? normalizeCategory(cat) : undefined,
    stock: raw.stock ? normalizeStock(raw.stock as Raw) : undefined,
  };
}

export function normalizeStock(raw: Raw): ApiStock {
  const menu = raw.menu as Raw | undefined;
  return {
    id: num(raw.stock_id ?? raw.id),
    menu_id: num(raw.menu_id),
    quantity: num(raw.quantity),
    min_stock: num(raw.min_stock),
    updated_at: raw.updated_at != null ? str(raw.updated_at) : undefined,
    menu: menu ? normalizeMenu(menu) : undefined,
  };
}

export function normalizeTable(raw: Raw): ApiTable {
  return {
    id: num(raw.table_id ?? raw.id),
    table_number: num(raw.table_number),
    status: str(raw.status, "available"),
    capacity:
      raw.capacity != null
        ? num(raw.capacity)
        : raw.table_capacity != null
          ? num(raw.table_capacity)
          : undefined,
    qr_code: raw.qr_code != null ? str(raw.qr_code) : undefined,
  };
}

export function normalizeOrderItem(raw: Raw): ApiOrderItem {
  const menu = raw.menu as Raw | undefined;
  return {
    id: num(raw.order_item_id ?? raw.id),
    order_id: raw.order_id != null ? num(raw.order_id) : undefined,
    menu_id: num(raw.menu_id),
    quantity: num(raw.quantity),
    price: raw.price != null ? num(raw.price) : undefined,
    menu_name: raw.menu_name != null ? str(raw.menu_name) : undefined,
    menu: menu ? normalizeMenu(menu) : undefined,
  };
}

export function normalizeOrder(raw: Raw): ApiOrder {
  const itemsRaw = (raw.order_items ?? raw.items) as Raw[] | undefined;
  const user = raw.user as Raw | undefined;
  const table = raw.table as Raw | undefined;
  const payment = raw.payment as Raw | undefined;

  return {
    id: num(raw.order_id ?? raw.id),
    user_id: raw.user_id != null ? num(raw.user_id) : undefined,
    guest_name: raw.guest_name != null ? str(raw.guest_name) : undefined,
    guest_phone: raw.guest_phone != null ? str(raw.guest_phone) : undefined,
    table_id: raw.table_id != null ? num(raw.table_id) : undefined,
    order_type: str(raw.order_type),
    status: str(raw.status),
    total_price: num(raw.total_price ?? raw.total_amount ?? raw.total),
    created_at: raw.created_at != null ? str(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? str(raw.updated_at) : undefined,
    order_items: itemsRaw?.map(normalizeOrderItem),
    user: user ? normalizeUser(user) : undefined,
    table: table ? normalizeTable(table) : undefined,
    payment: payment ? normalizePayment(payment) : undefined,
  };
}

export function normalizePayment(raw: Raw): ApiPayment {
  const order = raw.order as Raw | undefined;
  return {
    id: num(raw.payment_id ?? raw.id),
    order_id: num(raw.order_id),
    method: str(raw.method),
    status: str(raw.status, "unpaid"),
    total_payment: num(raw.total_payment ?? raw.amount),
    refunded_amount:
      raw.refunded_amount != null ? num(raw.refunded_amount) : undefined,
    refund_reason:
      raw.refund_reason != null ? str(raw.refund_reason) : undefined,
    refund_method:
      raw.refund_method != null ? str(raw.refund_method) : undefined,
    snap_token: raw.snap_token != null ? str(raw.snap_token) : undefined,
    redirect_url: raw.redirect_url != null ? str(raw.redirect_url) : undefined,
    midtrans_order_id:
      raw.midtrans_order_id != null ? str(raw.midtrans_order_id) : undefined,
    midtrans_transaction_id:
      raw.midtrans_transaction_id != null
        ? str(raw.midtrans_transaction_id)
        : undefined,
    transaction_status:
      raw.transaction_status != null ? str(raw.transaction_status) : undefined,
    payment_type: raw.payment_type != null ? str(raw.payment_type) : undefined,
    payment_mode: raw.payment_mode != null ? str(raw.payment_mode) : undefined,
    paid_at: raw.paid_at != null ? str(raw.paid_at) : undefined,
    created_at: raw.created_at != null ? str(raw.created_at) : undefined,
    order: order ? normalizeOrder(order) : undefined,
  };
}

export function normalizeReward(raw: Raw): ApiReward {
  return {
    id: num(raw.reward_id ?? raw.id),
    name: str(raw.name),
    point_required: num(raw.point_required),
    reward_type: str(raw.reward_type),
    value: num(raw.value),
    min_order: raw.min_order != null ? num(raw.min_order) : undefined,
    menu_id: raw.menu_id != null ? num(raw.menu_id) : undefined,
    free_qty: raw.free_qty != null ? num(raw.free_qty) : undefined,
    is_active: bool(raw.is_active, true),
  };
}

export function normalizeVoucher(raw: Raw): ApiVoucher {
  const freeMenu = raw.free_menu as Raw | null | undefined;
  return {
    id: num(raw.voucher_id ?? raw.id),
    user_id: raw.user_id != null ? num(raw.user_id) : undefined,
    code: str(raw.code),
    status: raw.status != null ? str(raw.status) : undefined,
    expired_at: raw.expired_at != null ? str(raw.expired_at) : undefined,
    min_order: raw.min_order != null ? num(raw.min_order) : undefined,
    discount_percentage:
      raw.discount_percentage != null
        ? num(raw.discount_percentage)
        : undefined,
    cashback_amount:
      raw.cashback_amount != null ? num(raw.cashback_amount) : undefined,
    free_menu_id:
      raw.free_menu_id != null ? num(raw.free_menu_id) : undefined,
    free_item_qty:
      raw.free_item_qty != null ? num(raw.free_item_qty) : undefined,
    free_menu_name: freeMenu?.name != null ? str(freeMenu.name) : undefined,
  };
}

export function normalizePoint(raw: Raw): ApiPoint {
  return {
    id: num(raw.point_id ?? raw.id),
    user_id: num(raw.user_id),
    total_point: num(raw.total_point ?? raw.balance ?? raw.points),
    expired_at: raw.expired_at != null ? str(raw.expired_at) : undefined,
    tier: raw.tier != null ? str(raw.tier) : undefined,
  };
}

export function normalizeCustomerLoyalty(raw: Raw): ApiCustomerLoyalty {
  return {
    user_id: num(raw.user_id),
    name: str(raw.name),
    points: num(raw.points),
    tier: str(raw.tier),
    total_orders: num(raw.total_orders),
  };
}

export function normalizeSalesByMenuReport(raw: Raw): ApiSalesByMenuReport {
  const items = (raw.items as Raw[] | undefined) ?? [];
  const summary = (raw.summary as Raw | undefined) ?? {};
  return {
    items: items.map((item) => ({
      menu_name: str(item.menu_name),
      qty_sold: num(item.qty_sold),
      revenue: num(item.revenue),
    })),
    summary: {
      total_revenue: num(summary.total_revenue),
      total_orders: num(summary.total_orders),
      average_order_value: num(summary.average_order_value),
    },
  };
}

export function normalizeList<T>(
  result: unknown,
  key: string,
  normalizer: (raw: Raw) => T,
): T[] {
  if (Array.isArray(result)) {
    return result.map((item) => normalizer(item as Raw));
  }
  if (result && typeof result === "object") {
    const arr = (result as Raw)[key];
    if (Array.isArray(arr)) {
      return arr.map((item) => normalizer(item as Raw));
    }
  }
  return [];
}
