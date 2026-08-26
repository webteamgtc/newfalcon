import { useTranslations } from "next-intl";
import GalleryMasonryGrid from "@/components/gallery/GalleryMasonryGrid";

export default function GalleryMomentsSection() {
  const t = useTranslations("gallery.moments");

  return (
    <section className="bg-[#F9F7F2] py-10 md:py-16">
      <div className="container">
       
        <div className="grid gap-6 md:grid-cols-12 md:items-center md:gap-12">
          <h2 className="col-span-12 font-display HeadingH2 !font-medium !text-ink md:col-span-5">
            {t("headingPlain")}{" "}
            <span className="italic text-falcon-deep">{t("headingItalic")}</span>
          </h2>
          <p className="col-span-12 Text !font-poppins !leading-snug !text-ink md:col-span-7">
            {t("subtext")}
          </p>
        </div>

        <GalleryMasonryGrid />
      </div>
    </section>
  );
}
