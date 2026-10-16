import Image from "next/image";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { SEAT_CATEGORIES, SEAT_CATEGORY_SLUGS } from "@/lib/seatBooking/categories";
import { CATEGORY_IMAGES, EventFacts, GoldRule } from "@/components/seat-booking/SeatBookingShell";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "seatBooking" });
  return { title: t("meta.title"), description: t("hub.subtitle") };
}

export default async function BookYourSeatHub({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: "seatBooking" });

  return (
    <section className="relative isolate overflow-hidden bg-parchment">
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[560px]">
        <Image src="/images/vip-bg-dubai.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-parchment/30 via-parchment/70 to-parchment" />
      </div>

      <div className="container pb-24 pt-32 md:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow flex items-center justify-center gap-3 text-falcon-bronze">
            <GoldRule className="rtl:-scale-x-100" />
            {t("hub.eyebrow")}
            <GoldRule className="-scale-x-100 rtl:scale-x-100" />
          </p>
          <h1 className="mt-5 font-display text-5xl leading-tight text-ink md:text-7xl">{t("hub.title")}</h1>
          <p className="mx-auto mt-5 max-w-2xl font-poppins text-[15px] leading-relaxed text-ink/70">
            {t("hub.subtitle")}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <EventFacts t={t} />
        </div>

        <p className="mt-14 text-center font-poppins text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
          {t("hub.choose")}
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {SEAT_CATEGORY_SLUGS.map((slug) => {
            const c = SEAT_CATEGORIES[slug];
            return (
              <Link
                key={slug}
                href={`/book-your-seat/${slug}`}
                className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-3xl bg-ink p-6 shadow-[0_30px_60px_-30px_rgba(28,25,18,0.6)] transition duration-500 hover:-translate-y-1"
              >
                <Image
                  src={CATEGORY_IMAGES[slug]}
                  alt=""
                  fill
                  sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/0" />
                <div className="relative">
                  <h2 className="font-display text-2xl leading-tight text-white">
                    {t(`categories.${c.i18nKey}.label`)}
                  </h2>
                  <p className="mt-2 font-poppins text-sm leading-relaxed text-white/70">
                    {t(`categories.${c.i18nKey}.card`)}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-falcon-gold px-4 py-2 font-poppins text-xs font-semibold text-ink transition group-hover:bg-falcon-light">
                    {t("hub.cta")}
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path d="M3 8h10m0 0L9 4m4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
