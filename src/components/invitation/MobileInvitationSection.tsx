"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { MOBILE_INVITATION_CARDS } from "@/data/mobileInvitation";

type CardCopy = {
  number: string;
  title: string;
  description: string;
};

function GoldDivider() {
  return (
    <div className="my-2 flex w-14 items-center gap-1.5" aria-hidden="true">
      <span className="h-px flex-1 bg-[#C5A267]/55" />
      <span className="h-1.5 w-1.5 rotate-45 border border-[#C5A267]/80" />
      <span className="h-px flex-1 bg-[#C5A267]/55" />
    </div>
  );
}

function CardIcon({ type }: { type: (typeof MOBILE_INVITATION_CARDS)[number]["icon"] }) {
  return (
    <span className="text-[#C5A267]" aria-hidden="true">
      {type === "ferris" ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M12 4.5V7M12 17v2.5M4.5 12H7M17 12h2.5" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      ) : null}
      {type === "hotel" ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 19V8.5l6-3 6 3V19M6 19h12M9 19v-4h6v4M9 11h1.5M13.5 11H15"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 4.5 10 3.5l1.5 1M12 3.5l1.5 1M15.5 4.5 14 3.5"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      ) : null}
      {type === "cloche" ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 11c0-3.5 3.1-6 7-6s7 2.5 7 6M5 11h14M7.5 11v6.5h9V11"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 5V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ) : null}
      {type === "car" ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 11h14l-1.2-3.6a2 2 0 0 0-1.9-1.4H8.1a2 2 0 0 0-1.9 1.4L5 11Zm0 0v5h1.5M19 11v5h-1.5M7.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

export default function MobileInvitationSection() {
  const t = useTranslations("mobileInvitation");
  const cards = t.raw("cards") as CardCopy[];

  return (
    <section className="bg-[url('/new/mobileonly.webp')] bg-cover bg-[87%_50%] bg-no-repeat py-10 md:bg-[url('/new/desktop.webp')] md:bg-center md:py-16">
      <div className="container">
        <p className="font-poppins text-xs tracking-[0.08em] text-[#382910]/80">
          {t("eyebrow")}
        </p>

        <h2 className="mt-3 max-w-3xl font-display text-[2rem] leading-[1.15] font-medium tracking-[-0.02em] md:text-4xl lg:text-5xl">
          <span className="block text-ink">{t("headingLine1")}</span>
          <span className="block text-ink">{t("headingLine2")}</span>
          <span className="block italic text-falcon-deep">{t("headingLine3")}</span>
          <span className="block italic text-falcon-deep">{t("headingLine4")}</span>
        </h2>

        <p className="mt-5 max-w-2xl font-display text-sm leading-relaxed text-[#382910] md:text-base">
          {t("subtext")}
        </p>

        <div className="mt-8 flex flex-col gap-4 md:mt-12 md:grid md:grid-cols-4 md:gap-4 lg:gap-5">
          {MOBILE_INVITATION_CARDS.map((card, index) => {
            const copy = cards[index];
            if (!copy) return null;

            return (
              <article
                key={card.id}
                className="flex min-h-[148px] overflow-hidden rounded-[18px] border border-[#382910]/30 md:min-h-[520px] md:flex-col md:border-b-0"
                style={{
                  background: "linear-gradient(180deg, #FFFCF7 0%, #F5E9D6 100%)",
                }}
              >
                <div className="order-2 flex min-w-0 flex-1 flex-col items-center justify-center px-3 py-4 text-center md:order-1 md:flex-none md:px-5 md:pb-5 md:pt-7">
                  <span className="font-display text-[1.75rem] leading-none italic text-[#C5A267] md:text-[2rem]">
                    {copy.number}
                  </span>
                  <GoldDivider />
                  <CardIcon type={card.icon} />
                  <h3 className="mt-2 font-display text-sm font-medium leading-snug text-[#382910] md:mt-3 md:text-base">
                    {copy.title}
                  </h3>
                  <p className="mt-2 font-poppins text-[10px] leading-relaxed text-[#382910]/80 md:mt-3 md:text-[11px]">
                    {copy.description}
                  </p>
                </div>

                <div className="relative order-1 min-h-[148px] w-[46%] shrink-0 md:order-2 md:mt-auto md:min-h-[240px] md:w-full md:flex-1">
                  <Image
                    src={card.image}
                    alt={copy.title}
                    fill
                    className="object-cover object-center"
                    sizes="(min-width: 768px) 25vw, 46vw"
                  />
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 hidden h-20 bg-gradient-to-b from-[#FFFCF7] via-[#FFFCF7]/70 to-transparent md:block"
                    aria-hidden
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
