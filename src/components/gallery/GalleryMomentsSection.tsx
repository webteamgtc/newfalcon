import { useTranslations } from "next-intl";
import Image from "next/image";

const galleryImages = [
  { src: "/images/dubai-crop.png", alt: "Celebration group" },
  { src: "/images/img-section2.webp", alt: "Stage moment" },
  { src: "/images/video-icon.png", alt: "Speaker on stage" },
  { src: "/images/home-banner.webp", alt: "Event atmosphere" },
  { src: "/images/traphy-short.webp", alt: "Trophy highlight" }
];

export default function GalleryMomentsSection() {
  const t = useTranslations("gallery.moments");

  return (
    <section className="bg-[#F9F7F2] py-10 md:py-16">
      <div className="container">
        <p className="eyebrow mb-3 text-[#382910] !capitalize">
          <span className=" font-poppins ">{t("eyebrow")}</span>
        </p>
        <div className="grid gap-6 md:grid-cols-[1fr_0.85fr] md:items-end md:gap-12">
          <h2 className="max-w-sm font-display HeadingH1 !font-medium !text-ink">
            {t("headingPlain")}{" "}
            <span className="italic text-falcon-deep">{t("headingItalic")}</span>
          </h2>
          <p className="Text !leading-snug !font-poppins !text-ink ">
            {t("subtext")}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2 md:mt-10 md:grid-cols-12 md:gap-3">
          <div className="relative col-span-2 aspect-[16/10] overflow-hidden md:col-span-7 md:row-span-2 md:aspect-auto md:min-h-[320px]">
            <Image
              src={galleryImages[1].src}
              alt={galleryImages[1].alt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </div>

          <div className="relative aspect-[4/3] overflow-hidden md:col-span-5 md:aspect-[16/6]">
            <Image
              src={galleryImages[1].src}
              alt={galleryImages[1].alt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 50vw, 40vw"
            />
          </div>

          <div className="relative aspect-[4/3] overflow-hidden md:col-span-5 md:aspect-[16/6]">
            <Image
              src={galleryImages[1].src}
              alt={galleryImages[1].alt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 50vw, 40vw"
            />
          </div>

          <div className="relative col-span-2 aspect-[16/7] overflow-hidden md:col-span-8 md:aspect-[21/5]">
            <Image
              src={galleryImages[2].src}
              alt={galleryImages[2].alt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 65vw"
            />
          </div>

          <div className="relative col-span-2 aspect-[4/3] overflow-hidden md:col-span-4 md:aspect-auto md:min-h-full">
            <Image
              src={galleryImages[1].src}
              alt={galleryImages[1].alt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 35vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
