"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

const LOCALES: { code: "en" | "ar"; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ar", label: "\u0639\u0631" }
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 rounded-full border border-ink/15 p-1">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => router.replace(pathname, { locale: code })}
          aria-current={locale === code}
          className={`px-2.5 py-1 text-xs tracking-wide rounded-full transition-colors ${
            locale === code
              ? "bg-ink text-parchment"
              : "text-ink/70 hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
