"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { VIP_QUALIFICATION_TARGETS } from "@/data/vipUsers";

function formatTargetNumber(value: number, locale: string) {
  return value.toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: 0,
  });
}

function NetDepositIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="16" rx="7" ry="2.5" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="12" cy="13" rx="7" ry="2.5" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="12" cy="10" rx="7" ry="2.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function TradingVolumeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.5 9.5a4 4 0 0 1 5.8-3.6M15.5 14.5a4 4 0 0 1-5.8 3.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M7 6.5 8.5 9.5 5.5 10.5M17 17.5 15.5 14.5 18.5 13.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type RequirementCardProps = {
  icon: ReactNode;
  label: string;
  amount: string;
  unit: string;
  unitPosition: "above" | "below";
  footnote: string;
  useUppercaseLabels: boolean;
};

function RequirementCard({
  icon,
  label,
  amount,
  unit,
  unitPosition,
  footnote,
  useUppercaseLabels,
}: RequirementCardProps) {
  return (
    <article className="flex min-h-[15.5rem] min-w-0 flex-1 flex-col items-center justify-center rounded-[1.35rem] bg-white px-3 py-5 text-center shadow-[0_12px_40px_-18px_rgba(56,41,16,0.18)] sm:min-h-[16.5rem] sm:px-4 sm:py-6 md:px-5 lg:min-h-[22rem] lg:rounded-[1.75rem] lg:px-8 lg:py-10 xl:min-h-[24rem] xl:px-10 xl:py-12">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#382910]/8 bg-gradient-to-b from-[#FFFCF7] to-[#F5E9D6] text-[#C5A267] sm:h-12 sm:w-12 lg:h-16 lg:w-16 xl:h-[4.5rem] xl:w-[4.5rem]">
        {icon}
      </div>

      <p
        className={`mt-4 font-display text-[0.65rem] tracking-[0.14em] text-[#C5A267] sm:mt-5 sm:text-xs lg:mt-6 lg:text-sm xl:mt-7 xl:text-base ${useUppercaseLabels ? "uppercase" : ""}`}
      >
        {label}
      </p>

      {unitPosition === "above" ? (
        <p className="mt-3 font-display text-sm text-[#C5A267] sm:text-base lg:mt-4 lg:text-xl xl:text-2xl">
          {unit}
        </p>
      ) : null}

      <p className="mt-1 font-display text-[1.65rem] font-medium leading-none tracking-[-0.02em] text-[#C5A267] sm:text-[2rem] md:text-[2.15rem] lg:mt-2 lg:text-[2.75rem] xl:text-[3.25rem] 2xl:text-[3.5rem]">
        {amount}
      </p>

      {unitPosition === "below" ? (
        <p className="mt-2 font-display text-sm text-[#C5A267] sm:text-base lg:mt-3 lg:text-xl xl:text-2xl">
          {unit}
        </p>
      ) : null}

      <p className="mt-4 font-poppins text-[10px] leading-snug text-[#382910]/72 sm:mt-5 sm:text-xs lg:mt-7 lg:text-sm xl:mt-8 xl:text-base">
        {footnote}
      </p>
    </article>
  );
}

export default function CheckStatusQualificationSection() {
  const t = useTranslations("checkStatusPage.qualification");
  const locale = useLocale();
  const useUppercaseLabels = locale === "en";

  const netDepositAmount = formatTargetNumber(VIP_QUALIFICATION_TARGETS.capital, locale);
  const tradingLotsAmount = formatTargetNumber(VIP_QUALIFICATION_TARGETS.activity, locale);

  return (
    <section className="relative z-10 bg-[#FAF2E7] py-12 md:py-16 lg:py-24 xl:py-28">
      <div className="container relative z-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:items-center lg:gap-14 xl:gap-20">
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:max-w-none lg:text-start">
            <p
              className={`font-display text-xs tracking-[0.18em] text-[#C5A267] lg:text-sm xl:text-base ${useUppercaseLabels ? "uppercase" : ""}`}
            >
              {t("eyebrow")}
              <span className="mx-1.5 opacity-70">·</span>
              {t("eyebrowYear")}
            </p>

            <h2 className="mt-4 font-display text-[2rem] leading-[1.12] font-medium tracking-[-0.02em] text-ink md:text-[2.75rem] lg:mt-5 lg:text-[3.25rem] xl:text-[3.75rem] 2xl:text-[4rem]">
              <span className="block">{t("headingLine1")}</span>
              <span className="mt-1 block font-display text-[2.35rem] italic leading-[1.05] text-[#C5A267] md:text-[3rem] lg:mt-2 lg:text-[3.5rem] xl:text-[4rem] 2xl:text-[4.5rem]">
                {t("headingScript")}
              </span>
              <span className="mt-1 block lg:mt-2">{t("headingLine2")}</span>
            </h2>

            <p className="mx-auto mt-5 max-w-md font-display text-sm leading-relaxed text-[#382910]/82 md:text-base lg:mx-0 lg:mt-7 lg:max-w-lg lg:text-lg xl:mt-8 xl:max-w-xl xl:text-xl">
              {t("subtext")}
            </p>
          </div>

          <div className="mx-auto flex w-full max-w-[34rem] items-stretch lg:max-w-none xl:max-w-[44rem] 2xl:max-w-[48rem]">
            <RequirementCard
              icon={<NetDepositIcon className="h-[1.375rem] w-[1.375rem] sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />}
              label={t("netDepositLabel")}
              amount={netDepositAmount}
              unit={t("currencyUnit")}
              unitPosition="above"
              footnote={t("netDepositFootnote")}
              useUppercaseLabels={useUppercaseLabels}
            />

            <div
              className="relative z-10 -mx-3 flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-full border border-[#382910]/10 bg-[#FAF2E7] sm:-mx-4 sm:h-12 sm:w-12 lg:-mx-5 lg:h-16 lg:w-16 xl:-mx-6 xl:h-[4.5rem] xl:w-[4.5rem]"
              role="separator"
              aria-label={t("connectorOrHint")}
            >
              <span
                className={`font-display text-sm font-medium text-[#C5A267] sm:text-base lg:text-xl xl:text-2xl ${useUppercaseLabels ? "uppercase tracking-[0.12em]" : ""}`}
              >
                {t("connectorOr")}
              </span>
            </div>

            <RequirementCard
              icon={
                <TradingVolumeIcon className="h-[1.375rem] w-[1.375rem] sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />
              }
              label={t("tradingVolumeLabel")}
              amount={tradingLotsAmount}
              unit={t("lotsUnit")}
              unitPosition="below"
              footnote={t("tradingFootnote")}
              useUppercaseLabels={useUppercaseLabels}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
