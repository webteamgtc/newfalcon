import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/PageHeader";

export default async function AgendaPage() {
  const t = await getTranslations("agenda");
  const schedule = t.raw("schedule") as {
    time: string;
    title: string;
    description: string;
  }[];

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} heading={t("heading")} subtext={t("subtext")} />

      <section className="bg-parchment px-6 py-16 md:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 rounded-xl border border-ink/10 bg-parchment-light p-5 text-center">
            <p className="eyebrow text-falcon-deep">{t("venueLabel")}</p>
            <p className="mt-2 font-display text-lg text-ink">{t("venue")}</p>
          </div>

          <ol className="space-y-8 border-s border-ink/15 ps-8">
            {schedule.map((item) => (
              <li key={item.title} className="relative">
                <span className="absolute -start-[41px] top-1 h-2.5 w-2.5 rounded-full bg-falcon-gold" />
                <p className="eyebrow text-falcon-deep">{item.time}</p>
                <p className="mt-1 font-display text-xl text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-ink/65">{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
