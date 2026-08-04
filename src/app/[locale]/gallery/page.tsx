import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/PageHeader";

export default async function GalleryPage() {
  const t = await getTranslations("gallery");
  const filters = t.raw("filters") as string[];

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} heading={t("heading")} subtext={t("subtext")}>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {filters.map((filter, i) => (
            <button
              key={filter}
              className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
                i === 0
                  ? "border-ink bg-ink text-parchment"
                  : "border-ink/20 text-ink/70 hover:border-ink"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </PageHeader>

      <section className="bg-parchment px-6 py-16 md:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-falcon-bronze/30 via-ink/80 to-ink"
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="rounded-full border border-ink/20 px-6 py-3 text-sm uppercase tracking-[0.14em] text-ink/80 transition-colors hover:border-ink">
            {t("loadMore")}
          </button>
        </div>
      </section>
    </>
  );
}
