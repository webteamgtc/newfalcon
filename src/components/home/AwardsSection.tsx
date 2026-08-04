import { useTranslations } from "next-intl";
import Image from "next/image";
import Button from "@/components/Button";

export default function AwardsSection() {
  const t = useTranslations("home.awards");
  const awards = t.raw("list") as { index: string; title: string; country: string }[];

  return (
    <section className="bg-[#FBF4E7] relative md:py-16 py-8">
      <div className="container grid gap-12 md:grid-cols-[0.5fr_1fr] md:items-start">
        <div>
          <div className="relative h-full top-0 md:absolute md:left-0 md:top-14 bottom-14 md:h-[calc(100%-7rem)] mx-auto aspect-square w-full max-w-sm overflow-hidden">
            <Image
              src="/images/traphy-short.webp"
              alt=""
              fill
              priority
              className="h-full w-full object-cover object-center"
              sizes="100vw"
            />
          </div>
        </div>
        <div>
          <p className="eyebrow text-falcon-deep !capitalize">
            <span className="font-poppins">{t("eyebrow")}</span>
          </p>
          <h2 className="mt-3 max-w-sm font-display HeadingH1 !font-medium !text-ink">
            {t("headingPlain")}{" "}
            <span className="italic text-falcon-deep">{t("headingItalic")}</span>
          </h2>
          <p className="mt-4 Text !leading-snug max-w-xl !font-poppins !text-ink">
            {t("subtext")}
          </p>

          <div className="mt-8 grid grid-cols-2 border-s border-t border-[#434343]/30 sm:grid-cols-3">
            {awards.map((award) => (
              <article
                key={award.index}
                className="relative flex flex-col items-center border-b border-e border-[#434343]/30 px-3 pb-5 pt-7 sm:px-4 sm:pb-6 sm:pt-8"
              >
                <span className="absolute start-2.5 top-2 font-display text-[11px] italic leading-none text-[#434343] sm:start-3 sm:top-2.5 sm:text-sm">
                  {award.index}
                </span>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/award.svg"
                  alt={award.title}
                  className="h-auto w-full max-w-[130px] object-contain sm:max-w-[150px]"
                  loading="lazy"
                  decoding="async"
                />

                <p className="mt-3 font-poppins text-xs font-medium leading-none text-[#434343] sm:mt-4 sm:text-sm">
                  {award.country}
                </p>
              </article>
            ))}
          </div>

          <Button href="/agenda" className="mt-8">
            {t("cta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
