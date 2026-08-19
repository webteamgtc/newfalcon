import { useTranslations } from "next-intl";

export default function GalleryHero() {
  const t = useTranslations("gallery.hero");

  return (
    <section className="relative flex min-h-[50vh] items-end overflow-hidden bg-[url('/gallery.jpg')] bg-cover bg-center pb-16 pt-16 md:min-h-[80vh] md:pb-36 md:pt-24">
      <div className="container">
        <div className="max-w-2xl">
          <h1 className="max-w-sm font-display text-[3.2rem] uppercase leading-[1.05] text-white md:text-[3rem]">
            {t("headingPlain")}
          
            <span className="italic text-falcon-light"> {t("headingItalic")}</span>
          </h1>
          <p className="mt-5 max-w-lg Text !font-poppins !leading-snug !text-white">
            {t("subtext")}
          </p>
        </div>
      </div>
    </section>
  );
}
