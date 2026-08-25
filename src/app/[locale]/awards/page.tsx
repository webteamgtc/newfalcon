import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function AwardsPage() {
  const t = await getTranslations("awardsPage");
  const stats = t.raw("stats") as { number: string; label: string }[];
  const categoryBlocks = t.raw("categoryBlocks") as {
    title: string;
    description: string;
    items: string[];
  }[];

  return (
    <>
      {/* Section 1 - Hero */}
      <section className="relative min-h-[100vh] md:min-h-[90vh] bg-[url('/award/award-mobile.webp')] md:bg-[url('/award/awards-top.webp')] bg-cover bg-center md:bg-right bg-no-repeat">
        <div className="container flex min-h-[100vh] flex-col justify-end md:min-h-[90vh] md:justify-center">
          <div className="grid pb-10 md:grid-cols-2 md:pb-16">
            {/* Left Col - Content (bottom on mobile, centered on desktop) */}
            <div className="flex flex-col items-start text-left">
              <p className="font-poppins text-sm font-medium uppercase tracking-[0.2em] text-ink/60 md:text-base">
                {t("heroEyebrow")} · GOLDEN FALCON 2026
              </p>
              <h1 className="mt-8 font-display text-4xl font-semibold leading-[1.1] text-ink md:text-5xl lg:text-[100px] lg:leading-[115px]">
                {t("heroHeadingPlain")}{" "}
                <span className="italic text-falcon-deep">{t("heroHeadingItalic")}</span>
              </h1>
              <div className="mt-6 w-24 border-t border-ink/30 md:w-32" />
              <p className="mt-6 max-w-md font-poppins text-sm leading-relaxed text-ink/70 md:text-base">
                {t("heroDescBlack")}
              </p>
              <div className="mt-8">
                <a
                  href="#categories"
                  className="inline-flex items-center gap-3 rounded-full bg-ink px-8 py-3 font-poppins text-sm uppercase tracking-[0.14em] text-white transition-colors hover:bg-falcon-deep"
                >
                  <span>{t("heroCta")}</span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-ink">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="rtl:-scale-x-100">
                      <path d="M3.5 10.5 10.5 3.5M10.5 3.5H5.25M10.5 3.5V8.75" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>

            {/* Right Col - Background image shows through on desktop */}
            <div className="hidden md:block" />
          </div>
        </div>
      </section>

      {/* Section 2 - The Honours + Stats */}
      <section className="bg-white py-16 md:py-28">
        <div className="container">
          {/* Top: Two-column on desktop, stacked on mobile */}
          <div className="grid gap-10 md:grid-cols-2 md:gap-16 md:items-start">
            {/* Left - Eyebrow + Heading */}
            <div>
              <p className="eyebrow text-sm text-falcon-deep">{t("honoursEyebrow")}</p>
              <h2 className="mt-6 font-display text-4xl font-semibold leading-tight text-ink md:text-5xl lg:text-6xl">
                {t("honoursHeadingPlain")}{" "}
                <span className="italic text-falcon-deep">{t("honoursHeadingItalic")}</span>
              </h2>
            </div>

            {/* Right - Description paragraphs */}
            <div className="flex flex-col gap-5 md:pt-12">
              <p className="font-poppins text-base leading-relaxed text-ink md:text-lg">
                {t("honoursDescBlack")}
              </p>
              <p className="font-poppins text-sm leading-relaxed text-falcon-deep md:text-base">
                {t("honoursDescGold")}
              </p>
            </div>
          </div>

          {/* Bottom: Stats grid */}
          <div className="mt-16 md:mt-20">
            <div className="grid grid-cols-1 md:grid-cols-3">
              {stats.map((stat, i) => (
                <div key={i} className="border border-[#5E4825] py-10 text-center md:py-12">
                  <p className="font-display text-5xl font-semibold text-ink md:text-6xl lg:text-7xl">
                    {stat.number}
                  </p>
                  <p className="mt-3 font-poppins text-xs uppercase tracking-[0.18em] text-ink/60 md:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Categories */}
      <section id="categories" className="bg-[#F4ECDF] py-16 md:py-28">
        <div className="container">
          <div className="mb-12 md:mb-16">
            <p className="font-poppins text-xs font-medium uppercase tracking-[0.2em] text-falcon-deep">
              {t("categoriesEyebrow")}
            </p>
            <div className="mt-4 grid md:grid-cols-2 md:items-end md:gap-12">
              <h2 className="font-display text-3xl font-semibold leading-snug text-ink md:text-4xl lg:text-7xl">
                {t("categoriesHeadingPlain")}{" "}
                <span className="italic text-falcon-deep">{t("categoriesHeadingItalic")}</span>
              </h2>
              <p className="mt-4 font-poppins text-sm text-falcon-deep md:mt-0 md:text-base">
                {t("categoriesSubtext")}
              </p>
            </div>
          </div>

          <div className="space-y-0">
            {categoryBlocks.map((block, i) => (
              <div
                key={i}
                className="border-t border-ink/20 py-10 first:border-t-0 last:border-b md:py-14"
              >
                <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-16">
                  {/* Left - Award image (single combined image) */}
                  <div className="flex justify-center md:justify-start">
                    <Image
                      src="/award/award.png"
                      alt={block.title}
                      width={280}
                      height={300}
                      className="h-auto w-auto max-w-[220px] object-contain md:max-w-[280px]"
                    />
                  </div>

                  {/* Right - Numbered items */}
                  <div className="space-y-5">
                    {block.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-4 border-b border-ink/10 pb-4 last:border-b-0 last:pb-0">
                        <span className="font-display text-lg text-falcon-deep md:text-xl">
                          {String(j + 1).padStart(2, "0")}
                        </span>
                        <p className="font-poppins text-sm text-ink md:text-base">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 - Certificate / Visionary Award */}
      <section className="bg-white py-16 md:py-28">
        <div className="container">
          <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
            {/* Left - Sidebar trophy image */}
            <div className="flex justify-center">
              <Image
                src="/award/sidebar.png"
                alt="Golden Falcon Visionary Award"
                width={500}
                height={500}
                className="h-auto w-auto max-w-[320px] object-contain md:max-w-[500px]"
              />
            </div>

            {/* Right - Content */}
            <div>
              <p className="font-poppins text-xs font-medium uppercase tracking-[0.2em] text-falcon-deep">
                {t("certificateEyebrow")}
              </p>
              <h2 className="mt-6 font-display text-3xl font-semibold leading-snug text-ink md:text-4xl lg:text-5xl">
                {t("certificateTitle")}{" "}
                <span className="italic text-falcon-deep">
                  {t("certificateTitleItalic")}
                </span>
              </h2>
              <p className="mt-6 font-poppins text-sm leading-relaxed text-falcon-deep md:text-base">
                {t("certificateDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
