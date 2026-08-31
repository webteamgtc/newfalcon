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
    <section className="bg-[url('/new/mobileonly.webp')] bg-cover bg-center py-10 md:hidden">
      <div className="container">
        <p className="font-poppins text-xs tracking-[0.08em] text-[#382910]/80">
          {t("eyebrow")}
        </p>

        <h2 className="mt-3 font-display text-[2rem] leading-[1.15] font-medium tracking-[-0.02em]">
          <span className="block text-ink">{t("headingLine1")}</span>
          <span className="block text-ink">{t("headingLine2")}</span>
          <span className="block italic text-falcon-deep">{t("headingLine3")}</span>
          <span className="block italic text-falcon-deep">{t("headingLine4")}</span>
        </h2>

        <p className="mt-5 font-display text-sm leading-relaxed text-[#382910]">
          {t("subtext")}
        </p>

        <div className="mt-8 flex flex-col gap-4">
          {MOBILE_INVITATION_CARDS.map((card, index) => {
            const copy = cards[index];
            if (!copy) return null;

            return (
              <article
                key={card.id}
                className="flex min-h-[148px] overflow-hidden rounded-[18px] border border-[#382910]/30"
                style={{
                  background: "linear-gradient(180deg, #FFFCF7 0%, #F5E9D6 100%)",
                }}
              >
                <div className="relative min-h-[148px] w-[46%] shrink-0">
                  <Image
                    src={card.image}
                    alt={copy.title}
                    fill
                    className="object-cover object-center"
                    sizes="46vw"
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(255,252,247,0) 45%, #FFFCF7 88%, #F5E9D6 100%)",
                    }}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-3 py-4 text-center">
                  <span className="font-display text-[1.75rem] leading-none italic text-[#C5A267]">
                    {copy.number}
                  </span>
                  <GoldDivider />
                  <CardIcon type={card.icon} />
                  <h3 className="mt-2 font-display text-sm font-medium leading-snug text-[#382910]">
                    {copy.title}
                  </h3>
                  <p className="mt-2 font-poppins text-[10px] leading-relaxed text-[#382910]/80">
                    {copy.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
