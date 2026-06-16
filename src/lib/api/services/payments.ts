import { apiFetch } from "../client";
import type {
  ApiPayment,
  CancelOrRefundResult,
  CreateGuestPaymentPayload,
  CreatePaymentPayload,
  PaymentStatusResult,
} from "../types";
import { normalizeList, normalizePayment } from "../normalize";

export async function listPayments() {
  const result = await apiFetch<unknown>("/api/payments", { auth: true });
  return normalizeList(result, "payments", normalizePayment) as ApiPayment[];
}

export async function createPayment(data: CreatePaymentPayload) {
  const raw = await apiFetch<unknown>("/api/payments", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizePayment(raw as Record<string, unknown>);
}

export async function processPayment(
  id: number,
  status: "paid" | "failed" | "cancelled",
) {
  const raw = await apiFetch<unknown>(`/api/payments/${id}/process`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ status }),
  });
  return normalizePayment(raw as Record<string, unknown>);
}

export async function markPaidTesting(id: number) {
  const raw = await apiFetch<unknown>(`/api/payments/${id}/mark-paid-testing`, {
    method: "PUT",
    auth: true,
  });
  return normalizePayment(raw as Record<string, unknown>);
}

export async function markCashPaid(id: number) {
  const raw = await apiFetch<unknown>(`/api/payments/${id}/mark-cash-paid`, {
    method: "PUT",
    auth: true,
  });
  return normalizePayment(raw as Record<string, unknown>);
}

export async function refundPayment(id: number, reason: string) {
  const raw = await apiFetch<unknown>(`/api/payments/${id}/refund`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ reason }),
  });
  return normalizePayment(raw as Record<string, unknown>);
}

export async function syncMidtransStatus(id: number) {
  const raw = await apiFetch<unknown>(`/api/payments/${id}/sync-midtrans`, {
    method: "POST",
    auth: true,
  });
  return normalizePayment(raw as Record<string, unknown>);
}

export async function getPaymentStatus(id: number): Promise<PaymentStatusResult> {
  const raw = await apiFetch<Record<string, unknown>>(
    `/api/payments/${id}/status`,
    { auth: true },
  );
  return {
    payment_id: Number(raw.payment_id ?? id),
    status: String(raw.status ?? "unpaid"),
    transaction_status:
      raw.transaction_status != null
        ? String(raw.transaction_status)
        : undefined,
  };
}

export async function cancelMidtransPayment(id: number) {
  const raw = await apiFetch<unknown>(`/api/payments/${id}/cancel-midtrans`, {
    method: "PUT",
    auth: true,
  });
  return normalizePayment(raw as Record<string, unknown>);
}

export async function createGuestPayment(data: CreateGuestPaymentPayload) {
  const raw = await apiFetch<unknown>("/api/payments/guest", {
    method: "POST",
    auth: false,
    body: JSON.stringify(data),
  });
  return normalizePayment(raw as Record<string, unknown>);
}

export async function getGuestPaymentStatus(id: number): Promise<PaymentStatusResult> {
  const raw = await apiFetch<Record<string, unknown>>(
    `/api/payments/guest/${id}/status`,
    { auth: false },
  );
  return {
    payment_id: Number(raw.payment_id ?? id),
    status: String(raw.status ?? "unpaid"),
    transaction_status:
      raw.transaction_status != null ? String(raw.transaction_status) : undefined,
  };
}

/**
 * Cancels or refunds a paid Midtrans transaction. The backend decides which action Midtrans
 * currently allows (cancel for pre-settlement transactions, refund once settled) and reports
 * back which one it took.
 */
export async function cancelOrRefundPayment(id: number, reason: string) {
  const raw = await apiFetch<{ action: "cancelled" | "refunded"; payment: Record<string, unknown> }>(
    `/api/payments/${id}/cancel-or-refund`,
    {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ reason }),
    },
  );
  return {
    action: raw.action,
    payment: normalizePayment(raw.payment ?? {}),
  } satisfies CancelOrRefundResult;
}
