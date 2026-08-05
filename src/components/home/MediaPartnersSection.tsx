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

function PartnerLogoMarquee() {
  const loopLogos = [...partnerLogos, ...partnerLogos];

  return (
    <div className="logo-marquee" aria-label="Partner logos">
      <div className="logo-marquee__track">
        {[...loopLogos, ...loopLogos].map((img, i) => (
          <div key={`${img.src}-${i}`} className="logo-marquee__item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              className="h-10 w-auto max-w-[140px] object-contain opacity-80 transition-opacity hover:opacity-100 md:h-12 lg:h-14"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MediaPartnersSection() {
  const t = useTranslations("home.media");

  return (
    <section
      className="overflow-hidden py-8 md:py-16"
      style={{
        background: "linear-gradient(180deg, rgb(255 255 255) 0%, #F7F1E7 100%)"
      }}
    >
      <div className="container">
        <p className="eyebrow text-falcon-deep !capitalize">
          <span className="font-poppins">In partnership with</span>
        </p>
        <h2 className="mt-3 font-display HeadingH1 !font-medium !text-ink">{t("heading")}</h2>
        <p className="mt-3 max-w-2xl Text !leading-snug !font-poppins !text-ink">{t("subtext")}</p>

        <div className="relative mt-6 aspect-[16/6] overflow-hidden md:mt-8">
          <Image
            src="/images/video-icon.png"
            alt="Media Partners"
            fill
            className="object-cover object-center"
          />
        </div>
      </div>

      <div className="mt-8 md:mt-10">
        <PartnerLogoMarquee />
      </div>
    </section>
  );
}
