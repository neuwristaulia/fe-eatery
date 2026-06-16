import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ApiUser, AuthSession } from "@/lib/api/types";
import { authApi } from "@/lib/api";
import { ROLE } from "@/lib/api/types";

export type AuthPortal =
  | "admin"
  | "manager"
  | "cashier"
  | "kitchen"
  | "staff"
  | "customer";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
  user: ApiUser | null;
  portal: AuthPortal | null;

  applySession: (session: AuthSession, portal: AuthPortal) => void;
  clearAuth: () => void;
  loginWithUserId: (userId: number, portal: AuthPortal) => Promise<ApiUser>;
  loginWithEmail: (
    email: string,
    password: string,
    portal?: AuthPortal,
  ) => Promise<ApiUser>;
  loginWithCredentials: (
    identifier: string,
    password: string,
    portal: AuthPortal,
  ) => Promise<ApiUser>;
  registerWithEmail: (input: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) => Promise<ApiUser>;
  refreshSession: () => Promise<boolean>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<ApiUser>;
  updateUser: (updates: Partial<ApiUser>) => Promise<ApiUser | void>;
  hasRole: (...roleIds: number[]) => boolean;
  isAccessTokenExpired: () => boolean;
}

function expiresAtFromSession(session: AuthSession): number | null {
  if (!session.expiresIn) return null;
  return Date.now() + session.expiresIn * 1000;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      user: null,
      portal: null,

      applySession: (session, portal) => {
        set({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          tokenExpiresAt: expiresAtFromSession(session),
          user: session.user,
          portal,
        });
      },

      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          tokenExpiresAt: null,
          user: null,
          portal: null,
        }),

      loginWithUserId: async (userId, portal) => {
        // Backwards compatibility: treat numeric input as name string if needed
        const session = await authApi.loginStaff({
          name: String(userId),
          password: "",
        });
        if (!validatePortalRole(portal, session.user.role_id)) {
          await authApi.logout(session.refreshToken);
          get().clearAuth();
          throw new Error("Akun ini tidak memiliki akses ke portal tersebut.");
        }
        get().applySession(session, portal);
        return session.user;
      },

      loginWithCredentials: async (identifier, password, portal) => {
        let session;
        if (portal === "customer") {
          session = await authApi.loginCustomer({
            email: identifier,
            password,
          });
        } else {
          session = await authApi.loginStaff({ name: identifier, password });
        }

        if (!validatePortalRole(portal, session.user.role_id)) {
          await authApi.logout(session.refreshToken);
          get().clearAuth();
          throw new Error(
            portal === "customer"
              ? "Akun ini bukan akun customer. Gunakan portal staff yang sesuai."
              : "Role akun tidak sesuai untuk portal ini.",
          );
        }

        get().applySession(session, portal);
        return session.user;
      },

      loginWithEmail: async (email, password, portal = "customer") => {
        const session = await authApi.loginCustomer({ email, password });

        if (!validatePortalRole(portal, session.user.role_id)) {
          await authApi.logout(session.refreshToken);
          get().clearAuth();
          throw new Error(
            portal === "customer"
              ? "Akun ini bukan akun customer. Gunakan portal staff yang sesuai."
              : "Role akun tidak sesuai untuk portal ini.",
          );
        }

        get().applySession(session, portal);
        return session.user;
      },

      registerWithEmail: async (input) => {
        const session = await authApi.registerCustomer({
          name: input.name,
          email: input.email,
          password: input.password,
          phone: input.phone,
        });

        get().applySession(session, "customer");
        return session.user;
      },

      refreshSession: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) return false;

        try {
          const portal = get().portal ?? "customer";
          const session = await authApi.refreshAccessToken(refreshToken);
          get().applySession(session, portal);
          return true;
        } catch {
          get().clearAuth();
          return false;
        }
      },

      logout: async () => {
        const refreshToken = get().refreshToken;
        await authApi.logout(refreshToken ?? undefined);
        get().clearAuth();
      },

      fetchCurrentUser: async () => {
        const user = await authApi.getMe();
        set({ user });
        return user;
      },

      updateUser: async (updates) => {
        const user = get().user;
        if (!user) return;
        try {
          const updated = await authApi.updateMe(updates as any);
          set({ user: { ...user, ...updated } });
          return updated;
        } catch (err) {
          throw err;
        }
      },

      hasRole: (...roleIds) => {
        const user = get().user;
        if (!user) return false;
        return roleIds.includes(user.role_id);
      },

      isAccessTokenExpired: () => {
        const expiresAt = get().tokenExpiresAt;
        if (!expiresAt) return false;
        return Date.now() >= expiresAt - 30_000;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenExpiresAt: state.tokenExpiresAt,
        user: state.user,
        portal: state.portal,
      }),
    },
  ),
);

/** Role names from DB: 1=Manager, 2=SuperAdmin, 3=Customer, 4=Cashier */
export function roleName(roleId: number): string {
  switch (roleId) {
    case ROLE.MANAGER:
      return "Manager";
    case ROLE.SUPER_ADMIN:
      return "Super Admin";
    case ROLE.CUSTOMER:
      return "Customer";
    case ROLE.CASHIER:
      return "Cashier";
    default:
      return "User";
  }
}

export function validatePortalRole(
  portal: AuthPortal,
  roleId: number,
): boolean {
  switch (portal) {
    case "admin":
      return roleId === ROLE.SUPER_ADMIN;
    case "manager":
      return roleId === ROLE.MANAGER || roleId === ROLE.SUPER_ADMIN;
    case "cashier":
      return roleId === ROLE.CASHIER;
    case "kitchen":
      return roleId === ROLE.CASHIER || roleId === ROLE.MANAGER;
    case "staff":
      return (
        roleId === ROLE.CASHIER ||
        roleId === ROLE.MANAGER ||
        roleId === ROLE.SUPER_ADMIN
      );
    case "customer":
      return roleId === ROLE.CUSTOMER;
    default:
      return false;
  }
}
