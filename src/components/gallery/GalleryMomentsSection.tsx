import { useTranslations } from "next-intl";

const leftImages = [
  { src: "/gallery/3.webp", alt: "Celebration group" },
  { src: "/gallery/4.webp", alt: "Event atmosphere" },
];

const rightImages = [
  { src: "/gallery/1.webp", alt: "Stage moment" },
  { src: "/gallery/2.webp", alt: "Speaker on stage" },
  { src: "/gallery/5.webp", alt: "Trophy highlight" },
];

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

        <div className="mt-8 grid grid-cols-1 gap-2 md:mt-10 md:grid-cols-[7fr_5fr] md:items-stretch md:gap-3">
          <div className="flex flex-col gap-2 md:gap-3">
            {leftImages.map((image) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={image.src}
                src={image.src}
                alt={image.alt}
                className="block h-auto w-full"
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>

          <div className="flex flex-col gap-2 md:h-full md:min-h-0 md:gap-3">
            {rightImages.map((image) => (
              <div key={image.src} className="overflow-hidden max-md:flex-none md:min-h-0 md:flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.alt}
                  className="block h-auto w-full md:h-full md:object-cover md:object-center"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
