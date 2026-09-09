"use client";

import { useTranslations } from "next-intl";
import CelebrationAnimation from "@/components/booking/CelebrationAnimation";

function SuccessIcon() {
  return (
    <div className="relative mx-auto flex h-20 w-20 items-center justify-center md:h-24 md:w-24">
      <span className="absolute inset-0 animate-ping rounded-full bg-[#C79E5E]/20" />
      <span className="absolute inset-[-6px] rounded-full bg-gradient-to-br from-[#FFD700]/20 to-[#C79E5E]/10 blur-md" />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#F3E5CB] to-[#E8D4A8] shadow-[0_12px_40px_-12px_rgba(56,41,16,0.35)] md:h-20 md:w-20">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#382910] text-white md:h-14 md:w-14">
          <svg
            className="h-6 w-6 md:h-7 md:w-7"
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

type PublicRegistrationSuccessProps = {
  email: string;
  fullName: string;
  onClose: () => void;
};

export default function PublicRegistrationSuccess({
  email,
  fullName,
  onClose,
}: PublicRegistrationSuccessProps) {
  const t = useTranslations("bookingSuccessPage");

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-xl px-1 py-2 text-center md:min-h-[460px] md:px-2 md:py-4">
      <CelebrationAnimation contained />

      <div className="relative z-10">
        <p className="mt-6 eyebrow !capitalize text-[#382910]/70">
          <span className="font-poppins">{t("eyebrow")}</span>
        </p>

        <h2 className="mt-3 font-display text-[1.65rem] font-medium leading-tight text-ink md:text-[2rem]">
          {t("headingPlain")}{" "}
          <span className="italic text-falcon-deep">{t("headingItalic")}</span>
        </h2>

        {fullName ? (
          <p className="mt-3 font-display text-lg text-[#382910]">{t("welcomeName", { name: fullName })}</p>
        ) : null}

        <p className="mx-auto mt-4 max-w-lg TextSmall !font-poppins !leading-relaxed !text-ink/75">
          {t("description")}
        </p>
      </div>
    </div>
  );
}
