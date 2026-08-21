"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { VipUser } from "@/data/vipUsers";
import {
  clearVipSessionUser,
  getVipSessionUser,
  setVipSessionUser,
} from "@/lib/vipSession";

type VipUserContextValue = {
  user: VipUser | null;
  isReady: boolean;
  login: (user: VipUser) => void;
  logout: () => void;
};

const VipUserContext = createContext<VipUserContextValue | null>(null);

export function VipUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<VipUser | null | undefined>(undefined);

  useLayoutEffect(() => {
    setUser(getVipSessionUser());
  }, []);

  const login = useCallback((nextUser: VipUser) => {
    setUser(setVipSessionUser(nextUser));
  }, []);

  const logout = useCallback(() => {
    clearVipSessionUser();
    setUser(null);
  }, []);

  const isReady = user !== undefined;
  const resolvedUser = user ?? null;

  const value = useMemo(
    () => ({ user: resolvedUser, isReady, login, logout }),
    [resolvedUser, isReady, login, logout]
  );

  return (
    <VipUserContext.Provider value={value}>{children}</VipUserContext.Provider>
  );
}

export function useVipUser() {
  const context = useContext(VipUserContext);
  if (!context) {
    throw new Error("useVipUser must be used within VipUserProvider");
  }
  return context;
}
