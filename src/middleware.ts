import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  detectMenuLocale,
  isChineseOnlyRequest,
  isMenuLocale,
  LOCALE_COOKIE_NAME,
  setLocaleCookie,
  type MenuLocale,
} from "./lib/localeDetection";

const intlMiddleware = createMiddleware(routing);

function redirectWithLocaleCookie(
  request: NextRequest,
  targetPath: string,
  locale?: MenuLocale
) {
  const response = NextResponse.redirect(new URL(targetPath, request.url));

  if (locale) {
    setLocaleCookie(response, locale);
  }

  return response;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const chineseOnly = isChineseOnlyRequest(request);

  const legacyLocaleMatch = pathname.match(/^\/(en|zh|ar)(\/.*)?$/);
  if (legacyLocaleMatch) {
    const localeFromPath = legacyLocaleMatch[1];
    const targetPath = legacyLocaleMatch[2] || "/";
    const locale: MenuLocale | undefined = chineseOnly
      ? "zh"
      : localeFromPath === "en" || localeFromPath === "zh"
        ? localeFromPath
        : undefined;

    return redirectWithLocaleCookie(request, targetPath, locale);
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

  if (chineseOnly) {
    if (cookieLocale !== "zh") {
      return redirectWithLocaleCookie(
        request,
        `${pathname}${request.nextUrl.search}`,
        "zh"
      );
    }

    return intlMiddleware(request);
  }

  if (!isMenuLocale(cookieLocale)) {
    const detected = detectMenuLocale(request);
    return redirectWithLocaleCookie(request, `${pathname}${request.nextUrl.search}`, detected);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};
