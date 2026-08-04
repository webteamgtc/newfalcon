import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/PageHeader";

export default async function MediaPage() {
  const t = await getTranslations("mediaPage");
  const homeMedia = await getTranslations("home.media");
  const partners = homeMedia.raw("partners") as string[];

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} heading={t("heading")} subtext={t("subtext")}>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button className="rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-[0.14em] text-parchment transition-colors hover:bg-falcon-deep">
            {t("watchHighlights")}
          </button>
          <button className="rounded-full border border-ink/20 px-6 py-3 text-sm uppercase tracking-[0.14em] text-ink/80 transition-colors hover:border-ink">
            {t("pressKit")}
          </button>
        </div>
      </PageHeader>

      <section className="bg-parchment px-6 py-16 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-falcon-bronze/30 via-ink/80 to-ink"
              />
            ))}
          </div>

          <ul className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-ink/10 pt-8 text-xs uppercase tracking-widest text-ink/50">
            {partners.map((partner) => (
              <li key={partner}>{partner}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
