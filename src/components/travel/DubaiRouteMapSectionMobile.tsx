"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import DubaiRouteMapCard from "@/components/travel/DubaiRouteMapCard";
import { DUBAI_ROUTE_MAP_ASSETS } from "@/data/dubaiRouteMap";

export default function DubaiRouteMapSectionMobile() {
  const t = useTranslations("dubaiRouteMap");

  return (
    <section className="md:hidden">
      <div className="bg-[#FBF4E7]">
        <div className="container py-8 pb-6">
          <div className="max-w-md">
            <h2 className="font-display text-[2rem] leading-[1.15] font-medium">
              <span className="block text-ink">{t("headingLine1")}</span>
              <span className="block italic text-falcon-deep">{t("headingLine2")}</span>
            </h2>

            <p className="mt-4 font-display text-base font-medium text-[#382910]">
              {t("duration")}
            </p>

            <p className="mt-3 max-w-[280px] font-display text-sm leading-relaxed text-[#382910]/85">
              {t("subtext")}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full bg-[#FBF4E7]">
        <Image
          src={DUBAI_ROUTE_MAP_ASSETS.mapMobile}
          alt={t("mapAlt")}
          width={390}
          height={401}
          className="h-auto w-full"
          sizes="100vw"
          priority={false}
        />
      </div>

      <div className="bg-[#FBF4E7]">
        <div className="container pb-8 pt-4">
          <DubaiRouteMapCard className="w-full" />
        </div>
      </div>
    </section>
  );
}
