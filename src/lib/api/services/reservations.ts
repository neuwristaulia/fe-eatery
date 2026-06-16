import { apiFetch } from "../client";
import type { ApiReservation, CreateReservationPayload } from "../types";

type Raw = Record<string, unknown>;

function normalizeReservation(raw: Raw): ApiReservation {
  const table = raw.table as Raw | undefined;
  return {
    id: Number(raw.reservation_id ?? raw.id ?? 0),
    user_id: raw.user_id != null ? Number(raw.user_id) : undefined,
    customer_name: String(raw.customer_name ?? ""),
    customer_email:
      raw.customer_email != null ? String(raw.customer_email) : undefined,
    customer_phone: String(raw.customer_phone ?? ""),
    table_id: Number(raw.table_id ?? 0),
    reservation_date: String(raw.reservation_date ?? ""),
    reservation_time: String(raw.reservation_time ?? ""),
    guest_count: Number(raw.guest_count ?? 0),
    status: String(raw.status ?? "pending"),
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    table: table
      ? {
          id: Number(table.table_id ?? table.id),
          table_number: Number(table.table_number),
          status: String(table.status ?? "available"),
          capacity: table.capacity != null ? Number(table.capacity) : undefined,
        }
      : undefined,
  };
}

function normalizeList(result: unknown): ApiReservation[] {
  if (Array.isArray(result)) {
    return result.map((r) => normalizeReservation(r as Raw));
  }
  if (result && typeof result === "object") {
    const arr = (result as Raw).reservations;
    if (Array.isArray(arr)) {
      return arr.map((r) => normalizeReservation(r as Raw));
    }
  }
  return [];
}

export async function listReservations(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const result = await apiFetch<unknown>(`/api/reservations${qs}`, {
    auth: true,
  });
  return normalizeList(result);
}

export async function listMyReservations() {
  const result = await apiFetch<unknown>("/api/reservations/my", {
    auth: true,
  });
  return normalizeList(result);
}

export async function getReservation(id: number | string) {
  const raw = await apiFetch<unknown>(`/api/reservations/${id}`, {
    auth: true,
  });
  return normalizeReservation(raw as Raw);
}

export async function createReservation(data: CreateReservationPayload) {
  const raw = await apiFetch<unknown>("/api/reservations", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizeReservation(raw as Raw);
}

export async function cancelReservation(id: number | string) {
  const raw = await apiFetch<unknown>(`/api/reservations/${id}/cancel`, {
    method: "PUT",
    auth: true,
  });
  return normalizeReservation(raw as Raw);
}

export async function updateReservation(
  id: number,
  data: Partial<CreateReservationPayload>,
) {
  const raw = await apiFetch<unknown>(`/api/reservations/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizeReservation(raw as Raw);
}

export async function updateReservationStatus(id: number, status: string) {
  const raw = await apiFetch<unknown>(`/api/reservations/${id}/status`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ status }),
  });
  return normalizeReservation(raw as Raw);
}

export async function deleteReservation(id: number) {
  return apiFetch<void>(`/api/reservations/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
