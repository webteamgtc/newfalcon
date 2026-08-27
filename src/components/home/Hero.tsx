"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Button from "@/components/Button";

export default function Hero() {
  const t = useTranslations("home.hero");
  const locale = useLocale();
  const isZh = locale === "zh";

  return (
    <section className="relative isolate overflow-hidden pb-20 pt-40 md:pb-32 md:pt-48">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <Image
          src="/images/home-banner.webp"
          alt=""
          fill
          priority
          className="hidden h-full w-full object-cover object-center md:block"
          sizes="100vw"
        />
        <Image
          src="/images/tra-mobile.webp"
          alt=""
          fill
          priority
          className="block h-full w-full object-cover object-center md:hidden"
          sizes="100vw"
        />
      </div>
      <div className="container relative z-10 grid items-center gap-12 md:grid-cols-2">
        <div>
          <p
            className={`font-poppins font-semibold text-falcon-deep ${
              isZh
                ? "text-base tracking-[0.08em] md:text-lg"
                : "text-sm uppercase tracking-[0.35em] md:text-base"
            }`}
          >
            {t("eyebrow")}
          </p>

          <div className="mb-6 mt-4 flex items-center gap-3">
            <span className="block h-px w-12 bg-falcon-deep" />
            <span className="block h-3 w-3 rotate-45 border border-falcon-deep" />
            <span className="block h-px w-12 bg-falcon-deep" />
          </div>

          {isZh ? (
            <h1 className="font-display text-[2rem] font-medium leading-[3.5rem] tracking-[0.02em] text-ink md:leading-[4rem] md:text-[4.75rem] lg:leading-[4.9rem] lg:text-[5rem]">
              <span className="whitespace-nowrap md:hidden">
                <span className="text-falcon-deep">{t("titleLine1")}</span>
                {t("titleLine2") ? <span>{t("titleLine2")}</span> : null}
                {t("titleLine3") ? <span>{t("titleLine3")}</span> : null}
                {" "}
                <span className="text-falcon-deep">{t("year")}</span>
              </span>

              <span className="hidden max-w-full md:inline-block">
                <span className="block">
                  <span className="text-falcon-deep">{t("titleLine1")}</span>
                  {t("titleLine2") ? <span>{t("titleLine2")}</span> : null}
                  {t("titleLine3") ? <span>{t("titleLine3")}</span> : null}
                </span>
                <span className="block text-end text-[3.5rem] text-falcon-deep md:text-[5rem] lg:text-[7rem]">
                  {t("year")}
                </span>
              </span>
            </h1>
          ) : (
            <h1 className="max-w-[650px] font-display text-[3.2rem] uppercase leading-[1.05] md:text-[3.8rem] lg:text-[4.2rem]">
              <span className="text-falcon-deep">{t("titleLine1")}</span>{" "}
              <span className="text-ink">{t("titleLine2")}</span>{" "}
              <span className="text-ink">{t("titleLine3")}</span>{" "}
              <span className="text-[2.8rem] text-falcon-deep md:text-[3.8rem] lg:text-[4.9rem]">
                {t("year")}
              </span>
            </h1>
          )}

          <p
            className={`font-display italic text-[#382910] ${
              isZh
                ? "mt-7 text-xl md:text-3xl"
                : "mt-6 text-base md:text-2xl"
            }`}
          >
            {t("subtitle")}
          </p>

          <p
            className={`font-poppins leading-relaxed text-[#382910]/70 ${
              isZh
                ? "mt-5 max-w-xl text-base md:text-lg"
                : "mt-4 max-w-md text-sm md:text-base"
            }`}
          >
            {t("description")}
          </p>

          <Button href="/check-status" className="mt-10">
            {t("cta")}
          </Button>
        </div>

        <div className="relative mx-auto hidden aspect-[3/4] w-full max-w-sm md:block" />
      </div>
    </section>
  );
}
