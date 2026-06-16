import { apiFetch } from "../client";
import type { ApiOrder, CreateOrderPayload, CreateGuestOrderPayload } from "../types";
import { normalizeOrder, normalizeList } from "../normalize";

export async function listOrders() {
  const result = await apiFetch<unknown>("/api/orders", { auth: true });
  return normalizeList(result, "orders", normalizeOrder) as ApiOrder[];
}

export async function getOrder(id: number) {
  const raw = await apiFetch<unknown>(`/api/orders/${id}`, { auth: true });
  return normalizeOrder(raw as Record<string, unknown>);
}

export async function createOrder(data: CreateOrderPayload) {
  const raw = await apiFetch<unknown>("/api/orders", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizeOrder(raw as Record<string, unknown>);
}

export async function updateOrderStatus(id: number, status: string) {
  const raw = await apiFetch<unknown>(`/api/orders/${id}/status`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ status }),
  });
  return normalizeOrder(raw as Record<string, unknown>);
}

export async function deleteOrder(id: number) {
  return apiFetch<void>(`/api/orders/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function claimGuestOrders(orderIds: number[]) {
  return apiFetch<{ claimed: number }>("/api/orders/claim", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ order_ids: orderIds }),
  });
}

export async function createGuestOrder(data: CreateGuestOrderPayload) {
  const raw = await apiFetch<unknown>("/api/orders/guest", {
    method: "POST",
    auth: false,
    body: JSON.stringify(data),
  });
  return normalizeOrder(raw as Record<string, unknown>);
}
