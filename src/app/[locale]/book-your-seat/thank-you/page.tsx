import Image from "next/image";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getSeatCategory } from "@/lib/seatBooking/categories";
import { GoldRule } from "@/components/seat-booking/SeatBookingShell";

type Props = {
  params: { locale: string };
  searchParams: { ref?: string; type?: string };
};

export async function generateMetadata({ params }: Props) {
  const t = await getTranslations({ locale: params.locale, namespace: "seatBooking" });
  return { title: `${t("thankYou.title")} · ${t("event.name")}`, robots: { index: false } };
}

export default async function SeatThankYouPage({ params, searchParams }: Props) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: "seatBooking" });
  const reference = /^GFA-[A-Z0-9]{6}$/.test(searchParams.ref ?? "") ? searchParams.ref : null;
  const category = getSeatCategory(searchParams.type ?? "");
  const next = t.raw("thankYou.next") as string[];

  return (
    <section className="relative isolate flex min-h-screen items-center overflow-hidden bg-parchment">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image src="/images/vip-bg-dubai.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-parchment/60 via-parchment/85 to-parchment" />
        <div className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-falcon-gold/20 blur-3xl" />
      </div>

      <div className="container pb-20 pt-32">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[28px] bg-gradient-to-b from-falcon-light via-falcon-gold/40 to-transparent p-px shadow-[0_40px_80px_-40px_rgba(28,25,18,0.5)]">
            <div className="rounded-[27px] bg-white/95 px-6 py-12 text-center backdrop-blur sm:px-12 sm:py-14">
              <div className="relative mx-auto h-24 w-24">
                <span className="absolute inset-0 animate-ping rounded-full bg-falcon-gold/25 [animation-duration:2.4s]" />
                <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-ink shadow-xl ring-8 ring-falcon-gold/15">
                  <svg viewBox="0 0 24 24" className="h-10 w-10 text-falcon-light" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>

              <p className="eyebrow mt-8 flex items-center justify-center gap-3 text-falcon-bronze">
                <GoldRule className="rtl:-scale-x-100" />
                {t("thankYou.eyebrow")}
                <GoldRule className="-scale-x-100 rtl:scale-x-100" />
              </p>
              <h1 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
                {t("thankYou.title")}
              </h1>
              <p className="mx-auto mt-5 max-w-lg font-poppins text-[15px] leading-relaxed text-ink/70">
                {t("thankYou.body")}
              </p>

              {(reference || category) && (
                <div className="mx-auto mt-8 inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl border border-dashed border-falcon-gold/60 bg-parchment-light px-6 py-4">
                  {reference && (
                    <div>
                      <p className="font-poppins text-[11px] uppercase tracking-[0.16em] text-ink/50">
                        {t("thankYou.reference")}
                      </p>
                      <p className="mt-1 font-poppins text-xl font-semibold tracking-[0.12em] text-ink">{reference}</p>
                    </div>
                  )}
                  {category && (
                    <span className="rounded-full bg-ink px-3 py-1 font-poppins text-xs font-medium text-falcon-light">
                      {t(`categories.${category.i18nKey}.label`)}
                    </span>
                  )}
                </div>
              )}
              {reference && (
                <p className="mx-auto mt-3 max-w-md font-poppins text-xs text-ink/50">{t("thankYou.emailNote")}</p>
              )}

              <div className="mx-auto mt-10 max-w-md text-start">
                <h2 className="font-display text-xl text-ink">{t("thankYou.nextTitle")}</h2>
                <ol className="mt-4 space-y-3">
                  {next.map((item, i) => (
                    <li key={item} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-falcon-gold font-poppins text-[11px] font-semibold text-falcon-bronze">
                        {i + 1}
                      </span>
                      <span className="font-poppins text-sm text-ink/70">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <p className="mt-10 font-display text-lg italic text-falcon-bronze">{t("thankYou.seeYou")}</p>

              <Link
                href="/"
                className="mt-8 inline-flex h-12 items-center gap-3 rounded-full bg-ink px-7 font-poppins text-sm font-semibold text-falcon-light transition hover:bg-ink-soft"
              >
                {t("thankYou.home")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
