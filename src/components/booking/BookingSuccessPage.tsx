"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import CelebrationAnimation from "@/components/booking/CelebrationAnimation";

function SuccessIcon() {
  return (
    <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
      <span className="absolute inset-0 animate-ping rounded-full bg-[#C79E5E]/25" />
      <span className="absolute inset-[-6px] rounded-full bg-gradient-to-br from-[#FFD700]/20 to-[#C79E5E]/10 blur-md" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#F3E5CB] to-[#E8D4A8] shadow-[0_12px_40px_-12px_rgba(56,41,16,0.35)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#382910] text-white">
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  const t = useTranslations("bookingSuccessPage");
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const name = searchParams.get("name") ?? "";

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#FFFDF8] pb-16 pt-28 md:pt-36">
      <CelebrationAnimation />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#FBF6EB] to-transparent"
        aria-hidden
      />

      <div className="container relative z-10">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-[#382910]/12 bg-gradient-to-br from-[#FDFCFA] via-[#FBF6EB] to-[#F3E5CB] p-8 shadow-[0_28px_70px_-28px_rgba(56,41,16,0.28)] md:p-12">
            <SuccessIcon />

            <p className="mt-8 text-center eyebrow !capitalize text-[#382910]/70">
              <span className="font-poppins">{t("eyebrow")}</span>
            </p>

            <h1 className="mt-4 text-center font-display HeadingH2 !font-medium !text-ink">
              {t("headingPlain")}{" "}
              <span className="italic text-falcon-deep">{t("headingItalic")}</span>
            </h1>

            {name ? (
              <p className="mt-4 text-center font-display text-lg text-[#382910]">
                {t("welcomeName", { name })}
              </p>
            ) : null}

            <p className="mx-auto mt-5 max-w-lg text-center TextSmall !font-poppins !leading-relaxed !text-ink/75">
              {t("description")}
            </p>

            {email ? (
              <div className="mt-8 rounded-xl border border-[#382910]/10 bg-white/70 p-5 md:p-6">
                <p className="font-poppins text-sm font-medium text-ink">{t("emailNoticeTitle")}</p>
                <p className="mt-2 font-poppins text-sm leading-relaxed text-ink/70">{email}</p>
                <p className="mt-2 font-poppins text-sm leading-relaxed text-ink/70">
                  {t("emailNoticeBody")}
                </p>
              </div>
            ) : null}

            <ul className="mt-6 space-y-3">
              {[t("steps.0"), t("steps.1"), t("steps.2")].map((step) => (
                <li key={step} className="flex items-start gap-3 font-poppins text-sm text-ink/75">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-falcon-deep" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button href="/" variant="gold" className="w-full sm:w-auto">
                {t("ctaHome")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
