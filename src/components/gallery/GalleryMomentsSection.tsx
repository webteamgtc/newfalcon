import { useTranslations } from "next-intl";
import GalleryMasonryGrid from "@/components/gallery/GalleryMasonryGrid";

export default function GalleryMomentsSection() {
  const t = useTranslations("gallery.moments");

  return (
    <section className="bg-[#F9F7F2] py-10 md:py-16">
      <div className="container">
        <p className="eyebrow mb-3 text-[#382910] !capitalize">
          <span className="font-poppins">{t("eyebrow")}</span>
        </p>
        <div className="grid gap-6 md:grid-cols-[1fr_0.85fr] md:items-end md:gap-12">
          <h2 className="max-w-sm font-display HeadingH1 !font-medium !text-ink">
            {t("headingPlain")}{" "}
            <span className="italic text-falcon-deep">{t("headingItalic")}</span>
          </h2>
          <p className="Text !font-poppins !leading-snug !text-ink">{t("subtext")}</p>
        </div>

        <GalleryMasonryGrid />
      </div>
    </section>
  );
}
