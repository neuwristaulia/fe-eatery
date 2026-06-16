import { useAuthStore } from "@/store/useAuthStore";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};

function unwrapData<T>(body: unknown): T {
  if (body === null || body === undefined) {
    return body as T;
  }
  if (typeof body === "object" && body !== null && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export async function parseApiResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: string }).message)
        : typeof body === "object" && body !== null && "error" in body
          ? String((body as { error: string }).error)
          : res.statusText || "Request failed";
    const detail =
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as { detail: string }).detail)
        : "";
    throw new ApiError(res.status, detail ? `${message}: ${detail}` : message, body);
  }

  return unwrapData<T>(body);
}

export interface ApiFetchOptions extends RequestInit {
  auth?: boolean;
  skipRefresh?: boolean;
}

async function ensureValidAccessToken(): Promise<string | null> {
  const state = useAuthStore.getState();
  if (!state.accessToken) return null;

  if (state.isAccessTokenExpired() && state.refreshToken) {
    const refreshed = await state.refreshSession();
    if (refreshed) {
      return useAuthStore.getState().accessToken;
    }
    return null;
  }

  return state.accessToken;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { auth = false, skipRefresh = false, headers: customHeaders, ...rest } =
    options;
  const headers = new Headers(customHeaders);

  if (!headers.has("Content-Type") && rest.body) {
    headers.set("Content-Type", "application/json");
  }

  let token: string | null = null;
  if (auth) {
    token = skipRefresh
      ? useAuthStore.getState().accessToken
      : await ensureValidAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(getApiUrl(endpoint), {
    ...rest,
    headers,
  });

  if (res.status === 401 && auth && !skipRefresh) {
    const refreshed = await useAuthStore.getState().refreshSession();
    if (refreshed) {
      return apiFetch<T>(endpoint, { ...options, skipRefresh: true });
    }
  }

  return parseApiResponse<T>(res);
}
