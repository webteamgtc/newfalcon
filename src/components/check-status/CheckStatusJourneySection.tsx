"use client";

import { useLocale, useTranslations } from "next-intl";

type JourneyStepCopy = {
  label: string;
  title: string;
  description: string;
};

const STEP_ICONS = ["verify", "track", "qualify", "attend"] as const;

const STEP_NUMBER_FONT =
  "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const ICON_CIRCLE_CLASS =
  "flex shrink-0 items-center justify-center rounded-full border border-[#382910]/10 bg-gradient-to-b from-[#FFFCF7] to-[#F5E9D6] shadow-[0_8px_24px_-12px_rgba(56,41,16,0.2)]";

function StepIcon({ type }: { type: (typeof STEP_ICONS)[number] }) {
  return (
    <span className="text-[#C5A267]" aria-hidden="true">
      {type === "verify" ? (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6.5 12 11l8-4.5M4 6.5v11L12 22l8-4.5v-11L12 11 4 6.5Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path
            d="m15.5 10.5 1.8 1.8 3.2-3.4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      {type === "track" ? (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 18V8M12 18V5M17 18v-7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ) : null}
      {type === "qualify" ? (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="m8.5 12.2 2.2 2.2 4.8-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      {type === "attend" ? (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3.5 14.8 9l6.2.9-4.5 4.4 1.1 6.2L12 17.8 6.4 20.5l1.1-6.2L3 9.9 9.2 9 12 3.5Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

function StepNumber({ number, className }: { number: string; className?: string }) {
  return (
    <span
      className={`block font-extralight leading-[0.82] tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_#C5A267] ${className ?? ""}`}
      style={{ fontFamily: STEP_NUMBER_FONT }}
      aria-hidden
    >
      {number}
    </span>
  );
}

function StepCopy({
  step,
  useUppercaseLabels,
}: {
  step: JourneyStepCopy;
  useUppercaseLabels: boolean;
}) {
  return (
    <>
      <p
        className={`font-display text-xs italic tracking-[0.06em] text-[#C5A267] md:text-xl md:tracking-[0.04em] ${useUppercaseLabels ? "uppercase md:normal-case" : ""}`}
      >
        {step.label}
      </p>
      <h3 className="mt-0.5 font-display text-sm font-medium leading-snug text-ink md:mt-1 md:text-2xl">
        {step.title}
      </h3>
      <p className="mt-1 font-poppins text-xs leading-relaxed text-[#382910]/75 md:mt-2 md:text-base md:text-[#382910]/80">
        {step.description}
      </p>
    </>
  );
}

export default function CheckStatusJourneySection() {
  const t = useTranslations("checkStatusPage.journey");
  const locale = useLocale();
  const useUppercaseLabels = locale === "en";
  const steps = t.raw("steps") as JourneyStepCopy[];

  return (
    <section className="relative z-10 bg-[#F9F6F1] py-12 md:bg-gradient-to-b md:from-[#F5E9D6] md:via-white md:to-white md:py-16 lg:py-20">
      <div className="container relative z-10">
        <div className="max-w-3xl">
          <p
            className={`eyebrow tracking-[0.18em] text-[#C5A267] ${useUppercaseLabels ? "uppercase" : ""}`}
          >
            <span className="font-poppins">{t("eyebrow")}</span>
          </p>
          <h2 className="mt-3 font-display text-[2rem] leading-[1.15] font-medium tracking-[-0.02em] text-ink md:mt-4 md:text-[3rem] lg:text-[4rem]">
            <span className="block">{t("headingLine1")}</span>
            <span className="block text-[#C5A267] md:text-ink">{t("headingLine2")}</span>
          </h2>
          <p className="mt-4 max-w-2xl font-display text-sm leading-relaxed text-[#382910]/85 md:mt-5 md:text-base">
            {t("subtext")}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 md:mt-14 md:grid md:grid-cols-2 md:gap-10 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, index) => {
            const number = String(index + 1).padStart(2, "0");
            const icon = STEP_ICONS[index] ?? "verify";

            return (
              <article
                key={number}
                className="min-w-0 rounded-2xl bg-white p-4 shadow-[0_10px_36px_-14px_rgba(56,41,16,0.14)] md:rounded-none md:bg-transparent md:p-0 md:shadow-none"
              >
                <div className="flex items-center gap-3 md:hidden">
                  <StepNumber number={number} className="shrink-0 text-[3.25rem]" />
                  <div className={`${ICON_CIRCLE_CLASS} h-12 w-12`}>
                    <StepIcon type={icon} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <StepCopy step={step} useUppercaseLabels={useUppercaseLabels} />
                  </div>
                </div>

                <div className="hidden grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-4 md:grid">
                  <div className="col-start-1 row-start-1 flex h-16 w-16 items-center justify-center rounded-full border border-[#382910]/10 bg-white shadow-[0_8px_24px_-12px_rgba(56,41,16,0.35)]">
                    <StepIcon type={icon} />
                  </div>

                  <StepNumber
                    number={number}
                    className="col-start-1 row-start-2 text-[5.25rem]"
                  />

                  <div className="col-start-2 row-start-2 min-w-0 self-start pt-1">
                    <StepCopy step={step} useUppercaseLabels={useUppercaseLabels} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
