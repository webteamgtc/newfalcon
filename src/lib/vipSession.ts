import type { VipUser } from "@/data/vipUsers";

export const VIP_SESSION_KEY = "gfn_vip_user";

export function getVipSessionUser(): VipUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(VIP_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VipUser;
  } catch {
    return null;
  }
}

export function setVipSessionUser(user: VipUser): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(VIP_SESSION_KEY, JSON.stringify(user));
}

export function clearVipSessionUser(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(VIP_SESSION_KEY);
}
