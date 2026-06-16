import { ordersApi, paymentsApi, tablesApi } from "@/lib/api";
import {
  mapOrderToStaff,
  mapTableToStaff,
  parseNumericId,
} from "@/lib/api/mappers";
import type { StaffOrder } from "@/store/useStaffStore";
import type { PaymentMethod } from "@/lib/api/types";

export async function fetchStaffData() {
  const [orders, tables] = await Promise.all([
    ordersApi.listOrders(),
    tablesApi.listTables(),
  ]);

  return {
    orders: orders.map(mapOrderToStaff),
    tables: tables.map(mapTableToStaff),
  };
}

export async function createStaffOrderOnApi(
  order: Omit<StaffOrder, "id" | "time">,
) {
  const items = order.items
    .map((item) => ({
      menu_id: item.id ? parseNumericId(item.id) : 0,
      quantity: item.qty,
    }))
    .filter((i) => i.menu_id > 0);

  const created = await ordersApi.createOrder({
    order_type: order.type === "takeaway" ? "takeaway" : "dine-in",
    table_id: order.tableNumber ? parseNumericId(order.tableNumber) : undefined,
    items,
  });
  return mapOrderToStaff(created);
}

export async function updateStaffOrderStatusOnApi(id: string, status: string) {
  const updated = await ordersApi.updateOrderStatus(parseNumericId(id), status);
  return mapOrderToStaff(updated);
}

function toPaymentMethod(method: string): PaymentMethod {
  const m = method.toLowerCase();
  if (m === "midtrans" || m.includes("card") || m.includes("qris")) {
    return "midtrans";
  }
  return "cash";
}

export async function processStaffPaymentOnApi(
  orderId: string,
  method: string,
) {
  const order = await ordersApi.getOrder(parseNumericId(orderId));
  const payment = await paymentsApi.createPayment({
    order_id: parseNumericId(orderId),
    method: toPaymentMethod(method),
    amount: order.total_price,
  });

  await paymentsApi.processPayment(payment.id, "paid");
  const updatedOrder = await ordersApi.getOrder(parseNumericId(orderId));
  return mapOrderToStaff(updatedOrder);
}
