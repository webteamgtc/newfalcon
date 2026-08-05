"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

export default function TicketContactSection() {
  const t = useTranslations("ticketPage.contact");

  return (
    <section className="bg-[#fff] py-6 md:py-12">
      <div className="container grid gap-10 md:grid-cols-2 md:items-center md:gap-14">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#382910]">
          <Image
            src="/images/img-section2.webp"
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div>
          <p className="eyebrow !capitalize text-[#382910]">
            <span className="font-poppins">{t("eyebrow")}</span>
          </p>
          <h2 className="mt-3 max-w-md font-display HeadingH1 !font-medium !text-ink">
            {t("headingPlain")}{" "}
            <span className="italic text-falcon-deep">{t("headingItalic")}</span>
          </h2>
          <p className="mt-4 max-w-xl Text !leading-snug !font-poppins !text-ink">
            {t("subtext")}
          </p>

          <form className="mt-6 md:mt-10 space-y-8" onSubmit={(e) => e.preventDefault()}>
            <label className="block">
              <span className="font-poppins text-[11px] uppercase tracking-[0.16em] text-ink/55">
                {t("nameLabel")}
              </span>
              <input
                type="text"
                placeholder={t("namePlaceholder")}
                className="mt-2 w-full border-0 border-b border-ink/25 bg-transparent pb-2 font-poppins text-sm text-ink outline-none placeholder:text-ink/35 focus:border-falcon-deep"
              />
            </label>
            <label className="block">
              <span className="font-poppins text-[11px] uppercase tracking-[0.16em] text-ink/55">
                {t("emailLabel")}
              </span>
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                className="mt-2 w-full border-0 border-b border-ink/25 bg-transparent pb-2 font-poppins text-sm text-ink outline-none placeholder:text-ink/35 focus:border-falcon-deep"
              />
            </label>
          </form>
        </div>
      </div>
    </section>
  );
}
