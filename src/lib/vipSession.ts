import type { VipUser } from "@/data/vipUsers";
import { normalizeVipUser } from "@/data/vipUsers";

export const VIP_SESSION_KEY = "gfn_vip_user";
export const VIP_SESSION_TTL_MS = 20 * 60 * 1000;

type VipSessionPayload = {
  user: VipUser;
  expiresAt: number;
};

function isSessionPayload(value: unknown): value is VipSessionPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "user" in value &&
    "expiresAt" in value
  );
}

export function getVipSessionUser(): VipUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(VIP_SESSION_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    if (!isSessionPayload(parsed) || Date.now() >= parsed.expiresAt) {
      clearVipSessionUser();
      return null;
    }

    return normalizeVipUser(parsed.user);
  } catch {
    clearVipSessionUser();
    return null;
  }
}

export function setVipSessionUser(user: VipUser): VipUser {
  const normalizedUser = normalizeVipUser(user);

  if (typeof window !== "undefined") {
    const payload: VipSessionPayload = {
      user: normalizedUser,
      expiresAt: Date.now() + VIP_SESSION_TTL_MS,
    };
    sessionStorage.setItem(VIP_SESSION_KEY, JSON.stringify(payload));
  }

  return normalizedUser;
}

export function clearVipSessionUser(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(VIP_SESSION_KEY);
}
