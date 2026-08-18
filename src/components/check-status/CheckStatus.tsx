import CheckStatusHero from "@/components/check-status/CheckStatusHero";
import CheckStatusTrustBadges from "@/components/check-status/CheckStatusTrustBadges";
import TicketAccessForm from "@/components/ticket/TicketAccessForm";
import { useTranslations } from "next-intl";

export default function CheckStatus() {
  const t = useTranslations("checkStatusPage");

  return (
    <div className="check-status-page-bg">
      <CheckStatusHero />

      <section id="access-form" className="relative scroll-mt-28 pb-14 pt-2 md:pb-20">
        <div className="container">
          <div className="mx-auto mb-8 max-w-2xl text-center md:mb-10">
            <p className="eyebrow !capitalize text-falcon-deep">
              <span className="font-poppins">{t("formEyebrow")}</span>
            </p>
            <h2 className="mt-3 font-display HeadingH2 !font-medium !text-ink">
              {t("formHeadingPlain")}{" "}
              <span className="italic text-falcon-deep">{t("formHeadingItalic")}</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg TextSmall !font-poppins !text-ink/70">
              {t("formDescription")}
            </p>
          </div>

          <CheckStatusTrustBadges />

          <div className="relative z-[1] mx-auto mt-8 max-w-2xl md:mt-10">
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
              <TicketAccessForm embedded />
            </div>

            <p className="mx-auto mt-6 max-w-md text-center font-poppins text-[11px] leading-relaxed text-ink/50">
              {t("bottomNote")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
