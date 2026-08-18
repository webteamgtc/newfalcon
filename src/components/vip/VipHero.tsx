"use client";

import { useTranslations } from "next-intl";
import { useVipUser } from "@/context/VipUserProvider";

export default function VipHero() {
  const t = useTranslations("vipPage");
  const { user } = useVipUser();

  const guestName = user ? `${user.firstName} ${user.lastName}.` : t("heroHeadingName");

  return (
    <section className="relative flex min-h-[52vh] items-end overflow-hidden bg-[url('/22.webp')] bg-cover bg-center pb-10 pt-36 md:min-h-[80vh] md:bg-[url('/11.webp')] md:bg-cover md:bg-right md:pb-24 md:pt-36">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 via-black/45 to-transparent"
        aria-hidden
      />
      <div className="container relative z-[1] w-full">
        <div className="grid w-full items-center md:grid-cols-2">
          <div className="max-w-xl text-start">
            <p className="eyebrow !normal-case text-white/80">
              <span className="font-poppins uppercase tracking-[0.18em]">
                {t("heroEyebrow")}
                <span className="mx-2">·</span>
                {t("heroYear")}
              </span>
            </p>
            <h1 className="mt-5 font-display HeadingH1 !font-medium !text-[#F4ECDC]">
              {t("heroHeadingPlain")}
              <br />
              <span className="italic text-falcon-light">{guestName}</span>
            </h1>
            <p className="mt-5 max-w-md Text !font-poppins !leading-snug !text-white/85">
              {t("heroSubtext")}
            </p>
            <a
              href="#progress"
              className="mt-8 inline-flex items-center gap-4 rounded-full bg-[#382910]/90 py-1.5 ps-6 pe-3 font-poppins text-sm uppercase tracking-[0.14em] text-white transition-colors hover:bg-ink"
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
          </div>
        </div>
      </div>
    </section>
  );
}
