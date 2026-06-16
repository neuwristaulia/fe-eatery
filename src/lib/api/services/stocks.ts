import { apiFetch } from "../client";
import type { ApiStock } from "../types";
import { normalizeList, normalizeStock } from "../normalize";

export async function listStocks() {
  const result = await apiFetch<unknown>("/api/stocks", { auth: true });
  return normalizeList(result, "stocks", normalizeStock) as ApiStock[];
}

export async function updateStock(
  id: number,
  data: { quantity?: number; min_stock?: number },
) {
  const raw = await apiFetch<unknown>(`/api/stocks/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizeStock(raw as Record<string, unknown>);
}

export async function adjustStock(
  id: number,
  data: { type: "IN" | "OUT"; quantity: number; note?: string },
) {
  const raw = await apiFetch<unknown>(`/api/stocks/${id}/adjust`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizeStock(raw as Record<string, unknown>);
}
