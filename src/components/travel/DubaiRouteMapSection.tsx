"use client";

import { useTranslations } from "next-intl";
import DubaiRouteMapCard from "@/components/travel/DubaiRouteMapCard";
import DubaiRouteMapSectionMobile from "@/components/travel/DubaiRouteMapSectionMobile";

export default function DubaiRouteMapSection() {
  const t = useTranslations("dubaiRouteMap");

  return (
    <>
      <DubaiRouteMapSectionMobile />

      <section className="relative hidden overflow-hidden bg-[url('/new/newmap.webp')] bg-cover bg-left-top md:block">
        <div className="container py-14 lg:py-24">
          <div className="flex min-h-[480px] max-w-[42%] flex-col justify-between">
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

            <div className="mt-10">
              <DubaiRouteMapCard />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
