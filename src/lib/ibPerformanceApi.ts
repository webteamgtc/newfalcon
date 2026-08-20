/**
 * GTCFX IB Performance API — server-side client.
 *
 * Flow (matches Postman):
 * 1. POST getToken              → access_token + JSESSIONID cookie
 * 2. GET  clientRegistrarion    → registration (access_token + email + cookie)
 * 3. GET  emailPerformanceQuery → performance (access_token + ib_email + cookie)
 *
 * The portal requires the JSESSIONID set by getToken on all follow-up requests.
 * A cookie jar keeps that session across calls (Postman does this automatically).
 */

import axios, { isAxiosError, type AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import dns from "dns";
import { CookieJar } from "tough-cookie";

dns.setDefaultResultOrder("ipv4first");

const ENDPOINTS = {
  token:
    process.env.IB_TOKEN_URL?.trim() ||
    "http://dataportal.gtcfx.group/gtcfxbi/api/oauth2/getToken",
  registration:
    process.env.IB_REGISTRATION_URL?.trim() ||
    "http://dataportal.gtcfx.group/gtcfxbi/GTC_ana/app/dataApi/clientRegistrarion.app/API/queryData.afl",
  performance:
    "http://dataportal.gtcfx.group/gtcfxbi/GTC_ana/app/dataApi/emailPerformanceQuery2026.app/API/queryData.afl",
} as const;

function createHttpClient(jar: CookieJar): AxiosInstance {
  return wrapper(
    axios.create({
      jar,
      withCredentials: true,
      timeout: 30_000,
      maxRedirects: 5,
      headers: {
        Accept: "application/json",
      },
      validateStatus: (status) => status >= 200 && status < 300,
    })
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type IbClient = {
  email: string;
  memberId: string;
  clientStatus: string;
  kycStatus: string;
  userType: string;
  firstName: string;
};

export type IbPerformance = {
  email: string;
  depositUsd: number;
  netDepositUsd: number;
  tradeLots: number;
  withdrawalUsd: number;
};

export type IbVerifyResult = {
  client: IbClient;
  performance: IbPerformance;
};

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

type IbSession = {
  client: AxiosInstance;
  token: string;
  expiresAt: number;
};

// ─── Session cache (token + cookie jar from getToken) ────────────────────────

let cachedSession: IbSession | null = null;

function clearSessionCache() {
  cachedSession = null;
}

function getCredentials() {
  const appId = process.env.IB_APP_ID?.trim();
  const appSecret = process.env.IB_APP_SECRET?.trim();
  const userid = process.env.IB_USERID?.trim() || "marketing";

  if (!appId || !appSecret) {
    throw new Error("IB API credentials are not configured (IB_APP_ID / IB_APP_SECRET)");
  }

  return { appId, appSecret, userid };
}

function buildQueryUrl(base: string, params: Array<[string, string]>): string {
  const qs = params
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return `${base}?${qs}`;
}

async function getSession(forceRefresh = false): Promise<IbSession> {
  if (!forceRefresh && cachedSession && Date.now() < cachedSession.expiresAt - 60_000) {
    return cachedSession;
  }

  const { appId, appSecret, userid } = getCredentials();
  const jar = new CookieJar();
  const client = createHttpClient(jar);

  const { data } = await client.post(ENDPOINTS.token, {
    appid: appId,
    app_secret: appSecret,
    userid,
    grant_type: "ip",
  });

  const token = String(data?.access_token ?? "").trim();

  if (!token || data?.result === false) {
    throw new Error(String(data?.message ?? "Token request failed"));
  }

  cachedSession = {
    client,
    token,
    expiresAt: Date.now() + (Number(data?.expires_in) || 7200) * 1000,
  };

  return cachedSession;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function str(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function num(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function field(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = str(record[key]);
    if (v) return v;
  }
  const lower = keys.map((k) => k.toLowerCase());
  for (const [k, v] of Object.entries(record)) {
    if (lower.includes(k.toLowerCase()) && str(v)) return str(v);
  }
  return "";
}

function firstNameFromEmail(email: string): string {
  const part = email.split("@")[0]?.replace(/[._-]+/g, " ").trim() ?? "";
  if (!part) return "Partner";
  return part
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function axiosErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined;
    const message = str(data?.message);
    if (message && message !== "success") return message;
    if (error.response?.status) {
      return `${fallback} (HTTP ${error.response.status})`;
    }
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

function parseClient(raw: unknown, fallbackEmail: string): IbClient | null {
  if (!raw || typeof raw !== "object") return null;

  const root = raw as Record<string, unknown>;
  const rows = root.result;

  if (!Array.isArray(rows) || rows.length === 0) return null;

  const row = rows[0];
  if (!row || typeof row !== "object") return null;

  const record = row as Record<string, unknown>;
  const email =
    field(record, "EMAIL", "email").toLowerCase() || fallbackEmail.toLowerCase();
  const memberId = field(record, "MEMBER_ID", "member_id", "memberId");
  const clientStatus = field(record, "CLIENT_STATUS", "client_status").toLowerCase();

  if (!memberId && !clientStatus) return null;

  return {
    email,
    memberId,
    clientStatus,
    kycStatus: field(record, "KYC_STATUS", "kyc_status").toLowerCase(),
    userType: field(record, "USER_TYPE", "user_type").toLowerCase(),
    firstName: firstNameFromEmail(email),
  };
}

function parsePerformance(raw: unknown, fallbackEmail: string): IbPerformance {
  const empty: IbPerformance = {
    email: fallbackEmail.toLowerCase(),
    depositUsd: 0,
    netDepositUsd: 0,
    tradeLots: 0,
    withdrawalUsd: 0,
  };

  if (!raw || typeof raw !== "object") return empty;

  const rows = (raw as Record<string, unknown>).result;
  if (!Array.isArray(rows) || rows.length === 0) return empty;


  return {
    email: fallbackEmail.toLowerCase(),
    depositUsd: rows?.[0]?.DEPOSIT_USD || 0,
    netDepositUsd: rows?.[0]?.NET_DEPOSIT_USD || 0,
    tradeLots: rows?.[0]?.TRADE_LOTS || 0,
    withdrawalUsd: rows?.[0]?.WITHDRAWAL_USD || 0,
  };
}

// ─── API calls ───────────────────────────────────────────────────────────────

async function fetchRegistration(
  email: string,
  session: IbSession
): Promise<ApiResult<IbClient>> {
  const normalizedEmail = email.trim().toLowerCase();

  const url = buildQueryUrl(ENDPOINTS.registration, [
    ["access_token", session.token],
    ["email", normalizedEmail],
  ]);

  try {
    const { data } = await session.client.get(url);
    const client = parseClient(data, normalizedEmail);

    if (!client) {
      return { ok: false, error: "NOT_REGISTERED" };
    }

    if (client.clientStatus !== "active") {
      return { ok: false, error: "INACTIVE" };
    }

    return { ok: true, data: client };
  } catch (error) {
    if (
      isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 302)
    ) {
      return { ok: false, error: "UNAUTHORIZED" };
    }
    return {
      ok: false,
      error: axiosErrorMessage(error, "Registration lookup failed"),
    };
  }
}

async function fetchPerformance(
  email: string,
  session: IbSession
): Promise<IbPerformance> {
  const normalizedEmail = email.trim().toLowerCase();

  const url = buildQueryUrl(ENDPOINTS.performance, [
    ["access_token", session.token],
    ["ib_email", normalizedEmail],
  ]);
  console.log("performance url", url);

  try {
    const { data } = await session.client.get(url);
    console.log("performance response", data);
    return parsePerformance(data, normalizedEmail);
  } catch (error) {
    // if (isAxiosError(error) && error.response?.status === 404) {
    //   return parsePerformance(null, normalizedEmail);
    // }
    throw new Error(axiosErrorMessage(error, "Performance lookup failed"));
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function verifyIbClient(email: string): Promise<IbVerifyResult> {
  const normalized = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Invalid email address");
  }

  let session = await getSession();
  let registration = await fetchRegistration(normalized, session);

  if (!registration.ok && registration.error === "UNAUTHORIZED") {
    clearSessionCache();
    session = await getSession(true);
    registration = await fetchRegistration(normalized, session);
  }

  if (!registration.ok) {
    if (registration.error === "NOT_REGISTERED") throw new Error("NOT_REGISTERED");
    if (registration.error === "INACTIVE") throw new Error("INACTIVE");
    throw new Error(registration.error);
  }

  const performance = await fetchPerformance(normalized, session);

  return { client: registration.data, performance };
}

export function isMemberIdMatch(client: IbClient, ibId: string): boolean {
  return client.memberId === ibId.trim();
}
