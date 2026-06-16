import { apiFetch, ApiError } from "../client";
import type { ApiCategory } from "../types";
import { normalizeCategory, normalizeList } from "../normalize";

// Thrown when a category cannot be deleted because menus are still
// assigned to it. The caller must prompt the admin to pick a
// replacement category and retry with `reassignTo`.
export class CategoryHasMenusError extends Error {
  constructor(public menuCount: number) {
    super(
      `This category has ${menuCount} menu(s) assigned. Choose a category to move them to before deleting.`,
    );
    this.name = "CategoryHasMenusError";
  }
}

export async function listCategories() {
  const result = await apiFetch<unknown>("/api/categories");
  return normalizeList(result, "categories", normalizeCategory) as ApiCategory[];
}

export async function getCategory(id: number) {
  const raw = await apiFetch<unknown>(`/api/categories/${id}`);
  return normalizeCategory(raw as Record<string, unknown>);
}

export async function createCategory(data: { name: string; description?: string }) {
  const raw = await apiFetch<unknown>("/api/categories", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizeCategory(raw as Record<string, unknown>);
}

export async function updateCategory(
  id: number,
  data: { name?: string; description?: string },
) {
  const raw = await apiFetch<unknown>(`/api/categories/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizeCategory(raw as Record<string, unknown>);
}

export async function deleteCategory(id: number, reassignTo?: number) {
  try {
    return await apiFetch<void>(`/api/categories/${id}`, {
      method: "DELETE",
      auth: true,
      ...(reassignTo !== undefined
        ? { body: JSON.stringify({ reassign_to: reassignTo }) }
        : {}),
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      const body = err.body as
        | { menu_count?: number; requires_reassignment?: boolean }
        | undefined;
      if (body?.requires_reassignment) {
        throw new CategoryHasMenusError(body.menu_count ?? 0);
      }
    }
    throw err;
  }
}
