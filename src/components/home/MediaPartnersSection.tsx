import { useTranslations } from "next-intl";
import Image from "next/image";

const partnerLogos = [
  { src: "/images/one.webp", alt: "One" },
  { src: "/images/two.webp", alt: "Two" },
  { src: "/images/three.webp", alt: "Three" },
  { src: "/images/four.webp", alt: "Four" },
  { src: "/images/five.webp", alt: "Five" },
  { src: "/images/six.webp", alt: "Six" },
  { src: "/images/seven.webp", alt: "Seven" },
  { src: "/images/eight.webp", alt: "Eight" }
];

export default function MediaPartnersSection() {
  const t = useTranslations("home.media");

  return (
    <section className="bg-gradient-to-b from-[#F7F1E700] to-[#F7F1E7] py-8 md:py-16">
      <div className="container">
        <p className="eyebrow text-falcon-deep !capitalize">
          <span className="font-poppins">In partnership with</span>
        </p>
        <h2 className="mt-3 font-display HeadingH1 !font-medium !text-ink">{t("heading")}</h2>
        <p className="mt-3 max-w-2xl Text !leading-snug !font-poppins !text-ink">{t("subtext")}</p>

        <div className="relative mt-6 md:mt-8 aspect-[16/6] overflow-hidden">
          <Image
            src="/images/video-icon.png"
            alt="Media Partners"
            fill
            className="object-cover object-center"
          />
        </div>
      </div>

        <div className="mt-6 md:pt-8">
        <div className="logo-marquee" aria-label="Partner logos">
          <div className="logo-marquee__track">
            {[...partnerLogos, ...partnerLogos].map((img, i) => (
              <div key={`${img.alt}-${i}`} className="logo-marquee__item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-10 w-auto max-w-[140px] object-contain md:h-12"
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
