"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/Button";
import SectionBackgroundImage from "@/components/ui/SectionBackgroundImage";
import {
  SCREEN_SECTION_HEIGHT,
  SCREEN_SECTION_INNER,
} from "@/lib/sectionLayout";

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 3.5v3M16 3.5v3M4 10h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s6-5.2 6-10.5a6 6 0 1 0-12 0C6 15.8 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.5" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function RouteMapContent({ className = "" }: { className?: string }) {
  const t = useTranslations("checkStatusPage.routeMap");
  const locale = useLocale();
  const useUppercaseLabels = locale === "en";

  return (
    <div className={className}>
      <p
        className={`font-display text-xs tracking-[0.18em] text-[#C5A267] lg:text-sm xl:text-base ${useUppercaseLabels ? "uppercase" : ""}`}
      >
        {t("eyebrow")}
      </p>

      <h2 className="mt-3 font-display HeadingH1 font-medium leading-[1.12] text-ink">
        <span className="block">{t("headingLine1")}</span>
        <span className="block">{t("headingLine2")}</span>
      </h2>

      <p className="mt-4 max-w-md font-display Text leading-relaxed text-[#382910]/85">
        {t("subtext")}
      </p>

      <div className="mt-6 grid max-w-md grid-cols-2 gap-5 md:mt-8 md:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3E5CB] text-[#8A6A34]">
            <CalendarIcon />
          </span>
          <div className="min-w-0">
            <p
              className={`font-poppins TextSmall font-medium leading-tight tracking-[0.06em] text-[#382910] ${useUppercaseLabels ? "uppercase" : ""}`}
            >
              {t("eventDate")}
            </p>
            <p
              className={`mt-0.5 font-poppins text-xs tracking-[0.04em] text-[#382910]/70 ${useUppercaseLabels ? "uppercase" : ""}`}
            >
              {t("eventDay")}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3E5CB] text-[#8A6A34]">
            <PinIcon />
          </span>
          <div className="min-w-0">
            <p
              className={`font-poppins text-[11px] font-medium leading-tight tracking-[0.06em] text-[#382910] md:text-xs ${useUppercaseLabels ? "uppercase" : ""}`}
            >
              {t("venueName")}
            </p>
            <p
              className={`mt-0.5 font-poppins text-[10px] tracking-[0.04em] text-[#382910]/70 md:text-[11px] ${useUppercaseLabels ? "uppercase" : ""}`}
            >
              {t("venueCountry")}
            </p>
          </div>
        </div>
      </div>

      <Button
        href="/gallery"
        variant="dark"
        className="mt-8 md:mt-10"
        textClassName={useUppercaseLabels ? "" : "normal-case tracking-wide"}
      >
        {t("cta")}
      </Button>
    </div>
  );
}

export default function CheckStatusRouteMapSection() {
  const t = useTranslations("checkStatusPage.routeMap");

  return (
    <>
      <section className="relative z-10 isolate bg-white md:hidden">
        <div className="container py-10">
          <RouteMapContent />
        </div>
        <div className="w-full">
          <Image
            src="/map.webp"
            alt={t("mapAlt")}
            width={1440}
            height={900}
            className="h-auto w-full"
            sizes="100vw"
          />
        </div>
      </section>

      <section
        className={`relative z-10 isolate hidden overflow-hidden bg-white md:flex md:items-center ${SCREEN_SECTION_HEIGHT}`}
      >
        <SectionBackgroundImage
          src="/map.webp"
          className="object-cover object-center lg:object-right-center"
        />

        <div
          className={`container relative z-10 flex items-center py-10 lg:py-12 ${SCREEN_SECTION_INNER}`}
        >
          <RouteMapContent className="w-full max-w-lg" />
        </div>
      </section>
    </>
  );
}
