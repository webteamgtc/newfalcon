import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const localeAdminMatch = pathname.match(/^\/(en|ar|zh)(\/admin(?:\/.*)?)$/);
  if (localeAdminMatch) {
    return NextResponse.redirect(new URL(localeAdminMatch[2], request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};
