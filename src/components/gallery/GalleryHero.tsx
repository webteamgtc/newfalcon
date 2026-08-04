import { useTranslations } from "next-intl";
import Image from "next/image";

export default function GalleryHero() {
  const t = useTranslations("gallery.hero");

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden pb-16 pt-16 md:min-h-[85vh] md:pb-24 md:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <Image
          src="/images/img-section2.webp"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/75 via-[#000000]/45 to-[#000000]/20" />
      </div>

      <div className="container">
        <div className="max-w-2xl">
          <h1 className="font-display text-[3.2rem] leading-[1.05] max-w-sm text-white md:text-[3rem]">
            {t("headingPlain")}
            <br />
            <span className="italic text-falcon-light">{t("headingItalic")}</span>
          </h1>
          <p className="mt-5 max-w-lg Text !leading-snug !font-poppins !text-white">
            {t("subtext")}
          </p>
        </div>
      </div>
    </section>
  );
}
