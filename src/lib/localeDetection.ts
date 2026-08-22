import type { NextRequest } from "next/server";

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

const CHINESE_COUNTRY_CODES = new Set(["CN", "HK", "MO", "TW"]);

export type MenuLocale = "en" | "zh";

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
