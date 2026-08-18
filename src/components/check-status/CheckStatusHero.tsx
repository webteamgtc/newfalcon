"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import StaffRegistrationModal from "@/components/check-status/StaffRegistrationModal";

export default function CheckStatusHero() {
  const t = useTranslations("checkStatusPage");
  const [staffModalOpen, setStaffModalOpen] = useState(false);

  return (
    <>
      <section className="relative flex min-h-[52vh] items-center pb-8 pt-32 md:min-h-[58vh] md:pb-12 md:pt-40">
        <div className="container relative">
          <div className="max-w-2xl">
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
              <a
                href="#access-form"
                className="inline-flex items-center gap-4 rounded-full bg-ink py-1.5 ps-6 pe-3 font-poppins text-sm uppercase tracking-[0.14em] text-white transition-colors hover:bg-falcon-deep"
              >
                <span>{t("heroCta")}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-ink">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 2v10M7 12l-3.5-3.5M7 12l3.5-3.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
              <button
                type="button"
                onClick={() => setStaffModalOpen(true)}
                className="inline-flex items-center gap-4 rounded-full border border-ink/25 bg-white/80 py-1.5 ps-6 pe-3 font-poppins text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:border-falcon-deep hover:bg-white"
              >
                <span>{t("staffRegistrationCta")}</span>
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
              </button>
            </div>
          </div>
        </div>
      </section>

      <StaffRegistrationModal
        open={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
      />
    </>
  );
}
