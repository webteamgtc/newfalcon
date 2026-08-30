"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { DUBAI_ATTRACTIONS, DUBAI_TOURISM_URL } from "@/data/dubaiAttractions";

type AttractionCopy = {
  number: string;
  nameZh: string;
  nameEn: string;
  points: string[];
};

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="rtl:-scale-x-100"
    >
      <path
        d="M3.5 10.5 10.5 3.5M10.5 3.5H5.25M10.5 3.5V8.75"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="10"
      height="16"
      viewBox="0 0 10 16"
      fill="none"
      aria-hidden="true"
      className="text-[#382910]/35"
    >
      <path
        d="M2 2 8 8 2 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M3.5 8.5 8.5 3.5M8.5 3.5H4.75M8.5 3.5V7.25"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DubaiAttractionsSection() {
  const t = useTranslations("attractions");
  const locale = useLocale();
  const items = t.raw("items") as AttractionCopy[];

  return (
    <section id="dubai-attractions" className="relative isolate overflow-hidden bg-[#FBF4E7] py-10 md:py-16">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start md:gap-10">
          <div className="max-w-2xl">
            <p className="eyebrow text-falcon-deep !capitalize">
              <span className="font-poppins">{t("eyebrow")}</span>
            </p>
            <h2 className="mt-3 font-display HeadingH1 !font-medium !text-ink">
              {t("heading")}
            </h2>
            <p className="mt-4 Text !leading-snug !font-poppins !text-ink">
              {t("subtext")}
            </p>
          </div>

          <div className="md:pt-2">
            <a
              href={DUBAI_TOURISM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 rounded-full bg-[#382910] py-1.5 ps-6 pe-3 font-poppins text-xs uppercase tracking-[0.14em] text-white transition-colors hover:bg-falcon-deep md:text-sm"
            >
              <span>{t("cta")}</span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-falcon-deep md:h-9 md:w-9">
                <ArrowIcon />
              </span>
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 md:mt-12 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible xl:grid-cols-5">
          {DUBAI_ATTRACTIONS.map((attraction, index) => {
            const copy = items[index];
            if (!copy) return null;

            const primaryName = locale === "zh" ? copy.nameZh : copy.nameEn;
            const secondaryName = locale === "zh" ? copy.nameEn : null;

            return (
              <a
                key={attraction.id}
                href={attraction.reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full flex-row overflow-hidden rounded-[20px] border border-[#382910]/15 bg-[#F9F3E9] transition-transform duration-300 hover:-translate-y-1 md:flex-col md:w-auto md:rounded-[24px]"
              >
                <div className="relative w-[38%] min-h-[168px] shrink-0 overflow-hidden md:aspect-[5/6] md:min-h-0 md:w-full">
                  <Image
                    src={attraction.image}
                    alt={primaryName}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 38vw, (max-width: 1280px) 45vw, 20vw"
                  />
                </div>

                <div className="relative flex min-w-0 flex-1 flex-col px-4 py-4 text-start md:px-5 md:pb-5 md:pt-9">
                  <div className="flex items-start gap-3 md:block">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C5A267] font-display text-sm italic leading-none text-white md:absolute md:-top-6 md:left-5 md:h-11 md:w-11 md:text-base">
                      {copy.number}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base !font-medium !leading-snug !text-ink md:HeadingH5">
                        {primaryName}
                      </h3>
                      {secondaryName ? (
                        <p className="mt-0.5 font-poppins text-[11px] text-[#382910]/80 md:mt-1 md:text-xs">
                          {secondaryName}
                        </p>
                      ) : null}
                    </div>

                    <span className="mt-1 shrink-0 md:hidden">
                      <ChevronRightIcon />
                    </span>
                  </div>

                  <ul className="mt-3 space-y-2 md:mt-4 md:space-y-3">
                    {copy.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-2 font-display text-[11px] leading-relaxed text-[#382910] md:gap-2.5 md:text-xs md:text-sm"
                      >
                        <span
                          aria-hidden
                          className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-[#382910] md:mt-[0.55rem]"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-auto hidden items-center justify-end gap-1.5 font-poppins text-xs text-[#382910] md:flex">
                    <span>{t("learnMore")}</span>
                    <ExternalLinkIcon />
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
