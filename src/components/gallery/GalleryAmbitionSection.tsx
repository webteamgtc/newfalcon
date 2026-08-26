import { useTranslations } from "next-intl";
import Image from "next/image";

export default function GalleryAmbitionSection() {
  const t = useTranslations("gallery.ambition");

  return (
    <section className="relative bg-[#F7F2E8] py-8 md:py-16">
 

      <div className="container">
      
        <div className="grid gap-8 md:grid-cols-12 md:items-center md:gap-16">
          <h2 className="col-span-12 font-display HeadingH2 !font-medium !text-ink md:col-span-3">
            {t("headingPlain")}
            <br />
            <span className="italic text-falcon-deep">{t("headingItalic")}</span>
          </h2>
          <div className="col-span-12 space-y-4 md:col-span-9">
            <p className="Text !leading-snug !font-poppins !text-ink">{t("paragraph1")}</p>
            <p className="Text !leading-snug !font-poppins !text-ink">{t("paragraph2")}</p>
          </div>
        </div>

        <div className="mt-10 md:mt-14">
          <div className="relative w-full h-[400px] md:h-[700px] overflow-hidden">
            <Image
              src="/gallery/banner-new.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
