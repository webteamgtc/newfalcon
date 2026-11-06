"use client";

import { useTranslations } from "next-intl";

/** Short inline copy where a registration CTA would appear. */
export default function RegistrationClosedNotice({ className = "" }: { className?: string }) {
  const t = useTranslations("registrationClosed");

  return (
    <p className={`font-poppins text-sm leading-relaxed text-[#382910]/75 md:text-base ${className}`}>
      {t("inline")}
    </p>
  );
}
