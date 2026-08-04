import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/PageHeader";

export default async function PolicyPage() {
  const t = await getTranslations("policyPage");
  const sections = t.raw("sections") as { title: string; body: string }[];

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} heading={t("heading")} subtext={t("subtext")} />

      <section className="bg-parchment px-6 py-16 md:px-10">
        <div className="mx-auto max-w-3xl divide-y divide-ink/10">
          {sections.map((section) => (
            <div key={section.title} className="py-6">
              <h2 className="font-display text-xl text-ink">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{section.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
