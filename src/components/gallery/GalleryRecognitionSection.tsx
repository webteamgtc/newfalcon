import { useTranslations } from "next-intl";

export default function GalleryRecognitionSection() {
  const t = useTranslations("gallery.recognition");
  const items = t.raw("items") as { title: string; description: string }[];

  return (
    <section className="relative overflow-hidden bg-[#fff] py-10 md:py-16">
      <div className="container relative">
        <div className="flex items-start justify-between gap-6">
          <h2 className="max-w-md font-display HeadingH1 !font-medium !text-ink">
            {t("headingPlain")}{" "}
            <span className="italic text-falcon-deep">{t("headingItalic")}</span>
          </h2>
     
        </div>

        <div className="mt-6 md:mt-10 grid grid-cols-1 border-s border-t border-[#434343]/25 sm:grid-cols-2 md:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.title}
              className="border-b border-e border-[#434343]/25 px-4 py-4 md:px-6 md:py-6"
            >
              <h3 className="font-display HeadingH4 !font-medium !text-ink">{item.title}</h3>
              <p className="mt-3 max-w-sm TextSmall !leading-relaxed !font-poppins !text-ink/70">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
