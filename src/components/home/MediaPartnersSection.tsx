import { useTranslations } from "next-intl";

const YOUTUBE_EMBED_URL =
  "https://www.youtube.com/embed/kGvHQmUq5vI?list=PLBcUUM130URxCFx0-scx5vhwEgx40Pxmg";

const partnerLogoFiles = [
  "/images/one.webp",
  "/images/two.webp",
  "/images/three.webp",
  "/images/four.webp",
  "/images/five.webp",
  "/images/six.webp",
  "/images/seven.webp",
  "/images/eight.webp"
];

export default function MediaPartnersSection() {
  const t = useTranslations("home.media");

  const partnerNames = t.raw("partners") as string[];
  const partnerLogos = partnerLogoFiles.map((src, i) => ({
    src,
    alt: partnerNames[i] ?? "Media partner logo"
  }));

  return (
    <section
      className="overflow-hidden py-8 md:py-16"
      style={{
        background: "linear-gradient(180deg, rgb(255 255 255) 0%, #F7F1E7 100%)"
      }}
    >
      <div className="container">
        <p className="eyebrow text-falcon-deep !capitalize">
          <span className="font-poppins">{t("eyebrow")}</span>
        </p>
        <h2 className="mt-3 font-display HeadingH1 !font-medium !text-ink">{t("heading")}</h2>
        <p className="mt-3 max-w-2xl Text !leading-snug !font-poppins !text-ink">{t("subtext")}</p>

        <div className="relative mt-6 aspect-video overflow-hidden rounded-lg md:mt-8">
          <iframe
            src={YOUTUBE_EMBED_URL}
            title={t("heading")}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </div>
   
    </section>
  );
}
