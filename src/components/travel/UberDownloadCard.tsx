"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { UBER_APP_LINKS, UBER_ASSETS } from "@/data/uberTravel";

function SupportIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3E5CB] text-[#C5A267]">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 14a8 8 0 0 1 16 0v2a2 2 0 0 1-2 2h-1.5l-1.2 2.4a1 1 0 0 1-1.8 0L13.5 18H12a2 2 0 0 1-2-2v-2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

type UberDownloadCardProps = {
  variant?: "overlap" | "inline";
};

export default function UberDownloadCard({
  variant = "overlap",
}: UberDownloadCardProps) {
  const t = useTranslations("uberTravel");
  const isInline = variant === "inline";

  return (
    <div
      className={`relative z-20 w-full rounded-[24px] border border-[#C79E5E] p-5 md:rounded-[28px] md:p-9 lg:p-10 ${
        isInline
          ? "mt-0 shadow-[0_12px_40px_rgba(56,41,16,0.08)]"
          : "-mt-12 md:-mt-14 lg:-mt-16"
      }`}
      style={{
        background: "linear-gradient(180deg, #FFFCF7 0%, #F5E9D6 100%)",
      }}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="flex min-w-0 flex-1 items-start gap-4 md:gap-6 lg:max-w-[560px]">
          <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl md:h-[104px] md:w-[104px] lg:h-[112px] lg:w-[112px]">
            <Image
              src={UBER_ASSETS.logo}
              alt="Uber"
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>

          <div className="min-w-0 pt-1 md:pt-2">
            <h3 className="font-display text-xl !font-medium !text-ink md:HeadingH3">
              {t("downloadTitle")}
            </h3>
            <p className="mt-2 max-w-lg font-poppins text-sm leading-relaxed text-[#382910]/75 md:Text md:!leading-relaxed">
              {t("downloadSubtext")}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 md:justify-start md:gap-6">
          <div className="flex w-[148px] flex-col gap-2 md:w-[190px] md:gap-2.5">
            <a
              href={UBER_APP_LINKS.googlePlay}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-opacity hover:opacity-85"
            >
              <Image
                src={UBER_ASSETS.googlePlay}
                alt={t("googlePlayAlt")}
                width={190}
                height={56}
                className="h-auto w-full"
              />
            </a>
            <a
              href={UBER_APP_LINKS.appStore}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-opacity hover:opacity-85"
            >
              <Image
                src={UBER_ASSETS.appStore}
                alt={t("appStoreAlt")}
                width={190}
                height={56}
                className="h-auto w-full"
              />
            </a>
          </div>

          <div className="shrink-0">
            <Image
              src={UBER_ASSETS.qrCode}
              alt={t("qrAlt")}
              width={128}
              height={128}
              className="h-[108px] w-[108px] object-contain md:h-[128px] md:w-[128px]"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 border-t border-[#382910]/10 pt-4 md:mt-8 md:pt-5">
        <SupportIcon />
        <p className="font-poppins text-xs leading-relaxed text-[#382910]/75 md:text-sm">
          {t("footerNote")}
        </p>
      </div>
    </div>
  );
}
