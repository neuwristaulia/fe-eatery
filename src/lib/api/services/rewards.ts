import { apiFetch } from "../client";
import type { ApiReward } from "../types";
import { normalizeList, normalizeReward } from "../normalize";

export async function listRewards() {
  const result = await apiFetch<unknown>("/api/rewards");
  return normalizeList(result, "rewards", normalizeReward) as ApiReward[];
}

/** Rewards the logged-in customer has not redeemed yet. */
export async function listAvailableRewards() {
  const result = await apiFetch<unknown>("/api/rewards/available", {
    auth: true,
  });
  return normalizeList(result, "rewards", normalizeReward) as ApiReward[];
}

export async function createReward(data: {
  name: string;
  point_required: number;
  reward_type: string;
  value: number;
  min_order?: number;
  menu_id?: number;
  free_qty?: number;
}) {
  const raw = await apiFetch<unknown>("/api/rewards", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizeReward(raw as Record<string, unknown>);
}

export async function updateReward(id: number, data: Partial<ApiReward>) {
  const raw = await apiFetch<unknown>(`/api/rewards/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
  return normalizeReward(raw as Record<string, unknown>);
}

export async function deleteReward(id: number) {
  return apiFetch<void>(`/api/rewards/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function redeemReward(rewardId: number) {
  return apiFetch<unknown>("/api/vouchers/redeem", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ reward_id: rewardId }),
  });
}
