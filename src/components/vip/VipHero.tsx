"use client";

import { useTranslations } from "next-intl";

export default function VipHero() {
  const t = useTranslations("vipPage");

  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-[#FEFCF6] via-[#EAD9B9] to-[#D8BA80] pt-36 pb-24 md:pt-44 md:pb-32">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <p className="font-poppins text-xs uppercase tracking-[0.2em] text-gray-700 mb-8">
            {t("heroEyebrow")}
            <span className="mx-2">·</span>
            {t("heroYear")}
          </p>

          {/* Heading line 1 — plain serif */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-black leading-[1.05]">
            {t("heroHeadingPlain")}
          </h1>

          {/* Heading line 2 — italic gold serif */}
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold italic text-[#C79E5E] leading-[1.05] mt-1">
            {t("heroHeadingName")}
          </h2>

          {/* Subtext */}
          <p className="font-poppins text-sm md:text-base text-gray-700 mt-8 max-w-xl leading-relaxed">
            {t("heroSubtext")}
          </p>

          {/* CTA Button */}
          <a
            href="#progress"
            className="inline-flex items-center gap-4 mt-12 rounded-full bg-[#2C1F0E] py-2 ps-6 pe-2.5 text-sm font-poppins uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#3d2c16]"
          >
            <span>{t("heroCta")}</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#2C1F0E]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 2v10M7 12l-3.5-3.5M7 12l3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
