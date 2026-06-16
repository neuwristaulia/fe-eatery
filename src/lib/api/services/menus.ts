import { apiFetch } from "../client";
import type { ApiMenu } from "../types";
import { normalizeMenu, normalizeList } from "../normalize";

export async function listMenus() {
  const result = await apiFetch<unknown>("/api/menus");
  return normalizeList(result, "menus", normalizeMenu) as ApiMenu[];
}

export async function getMenu(id: number) {
  const raw = await apiFetch<unknown>(`/api/menus/${id}`);
  return normalizeMenu(raw as Record<string, unknown>);
}

export async function createMenu(data: {
  category_id?: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
}) {
  const raw = await apiFetch<unknown>("/api/menus", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizeMenu(raw as Record<string, unknown>);
}

export async function updateMenu(
  id: number,
  data: {
    category_id?: number;
    name?: string;
    price?: number;
    description?: string;
    image?: string;
    is_active?: boolean;
  },
) {
  const raw = await apiFetch<unknown>(`/api/menus/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizeMenu(raw as Record<string, unknown>);
}

export async function deleteMenu(id: number) {
  return apiFetch<void>(`/api/menus/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
