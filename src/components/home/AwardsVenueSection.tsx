import Image from "next/image";
import { useTranslations } from "next-intl";

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 21s6-5.2 6-10.5a6 6 0 1 0-12 0C6 15.8 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="10.5" r="2" fill="currentColor" />
    </svg>
  );
}

export default function AwardsVenueSection() {
  const t = useTranslations("home.venue");

  return (
    <section className="relative isolate overflow-hidden bg-[#FDF9F2] py-14 md:py-20">
      <div className="container grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-poppins text-[11px] font-medium uppercase tracking-[0.18em] text-[#382910]/70">
            <span className="text-falcon-deep" aria-hidden>
              ◆
            </span>
            {t("eyebrow")}
          </p>

          <h2 className="mt-4 font-display text-[2rem] leading-[1.12] font-medium text-ink md:text-[2.5rem] lg:text-[2.75rem]">
            <span className="block">{t("headingLine1")}</span>
            <span className="mt-1 block italic text-falcon-deep">{t("headingLine2")}</span>
          </h2>

          <p className="mt-5 max-w-lg font-poppins text-sm leading-relaxed text-[#382910]/85 md:text-[15px]">
            {t("subtext")}
          </p>

          <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-[#382910]/15 py-6">
            <div>
              <dt className="font-poppins text-[10px] font-semibold uppercase tracking-[0.14em] text-[#382910]/50">
                {t("dateLabel")}
              </dt>
              <dd className="mt-1.5 font-display text-lg font-medium text-ink md:text-xl">
                {t("dateValue")}
              </dd>
            </div>
            <div>
              <dt className="font-poppins text-[10px] font-semibold uppercase tracking-[0.14em] text-[#382910]/50">
                {t("hallLabel")}
              </dt>
              <dd className="mt-1.5 font-display text-lg font-medium text-ink md:text-xl">
                {t("hallValue")}
              </dd>
            </div>
            <div>
              <dt className="font-poppins text-[10px] font-semibold uppercase tracking-[0.14em] text-[#382910]/50">
                {t("cityLabel")}
              </dt>
              <dd className="mt-1.5 font-display text-lg font-medium text-ink md:text-xl">
                {t("cityValue")}
              </dd>
            </div>
          </dl>

          <p className="mt-5 flex items-start gap-2 font-poppins text-xs leading-relaxed text-[#382910]/70 md:text-sm">
            <PinIcon className="mt-0.5 shrink-0 text-falcon-deep" />
            <span>{t("footnote")}</span>
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_24px_60px_-20px_rgba(56,41,16,0.35)]">
            <Image
              src="/testit.webp"
              alt={t("imageAlt")}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>

          <div className="absolute -bottom-4 end-4 w-[min(100%,17rem)] rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_12px_40px_-12px_rgba(56,41,16,0.25)] backdrop-blur-sm md:end-6 md:bottom-2 md:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3E5CB] text-falcon-deep">
                <PinIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-poppins text-[10px] font-semibold uppercase tracking-[0.12em] text-falcon-deep">
                  {t("cardEyebrow")}
                </p>
                <p className="mt-1 font-display text-base font-medium leading-snug text-ink">
                  {t("cardTitle")}
                </p>
                <p className="mt-0.5 font-poppins text-xs text-[#382910]/65">{t("cardHall")}</p>
              </div>
              <span className="shrink-0 rounded-lg bg-[#382910] px-2 py-1 font-poppins text-[10px] font-medium tabular-nums text-white">
                {t("cardDate")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
