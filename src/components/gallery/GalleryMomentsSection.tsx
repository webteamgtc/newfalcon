import Image from "next/image";
import { useTranslations } from "next-intl";

const GALLERY_IMAGES = Array.from({ length: 16 }, (_, index) => ({
  id: index + 1,
  src: `/gallery/img${index + 1}.jpg`,
}));

/** Varied spans create a masonry rhythm even with square source images. */
const MASONRY_LAYOUT = [
  { cols: 1, rows: 1 },
  { cols: 1, rows: 2 },
  { cols: 1, rows: 1 },
  { cols: 2, rows: 1 },
  { cols: 1, rows: 1 },
  { cols: 1, rows: 2 },
  { cols: 1, rows: 1 },
  { cols: 1, rows: 1 },
  { cols: 2, rows: 1 },
  { cols: 1, rows: 1 },
  { cols: 1, rows: 2 },
  { cols: 1, rows: 1 },
  { cols: 1, rows: 1 },
  { cols: 2, rows: 1 },
  { cols: 1, rows: 1 },
  { cols: 1, rows: 1 },
] as const;

function getSpanClass(cols: 1 | 2, rows: 1 | 2) {
  const colClass = cols === 2 ? "col-span-2" : "col-span-1";
  const rowClass = rows === 2 ? "row-span-2" : "row-span-1";
  return `${colClass} ${rowClass}`;
}

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

        <div className="gallery-masonry mt-8 md:mt-10">
          {GALLERY_IMAGES.map((image, index) => {
            const layout = MASONRY_LAYOUT[index];
            return (
              <article
                key={image.src}
                className={`gallery-masonry-item group ${getSpanClass(layout.cols, layout.rows)}`}
              >
                <div className="relative h-full min-h-[140px] overflow-hidden rounded-2xl bg-[#E8E0D0] shadow-[0_12px_40px_-20px_rgba(56,41,16,0.45)] ring-1 ring-[#382910]/10 transition-shadow duration-300 group-hover:shadow-[0_20px_50px_-18px_rgba(56,41,16,0.55)] sm:min-h-[160px] lg:min-h-[180px]">
                  <Image
                    src={image.src}
                    alt={t("imageAlt", { number: image.id })}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1c1912]/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden
                  />
                  <span className="pointer-events-none absolute bottom-3 start-3 rounded-full bg-white/90 px-3 py-1 font-poppins text-[10px] uppercase tracking-[0.16em] text-ink/70 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                    {String(image.id).padStart(2, "0")}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
