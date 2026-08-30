"use client";

import { useTranslations } from "next-intl";

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="rtl:-scale-x-100"
    >
      <path
        d="M3.5 10.5 10.5 3.5M10.5 3.5H5.25M10.5 3.5V8.75"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DubaiTravelHeroSection() {
  const t = useTranslations("dubaiTravelHero");

  return (
    <section className="relative isolate hidden overflow-hidden bg-[url('/new/newtop.webp')] bg-cover bg-top-right py-12 md:block md:py-16 lg:py-48">
      <div className="container relative z-10">
        <div className="max-w-xl">
          <p className="font-poppins text-[11px] uppercase tracking-[0.22em] text-[#382910]/55 md:text-xs">
            {t("eyebrow")}
          </p>

          <h2 className="mt-4 font-display text-[2rem] leading-[1.15] font-medium tracking-[-0.02em] md:text-[2.75rem] lg:text-[3.25rem]">
            <span className="block text-ink">{t("headingLine1")}</span>
            <span className="block text-falcon-deep">{t("headingLine2")}</span>
          </h2>

          <p className="mt-5 max-w-md font-poppins text-sm leading-relaxed text-[#382910]/85 md:text-base">
            {t("subtext")}
          </p>

          <a
            href="#dubai-attractions"
            className="mt-7 inline-flex items-center gap-4 rounded-full bg-[#382910] py-1.5 ps-6 pe-3 font-poppins text-xs uppercase tracking-[0.14em] text-white transition-colors hover:bg-falcon-deep md:mt-8 md:text-sm"
          >
            <span>{t("cta")}</span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#382910] md:h-9 md:w-9">
              <ArrowIcon />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
