import { useTranslations } from "next-intl";
import Image from "next/image";

export default function GalleryAmbitionSection() {
  const t = useTranslations("gallery.ambition");

  return (
    <section className="relative bg-[#F7F2E8] py-8 md:py-16">
      <div className="pointer-events-none w-2/5 right-0 top-2 h-[180px] absolute " aria-hidden>
        <Image
          src="/images/logo-yellow.svg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      <div className="container">
        <p className="eyebrow mb-4 text-[#382910] !capitalize">
          <span className=" font-poppins ">{t("eyebrow")}</span>
        </p>
        <div className="grid gap-8 md:grid-cols-2 md:items-start md:gap-16">
          <h2 className="font-display HeadingH1 !font-medium !text-ink">
            {t("headingPlain")}
            <br />
            <span className="italic text-falcon-deep">{t("headingItalic")}</span>
          </h2>
          <div className="space-y-4">
            <p className="Text !leading-snug !font-poppins !text-ink">{t("paragraph1")}</p>
            <p className="Text !leading-snug !font-poppins !text-ink">{t("paragraph2")}</p>
          </div>
        </div>

        <div className="relative mt-10 aspect-[16/6] overflow-hidden md:mt-14">
          <Image
            src="/images/gallery-section2.svg"
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        </div>
      </div>
    </section>
  );
}
