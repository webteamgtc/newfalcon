"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { localeLabels, menuLocales } from "@/i18n/routing";

type LanguageSwitcherProps = {
  variant?: "default" | "light";
};

export default function LanguageSwitcher({
  variant = "default",
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const isLight = variant === "light";

  return (
    <div
      className={`flex items-center gap-1 rounded-full p-1 ${
        isLight ? "border border-white/40" : "border border-ink/15"
      }`}
      role="group"
      aria-label="Language"
    >
      {menuLocales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => router.replace(pathname, { locale: code })}
          aria-current={locale === code ? "true" : undefined}
          className={`rounded-full px-2.5 py-1 text-xs tracking-wide transition-colors ${
            locale === code
              ? isLight
                ? "bg-white text-ink"
                : "bg-ink text-parchment"
              : isLight
                ? "text-white/75 hover:text-white"
                : "text-ink/70 hover:text-ink"
          }`}
        >
          {localeLabels[code]}
        </button>
      ))}
    </div>
  );
}
