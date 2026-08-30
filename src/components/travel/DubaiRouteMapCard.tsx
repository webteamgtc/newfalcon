"use client";

import { useTranslations } from "next-intl";

function PlaneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 12 21 4l-3 8 3 8-6-3-6 3 3-8-3-8 6 3 6-3Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HotelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 19V9l7-3 7 3v10M5 19h14M9 19v-4h6v4M9 11h1.5M13.5 11H15"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DubaiRouteMapCard({ className = "" }: { className?: string }) {
  const t = useTranslations("dubaiRouteMap");

  return (
    <div
      className={`rounded-[24px] border border-[#382910]/10 p-5 shadow-[0_10px_36px_rgba(56,41,16,0.08)] md:max-w-[360px] md:rounded-[20px] ${className}`}
      style={{
        background: "linear-gradient(180deg, #FFFCF7 0%, #F5E9D6 100%)",
      }}
    >
      <div className="flex gap-4">
        <div className="flex w-9 shrink-0 flex-col items-center pt-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3E5CB] text-[#8A6A34]">
            <PlaneIcon />
          </span>
          <span className="my-2 block h-8 w-px bg-[#C5A267]/45" />
          <span className="h-2 w-2 rounded-full bg-[#C5A267]" />
          <span className="my-2 block h-8 w-px bg-[#C5A267]/45" />
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3E5CB] text-[#8A6A34]">
            <HotelIcon />
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-5 py-0.5">
          <div>
            <p className="font-display text-sm font-medium text-[#382910]">
              {t("originNameZh")}
            </p>
            <p className="mt-0.5 font-poppins text-[11px] text-[#382910]/70">
              {t("originNameEn")}
            </p>
          </div>

          <p className="font-display text-xs text-[#382910]/80">{t("routeSummary")}</p>

          <div>
            <p className="font-display text-sm font-medium text-[#382910]">
              {t("destinationNameZh")}
            </p>
            <p className="mt-0.5 font-poppins text-[11px] text-[#382910]/70">
              {t("destinationNameEn")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
