"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, type User } from "./staff-api";

type AuthState = {
  /** undefined while loading, null when not logged in. */
  user: User | null | undefined;
  setUser: (u: User | null) => void;
  refresh: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

/** Knows who is logged in (via the session cookie) for the whole app. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  const refresh = useCallback(() => {
    authApi
      .me()
      .then((u) => setUser(u ?? null))
      .catch(() => setUser(null));
  }, []);

  useEffect(refresh, [refresh]);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, setUser, refresh, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
