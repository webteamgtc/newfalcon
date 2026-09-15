"use client";

import { useTranslations } from "next-intl";

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
    <div className="px-1 py-2 text-center md:px-2 md:py-4">
      <p className="eyebrow !capitalize text-[#382910]/70">
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

      {email ? (
        <div className="mx-auto mt-6 max-w-md rounded-xl border border-[#382910]/10 bg-white/80 p-4 text-start md:p-5">
          <p className="font-poppins text-sm font-medium text-ink">{t("emailNoticeTitle")}</p>
          <p className="mt-2 font-poppins text-sm leading-relaxed text-ink/70">{email}</p>
          <p className="mt-2 font-poppins text-sm leading-relaxed text-ink/70">{t("emailNoticeBody")}</p>
        </div>
      ) : null}
    </div>
  );
}
