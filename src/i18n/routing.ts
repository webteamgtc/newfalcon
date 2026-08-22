import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "ar", "zh"],
  defaultLocale: "en",
  localePrefix: "always"
});

export type AppLocale = (typeof routing.locales)[number];

/** Shown in the header language switcher. Arabic is kept for future use. */
export const menuLocales = ["en", "zh"] as const satisfies readonly AppLocale[];

export const localeLabels: Record<AppLocale, string> = {
  en: "EN",
  ar: "عربي",
  zh: "中文",
};

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
