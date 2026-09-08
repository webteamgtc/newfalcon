"use client";

import { useTranslations } from "next-intl";
import PublicVipTicketBookingForm from "@/components/vip/PublicVipTicketBookingForm";

export default function CheckStatusHero() {
  const t = useTranslations("checkStatusPage");

  return (
    <section className="relative flex min-h-[52vh] items-center pb-8 pt-32 md:min-h-[58vh] md:pb-12 md:pt-40">
      <div className="container relative grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
        <div className="max-w-2xl md:self-center">
          <p className="eyebrow !capitalize text-ink/65">
            <span className="font-poppins">
              {t("heroEyebrow")}
              <span className="mx-2">·</span>
              {t("heroYear")}
            </span>
          </p>
          <h1 className="mt-5 font-display HeadingH1 !font-medium !text-ink">
            {t("heroHeadingPlain")}
            <br />
            <span className="italic text-falcon-deep">{t("heroHeadingItalic")}</span>
          </h1>
          <p className="mt-5 max-w-md Text !leading-snug !font-poppins !text-ink/70">
            {t("heroSubtext")}
          </p>
        </div>

        <section id="access-form" className="relative">
          <div className="relative z-[1] mx-auto max-w-2xl">
            <div
              className="relative overflow-hidden rounded-2xl border border-[#382910]/12 bg-gradient-to-br from-[#FDFCFA] via-[#FBF6EB] to-[#F3E5CB] p-6 shadow-[0_28px_70px_-28px_rgba(56,41,16,0.35)] md:p-5"
              aria-label={t("formEyebrow")}
            >
              <div
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
                aria-hidden
              />

              <PublicVipTicketBookingForm />
            </div>

            <p className="mx-auto mt-6 max-w-md text-center font-poppins text-[11px] leading-relaxed text-ink/50">
              {t("bottomNote")}
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}
