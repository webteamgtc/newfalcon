import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/PageHeader";

export default async function GuestPage() {
  const t = await getTranslations("guestPage");
  const home = await getTranslations("home.guests");
  const guests = home.raw("list") as { name: string; role: string; country: string }[];
  // Repeat the seed guests to populate a fuller directory-style grid.
  const fullList = [...guests, ...guests, ...guests];

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} heading={t("heading")} subtext={t("subtext")}>
        <div className="mx-auto mt-8 max-w-md">
          <input
            type="search"
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-full border border-ink/20 bg-parchment-light px-5 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-falcon-gold"
          />
        </div>
      </PageHeader>

      <section className="bg-parchment px-6 py-16 md:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {fullList.map((guest, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-ink/10 bg-white/40">
              <div className="aspect-[3/4] bg-gradient-to-b from-ink/70 to-ink flex items-end justify-center">
                <span className="mb-3 text-[10px] uppercase tracking-widest text-parchment/70">
                  {guest.country}
                </span>
              </div>
              <div className="p-3">
                <p className="font-display text-sm text-ink">{guest.name}</p>
                <p className="mt-1 line-clamp-3 text-[11px] leading-snug text-ink/60">
                  {guest.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
