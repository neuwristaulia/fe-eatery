import { apiFetch } from "../client";
import type { ApiCustomerLoyalty, ApiUser } from "../types";
import { normalizeCustomerLoyalty, normalizeList, normalizePoint, normalizeUser } from "../normalize";

export async function listUsers() {
  const result = await apiFetch<unknown>("/api/users", { auth: true });
  return normalizeList(result, "users", normalizeUser) as ApiUser[];
}

export async function getCustomerLoyaltyList() {
  const result = await apiFetch<unknown>("/api/customers/loyalty", { auth: true });
  return normalizeList(result, "customers", normalizeCustomerLoyalty) as ApiCustomerLoyalty[];
}

export async function getUserPoints(userId: number) {
  const raw = await apiFetch<unknown>(`/api/users/${userId}/points`, {
    auth: true,
  });
  if (Array.isArray(raw)) {
    const first = raw[0] as Record<string, unknown> | undefined;
    return first ? normalizePoint(first) : { total_point: 0, user_id: userId, id: 0 };
  }
  return normalizePoint((raw || {}) as Record<string, unknown>);
}

export async function updateUser(
  id: number,
  data: { name?: string; email?: string; phone?: string; status?: string; staff_shift?: string },
) {
  const raw = await apiFetch<unknown>(`/api/users/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizeUser(raw as Record<string, unknown>);
}

export async function deleteUser(id: number) {
  return apiFetch<void>(`/api/users/${id}`, { method: "DELETE", auth: true });
}
