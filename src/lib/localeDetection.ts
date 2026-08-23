import type { NextRequest } from "next/server";

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

const CHINESE_COUNTRY_CODES = new Set(["CN", "HK", "MO", "TW"]);

/** Hosts that always use Chinese with no language switcher. */
const DEFAULT_CHINESE_ONLY_HOSTS = ["goldenfalcon.gtcch.com"];

export type MenuLocale = "en" | "zh";

function normalizeHostname(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

export function getChineseOnlyHosts(): string[] {
  const fromEnv = process.env.NEXT_PUBLIC_CHINESE_ONLY_HOSTS?.split(",")
    .map((host) => host.trim())
    .filter(Boolean);

  return [...DEFAULT_CHINESE_ONLY_HOSTS, ...(fromEnv ?? [])].map(normalizeHostname);
}

export function isChineseOnlyHost(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  return getChineseOnlyHosts().includes(normalized);
}

export function getRequestHostname(request: NextRequest): string {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  return host?.split(",")[0]?.trim().split(":")[0] ?? "";
}

export function isChineseOnlyRequest(request: NextRequest): boolean {
  const hostname = getRequestHostname(request);
  return hostname ? isChineseOnlyHost(hostname) : false;
}

export function isMenuLocale(value: string | undefined): value is MenuLocale {
  return value === "en" || value === "zh";
}

export function getCountryCode(request: NextRequest): string | undefined {
  const country =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("x-country-code");

  return country?.toUpperCase();
}

export function isChineseCountry(countryCode?: string): boolean {
  return countryCode ? CHINESE_COUNTRY_CODES.has(countryCode) : false;
}

export function prefersChineseLanguage(request: NextRequest): boolean {
  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return false;

  const languages = acceptLanguage
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean);

  for (const language of languages) {
    if (language.startsWith("zh")) return true;
    if (language.startsWith("en")) return false;
  }

  return false;
}

export function detectMenuLocale(request: NextRequest): MenuLocale {
  if (isChineseOnlyRequest(request)) {
    return "zh";
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (isMenuLocale(cookieLocale)) {
    return cookieLocale;
  }

  if (isChineseCountry(getCountryCode(request)) || prefersChineseLanguage(request)) {
    return "zh";
  }

  return "en";
}

export function setLocaleCookie(
  response: { cookies: { set: (name: string, value: string, options?: Record<string, unknown>) => void } },
  locale: MenuLocale
) {
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
