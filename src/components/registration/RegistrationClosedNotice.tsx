"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

/** Short inline copy where a registration CTA would appear. */
export default function RegistrationClosedNotice({ className = "" }: { className?: string }) {
  const t = useTranslations("registrationClosed");

  return (
    <p className={`font-poppins text-sm leading-relaxed text-[#382910]/75 md:text-base ${className}`}>
      {t("inline")}{" "}
      <Link href="/user-status" className="font-medium text-falcon-deep underline underline-offset-2">
        {t("ctaUserStatus")}
      </Link>
    </p>
  );
}
