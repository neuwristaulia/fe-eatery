import { apiFetch } from "../client";
import type { ApiRecommendation } from "../types";

/** Personalized menu recommendations for the logged-in customer. */
export async function getMyRecommendations(params?: {
  limit?: number;
  debug?: boolean;
}) {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.debug) query.set("debug", "true");
  const qs = query.toString();

  const result = await apiFetch<unknown>(
    `/api/recommendations/me${qs ? `?${qs}` : ""}`,
    { auth: true },
  );
  return (result as ApiRecommendation[]) ?? [];
}

/** Cold-start recommendations for guest users (segment popularity based). */
export async function getGuestRecommendations(params?: { limit?: number }) {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();

  const result = await apiFetch<unknown>(
    `/api/recommendations/cold-start${qs ? `?${qs}` : ""}`,
    { auth: false },
  );
  return (result as ApiRecommendation[]) ?? [];
}
