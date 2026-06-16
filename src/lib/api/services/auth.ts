import { apiFetch } from "../client";
import type { AuthLoginResponse, AuthSession } from "../types";
import { normalizeUser } from "../normalize";

export interface StaffLoginInput {
  name: string;
  password: string;
}

export interface CustomerLoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export function normalizeAuthSession(raw: AuthLoginResponse): AuthSession {
  const userRaw = raw.user as Record<string, unknown> | undefined;
  if (!userRaw) {
    throw new Error("Respons autentikasi tidak berisi data user");
  }

  const accessToken = raw.access_token || raw.token;
  if (!accessToken) {
    throw new Error("Respons autentikasi tidak berisi access token");
  }

  const refreshToken = raw.refresh_token;
  if (!refreshToken) {
    throw new Error("Respons autentikasi tidak berisi refresh token");
  }

  return {
    accessToken,
    refreshToken,
    expiresIn: raw.expires_in,
    tokenType: raw.token_type,
    user: normalizeUser(userRaw),
  };
}

export async function loginStaff(input: StaffLoginInput) {
  const raw = await apiFetch<AuthLoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return normalizeAuthSession(raw);
}

export async function updateMe(input: {
  name?: string;
  email?: string;
  phone?: string;
}) {
  const raw = await apiFetch<unknown>("/api/auth/me", {
    method: "PUT",
    auth: true,
    body: JSON.stringify(input),
  });
  return normalizeUser(raw as Record<string, unknown>);
}

export async function loginCustomer(input: CustomerLoginInput) {
  const raw = await apiFetch<AuthLoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return normalizeAuthSession(raw);
}

export async function registerCustomer(input: RegisterInput) {
  const raw = await apiFetch<AuthLoginResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      password: input.password,
      phone: input.phone,
    }),
  });
  return normalizeAuthSession(raw);
}

export async function refreshAccessToken(refreshToken: string) {
  const raw = await apiFetch<AuthLoginResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return normalizeAuthSession(raw);
}

export async function logout(refreshToken?: string) {
  try {
    await apiFetch<void>("/api/auth/logout", {
      method: "POST",
      auth: true,
      body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
    });
  } catch {
    /* ignore logout errors */
  }
}

export async function getMe() {
  const raw = await apiFetch<unknown>("/api/auth/me", { auth: true });
  return normalizeUser(raw as Record<string, unknown>);
}
