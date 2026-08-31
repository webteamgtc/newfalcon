"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import CheckStatusTrustBadges from "@/components/check-status/CheckStatusTrustBadges";
import TicketAccessForm from "@/components/ticket/TicketAccessForm";

export default function CheckStatusHero() {
  const t = useTranslations("checkStatusPage");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const useUppercaseLabels = locale === "en";

  return (
    <>
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
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/user-status"
                className={`inline-flex items-center gap-4 rounded-full border border-ink/25 bg-white/80 py-1.5 ps-6 pe-3 font-poppins text-sm text-ink transition-colors hover:border-falcon-deep hover:bg-white ${useUppercaseLabels ? "uppercase tracking-[0.14em]" : "tracking-wide"}`}
              >
                <span>{tNav("checkStatus")}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 7h9M9 3.5 12.5 7 9 10.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
          <section id="access-form" className="relative">
            <div className="">
              <div className="relative z-[1] mx-auto max-w-2xl">
                <div
                  className="relative overflow-hidden rounded-2xl border border-[#382910]/12 bg-gradient-to-br from-[#FDFCFA] via-[#FBF6EB] to-[#F3E5CB] p-6 shadow-[0_28px_70px_-28px_rgba(56,41,16,0.35)] md:p-10"
                  aria-labelledby="check-status-form-title"
                >
                  <div
                    className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
                    aria-hidden
                  />
                  <p id="check-status-form-title" className="sr-only">
                    {t("formEyebrow")}
                  </p>
                  <TicketAccessForm
                    embedded
                    translationNamespace="checkStatusPage.accessForm"
                    defaultExistingClient="yes"
                    showAllFields
                  />
                </div>

                <p className="mx-auto mt-6 max-w-md text-center font-poppins text-[11px] leading-relaxed text-ink/50">
                  {t("bottomNote")}
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
