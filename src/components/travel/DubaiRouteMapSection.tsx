"use client";

import { useTranslations } from "next-intl";
import DubaiRouteMapCard from "@/components/travel/DubaiRouteMapCard";
import DubaiRouteMapSectionMobile from "@/components/travel/DubaiRouteMapSectionMobile";
import SectionBackgroundImage from "@/components/ui/SectionBackgroundImage";
import {
  SCREEN_SECTION_HEIGHT,
  SCREEN_SECTION_INNER,
  SECTION_BG_IMAGE_POSITION,
} from "@/lib/sectionLayout";

export default function DubaiRouteMapSection() {
  const t = useTranslations("dubaiRouteMap");

  return (
    <>
      <DubaiRouteMapSectionMobile />

      <section className={`relative hidden overflow-hidden md:block ${SCREEN_SECTION_HEIGHT}`}>
        <SectionBackgroundImage src="/new/newmap.webp" className={SECTION_BG_IMAGE_POSITION} />
        <div
          className={`container relative z-10 flex items-center py-10 lg:py-12 ${SCREEN_SECTION_INNER}`}
        >
          <div className="flex w-full max-w-[42%] flex-col justify-between gap-10">
            <div className="max-w-md">
              <p className="font-poppins text-[11px] tracking-[0.08em] text-falcon-deep md:text-xs">
                {t("eyebrow")}
              </p>

              <h2 className="mt-3 font-display text-[2.25rem] font-medium leading-[1.2] text-ink lg:text-[2.5rem]">
                {t("heading")}
              </h2>

              <p className="mt-4 font-display text-base font-medium text-[#382910] md:text-lg">
                {t("duration")}
              </p>

              <p className="mt-3 font-display text-sm leading-relaxed text-[#382910]/85 md:text-base">
                {t("subtext")}
              </p>
            </div>

            <div className="mt-0">
              <DubaiRouteMapCard />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
