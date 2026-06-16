import { apiFetch } from "../client";
import type { ApiVoucher } from "../types";
import { normalizeList, normalizeVoucher } from "../normalize";

export async function listVouchers() {
  const result = await apiFetch<unknown>("/api/vouchers", { auth: true });
  return normalizeList(result, "vouchers", normalizeVoucher) as ApiVoucher[];
}

export async function validateVoucher(code: string) {
  const raw = await apiFetch<unknown>("/api/vouchers/validate", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  return normalizeVoucher(raw as Record<string, unknown>);
}

export async function applyVoucher(code: string, orderId?: number) {
  const body: Record<string, string | number> = { code };
  if (orderId != null) {
    body.order_id = orderId;
  }

  const raw = await apiFetch<unknown>("/api/vouchers/apply", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
  return normalizeVoucher(raw as Record<string, unknown>);
}

export interface VoucherInput {
  code: string;
  status: string;
  user_id?: number;
  expired_at?: string;
  min_order?: number;
  discount_percentage?: number;
}

export async function createVoucher(data: VoucherInput) {
  const raw = await apiFetch<unknown>("/api/vouchers", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizeVoucher(raw as Record<string, unknown>);
}

export async function updateVoucher(id: number, data: Partial<VoucherInput>) {
  const raw = await apiFetch<unknown>(`/api/vouchers/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizeVoucher(raw as Record<string, unknown>);
}

export async function deleteVoucher(id: number) {
  return apiFetch<void>(`/api/vouchers/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
