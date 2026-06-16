import { apiFetch } from "../client";
import type { ApiTable } from "../types";
import { normalizeList, normalizeTable } from "../normalize";

export async function listTables() {
  const result = await apiFetch<unknown>("/api/tables");
  return normalizeList(result, "tables", normalizeTable) as ApiTable[];
}

export async function listAvailableTables(
  date: string,
  time: string,
  guest_count: number,
) {
  const params = new URLSearchParams({
    date,
    time,
    guest_count: String(guest_count),
  });
  const result = await apiFetch<unknown>(
    `/api/tables/available?${params.toString()}`,
    {
      auth: true,
    },
  );
  return normalizeList(result, "tables", normalizeTable) as ApiTable[];
}

export async function getTable(id: number) {
  const raw = await apiFetch<unknown>(`/api/tables/${id}`);
  return normalizeTable(raw as Record<string, unknown>);
}

export async function createTable(data: {
  table_number: number;
  capacity?: number;
  qr_code?: string;
}) {
  const raw = await apiFetch<unknown>("/api/tables", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizeTable(raw as Record<string, unknown>);
}

export async function updateTable(
  id: number,
  data: {
    status?: string;
    qr_code?: string;
    table_number?: number;
    capacity?: number;
  },
) {
  const raw = await apiFetch<unknown>(`/api/tables/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizeTable(raw as Record<string, unknown>);
}

export async function deleteTable(id: number) {
  return apiFetch<void>(`/api/tables/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function updateTableStatus(id: number, status: string) {
  const raw = await apiFetch<unknown>(`/api/tables/${id}/status`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ status }),
  });
  return normalizeTable(raw as Record<string, unknown>);
}
