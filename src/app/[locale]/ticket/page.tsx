import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/PageHeader";

export default async function TicketPage() {
  const t = await getTranslations("ticketPage");
  const tiers = t.raw("tiers") as {
    name: string;
    price: string;
    description: string;
    features: string[];
  }[];

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} heading={t("heading")} subtext={t("subtext")} />

      <section className="bg-parchment px-6 py-16 md:px-10">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-2xl border p-7 ${
                i === 1
                  ? "border-falcon-gold bg-parchment-light shadow-lg"
                  : "border-ink/10 bg-parchment-light/60"
              }`}
            >
              <p className="eyebrow text-falcon-deep">{tier.name}</p>
              <p className="mt-4 font-display text-3xl text-ink">{tier.price}</p>
              <p className="mt-3 text-sm text-ink/65">{tier.description}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-ink/75">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-falcon-gold" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-8 rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-[0.14em] text-parchment transition-colors hover:bg-falcon-deep">
                {t("cta")}
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
