"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { localeLabels, menuLocales, type AppLocale } from "@/i18n/routing";
import { LOCALE_COOKIE_NAME, type MenuLocale } from "@/lib/localeDetection";
import { useChineseOnlySite } from "@/hooks/useChineseOnlySite";
import CN from "country-flag-icons/react/3x2/CN";
import US from "country-flag-icons/react/3x2/US";

type LanguageSwitcherProps = {
  variant?: "default" | "light";
};

const localeFlags = {
  en: US,
  zh: CN,
} as const;

function setClientLocaleCookie(locale: MenuLocale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

function LocaleFlag({
  Flag,
  isLight,
}: {
  Flag: (typeof localeFlags)[keyof typeof localeFlags];
  isLight: boolean;
}) {
  return (
    <Flag
      className={`h-3 w-[18px] shrink-0 rounded-[2px] ${
        isLight ? "ring-1 ring-white/35" : "ring-1 ring-black/10"
      }`}
      aria-hidden
    />
  );
}

export default function LanguageSwitcher({
  variant = "default",
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const isLight = variant === "light";
  const chineseOnlySite = useChineseOnlySite();

  if (chineseOnlySite) {
    return null;
  }

  const switchLocale = (code: MenuLocale) => {
    if (locale === code) return;

    setClientLocaleCookie(code);
    router.replace(pathname, { locale: code as AppLocale });
    router.refresh();
  };

  return (
    <div
      className={`flex items-center gap-1 rounded-full p-1 ${
        isLight ? "border border-white/40" : "border border-ink/15"
      }`}
      role="group"
      aria-label="Language"
    >
      {menuLocales.map((code) => {
        const Flag = localeFlags[code];

        return (
          <button
            key={code}
            type="button"
            onClick={() => switchLocale(code)}
            aria-current={locale === code ? "true" : undefined}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs tracking-wide transition-colors ${
              locale === code
                ? isLight
                  ? "bg-white text-ink"
                  : "bg-ink text-parchment"
                : isLight
                  ? "text-white/75 hover:text-white"
                  : "text-ink/70 hover:text-ink"
            }`}
          >
            <LocaleFlag Flag={Flag} isLight={isLight} />
            {localeLabels[code]}
          </button>
        );
      })}
    </div>
  );
}
