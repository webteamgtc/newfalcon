"use client";

import { useLocale, useTranslations } from "next-intl";

const YOUTUBE_EMBED_URL =
  "https://www.youtube.com/embed/kGvHQmUq5vI?list=PLBcUUM130URxCFx0-scx5vhwEgx40Pxmg";

const BILIBILI_EMBED_URL =
  "https://player.bilibili.com/player.html?bvid=BV1Ng4D6XEvN&autoplay=0";

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
  const locale = useLocale();
  const videoEmbedUrl = locale === "zh" ? BILIBILI_EMBED_URL : YOUTUBE_EMBED_URL;

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
      
        <h2 className="mt-3 font-display HeadingH1 !font-medium !text-ink">{t("heading")}</h2>
       

        <div className="relative mt-6 aspect-video overflow-hidden rounded-lg md:mt-8">
          <iframe
            src={videoEmbedUrl}
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
