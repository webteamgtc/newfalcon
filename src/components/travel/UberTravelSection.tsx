"use client";

import { useTranslations } from "next-intl";
import UberDownloadCard from "@/components/travel/UberDownloadCard";
import SectionBackgroundImage from "@/components/ui/SectionBackgroundImage";
import {
  SCREEN_SECTION_HEIGHT,
  SCREEN_SECTION_INNER,
  SECTION_BG_IMAGE_POSITION,
} from "@/lib/sectionLayout";

type FeatureCopy = {
  title: string;
  lines: string[];
};

function FeatureIcon({
  type,
  compact = false,
}: {
  type: "car" | "clock" | "card";
  compact?: boolean;
}) {
  const sizeClass = compact
    ? "h-12 w-12"
    : "h-14 w-14";

  return (
    <span
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full border border-[#C5A267]/50 bg-[#F3E5CB]/90 text-[#C5A267]`}
    >
      {type === "car" ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 11h14l-1.2-3.6a2 2 0 0 0-1.9-1.4H8.1a2 2 0 0 0-1.9 1.4L5 11Zm0 0v5h1.5M19 11v5h-1.5M7.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      {type === "clock" ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M12 8v4l2.5 2.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      {type === "card" ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ) : null}
    </span>
  );
}

const FEATURE_ICONS = ["car", "clock", "card"] as const;

export default function UberTravelSection() {
  const t = useTranslations("uberTravel");
  const features = t.raw("features") as FeatureCopy[];

  return (
    <section
      className={`relative isolate flex min-h-[520px] items-center overflow-hidden ${SCREEN_SECTION_HEIGHT}`}
    >
      <SectionBackgroundImage src="/new/new1-bg.webp" className={SECTION_BG_IMAGE_POSITION} />
      <div className={`container relative z-10 w-full pt-10 pb-8 md:pb-0 md:pt-14 lg:pt-16 ${SCREEN_SECTION_INNER}`}>
        <div className="max-w-2xl">
          <p className="eyebrow text-falcon-deep !capitalize">
            <span className="font-poppins">{t("eyebrow")}</span>
          </p>
          <h2 className="mt-3 font-display HeadingH1 !font-medium !text-ink">
            {t("heading")}
          </h2>
          <p className="mt-2 font-display text-xl italic text-falcon-deep md:text-2xl">
            {t("headingAccent")}
          </p>
        </div>

        <div className="mt-8 max-w-[650px] md:mt-10 lg:mt-12">
          <div className="flex flex-col gap-5 md:grid md:grid-cols-3 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex min-h-0 flex-row items-start gap-4 text-start md:min-h-[180px] md:flex-col md:items-center md:text-center"
              >
                <FeatureIcon type={FEATURE_ICONS[index] ?? "car"} compact />
                <div className="min-w-0 flex-1 md:flex-none">
                  <h3 className="font-display text-lg !font-medium !text-[#382910] md:mt-4 md:HeadingH4">
                    {feature.title}
                  </h3>
                  <div className="mt-1 space-y-0.5 md:mt-3 md:space-y-1">
                    {feature.lines.map((line, lineIndex) => (
                      <p
                        key={line}
                        className={`font-display text-sm !leading-snug !text-[#382910]/80 md:text-base md:!text-[#382910] ${
                          lineIndex > 0 ? "hidden md:block" : ""
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 md:hidden">
          <UberDownloadCard variant="inline" />
        </div>
      </div>
    </section>
  );
}
