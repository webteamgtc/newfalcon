import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { SeatCategory, SeatCategorySlug } from "@/lib/seatBooking/categories";
import SeatBookingForm from "./SeatBookingForm";

export const CATEGORY_IMAGES: Record<SeatCategorySlug, string> = {
  "international-employee": "/images/vip-bg-dubai.webp",
  "uae-employee": "/images/home-banner.webp",
  vip: "/images/traphy-short.webp",
  partner: "/images/traphy-short.webp",
  "media-partners": "/images/Ticket/banner.webp",
};

export function GoldRule({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`flex items-center gap-2 ${className}`}>
      <span className="h-px w-10 bg-falcon-gold" />
      <span className="h-1.5 w-1.5 rotate-45 bg-falcon-gold" />
    </span>
  );
}

export function EventFacts({
  t,
  variant = "light",
}: {
  t: Awaited<ReturnType<typeof getTranslations>>;
  variant?: "light" | "dark";
}) {
  const facts = [
    { label: t("event.dateLabel"), value: t("event.date"), icon: "M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" },
    { label: t("event.venueLabel"), value: t("event.venue"), icon: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" },
    { label: t("event.dressLabel"), value: t("event.dress"), icon: "m12 7 3-3 5 3-2 4-2-1v10H8V10l-2 1-2-4 5-3 3 3Z" },
  ];
  const dark = variant === "dark";
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {facts.map((f) => (
        <div
          key={f.label}
          className={`flex items-center gap-3 rounded-2xl border backdrop-blur ${dark ? "px-3 py-2.5" : "px-4 py-3"} ${
            dark ? "border-white/15 bg-white/5" : "border-falcon-gold/25 bg-white/60"
          }`}
        >
          <span className={`h-9 w-9 shrink-0 items-center justify-center rounded-full ${dark ? "hidden" : "flex bg-ink text-falcon-light"}`}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d={f.icon} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="min-w-0">
            <dt className={`font-poppins text-[11px] uppercase tracking-[0.14em] ${dark ? "text-white/55" : "text-ink/50"}`}>
              {f.label}
            </dt>
            <dd className={`font-poppins font-medium ${dark ? "text-[13px] leading-snug text-white" : "truncate text-sm text-ink"}`}>{f.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

export default async function SeatBookingShell({
  category,
  locale,
}: {
  category: SeatCategory;
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "seatBooking" });
  const c = `categories.${category.i18nKey}` as const;
  const highlights = t.raw(`${c}.highlights`) as string[];
  const steps = t.raw("steps.items") as { title: string; body: string }[];

  return (
    <section className="relative isolate overflow-hidden bg-parchment">
      {/* Backdrop */}
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[520px] md:h-[620px]">
        <Image
          src="/images/vip-bg-dubai.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-parchment/40 via-parchment/70 to-parchment" />
      </div>
      <div
        aria-hidden
        className="absolute -right-40 top-[480px] -z-10 h-[520px] w-[520px] rounded-full bg-falcon-gold/10 blur-3xl"
      />

      <div className="container pb-20 pt-28 md:pb-28 md:pt-36">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Story column */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow flex items-center gap-3 text-falcon-bronze">
                <GoldRule />
                {t("event.name")}
              </p>
              <span className="mt-6 inline-flex items-center rounded-full border border-ink/15 bg-white/70 px-4 py-1.5 font-poppins text-xs font-semibold uppercase tracking-[0.14em] text-ink backdrop-blur">
                {t(`${c}.label`)}
              </span>
              <h1 className="mt-5 font-display text-4xl leading-[1.08] text-ink md:text-5xl xl:text-[56px]">
                {t(`${c}.title`)}
              </h1>
              <p className="mt-5 max-w-xl font-poppins text-[15px] leading-relaxed text-ink/70">
                {t(`${c}.intro`)}
              </p>

              <ul className="mt-7 flex flex-wrap gap-2">
                {highlights.map((h) => (
                  <li
                    key={h}
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-poppins text-xs font-medium text-falcon-light"
                  >
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-falcon-gold" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>

              <div className="relative mt-8 hidden aspect-[16/10] overflow-hidden rounded-3xl shadow-[0_30px_60px_-30px_rgba(28,25,18,0.55)] lg:block">
                <Image
                  src={CATEGORY_IMAGES[category.slug]}
                  alt=""
                  fill
                  sizes="(min-width:1024px) 40vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <div className="absolute inset-x-5 bottom-5">
                  <EventFacts t={t} variant="dark" />
                </div>
              </div>
              <div className="mt-8 lg:hidden">
                <EventFacts t={t} />
              </div>

              <div className="mt-10 hidden lg:block">
                <h2 className="font-display text-2xl text-ink">{t("steps.title")}</h2>
                <ol className="mt-5 space-y-5 border-s border-falcon-gold/40 ps-6">
                  {steps.map((s, i) => (
                    <li key={s.title} className="relative">
                      <span className="absolute -start-[33px] top-0 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-falcon-gold bg-parchment font-poppins text-[9px] font-semibold text-falcon-bronze">
                        {i + 1}
                      </span>
                      <p className="font-poppins text-sm font-semibold text-ink">{s.title}</p>
                      <p className="mt-1 font-poppins text-sm text-ink/60">{s.body}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Form column */}
          <div className="lg:col-span-7">
            <div className="relative rounded-[28px] bg-gradient-to-b from-falcon-light/70 via-falcon-gold/30 to-transparent p-px shadow-[0_40px_80px_-40px_rgba(28,25,18,0.45)]">
              <div className="rounded-[27px] bg-white/95 p-5 backdrop-blur sm:p-8 md:p-10">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-ink/10 pb-6">
                  <div>
                    <h2 className="font-display text-3xl text-ink md:text-[34px]">{t("form.title")}</h2>
                    <p className="mt-1 font-poppins text-sm text-ink/50">{t("form.subtitle")}</p>
                  </div>
                  <Image src="/images/award.svg" alt="" width={44} height={44} className="h-11 w-11 opacity-90" />
                </div>
                <SeatBookingForm category={category} />
              </div>
            </div>

            <div className="mt-10 lg:hidden">
              <h2 className="font-display text-2xl text-ink">{t("steps.title")}</h2>
              <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                {steps.map((s, i) => (
                  <li key={s.title} className="rounded-2xl border border-falcon-gold/25 bg-white/60 p-4">
                    <span className="font-display text-2xl text-falcon-gold">0{i + 1}</span>
                    <p className="mt-1 font-poppins text-sm font-semibold text-ink">{s.title}</p>
                    <p className="mt-1 font-poppins text-xs text-ink/60">{s.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
