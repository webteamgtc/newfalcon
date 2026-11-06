"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/Button";

type Props = {
  variant?: "card" | "page";
};

export default function RegistrationClosedPanel({ variant = "card" }: Props) {
  const t = useTranslations("registrationClosed");

  const isPage = variant === "page";

  return (
    <div
      className={
        isPage
          ? "mx-auto max-w-lg rounded-3xl border border-[#382910]/12 bg-gradient-to-br from-[#FDFCFA] via-[#FBF6EB] to-[#F3E5CB] p-8 text-center shadow-[0_28px_70px_-28px_rgba(56,41,16,0.25)] md:p-10"
          : "rounded-2xl border border-[#382910]/12 bg-gradient-to-br from-[#FDFCFA] via-[#FBF6EB] to-[#F3E5CB] p-6 md:p-8"
      }
    >
      <p className="font-poppins text-[11px] font-semibold uppercase tracking-[0.18em] text-falcon-deep">
        {t("eyebrow")}
      </p>
      <h2
        className={`mt-3 font-display font-medium text-ink ${
          isPage ? "text-3xl md:text-4xl" : "text-2xl"
        }`}
      >
        {t("title")}
      </h2>
      <p className="mt-4 font-poppins text-sm leading-relaxed text-[#382910]/80 md:text-[15px]">
        {t("body")}
      </p>
      <p className="mt-4 rounded-xl border border-[#382910]/12 bg-white/50 px-4 py-3 font-display text-base italic leading-snug text-falcon-deep md:text-lg">
        {t("lineManager")}
      </p>
      <p className="mt-3 font-poppins text-sm leading-relaxed text-[#382910]/65 md:text-[15px]">
        {t("bodyRegistered")}
      </p>
      <div
        className={`mt-8 flex flex-col gap-3 sm:flex-row ${
          isPage ? "justify-center" : "sm:justify-start"
        }`}
      >
        <Button href="/user-status" variant="gold" className="w-full sm:w-auto">
          {t("ctaUserStatus")}
        </Button>
        <Button href="/" variant="light" className="w-full sm:w-auto">
          {t("ctaHome")}
        </Button>
      </div>
    </div>
  );
}
