"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const GALLERY_IMAGES = Array.from({ length: 16 }, (_, index) => ({
  id: index + 1,
  src: `/gallery/img${index + 1}.jpg`,
}));

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

function NavArrow({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={direction === "prev" ? "rtl:-scale-x-100" : "rtl:-scale-x-100"}
    >
      {direction === "prev" ? (
        <path
          d="M12.5 4.5 7 10l5.5 5.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M7.5 4.5 13 10l-5.5 5.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export default function GalleryMasonryGrid() {
  const t = useTranslations("gallery.moments");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isOpen = activeIndex !== null;
  const activeImage = activeIndex !== null ? GALLERY_IMAGES[activeIndex] : null;

  const closeLightbox = useCallback(() => setActiveIndex(null), []);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
    );
  }, []);

  const showNext = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % GALLERY_IMAGES.length
    );
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeLightbox, showPrevious, showNext]);

  return (
    <>
      <div className="gallery-masonry mt-8 md:mt-10">
        {GALLERY_IMAGES.map((image, index) => {
          const layout = MASONRY_LAYOUT[index];
          return (
            <article
              key={image.src}
              className={`gallery-masonry-item ${getSpanClass(layout.cols, layout.rows)}`}
            >
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className="group relative block h-full min-h-[140px] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-[#E8E0D0] text-left shadow-[0_12px_40px_-20px_rgba(56,41,16,0.45)] ring-1 ring-[#382910]/10 transition-shadow hover:shadow-[0_20px_50px_-18px_rgba(56,41,16,0.55)] sm:min-h-[160px] lg:min-h-[180px]"
                aria-label={t("openImage", { number: image.id })}
              >
                <Image
                  src={image.src}
                  alt={t("imageAlt", { number: image.id })}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </button>
            </article>
          );
        })}
      </div>

      {isOpen && activeImage && activeIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={t("lightboxLabel")}
        >
          <button
            type="button"
            aria-label={t("closeLightbox")}
            className="absolute inset-0 bg-[#120E08]/90 backdrop-blur-sm"
            onClick={closeLightbox}
          />

          <button
            type="button"
            onClick={closeLightbox}
            aria-label={t("closeLightbox")}
            className="absolute end-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20 md:end-6 md:top-6"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M4.5 4.5 13.5 13.5M13.5 4.5 4.5 13.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={showPrevious}
            aria-label={t("previousImage")}
            className="absolute start-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20 md:start-6 md:h-12 md:w-12"
          >
            <NavArrow direction="prev" />
          </button>

          <button
            type="button"
            onClick={showNext}
            aria-label={t("nextImage")}
            className="absolute end-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20 md:end-6 md:h-12 md:w-12"
          >
            <NavArrow direction="next" />
          </button>

          <div className="relative z-10 flex h-[min(82vh,900px)] w-full max-w-6xl flex-col items-center">
            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black/40 shadow-2xl ring-1 ring-white/10">
              <Image
                src={activeImage.src}
                alt={t("imageAlt", { number: activeImage.id })}
                fill
                priority
                sizes="(max-width: 1280px) 95vw, 1200px"
                className="object-contain"
              />
            </div>
            <p className="mt-4 font-poppins text-sm tracking-[0.12em] text-white/80">
              {t("imageCounter", {
                current: activeIndex + 1,
                total: GALLERY_IMAGES.length,
              })}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
